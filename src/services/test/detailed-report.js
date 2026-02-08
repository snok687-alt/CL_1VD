require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });
const { pool } = require('../config/db');

async function detailedReport() {
  try {
    console.log('\n📊 ═══════════════════════════════════════════════════════');
    console.log('📊 รายงานละเอียด - วิเคราะห์พฤติกรรมผู้เล่น');
    console.log('📊 ═══════════════════════════════════════════════════════\n');

    // 1. รายงานผู้เล่นแต่ละคน
    const [players] = await pool.execute(`
      SELECT DISTINCT player_id 
      FROM game_url_logs 
      ORDER BY player_id
    `);

    for (const player of players) {
      console.log(`\n👤 ผู้เล่น: ${player.player_id}`);
      console.log('─────────────────────────────────────────────────────────');
      
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_plays,
          COUNT(DISTINCT game_code) as unique_games,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          MIN(created_at) as first_play,
          MAX(created_at) as last_play
        FROM game_url_logs
        WHERE player_id = ?
      `, [player.player_id]);

      console.log(`📊 สถิติรวม:`);
      console.log(`   - เล่นทั้งหมด: ${stats[0].total_plays} ครั้ง`);
      console.log(`   - เกมที่ไม่ซ้ำ: ${stats[0].unique_games} เกม`);
      console.log(`   - วันที่ Active: ${stats[0].active_days} วัน`);
      console.log(`   - เล่นครั้งแรก: ${new Date(stats[0].first_play).toLocaleString('th-TH')}`);
      console.log(`   - เล่นล่าสุด: ${new Date(stats[0].last_play).toLocaleString('th-TH')}`);

      const [games] = await pool.execute(`
        SELECT 
          game_code,
          COUNT(*) as play_count,
          MAX(created_at) as last_played
        FROM game_url_logs
        WHERE player_id = ?
        GROUP BY game_code
        ORDER BY play_count DESC
      `, [player.player_id]);

      console.log(`\n🎮 เกมที่เล่น:`);
      games.forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.game_code} - ${g.play_count} ครั้ง (ล่าสุด: ${new Date(g.last_played).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })})`);
      });
    }

    // 2. การเล่นแบบ Timeline
    console.log('\n\n📅 Timeline การเล่นเกม (10 รายการล่าสุด)');
    console.log('═══════════════════════════════════════════════════════');
    
    const [timeline] = await pool.execute(`
      SELECT 
        player_id,
        game_code,
        ingress,
        created_at
      FROM game_url_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);

    timeline.forEach(t => {
      const time = new Date(t.created_at).toLocaleString('th-TH');
      const device = t.ingress === 'device1' ? '💻 PC' : '📱 Mobile';
      console.log(`${time} - ${t.player_id} เล่น ${t.game_code} ${device}`);
    });

    await pool.end();
    console.log('\n✅ รายงานเสร็จสิ้น!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

detailedReport();