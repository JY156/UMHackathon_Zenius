const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.get('/', async (req, res) => {
    try {
        const approvals = await dbService.getApprovals();
        res.status(200).json(approvals);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.post('/request', async (req, res) => {
    try {
        const { tid, fromUid, toUid, reasoning } = req.body;
        const approvalId = await dbService.createApprovalRequest(tid, fromUid, toUid, reasoning);
        res.status(201).json({ success: true, approvalId });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { status, actorUid } = req.body;
        const success = await dbService.updateApprovalStatus(req.params.id, status, actorUid);
        res.status(200).json({ success });
    } catch (error){
        res.status(500).json({error: error.message});
    }
});

module.exports = router;