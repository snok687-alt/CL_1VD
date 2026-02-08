const express = require('express');
const router = express.Router();
const controller = require('../controllers/gameAccountController');

// ตรวจสอบบัญชีเกม
router.get('/check-game-account', controller.checkGameAccount);

// สร้างบัญชีเกม
router.post('/create-game-account', controller.createGameAccount);

// อัปเดตเวลาล็อกอิน
router.post('/update-game-login', controller.updateLastLogin);

// ดึงบัญชีทั้งหมด (admin)
router.get('/game-accounts', controller.getAllAccounts);

// อัปเดตสถานะบัญชี (admin)
router.post('/update-account-status', controller.updateAccountStatus);

module.exports = router;