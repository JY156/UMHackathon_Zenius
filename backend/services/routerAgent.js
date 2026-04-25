// backend/services/routerAgent.js
const aiProvider = require('./aiProvider');
const helperAgent = require('./helperAgent');
const taskService = require('./taskService');
const approvalService = require('./approvalService');
const userService = require('./userService');
const inputService = require('./inputService');

class RouterAgent {
    _truncateForAI(text, maxLength = 1500) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '... [truncated for AI context]';
    }
    /**
     * Main entry: Process an input email and route to appropriate handler
     */
    async processInput(inputId) {
        try {
            console.log(`\n📨 Router Agent: Processing input ${inputId}...`);

            // Fetch input via service
            const inputs = await inputService.getInputs();
            const inputData = inputs.find(i => i.id === inputId);
            
            if (!inputData) {
                throw new Error(`Input ${inputId} not found`);
            }

            if (inputData.processed) {
                console.log('⏭️  Input already processed, skipping...');
                return { status: 'skipped', reason: 'already_processed' };
            }

            const categorization = await this.categorizeEmail(inputData);
            console.log('🎯 Categorization:', categorization.category, `(confidence: ${categorization.confidence})`);

            let result;
            switch (categorization.category) {
                case 'LEAVE_RESIGNATION':
                    result = await this.handleLeaveResignation(inputId, inputData, categorization);
                    break;
                case 'WORKLOAD_STRESS':
                    result = await this.handleWorkloadStress(inputId, inputData, categorization);
                    break;
                case 'NEW_TASK_REQUEST':
                    result = await this.handleNewTaskRequest(inputId, inputData, categorization);
                    break;
                case 'URGENT_DEADLINE':
                    result = await this.handleUrgentDeadline(inputId, inputData, categorization);
                    break;
                default:
                    result = { status: 'no_action', message: 'Email does not require automated action' };
            }

            // Mark input as processed via service
            await inputService.updateInputProcessed(inputId, categorization.category);

            console.log('✅ Input processed successfully');
            return { success: true, category: categorization.category, result };

        } catch (error) {
            console.error('❌ Router Agent error:', error);
            throw error;
        }
    }

    /**
     * Categorize email using Z.AI (same as before)
     */
    async categorizeEmail(inputData) {
        const categorizationPrompt = `
Analyze this email for task management routing:

SUBJECT: ${inputData.subject}
CONTENT: ${this._truncateForAI(inputData.content, 1500)}
${inputData.parsedFileContent ? `\nATTACHMENT CONTENT: ${this._truncateForAI(inputData.parsedFileContent, 1000)}` : ''}
SENDER: ${inputData.sender || 'unknown'}

🚨 STRICT CLASSIFICATION RULES (Follow Exactly):
1. WORKLOAD_STRESS → If content mentions: "exhausted", "burnout", "not sustainable", "cannot proceed", "worked late/3AM", "need reassignment", "insufficient focus", "overwhelmed", "critical workload".
2. LEAVE_RESIGNATION → If content mentions: "leave", "sick", "medical", "unwell", "doctor", "resign", "quit", "last day".
3. NEW_TASK_REQUEST → If content asks for work: "need", "build", "create", "develop", "capabilities", "features", "solution", "project requirements". Extract EACH distinct capability/requirement as a separate task in the 'tasks' array.
4. URGENT_DEADLINE → If content emphasizes time: "urgent", "ASAP", "deadline", "tomorrow", "EOD", "critical blocker".
5. GENERAL → Only if purely informational (FYI, updates, newsletters) with ZERO action required.

📥 EXTRACTION REQUIREMENTS:
- projectId: Suggested project ID/slug inferred from context (e.g., "food2u", "analytics-dashboard", "hr-system"). Lowercase, hyphenated. If unclear, use "proj-general".
- memberEmail: Extract sender or mentioned email.
- tasks: Array of distinct work items requested. Format: [{ "title": "Clear title", "description": "What to do", "requiredSkills": ["skill"], "priority": "low|medium|high|critical", "deadline": "YYYY-MM-DD or relative like 'next Friday' or 'EOD tomorrow'" }]
- stressIndicators: Array of stress phrases found (e.g., ["exhausted", "3 AM", "not sustainable"])
- recommendedAction: "REASSIGN|UPDATE_SENTIMENT|CREATE_TASK|ESCALATE|IGNORE"

Return ONLY valid JSON:
{
  "category": "CATEGORY_NAME",
  "confidence": 0.0-1.0,
  "extractedInfo": {
    "projectId": "string",
    "memberEmail": "string or null",
    "tasks": [],
    "stressIndicators": [],
    "recommendedAction": "string"
  }
}
`;

        const result = await aiProvider.chat({
            prompt: categorizationPrompt,
            systemPrompt: 'You are Zenius Email Router. Return ONLY valid JSON. No markdown, no explanations.',
            responseFormat: 'json',
            temperature: 0.1,
            taskType: 'reasoning'
        });

        const parsed = aiProvider.extractJSON(result.content);
        
        if (!parsed?.category) {
            console.warn('⚠️  AI categorization failed, defaulting to GENERAL');
            return {
                category: 'GENERAL',
                confidence: 0,
                extractedInfo: { projectId: 'proj-general', tasks: [], stressIndicators: [] },
                recommendedAction: 'IGNORE',
                provider: result.provider
            };
        }

        if (!parsed.extractedInfo.tasks) parsed.extractedInfo.tasks = [];
        return { ...parsed, provider: result.provider };
    }

    /**
     * ✅ UPDATED: Handle leave/resignation with approval workflow
     */
    async handleLeaveResignation(inputId, inputData, categorization) {
        console.log('🏖️  Handling leave/resignation...');
        const { memberEmail, leaveDays } = categorization.extractedInfo;

        // ✅ Debug: User lookup
        const allUsers = await userService.getUsers();
        const user = allUsers.find(u => u.email === memberEmail);
        
        console.log('🔍 User lookup:', { 
            memberEmail, 
            found: !!user, 
            userId: user?.uid,
            allUserEmails: allUsers.map(u => u.email) // Debug: see all emails
        });
        
        if (!user) {
            console.error('❌ User not found for email:', memberEmail);
            return { status: 'error', message: 'User not found for email: ' + memberEmail };
        }

        const userId = user.uid;

        // ✅ Debug: Update user status
        await userService.updateUser(userId, {
            status: 'on_leave',
            leaveStartDate: new Date().toISOString()
        });
        console.log('✅ User status updated to on_leave');

        // ✅ Debug: Get active tasks
        const userTasks = await taskService.getTasksByUser(userId);
        const activeTasks = userTasks.filter(t => ['todo', 'in-progress'].includes(t.status));
        
        console.log('📋 Task lookup:', {
            totalTasks: userTasks.length,
            activeTasks: activeTasks.length,
            taskTitles: activeTasks.map(t => t.title)
        });

        if (activeTasks.length === 0) {
            console.log('⚠️  No active tasks to reassign - skipping approval creation');
            return { status: 'leave_processed', userId, userName: user.name, leaveDays, approvalsCreated: 0 };
        }

        const approvalRequests = [];

        // ✅ Debug: Loop through tasks
        for (const task of activeTasks) {
            console.log(`🔄 Processing task: ${task.title} (priority: ${task.priority})`);
            
            const bestAssignee = await helperAgent.findBestAssignee(
                task.requiredSkills || [],
                userId,
                task.priority,
                task.category || 'Professional'
            );

            console.log(`🎯 Best assignee result:`, {
                name: bestAssignee?.name || 'NONE',
                userId: bestAssignee?.userId,
                score: bestAssignee?.finalScore
            });

            if (bestAssignee) {
                try {
                    console.log(`✨ Creating approval request: ${task.title} → ${bestAssignee.name}`);
                    
                    const approvalId = await approvalService.createApprovalRequest(
                        task.tid,
                        userId,
                        bestAssignee.userId,
                        `User on leave (${leaveDays} days) - ${task.title}`
                    );

                    console.log(`✅ Approval created: ${approvalId}`);

                    approvalRequests.push({
                        taskId: task.tid,
                        from: userId,
                        to: bestAssignee.userId,
                        toName: bestAssignee.name,
                        approvalId: approvalId,
                        status: 'pending'
                    });
                } catch (approvalError) {
                    console.error('❌ Failed to create approval:', approvalError);
                    // Continue with other tasks even if one fails
                }
            } else {
                console.log('⚠️  No suitable assignee found - skipping approval for this task');
            }
        }

        console.log(`📊 Final result: ${approvalRequests.length} approval(s) created`);

        return {
            status: 'leave_processed',
            userId: userId,
            userName: user.name,
            leaveDays: leaveDays,
            approvalsCreated: approvalRequests.length,
            approvalRequests: approvalRequests,
            action: 'PENDING_APPROVAL',
            message: `${approvalRequests.length} reassignment approval(s) created - pending manager approval`
        };
    }

    /**
     * ✅ UPDATED: Handle workload stress with approval workflow
     */
    async handleWorkloadStress(inputId, inputData, categorization) {
        console.log('😓 Handling workload stress...');
        const { memberEmail, stressIndicators } = categorization.extractedInfo;

        // ✅ Find user via service
        const allUsers = await userService.getUsers();
        const user = allUsers.find(u => u.email === memberEmail);

        if (!user) {
            return { status: 'error', message: 'User not found for stress email' };
        }

        const userId = user.uid;

        // ✅ Update sentiment via service (handles load recalc + logging)
        await userService.updateUser(userId, {
            sentiment_score: Math.max(0, (user.sentiment_score || 0.5) - 0.15)
        });

        const isOverwhelmed = helperAgent.isLikelyOverwhelmed(user);

        // ✅ Only create approvals if overwhelmed or explicit stress indicators
        if (isOverwhelmed || (stressIndicators && stressIndicators.length > 0)) {
            console.log('⚠️  Stress detected, creating reassignment approvals...');

            const userTasks = await taskService.getTasksByUser(userId);
            const activeTasks = userTasks
                .filter(t => ['todo', 'in-progress'].includes(t.status))
                .sort((a, b) => (a.priority || 0) - (b.priority || 0)) // Low priority first
                .slice(0, 2); // Max 2 tasks for approval

            const approvalRequests = [];

            for (const task of activeTasks) {
                const bestAssignee = await helperAgent.findBestAssignee(
                    task.requiredSkills || [],
                    userId,
                    task.priority,
                    task.category || 'Professional'
                );

                if (bestAssignee) {
                    const approvalId = await approvalService.createApprovalRequest(
                        task.tid,
                        userId,
                        bestAssignee.userId,
                        `Workload stress relief: ${stressIndicators?.join(', ') || 'Overwhelmed'} - ${task.title}`
                    );

                    approvalRequests.push({
                        taskId: task.tid,
                        from: userId,
                        to: bestAssignee.userId,
                        toName: bestAssignee.name,
                        approvalId: approvalId,
                        status: 'pending'
                    });
                }
            }

            return {
                status: 'approvals_created',
                userId: userId,
                userName: user.name,
                sentimentUpdated: true,
                isOverwhelmed: true,
                approvalsCreated: approvalRequests.length,
                approvalRequests: approvalRequests,
                action: 'PENDING_APPROVAL',
                message: `${approvalRequests.length} reassignment approval(s) created - pending manager approval`
            };
        }

        return {
            status: 'sentiment_updated',
            userId: userId,
            userName: user.name,
            newSentimentScore: user.sentiment_score - 0.15,
            isOverwhelmed: false,
            message: 'Stress noted - monitoring for escalation'
        };
    }

    /**
     * ✅ UPDATED: Handle multi-task requests with project grouping & deadlines
     */
    async handleNewTaskRequest(inputId, inputData, categorization) {
        console.log('📋 Handling new task request...');
        const extracted = categorization.extractedInfo;
        
        // ✅ Extract & normalize projectId
        let projectId = extracted.projectId || 'proj-general';
        projectId = projectId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // Determine tasks to create
        let tasksToCreate = extracted.tasks || [];
        
        if (tasksToCreate.length === 0 && (extracted.taskTitle || extracted.taskDescription)) {
            tasksToCreate = [{
                title: extracted.taskTitle || 'Untitled Task',
                description: extracted.taskDescription || inputData.content.substring(0, 300),
                requiredSkills: extracted.requiredSkills || [],
                priority: extracted.urgency || 'medium',
                deadline: extracted.deadline || null
            }];
        }

        if (tasksToCreate.length === 0) {
            tasksToCreate = [{
                title: `Task: ${inputData.subject?.substring(0, 50) || 'New Request'}`,
                description: inputData.content.substring(0, 300),
                requiredSkills: [], priority: 'medium', deadline: null
            }];
        }

        const createdTasks = [];
        
        for (const taskSpec of tasksToCreate) {
            // ✅ Find best assignee via helper agent
            const bestAssignee = await helperAgent.findBestAssignee(
                taskSpec.requiredSkills || [],
                null,
                this.urgencyToPriority(taskSpec.priority),
                'Professional'
            );

            // ✅ Create task via service (handles load update + logging)
            const taskId = await taskService.addTask({
                title: taskSpec.title,
                description: taskSpec.description,
                projectId: projectId, // ✅ Now grouped by project!
                assignedTo: bestAssignee?.userId || null,
                priority: this.urgencyToPriority(taskSpec.priority),
                estimatedEffort: taskSpec.estimatedEffort || 5,
                deadline: this.parseRelativeDeadline(taskSpec.deadline), // ✅ Deadline parsed
                requiredSkills: taskSpec.requiredSkills || [],
                category: 'Professional',
                status: bestAssignee ? 'todo' : 'unassigned',
                sourceInputId: inputId
            });

            createdTasks.push({
                taskId: taskId,
                title: taskSpec.title,
                assignedTo: bestAssignee?.name || null,
                projectId: projectId
            });
        }

        return {
            status: 'tasks_created',
            projectId: projectId,
            tasksCreated: createdTasks.length,
            tasks: createdTasks,
            message: `Created ${createdTasks.length} task(s) under project "${projectId}"`
        };
    }

    /**
     * Handle urgent deadline emails (unchanged, uses services)
     */
    async handleUrgentDeadline(inputId, inputData, categorization) {
        console.log('⏰ Handling urgent deadline...');
        const { taskTitle, memberEmail } = categorization.extractedInfo;

        if (taskTitle) {
            const allTasks = await taskService.getAllTasks();
            const task = allTasks.find(t => t.title === taskTitle);
            
            if (task) {
                await taskService.updateTaskStatus(task.tid, 'in-progress');
                // Note: priority update would need a new service method or direct call
                return { status: 'task_escalated', taskId: task.tid, newPriority: 5 };
            }
        }

        if (memberEmail) {
            const allUsers = await userService.getUsers();
            const user = allUsers.find(u => u.email === memberEmail);
            
            if (user) {
                await userService.updateUser(user.uid, {
                    sentiment_score: Math.max(0, (user.sentiment_score || 0.5) - 0.05)
                });

                const loadRatio = user.current_load / (user.task_capacity || 30);
                if (loadRatio > 0.9) {
                    // Create approval for potential reassignment
                    const userTasks = await taskService.getTasksByUser(user.uid);
                    const highPriorityTask = userTasks.find(t => t.priority >= 4 && t.status === 'todo');
                    
                    if (highPriorityTask) {
                        const bestAssignee = await helperAgent.findBestAssignee(
                            user.skills || [],
                            user.uid,
                            5,
                            'Professional'
                        );
                        
                        if (bestAssignee) {
                            const approvalId = await approvalService.createApprovalRequest(
                                highPriorityTask.tid,
                                user.uid,
                                bestAssignee.userId,
                                `Urgent deadline: ${user.name} at ${Math.round(loadRatio * 100)}% capacity`
                            );
                            
                            return { 
                                status: 'approval_created', 
                                approvalId: approvalId,
                                message: 'Reassignment approval created for urgent task' 
                            };
                        }
                    }
                }
            }
        }
        
        return { status: 'deadline_noted', message: 'Urgent deadline processed' };
    }

    /**
     * Parse relative deadlines to ISO dates (same as before)
     */
    parseRelativeDeadline(deadlineStr) {
        if (!deadlineStr) return null;
        const now = new Date();
        const lower = deadlineStr.toLowerCase().trim();

        if (lower.includes('tomorrow')) { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(17,0,0); return d.toISOString(); }
        if (lower.includes('eod') || lower.includes('end of day')) { const d = new Date(now); d.setHours(23, 59, 59); return d.toISOString(); }
        if (lower.includes('next week')) { const d = new Date(now); d.setDate(d.getDate() + 7); d.setHours(17,0,0); return d.toISOString(); }
        if (lower.includes('friday')) { 
            const d = new Date(now); const daysUntil = (5 - d.getDay() + 7) % 7 || 7; 
            d.setDate(d.getDate() + daysUntil); d.setHours(17,0,0); return d.toISOString(); 
        }
        if (lower.includes('next month')) { const d = new Date(now); d.setMonth(d.getMonth() + 1); d.setHours(17,0,0); return d.toISOString(); }

        const parsed = new Date(deadlineStr);
        if (!isNaN(parsed.getTime())) return parsed.toISOString();

        return null;
    }

    /**
     * Convert urgency string to priority number
     */
    urgencyToPriority(urgency) {
        const map = { 'critical': 5, 'high': 4, 'medium': 3, 'low': 2 };
        return map[urgency?.toLowerCase()] || 3;
    }
}

module.exports = new RouterAgent();