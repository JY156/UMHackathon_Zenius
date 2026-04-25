// backend/services/routerAgent.js
const { db } = require('../config/firebase-admin');
const aiProvider = require('./aiProvider');
const helperAgent = require('./helperAgent');

class RouterAgent {
    /**
     * Main entry: Process an input email and route to appropriate handler
     */
    async processInput(inputId) {
        try {
            console.log(`\n📨 Router Agent: Processing input ${inputId}...`);

            const inputDoc = await db.collection('inputs').doc(inputId).get();
            if (!inputDoc.exists) {
                throw new Error(`Input ${inputId} not found`);
            }

            const inputData = inputDoc.data();

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

            await db.collection('inputs').doc(inputId).update({
                processed: true,
                processedAt: new Date().toISOString(),
                category: categorization.category,
                actionTaken: result.status,
                aiProvider: categorization.provider
            });

            console.log('✅ Input processed successfully');
            return { success: true, category: categorization.category, result };

        } catch (error) {
            console.error('❌ Router Agent error:', error);
            throw error;
        }
    }

    /**
     * Categorize email using Z.AI (ilmu-glm-5.1)
     */
    async categorizeEmail(inputData) {
        // ✅ DEFINE THE PROMPT VARIABLE HERE
        const categorizationPrompt = `
Analyze this email and categorize it for task management:

SUBJECT: ${inputData.subject}
CONTENT: ${inputData.content}
${inputData.parsedFileContent ? `\nATTACHMENT CONTENT: ${inputData.parsedFileContent}` : ''}
SENDER: ${inputData.metadata?.sender || 'unknown'}

CATEGORIES (choose ONE):
1. LEAVE_RESIGNATION - Medical leave, annual leave, resignation notice
2. WORKLOAD_STRESS - Expressing stress, overwhelm, too much work, burnout
3. NEW_TASK_REQUEST - New feature request, project assignment, task creation request
4. URGENT_DEADLINE - Deadline changes, urgent requests, time-sensitive escalation
5. GENERAL - Other emails that don't require automated task action

Extract these details:
- memberName: Name of team member mentioned (if any)
- memberEmail: Email of team member (if identifiable)
- taskTitle: Suggested task title (for new tasks)
- taskDescription: Brief task description
- urgency: low|medium|high|critical
- requiredSkills: Array of skills needed (infer from context)
- estimatedEffort: 1-10 scale
- leaveDays: Number (for leave requests)
- sentimentIndicators: Array of emotional cues detected

Return ONLY valid JSON in this format:
{
  "category": "CATEGORY_NAME",
  "confidence": 0.0-1.0,
  "extractedInfo": {
    "memberName": "string or null",
    "memberEmail": "string or null", 
    "taskTitle": "string or null",
    "taskDescription": "string or null",
    "urgency": "low|medium|high|critical",
    "requiredSkills": ["skill1", "skill2"],
    "estimatedEffort": 1-10,
    "leaveDays": number or null,
    "sentimentIndicators": ["stressed", "overwhelmed", "sick"]
  },
  "recommendedAction": "REASSIGN|UPDATE_SENTIMENT|CREATE_TASK|ESCALATE|IGNORE"
}
`;

        const result = await aiProvider.chat({
            prompt: categorizationPrompt,  // ✅ Now using the defined variable
            systemPrompt: 'You are Zenius Email Router. Analyze emails for task management. Return ONLY valid JSON, no markdown, no explanations.',
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
                extractedInfo: {},
                recommendedAction: 'IGNORE',
                provider: result.provider
            };
        }

        return { ...parsed, provider: result.provider };
    }

    /**
     * Handle leave/resignation emails
     */
    async handleLeaveResignation(inputId, inputData, categorization) {
        console.log('🏖️  Handling leave/resignation...');
        const { memberEmail, leaveDays } = categorization.extractedInfo;

        const usersSnapshot = await db.collection('users')
            .where('email', '==', memberEmail)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            return { status: 'error', message: 'User not found for email: ' + memberEmail };
        }

