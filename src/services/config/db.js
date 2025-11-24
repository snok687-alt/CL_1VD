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
  charset: 'utf8mb4_general_ci',
});

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await connection.query(`USE \`${DB_NAME}\`;`);

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

      CREATE TABLE IF NOT EXISTS uploaded_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        quantity INT DEFAULT NULL,
        days INT DEFAULT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

      -- ຕາລາງຜູ້ຊົມທີ່ຮັບຂອງຂວັນ
CREATE TABLE IF NOT EXISTS users_custom_gift (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NULL,
  amount_gift INT NOT NULL DEFAULT 0,
  last_login DATETIME NULL,
  last_claim_date DATE NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


      -- ✅ อัปเดตตาราง users เพิ่มฟิลด์ใหม่
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        image VARCHAR(500) NULL,
        email VARCHAR(255) NULL,
        last_login DATETIME NULL,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ✅ ตารางเก็บประวัติการ login
      CREATE TABLE IF NOT EXISTS login_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ip_address VARCHAR(100),
        user_agent TEXT,
        device VARCHAR(50),
        browser VARCHAR(50),
        os VARCHAR(50),
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        logout_time DATETIME NULL,
        session_duration INT NULL,
        location VARCHAR(255) NULL,
        status ENUM('success', 'failed') DEFAULT 'success',

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_login_time (login_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ✅ ตารางการแจ้งเตือน
      CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('login', 'security', 'system', 'activity') DEFAULT 'system',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS links (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title_links VARCHAR(255) NOT NULL,
        name_links VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      
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

      -- ✅ ตารางการตั้งค่าราคาวิดีโอ
      CREATE TABLE IF NOT EXISTS video_pricing (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        video_id INT NOT NULL,
        pricing_enabled BOOLEAN DEFAULT FALSE,
        price_1_amount DECIMAL(10,2) DEFAULT 1.00,
        price_1_days INT DEFAULT 1,
        price_1_enabled BOOLEAN DEFAULT FALSE,
        price_7_amount DECIMAL(10,2) DEFAULT 7.00,
        price_7_days INT DEFAULT 7,
        price_7_enabled BOOLEAN DEFAULT FALSE,
        price_30_amount DECIMAL(10,2) DEFAULT 30.00,
        price_30_days INT DEFAULT 30,
        price_30_enabled BOOLEAN DEFAULT FALSE,
        price_90_amount DECIMAL(10,2) DEFAULT 90.00,
        price_90_days INT DEFAULT 90,
        price_90_enabled BOOLEAN DEFAULT FALSE,
        price_180_amount DECIMAL(10,2) DEFAULT 180.00,
        price_180_days INT DEFAULT 180,
        price_180_enabled BOOLEAN DEFAULT FALSE,
        price_365_amount DECIMAL(10,2) DEFAULT 365.00,
        price_365_days INT DEFAULT 365,
        price_365_enabled BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        use_global_pricing BOOLEAN DEFAULT TRUE,
        custom_pricing_enabled BOOLEAN DEFAULT FALSE,

        UNIQUE KEY unique_video_pricing (video_id),
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        INDEX idx_pricing_enabled (pricing_enabled),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ✅ ตารางการตั้งค่าราคาแบบกลุ่ม (Global Settings)
      CREATE TABLE IF NOT EXISTS global_pricing_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_name VARCHAR(100) NOT NULL UNIQUE,
        enabled BOOLEAN DEFAULT FALSE,
        template_1_amount DECIMAL(10,2) DEFAULT 1.00,
        template_1_days INT DEFAULT 1,
        template_1_enabled BOOLEAN DEFAULT FALSE,
        template_7_amount DECIMAL(10,2) DEFAULT 7.00,
        template_7_days INT DEFAULT 7,
        template_7_enabled BOOLEAN DEFAULT FALSE,
        template_30_amount DECIMAL(10,2) DEFAULT 30.00,
        template_30_days INT DEFAULT 30,
        template_30_enabled BOOLEAN DEFAULT FALSE,
        template_90_amount DECIMAL(10,2) DEFAULT 90.00,
        template_90_days INT DEFAULT 90,
        template_90_enabled BOOLEAN DEFAULT FALSE,
        template_180_amount DECIMAL(10,2) DEFAULT 180.00,
        template_180_days INT DEFAULT 180,
        template_180_enabled BOOLEAN DEFAULT FALSE,
        template_365_amount DECIMAL(10,2) DEFAULT 365.00,
        template_365_days INT DEFAULT 365,
        template_365_enabled BOOLEAN DEFAULT FALSE,
        apply_to_all BOOLEAN DEFAULT TRUE,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT FALSE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- ✅ ตารางการซื้อวิดีโอของผู้ใช้
      CREATE TABLE IF NOT EXISTS user_video_purchases (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        video_id INT NOT NULL,
        purchase_type VARCHAR(50) NOT NULL,
        amount_paid DECIMAL(10,2) NOT NULL,
        access_days INT NOT NULL,
        purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiry_date DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,

        INDEX idx_user_id (user_id),
        INDEX idx_video_id (video_id),
        INDEX idx_expiry_date (expiry_date),
        INDEX idx_is_active (is_active),
        INDEX idx_purchase_date (purchase_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await connection.query(createTablesSQL);

    await connection.end();

  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { pool, initializeDatabase };