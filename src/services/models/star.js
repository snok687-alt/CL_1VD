const { pool } = require('../config/db');

async function getVideoById(video_id) {
  const [rows] = await pool.query('SELECT * FROM videos WHERE id = ?', [video_id]);
  return rows.length > 0 ? rows[0] : null;
}

async function insertVideo(video_id, title) {
  await pool.query(
    'INSERT INTO videos (id, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id',
    [video_id, title]
  );
}

async function getRating(video_id) {
  const [rows] = await pool.query('SELECT * FROM video_ratings WHERE video_id = ?', [video_id]);
  return rows.length > 0 ? rows[0] : null;
}

async function insertRating(video_id, initialStars) {
  await pool.query(
    `INSERT INTO video_ratings (video_id, star_1, star_2, star_3, star_4, star_5)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [video_id, ...initialStars]
  );
}

async function updateRating(video_id, rating) {
  const column = `star_${rating}`;
  await pool.query(
    `UPDATE video_ratings SET ${column} = ${column} + 1 WHERE video_id = ?`,
    [video_id]
  );
}

module.exports = {
  getVideoById,
  insertVideo,
  getRating,
  insertRating,
  updateRating
};
