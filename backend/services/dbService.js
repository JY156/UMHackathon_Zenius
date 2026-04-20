const { db } = require('../config/firebase-admin');

const dbService = {
    testConnection: async () => {
        try {
        const testRef = db.collection('system_check').doc('status');
        await testRef.set({
            last_connection: new Date(),
            message: "Zenius Backend is successfully linked to Firestore"
        });
        return true;
        } catch (error) {
        console.error("Database Connection Failed:", error);
        return false;
        }
    },

  // getUserLoad: async (uid) => { ... },
  // reassignTask: async (tid, newUid) => { ... }
};

module.exports = dbService;