        const userDoc = usersSnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Update user status
        await db.collection('users').doc(userId).update({
            status: 'on_leave',
            leaveStartDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Reassign active tasks
        const tasksSnapshot = await db.collection('tasks')
            .where('assignedTo', '==', userId)
            .where('status', 'in', ['todo', 'in-progress'])
            .get();

        const reassignments = [];
        for (const taskDoc of tasksSnapshot.docs) {
            const taskData = taskDoc.data();
            const bestAssignee = await helperAgent.findBestAssignee(
                taskData.requiredSkills || [],
                userId,
                taskData.priority,
                taskData.category || 'Professional'
            );

            if (bestAssignee) {
                await db.collection('tasks').doc(taskDoc.id).update({
                    assignedTo: bestAssignee.userId,
                    previousAssignee: [...(taskData.previousAssignee || []), userId],
                    moveCount: (taskData.moveCount || 0) + 1,
                    reassignedAt: new Date().toISOString(),
                    reassignmentReason: `User on leave (${leaveDays} days)`,
                    updatedAt: new Date().toISOString()
                });
                await helperAgent.updateUserLoad(userId, -1);
                await helperAgent.updateUserLoad(bestAssignee.userId, 1);

                reassignments.push({
                    taskId: taskDoc.id,
                    from: userId,
                    to: bestAssignee.userId,
                    toName: bestAssignee.name
                });
            }
        }

        // Create approval record
        await db.collection('approvals').add({
            type: 'leave_reassignment',
            sourceInputId: inputId,
            userId: userId,
            userName: userData.name,
            leaveDays: leaveDays,
            tasksReassigned: reassignments.length,
            reassignments: reassignments,
            status: 'completed',
            createdAt: new Date().toISOString(),
            processedBy: 'agent'
        });

        return {
            status: 'leave_processed',
            userId: userId,
            userName: userData.name,
            leaveDays: leaveDays,
            tasksReassigned: reassignments.length,
            reassignments: reassignments
        };
    }

    /**
     * Handle workload stress emails
     */
    async handleWorkloadStress(inputId, inputData, categorization) {
        console.log('😓 Handling workload stress...');
        const { memberEmail } = categorization.extractedInfo;

        const usersSnapshot = await db.collection('users')
            .where('email', '==', memberEmail)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            return { status: 'error', message: 'User not found' };
        }

        const userDoc = usersSnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Update sentiment
        const newSentiment = await helperAgent.updateSentiment(userId, 'stress_email', -0.1);
        const isOverwhelmed = helperAgent.isLikelyOverwhelmed({ ...userData, sentiment_score: newSentiment });

        if (isOverwhelmed) {
            console.log('⚠️  User overwhelmed, initiating task reassignment...');

            const tasksSnapshot = await db.collection('tasks')
                .where('assignedTo', '==', userId)
                .where('status', 'in', ['todo', 'in-progress'])
                .orderBy('priority', 'asc')
                .limit(2)
                .get();

            const reassignments = [];
            for (const taskDoc of tasksSnapshot.docs) {
                const taskData = taskDoc.data();
                if (taskData.priority >= 5) continue; // Skip critical tasks

                const bestAssignee = await helperAgent.findBestAssignee(
                    taskData.requiredSkills || [],
                    userId,
                    taskData.priority,
                    taskData.category || 'Professional'
                );

                if (bestAssignee) {
                    await db.collection('tasks').doc(taskDoc.id).update({
                        assignedTo: bestAssignee.userId,
                        previousAssignee: [...(taskData.previousAssignee || []), userId],
                        moveCount: (taskData.moveCount || 0) + 1,
                        reassignedAt: new Date().toISOString(),
                        reassignmentReason: 'Workload stress relief',
                        updatedAt: new Date().toISOString()
                    });
                    await helperAgent.updateUserLoad(userId, -1);
                    await helperAgent.updateUserLoad(bestAssignee.userId, 1);

                    reassignments.push({
                        taskId: taskDoc.id,
                        from: userId,
                        to: bestAssignee.userId,
                        toName: bestAssignee.name
                    });
                }
            }

            return {
                status: 'stress_relief',
                userId: userId,
                userName: userData.name,
                sentimentUpdated: true,
                newSentimentScore: newSentiment,
                isOverwhelmed: true,
                tasksReassigned: reassignments.length,
                reassignments: reassignments
            };
        }

        return {
            status: 'sentiment_updated',
            userId: userId,
            userName: userData.name,
            newSentimentScore: newSentiment,
            isOverwhelmed: false
        };
    }

