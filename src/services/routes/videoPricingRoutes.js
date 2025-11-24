const express = require('express');
const router = express.Router();
const VideoPricingController = require('../controllers/videoPricingController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ Routes สำหรับ Video Pricing

// ดึงการตั้งค่าราคาของวิดีโอ
router.get('/pricing/settings/:videoId', VideoPricingController.getPricingSettings);

// ตรวจสอบสถานะราคาของวิดีโอ
router.get('/prices/status/:videoId', VideoPricingController.checkPriceStatus);

// ดึงการตั้งค่าราคาแบบกลุ่ม
router.get('/pricing/bulk-settings', VideoPricingController.getBulkSettings);

// ดึงวิดีโอทั้งหมดพร้อมสถานะราคา
router.get('/pricing/all-videos', authMiddleware, VideoPricingController.getAllVideosWithPricing);

// ✅ แก้ไข path ให้ถูกต้อง - ใช้ video/pricing/toggle-paid
router.post('/pricing/toggle-paid', authMiddleware, VideoPricingController.togglePaidStatus);

// ✅ เพิ่ม route สำหรับบันทึกการตั้งค่า
router.post('/pricing/save-all', authMiddleware, VideoPricingController.saveAllSettings);

module.exports = router;