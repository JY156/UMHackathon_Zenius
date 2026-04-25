const { db, admin } = require('../config/firebase-admin');
const storageService = require('./storageService');

const inputService = {
    saveInput: async (data) => {
        const {
            source,
            subject,
            content,
            threadId,
            sender,
            emailTimestamp,
            hasAttachments,
            fileName,
            parsedFileContent,
            fileBuffer
        } = data;

        let fileUrl = null;

        // Upload file if buffer exists
        if (fileBuffer && fileName) {
            try {
                fileUrl = await storageService.uploadFile(fileBuffer, fileName);
                console.log(`✅ File uploaded: ${fileUrl}`);
            } catch (uploadError) {
                console.error("❌ Storage upload failed:", uploadError);
                fileUrl = null;
            }
        }

        // ✅ Save to Firestore: CLEAN, NO METADATA
        const docRef = await db.collection('inputs').add({
            source,
            subject,
            content,
            threadId: threadId || null,
            sender: sender || null,
            emailTimestamp: emailTimestamp || null, // The time the email was actually sent
            hasAttachments: !!hasAttachments,
            fileName: fileName || null,
            fileUrl: fileUrl || null,
            parsedFileContent: parsedFileContent || null,
            processed: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp() // The time it hit your database
        });

        return docRef.id;
    },

    getInputs: async () => {
        const snapshot = await db.collection('inputs')
            .where('processed', '==', false)
            .orderBy('timestamp', 'desc')
            .limit(20)
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
