const { db } = require('../config/firebase-admin');
const helperAgent = require('./helperAgent');

class TaskManagementAgent {
    /**
     * Create a new task and assign it to the best available person
     */
    async createNewTask(taskData) {
        try {
            console.log('\n📝 Task Management Agent: Creating new task...');
            console.log('   Title:', taskData.title);
            console.log('   Skills required:', taskData.requiredSkills);

            // Find best assignee using Helper Agent
            const bestAssignee = await helperAgent.findBestAssignee(
                taskData.requiredSkills,
                null, // Don't exclude anyone
                taskData.priority || 3
            );

            if (!bestAssignee) {
                console.warn('⚠️  No suitable assignee found, creating unassigned task');
            }

            // Create task document
            const taskRef = db.collection('tasks').doc();
            const task = {
                title: taskData.title,
                description: taskData.description || '',
                projectId: taskData.projectId || 'proj_general',
                assignedTo: bestAssignee ? bestAssignee.userId : null,
                previousAssignee: [],
                moveCount: 0,
                priority: taskData.priority || 3,
                status: 'todo',
                estimatedEffort: taskData.estimatedEffort || 5,
                requiredSkills: taskData.requiredSkills || [],
                sourceInputId: taskData.sourceInputId || null,
                createdAt: new Date().toISOString(),
                completedAt: null,
                updatedAt: new Date().toISOString()
            };

            await taskRef.set(task);

            // Update assignee's load if assigned
            if (bestAssignee) {
                await helperAgent.updateUserLoad(bestAssignee.userId, 1);

                console.log(`✅ Task created and assigned to ${bestAssignee.name}`);
                
                return {
                    status: 'task_created',
                    taskId: taskRef.id,
                    task: task,
                    assignedTo: bestAssignee,
                    message: `Task assigned to ${bestAssignee.name}`
                };
            } else {
                console.log('✅ Task created (unassigned)');
                
                return {
                    status: 'task_created_unassigned',
                    taskId: taskRef.id,
                    task: task,
                    assignedTo: null,
                    message: 'Task created but no suitable assignee found'
                };
            }

        } catch (error) {
            console.error('❌ Task Management Agent error:', error);
            throw error;
        }
    }

    /**
     * Reassign a task from one user to another
     */
    async reassignTask(taskId, fromUserId, reason, priority = 3) {
        try {
            console.log('\n🔄 Task Management Agent: Reassigning task...');
            console.log('   Task ID:', taskId);
            console.log('   From:', fromUserId);
            console.log('   Reason:', reason);

            // Get task data
            const taskDoc = await db.collection('tasks').doc(taskId).get();
            
            if (!taskDoc.exists) {
                throw new Error(`Task ${taskId} not found`);
            }

            const taskData = taskDoc.data();

            // Find best replacement using Helper Agent
            const bestAssignee = await helperAgent.findBestAssignee(
                taskData.requiredSkills || [],
                fromUserId, // Exclude current assignee
                priority
            );

            if (!bestAssignee) {
                console.warn('⚠️  No suitable replacement found');
                return {
                    success: false,
                    message: 'No suitable replacement found'
                };
            }

            // Update task
            const previousAssignee = taskData.previousAssignee || [];
            previousAssignee.push(fromUserId);

            await db.collection('tasks').doc(taskId).update({
                assignedTo: bestAssignee.userId,
                previousAssignee: previousAssignee,
                moveCount: (taskData.moveCount || 0) + 1,
                reassignedAt: new Date().toISOString(),
                reassignmentReason: reason,
                updatedAt: new Date().toISOString()
            });

            // Update loads
            await helperAgent.updateUserLoad(fromUserId, -1);
            await helperAgent.updateUserLoad(bestAssignee.userId, 1);

            // Create approval record (for tracking)
            await db.collection('approvals').add({
                suggestedTid: taskId,
                fromUid: fromUserId,
                toUid: bestAssignee.userId,
                reasoning: reason,
                status: 'approved', // Auto-approved by agent
                priority: priority,
                createdAt: new Date().toISOString(),
                approvedAt: new Date().toISOString(),
                approvedBy: 'agent'
            });

            console.log(`✅ Task reassigned from ${fromUserId} to ${bestAssignee.name}`);

            return {
                success: true,
                taskId: taskId,
                previousAssignee: fromUserId,
                newAssignee: bestAssignee,
                reason: reason
            };

        } catch (error) {
            console.error('❌ Reassignment error:', error);
            throw error;
        }
    }

    /**
     * Bulk reassign tasks from overwhelmed user
     */
    async bulkReassign(userId, maxTasks = 2) {
        try {
            console.log(`\n📦 Bulk reassigning tasks from ${userId}...`);

            // Get user's tasks (lowest priority first)
            const tasksSnapshot = await db.collection('tasks')
                .where('assignedTo', '==', userId)
                .where('status', 'in', ['todo', 'in-progress'])
                .orderBy('priority', 'asc')
                .limit(maxTasks)
                .get();

            const results = [];

            for (const taskDoc of tasksSnapshot.docs) {
                const taskData = taskDoc.data();
                
                // Skip high priority tasks
                if (taskData.priority >= 5) {
                    console.log(`   ⏭️  Skipping high priority task: ${taskData.title}`);
                    continue;
                }

                const result = await this.reassignTask(
                    taskDoc.id,
                    userId,
                    'Bulk reassignment due to workload',
                    taskData.priority
                );

                results.push(result);
            }

            const successful = results.filter(r => r.success).length;
            console.log(`✅ Bulk reassignment complete: ${successful}/${results.length} tasks reassigned`);

            return {
                totalTasks: results.length,
                successfulReassignments: successful,
                results: results
            };

        } catch (error) {
            console.error('❌ Bulk reassignment error:', error);
            throw error;
        }
    }
}

module.exports = new TaskManagementAgent();