// gameReportService.js - ปรับปรุงให้แสดงข้อมูลที่ต้องการ
const { pool } = require('./config/db');
require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });

async function getAllPlayersSimpleReport() {
  try {
    const query = `
      SELECT 
        ga.player_id,
        ga.currency,
        ga.status AS account_status,
        ga.last_login,
        
        CASE 
          WHEN ga.last_login IS NULL THEN 'NEVER LOGGED IN'
          WHEN ga.last_login > NOW() - INTERVAL 5 MINUTE THEN '🟢 ONLINE'
          WHEN ga.last_login > NOW() - INTERVAL 1 HOUR THEN '🟡 RECENT (1H)'
          WHEN ga.last_login > NOW() - INTERVAL 24 HOUR THEN '🟠 TODAY'
          ELSE '⚫ OFFLINE'
        END AS online_status,
        
        IFNULL(pb.balance, 0) AS total_balance,
        IFNULL(pb.total_deposit, 0) AS total_deposit,
        IFNULL(pb.total_withdraw, 0) AS total_withdraw,
        IFNULL(d.deposit_times, 0) AS deposit_times,
        IFNULL(w.withdraw_times, 0) AS withdraw_times,
        IFNULL(p.total_bet, 0) AS total_cost,
        IFNULL(p.house_profit, 0) AS player_profit,
        IFNULL(g.redeemed_gift, 0) AS redeemed_gift,
        IFNULL(g.redeem_times, 0) AS redeem_times
        
      FROM game_accounts ga
      
      -- ✅ แก้ Collation ด้วย CONVERT
      LEFT JOIN player_balances pb 
        ON CONVERT(ga.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci 
         = CONVERT(pb.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci
        
      LEFT JOIN (
        SELECT player_id,
        SUM(valid_amount) AS total_bet,
        SUM(valid_amount - settled_amount) AS house_profit
        FROM game_records
        GROUP BY player_id
      ) p ON CONVERT(ga.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci 
           = CONVERT(p.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci
        
      LEFT JOIN (
        SELECT player_id,
        COUNT(*) AS deposit_times
        FROM crypto_deposits
        WHERE status = 'paid'
        GROUP BY player_id
      ) d ON CONVERT(ga.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci 
           = CONVERT(d.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci
        
      LEFT JOIN (
        SELECT player_id,
        COUNT(*) AS withdraw_times
        FROM withdraw_requests
        WHERE status IN ('completed', 'approved', 'paid')
        GROUP BY player_id
      ) w ON CONVERT(ga.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci 
           = CONVERT(w.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci
      
      LEFT JOIN (
        SELECT 
          player_id,
          SUM(amount) AS redeemed_gift,
          COUNT(*) AS redeem_times
        FROM transfers
        WHERE order_id LIKE 'gift_%'
          AND type = 'transfer_in'
        GROUP BY player_id
      ) g ON CONVERT(ga.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci 
           = CONVERT(g.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci
        
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
      total_withdraw_times: players.reduce((sum, p) => sum + parseInt(p.withdraw_times || 0), 0),
      total_redeemed_gift: players.reduce((sum, p) => sum + parseFloat(p.redeemed_gift || 0), 0),
      total_redeem_times: players.reduce((sum, p) => sum + parseInt(p.redeem_times || 0), 0),
      players_with_gift: players.filter(p => parseFloat(p.redeemed_gift || 0) > 0).length
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

async function getOnlinePlayers() {
  try {
    const query = `
      SELECT 
        ga.player_id,
        ga.currency,
        ga.last_login,
        IFNULL(pb.balance, 0) AS total_balance
      FROM game_accounts ga
      LEFT JOIN player_balances pb 
        ON CONVERT(ga.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci 
         = CONVERT(pb.player_id USING utf8mb4) COLLATE utf8mb4_unicode_ci
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

async function fetchRealtimeRecords() {
  try {
    console.log('🎮 Running realtime fetch...');
    return { success: true };
  } catch (error) {
    console.error('Realtime fetch error:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  getAllPlayersSimpleReport,
  getOnlinePlayers,
  fetchRealtimeRecords
};