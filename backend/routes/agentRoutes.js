const express = require('express');
const router = express.Router();
const routerAgent = require('../services/routerAgent');
const helperAgent = require('../services/helperAgent');
const taskManagementAgent = require('../services/taskManagementAgent');

/**
 * Process a single input email
 * POST /api/agents/process-input
 */
router.post('/process-input', async (req, res) => {
    try {
        const { inputId } = req.body;

        if (!inputId) {
            return res.status(400).json({ error: 'inputId is required' });
        }

        const result = await routerAgent.processInput(inputId);
        res.json({ success: true, result });

    } catch (error) {
        console.error('Error processing input:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Process all unprocessed inputs
 * POST /api/agents/process-all-inputs
 */
router.post('/process-all-inputs', async (req, res) => {
    try {
        const { db } = require('../config/firebase-admin');
        
        // Get all unprocessed inputs
        const inputsSnapshot = await db.collection('inputs')
            .where('processed', '==', false)
            .get();

        console.log(`📬 Found ${inputsSnapshot.size} unprocessed inputs`);

        const results = [];

        for (const inputDoc of inputsSnapshot.docs) {
            try {
                const result = await routerAgent.processInput(inputDoc.id);
                results.push({
                    inputId: inputDoc.id,
                    success: true,
                    result: result
                });
            } catch (error) {
                results.push({
                    inputId: inputDoc.id,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            total: results.length,
            processed: results.filter(r => r.success).length,
            results: results
        });

    } catch (error) {
        console.error('Error processing all inputs:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Find best assignee for a task
 * POST /api/agents/find-assignee
 */
router.post('/find-assignee', async (req, res) => {
    try {
        const { requiredSkills, excludeUserId, priority } = req.body;

        const bestAssignee = await helperAgent.findBestAssignee(
            requiredSkills || [],
            excludeUserId || null,
            priority || 3
        );

        res.json({
            success: true,
            bestAssignee: bestAssignee
        });

    } catch (error) {
        console.error('Error finding assignee:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create a new task
 * POST /api/agents/create-task
 */
router.post('/create-task', async (req, res) => {
    try {
        const { title, description, requiredSkills, priority, estimatedEffort, projectId } = req.body;

        const result = await taskManagementAgent.createNewTask({
            title,
            description,
            requiredSkills: requiredSkills || [],
            priority: priority || 3,
            estimatedEffort: estimatedEffort || 5,
            projectId: projectId || 'proj_general'
        });

        res.json({ success: true, result });

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Reassign a task
 * POST /api/agents/reassign-task
 */
router.post('/reassign-task', async (req, res) => {
    try {
        const { taskId, fromUserId, reason, priority } = req.body;

        const result = await taskManagementAgent.reassignTask(
            taskId,
            fromUserId,
            reason || 'Manual reassignment',
            priority || 3
        );

        res.json({ success: result.success, result });

    } catch (error) {
        console.error('Error reassigning task:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check for overwhelmed users
 * GET /api/agents/check-overwhelmed
 */
router.get('/check-overwhelmed', async (req, res) => {
    try {
        const overwhelmedUsers = await helperAgent.detectOverwhelmedUsers();

        res.json({
            success: true,
            count: overwhelmedUsers.length,
            users: overwhelmedUsers
        });

    } catch (error) {
        console.error('Error checking overwhelmed users:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Manual sentiment update
 * POST /api/agents/update-sentiment
 */
router.post('/update-sentiment', async (req, res) => {
    try {
        const { userId, trigger, delta } = req.body;

        const newSentiment = await helperAgent.updateSentiment(userId, trigger, delta);

        res.json({
            success: true,
            userId: userId,
            newSentiment: newSentiment
        });

    } catch (error) {
        console.error('Error updating sentiment:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;