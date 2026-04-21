const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.get('/', async (req, res) => {
    try {
        const tasks = await dbService.getAllTasks();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({error: err.message});
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
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;