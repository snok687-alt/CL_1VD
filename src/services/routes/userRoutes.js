const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// สมัครสมาชิก (ไม่ต้องใช้ auth)
router.post('/register', upload.single('image'), UserController.register);

// เข้าสู่ระบบ (ไม่ต้องใช้ auth)
router.post('/login', UserController.login);

// ✅ ดึงข้อมูล user ปัจจุบัน (ต้องมี token)
router.get('/current', authMiddleware, UserController.getCurrentUser);

// ✅ ดึงการแจ้งเตือน
router.get('/notifications', authMiddleware, UserController.getNotifications);

// ✅ ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
router.put('/notifications/:notificationId/read', authMiddleware, UserController.markNotificationAsRead);

// ✅ ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
router.put('/notifications/read-all', authMiddleware, UserController.markAllNotificationsAsRead);

// ✅ ดึงประวัติการ login
router.get('/login-history', authMiddleware, UserController.getLoginHistory);

// แสดงผู้ใช้ทั้งหมด (ต้องมี auth)
router.get('/users', authMiddleware, UserController.getAllUsers);

// ลบผู้ใช้ (ต้องมี auth)
router.delete('/users/:id', authMiddleware, UserController.deleteUser);

module.exports = router;