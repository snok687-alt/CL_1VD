const { pool } = require('../config/db');

const UserModel = {
  async createUser(name, password, role = 'user', image = null) {
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

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // ✅ อัปเดต last_login
  async updateLastLogin(userId) {
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [userId]
    );
  },

  // ✅ บันทึกประวัติการ login
  async createLoginHistory(data) {
    const { userId, ipAddress, userAgent, device, browser, os, status = 'success' } = data;
    
    const [result] = await pool.query(
      `INSERT INTO login_history 
       (user_id, ip_address, user_agent, device, browser, os, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, ipAddress, userAgent, device, browser, os, status]
    );
    
    return result.insertId;
  },

  // ✅ ดึงประวัติการ login
  async getLoginHistory(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      `SELECT 
        id, ip_address, device, browser, os, 
        login_time, logout_time, location, status
       FROM login_history 
       WHERE user_id = ? 
       ORDER BY login_time DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  // ✅ สร้างการแจ้งเตือน
  async createNotification(data) {
    const { userId, type = 'system', title, message } = data;
    
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES (?, ?, ?, ?)`,
      [userId, type, title, message]
    );
    
    return result.insertId;
  },

  // ✅ ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
  async getUnreadNotifications(userId, limit = 10) {
    const [rows] = await pool.query(
      `SELECT id, type, title, message, created_at
       FROM notifications 
       WHERE user_id = ? AND is_read = FALSE 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  },

  // ✅ ดึงการแจ้งเตือนทั้งหมด
  async getNotifications(userId, limit = 50, offset = 0) {
    const [rows] = await pool.query(
      `SELECT id, type, title, message, is_read, created_at
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  // ✅ นับการแจ้งเตือนที่ยังไม่ได้อ่าน
  async getUnreadNotificationCount(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  },

  // ✅ ทำเครื่องหมายว่าอ่านแล้ว
  async markNotificationAsRead(notificationId, userId) {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  },

  // ✅ ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
  async markAllNotificationsAsRead(userId) {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
  },

  async getAll() {
    const [rows] = await pool.query('SELECT id, name, role, image FROM users');
    return rows;
  },

  async deleteUser(id) {
    const [user] = await pool.query('SELECT image FROM users WHERE id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return user[0]?.image;
  }
};

module.exports = UserModel;