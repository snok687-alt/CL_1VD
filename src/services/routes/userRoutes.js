const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');

// สมัครสมาชิก (เพิ่มอัพโหลดรูปภาพ)
router.post('/register', upload.single('image'), UserController.register);

// เข้าสู่ระบบ
router.post('/login', UserController.login);

// แสดงผู้ใช้ทั้งหมด
router.get('/users', UserController.getAllUsers);

// ดึงข้อมูลผู้ใช้ล่าสุด
router.get('/recent-users', UserController.getRecentUsers);

// ลบผู้ใช้
router.delete('/users/:id', UserController.deleteUser);

module.exports = router;