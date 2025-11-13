// models/linkModel.js
const { pool } = require('../config/db');

// ✅ ฟังก์ชันบันทึกลิงก์ใหม่
async function createLink(title_links, name_links) {
  const [result] = await pool.query(
    'INSERT INTO links (title_links, name_links) VALUES (?, ?)',
    [title_links, name_links]
  );
  return result.insertId;
}

// ✅ ดึงข้อมูลลิงก์ทั้งหมด
async function getAllLinks() {
  const [rows] = await pool.query('SELECT * FROM links ORDER BY id DESC');
  return rows;
}

// ✅ ดึงลิงก์ตาม ID
async function getLinkById(id) {
  const [rows] = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
  return rows[0];
}

// ✅ อัปเดตลิงก์
async function updateLink(id, title_links, name_links) {
  await pool.query(
    'UPDATE links SET title_links = ?, name_links = ? WHERE id = ?',
    [title_links, name_links, id]
  );
}

// ✅ ลบลิงก์
async function deleteLink(id) {
  await pool.query('DELETE FROM links WHERE id = ?', [id]);
}

module.exports = {
  createLink,
  getAllLinks,
  getLinkById,
  updateLink,
  deleteLink,
};
