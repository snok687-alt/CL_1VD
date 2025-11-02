const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.get('/logs', logController.getLogs);
router.get('/logs/top', logController.getTopHits);

module.exports = router;
