const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.get('/', async (req, res) => {
    try {
        const users = await dbService.getUsers();
        res.status(200).json(users);
    } catch (error) {
       res.status(500).json({error: error.message});
    }
});

router.get('/team-state', async (req, res) => {
    try {
        const teamState = await dbService.getTeamState();
        res.status(200).json(teamState);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await dbService.getUserById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});
router.get('/:id/history', async (req, res) => {
    try {
        const history = await dbService.getUserHistory(req.params.id);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});
router.patch('/:id', async (req, res) => {
    try {
        const updateData = req.body;
        const success = await dbService.updateUser(req.params.id, updateData);
        if (success) {
            res.status(200).json({ success: true, message: "User updated successfully" });
        } else {
            res.status(400).json({ success: false, message: "Failed to update user" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;