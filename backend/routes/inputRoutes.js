const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.post('/', async (req, res) => {
    try {
        const { source, subject, content, metadata, hasAttachments, fileUrl, fileName } = req.body;

        if (!source || (!content && !hasAttachments)) {
            return res.status(400).json({ error: "Missing source or content text/file" });
        }

        const docId = await dbService.saveInput(source, content, metadata, hasAttachments, fileUrl, fileName, subject);
        res.status(201).json({ message: "Data received by Zenius", id: docId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const data = await dbService.getInputs();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;