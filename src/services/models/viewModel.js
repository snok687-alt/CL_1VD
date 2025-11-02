const { pool } = require('../config/db');

// เพิ่มหรือนับยอดวิว
async function incrementView(videoId) {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO video_views (video_id, views) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE views = views + 1, last_update = NOW();`,
      [videoId]
    );
  } finally {
    conn.release();
  }
}

// ดึงยอดวิวของวิดีโอเดียว
async function getViewCount(videoId) {
  const [rows] = await pool.query(
    'SELECT views FROM video_views WHERE video_id = ?',
    [videoId]
  );
  return rows[0]?.views || 0;
}

// ดึงยอดวิวของหลายวิดีโอ (สำหรับ batch)
async function getViewCounts(videoIds) {
  if (!videoIds.length) return {};
  const [rows] = await pool.query(
    `SELECT video_id, views FROM video_views WHERE video_id IN (${videoIds.map(() => '?').join(',')})`,
    videoIds
  );

  const result = {};
  rows.forEach(row => result[row.video_id] = row.views);
  return result;
}

module.exports = {
  incrementView,
  getViewCount,
  getViewCounts,
};
