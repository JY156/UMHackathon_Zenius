const { db, admin } = require('../config/firebase-admin');
const LOAD_CALCULATION = require('../utils/loadCalculationConstants');
const userService = require('./userService');
const loadService = require('./loadService');
const logService = require('./logService');

const taskService = {
    getAllTasks: async () => {
        try {
            const tasksSnapshot = await db.collection('tasks').get();
            return tasksSnapshot.docs.map(doc => ({
                tid: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("getAllTasks failed", error);
            return [];
        }
    },

    addTask: async (taskData) => {
        try {
            const docRef = await db.collection('tasks').add({
                ...taskData,
                previousAssignee: [],
                moveCount: 0,
                status: taskData.status || 'todo',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const user = await userService.getUserById(taskData.assignedTo);
            const newLoad = await loadService.calculateLoadForUser(taskData.assignedTo, user.sentiment_score);

            await db.collection('users').doc(taskData.assignedTo).update({ current_load: newLoad });
            await loadService.saveLoadSnapshot(taskData.assignedTo, newLoad, user.sentiment_score, "TASK_ADDED");

            return docRef.id;
        } catch (error) {
            console.error("addTask failed", error);
            return false;
        }
    },

    reassignTask: async (tid, fromUid, toUid, reason) => {
        try {
            await db.runTransaction(async (transaction) => {
                const taskRef = db.collection('tasks').doc(tid);
                const taskDoc = await transaction.get(taskRef);
                const prev = taskDoc.data().previousAssignee || [];

                transaction.update(taskRef, {
                    assignedTo: toUid,
                    previousAssignee: [...prev, fromUid],
                    moveCount: (taskDoc.data().moveCount || 0) + 1
                });
            });

            const users = [fromUid, toUid];
            for (const uid of users) {
                const user = await userService.getUserById(uid);
                const newLoad = await loadService.calculateLoadForUser(uid, user.sentiment_score);
                await db.collection('users').doc(uid).update({ current_load: newLoad });
                await loadService.saveLoadSnapshot(uid, newLoad, user.sentiment_score, "REASSIGNMENT");
            }

            await logService.addLog("REASSIGNMENT_EXECUTED", "Warning", { tid, fromUid, toUid, reason });
            return true;
        } catch (error) {
            console.error("reassignTask failed", error);
            return false;
        }
    },

    getTasksByUser: async (uid) => {
        try {
            const tasksSnapshot = await db.collection('tasks')
                .where('assignedTo', '==', uid)
                .get();
            return tasksSnapshot.docs.map(doc => ({
                tid: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("getTasksByUser failed", error);
            return [];
        }
    },

    updateTaskStatus: async (tid, status) => {
        try {
            const taskRef = db.collection('tasks').doc(tid);
            const taskDoc = await taskRef.get();
            if (!taskDoc.exists) return false;

            const taskData = taskDoc.data();

            await taskRef.update({
                status: status,
                completedAt: status === LOAD_CALCULATION.EXCLUDED_STATUS ? admin.firestore.FieldValue.serverTimestamp() : null
            });

            const uid = taskData.assignedTo;
            if (uid) {
                const user = await userService.getUserById(uid);
                if (user) {
                    const newLoad = await loadService.calculateLoadForUser(uid, user.sentiment_score);
                    await db.collection('users').doc(uid).update({ current_load: newLoad });
                    await loadService.saveLoadSnapshot(uid, newLoad, user.sentiment_score, "TASK_STATUS_CHANGED");
                }
            }

            await logService.addLog("TASK_STATUS_UPDATED", "Info", { tid, status, assignedTo: uid });
            return true;
        } catch (error) {
            console.error("updateTaskStatus failed", error);
            return false;
        }
    }
};

module.exports = taskService;
