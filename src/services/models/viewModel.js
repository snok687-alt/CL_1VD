// models/viewModel.js
const { pool } = require('../config/db');

// เพิ่มหรือนับยอดวิว
async function incrementView(videoId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction(); // 👈 เริ่ม transaction

    // console.log(`🔄 พยายามเพิ่มวิวสำหรับ video_id: ${videoId}`);

    const videoIdNum = parseInt(videoId);
    if (isNaN(videoIdNum)) {
      throw new Error(`video_id ไม่ถูกต้อง: ${videoId}`);
    }

    // ตรวจสอบว่ามี video หรือยัง
    const [videoCheck] = await conn.query(
      'SELECT id FROM videos WHERE id = ?',
      [videoIdNum]
    );

    // ถ้ายังไม่มี → สร้างใหม่
    if (videoCheck.length === 0) {
      console.log(`📝 สร้าง record ใหม่สำหรับ video_id: ${videoIdNum}`);
      await conn.query(
        'INSERT INTO videos (id, title) VALUES (?, ?)',
        [videoIdNum, `Video ${videoIdNum}`]
      );
    }

    // 👇 commit เพื่อให้แน่ใจว่า videos ถูกบันทึกก่อน
    await conn.commit();

    // ✅ แล้วค่อยเพิ่มวิว (ใช้ query ใหม่)
    const [result] = await pool.query(
      `INSERT INTO video_views (video_id, views) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE views = views + 1, last_update = NOW()`,
      [videoIdNum]
    );

    console.log(`✅ เพิ่มวิวสำเร็จสำหรับ video_id: ${videoIdNum}`);
    return result;
  } catch (err) {
    await conn.rollback(); // ยกเลิก transaction ถ้ามี error
    console.error('❌ incrementView error:', err);
    throw err;
  } finally {
    conn.release();
  }
}


// ดึงยอดวิวของวิดีโอเดียว
async function getViewCount(videoId) {
  try {
    const videoIdNum = parseInt(videoId);
    const [rows] = await pool.query(
      'SELECT views FROM video_views WHERE video_id = ?',
      [videoIdNum]
    );
    return rows[0]?.views || 0;
  } catch (err) {
    console.error('❌ getViewCount error:', err);
    return 0;
  }
}

// ดึงยอดวิวของหลายวิดีโอ
async function getViewCounts(videoIds) {
  if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
    return {};
  }

  try {
    const validVideoIds = videoIds
      .map(id => parseInt(id))
      .filter(id => !isNaN(id) && id > 0);

    if (validVideoIds.length === 0) return {};

    const placeholders = validVideoIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT video_id, views FROM video_views WHERE video_id IN (${placeholders})`,
      validVideoIds
    );

    const result = {};
    rows.forEach(row => {
      result[row.video_id] = row.views || 0;
    });

    // เติมค่า default สำหรับ video_id ที่ไม่มีในฐานข้อมูล
    validVideoIds.forEach(id => {
      if (!(id in result)) {
        result[id] = 0;
      }
    });

    return result;
  } catch (err) {
    console.error('❌ getViewCounts error:', err);
    return {};
  }
}

module.exports = {
  incrementView,
  getViewCount,
  getViewCounts,
};