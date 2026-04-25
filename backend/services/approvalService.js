const { db, admin } = require('../config/firebase-admin');
const taskService = require('./taskService');
const logService = require('./logService');

const approvalService = {
    getApprovals: async (status = null) => {
        try {
            const snapshot = await db.collection('approvals')
                .orderBy('createdAt', 'desc')
                .get();
            let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (status) {
                results = results.filter(a => a.status === status);
            }
            return results;
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
        await logService.addLog("APPROVAL_REQUESTED", "Info", { tid, fromUid, toUid });
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

                if (newStatus === 'approved') {
                    shouldReassign = true;
                }
            });

            if (shouldReassign) {
                await taskService.reassignTask(approvalData.suggestedTid, approvalData.fromUid, approvalData.toUid, approvalData.reasoning);
            }

            await logService.addLog("APPROVAL_UPDATED", "Info", { approvalId, newStatus, actorUid });
            return true;
        } catch (error) {
            console.error("updateApprovalStatus failed", error);
            return false;
        }
    }
};

module.exports = approvalService;
