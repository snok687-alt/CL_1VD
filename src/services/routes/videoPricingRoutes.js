// เพิ่มในไฟล์ routes/videoPricingRoutes.js
const express = require('express');
const router = express.Router();
const VideoPricingController = require('../controllers/videoPricingController');
const authMiddleware = require('../middlewares/authMiddleware');

// ... existing routes ...

// ✅ Route ใหม่: ปิดการชำระเงินทั้งหมดในระบบ
router.post('/pricing/disable-all-paid', authMiddleware, VideoPricingController.disableAllPaid);

// ✅ Route ใหม่: ดึงราคาที่แสดงจริงของวิดีโอ (สำหรับ PaymentModal)
router.get('/pricing/display/:videoId', VideoPricingController.getDisplayPricing);

// ดึงการตั้งค่าราคาของวิดีโอ
router.get('/pricing/settings/:videoId', VideoPricingController.getPricingSettings);

// ตรวจสอบสถานะราคาของวิดีโอ
router.get('/prices/status/:videoId', VideoPricingController.checkPriceStatus);

// ดึงการตั้งค่าราคาแบบกลุ่ม
router.get('/pricing/bulk-settings', VideoPricingController.getBulkSettings);

// ดึงวิดีโอทั้งหมดพร้อมสถานะราคา
router.get('/pricing/all-videos', authMiddleware, VideoPricingController.getAllVideosWithPricing);

// ✅ สลับสถานะการชำระเงิน
router.post('/pricing/toggle-paid', authMiddleware, VideoPricingController.togglePaidStatus);

// ✅ เปิดการชำระเงินทั้งหมดในระบบ
router.post('/pricing/enable-all-paid', authMiddleware, VideoPricingController.enableAllPaid);

// ✅ ปิดการชำระเงินและใช้ราคารวม
router.post('/pricing/disable-and-use-global', authMiddleware, VideoPricingController.disablePricingAndUseGlobal);

// ✅ บันทึกการตั้งค่าราคา
router.post('/pricing/save-all', authMiddleware, VideoPricingController.saveAllSettings);

module.exports = router;