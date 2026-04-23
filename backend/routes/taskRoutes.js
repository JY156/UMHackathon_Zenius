const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.get('/', async (req, res) => {
    try {
        const tasks = await dbService.getAllTasks();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

router.post('/', async (req, res) => {
    try {
        const taskId = await dbService.addTask(req.body);
        if (taskId) {
            res.status(201).json({ success: true, taskId });
        } else {
            res.status(400).json({ success: false, message: "Could not create task. Check user ID." });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});
router.get('/user/:uid', async (req, res) => {
    try {
        const tasks = await dbService.getTasksByUser(req.params.uid);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.patch('/:tid/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: "Missing required field (status)" });
        }
        const success = await dbService.updateTaskStatus(req.params.tid, status);
        if (success) {
            res.status(200).json({ success: true, message: "Task status updated successfully" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update task status" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:tid/reassign', async (req, res) => {
    try {
        const { fromUid, toUid, reason } = req.body;
        if (!fromUid || !toUid) {
            return res.status(400).json({ success: false, error: "Missing required fields (fromUid, toUid)" });
        }
        const success = await dbService.reassignTask(req.params.tid, fromUid, toUid, reason);
        if (success) {
            res.status(200).json({ success: true, message: "Task reassigned successfully" });
        } else {
            res.status(400).json({ success: false, message: "Failed to reassign task" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;