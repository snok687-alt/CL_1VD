require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

// ✅ สร้าง connection pool สำหรับ query ปกติ
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_general_ci',
});

async function initializeDatabase() {
  try {
    // ✅ สร้าง connection ชั่วคราวเพื่อสร้าง database / table
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    // ✅ สร้างฐานข้อมูลถ้ายังไม่มี
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await connection.query(`USE \`${DB_NAME}\`;`);

    // ✅ สร้างตารางทั้งหมด
    const createTablesSQL = `
      -- ตารางวิดีโอ
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ตารางเรตติ้งวิดีโอ
      CREATE TABLE IF NOT EXISTS video_ratings (
        video_id INT PRIMARY KEY,
        star_1 INT DEFAULT 0,
        star_2 INT DEFAULT 0,
        star_3 INT DEFAULT 0,
        star_4 INT DEFAULT 0,
        star_5 INT DEFAULT 0,
        FOREIGN KEY (video_id) REFERENCES videos(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ตารางรูปที่อัปโหลด
      CREATE TABLE IF NOT EXISTS uploaded_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        quantity INT DEFAULT NULL,
        days INT DEFAULT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ✅ ตารางเก็บ Access Logs (อัปเกรด)
      CREATE TABLE IF NOT EXISTS access_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        ip VARCHAR(100) NOT NULL,
        method VARCHAR(10),
        url VARCHAR(500),
        status INT,
        user_agent TEXT,
        device VARCHAR(50),
        browser VARCHAR(50),
        os VARCHAR(50),
        referrer VARCHAR(500),
        hits INT DEFAULT 1,
        response_time INT DEFAULT 0,
        user_country VARCHAR(100),
        city VARCHAR(100),
        region VARCHAR(100),
        isp VARCHAR(200),
        last_access DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        first_access DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_log (ip(50), method, url(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS users (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS links (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title_links VARCHAR(255) NOT NULL,
        name_links VARCHAR(255) NOT NULL,
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      
      -- ✅ ตารางเก็บยอดวิววิดีโอ
      CREATE TABLE IF NOT EXISTS video_views (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        video_id INT NOT NULL,
        views BIGINT DEFAULT 0,
        last_update DATETIME DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_video (video_id),
        FOREIGN KEY (video_id) REFERENCES videos(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ✅ Index เพิ่มเติม เพื่อให้ Query IP และ URL เร็วขึ้น
      CREATE INDEX IF NOT EXISTS idx_ip ON access_logs(ip);
      CREATE INDEX IF NOT EXISTS idx_url ON access_logs(url(255));
      CREATE INDEX IF NOT EXISTS idx_last_access ON access_logs(last_access);
    `;

    await connection.query(createTablesSQL);

    // ✅ เพิ่มข้อมูลตัวอย่างวิดีโอ
    const [rows] = await connection.query('SELECT COUNT(*) AS cnt FROM videos;');
    if (rows[0].cnt === 0) {
      await connection.query('INSERT INTO videos (title) VALUES (?)', ['ตัวอย่างวิดีโอ']);
      console.log('🎥 เพิ่มวิดีโอตัวอย่างเรียบร้อยแล้ว');
    }

    await connection.end();
    console.log('✅ ฐานข้อมูลพร้อมใช้งานแล้ว');

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดตอนสร้างฐานข้อมูล:', err.message);
  }
}

module.exports = { pool, initializeDatabase };
