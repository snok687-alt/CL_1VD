const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// ✅ บันทึกการเข้าถึงเกม (game_url_logs)
router.post('/logs/game-access', async (req, res) => {
  try {
    const { 
      playerId, 
      platType, 
      gameType, 
      gameCode, 
      ingress, 
      url, 
      returnUrl, 
      ipAddress, 
      userAgent 
    } = req.body;

    // Validate required fields
    if (!playerId || !platType || !gameType || !gameCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: playerId, platType, gameType, gameCode' 
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO game_url_logs 
       (player_id, plat_type, game_type, game_code, ingress, url, return_url, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        playerId, 
        platType, 
        gameType, 
        gameCode, 
        ingress || 'device2',
        url?.substring(0, 2000) || '', 
        returnUrl?.substring(0, 1000) || '', 
        ipAddress?.substring(0, 50) || 'unknown', 
        userAgent?.substring(0, 1000) || 'unknown'
      ]
    );

    console.log(`✅ Game access logged: ${playerId} -> ${gameCode}`);
    
    res.json({ 
      success: true, 
      message: 'Game access logged', 
      logId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error logging game access:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ บันทึกการทดลองเล่น (game_demo_logs)
router.post('/logs/game-demo', async (req, res) => {
  console.log('🔍 Received demo log request:', req.body);
  
  try {
    const { 
      platType, 
      gameType, 
      gameCode, 
      ingress, 
      url, 
      returnUrl, 
      ipAddress, 
      userAgent 
    } = req.body;

    // Validate required fields
    if (!platType || !gameType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: platType, gameType' 
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO game_demo_logs 
       (plat_type, game_type, game_code, ingress, url, return_url, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        platType,
        gameType,
        gameCode || '',
        ingress || 'device2',
        url?.substring(0, 2000) || '',
        returnUrl?.substring(0, 1000) || '',
        ipAddress?.substring(0, 50) || 'unknown',
        userAgent?.substring(0, 1000) || 'unknown'
      ]
    );

    console.log(`✅ Demo access logged: ${gameCode || 'lobby'} (${platType})`);

    res.json({ 
      success: true, 
      message: 'Demo access logged', 
      logId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error logging demo access:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ Sync ข้อมูลเกม (game_codes)
router.post('/game/sync-codes', async (req, res) => {
  try {
    const { platType, games } = req.body;

    if (!platType || !Array.isArray(games)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: platType and games array required'
      });
    }

    let synced = 0;
    let updated = 0;

    for (const game of games) {
      if (!game.gameCode) continue;

      // ตรวจสอบว่ามีอยู่แล้วหรือไม่
      const [existing] = await pool.execute(
        'SELECT id FROM game_codes WHERE plat_type = ? AND game_code = ?',
        [platType, game.gameCode]
      );

      if (existing.length > 0) {
        // Update
        await pool.execute(
          `UPDATE game_codes 
           SET game_type = ?, ingress = ?, game_name_json = ?, updated_at = NOW() 
           WHERE plat_type = ? AND game_code = ?`,
          [
            game.gameType || '2',
            game.ingress || 'device2',
            JSON.stringify(game.gameName || { 'zh-hans': game.gameCode }),
            platType,
            game.gameCode
          ]
        );
        updated++;
      } else {
        // Insert
        await pool.execute(
          `INSERT INTO game_codes 
           (plat_type, game_type, game_code, ingress, game_name_json, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            platType,
            game.gameType || '2',
            game.gameCode,
            game.ingress || 'device2',
            JSON.stringify(game.gameName || { 'zh-hans': game.gameCode })
          ]
        );
        synced++;
      }
    }

    console.log(`✅ Game codes synced: ${synced} new, ${updated} updated`);

    res.json({ 
      success: true, 
      message: `Synced ${synced + updated} games for ${platType}`,
      new: synced,
      updated: updated
    });
  } catch (error) {
    console.error('❌ Error syncing game codes:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ บันทึกโควต้า (player_quota_logs)
router.post('/logs/quota', async (req, res) => {
  try {
    const { currency, model, costRatio, totalQuota, ratios } = req.body;

    if (!currency || !model) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: currency, model'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO player_quota_logs 
       (currency, model, cost_ratio, total_quota, ratios_json, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        currency,
        model,
        costRatio || 0,
        totalQuota || 0,
        JSON.stringify(ratios || [])
      ]
    );

    console.log(`✅ Quota logged: ${currency} - ${model}`);

    res.json({ 
      success: true, 
      message: 'Quota data logged', 
      logId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error logging quota:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ ดึงสถิติการเข้าถึงเกม
router.get('/logs/game-stats', async (req, res) => {
  try {
    const { startDate, endDate, playerId, platType } = req.query;

    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_access,
        COUNT(DISTINCT player_id) as unique_players,
        plat_type,
        game_type,
        game_code
      FROM game_url_logs 
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }

    if (playerId) {
      query += ' AND player_id = ?';
      params.push(playerId);
    }

    if (platType) {
      query += ' AND plat_type = ?';
      params.push(platType);
    }

    query += ' GROUP BY DATE(created_at), plat_type, game_type, game_code ORDER BY date DESC LIMIT 1000';

    const [stats] = await pool.execute(query, params);

    res.json({ 
      success: true, 
      data: stats,
      count: stats.length
    });
  } catch (error) {
    console.error('❌ Error fetching game stats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ ดึงสถิติ Demo Game
router.get('/logs/demo-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_demos,
        plat_type,
        game_type
      FROM game_demo_logs 
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY DATE(created_at), plat_type, game_type ORDER BY date DESC LIMIT 1000';

    const [stats] = await pool.execute(query, params);

    res.json({ 
      success: true, 
      data: stats,
      count: stats.length
    });
  } catch (error) {
    console.error('❌ Error fetching demo stats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;