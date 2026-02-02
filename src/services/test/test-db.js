// test-db.js
const mysql = require('mysql2/promise');

async function testDB() {
  try {
    console.log('🧪 Testing Database Connection...\n');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '76964665Kkonn_',
      database: 'star'
    });

    console.log('✅ Database connected!\n');

    // ตรวจสอบ pending orders
    const [pending] = await connection.query(
      `SELECT * FROM crypto_deposits 
       WHERE status = 'pending' 
       ORDER BY created_at DESC 
       LIMIT 5`
    );

    console.log(`📋 Pending Orders: ${pending.length} รายการ\n`);
    
    pending.forEach(order => {
      console.log(`Order ID: ${order.order_id}`);
      console.log(`Player: ${order.player_id}`);
      console.log(`Amount: ${order.usdt_amount} USDT → ${order.cny_amount} CNY`);
      console.log(`Created: ${order.created_at}`);
      console.log(`Expires: ${order.expires_at}`);
      console.log('---');
    });

    // ตรวจสอบ paid orders
    const [paid] = await connection.query(
      `SELECT * FROM crypto_deposits 
       WHERE status = 'paid' 
       ORDER BY created_at DESC 
       LIMIT 3`
    );

    console.log(`\n✅ Paid Orders: ${paid.length} รายการ\n`);

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDB();