// gameReportService.js - Service สำหรับดึงและประมวลผลข้อมูลเกม
const crypto = require('crypto');
const { pool } = require('./config/db');

// ดึงค่าจาก environment
const API_SN = process.env.API_SN;
const API_SECRET = process.env.API_SECRET;
const API_BASE_URL = process.env.API_BASE_URL || 'https://ap.api-bet.net';

/**
 * สร้าง signature สำหรับเรียก API
 */
function generateSignature() {
  const random = Math.random().toString(36).substring(2, 18);
  const signStr = `${random}${API_SN}${API_SECRET}`;
  const sign = crypto.createHash('md5').update(signStr).digest('hex');
  
  return { random, sign };
}

/**
 * เรียก Game API
 */
async function callGameAPI(endpoint, payload) {
  try {
    const { random, sign } = generateSignature();
    
    const response = await fetch(`${API_BASE_URL}/api/server/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sn': API_SN,
        'random': random,
        'sign': sign
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
}

/**
 * ดึงรายงานแบบเรียลไทม์ (10 นาทีล่าสุด)
 */
async function fetchRealtimeRecords(currency = 'CNY', pageNo = 1, pageSize = 2000) {
  const result = await callGameAPI('recordAll', {
    currency,
    pageNo: String(pageNo),
    pageSize: String(pageSize)
  });
  
  if (result.code === 10000) {
    return {
      success: true,
      data: result.data?.list || [],
      total: result.data?.total || 0,
      pageNo: result.data?.pageNo || 1,
      pageSize: result.data?.pageSize || pageSize
    };
  }
  
  return { success: false, message: result.msg, data: [] };
}

/**
 * ดึงรายงานประวัติ (ระบุช่วงเวลา)
 */
async function fetchHistoryRecords(currency, startTime, endTime, pageNo = 1, pageSize = 2000) {
  const result = await callGameAPI('recordHistory', {
    currency,
    startTime,
    endTime,
    pageNo: String(pageNo),
    pageSize: String(pageSize)
  });
  
  if (result.code === 10000) {
    return {
      success: true,
      data: result.data?.list || [],
      total: result.data?.total || 0,
      pageNo: result.data?.pageNo || 1,
      pageSize: result.data?.pageSize || pageSize
    };
  }
  
  return { success: false, message: result.msg, data: [] };
}

/**
 * ดึงสรุปต้นทุน
 */
async function fetchCostSummary(currency = 'CNY') {
  const result = await callGameAPI('costSummary', { currency });
  
  if (result.code === 10000) {
    return {
      success: true,
      model: result.data?.model,
      totalCost: result.data?.[currency] || 0,
      costRatio: result.data?.costRatio || 1,
      ratios: result.data?.ratios || []
    };
  }
  
  return { success: false, message: result.msg };
}

/**
 * บันทึกข้อมูลเกมลง database
 */
async function saveGameRecords(records) {
  if (!records || records.length === 0) return { saved: 0, skipped: 0 };
  
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    let saved = 0;
    let skipped = 0;
    
    for (const record of records) {
      try {
        await conn.query(
          `INSERT INTO game_records 
           (player_id, plat_type, currency, game_type, game_name, game_code,
            round, table_no, seat_no, bet_amount, valid_amount, settled_amount,
            bet_content, status, game_order_id, bet_time, last_update_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            settled_amount = VALUES(settled_amount),
            status = VALUES(status),
            last_update_time = VALUES(last_update_time),
            updated_at = NOW()`,
          [
            record.playerId,
            record.platType,
            record.currency,
            record.gameType,
            record.gameName,
            record.gameCode || null,
            record.round,
            record.table || null,
            record.seat || null,
            record.betAmount,
            record.validAmount,
            record.settledAmount,
            record.betContent,
            record.status,
            record.gameOrderId,
            record.betTime,
            record.lastUpdateTime
          ]
        );
        saved++;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          console.error('❌ Error saving record:', err);
        }
        skipped++;
      }
    }
    
    await conn.commit();
    return { saved, skipped };
    
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * สรุปรายงานรายวัน
 */
async function generateDailyReport(date) {
  const conn = await pool.getConnection();
  
  try {
    const reportDate = date || new Date().toISOString().split('T')[0];
    
    await conn.beginTransaction();
    
    // 1. สรุปข้อมูลเกม
    const [gameStats] = await conn.query(
      `SELECT 
        COUNT(DISTINCT player_id) as active_players,
        COUNT(*) as total_bets,
        SUM(bet_amount) as total_bet_amount,
        SUM(valid_amount) as total_valid_amount,
        SUM(settled_amount) as total_win_loss
       FROM game_records
       WHERE DATE(bet_time) = ?
       AND status = 1`,
      [reportDate]
    );
    
    // 2. สรุปข้อมูลฝาก
    const [depositStats] = await conn.query(
      `SELECT 
        SUM(cny_amount) as total_deposits,
        COUNT(DISTINCT player_id) as deposit_players
       FROM crypto_deposits
       WHERE DATE(paid_at) = ?
       AND status = 'paid'`,
      [reportDate]
    );
    
    // 3. สรุปข้อมูลถอน
    const [withdrawStats] = await conn.query(
      `SELECT 
        SUM(cny_amount) as total_withdraws,
        COUNT(DISTINCT player_id) as withdraw_players
       FROM withdraw_requests
       WHERE DATE(processed_at) = ?
       AND status = 'paid'`,
      [reportDate]
    );
    
    // 4. คำนวณค่าคอมมิชชั่น
    const [platformCosts] = await conn.query(
      `SELECT 
        gr.plat_type,
        SUM(gr.valid_amount) as total_valid,
        pcr.commission_rate,
        SUM(gr.valid_amount * pcr.commission_rate) as platform_cost
       FROM game_records gr
       LEFT JOIN platform_commission_rates pcr ON gr.plat_type = pcr.plat_type
       WHERE DATE(gr.bet_time) = ?
       AND gr.status = 1
       GROUP BY gr.plat_type`,
      [reportDate]
    );
    
    const totalPlatformCost = platformCosts.reduce((sum, p) => sum + parseFloat(p.platform_cost || 0), 0);
    
    // 5. คำนวณรายได้
    const totalWinLoss = parseFloat(gameStats[0].total_win_loss || 0);
    const grossGamingRevenue = -totalWinLoss; // ผู้เล่นแพ้ = บริษัทได้
    const netRevenue = grossGamingRevenue - totalPlatformCost;
    
    // 6. บันทึกรายงาน
    await conn.query(
      `INSERT INTO daily_reports 
       (report_date, active_players, total_bets, total_bet_amount, 
        total_valid_amount, total_win_loss, total_deposits, total_withdraws,
        gross_gaming_revenue, platform_cost, net_revenue)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        active_players = VALUES(active_players),
        total_bets = VALUES(total_bets),
        total_bet_amount = VALUES(total_bet_amount),
        total_valid_amount = VALUES(total_valid_amount),
        total_win_loss = VALUES(total_win_loss),
        total_deposits = VALUES(total_deposits),
        total_withdraws = VALUES(total_withdraws),
        gross_gaming_revenue = VALUES(gross_gaming_revenue),
        platform_cost = VALUES(platform_cost),
        net_revenue = VALUES(net_revenue),
        updated_at = NOW()`,
      [
        reportDate,
        gameStats[0].active_players || 0,
        gameStats[0].total_bets || 0,
        gameStats[0].total_bet_amount || 0,
        gameStats[0].total_valid_amount || 0,
        totalWinLoss,
        depositStats[0]?.total_deposits || 0,
        withdrawStats[0]?.total_withdraws || 0,
        grossGamingRevenue,
        totalPlatformCost,
        netRevenue
      ]
    );
    
    // 7. บันทึกรายงานตามแพลตฟอร์ม
    for (const platform of platformCosts) {
      await conn.query(
        `INSERT INTO platform_daily_stats
         (report_date, plat_type, total_valid_amount, platform_cost, cost_ratio)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          total_valid_amount = VALUES(total_valid_amount),
          platform_cost = VALUES(platform_cost),
          cost_ratio = VALUES(cost_ratio),
          updated_at = NOW()`,
        [
          reportDate,
          platform.plat_type,
          platform.total_valid || 0,
          platform.platform_cost || 0,
          platform.commission_rate || 0
        ]
      );
    }
    
    await conn.commit();
    
    return {
      success: true,
      report: {
        date: reportDate,
        activePlayers: gameStats[0].active_players || 0,
        totalBets: gameStats[0].total_bets || 0,
        totalBetAmount: parseFloat(gameStats[0].total_bet_amount || 0),
        totalValidAmount: parseFloat(gameStats[0].total_valid_amount || 0),
        totalWinLoss: totalWinLoss,
        totalDeposits: parseFloat(depositStats[0]?.total_deposits || 0),
        totalWithdraws: parseFloat(withdrawStats[0]?.total_withdraws || 0),
        grossGamingRevenue: grossGamingRevenue,
        platformCost: totalPlatformCost,
        netRevenue: netRevenue
      }
    };
    
  } catch (err) {
    await conn.rollback();
    console.error('❌ Error generating daily report:', err);
    return { success: false, message: err.message };
  } finally {
    conn.release();
  }
}

/**
 * ดึงรายงานรายวัน
 */
async function getDailyReport(startDate, endDate) {
  try {
    const [reports] = await pool.query(
      `SELECT * FROM daily_reports 
       WHERE report_date BETWEEN ? AND ?
       ORDER BY report_date DESC`,
      [startDate, endDate]
    );
    
    return {
      success: true,
      reports: reports
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * ดึงสถิติรวม
 */
async function getOverallStats(startDate, endDate) {
  try {
    const [stats] = await pool.query(
      `SELECT 
        SUM(active_players) as total_active_players,
        SUM(total_bets) as total_bets,
        SUM(total_bet_amount) as total_bet_amount,
        SUM(total_valid_amount) as total_valid_amount,
        SUM(total_win_loss) as total_win_loss,
        SUM(total_deposits) as total_deposits,
        SUM(total_withdraws) as total_withdraws,
        SUM(gross_gaming_revenue) as total_ggr,
        SUM(platform_cost) as total_cost,
        SUM(net_revenue) as total_net_revenue
       FROM daily_reports
       WHERE report_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    
    return {
      success: true,
      stats: stats[0]
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * ดึงสถิติตามแพลตฟอร์ม
 */
async function getPlatformStats(startDate, endDate) {
  try {
    const [stats] = await pool.query(
      `SELECT 
        plat_type,
        SUM(total_valid_amount) as total_valid_amount,
        SUM(platform_cost) as total_cost,
        AVG(cost_ratio) as avg_cost_ratio
       FROM platform_daily_stats
       WHERE report_date BETWEEN ? AND ?
       GROUP BY plat_type
       ORDER BY total_valid_amount DESC`,
      [startDate, endDate]
    );
    
    return {
      success: true,
      platforms: stats
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = {
  callGameAPI,
  fetchRealtimeRecords,
  fetchHistoryRecords,
  fetchCostSummary,
  saveGameRecords,
  generateDailyReport,
  getDailyReport,
  getOverallStats,
  getPlatformStats
};