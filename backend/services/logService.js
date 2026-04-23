const { db, admin } = require('../config/firebase-admin');

const logService = {
    addLog: async (type, severity, detail) => {
        await db.collection('logs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            type,
            severity,
            detail
        });
    },

    getLogs: async () => {
        try {
            const snapshot = await db.collection('logs')
                .orderBy('timestamp', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("getLog failed", error);
            return [];
        }
    }
};

module.exports = logService;
