const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

router.get('/', async (req, res) => {
    try {
        const data = await dbService.getLogs();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

module.exports = router;