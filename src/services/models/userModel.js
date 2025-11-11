const { pool } = require('../config/db');

const UserModel = {
  async createUser(name, password, role = 'user') {
    console.log('Creating user:', { name, password, role });
    const [result] = await pool.query(
      'INSERT INTO users (name, password, role) VALUES (?, ?, ?)',
      [name, password, role]
    );
    return result.insertId;
  },

  async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
    return rows[0];
  },

  async getAll() {
    const [rows] = await pool.query('SELECT id, name, role FROM users');
    return rows;
  },

  async deleteUser(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = UserModel;
