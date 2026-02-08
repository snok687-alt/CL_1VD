require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });
const { pool } = require('../config/db');

async function testLogs() {
  try {
    // Test 1: บันทึก game access
    console.log('Testing game access log...');
    const [result1] = await pool.execute(
      `INSERT INTO game_url_logs 
       (player_id, plat_type, game_type, game_code, ingress, url, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['test123', 'ag', '2', 'TESTGAME', 'device2', 'https://example.com', '127.0.0.1', 'Test Agent']
    );
    console.log('✅ Game access logged, ID:', result1.insertId);

    // Test 2: บันทึก demo access
    console.log('\nTesting demo access log...');
    const [result2] = await pool.execute(
      `INSERT INTO game_demo_logs 
       (plat_type, game_type, game_code, ingress, url, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['ag', '2', 'DEMOGAME', 'device2', 'https://demo.example.com', '127.0.0.1', 'Test Agent']
    );
    console.log('✅ Demo access logged, ID:', result2.insertId);

    // Test 3: บันทึก game code
    console.log('\nTesting game code sync...');
    const [result3] = await pool.execute(
      `INSERT INTO game_codes 
       (plat_type, game_type, game_code, ingress, game_name_json) 
       VALUES (?, ?, ?, ?, ?)`,
      ['ag', '2', 'NEWGAME', 'device2', JSON.stringify({ 'zh-hans': '测试游戏' })]
    );
    console.log('✅ Game code synced, ID:', result3.insertId);

    // Test 4: บันทึก quota
    console.log('\nTesting quota log...');
    const [result4] = await pool.execute(
      `INSERT INTO player_quota_logs 
       (currency, model, cost_ratio, total_quota, ratios_json) 
       VALUES (?, ?, ?, ?, ?)`,
      ['CNY', 'test_model', 1.5, 1000, JSON.stringify([{ type: 'bonus', ratio: 0.1 }])]
    );
    console.log('✅ Quota logged, ID:', result4.insertId);

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testLogs();