// ============================================================================
// FILE 2: controllers/VideoHistoryController.js
// ============================================================================

const UserVideoHistory = require('../models/UserVideoHistory');

class VideoHistoryController {

  // ✅ ดึงประวัติการดูวิดีโอทั้งหมด
  static async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 100;

      const history = await UserVideoHistory.getHistory(userId, limit);

      return res.status(200).json({
        success: true,
        message: 'ประวัติการดูวิดีโอดึงมาสำเร็จ',
        data: history,
        count: history.length
      });
    } catch (error) {
      console.error('Error in getHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถดึงประวัติได้',
        error: error.message
      });
    }
  }

  // ✅ ดึงสถิติการดูวิดีโอ
  static async getHistoryStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await UserVideoHistory.getHistoryStats(userId);

      return res.status(200).json({
        success: true,
        message: 'สถิติดึงมาสำเร็จ',
        stats: stats
      });
    } catch (error) {
      console.error('Error in getHistoryStats:', error);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถดึงสถิติได้',
        error: error.message
      });
    }
  }

  // ✅ ดึงวิดีโอที่ดูมากที่สุด
  static async getTopWatched(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const topVideos = await UserVideoHistory.getTopWatchedVideos(userId, limit);

      return res.status(200).json({
        success: true,
        message: 'วิดีโอยอดนิยมดึงมาสำเร็จ',
        data: topVideos
      });
    } catch (error) {
      console.error('Error in getTopWatched:', error);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถดึงวิดีโอยอดนิยมได้',
        error: error.message
      });
    }
  }

  // ✅ ดึงวิดีโอที่ดูล่าสุด
  static async getRecentlyWatched(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const recentVideos = await UserVideoHistory.getRecentlyWatched(userId, limit);

      return res.status(200).json({
        success: true,
        message: 'วิดีโอล่าสุดดึงมาสำเร็จ',
        data: recentVideos
      });
    } catch (error) {
      console.error('Error in getRecentlyWatched:', error);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถดึงวิดีโอล่าสุดได้',
        error: error.message
      });
    }
  }

  // ✅ ลบรายการประวัติตัวเดียว
  static async deleteHistoryItem(req, res) {
    try {
      const userId = req.user.id;
      const historyId = req.params.id;

      if (!historyId) {
        return res.status(400).json({
          success: false,
          message: 'ต้องระบุ ID ของประวัติ'
        });
      }

      const deleted = await UserVideoHistory.deleteHistoryItem(userId, historyId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบรายการประวัติที่ต้องการลบ'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'ลบประวัติสำเร็จ'
      });
    } catch (error) {
      console.error('Error in deleteHistoryItem:', error);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถลบประวัติได้',
        error: error.message
      });
    }
  }

  // ✅ ล้างประวัติทั้งหมด
  static async clearAllHistory(req, res) {
    try {
      const userId = req.user.id;

      const deletedCount = await UserVideoHistory.clearAllHistory(userId);

      return res.status(200).json({
        success: true,
        message: 'ล้างประวัติสำเร็จ',
        deleted_count: deletedCount
      });
    } catch (error) {
      console.error('Error in clearAllHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถล้างประวัติได้',
        error: error.message
      });
    }
  }

  // ✅ บันทึกการดูวิดีโอใหม่
  static async recordVideoWatch(req, res) {
    try {
      const userId = req.user.id;
      const { videoId, videoData } = req.body;

      if (!videoId || !videoData) {
        return res.status(400).json({
          success: false,
          message: 'ต้องระบุ videoId และ videoData'
        });
      }

      await UserVideoHistory.addOrUpdateHistory(userId, videoId, videoData);

      return res.status(200).json({
        success: true,
        message: 'บันทึกการดูวิดีโอสำเร็จ'
      });
    } catch (error) {
      console.error('Error in recordVideoWatch:', error);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถบันทึกการดูวิดีโอได้',
        error: error.message
      });
    }
  }
}

module.exports = VideoHistoryController;
