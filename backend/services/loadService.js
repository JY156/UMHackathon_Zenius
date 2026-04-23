const { db, admin } = require('../config/firebase-admin');
const LOAD_CALCULATION = require('../utils/loadCalculationConstants');

const loadService = {
    saveLoadSnapshot: async (userId, loadScore, sentiment, triggerType) => {
        try {
            await db.collection('user_stats').add({
                userId,
                load_score: loadScore,
                sentiment,
                trigger: triggerType,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Failed to save snapshot:", error);
        }
    },

    calculateLoadForUser: async (userId, sentimentScore) => {
        try {
            const tasksSnapshot = await db.collection('tasks')
                .where('assignedTo', '==', userId)
                .where('status', '!=', LOAD_CALCULATION.EXCLUDED_STATUS)
                .get();

            const tasks = tasksSnapshot.docs.map(doc => doc.data());
            const totalLoad = LOAD_CALCULATION.calculateTotalLoad(tasks, sentimentScore);

            return totalLoad;
        } catch (error) {
            console.error(`calculateLoadForUser failed for userId ${userId}:`, error);
            return 0;
        }
    }
};

module.exports = loadService;
