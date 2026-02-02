// test-watcher.js
require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });
const { pool } = require('../config/db');
const { checkUSDTTransfers } = require('../tronWatcher');

async function testWatcher() {
    try {
        console.log('🧪 Testing Tron Watcher...\n');
        console.log('API Key:', process.env.TRONGRID_API_KEY ? '✅ Found' : '❌ Missing');
        console.log('Wallet:', 'TUxW6pYAXygoTQV99dts59BgZEsCF2j4t9\n');

        // รัน watcher 1 รอบ
        await checkUSDTTransfers();

        console.log('\n✅ Watcher completed');

        // ตรวจสอบผลลัพธ์
        const [results] = await pool.query(
            `SELECT * FROM crypto_deposits 
            WHERE paid_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)  
            OR created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
            ORDER BY created_at DESC`
        );

        if (results.length > 0) {
            console.log(`\n📊 Orders updated in last minute: ${results.length}`);
            results.forEach(order => {
                console.log(`- ${order.order_id}: ${order.status}`);
            });
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testWatcher();