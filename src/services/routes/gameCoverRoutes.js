// routes/gameCoverRoutes.js
// ✅ ไม่ส่งรูป default - เฉพาะเกมที่มีรูปปกจริงเท่านั้น

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * GET /backend-api/game-covers/cover/:gameCode
 * ดึงรูปปกเกมตัวเดียว (ถ้าไม่มีรูป ส่ง null)
 */
router.get('/cover/:gameCode', async (req, res) => {
  try {
    const { gameCode } = req.params;
    const connection = await pool.getConnection();
    
    const [covers] = await connection.query(
      'SELECT * FROM game_covers WHERE game_code = ?',
      [gameCode]
    );
    connection.release();
    
    if (covers.length > 0) {
      const cover = covers[0];
      return res.json({
        code: 10000,
        msg: 'Success',
        data: {
          gameCode: cover.game_code,
          imageUrl: cover.image_url,
          gameName: cover.game_name,
          gameType: cover.game_type,
          platType: cover.plat_type
        }
      });
    }
    
    // ✅ ถ้าไม่มีรูป ส่ง null แทนที่จะส่ง default
    res.json({
      code: 10001,
      msg: 'Cover not found',
      data: null
    });
  } catch (error) {
    console.error('Error fetching cover:', error);
    res.status(500).json({
      code: 10001,
      msg: 'Server error',
      data: null
    });
  }
});

/**
 * POST /backend-api/game-covers/covers
 * ดึงรูปปกหลายเกมพร้อมกัน (batch)
 * ✅ ส่งเฉพาะเกมที่มีรูปปกจริง
 */
router.post('/covers', async (req, res) => {
  try {
    const { gameCodes } = req.body;
    
    if (!Array.isArray(gameCodes) || gameCodes.length === 0) {
      return res.json({
        code: 10405,
        msg: 'gameCodes is required (array)',
        data: []
      });
    }
    
    const connection = await pool.getConnection();
    
    const placeholders = gameCodes.map(() => '?').join(',');
    const [covers] = await connection.query(
      `SELECT * FROM game_covers WHERE game_code IN (${placeholders})`,
      gameCodes
    );
    connection.release();
    
    // ✅ ส่งเฉพาะเกมที่มีข้อมูล (ไม่มี default)
    const result = covers.map(c => ({
      gameCode: c.game_code,
      imageUrl: c.image_url,
      gameName: c.game_name,
      gameType: c.game_type,
      platType: c.plat_type
    }));
    
    res.json({
      code: 10000,
      msg: 'Success',
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching covers:', error);
    res.status(500).json({
      code: 10001,
      msg: 'Server error',
      data: []
    });
  }
});

/**
 * GET /backend-api/game-covers/all
 * ดึงรูปปกทั้งหมด (เฉพาะเกมที่มีรูป)
 */
router.get('/all', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [covers] = await connection.query(
      'SELECT * FROM game_covers WHERE status = 1 AND image_url IS NOT NULL AND image_url != "" ORDER BY game_name ASC'
    );
    connection.release();
    
    const result = covers.map(c => ({
      gameCode: c.game_code,
      imageUrl: c.image_url,
      gameName: c.game_name,
      gameType: c.game_type,
      platType: c.plat_type
    }));
    
    res.json({
      code: 10000,
      msg: 'Success',
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching all covers:', error);
    res.status(500).json({
      code: 10001,
      msg: 'Server error',
      data: []
    });
  }
});

/**
 * GET /backend-api/game-covers/by-type/:gameType
 * ดึงรูปปกตามประเภทเกม (เฉพาะเกมที่มีรูป)
 */
router.get('/by-type/:gameType', async (req, res) => {
  try {
    const { gameType } = req.params;
    const connection = await pool.getConnection();
    
    const [covers] = await connection.query(
      'SELECT * FROM game_covers WHERE game_type = ? AND status = 1 AND image_url IS NOT NULL AND image_url != "" ORDER BY game_name ASC',
      [gameType]
    );
    connection.release();
    
    const result = covers.map(c => ({
      gameCode: c.game_code,
      imageUrl: c.image_url,
      gameName: c.game_name,
      gameType: c.game_type,
      platType: c.plat_type
    }));
    
    res.json({
      code: 10000,
      msg: 'Success',
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching covers by type:', error);
    res.status(500).json({
      code: 10001,
      msg: 'Server error',
      data: []
    });
  }
});

/**
 * GET /backend-api/game-covers/stats
 * ดึงสถิติจำนวนเกมที่มีรูปปก
 */
router.get('/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [stats] = await connection.query(
      'SELECT game_type, COUNT(*) as count FROM game_covers WHERE status = 1 AND image_url IS NOT NULL AND image_url != "" GROUP BY game_type ORDER BY game_type'
    );
    
    const [total] = await connection.query(
      'SELECT COUNT(*) as total FROM game_covers WHERE status = 1 AND image_url IS NOT NULL AND image_url != ""'
    );
    
    connection.release();
    
    res.json({
      code: 10000,
      msg: 'Success',
      data: {
        total: total[0].total,
        byType: stats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      code: 10001,
      msg: 'Server error',
      data: null
    });
  }
});

module.exports = router;