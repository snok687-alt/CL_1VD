// test-tron.js
const fetch = require('node-fetch');

const WALLET_ADDRESS = 'TUxW6pYAXygoTQV99dts59BgZEsCF2j4t9';
const API_KEY = '42466df3-8303-4987-8dad-4994db87779a';

async function testTronAPI() {
  try {
    console.log('🧪 Testing TronGrid API...\n');
    
    const url = `https://api.trongrid.io/v1/accounts/${WALLET_ADDRESS}/transactions/trc20?limit=10&only_confirmed=true`;
    
    const response = await fetch(url, {
      headers: {
        'TRON-PRO-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ API Key ใช้งานได้!');
    console.log(`📊 พบธุรกรรมทั้งหมด: ${data.data?.length || 0} รายการ\n`);
    
    // แสดง USDT transactions
    const usdtTxs = data.data.filter(tx => 
      tx.token_info?.symbol === 'USDT' && 
      tx.to === WALLET_ADDRESS
    );
    
    console.log(`💰 USDT Deposits: ${usdtTxs.length} รายการ\n`);
    
    if (usdtTxs.length > 0) {
      console.log('รายการล่าสุด:');
      usdtTxs.slice(0, 5).forEach((tx, i) => {
        const amount = Number(tx.value) / 1_000_000;
        const time = new Date(tx.block_timestamp);
        console.log(`${i+1}. ${amount} USDT`);
        console.log(`   Time: ${time.toLocaleString()}`);
        console.log(`   From: ${tx.from}`);
        console.log(`   TX: ${tx.transaction_id}\n`);
      });
    } else {
      console.log('⚠️  ยังไม่มีการโอน USDT เข้า wallet นี้');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTronAPI();