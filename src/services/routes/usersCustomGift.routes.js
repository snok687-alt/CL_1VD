const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersCustomGift.controller');

// สมัครสมาชิก Gift User
router.post('/gift/register', controller.registerGiftUser);

// Login Gift User  
router.post('/gift/login', controller.loginGiftUser);

// รับของขวัญรายวัน 1 ครั้งต่อวัน (ตรวจสอบตาม IP)
router.get('/gift/daily', controller.dailyGiftByIP);

// ตรวจสอบสถานะการรับของขวัญ (ใหม่) - เพิ่ม endpoint นี้
router.get('/gift/check-status', controller.checkClaimStatus);

// ดูข้อมูลผู้ใช้ (ถ้ามี)
router.get('/gift/user-info', controller.getUserInfo);

router.get('/gift/check-username', controller.checkUsername);

module.exports = router;