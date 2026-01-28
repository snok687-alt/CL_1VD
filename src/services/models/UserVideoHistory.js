// ============================================================================
// FILE 1: models/UserVideoHistory.js
// ============================================================================

const { pool } = require('../config/db');

class UserVideoHistory {
  
  // ✅ ดึงประวัติการดูวิดีโอของผู้ใช้
  static async getHistory(userId, limit = 100) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          id,
          user_id,
          video_id,
          video_title,
          thumbnail_url,
          watch_duration,
          progress_percentage,
          last_watched_time,
          watch_count
        FROM user_video_history
        WHERE user_id = ?
        ORDER BY last_watched_time DESC
        LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }

  // ✅ ดึงสถิติการดูวิดีโอ
  static async getHistoryStats(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          COUNT(DISTINCT video_id) as total_watched_videos,
          SUM(watch_duration) as total_watch_seconds,
          AVG(progress_percentage) as avg_completion_rate,
          COUNT(*) as total_watch_sessions,
          MAX(last_watched_time) as last_watch_time
        FROM user_video_history
        WHERE user_id = ?`,
        [userId]
      );

      const stats = rows[0] || {
        total_watched_videos: 0,
        total_watch_seconds: 0,
        avg_completion_rate: 0,
        total_watch_sessions: 0,
        last_watch_time: null
      };

      const totalWatchHours = Math.round(stats.total_watch_seconds / 3600) || 0;
      const avgCompletionRate = Math.round(stats.avg_completion_rate) || 0;

      return {
        summary: {
          total_watched_videos: stats.total_watched_videos,
          avg_completion_rate: avgCompletionRate,
          total_watch_sessions: stats.total_watch_sessions
        },
        total_watch_hours: totalWatchHours,
        last_watch_time: stats.last_watch_time
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // ✅ ลบรายการประวัติตัวเดียว
  static async deleteHistoryItem(userId, historyId) {
    try {
      const [result] = await pool.query(
        `DELETE FROM user_video_history
        WHERE id = ? AND user_id = ?`,
        [historyId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting history item:', error);
      throw error;
    }
  }

  // ✅ ล้างประวัติทั้งหมด
  static async clearAllHistory(userId) {
    try {
      const [result] = await pool.query(
        `DELETE FROM user_video_history
        WHERE user_id = ?`,
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  // ✅ เพิ่มหรืออัพเดตประวัติการดูวิดีโอ
  static async addOrUpdateHistory(userId, videoId, videoData) {
    try {
      const { video_title, thumbnail_url, watch_duration = 0, progress_percentage = 0 } = videoData;

      const [existing] = await pool.query(
        `SELECT id, watch_count, watch_duration FROM user_video_history
        WHERE user_id = ? AND video_id = ?`,
        [userId, videoId]
      );

      if (existing.length > 0) {
        const item = existing[0];
        const newWatchCount = item.watch_count + 1;
        const newWatchDuration = (item.watch_duration || 0) + (watch_duration || 0);

        await pool.query(
          `UPDATE user_video_history
          SET watch_duration = ?,
              progress_percentage = ?,
              watch_count = ?,
              last_watched_time = NOW()
          WHERE user_id = ? AND video_id = ?`,
          [newWatchDuration, progress_percentage, newWatchCount, userId, videoId]
        );
      } else {
        await pool.query(
          `INSERT INTO user_video_history
          (user_id, video_id, video_title, thumbnail_url, watch_duration, progress_percentage, watch_count, last_watched_time)
          VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
          [userId, videoId, video_title, thumbnail_url, watch_duration, progress_percentage]
        );
      }

      return true;
    } catch (error) {
      console.error('Error adding/updating history:', error);
      throw error;
    }
  }

  // ✅ ดึงข้อมูลวิดีโอที่ดูมากที่สุด
  static async getTopWatchedVideos(userId, limit = 10) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          id,
          user_id,
          video_id,
          video_title,
          thumbnail_url,
          watch_count,
          watch_duration,
          progress_percentage,
          last_watched_time
        FROM user_video_history
        WHERE user_id = ?
        ORDER BY watch_count DESC
        LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching top watched:', error);
      throw error;
    }
  }

  // ✅ ดึงข้อมูลวิดีโอที่ดูล่าสุด
  static async getRecentlyWatched(userId, limit = 10) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          id,
          user_id,
          video_id,
          video_title,
          thumbnail_url,
          watch_duration,
          progress_percentage,
          last_watched_time,
          watch_count
        FROM user_video_history
        WHERE user_id = ?
        ORDER BY last_watched_time DESC
        LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching recent:', error);
      throw error;
    }
  }
}

module.exports = UserVideoHistory;