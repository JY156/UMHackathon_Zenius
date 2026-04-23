const { db, admin } = require('../config/firebase-admin');
const storageService = require('./storageService');

const inputService = {
    saveInput: async (source, content, metadata, fileData = null) => {
        let fileUrl = null;
        let parsedFileContent = null;
        let batchId = metadata.subject ? `batch_${metadata.subject.replace(/\s+/g, '_')}` : null;

        if (fileData && fileData.buffer) {
            if (fileData.originalname.toLowerCase().endsWith('.pdf')) {
                parsedFileContent = await storageService.extractPdfText(fileData.buffer);
            } else {
                parsedFileContent = `[Attached file: ${fileData.originalname} (Image/Binary)]`;
            }
            fileUrl = await storageService.uploadFile(fileData.buffer, fileData.originalname);
        }

        const docRef = await db.collection('inputs').add({
            source,
            subject: metadata.subject || "No Subject",
            content: content || "",
            processed: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata,
            hasAttachments: !!fileData,
            fileUrl,
            fileName: fileData ? fileData.originalname : null,
            parsedFileContent,
            batchId
        });

        return docRef.id;
    },

    getInputs: async () => {
        const snapshot = await db.collection('inputs')
            .where('processed', '==', false)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    updateInputProcessed: async (id, category) => {
        try {
            await db.collection('inputs').doc(id).update({
                processed: true,
                category: category || null,
                processedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("updateInputProcessed failed", error);
            return false;
        }
    }
};

module.exports = inputService;
