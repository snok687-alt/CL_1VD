const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'please_set_jwt_secret';

// 辅助函数: 标准化 IP
function getClientIP(req) {
  let ip =
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip;

  if (ip) {
    ip = ip.replace('::ffff:', '');
    ip = ip.split(',')[0].trim();
  }

  return ip;
}

// -----------------------------------------------------
// 注册
// -----------------------------------------------------
exports.registerGiftUser = async (req, res) => {
  let connection;
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ success: false, message: "请填写用户名和密码" });
    }
    if (password.length < 4) {
      return res.status(400).json({ success: false, message: "密码至少需要4个字符" });
    }

    const userIP = getClientIP(req);

    connection = await pool.getConnection();

    // 检查用户名是否重复
    const [existingUsers] = await connection.query(
      'SELECT id FROM users_custom_gift WHERE username = ? LIMIT 1',
      [name]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "用户名已被使用，请选择其他用户名" });
    }

    // 检查 IP 是否已注册 (1 IP = 1 账户)
    if (userIP) {
      const [existingIP] = await connection.query(
        'SELECT id FROM users_custom_gift WHERE ip_address = ? LIMIT 1',
        [userIP]
      );
      if (existingIP.length > 0) {
        return res.status(400).json({ success: false, message: "此 IP 地址已有账户" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      `INSERT INTO users_custom_gift (username, password_hash, ip_address, amount_gift, created_at)
       VALUES (?, ?, ?, 0, NOW())`,
      [name, hashedPassword, userIP]
    );

    return res.json({ success: true, message: "注册成功!", userId: result.insertId });

  } catch (err) {
    console.error('注册错误:', err);
    let message = "系统发生错误";
    if (err.code === 'ER_DUP_ENTRY') message = "用户名已被使用";
    res.status(500).json({ success: false, message, error: process.env.NODE_ENV === 'development' ? err.message : undefined });
  } finally {
    if (connection) connection.release();
  }
};

// -----------------------------------------------------
// 登录
// -----------------------------------------------------
exports.loginGiftUser = async (req, res) => {
  let connection;
  try {
    const { name, password } = req.body;
    if (!name || !password) return res.status(400).json({ success: false, message: "请填写用户名和密码" });

    const userIP = getClientIP(req);

    connection = await pool.getConnection();

    // 根据用户名查找用户
    const [rows] = await connection.query(
      `SELECT * FROM users_custom_gift WHERE username = ? LIMIT 1`,
      [name]
    );
    if (rows.length === 0) return res.status(401).json({ success: false, message: "用户名或密码错误" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: "用户名或密码错误" });

    // 更新登录信息
    await connection.query(
      `UPDATE users_custom_gift SET last_login = NOW(), ip_address = ? WHERE id = ?`,
      [userIP, user.id]
    );

    // 合并访客记录
    if (userIP) {
      try {
        const [guestRows] = await connection.query(
          `SELECT id, amount_gift, last_claim_date FROM users_custom_gift 
           WHERE ip_address = ? AND password_hash = 'no_password' AND id != ? LIMIT 1`,
          [userIP, user.id]
        );

        if (guestRows.length > 0) {
          const guest = guestRows[0];
          const guestAmount = Number(guest.amount_gift || 0);
          const userAmount = Number(user.amount_gift || 0);
          
          if (guestAmount > 0) {
            const newAmount = userAmount + guestAmount;
            await connection.query(
              `UPDATE users_custom_gift SET amount_gift = ? WHERE id = ?`,
              [newAmount, user.id]
            );
            user.amount_gift = newAmount;
          }

          // 删除访客记录
          await connection.query(
            `DELETE FROM users_custom_gift WHERE id = ?`,
            [guest.id]
          );
        }
      } catch (mergeErr) {
        console.warn("访客合并警告:", mergeErr.message);
      }
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        amount_gift: user.amount_gift || 0,
        last_claim_date: user.last_claim_date || null
      }
    });

  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ success: false, message: "系统发生错误", error: process.env.NODE_ENV === 'development' ? err.message : undefined });
  } finally {
    if (connection) connection.release();
  }
};

