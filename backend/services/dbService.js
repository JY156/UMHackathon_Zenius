const { db, admin } = require('../config/firebase-admin');
const LOAD_CALCULATION = require('../utils/loadCalculationConstants');
const axios = require('axios');
const pdf = require('pdf-parse');

const dbService = {
    //Helpers
    addLog: async (type, severity, detail) => {
        await db.collection('logs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(), // Field is 'timestamp'
            type,
            severity,
            detail
        });
    },

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

    /**
     * Calculate total workload for a user based on assigned tasks and sentiment.
     * Uses centralized LOAD_CALCULATION formula defined in loadCalculationConstants.
     * 
     * Formula: totalLoad = taskScore + sentimentPenalty
     * - taskScore = Σ(priority × difficulty) for all non-completed tasks
     * - difficulty = 1.5 for Professional, 1.0 for Administrative
     * - sentimentPenalty = (1 - sentimentScore) × 10
     * 
     * @param {string} userId - The user ID to calculate load for
     * @param {number} sentimentScore - User's sentiment score (0-1)
     * @returns {Promise<number>} Total calculated load value
     */
    calculateLoadForUser: async (userId, sentimentScore) => {
        try {
            // Fetch all non-completed tasks assigned to this user
            const tasksSnapshot = await db.collection('tasks')
                .where('assignedTo', '==', userId)
                .where('status', '!=', LOAD_CALCULATION.EXCLUDED_STATUS)
                .get();

            // Extract task data and use centralized calculation
            const tasks = tasksSnapshot.docs.map(doc => doc.data());
            const totalLoad = LOAD_CALCULATION.calculateTotalLoad(tasks, sentimentScore);

            return totalLoad;
        } catch (error) {
            console.error(`calculateLoadForUser failed for userId ${userId}:`, error);
            return 0;
        }
    },

    //Inputs
    extractPdfText: async (url) => {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const data = await pdf(buffer);
            return data.text;
        } catch (error) {
            console.error("PDF Extraction failed:", error);
            return "Error extracting PDF content";
        }
    },

    saveInput: async (source, content, metadata = {}, hasAttachments = false, fileUrl = null, fileName = null, subject = null) => {
        try {
            let parsedFileContent = null;
            const batchId = subject ? `batch_${subject.replace(/\s+/g, '_')}_${metadata.sender || 'unknown'}` : null;

            // Extract text if it's a PDF
            if (hasAttachments && fileUrl && fileName && fileName.toLowerCase().endsWith('.pdf')) {
                parsedFileContent = await dbService.extractPdfText(fileUrl);
            }

            const inputData = {
                source,
                subject: subject || "No Subject",
                content: content || "",
                processed: false,
                sentiment: {},
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata,
                hasAttachments,
                fileUrl,
                fileName,
                parsedFileContent,
                batchId // Grouping multi-file emails
            };

            const docRef = await db.collection('inputs').add(inputData);
            
            await dbService.addLog("INPUT_RECEIVED", "Info", { source, batchId });
            return docRef.id;
        } catch (error) {
            console.error("saveInput failed:", error);
            throw error;
        }
    },

    getInputs: async () => {
        const snapshot = await db.collection('inputs')
            .where('processed', '==', false)
            .get();
            
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    //Users
    getUsers: async () => {
        try {
            const usersSnapshot = await db.collection('users').get();
            const userPromises = usersSnapshot.docs.map(async (doc) => {
                const userData = doc.data();
                const totalLoad = await dbService.calculateLoadForUser(doc.id, userData.sentiment_score);
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
            const currentLoad = await dbService.calculateLoadForUser(uid, userData.sentiment_score);

            return { uid: userDoc.id, ...userData, current_load: currentLoad };
        } catch (error) {
            console.error("getUserById failed", error);
            return null;
        }
    },

    //Tasks
    getAllTasks: async () => {
        try {
            const tasksSnapshot = await db.collection('tasks').get(); // Plural
            return tasksSnapshot.docs.map(doc => ({ // Fixed typo
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

            const user = await dbService.getUserById(taskData.assignedTo);
            const newLoad = await dbService.calculateLoadForUser(taskData.assignedTo, user.sentiment_score);
            
            await db.collection('users').doc(taskData.assignedTo).update({ current_load: newLoad });
            await dbService.saveLoadSnapshot(taskData.assignedTo, newLoad, user.sentiment_score, "TASK_ADDED");

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

            // Update loads and save snapshots for both users
            const users = [fromUid, toUid];
            for (const uid of users) {
                const user = await dbService.getUserById(uid);
                const newLoad = await dbService.calculateLoadForUser(uid, user.sentiment_score);
                await db.collection('users').doc(uid).update({ current_load: newLoad });
                await dbService.saveLoadSnapshot(uid, newLoad, user.sentiment_score, "REASSIGNMENT");
            }

            await dbService.addLog("REASSIGNMENT_EXECUTED", "Warning", { tid, fromUid, toUid, reason });
            return true;
        } catch (error) {
            console.error("reassignTask failed", error);
            return false;
        }
    },

    //Approvals
    getApprovals: async () => {
        try {
            const snapshot = await db.collection('approvals')
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("getApprovals failed", error);
            return [];
        }
    },

    createApprovalRequest: async (tid, fromUid, toUid, reasoning) => {
        const newApproval = {
            suggestedTid: tid,
            fromUid,
            toUid,
            reasoning,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('approvals').add(newApproval);
        await dbService.addLog("APPROVAL_REQUESTED", "Info", { tid, fromUid, toUid });
        return docRef.id;
    },

    updateApprovalStatus: async (approvalId, newStatus, actorUid) => {
        const approvalRef = db.collection('approvals').doc(approvalId);
        
        try {
            let shouldReassign = false;
            let approvalData = null;

            await db.runTransaction(async (transaction) => {
                const approvalDoc = await transaction.get(approvalRef);
                if (!approvalDoc.exists) throw "Approval not found";
                approvalData = approvalDoc.data();

                transaction.update(approvalRef, { status: newStatus, updatedAt: new Date() });

                if (newStatus === 'accepted by new owner') {
                    shouldReassign = true;
                }
            });

            if (shouldReassign) {
                await dbService.reassignTask(approvalData.suggestedTid, approvalData.fromUid, approvalData.toUid, approvalData.reasoning);
            }

            await dbService.addLog("APPROVAL_UPDATED", "Info", { approvalId, newStatus, actorUid });
            return true;
        } catch (error) {
            console.error("updateApprovalStatus failed", error);
            return false;
        }
    },

    //Logs
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

module.exports = dbService;