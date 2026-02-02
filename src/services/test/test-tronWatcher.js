require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });
const { checkUSDTTransfers } = require('../tronWatcher');

async function testUSDT() {
  console.log('🚀 เริ่มทดสอบ TronWatcher');
  await checkUSDTTransfers();
  console.log('✅ Test เสร็จสิ้น');
}

testUSDT();