    /**
     * Handle new task request emails
     */
    async handleNewTaskRequest(inputId, inputData, categorization) {
        console.log('📋 Handling new task request...');
        const { taskTitle, taskDescription, requiredSkills, estimatedEffort, urgency } = categorization.extractedInfo;

        const bestAssignee = await helperAgent.findBestAssignee(
            requiredSkills || [],
            null,
            this.urgencyToPriority(urgency),
            'Professional'
        );

        const taskRef = db.collection('tasks').doc();
        const task = {
            title: taskTitle || 'Untitled Task',
            description: taskDescription || inputData.content.substring(0, 200),
            projectId: 'proj_general',
            assignedTo: bestAssignee?.userId || null,
            previousAssignee: [],
            moveCount: 0,
            priority: this.urgencyToPriority(urgency),
            status: bestAssignee ? 'todo' : 'unassigned',
            estimatedEffort: estimatedEffort || 5,
            requiredSkills: requiredSkills || [],
            category: 'Professional',
            sourceInputId: inputId,
            createdAt: new Date().toISOString(),
            completedAt: null,
            updatedAt: new Date().toISOString()
        };

        await taskRef.set(task);

        if (bestAssignee) {
            await helperAgent.updateUserLoad(bestAssignee.userId, 1);
        }

        return {
            status: 'task_created',
            taskId: taskRef.id,
            task: task,
            assignedTo: bestAssignee,
            message: bestAssignee 
                ? `Task assigned to ${bestAssignee.name}` 
                : 'Task created but no suitable assignee found'
        };
    }

    /**
     * Handle urgent deadline emails
     */
    async handleUrgentDeadline(inputId, inputData, categorization) {
        console.log('⏰ Handling urgent deadline...');
        const { taskTitle, memberEmail } = categorization.extractedInfo;

        // Escalate existing task if found
        if (taskTitle) {
            const tasksSnapshot = await db.collection('tasks')
                .where('title', '==', taskTitle)
                .limit(1)
                .get();

            if (!tasksSnapshot.empty) {
                await tasksSnapshot.docs[0].ref.update({
                    priority: 5,
                    status: 'in-progress',
                    escalatedAt: new Date().toISOString(),
                    escalationReason: 'Urgent deadline from email',
                    updatedAt: new Date().toISOString()
                });
                return { status: 'task_escalated', taskId: tasksSnapshot.docs[0].id, newPriority: 5 };
            }
        }

        // Check member capacity if mentioned
        if (memberEmail) {
            const usersSnapshot = await db.collection('users')
                .where('email', '==', memberEmail)
                .limit(1)
                .get();

            if (!usersSnapshot.empty) {
                const userId = usersSnapshot.docs[0].id;
                const userData = usersSnapshot.docs[0].data();
                
                await helperAgent.updateSentiment(userId, 'urgent_deadline', -0.05);

                const loadRatio = userData.current_load / userData.task_capacity;
                if (loadRatio > 0.9) {
                    const bestAssignee = await helperAgent.findBestAssignee(
                        userData.skills || [],
                        userId,
                        5,
                        'Professional'
                    );

                    if (bestAssignee) {
                        await db.collection('approvals').add({
                            type: 'urgent_reassignment',
                            sourceInputId: inputId,
                            fromUid: userId,
                            toUid: bestAssignee.userId,
                            reasoning: `Urgent deadline: ${userData.name} at ${Math.round(loadRatio * 100)}% capacity. ${bestAssignee.name} has capacity.`,
                            status: 'pending',
                            priority: 5,
                            createdAt: new Date().toISOString()
                        });
                        return { status: 'approval_created', message: 'Reassignment approval created for urgent task' };
                    }
                }
            }
        }

        return { status: 'deadline_noted', message: 'Urgent deadline processed' };
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