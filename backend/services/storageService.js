const { bucket } = require('../config/firebase-admin');
const pdf = require('pdf-parse');

const storageService = {
    uploadFile: async (fileBuffer, originalName) => {
        try {
            const fileName = `inputs/${Date.now()}_${originalName}`;
            const file = bucket.file(fileName);

            await file.save(fileBuffer, {
                metadata: { contentType: 'auto' },
                public: true
            });

            return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        } catch (error) {
            console.error("Storage upload failed:", error);
            throw new Error("Failed to upload file to storage");
        }
    },

    extractPdfText: async (fileBuffer) => {
        try {
            const data = await pdf(fileBuffer);
            return data.text;
        } catch (error) {
            console.error("PDF Extraction failed:", error);
            return "Error extracting PDF content";
        }
    }
};

module.exports = storageService;
