const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.post('/', async (req, res) => {
    try {
        const { source, content, subject, attachments } = req.body;

        // ✅ Accept if we have content OR attachments (not both required)
        if (!content?.trim() && (!attachments || attachments.length === 0)) {
            return res.status(400).json({ error: "No body or attachments received" });
        }

        let fileBuffer = null;
        let fileName = null;
        let parsedFileContent = null;

        // In the attachments processing block:
        if (attachments && attachments.length > 0) {
            const att = attachments[0];
            fileName = att.filename;

            // Decode base64url → Buffer for upload
            if (att.data) {
                const normalizedBase64 = att.data.replace(/-/g, '+').replace(/_/g, '/');
                const padding = normalizedBase64.length % 4;
                const paddedBase64 = padding ? normalizedBase64 + '='.repeat(4 - padding) : normalizedBase64;
                
                fileBuffer = Buffer.from(paddedBase64, 'base64');
            }

            // ✅ Use pre-extracted text from sensor
            parsedFileContent = att.extracted_text || `[Attachment: ${att.filename}]`;
        }

        // Save to Firestore
        const inputId = await dbService.saveInput({
            source: source || 'unknown',
            subject: subject || 'No Subject',
            content: content || '',
            hasAttachments: attachments?.length > 0,
            fileName: fileName || null,
            parsedFileContent: parsedFileContent || null,
            fileBuffer: fileBuffer || null
        });

        res.status(201).json({
            id: inputId,
            message: "Ingested successfully",
            attachmentCount: attachments?.length || 0
        });

    } catch (error) {
        console.error("❌ Ingest route error:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message
        });
    }
});

module.exports = router;