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

      --  CREATE TABLE IF NOT EXISTS access_logs
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
        device_fingerprint VARCHAR(255), -- ✅ ฟิลด์ใหม่: fingerprint ของอุปกรณ์
        cf_ip VARCHAR(100), -- ✅ ฟิลด์ใหม่: IP จริงจาก Cloudflare
        last_access DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        first_access DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_ip_url (ip, url(255)),
        INDEX idx_device_fingerprint (device_fingerprint),
        INDEX idx_ip (ip),
        INDEX idx_cf_ip (cf_ip)
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
        INDEX idx_pricing_enabled (pricing_enabled),
        INDEX idx_use_global_pricing (use_global_pricing),
        INDEX idx_custom_pricing_enabled (custom_pricing_enabled),
        INDEX idx_created_at (created_at),
        INDEX idx_updated_at (updated_at)
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

      CREATE TABLE IF NOT EXISTS ip_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_key VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        ip_pattern VARCHAR(100) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_group_key (group_key),
        INDEX idx_ip_pattern (ip_pattern)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS user_video_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        video_id INT NOT NULL,
        video_title VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(500),
        watch_duration INT DEFAULT 0, -- เวลาดูเป็นวินาที
        progress_percentage INT DEFAULT 0, -- ความคืบหน้า %
        last_watched_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        watch_count INT DEFAULT 1,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        
        UNIQUE KEY unique_user_video (user_id, video_id),
        INDEX idx_user_id (user_id),
        INDEX idx_last_watched (last_watched_time),
        INDEX idx_video_id (video_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

      -- รัน SQL นี้ในฐานข้อมูลของคุณ
      CREATE TABLE IF NOT EXISTS game_covers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        game_code VARCHAR(50) UNIQUE NOT NULL,
        plat_type VARCHAR(20) NOT NULL DEFAULT 'ag',
        image_url VARCHAR(500) NOT NULL,
        game_name VARCHAR(255),
        status INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        game_type VARCHAR(10) AFTER image_url,
        
        INDEX idx_game_code (game_code),
        INDEX idx_plat_type (plat_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
       
      CREATE TABLE IF NOT EXISTS crypto_deposits (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        player_id VARCHAR(50) NOT NULL,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        cny_amount DECIMAL(10,2) NOT NULL,
        usdt_amount DECIMAL(18,6) NOT NULL,
        wallet_address VARCHAR(100) NOT NULL,
        tx_hash VARCHAR(100),
        status ENUM('pending','paid','expired') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       paid_at DATETIME NULL
      );

      CREATE TABLE IF NOT EXISTS withdraw_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  amount DECIMAL(18,6) NOT NULL COMMENT 'จำนวน USDT',
  cny_amount DECIMAL(18,2) NOT NULL COMMENT 'จำนวน CNY',
  wallet_address VARCHAR(100) NOT NULL,
  account_name VARCHAR(100) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  status ENUM('pending', 'paid', 'rejected') DEFAULT 'pending',
  tx_hash VARCHAR(100) DEFAULT NULL,
  reject_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  rejected_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_player_id (player_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_tx_hash (tx_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS withdraw_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL COMMENT 'username หรือ player_id',
    amount DECIMAL(18,6) NOT NULL COMMENT 'จำนวน USDT ที่ถอน',
    status ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending' COMMENT 'สถานะถอน',
    wallet_address VARCHAR(100) NOT NULL COMMENT 'Wallet ผู้เล่น',
    tx_hash VARCHAR(100) DEFAULT NULL COMMENT 'TX Hash หลัง admin โอนจริง',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME DEFAULT NULL COMMENT 'เวลาที่ admin mark paid หรือ reject',
    remark TEXT DEFAULT NULL COMMENT 'หมายเหตุ admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Withdraw request table';

-- 玩家余额表
CREATE TABLE IF NOT EXISTS player_balances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL UNIQUE COMMENT '玩家ID',
    balance DECIMAL(18,6) NOT NULL DEFAULT 0 COMMENT '可用余额 (CNY)',
    locked_balance DECIMAL(18,6) NOT NULL DEFAULT 0 COMMENT '冻结余额 (提现处理中)',
    total_deposit DECIMAL(18,6) NOT NULL DEFAULT 0 COMMENT '累计存款',
    total_withdraw DECIMAL(18,6) NOT NULL DEFAULT 0 COMMENT '累计提现',
    last_deposit_at DATETIME DEFAULT NULL COMMENT '最后存款时间',
    last_withdraw_at DATETIME DEFAULT NULL COMMENT '最后提现时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_player_id (player_id),
    INDEX idx_balance (balance),
    INDEX idx_locked_balance (locked_balance),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='玩家余额表';

-- 提现通知表
CREATE TABLE IF NOT EXISTS withdraw_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    withdraw_id BIGINT NOT NULL COMMENT '提现请求ID',
    player_id VARCHAR(50) NOT NULL COMMENT '玩家ID',
    notification_type ENUM('request_created', 'paid', 'rejected', 'refunded', 'cancelled') NOT NULL,
    message TEXT NOT NULL COMMENT '通知消息',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME DEFAULT NULL,
    
    INDEX idx_player_id (player_id),
    INDEX idx_withdraw_id (withdraw_id),
    INDEX idx_is_read (is_read),
    INDEX idx_sent_at (sent_at),
    FOREIGN KEY (withdraw_id) REFERENCES withdraw_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提现通知表';

-- 更新 withdraw_requests 表结构
ALTER TABLE withdraw_requests 
ADD COLUMN IF NOT EXISTS fee DECIMAL(18,6) DEFAULT 0 COMMENT '手续费',
ADD COLUMN IF NOT EXISTS net_usdt DECIMAL(18,6) DEFAULT 0 COMMENT '实际到账USDT',
ADD COLUMN IF NOT EXISTS balance_deducted BOOLEAN DEFAULT FALSE COMMENT '是否已扣款',
ADD COLUMN IF NOT EXISTS deducted_at DATETIME DEFAULT NULL COMMENT '扣款时间',
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE COMMENT '是否已退款',
ADD COLUMN IF NOT EXISTS refunded_at DATETIME DEFAULT NULL COMMENT '退款时间',
ADD COLUMN IF NOT EXISTS rejected_at DATETIME DEFAULT NULL COMMENT '拒绝时间';

-- 创建余额变化记录表（可选，用于审计）
CREATE TABLE IF NOT EXISTS balance_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL COMMENT '玩家ID',
    transaction_type ENUM('deposit', 'withdraw', 'bonus', 'deduction', 'refund') NOT NULL,
    amount DECIMAL(18,6) NOT NULL COMMENT '变动金额',
    before_balance DECIMAL(18,6) NOT NULL COMMENT '变动前余额',
    after_balance DECIMAL(18,6) NOT NULL COMMENT '变动后余额',
    related_id VARCHAR(100) COMMENT '关联ID（订单号/提现ID等）',
    remark TEXT COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_player_id (player_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at),
    INDEX idx_related_id (related_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='余额变动记录表';

CREATE TABLE IF NOT EXISTS game_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL COMMENT 'รหัสผู้เล่น',
  plat_type VARCHAR(20) NOT NULL COMMENT 'แพลตฟอร์มเกม (ag, pg, cq9...)',
  currency VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT 'สกุลเงิน',
  game_type VARCHAR(10) NOT NULL COMMENT '1:วิดีโอ 2:สล็อต 3:หวย 4:กีฬา 5:อีสปอร์ต 6:ยิงปลา 7:ไพ่',
  game_name VARCHAR(255) COMMENT 'ชื่อเกม',
  game_code VARCHAR(100) COMMENT 'รหัสเกม',
  round VARCHAR(100) COMMENT 'รอบเกม/หมายเลขตั๋ว',
  table_no VARCHAR(100) COMMENT 'หมายเลขโต๊ะ',
  seat_no VARCHAR(100) COMMENT 'หมายเลขที่นั่ง',
  
  bet_amount DECIMAL(18,6) NOT NULL DEFAULT 0 COMMENT 'ยอดเดิมพัน',
  valid_amount DECIMAL(18,6) NOT NULL DEFAULT 0 COMMENT 'ยอดเดิมพันที่ถูกต้อง',
  settled_amount DECIMAL(18,6) NOT NULL DEFAULT 0 COMMENT 'ยอดชนะ/แพ้',
  bet_content TEXT COMMENT 'เนื้อหาการเดิมพัน',
  
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0:ไม่เสร็จสิ้น 1:เสร็จสิ้น 2:ยกเลิก 3:คืนเงิน',
  game_order_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'หมายเลขคำสั่งซื้อเกม',
  
  bet_time DATETIME NOT NULL COMMENT 'เวลาเดิมพัน',
  last_update_time DATETIME NOT NULL COMMENT 'เวลาอัปเดตล่าสุด',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_player_id (player_id),
  INDEX idx_plat_type (plat_type),
  INDEX idx_game_type (game_type),
  INDEX idx_status (status),
  INDEX idx_bet_time (bet_time),
  INDEX idx_last_update_time (last_update_time),
  INDEX idx_game_order_id (game_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='บันทึกเกมจาก API';

-- ✅ ตารางสรุปรายงานรายวัน
CREATE TABLE IF NOT EXISTS daily_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE COMMENT 'วันที่รายงาน',
  
  total_players INT DEFAULT 0 COMMENT 'จำนวนผู้เล่นทั้งหมด',
  active_players INT DEFAULT 0 COMMENT 'ผู้เล่นที่ใช้งาน',
  new_players INT DEFAULT 0 COMMENT 'ผู้เล่นใหม่',
  
  total_bets BIGINT DEFAULT 0 COMMENT 'จำนวนเดิมพันทั้งหมด',
  total_bet_amount DECIMAL(18,2) DEFAULT 0 COMMENT 'ยอดเดิมพันรวม',
  total_valid_amount DECIMAL(18,2) DEFAULT 0 COMMENT 'ยอดเดิมพันที่ถูกต้องรวม',
  total_win_loss DECIMAL(18,2) DEFAULT 0 COMMENT 'ยอดชนะ/แพ้รวม',
  
  total_deposits DECIMAL(18,2) DEFAULT 0 COMMENT 'ยอดฝากรวม',
  total_withdraws DECIMAL(18,2) DEFAULT 0 COMMENT 'ยอดถอนรวม',
  
  gross_gaming_revenue DECIMAL(18,2) DEFAULT 0 COMMENT 'รายได้จากการพนัน (GGR)',
  platform_cost DECIMAL(18,2) DEFAULT 0 COMMENT 'ค่าคอมมิชชั่นแพลตฟอร์ม',
  net_revenue DECIMAL(18,2) DEFAULT 0 COMMENT 'รายได้สุทธิ',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_report_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='สรุปรายงานรายวัน';

-- ✅ ตารางสรุปรายงานตามแพลตฟอร์ม
CREATE TABLE IF NOT EXISTS platform_daily_stats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  report_date DATE NOT NULL COMMENT 'วันที่รายงาน',
  plat_type VARCHAR(20) NOT NULL COMMENT 'แพลตฟอร์ม',
  
  total_bets BIGINT DEFAULT 0,
  total_bet_amount DECIMAL(18,2) DEFAULT 0,
  total_valid_amount DECIMAL(18,2) DEFAULT 0,
  total_win_loss DECIMAL(18,2) DEFAULT 0,
  active_players INT DEFAULT 0,
  
  platform_cost DECIMAL(18,2) DEFAULT 0 COMMENT 'ค่าคอมมิชชั่น',
  cost_ratio DECIMAL(5,4) DEFAULT 0 COMMENT 'อัตราค่าคอมมิชชั่น',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_date_platform (report_date, plat_type),
  INDEX idx_report_date (report_date),
  INDEX idx_plat_type (plat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='สรุปรายงานตามแพลตฟอร์มรายวัน';

-- ✅ ตารางเก็บค่าคอมมิชชั่นแพลตฟอร์ม
CREATE TABLE IF NOT EXISTS platform_commission_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plat_type VARCHAR(20) NOT NULL UNIQUE COMMENT 'แพลตฟอร์ม',
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0 COMMENT 'อัตราค่าคอมมิชชั่น (0.0900 = 9%)',
  is_active BOOLEAN DEFAULT TRUE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_plat_type (plat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='อัตราค่าคอมมิชชั่นแพลตฟอร์ม';

    `;

    await connection.query(createTablesSQL);

    await connection.end();

  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { pool, initializeDatabase };