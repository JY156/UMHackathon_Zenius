const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const multer = require('multer');

// Configure multer to hold the file in memory as a Buffer
const upload = multer({ storage: multer.memoryStorage() });

// Add upload.single('file') as middleware
router.post('/', upload.single('file'), async (req, res) => {
    try {
        // Standard text fields come from req.body
        const { source, subject, content } = req.body;
        
        // Form-data sends objects as strings, so we parse the metadata back into JSON
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

        // The raw file data comes from req.file
        const fileData = req.file; 
        const hasAttachments = !!fileData;

        if (!source || (!content && !hasAttachments)) {
            return res.status(400).json({ error: "Missing source or content text/file" });
        }

        // Pass the fileData object directly to your updated saveInput method
        const docId = await dbService.saveInput(source, content, metadata, fileData);
        
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