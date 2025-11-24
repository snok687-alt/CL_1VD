const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// -----------------------------------------------------
// REGISTER - แก้ไขให้ใช้ pool
// -----------------------------------------------------
exports.registerGiftUser = async (req, res) => {
  let connection;
  try {
    const { name, password } = req.body;

    console.log("📝 注册请求:", { name, password: password ? "***" : "empty" });

    if (!name || !password) {
      return res.status(400).json({ 
        success: false,
        message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" 
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร"
      });
    }

    // ดึง IP Address
    let userIP = req.headers["x-forwarded-for"] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.ip;

    if (userIP) {
      userIP = userIP.replace("::ffff:", "").split(',')[0].trim();
    }

    console.log("🌐 User IP:", userIP);

    connection = await pool.getConnection();

    // ตรวจสอบว่ามี username นี้แล้วหรือไม่
    const [existingUsers] = await connection.query(
      'SELECT id FROM users_custom_gift WHERE username = ?',
      [name]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "ชื่อผู้ใช้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น" 
      });
    }

    // ตรวจสอบว่า IP นี้มีอยู่แล้วหรือไม่ (ป้องกันหลายบัญชี)
    if (userIP) {
      const [existingIP] = await connection.query(
        'SELECT id FROM users_custom_gift WHERE ip_address = ?',
        [userIP]
      );

      if (existingIP.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: "ที่อยู่ IP นี้มีบัญชีแล้ว" 
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกผู้ใช้ใหม่ พร้อม IP
    const [result] = await connection.query(
      `INSERT INTO users_custom_gift (username, password_hash, ip_address, amount_gift) 
       VALUES (?, ?, ?, 0)`,
      [name, hashedPassword, userIP]
    );

    console.log("✅ 注册成功，用户ID:", result.insertId);

    res.json({ 
      success: true, 
      message: "สมัครสมาชิกสำเร็จ!",
      userId: result.insertId 
    });

  } catch (err) {
    console.error('❌ 注册错误:', err);
    
    let errorMessage = "服务器错误";
    if (err.code === 'ER_DUP_ENTRY') {
      errorMessage = "ชื่อผู้ใช้ถูกใช้แล้ว";
    }

    res.status(500).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
// -----------------------------------------------------
// LOGIN - แก้ไขให้ใช้ pool
// -----------------------------------------------------
exports.loginGiftUser = async (req, res) => {
  let connection;
  try {
    const { name, password } = req.body;

    console.log("🔐 登录请求:", { name });

    if (!name || !password) {
      return res.status(400).json({ 
        success: false,
        message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" 
      });
    }

    // ดึง IP
    let userIP = req.headers["x-forwarded-for"] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.ip;

    if (userIP) {
      userIP = userIP.replace("::ffff:", "").split(',')[0].trim();
    }

    connection = await pool.getConnection();

    // ค้นหาผู้ใช้
    const [rows] = await connection.query(
      `SELECT * FROM users_custom_gift WHERE username = ? LIMIT 1`,
      [name]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" 
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" 
      });
    }

    // อัพเดต IP และ last_login
    await connection.query(
      `UPDATE users_custom_gift SET last_login = NOW(), ip_address = ? WHERE id = ?`,
      [userIP, user.id]
    );

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username 
      }, 
      JWT_SECRET, 
      { expiresIn: "30d" }
    );

    console.log("✅ 登录成功:", user.username);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        amount_gift: user.amount_gift || 0
      }
    });

  } catch (err) {
    console.error('❌ 登录错误:', err);
    res.status(500).json({ 
      success: false,
      message: "服务器错误",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// -----------------------------------------------------
// DAILY GIFT - แก้ไขให้ใช้ pool
// -----------------------------------------------------
exports.dailyGiftByIP = async (req, res) => {
  let connection;
  try {
    console.log("🎁 Daily Gift Request");

    // ดึง IP ของผู้ใช้
    let userIP = req.headers["x-forwarded-for"] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.ip;

    if (userIP) {
      userIP = userIP.replace("::ffff:", "").split(',')[0].trim();
    }

    console.log("🌐 User IP:", userIP);

    if (!userIP || userIP === 'unknown' || userIP === '::1') {
      return res.status(400).json({
        success: false,
        message: "❌ ไม่สามารถระบุ IP Address ได้"
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    connection = await pool.getConnection();

    // ค้นหาผู้ใช้ตาม IP
    const [rows] = await connection.query(
      `SELECT id, username, amount_gift, last_claim_date 
       FROM users_custom_gift 
       WHERE ip_address = ? 
       LIMIT 1`,
      [userIP]
    );

    console.log("📊 Found records:", rows.length);

    // ========================= กรณีไม่พบผู้ใช้ (ใหม่) =========================
    if (rows.length === 0) {
      console.log("🆕 New user by IP, creating record...");

      const username = "guest_" + Math.random().toString(36).substring(2, 10);
      const [result] = await connection.query(
        `INSERT INTO users_custom_gift 
         (username, password_hash, ip_address, amount_gift, last_claim_date) 
         VALUES (?, ?, ?, ?, ?)`,
        [username, "no_password", userIP, 1, today]
      );

      console.log("✅ New user created:", username);

      return res.json({
        success: true,
        added: 1,
        amount_gift: 1,
        message: "🎁 ยินดีต้อนรับ! รับของขวัญแรกเข้า +1 元",
        isNewUser: true,
        last_claim_date: today
      });
    }

    // ========================= กรณีพบผู้ใช้ =========================
    const user = rows[0];
    console.log("👤 Existing user:", user.username, "Last claim:", user.last_claim_date);

    // ตรวจสอบว่าได้รับของขวัญวันนี้แล้วหรือยัง
    const lastClaimDate = user.last_claim_date 
      ? new Date(user.last_claim_date).toISOString().slice(0, 10)
      : null;

    console.log("📅 Today:", today, "Last Claim:", lastClaimDate);

    if (lastClaimDate === today) {
      console.log("⏳ User already claimed today");

      // คำนวณเวลาที่เหลือจนถึงวันถัดไป
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeLeft = tomorrow - now;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      return res.json({
        success: false,
        message: `⏳ IP นี้ได้รับของขวัญวันนี้แล้ว! กรุณารอ ${hours} ชั่วโมง ${minutes} นาที`,
        amount_gift: user.amount_gift,
        can_claim_again: false,
        next_claim_time: tomorrow.toISOString(),
        time_left: { hours, minutes }
      });
    }

    // ========================= อัพเดตของขวัญ =========================
    console.log("✨ User can claim today, updating...");

    await connection.query(
      `UPDATE users_custom_gift 
       SET amount_gift = amount_gift + 1, last_claim_date = ? 
       WHERE ip_address = ?`,
      [today, userIP]
    );

    console.log("✅ Gift claimed successfully");

    return res.json({
      success: true,
      added: 1,
      amount_gift: user.amount_gift + 1,
      message: "🎁 รับของขวัญสำเร็จ +1 元!",
      last_claim_date: today
    });

  } catch (err) {
    console.error("❌ Daily Gift Error:", err);
    res.status(500).json({
      success: false,
      message: "❌ เกิดข้อผิดพลาดในระบบ",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserInfo = async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "ไม่มี Token" 
      });
    }

    // ตรวจสอบ Token
    const decoded = jwt.verify(token, JWT_SECRET);
    connection = await pool.getConnection();

    // ดึงข้อมูลผู้ใช้
    const [rows] = await connection.query(
      `SELECT id, username, amount_gift, last_claim_date, last_login, created_at 
       FROM users_custom_gift 
       WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "ไม่พบผู้ใช้" 
      });
    }

    const user = rows[0];
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        amount_gift: user.amount_gift,
        last_claim_date: user.last_claim_date,
        last_login: user.last_login,
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error('❌ Get User Info Error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token ไม่ถูกต้อง" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "服务器错误",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


exports.checkClaimStatus = async (req, res) => {
  let connection;
  try {
    let userIP = req.headers["x-forwarded-for"] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.ip;
    if (userIP) userIP = userIP.replace("::ffff:", "").split(',')[0].trim();

    connection = await pool.getConnection();

    const [rows] = await connection.query(
      `SELECT id, username, amount_gift, last_claim_date 
       FROM users_custom_gift 
       WHERE ip_address = ? LIMIT 1`,
      [userIP]
    );

    const user = rows[0];
    const today = new Date().toISOString().slice(0, 10);
    const lastClaimDate = user?.last_claim_date ? user.last_claim_date.toISOString().slice(0, 10) : null;

    res.json({
      success: true,
      claimedToday: lastClaimDate === today,
      amount_gift: user?.amount_gift || 0
    });

  } catch (err) {
    console.error("❌ Check Claim Status Error:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  } finally {
    if (connection) connection.release();
  }
};
