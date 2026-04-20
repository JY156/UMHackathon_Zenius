const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.post('/', async (req, res) => {
    try {
        const { source, content, metadata } = req.body;
        
        if (!source || !content) {
            return res.status(400).json({ error: "Missing source or content text" });
        }

        const docId = await dbService.saveInput(source, content, metadata);
        res.status(201).json({ message: "Data received by Zenius", id: docId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database write failed" });
    }
});

// 2. XWei's Fetch (GET) - Pulls data out
router.get('/', async (req, res) => {
    try {
        const data = await dbService.getInputs();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database read failed" });
    }
});

module.exports = router;