// -----------------------------------------------------
// 每日礼物 - 24小时制
// -----------------------------------------------------
exports.dailyGiftByIP = async (req, res) => {
  let connection;
  try {
    console.log("🎁 每日礼物请求");

    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn("⚠️ 令牌无效，回退到IP检查");
      }
    }

    const userIP = getClientIP(req);

    if (!userId && (!userIP || userIP === 'unknown' || userIP === '::1')) {
      return res.status(400).json({ 
        success: false, 
        message: "❌ 无法识别 IP 地址" 
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let user = null;

      if (userId) {
        const [rows] = await connection.query(
          `SELECT id, username, amount_gift, last_claim_date,
                  CASE 
                    WHEN last_claim_date IS NULL THEN FALSE
                    WHEN TIMESTAMPDIFF(HOUR, last_claim_date, NOW()) < 24 THEN TRUE
                    ELSE FALSE
                  END AS claimed_recently
           FROM users_custom_gift
           WHERE id = ? LIMIT 1 FOR UPDATE`,
          [userId]
        );
        
        if (rows.length === 0) {
          await connection.rollback();
          return res.status(404).json({ success: false, message: "❌ 用户不存在" });
        }
        
        user = rows[0];
        
        if (user.claimed_recently) {
          await connection.rollback();
          const [timeRows] = await connection.query(
            `SELECT TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(last_claim_date, INTERVAL 24 HOUR)) as seconds_left 
             FROM users_custom_gift WHERE id = ?`,
            [userId]
          );
          const secondsLeft = timeRows[0]?.seconds_left || 0;
          const hours = Math.floor(secondsLeft / 3600);
          const minutes = Math.floor((secondsLeft % 3600) / 60);
          return res.json({
            success: false,
            message: "⏳ 请等待24小时后再领取礼物",
            can_claim_again: false,
            claimedRecently: true,
            time_left: { hours, minutes }
          });
        }
      } else {
        const [rows] = await connection.query(
          `SELECT id, username, amount_gift, last_claim_date,
                  CASE 
                    WHEN last_claim_date IS NULL THEN FALSE
                    WHEN TIMESTAMPDIFF(HOUR, last_claim_date, NOW()) < 24 THEN TRUE
                    ELSE FALSE
                  END AS claimed_recently
           FROM users_custom_gift
           WHERE ip_address = ? LIMIT 1 FOR UPDATE`,
          [userIP]
        );

        if (rows.length === 0) {
          const username = "guest_" + Math.random().toString(36).substring(2, 10);
          const [result] = await connection.query(
            `INSERT INTO users_custom_gift (username, password_hash, ip_address, amount_gift, last_claim_date)
             VALUES (?, ?, ?, ?, NOW())`,
            [username, "no_password", userIP, 1]
          );
          await connection.commit();
          return res.json({ 
            success: true, added: 1, amount_gift: 1, 
            message: "🎁 欢迎！获得首次礼物 +1 元", 
            isNewUser: true, last_claim_date: new Date() 
          });
        }

        user = rows[0];
        
        if (user.claimed_recently) {
          await connection.rollback();
          const [timeRows] = await connection.query(
            `SELECT TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(last_claim_date, INTERVAL 24 HOUR)) as seconds_left 
             FROM users_custom_gift WHERE ip_address = ?`,
            [userIP]
          );
          const secondsLeft = timeRows[0]?.seconds_left || 0;
          const hours = Math.floor(secondsLeft / 3600);
          const minutes = Math.floor((secondsLeft % 3600) / 60);
          return res.json({
            success: false,
            message: "⏳ 请等待24小时后再领取礼物",
            can_claim_again: false,
            claimedRecently: true,
            time_left: { hours, minutes }
          });
        }
      }

      const updateQuery = userId
        ? `UPDATE users_custom_gift SET amount_gift = amount_gift + 1, last_claim_date = NOW() WHERE id = ?`
        : `UPDATE users_custom_gift SET amount_gift = amount_gift + 1, last_claim_date = NOW() WHERE ip_address = ?`;
      const params = userId ? [userId] : [userIP];
      await connection.query(updateQuery, params);

      const [updatedRows] = await connection.query(
        `SELECT amount_gift, last_claim_date FROM users_custom_gift WHERE ${userId ? 'id = ?' : 'ip_address = ?'}`,
        params
      );
      await connection.commit();

      const updatedUser = updatedRows[0];
      return res.json({
        success: true,
        added: 1,
        amount_gift: updatedUser.amount_gift,
        message: "🎁 领取礼物成功 +1 元!",
        last_claim_date: updatedUser.last_claim_date,
        can_claim_again: false,
        claimedRecently: true
      });

    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error("❌ 每日礼物错误:", err);
    res.status(500).json({ 
      success: false, 
      message: "❌ 系统发生错误", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  } finally {
    if (connection) connection.release();
  }
};

// -----------------------------------------------------
// 获取用户信息
// -----------------------------------------------------
exports.getUserInfo = async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: "没有 Token" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token 无效" });
    }

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT id, username, amount_gift, last_claim_date, last_login, created_at 
       FROM users_custom_gift WHERE id = ? LIMIT 1`,
      [decoded.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "未找到用户" });

    const user = rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        amount_gift: user.amount_gift || 0,
        last_claim_date: user.last_claim_date || null,
        last_login: user.last_login || null,
        created_at: user.created_at || null
      }
    });

  } catch (err) {
    console.error('获取用户信息错误:', err);
    res.status(500).json({ success: false, message: "系统发生错误", error: process.env.NODE_ENV === 'development' ? err.message : undefined });
  } finally {
    if (connection) connection.release();
  }
};

// -----------------------------------------------------
// 检查领取状态 - 24小时制
// -----------------------------------------------------
exports.checkClaimStatus = async (req, res) => {
  let connection;
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
    let userIdFromToken = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userIdFromToken = decoded?.id || null;
      } catch (e) {
        userIdFromToken = null;
      }
    }

    const userIP = getClientIP(req);
    connection = await pool.getConnection();

    let rows;
    
    if (userIdFromToken) {
      [rows] = await connection.query(
        `SELECT id, username, amount_gift, last_claim_date, 
                CASE 
                  WHEN last_claim_date IS NULL THEN FALSE
                  WHEN TIMESTAMPDIFF(HOUR, last_claim_date, NOW()) < 24 THEN TRUE
                  ELSE FALSE
                END AS claimed_recently,
                TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(last_claim_date, INTERVAL 24 HOUR)) as seconds_left
         FROM users_custom_gift WHERE id = ? LIMIT 1`,
        [userIdFromToken]
      );
    } else {
      if (!userIP) {
        return res.status(400).json({ success: false, message: "无法识别 IP 地址" });
      }
      [rows] = await connection.query(
        `SELECT id, username, amount_gift, last_claim_date, 
                CASE 
                  WHEN last_claim_date IS NULL THEN FALSE
                  WHEN TIMESTAMPDIFF(HOUR, last_claim_date, NOW()) < 24 THEN TRUE
                  ELSE FALSE
                END AS claimed_recently,
                TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(last_claim_date, INTERVAL 24 HOUR)) as seconds_left
         FROM users_custom_gift WHERE ip_address = ? LIMIT 1`,
        [userIP]
      );
    }

    const user = rows[0];
    
    if (!user) {
      return res.json({
        success: true,
        claimedRecently: false,
        amount_gift: 0,
        last_claim_date: null,
        time_left: null
      });
    }

    const claimedRecently = !!user.claimed_recently;
    let time_left = null;
    if (claimedRecently) {
      const secondsLeft = Math.max(0, user.seconds_left || 0);
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      time_left = { hours, minutes };
    }

    res.json({
      success: true,
      claimedRecently,
      amount_gift: user.amount_gift || 0,
      last_claim_date: user.last_claim_date || null,
      time_left
    });

  } catch (err) {
    console.error('检查状态错误:', err);
    res.status(500).json({ success: false, message: "发生错误" });
  } finally {
    if (connection) connection.release();
  }
};

// -----------------------------------------------------
// ตรวจสอบ username ซ้ำ
// -----------------------------------------------------
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ exists: false });
    
    const [rows] = await pool.query(
      'SELECT id FROM users_custom_gift WHERE username = ? LIMIT 1',
      [username]
    );
    return res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ exists: false });
  }
};

// -----------------------------------------------------
// ✅ แลกของขวัญเป็นเงินเกม
// -----------------------------------------------------
exports.redeemGift = async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userIP = getClientIP(req);

    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // token ไม่ valid ใช้ IP แทน
      }
    }

    // ต้องมี userId หรือ userIP อย่างใดอย่างหนึ่ง
    if (!userId && (!userIP || userIP === 'unknown')) {
      return res.status(400).json({ success: false, message: '❌ 无法识别用户' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let rows;
      if (userId) {
        [rows] = await connection.query(
          `SELECT id, username, amount_gift FROM users_custom_gift WHERE id = ? LIMIT 1 FOR UPDATE`,
          [userId]
        );
      } else {
        [rows] = await connection.query(
          `SELECT id, username, amount_gift FROM users_custom_gift WHERE ip_address = ? LIMIT 1 FOR UPDATE`,
          [userIP]
        );
      }

      // ไม่พบ user หรือ ยอดของขวัญ = 0
      if (rows.length === 0) {
        await connection.rollback();
        return res.json({ success: false, message: '❌ 未找到用户记录' });
      }

      if (rows[0].amount_gift <= 0) {
        await connection.rollback();
        return res.json({ success: false, message: '❌ 没有可兑换的礼物余额' });
      }

      const user = rows[0];
      const redeemAmount = Number(user.amount_gift);

      // หักยอดของขวัญเป็น 0
      await connection.query(
        `UPDATE users_custom_gift SET amount_gift = 0 WHERE id = ?`,
        [user.id]
      );

      await connection.commit();

      console.log(`✅ 兑换成功: user=${user.username}, amount=${redeemAmount}`);

      return res.json({
        success: true,
        redeemAmount,
        message: `✅ 兑换成功 +${redeemAmount} 元`,
        new_amount_gift: 0
      });

    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('兑换错误:', err);
    res.status(500).json({ success: false, message: '系统发生错误', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
  } finally {
    if (connection) connection.release();
  }
};

// ✅ Sync balance จาก AG เข้า MySQL
exports.syncBalance = async (req, res) => {
    const { playerId, balance } = req.body;
    if (!playerId) return res.json({ success: false, message: 'ไม่มี playerId' });
    
    try {
        await pool.query(`
            INSERT INTO player_balances (player_id, balance, updated_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                balance = VALUES(balance),
                updated_at = NOW()
        `, [playerId, balance ?? 0]);
        
        res.json({ success: true });
    } catch (error) {
        console.error('syncBalance error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ ดึง balance จาก MySQL
exports.getPlayerBalance = async (req, res) => {
    const { playerId } = req.params;
    if (!playerId) return res.json({ success: false, balance: 0 });
    
    try {
        const [rows] = await pool.query(
            'SELECT balance, total_deposit, total_withdraw FROM player_balances WHERE player_id = ?',
            [playerId]
        );
        
        if (rows.length === 0) return res.json({ success: false, balance: 0 });
        res.json({ success: true, ...rows[0] });
    } catch (error) {
        console.error('getPlayerBalance error:', error);
        res.json({ success: false, balance: 0 });
    }
};