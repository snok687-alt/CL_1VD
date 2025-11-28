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

// ✅ สลับสถานะการชำระเงิน
router.post('/pricing/toggle-paid', authMiddleware, VideoPricingController.togglePaidStatus);

// ✅ เปิดการชำระเงินทั้งหมดในระบบ
router.post('/pricing/enable-all-paid', authMiddleware, VideoPricingController.enableAllPaid);

// ✅ บันทึกการตั้งค่าราคา
router.post('/pricing/save-all', authMiddleware, VideoPricingController.saveAllSettings);

// ✅ เพิ่ม route ใหม่ใน videoPricingRoutes.js
router.get('/videos/:videoId/exists', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const [video] = await pool.query(
      'SELECT id, title FROM videos WHERE id = ?',
      [videoId]
    );

    res.json({
      success: true,
      exists: video.length > 0,
      video: video[0] || null
    });
  } catch (error) {
    console.error('Check video existence error:', error);
    res.status(500).json({
      success: false,
      message: '检查视频存在性失败'
    });
  }
});

module.exports = router;