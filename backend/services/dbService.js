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
    saveInput: async (source, content, metadata = {}) => {
        const newEntry = {
            source,
            content,
            processed: false,
            sentiment: {},
            timestamp: new Date(),
            metadata
        };
        
        const docRef = await db.collection('inputs').add(newEntry);
        return docRef.id;
    },
    getInputs: async () => {
        const snapshot = await db.collection('inputs')
            .where('processed', '==', false)
            .get();
            
        return snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
    },
    getUsers: async () => {
        try {
            const usersSnapshot = await db.collection('users').get();
            const tasksSnapshot = await db.collection('tasks').get();
            
            const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            return usersSnapshot.docs.map(doc => {
            const userData = doc.data();
            const userTasks = tasks.filter(t => t.assignedTo === doc.id && t.status !== 'completed');
            
            // Calculate Load Score
            const taskLoad = userTasks.reduce((acc, task) => {
                const difficulty = task.category === 'Professional' ? 1.5 : 1.0;
                return acc + (task.priority * difficulty);
            }, 0);
            
            const sentimentPenalty = (1 - userData.sentiment_score) * 10;
            const totalLoad = taskLoad + sentimentPenalty;

            return { uid: doc.id, ...userData, current_load: totalLoad, activeTasks: userTasks.length };
            });
        } catch (error){
            console.error("getUsers failed", error);
            return false;
        }
    },
    getAllTasks: async ()  => {
        try {
            const tasksSnapshot = await db.collection('tasks').get();
            return snapshot.docs.map(doc => ({
                tid: doc.id,
                ...doc.data()
            }));
        } catch (error){
            console.error("getAllTasks failed", error);
            return false;
        }
    },
    // Reassign a task and log the event
    reassignTask: async (tid, fromUid, toUid, reason) => {
        try {
            const taskRef = db.collection('tasks').doc(tid);
            
            return db.runTransaction(async (transaction) => {
            const taskDoc = await transaction.get(taskRef);
            const previousAssignees = taskDoc.data().previousAssignee || [];
            
            // 1. Update Task
            transaction.update(taskRef, {
                assignedTo: toUid,
                previousAssignee: [...previousAssignees, fromUid],
                moveCount: (taskDoc.data().moveCount || 0) + 1
            });

            // 2. Create Log entry
            const logRef = db.collection('logs').doc();
            transaction.set(logRef, {
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                type: "REASSIGNMENT",
                severity: "Warning",
                detail: { tid, fromUser: fromUid, toUser: toUid, reason }
            });
            });
        } catch (error) {
            console.error("reassignTask failed", error);
            return false;
        }
    },
    getApprovals: async () => {
        try {
            const snapshot = await db.collection('approvals')
            .orderBy('createdAt', 'desc')
            .get();
            
            const approvals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
            }));
            return approvals;
        } catch (error) {
            console.error("getApprovals failed", error);
            return false;
        }
    }
};

module.exports = dbService;