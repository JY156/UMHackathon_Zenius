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
router.get('/reassign', async (req, res) => {
    const { tid, fromUid, toUid, reason } = req.body;
    try {
        await dbService.reassignTask(tid, fromUid, toUid, reason);
        res.status(200).json({ success: true, message: "Task moved successfully" });
    } catch (err) {
        res.status(500).json({error:err.message});
    }
});

module.exports = router;