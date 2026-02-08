// gameReportService.js - ปรับปรุงให้แสดงข้อมูลที่ต้องการ
const { pool } = require('./config/db');

/**
 * ดึงข้อมูลรายงานผู้เล่นทั้งหมด (ไม่มี Filters)
 */
async function getAllPlayersSimpleReport() {
  try {
    const query = `
      SELECT 
        ga.player_id,
        ga.currency,
        ga.status AS account_status,
        ga.last_login,
        
        -- 🟢 Online Status
        CASE 
          WHEN ga.last_login IS NULL THEN 'NEVER LOGGED IN'
          WHEN ga.last_login > NOW() - INTERVAL 5 MINUTE THEN '🟢 ONLINE'
          WHEN ga.last_login > NOW() - INTERVAL 1 HOUR THEN '🟡 RECENT (1H)'
          WHEN ga.last_login > NOW() - INTERVAL 24 HOUR THEN '🟠 TODAY'
          ELSE '⚫ OFFLINE'
        END AS online_status,
        
        IFNULL(b.balance, 0) AS total_balance,
        IFNULL(p.total_bet, 0) AS total_cost,
        IFNULL(p.house_profit, 0) AS player_profit,
        IFNULL(d.deposit_times, 0) AS deposit_times,
        IFNULL(d.total_deposit, 0) AS total_deposit,
        IFNULL(w.withdraw_times, 0) AS withdraw_times,
        IFNULL(w.total_withdraw, 0) AS total_withdraw
        
      FROM game_accounts ga
        
      LEFT JOIN (
        SELECT player_id,
        SUM(CASE WHEN type='transfer_in' THEN amount ELSE -amount END) AS balance
        FROM transfers
        GROUP BY player_id
      ) b ON ga.player_id = b.player_id
        
      LEFT JOIN (
        SELECT player_id,
        SUM(valid_amount) AS total_bet,
        SUM(valid_amount - settled_amount) AS house_profit
        FROM game_records
        GROUP BY player_id
      ) p ON ga.player_id = p.player_id
        
      LEFT JOIN (
        SELECT player_id,
        COUNT(*) AS deposit_times,
        SUM(usdt_amount) AS total_deposit
        FROM crypto_deposits
        WHERE status='paid'
        GROUP BY player_id
      ) d ON ga.player_id = d.player_id
        
      LEFT JOIN (
        SELECT player_id,
        COUNT(*) AS withdraw_times,
        SUM(amount) AS total_withdraw
        FROM withdraw_requests
        WHERE status='paid'
        GROUP BY player_id
      ) w ON ga.player_id = w.player_id
        
      ORDER BY 
        CASE 
          WHEN ga.last_login > NOW() - INTERVAL 5 MINUTE THEN 1
          WHEN ga.last_login > NOW() - INTERVAL 1 HOUR THEN 2
          WHEN ga.last_login > NOW() - INTERVAL 24 HOUR THEN 3
          ELSE 4
        END,
        ga.last_login DESC
    `;
    
    const [players] = await pool.query(query);
    
    // คำนวณสรุปข้อมูล
    const summary = {
      total_players: players.length,
      online_players: players.filter(p => p.online_status === '🟢 ONLINE').length,
      recent_players: players.filter(p => p.online_status === '🟡 RECENT (1H)').length,
      today_players: players.filter(p => p.online_status === '🟠 TODAY').length,
      offline_players: players.filter(p => p.online_status === '⚫ OFFLINE').length,
      never_logged: players.filter(p => p.online_status === 'NEVER LOGGED IN').length,
      total_balance: players.reduce((sum, p) => sum + parseFloat(p.total_balance || 0), 0),
      total_profit: players.reduce((sum, p) => sum + parseFloat(p.player_profit || 0), 0),
      total_deposit: players.reduce((sum, p) => sum + parseFloat(p.total_deposit || 0), 0),
      total_withdraw: players.reduce((sum, p) => sum + parseFloat(p.total_withdraw || 0), 0),
      total_deposit_times: players.reduce((sum, p) => sum + parseInt(p.deposit_times || 0), 0),
      total_withdraw_times: players.reduce((sum, p) => sum + parseInt(p.withdraw_times || 0), 0)
    };
    
    return {
      success: true,
      players: players,
      summary: summary,
      generated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error getting all players simple report:', error);
    return { success: false, message: error.message };
  }
}

/**
 * ดึงเฉพาะผู้เล่นออนไลน์
 */
async function getOnlinePlayers() {
  try {
    const query = `
      SELECT 
        ga.player_id,
        ga.currency,
        ga.last_login,
        IFNULL(b.balance, 0) AS total_balance
      FROM game_accounts ga
      LEFT JOIN (
        SELECT player_id,
        SUM(CASE WHEN type='transfer_in' THEN amount ELSE -amount END) AS balance
        FROM transfers
        GROUP BY player_id
      ) b ON ga.player_id = b.player_id
      WHERE ga.last_login > NOW() - INTERVAL 5 MINUTE
      ORDER BY ga.last_login DESC
    `;
    
    const [onlinePlayers] = await pool.query(query);
    
    return {
      success: true,
      online_players: onlinePlayers,
      count: onlinePlayers.length,
      last_updated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error getting online players:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  getAllPlayersSimpleReport,
  getOnlinePlayers
};