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

module.exports = router;