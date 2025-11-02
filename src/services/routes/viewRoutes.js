const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// ดึงยอดวิวของหลายวิดีโอ
router.post('/views/get', viewController.getViews);

// เพิ่มยอดวิว
router.post('/views/increment', viewController.incrementView);

module.exports = router;
