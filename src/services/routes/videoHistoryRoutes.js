// ============================================================================
// FILE 3: routes/videoHistoryRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const VideoHistoryController = require('../controllers/VideoHistoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ ดึงประวัติการดูวิดีโอทั้งหมด
router.get('/history', authMiddleware, VideoHistoryController.getHistory);

// ✅ ดึงสถิติการดูวิดีโอ
router.get('/history/stats', authMiddleware, VideoHistoryController.getHistoryStats);

// ✅ ดึงวิดีโอที่ดูมากที่สุด
router.get('/history/top', authMiddleware, VideoHistoryController.getTopWatched);

// ✅ ดึงวิดีโอที่ดูล่าสุด
router.get('/history/recent', authMiddleware, VideoHistoryController.getRecentlyWatched);

// ✅ บันทึกการดูวิดีโอใหม่
router.post('/history/record', authMiddleware, VideoHistoryController.recordVideoWatch);

// ✅ ลบรายการประวัติตัวเดียว
router.delete('/history/:id', authMiddleware, VideoHistoryController.deleteHistoryItem);

// ✅ ล้างประวัติทั้งหมด
router.delete('/history/clear/all', authMiddleware, VideoHistoryController.clearAllHistory);

module.exports = router;
