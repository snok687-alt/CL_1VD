const { pool } = require('../config/db');

async function saveImageMetadata(filename, mimetype, size, quantity = null, days = null) {
  const [result] = await pool.query(
    `INSERT INTO uploaded_images (filename, mimetype, size, quantity, days) VALUES (?, ?, ?, ?, ?)`,
    [filename, mimetype, size, quantity, days]
  );
  return result.insertId;
}



async function getAllImages() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`SELECT * FROM uploaded_images ORDER BY upload_date DESC`);
    return rows;
  } finally {
    connection.release();
  }
}

module.exports = {
  saveImageMetadata,
  getAllImages
};