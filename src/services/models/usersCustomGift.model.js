const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

const UsersCustomGift = {

  // หา user จาก username
  findByUsername: async (username) => {
    const [rows] = await pool.query(
      `SELECT * FROM users_custom_gift WHERE username = ? LIMIT 1`,
      [username]
    );
    return rows[0];
  },

  // หา user จาก IP
  findByIP: async (ip) => {
    const [rows] = await pool.query(
      `SELECT * FROM users_custom_gift WHERE ip_address = ? LIMIT 1`,
      [ip]
    );
    return rows[0];
  },

  // สร้างผู้ใช้ใหม่
  createUser: async (username, password, ip, amount_gift = 0, last_claim_date = null) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users_custom_gift (username, password_hash, ip_address, amount_gift, last_claim_date)
       VALUES (?, ?, ?, ?, ?)`,
      [username, hashedPassword, ip, amount_gift, last_claim_date]
    );
    return result.insertId;
  },

  // เพิ่มของขวัญ
  addGiftAmount: async (id, amount) => {
    await pool.query(
      `UPDATE users_custom_gift SET amount_gift = amount_gift + ? WHERE id = ?`,
      [amount, id]
    );
  },

  // อัปเดต last_claim_date
  updateLastClaimDate: async (id, date) => {
    await pool.query(
      `UPDATE users_custom_gift SET last_claim_date = ? WHERE id = ?`,
      [date, id]
    );
  },

  // อัปเดต last_login
  updateLastLogin: async (id) => {
    await pool.query(
      `UPDATE users_custom_gift SET last_login = NOW() WHERE id = ?`,
      [id]
    );
  }

};

module.exports = UsersCustomGift;
