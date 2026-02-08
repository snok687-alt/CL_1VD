require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });
const { pool } = require('../config/db');

async function checkData() {
  try {
    console.log('📊 ตรวจสอบข้อมูลในฐานข้อมูล...\n');

    // 1. ตรวจสอบ game_url_logs
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 1. ตาราง game_url_logs (การเข้าเล่นเกม)');
    console.log('═══════════════════════════════════════════════════════');
    const [logs] = await pool.execute(`
      SELECT 
        id,
        player_id,
        plat_type,
        game_type,
        game_code,
        ingress,
        ip_address,
        SUBSTRING(user_agent, 1, 30) as user_agent_short,
        created_at
      FROM game_url_logs 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    if (logs.length > 0) {
      console.table(logs);
      console.log(`✅ พบข้อมูล ${logs.length} รายการ\n`);
    } else {
      console.log('⚠️  ยังไม่มีข้อมูล\n');
    }

    // 2. ตรวจสอบ game_demo_logs
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 2. ตาราง game_demo_logs (การทดลองเล่น)');
    console.log('═══════════════════════════════════════════════════════');
    const [demoLogs] = await pool.execute(`
      SELECT 
        id,
        plat_type,
        game_type,
        game_code,
        ingress,
        ip_address,
        SUBSTRING(user_agent, 1, 30) as user_agent_short,
        created_at
      FROM game_demo_logs 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    if (demoLogs.length > 0) {
      console.table(demoLogs);
      console.log(`✅ พบข้อมูล ${demoLogs.length} รายการ\n`);
    } else {
      console.log('⚠️  ยังไม่มีข้อมูล\n');
    }

    // 3. ตรวจสอบ game_codes (แก้ไขการ parse JSON)
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 3. ตาราง game_codes (Master ข้อมูลเกม)');
    console.log('═══════════════════════════════════════════════════════');
    const [codes] = await pool.execute(`
      SELECT 
        id,
        plat_type,
        game_type,
        game_code,
        ingress,
        game_name_json,
        created_at,
        updated_at
      FROM game_codes 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    if (codes.length > 0) {
      // ✅ แก้ไข: ตรวจสอบ JSON ก่อน parse
      const codesDisplay = codes.map(row => {
        let gameName = 'N/A';
        try {
          // ตรวจสอบว่า game_name_json เป็น string หรือ object
          const nameJson = typeof row.game_name_json === 'string' 
            ? JSON.parse(row.game_name_json) 
            : row.game_name_json;
          gameName = nameJson['zh-hans'] || nameJson['en'] || 'N/A';
        } catch (err) {
          gameName = 'Invalid JSON';
        }
        
        return {
          id: row.id,
          plat_type: row.plat_type,
          game_type: row.game_type,
          game_code: row.game_code,
          game_name: gameName,
          created_at: row.created_at
        };
      });
      
      console.table(codesDisplay);
      console.log(`✅ พบข้อมูล ${codes.length} รายการ\n`);
    } else {
      console.log('⚠️  ยังไม่มีข้อมูล\n');
    }

    // 4. ตรวจสอบ player_quota_logs
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 4. ตาราง player_quota_logs (บันทึก Quota)');
    console.log('═══════════════════════════════════════════════════════');
    const [quotas] = await pool.execute(`
      SELECT 
        id,
        currency,
        model,
        cost_ratio,
        total_quota,
        ratios_json,
        created_at
      FROM player_quota_logs 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    if (quotas.length > 0) {
      console.table(quotas);
      console.log(`✅ พบข้อมูล ${quotas.length} รายการ\n`);
    } else {
      console.log('⚠️  ยังไม่มีข้อมูล\n');
    }

    // 5. สรุปสถิติรวม
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 สรุปสถิติรวม');
    console.log('═══════════════════════════════════════════════════════');
    
    const [summary] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM game_url_logs) as total_game_plays,
        (SELECT COUNT(*) FROM game_demo_logs) as total_demo_plays,
        (SELECT COUNT(*) FROM game_codes) as total_games,
        (SELECT COUNT(*) FROM player_quota_logs) as total_quotas,
        (SELECT COUNT(DISTINCT player_id) FROM game_url_logs) as unique_players
    `);
    
    console.log('');
    console.log(`🎮 การเล่นเกม (game_url_logs):     ${summary[0].total_game_plays} ครั้ง`);
    console.log(`👁️  การทดลองเล่น (game_demo_logs): ${summary[0].total_demo_plays} ครั้ง`);
    console.log(`📚 จำนวนเกม (game_codes):         ${summary[0].total_games} เกม`);
    console.log(`💰 บันทึก Quota (quota_logs):     ${summary[0].total_quotas} รายการ`);
    console.log(`👥 ผู้เล่นทั้งหมด:                 ${summary[0].unique_players} คน`);
    console.log('');

    // 6. ✅ เพิ่ม: แสดงข้อมูลผู้เล่นที่ Active
    console.log('═══════════════════════════════════════════════════════');
    console.log('👥 ผู้เล่นที่ Active');
    console.log('═══════════════════════════════════════════════════════');
    
    const [activePlayers] = await pool.execute(`
      SELECT 
        player_id,
        COUNT(*) as play_count,
        COUNT(DISTINCT game_code) as unique_games,
        MAX(created_at) as last_play,
        MIN(created_at) as first_play
      FROM game_url_logs
      GROUP BY player_id
      ORDER BY play_count DESC
      LIMIT 10
    `);
    
    if (activePlayers.length > 0) {
      console.table(activePlayers.map(p => ({
        player_id: p.player_id,
        play_count: p.play_count,
        unique_games: p.unique_games,
        last_play: new Date(p.last_play).toLocaleString('th-TH')
      })));
    } else {
      console.log('⚠️  ยังไม่มีผู้เล่น\n');
    }

    // 7. ✅ เพิ่ม: เกมยอดนิยม
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎮 เกมยอดนิยม Top 10');
    console.log('═══════════════════════════════════════════════════════');
    
    const [topGames] = await pool.execute(`
      SELECT 
        game_code,
        COUNT(*) as play_count,
        COUNT(DISTINCT player_id) as unique_players
      FROM game_url_logs
      GROUP BY game_code
      ORDER BY play_count DESC
      LIMIT 10
    `);
    
    if (topGames.length > 0) {
      console.table(topGames);
    } else {
      console.log('⚠️  ยังไม่มีข้อมูล\n');
    }

    await pool.end();
    console.log('✅ ตรวจสอบเสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkData();