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

module.exports = router;