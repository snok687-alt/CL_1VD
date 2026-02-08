const { pool } = require('../config/db');

const GameAccountController = {
  // ✅ ตรวจสอบว่ามีบัญชีเกมในระบบหรือไม่
  checkGameAccount: async (req, res) => {
    try {
      const { playerId } = req.query;
      
      if (!playerId) {
        return res.status(400).json({ 
          success: false, 
          message: '缺少玩家账号' 
        });
      }

      const [rows] = await pool.query(
        `SELECT id, player_id, plat_type, currency, status, created_at, last_login 
         FROM game_accounts 
         WHERE player_id = ? AND status = 'active'`,
        [playerId]
      );

      if (rows.length === 0) {
        return res.json({ 
          success: true, 
          exists: false,
          message: '账号不存在'
        });
      }

      const account = rows[0];
      return res.json({
        success: true,
        exists: true,
        account: {
          playerId: account.player_id,
          platType: account.plat_type,
          currency: account.currency,
          status: account.status,
          createdAt: account.created_at,
          lastLogin: account.last_login
        }
      });

    } catch (err) {
      console.error('检查游戏账号错误:', err);
      res.status(500).json({ 
        success: false, 
        message: '系统错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // ✅ บันทึกบัญชีเกมใหม่
  createGameAccount: async (req, res) => {
    let connection;
    try {
      const { playerId, platType = 'ag', currency = 'CNY' } = req.body;

      if (!playerId || !/^[a-z0-9]{5,11}$/.test(playerId)) {
        return res.status(400).json({ 
          success: false, 
          message: '玩家账号格式不正确 (5-11位小写字母和数字)' 
        });
      }

      connection = await pool.getConnection();
      await connection.beginTransaction();

      // ตรวจสอบว่ามีอยู่แล้วหรือไม่
      const [existing] = await connection.query(
        'SELECT id FROM game_accounts WHERE player_id = ?',
        [playerId]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: '玩家账号已存在' 
        });
      }

      // สร้างบัญชีใหม่
      const [result] = await connection.query(
        `INSERT INTO game_accounts (player_id, plat_type, currency, status, created_at, last_login)
         VALUES (?, ?, ?, 'active', NOW(), NOW())`,
        [playerId, platType, currency]
      );

      await connection.commit();

      res.json({
        success: true,
        message: '游戏账号创建成功',
        accountId: result.insertId,
        playerId,
        platType,
        currency,
        createdAt: new Date().toISOString()
      });

    } catch (err) {
      if (connection) await connection.rollback();
      console.error('创建游戏账号错误:', err);
      
      let message = '系统错误';
      if (err.code === 'ER_DUP_ENTRY') {
        message = '玩家账号已存在';
      } else if (err.code === 'ER_NO_REFERENCED_ROW') {
        message = '相关数据不存在';
      }

      res.status(500).json({ 
        success: false, 
        message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    } finally {
      if (connection) connection.release();
    }
  },

  // ✅ อัปเดตเวลาล็อกอินล่าสุด
  updateLastLogin: async (req, res) => {
    try {
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({ 
          success: false, 
          message: '缺少玩家账号' 
        });
      }

      await pool.query(
        'UPDATE game_accounts SET last_login = NOW() WHERE player_id = ?',
        [playerId]
      );

      res.json({
        success: true,
        message: '登录时间已更新'
      });

    } catch (err) {
      console.error('更新登录时间错误:', err);
      res.status(500).json({ 
        success: false, 
        message: '系统错误'
      });
    }
  },

  // ✅ ดึงข้อมูลบัญชีเกมทั้งหมด (สำหรับ admin)
  getAllAccounts: async (req, res) => {
    try {
      const { page = 1, limit = 50, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, player_id, plat_type, currency, status, 
               created_at, updated_at, last_login
        FROM game_accounts
        WHERE status = 'active'
      `;
      
      let params = [];

      if (search) {
        query += ' AND player_id LIKE ?';
        params.push(`%${search}%`);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(query, params);

      // นับจำนวนทั้งหมด
      let countQuery = 'SELECT COUNT(*) as total FROM game_accounts WHERE status = "active"';
      let countParams = [];

      if (search) {
        countQuery += ' AND player_id LIKE ?';
        countParams.push(`%${search}%`);
      }

      const [countResult] = await pool.query(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (err) {
      console.error('获取游戏账号列表错误:', err);
      res.status(500).json({ 
        success: false, 
        message: '系统错误'
      });
    }
  },

  // ✅ เปลี่ยนสถานะบัญชี (suspend/activate/delete)
  updateAccountStatus: async (req, res) => {
    let connection;
    try {
      const { playerId, status } = req.body;

      if (!playerId || !['active', 'suspended', 'deleted'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: '参数无效' 
        });
      }

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [result] = await connection.query(
        'UPDATE game_accounts SET status = ?, updated_at = NOW() WHERE player_id = ?',
        [status, playerId]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          success: false, 
          message: '账号不存在' 
        });
      }

      await connection.commit();

      res.json({
        success: true,
        message: `账号状态已更新为 ${status}`
      });

    } catch (err) {
      if (connection) await connection.rollback();
      console.error('更新账号状态错误:', err);
      res.status(500).json({ 
        success: false, 
        message: '系统错误'
      });
    } finally {
      if (connection) connection.release();
    }
  }
};

module.exports = GameAccountController;