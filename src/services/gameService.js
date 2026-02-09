// gameService.js - เชื่อมต่อกับ Game API จริง + บันทึก Database (COMPLETE VERSION)
const { pool } = require('./config/db');
const CryptoJS = require('crypto-js');
const loggerBase = require('./logger');
const logger = new loggerBase.Logger('game-service'); // ✅ ต้อง new


// API Configuration
const API_CONFIG = {
  baseUrl: '/api/game',
  sn: 'tnv',
  secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

// ✅ API Health Tracking
let apiHealth = {
  isHealthy: true,
  consecutiveFailures: 0,
  lastSuccessTime: Date.now(),
  lastFailureTime: null
};

const MAX_CONSECUTIVE_FAILURES = 5;

/**
 * ✅ เรียก Game API พร้อม signature
 */
async function callGameAPI(action, payload) {
  const startTime = Date.now();

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
      // ✅ ลบ timeout ออก
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    // ✅ Update health status on success
    apiHealth.isHealthy = true;
    apiHealth.consecutiveFailures = 0;
    apiHealth.lastSuccessTime = Date.now();

    logger.debug(`Game API call success: ${action}`, {
      action,
      latency,
      code: result.code
    });

    return {
      success: result.code === 10000,
      data: result.data,
      message: result.msg,
      code: result.code,
      latency
    };

  } catch (error) {
    const latency = Date.now() - startTime;

    // ✅ Update health status on failure
    apiHealth.consecutiveFailures++;
    apiHealth.lastFailureTime = Date.now();

    if (apiHealth.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      apiHealth.isHealthy = false;
      logger.error('Game API marked as unhealthy', {
        consecutiveFailures: apiHealth.consecutiveFailures
      });
    }

    logger.error('Game API Error', {
      action,
      error: error.message,
      latency
    });

    return {
      success: false,
      message: error.message,
      data: null,
      code: -1,
      latency
    };
  }
}

/**
 * ✅ ซิงค์ยอดเงินจาก Game API ไปยัง Database
 */
async function syncPlayerBalance(playerId) {
  const conn = await pool.getConnection();

  try {
    logger.info(`Syncing balance for player: ${playerId}`);

    // 1. ดึงยอดเงินจาก Game API
    const balanceResult = await callGameAPI('balance', {
      playerId: playerId.trim(),
      platType: 'ag',
      currency: 'CNY'
    });

    if (!balanceResult.success) {
      logger.warn('Failed to fetch balance from Game API', {
        playerId,
        message: balanceResult.message
      });

      return {
        success: false,
        message: balanceResult.message || 'ไม่สามารถดึงยอดเงินจาก Game API ได้'
      };
    }

    const gameBalance = parseFloat(balanceResult.data?.balance || 0);

    await conn.beginTransaction();

    // 2. ตรวจสอบว่ามีบัญชีใน player_balances หรือไม่
    const [existing] = await conn.query(
      `SELECT id, balance FROM player_balances WHERE player_id = ? FOR UPDATE`,
      [playerId]
    );

    if (existing.length === 0) {
      // สร้างบัญชีใหม่
      await conn.query(
        `INSERT INTO player_balances (player_id, balance, locked_balance) 
         VALUES (?, ?, 0)`,
        [playerId, gameBalance]
      );

      logger.info('Created new player balance', {
        playerId,
        balance: gameBalance
      });
    } else {
      // อัปเดตยอดเงิน
      await conn.query(
        `UPDATE player_balances SET balance = ?, updated_at = NOW() 
         WHERE player_id = ?`,
        [gameBalance, playerId]
      );

      logger.info('Updated player balance', {
        playerId,
        oldBalance: existing[0].balance,
        newBalance: gameBalance
      });
    }

    await conn.commit();

    return {
      success: true,
      balance: gameBalance
    };

  } catch (error) {
    await conn.rollback();
    logger.error('Error syncing player balance', {
      playerId,
      error: error.message
    });

    return {
      success: false,
      message: error.message
    };
  } finally {
    conn.release();
  }
}

/**
 * ✅ ดึงยอดเงินคงเหลือของผู้เล่น (พร้อม auto-sync option)
 */
async function getPlayerBalance(playerId, autoSync = true) {
  try {
    // ถ้าเปิด autoSync ให้ซิงค์ก่อน
    if (autoSync) {
      await syncPlayerBalance(playerId);
    }

    const [rows] = await pool.query(
      `SELECT balance, locked_balance FROM player_balances WHERE player_id = ?`,
      [playerId]
    );

    if (rows.length === 0) {
      // ถ้ายังไม่มีบัญชี ลองซิงค์
      const syncResult = await syncPlayerBalance(playerId);

      if (syncResult.success) {
        return {
          success: true,
          balance: syncResult.balance,
          lockedBalance: 0,
          availableBalance: syncResult.balance
        };
      }

      return {
        success: false,
        message: 'ไม่พบบัญชีผู้เล่น'
      };
    }

    const balance = parseFloat(rows[0].balance);
    const lockedBalance = parseFloat(rows[0].locked_balance);

    return {
      success: true,
      balance,
      lockedBalance,
      availableBalance: balance - lockedBalance
    };

  } catch (error) {
    logger.error('Error getting player balance', {
      playerId,
      error: error.message
    });

    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * ✅ เติมเงินเข้าบัญชีเกม (เรียก API จริง + บันทึก DB)
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
      logger.warn('Duplicate transfer attempt', { orderId, playerId });

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
    if (!result.success) {
      await conn.rollback();
      logger.error('Game API transfer failed', {
        playerId,
        amount,
        orderId,
        message: result.message,
        code: result.code
      });

      return {
        success: false,
        message: result.message || 'เติมเงินล้มเหลว',
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

    logger.info('Transfer successful', {
      playerId,
      amount,
      type: type === '1' ? 'deposit' : 'withdraw',
      orderId
    });

    // ✅ ซิงค์ยอดเงินหลังจากโอนสำเร็จ
    await syncPlayerBalance(playerId);

    return {
      success: true,
      data: result.data,
      balance: result.data?.balance
    };

  } catch (error) {
    await conn.rollback();
    logger.error('transferAmount Error', {
      playerId,
      orderId,
      error: error.message
    });

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
 * ✅ ตรวจสอบว่า Player ID มีอยู่ในระบบเกมหรือไม่
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
      exists: result.success,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

/**
 * ✅ ตรวจสอบยอดเงินคงเหลือจาก Game API
 */
async function queryBalance(playerId, platType = 'ag', currency = 'CNY') {
  try {
    const result = await callGameAPI('balance', {
      playerId: playerId.trim(),
      platType: platType,
      currency: currency
    });

    return {
      success: result.success,
      balance: result.data?.balance,
      message: result.message
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * ✅ ทดสอบการเชื่อมต่อกับ Game API
 */
async function testConnection() {
  const startTime = Date.now();

  try {
    const result = await callGameAPI('balance', {
      playerId: 'test123',
      platType: 'ag',
      currency: 'CNY'
    });

    return {
      success: true,
      latency: Date.now() - startTime,
      healthy: apiHealth.isHealthy
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      healthy: false,
      error: error.message
    };
  }
}

/**
 * ✅ ดึงสถานะสุขภาพของ Game API
 */
function getAPIHealth() {
  return {
    ...apiHealth,
    uptime: Date.now() - (apiHealth.lastSuccessTime || Date.now())
  };
}

module.exports = {
  transferAmount,
  checkPlayerExists,
  queryBalance,
  callGameAPI,
  syncPlayerBalance,
  getPlayerBalance,
  testConnection,
  getAPIHealth
};