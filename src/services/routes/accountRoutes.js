const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET: ดึงรายชื่อผู้ใช้ทั้งหมด
router.get('/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT id, username, amount_gift, last_claim_date, last_login, created_at FROM users_custom_gift ORDER BY id DESC`
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
