const { db, admin } = require('../config/firebase-admin');
const loadService = require('./loadService');

const userService = {
    getUsers: async () => {
        try {
            const usersSnapshot = await db.collection('users').get();
            const userPromises = usersSnapshot.docs.map(async (doc) => {
                const userData = doc.data();
                const totalLoad = await loadService.calculateLoadForUser(doc.id, userData.sentiment_score);
                return { uid: doc.id, ...userData, current_load: totalLoad };
            });
            return await Promise.all(userPromises);
        } catch (error) {
            console.error("getUsers failed", error);
            return [];
        }
    },

    getUserById: async (uid) => {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (!userDoc.exists) return null;

            const userData = userDoc.data();
            const currentLoad = await loadService.calculateLoadForUser(uid, userData.sentiment_score);

            return { uid: userDoc.id, ...userData, current_load: currentLoad };
        } catch (error) {
            console.error("getUserById failed", error);
            return null;
        }
    },

    getUserByEmail: async (email) => {
        try {
            const usersSnapshot = await db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();
            
            if (usersSnapshot.empty) return null;
            
            const doc = usersSnapshot.docs[0];
            const userData = doc.data();
            const currentLoad = await loadService.calculateLoadForUser(doc.id, userData.sentiment_score);
            
            return { uid: doc.id, ...userData, current_load: currentLoad };
        } catch (error) {
            console.error("getUserByEmail failed", error);
            return null;
        }
    },

    getTeamState: async () => {
        try {
            const usersSnapshot = await db.collection('users').get();
            const userPromises = usersSnapshot.docs.map(async (doc) => {
                const userData = doc.data();
                const currentLoad = await loadService.calculateLoadForUser(doc.id, userData.sentiment_score);
                return {
                    uid: doc.id,
                    skills: userData.skills || [],
                    task_capacity: userData.task_capacity || 0,
                    current_load: currentLoad
                };
            });
            return await Promise.all(userPromises);
        } catch (error) {
            console.error("getTeamState failed", error);
            return [];
        }
    },

    getUserHistory: async (uid) => {
        try {
            const snapshot = await db.collection('user_stats')
                .where('userId', '==', uid)
                .get();
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return docs.sort((a, b) => {
                const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
                return timeA - timeB;
            });
        } catch (error) {
            console.error("getUserHistory failed", error);
            return [];
        }
    },

    updateUser: async (uid, updateData) => {
        try {
            const userRef = db.collection('users').doc(uid);
            await userRef.update({
                ...updateData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            if (updateData.sentiment_score !== undefined) {
                const userDoc = await userRef.get();
                const userData = userDoc.data();
                const newLoad = await loadService.calculateLoadForUser(uid, userData.sentiment_score);
                await userRef.update({ current_load: newLoad });
                await loadService.saveLoadSnapshot(uid, newLoad, userData.sentiment_score, "USER_UPDATED");
            }

            return true;
        } catch (error) {
            console.error("updateUser failed", error);
            return false;
        }
    }
};

module.exports = userService;
