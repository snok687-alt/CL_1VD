// tronWatcher.js - ตรวจสอบ USDT Transactions พร้อม Real-time Updates (FIXED)
const fetch = require('node-fetch');
const { pool } = require('./config/db');
const { transferAmount } = require('./gameService');

// Tron Network Config
const WALLET_ADDRESS = 'TTvu6ZR9BEyQZYQsHeYnF4HBsWhAyq8i3S';
const USDT_DECIMAL = 1_000_000;
const CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC20

let io = null; // Socket.io instance

/**
 * ตั้งค่า Socket.io instance
 */
function setSocketIO(socketIO) {
  io = socketIO;
  console.log('✅ Socket.IO initialized in tronWatcher');
}

/**
 * ดึงธุรกรรม USDT จาก TronGrid API (แบบ pagination)
 */
async function fetchUSDTTransactions(limit = 200, fingerprint = '') {
  try {
    let url = `https://api.trongrid.io/v1/accounts/${WALLET_ADDRESS}/transactions/trc20?limit=${limit}&only_confirmed=true`;

    if (fingerprint) {
      url += `&fingerprint=${fingerprint}`;
    }

    const response = await fetch(url, {
      headers: {
        'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`TronGrid API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || [],
      meta: data.meta || {}
    };
  } catch (error) {
    console.error('❌ Error fetching USDT transactions:', error);
    return { success: false, data: [], meta: {} };
  }
}

/**
 * ดึงธุรกรรมทั้งหมด (loop pagination)
 */
async function getAllUSDTTransactions() {
  let allTxs = [];
  let fingerprint = '';
  const limit = 200;
  let attempts = 0;
  const maxAttempts = 10; // ป้องกัน infinite loop

  while (attempts < maxAttempts) {
    const result = await fetchUSDTTransactions(limit, fingerprint);

    if (!result.success) break;
    if (result.data.length === 0) break;

    allTxs = allTxs.concat(result.data);

    if (result.data.length < limit) break;
    if (!result.meta.fingerprint) break;

    fingerprint = result.meta.fingerprint;
    attempts++;
  }

  console.log(`📊 ดึงธุรกรรม USDT ทั้งหมด: ${allTxs.length} รายการ`);
  return allTxs;
}

/**
 * ฟังก์ชันหลัก: ตรวจสอบการโอน USDT และเติมเงินอัตโนมัติ
 */
async function checkUSDTTransfers() {
  console.log('🔍 [TRON WATCHER] เริ่มตรวจสอบการโอน USDT...');

  try {
    // 1. ดึงคำสั่งฝากที่รอดำเนินการ
    const [pendingOrders] = await pool.query(
      `SELECT * FROM crypto_deposits 
       WHERE status = 'pending' 
       AND expires_at > NOW()
       ORDER BY created_at ASC
       LIMIT 100`
    );

    if (pendingOrders.length === 0) {
      console.log('📭 ไม่มีคำสั่งฝากรอดำเนินการ');
      await updateExpiredOrders();
      return;
    }

    console.log(`📋 พบคำสั่งฝาก ${pendingOrders.length} รายการรอตรวจสอบ`);

    // 2. ดึงธุรกรรม USDT ทั้งหมด
    const allTxs = await getAllUSDTTransactions();

    // 3. กรองเฉพาะธุรกรรม USDT ที่โอนเข้า Wallet
    const usdtTransfers = allTxs.filter(tx => {
      return tx.token_info &&
        tx.token_info.symbol === 'USDT' &&
        tx.type === 'Transfer' &&
        tx.to === WALLET_ADDRESS &&
        tx.contract_address === CONTRACT_ADDRESS;
    });

    console.log(`💰 พบธุรกรรม USDT ${usdtTransfers.length} รายการ`);

    // ✅ Debug: แสดงธุรกรรมล่าสุด
    if (usdtTransfers.length > 0) {
      console.log('📊 ธุรกรรม USDT ล่าสุด:');
      usdtTransfers.slice(0, 5).forEach((tx, i) => {
        const amount = Number(tx.value) / USDT_DECIMAL;
        const time = new Date(tx.block_timestamp);
        console.log(`  ${i+1}. ${amount} USDT at ${time.toLocaleString()}`);
        console.log(`     From: ${tx.from}`);
        console.log(`     TX: ${tx.transaction_id}`);
      });
    }

    // 4. ตรวจสอบแต่ละคำสั่งฝาก
    for (const order of pendingOrders) {
      await processOrder(order, usdtTransfers);
    }

    // 5. อัปเดตคำสั่งหมดอายุ
    await updateExpiredOrders();

    console.log('✅ [TRON WATCHER] ตรวจสอบเสร็จสิ้น\n');

  } catch (error) {
    console.error('❌ [TRON WATCHER] ข้อผิดพลาด:', error);
  }
}

/**
 * ประมวลผลคำสั่งฝากแต่ละรายการ
 */
async function processOrder(order, usdtTransfers) {
  console.log(`🔎 ตรวจสอบ Order: ${order.order_id} (${order.usdt_amount} USDT → ${order.cny_amount} CNY)`);

  // หาธุรกรรมที่ตรงกับคำสั่ง
  const matchedTx = findMatchingTransaction(order, usdtTransfers);

  if (!matchedTx) {
    console.log(`⏳ ยังไม่พบธุรกรรมตรงกับ Order: ${order.order_id}`);
    return;
  }

  console.log(`✅ พบธุรกรรมตรงกับ Order: ${order.order_id}`);
  console.log(`   TX Hash: ${matchedTx.transaction_id}`);
  console.log(`   Amount: ${Number(matchedTx.value) / USDT_DECIMAL} USDT`);

  // ใช้ DB Transaction เพื่อป้องกัน race condition
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ตรวจสอบซ้ำว่ายังไม่ถูกประมวลผล
    const [existingCheck] = await conn.query(
      `SELECT id, status FROM crypto_deposits 
       WHERE order_id = ? FOR UPDATE`,
      [order.order_id]
    );

    if (!existingCheck.length || existingCheck[0].status !== 'pending') {
      console.log(`⚠️ Order ${order.order_id} ถูกประมวลผลแล้ว`);
      await conn.rollback();
      conn.release();
      return;
    }

    // ตรวจสอบว่า tx_hash นี้ยังไม่ถูกใช้
    const [txCheck] = await conn.query(
      `SELECT id FROM crypto_deposits WHERE tx_hash = ?`,
      [matchedTx.transaction_id]
    );

    if (txCheck.length > 0) {
      console.log(`⚠️ TX Hash ${matchedTx.transaction_id} ถูกใช้แล้ว`);
      await conn.rollback();
      conn.release();
      return;
    }

    // เติมเงินเข้าเกม
    const transferResult = await transferAmount(
      order.player_id,
      'ag',
      'CNY',
      '1', // type = deposit
      order.cny_amount,
      order.order_id
    );

    if (!transferResult.success) {
      console.error(`❌ เติมเงินล้มเหลว Order: ${order.order_id}`, transferResult.message);

      // อัปเดตสถานะเป็น failed
      await conn.query(
        `UPDATE crypto_deposits 
         SET tx_hash = ?, paid_at = NOW() 
         WHERE id = ?`,
        [matchedTx.transaction_id, order.id]
      );

      await conn.rollback();
      conn.release();

      // แจ้งเตือน admin
      notifyAdmin('deposit_failed', {
        orderId: order.order_id,
        playerId: order.player_id,
        amount: order.cny_amount,
        error: transferResult.message
      });

      return;
    }

    // อัปเดตสถานะเป็น paid
    await conn.query(
      `UPDATE crypto_deposits 
       SET status = 'paid', tx_hash = ?, paid_at = NOW() 
       WHERE id = ?`,
      [matchedTx.transaction_id, order.id]
    );

    await conn.commit();

    console.log(`✅ เติมเงินสำเร็จ Order: ${order.order_id}`);
    console.log(`   Player: ${order.player_id}`);
    console.log(`   Amount: ${order.cny_amount} CNY`);
    console.log(`   Balance: ${transferResult.balance || 'N/A'}`);

    // ส่ง Real-time Notification
    notifyUser('deposit_confirmed', {
      orderId: order.order_id,
      playerId: order.player_id,
      cnyAmount: order.cny_amount,
      usdtAmount: order.usdt_amount,
      txHash: matchedTx.transaction_id,
      balance: transferResult.balance
    });

  } catch (error) {
    console.error('❌ DB Transaction Error:', error);
    await conn.rollback();
  } finally {
    conn.release();
  }
}

/**
 * หาธุรกรรมที่ตรงกับคำสั่งฝาก
 */
function findMatchingTransaction(order, usdtTransfers) {
  console.log(`\n🔍 Looking for: ${order.usdt_amount} USDT (Order: ${order.order_id})`);
  
  const matches = [];
  
  for (const tx of usdtTransfers) {
    try {
      const txValue = Number(tx.value) / USDT_DECIMAL;
      const orderValue = Number(order.usdt_amount);
      const diff = Math.abs(txValue - orderValue);

      // ตรวจสอบเวลา
      const txTime = new Date(tx.block_timestamp);
      const orderTime = new Date(order.created_at);
      const timeMatch = txTime > orderTime;

      // ตรวจสอบจำนวนเงิน (ยอมรับความคลาดเคลื่อน 0.001 USDT)
      const amountMatch = diff <= 0.001;

      console.log(`  Checking TX: ${txValue} USDT (diff: ${diff.toFixed(6)})`);
      console.log(`    Time: ${txTime.toLocaleString()} ${timeMatch ? '✓' : '✗'}`);
      console.log(`    Amount: ${amountMatch ? '✓' : '✗'}`);

      if (amountMatch && timeMatch) {
        matches.push({ tx, diff });
      }

    } catch (error) {
      console.error('  Error processing TX:', error.message);
    }
  }

  if (matches.length === 0) {
    console.log(`  ❌ No matching transaction found`);
    return null;
  }

  // เลือกธุรกรรมที่ใกล้เคียงที่สุด
  matches.sort((a, b) => a.diff - b.diff);
  const best = matches[0];
  
  console.log(`  ✅ Best match found: ${Number(best.tx.value) / USDT_DECIMAL} USDT`);
  console.log(`     TX Hash: ${best.tx.transaction_id}`);
  
  return best.tx;
}

/**
 * อัปเดตคำสั่งที่หมดอายุ
 */
async function updateExpiredOrders() {
  try {
    const [result] = await pool.query(
      `UPDATE crypto_deposits 
       SET status = 'expired' 
       WHERE status = 'pending' 
       AND expires_at <= NOW()`
    );

    if (result.affectedRows > 0) {
      console.log(`⏰ อัปเดตคำสั่งฝากหมดอายุ: ${result.affectedRows} รายการ`);
    }
  } catch (error) {
    console.error('❌ Error updating expired orders:', error);
  }
}

/**
 * ส่ง Real-time Notification ให้ผู้ใช้
 */
function notifyUser(event, data) {
  if (!io) return;

  // ส่งไปยัง room ของ player
  io.to(`player_${data.playerId}`).emit(event, data);

  // ส่ง broadcast ทั่วไป
  io.emit(event, {
    orderId: data.orderId,
    timestamp: new Date().toISOString()
  });

  console.log(`📡 Sent notification: ${event} to player_${data.playerId}`);
}

/**
 * แจ้งเตือน Admin
 */
function notifyAdmin(event, data) {
  if (!io) return;

  io.to('admin').emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  });

  console.log(`📡 Sent admin notification: ${event}`);
}

/**
 * ตรวจสอบ Health ของ TronGrid API
 */
async function checkAPIHealth() {
  try {
    const result = await fetchUSDTTransactions(1);
    return result.success;
  } catch {
    return false;
  }
}

function getHealthStatus() {
  return {
    isHealthy: true,
    consecutiveFailures: 0,
    cacheSize: 0
  };
}

module.exports = {
  checkUSDTTransfers,
  setSocketIO,
  checkAPIHealth,
  getAllUSDTTransactions,
  getHealthStatus
};