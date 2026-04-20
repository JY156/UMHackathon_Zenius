const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.get('/', async (req, res) => {
    try {
        const users = await dbService.getUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;