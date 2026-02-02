// gameService.js - เชื่อมต่อกับ Game API จริง + บันทึก Database
const { pool } = require('./config/db');
const CryptoJS = require('crypto-js');

// API Configuration
const API_CONFIG = {
  baseUrl: '/api/game',
  sn: 'tnv',
  secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

/**
 * เรียก Game API พร้อม signature
 */
async function callGameAPI(action, payload) {
  try {
    const random = Math.random().toString(36).substring(2, 18);
    const signStr = `${random}${API_CONFIG.sn}${API_CONFIG.secret}`;
    const sign = CryptoJS.MD5(signStr).toString();

    const response = await fetch(`${API_CONFIG.baseUrl}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sn': API_CONFIG.sn,
        'random': random,
        'sign': sign
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Game API Error:', error);
    return { code: -1, msg: error.message, data: null };
  }
}

/**
 * เติมเงินเข้าบัญชีเกม (เรียก API จริง + บันทึก DB)
 */
async function transferAmount(playerId, platType, currency, type, amount, orderId) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    // ตรวจสอบว่า order_id นี้เคยโอนแล้วหรือไม่
    const [existing] = await conn.query(
      `SELECT id FROM transfers WHERE order_id = ? FOR UPDATE`,
      [orderId]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return { 
        success: false, 
        message: 'คำสั่งนี้ถูกประมวลผลแล้ว (Duplicate)',
        isDuplicate: true 
      };
    }

    // เรียก Game API เติมเงินจริง
    const result = await callGameAPI('transfer', {
      playerId: playerId.trim(),
      platType: platType,
      currency: currency,
      type: type,
      amount: amount,
      orderId: orderId
    });

    // ตรวจสอบผลลัพธ์จาก Game API
    if (result.code !== 10000) {
      await conn.rollback();
      return { 
        success: false, 
        message: result.msg || 'เติมเงินล้มเหลว',
        apiError: true,
        apiCode: result.code
      };
    }

    // บันทึกใน transfers table
    await conn.query(
      `INSERT INTO transfers
       (player_id, plat_type, currency, amount, type, order_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [playerId, platType, currency, amount, type, orderId]
    );

    await conn.commit();
    
    console.log(`✅ เติมเงินสำเร็จ: Player=${playerId}, Amount=${amount}, OrderId=${orderId}`);
    
    return { 
      success: true, 
      data: result.data,
      balance: result.data?.balance 
    };

  } catch (error) {
    await conn.rollback();
    console.error('❌ transferAmount Error:', error);
    return { 
      success: false, 
      message: error.message,
      error: true
    };
  } finally {
    conn.release();
  }
}

/**
 * ตรวจสอบว่า Player ID มีอยู่ในระบบเกมหรือไม่
 */
async function checkPlayerExists(playerId) {
  try {
    const result = await callGameAPI('gameUrl', {
      playerId: playerId.trim(),
      platType: 'ag',
      currency: 'CNY',
      gameType: '2',
      gameCode: 'CQSL',
      ingress: 'device2',
      lang: 'zh-hans'
    });

    return {
      exists: result.code === 10000,
      data: result.data,
      message: result.msg
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

/**
 * ตรวจสอบยอดเงินคงเหลือ
 */
async function queryBalance(playerId, platType = 'ag', currency = 'CNY') {
  try {
    const result = await callGameAPI('balance', {
      playerId: playerId.trim(),
      platType: platType,
      currency: currency
    });

    return {
      success: result.code === 10000,
      balance: result.data?.balance,
      message: result.msg
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { 
  transferAmount, 
  checkPlayerExists, 
  queryBalance,
  callGameAPI 
};