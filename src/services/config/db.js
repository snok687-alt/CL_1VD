require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${DB_NAME}\`;`);

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS video_ratings (
        video_id INT PRIMARY KEY,
        star_1 INT DEFAULT 0,
        star_2 INT DEFAULT 0,
        star_3 INT DEFAULT 0,
        star_4 INT DEFAULT 0,
        star_5 INT DEFAULT 0,
        FOREIGN KEY (video_id) REFERENCES videos(id)
      );

      CREATE TABLE IF NOT EXISTS uploaded_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        quantity INT DEFAULT NULL,
        days INT DEFAULT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
      );
        CREATE TABLE IF NOT EXISTS access_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(100),
      method VARCHAR(10),
      url TEXT,
      status INT,
      user_agent TEXT,
      referrer TEXT,
      hits INT DEFAULT 1,
      last_access DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_log (ip(50), method, url(255))
      );
      CREATE TABLE IF NOT EXISTS video_views (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      video_id INT NOT NULL,
      views BIGINT DEFAULT 0,
      last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_video (video_id),
      FOREIGN KEY (video_id) REFERENCES videos(id)
      );
    `;

    await connection.query(createTablesSQL);

    const [rows] = await connection.query('SELECT COUNT(*) AS cnt FROM videos;');
    if (rows[0].cnt === 0) {
      await connection.query('INSERT INTO videos (title) VALUES (?)', ['ตัวอย่างวีดีโอ']);
      console.log('✅ เพิ่มวิดีโอตัวอย่างแล้ว');
    }

    await connection.end();
    console.log('✅ ฐานข้อมูลพร้อมใช้งาน');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดตอนสร้างฐานข้อมูล:', err);
  }
}

module.exports = {
  pool,
  initializeDatabase,
};
