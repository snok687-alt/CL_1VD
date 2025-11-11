const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// สมัครสมาชิก
router.post('/register', UserController.register);

// เข้าสู่ระบบ
router.post('/login', UserController.login);

// แสดงผู้ใช้ทั้งหมด
router.get('/users', UserController.getAllUsers);

// ลบผู้ใช้
router.delete('/users/:id', UserController.deleteUser);

module.exports = router;
