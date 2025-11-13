const { pool } = require('../config/db');

const UserModel = {
  async createUser(name, password, role = 'user', image = null) {
    console.log('Creating user:', { name, password, role, image });
    const [result] = await pool.query(
      'INSERT INTO users (name, password, role, image) VALUES (?, ?, ?, ?)',
      [name, password, role, image]
    );
    return result.insertId;
  },

  async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
    return rows[0];
  },

  async getAll() {
    const [rows] = await pool.query('SELECT id, name, role, image FROM users');
    return rows;
  },

  async deleteUser(id) {
    // ดึงข้อมูลรูปภาพก่อนลบ
    const [user] = await pool.query('SELECT image FROM users WHERE id = ?', [id]);
    
    // ลบผู้ใช้
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    // คืนค่า path ของรูปภาพเพื่อลบไฟล์
    return user[0]?.image;
  }
};

module.exports = UserModel;