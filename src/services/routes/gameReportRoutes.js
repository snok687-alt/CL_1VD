// routes/gameReportRoutes.js - API Routes สำหรับรายงานเกม
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const {
  fetchRealtimeRecords,
  fetchHistoryRecords,
  fetchCostSummary,
  saveGameRecords,
  generateDailyReport,
  getDailyReport,
  getOverallStats,
  getPlatformStats
} = require('../gameReportService');

/**
 * ดึงรายงานแบบเรียลไทม์ (10 นาทีล่าสุด)
 */
router.get('/realtime', async (req, res) => {
  try {
    const { currency = 'CNY', pageNo = 1, pageSize = 2000 } = req.query;
    
    const result = await fetchRealtimeRecords(currency, pageNo, pageSize);
    
    if (result.success) {
      // บันทึกลง database
      if (result.data.length > 0) {
        await saveGameRecords(result.data);
      }
      
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        pageNo: result.pageNo,
        pageSize: result.pageSize
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error fetching realtime records:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ดึงรายงานประวัติ (ระบุช่วงเวลา)
 */
router.get('/history', async (req, res) => {
  try {
    const { currency = 'CNY', startTime, endTime, pageNo = 1, pageSize = 2000 } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startTime และ endTime'
      });
    }
    
    const result = await fetchHistoryRecords(currency, startTime, endTime, pageNo, pageSize);
    
    if (result.success) {
      // บันทึกลง database
      if (result.data.length > 0) {
        await saveGameRecords(result.data);
      }
      
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        pageNo: result.pageNo,
        pageSize: result.pageSize
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error fetching history records:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ดึงสรุปต้นทุน
 */
router.get('/cost-summary', async (req, res) => {
  try {
    const { currency = 'CNY' } = req.query;
    
    const result = await fetchCostSummary(currency);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          model: result.model,
          totalCost: result.totalCost,
          costRatio: result.costRatio,
          platforms: result.ratios
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error fetching cost summary:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * สร้างรายงานรายวัน
 */
router.post('/generate-daily-report', async (req, res) => {
  try {
    const { date } = req.body;
    
    const result = await generateDailyReport(date);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'สร้างรายงานรายวันสำเร็จ',
        report: result.report
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error generating daily report:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ดึงรายงานรายวัน
 */
router.get('/daily-reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startDate และ endDate'
      });
    }
    
    const result = await getDailyReport(startDate, endDate);
    
    if (result.success) {
      res.json({
        success: true,
        reports: result.reports
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error fetching daily reports:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ดึงสถิติรวม
 */
router.get('/overall-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startDate และ endDate'
      });
    }
    
    const result = await getOverallStats(startDate, endDate);
    
    if (result.success) {
      res.json({
        success: true,
        stats: result.stats
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error fetching overall stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ดึงสถิติตามแพลตฟอร์ม
 */
router.get('/platform-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startDate และ endDate'
      });
    }
    
    const result = await getPlatformStats(startDate, endDate);
    
    if (result.success) {
      res.json({
        success: true,
        platforms: result.platforms
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error fetching platform stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ดึงรายงานตามผู้เล่น
 */
router.get('/player-report/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startDate และ endDate'
      });
    }
    
    const [gameStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_bets,
        SUM(bet_amount) as total_bet_amount,
        SUM(valid_amount) as total_valid_amount,
        SUM(settled_amount) as total_win_loss,
        plat_type,
        game_type
       FROM game_records
       WHERE player_id = ?
       AND DATE(bet_time) BETWEEN ? AND ?
       AND status = 1
       GROUP BY plat_type, game_type`,
      [playerId, startDate, endDate]
    );
    
    const [deposits] = await pool.query(
      `SELECT 
        COUNT(*) as total_deposits,
        SUM(cny_amount) as total_deposit_amount
       FROM crypto_deposits
       WHERE player_id = ?
       AND DATE(paid_at) BETWEEN ? AND ?
       AND status = 'paid'`,
      [playerId, startDate, endDate]
    );
    
    const [withdraws] = await pool.query(
      `SELECT 
        COUNT(*) as total_withdraws,
        SUM(cny_amount) as total_withdraw_amount
       FROM withdraw_requests
       WHERE player_id = ?
       AND DATE(processed_at) BETWEEN ? AND ?
       AND status = 'paid'`,
      [playerId, startDate, endDate]
    );
    
    res.json({
      success: true,
      playerId,
      period: { startDate, endDate },
      gameStats: gameStats,
      deposits: deposits[0] || { total_deposits: 0, total_deposit_amount: 0 },
      withdraws: withdraws[0] || { total_withdraws: 0, total_withdraw_amount: 0 }
    });
    
  } catch (err) {
    console.error('❌ Error fetching player report:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ดึงรายการเกมของผู้เล่น (รายละเอียด)
 */
router.get('/player-games/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { startDate, endDate, limit = 100, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startDate และ endDate'
      });
    }
    
    const [games] = await pool.query(
      `SELECT * FROM game_records
       WHERE player_id = ?
       AND DATE(bet_time) BETWEEN ? AND ?
       ORDER BY bet_time DESC
       LIMIT ? OFFSET ?`,
      [playerId, startDate, endDate, parseInt(limit), offset]
    );
    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM game_records
       WHERE player_id = ?
       AND DATE(bet_time) BETWEEN ? AND ?`,
      [playerId, startDate, endDate]
    );
    
    res.json({
      success: true,
      games: games,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
    
  } catch (err) {
    console.error('❌ Error fetching player games:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Dashboard Summary (ภาพรวมทั้งหมด)
 */
router.get('/dashboard-summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // สถิติวันนี้
    const [todayStats] = await pool.query(
      `SELECT * FROM daily_reports WHERE report_date = ?`,
      [today]
    );
    
    // สถิติเมื่อวาน
    const [yesterdayStats] = await pool.query(
      `SELECT * FROM daily_reports WHERE report_date = ?`,
      [yesterday]
    );
    
    // สถิติ 7 วันล่าสุด
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const [weekStats] = await pool.query(
      `SELECT 
        SUM(active_players) as total_active_players,
        SUM(total_bets) as total_bets,
        SUM(total_bet_amount) as total_bet_amount,
        SUM(gross_gaming_revenue) as total_ggr,
        SUM(net_revenue) as total_net_revenue
       FROM daily_reports
       WHERE report_date BETWEEN ? AND ?`,
      [sevenDaysAgo, today]
    );
    
    // ผู้เล่นออนไลน์ (ที่เล่นใน 30 นาทีล่าสุด)
    const [onlinePlayers] = await pool.query(
      `SELECT COUNT(DISTINCT player_id) as online_players
       FROM game_records
       WHERE last_update_time >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)`
    );
    
    // คำขอถอนเงินที่รอดำเนินการ
    const [pendingWithdraws] = await pool.query(
      `SELECT COUNT(*) as pending_count, SUM(cny_amount) as pending_amount
       FROM withdraw_requests
       WHERE status = 'pending'`
    );
    
    res.json({
      success: true,
      today: todayStats[0] || null,
      yesterday: yesterdayStats[0] || null,
      last7Days: weekStats[0] || null,
      realtime: {
        onlinePlayers: onlinePlayers[0].online_players || 0,
        pendingWithdraws: pendingWithdraws[0].pending_count || 0,
        pendingWithdrawAmount: parseFloat(pendingWithdraws[0].pending_amount || 0)
      }
    });
    
  } catch (err) {
    console.error('❌ Error fetching dashboard summary:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Top Players (ผู้เล่นที่เดิมพันสูงสุด)
 */
router.get('/top-players', async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startDate และ endDate'
      });
    }
    
    const [players] = await pool.query(
      `SELECT 
        player_id,
        COUNT(*) as total_bets,
        SUM(bet_amount) as total_bet_amount,
        SUM(valid_amount) as total_valid_amount,
        SUM(settled_amount) as total_win_loss
       FROM game_records
       WHERE DATE(bet_time) BETWEEN ? AND ?
       AND status = 1
       GROUP BY player_id
       ORDER BY total_valid_amount DESC
       LIMIT ?`,
      [startDate, endDate, parseInt(limit)]
    );
    
    res.json({
      success: true,
      players: players
    });
    
  } catch (err) {
    console.error('❌ Error fetching top players:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;