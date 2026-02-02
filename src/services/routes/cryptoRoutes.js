// cryptoRoutes.js - API Routes สำหรับระบบ Crypto Payment (UPDATED)
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Configuration
const USDT_ADDRESS = 'TTvu6ZR9BEyQZYQsHeYnF4HBsWhAyq8i3S';
const FIX_RATE = 7.2; // 1 USDT = 7.2 CNY
const MIN_USDT = 1.388889; // ประมาณ 10 CNY / 7.2 (10 ยวนขั้นต่ำ)
const MIN_CNY = 10; // ✅ แก้ไขเป็น 10 ยวน (ขั้นต่ำใหม่)
const ORDER_EXPIRY_MINUTES = 30;


// ⚙️ ตั้งค่าว่าจะตรวจสอบ Player ID หรือไม่
const VERIFY_PLAYER_ID = process.env.VERIFY_PLAYER_ID === 'true'; // default: false

/**
 * สร้างคำสั่งฝาก USDT
 */
router.post('/create-order', async (req, res) => {
  try {
    const { playerId, cnyAmount } = req.body;
    
    // Validate input
    if (!playerId || !cnyAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณาระบุ playerId และ cnyAmount' 
      });
    }

    if (cnyAmount < MIN_CNY) {
      return res.status(400).json({ 
        success: false, 
        message: `จำนวนเงินขั้นต่ำ ${MIN_CNY} CNY` 
      });
    }
    
    // คำนวณ USDT
    const baseUsdtAmount = cnyAmount / FIX_RATE;
    
    // ✅ เพิ่ม random decimal เพื่อให้ไม่ซ้ำกัน
    const randomCents = Math.floor(Math.random() * 1000) / 1000000;
    const usdtAmount = (baseUsdtAmount + randomCents).toFixed(6);
    
    const orderId = `USDT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    await pool.query(
      `INSERT INTO crypto_deposits
       (player_id, order_id, cny_amount, usdt_amount, wallet_address, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [playerId, orderId, cnyAmount, usdtAmount, USDT_ADDRESS]
    );
    
    res.json({
      success: true,
      orderId,
      usdtAmount: parseFloat(usdtAmount),
      walletAddress: USDT_ADDRESS
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
});

/**
 * ตรวจสอบสถานะคำสั่งฝาก (✅ เพิ่มการตรวจสอบ playerId)
 */
// cryptoRoutes.js - ฟังก์ชัน check-order เสร็จสมบูรณ์
router.get('/check-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { playerId } = req.query; // รับ playerId จาก frontend

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ orderId'
      });
    }

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ playerId'
      });
    }

    // ตรวจสอบรูปแบบ orderId (ป้องกัน SQL injection)
    const orderIdRegex = /^USDT_\d+_\d+$/;
    if (!orderIdRegex.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'รูปแบบ orderId ไม่ถูกต้อง'
      });
    }

    // ตรวจสอบว่า order เป็นของผู้เล่นคนนี้
    const [rows] = await pool.query(
      `SELECT * FROM crypto_deposits 
       WHERE order_id = ? AND player_id = ?`,
      [orderId, playerId]
    );

    if (rows.length === 0) {
      console.warn(`⚠️ ผู้เล่น ${playerId} พยายามเข้าถึง order ${orderId} ที่ไม่ใช่ของตัวเอง`);
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งนี้หรือไม่ใช่ของคุณ'
      });
    }

    const order = rows[0];
    
    // คำนวณเวลาที่เหลือ
    const now = new Date();
    const createdAt = new Date(order.created_at);
    const expiresAt = new Date(createdAt.getTime() + (ORDER_EXPIRY_MINUTES * 60 * 1000));
    const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const isExpired = remainingSeconds === 0 && order.status === 'pending';

    // อัปเดตถ้าหมดอายุ
    if (isExpired && order.status === 'pending') {
      await pool.query(
        `UPDATE crypto_deposits SET status = 'expired', updated_at = NOW() WHERE id = ?`,
        [order.id]
      );
      order.status = 'expired';
      
      console.log(`🕒 Order ${orderId} หมดอายุแล้ว (ผู้เล่น: ${playerId})`);
    }

    // เตรียมข้อมูล response
    const responseData = {
      success: true,
      orderId: order.order_id,
      playerId: order.player_id, // ✅ ส่งกลับ playerId ให้ frontend ตรวจสอบ
      status: order.status,
      cnyAmount: parseFloat(order.cny_amount),
      usdtAmount: parseFloat(order.usdt_amount),
      walletAddress: order.wallet_address,
      txHash: order.tx_hash,
      createdAt: order.created_at,
      paidAt: order.paid_at,
      expiresAt: expiresAt.toISOString(),
      remainingSeconds,
      isExpired: order.status === 'expired',
      canRetry: order.status === 'expired',
      rate: FIX_RATE
    };

    // Log สำหรับ debugging (เฉพาะใน development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Order check: ${orderId} (Player: ${playerId}, Status: ${order.status})`);
    }

    res.json(responseData);

  } catch (error) {
    console.error('❌ Error checking order:', error);
    
    // ส่ง error message ที่เหมาะสม
    let errorMessage = 'เกิดข้อผิดพลาดในการตรวจสอบคำสั่ง';
    let statusCode = 500;
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'ตาราง crypto_deposits ไม่พบ กรุณาติดตั้งฐานข้อมูล';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้';
      statusCode = 503;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
/**
 * ดึงประวัติการฝากของผู้เล่น (✅ Filter ตาม playerId เสมอ)
 */
router.get('/deposit-history/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 50, page = 1, status } = req.query;
    const offset = (page - 1) * limit;

    // ✅ ต้องระบุ playerId เสมอ
    let query = `SELECT * FROM crypto_deposits WHERE player_id = ?`;
    let countQuery = `SELECT COUNT(*) as total FROM crypto_deposits WHERE player_id = ?`;
    const params = [playerId];

    // Filter by status
    if (status && ['pending', 'paid', 'expired'].includes(status)) {
      query += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, status ? [playerId, status] : [playerId]);

    res.json({
      success: true,
      deposits: rows.map(row => ({
        orderId: row.order_id,
        cnyAmount: parseFloat(row.cny_amount),
        usdtAmount: parseFloat(row.usdt_amount),
        status: row.status,
        txHash: row.tx_hash,
        createdAt: row.created_at,
        paidAt: row.paid_at,
        expiresAt: row.expires_at
      })),
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching deposit history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงประวัติ' 
    });
  }
});

/**
 * ดึงสถิติการฝากของผู้เล่น (✅ Filter ตาม playerId)
 */
router.get('/deposit-stats/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidOrders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expiredOrders,
        SUM(CASE WHEN status = 'paid' THEN cny_amount ELSE 0 END) as totalCNY,
        SUM(CASE WHEN status = 'paid' THEN usdt_amount ELSE 0 END) as totalUSDT
       FROM crypto_deposits 
       WHERE player_id = ?`,
      [playerId]
    );

    res.json({
      success: true,
      stats: {
        totalOrders: stats[0].totalOrders,
        paidOrders: stats[0].paidOrders,
        pendingOrders: stats[0].pendingOrders,
        expiredOrders: stats[0].expiredOrders,
        totalCNY: parseFloat(stats[0].totalCNY) || 0,
        totalUSDT: parseFloat(stats[0].totalUSDT) || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ' 
    });
  }
});

/**
 * ยกเลิกคำสั่งฝาก (✅ ตรวจสอบว่าเป็นของผู้เล่นคนนี้)
 */
router.post('/cancel-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { playerId } = req.body; // ✅ รับ playerId จาก body

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ playerId'
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM crypto_deposits WHERE order_id = ? AND player_id = ?`,
      [orderId, playerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบคำสั่งนี้หรือไม่ใช่ของคุณ' 
      });
    }

    const order = rows[0];

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถยกเลิกได้ สถานะปัจจุบัน: ${order.status}`
      });
    }

    await pool.query(
      `UPDATE crypto_deposits SET status = 'expired' WHERE id = ?`,
      [order.id]
    );

    res.json({
      success: true,
      message: 'ยกเลิกคำสั่งเรียบร้อย',
      orderId
    });

  } catch (error) {
    console.error('❌ Error canceling order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการยกเลิกคำสั่ง' 
    });
  }
});

/**
 * ✅ ยกเลิกคำสั่งฝาก pending ทั้งหมดของผู้เล่น (เมื่อ logout)
 */
router.post('/cancel-all-pending', async (req, res) => {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ playerId'
      });
    }

    // อัปเดตคำสั่ง pending ทั้งหมดเป็น cancelled
    const [result] = await pool.query(
      `UPDATE crypto_deposits 
       SET status = 'cancelled' 
       WHERE player_id = ? 
       AND status = 'pending'`,
      [playerId]
    );

    console.log(`✅ ยกเลิกคำสั่ง ${result.affectedRows} รายการของ ${playerId}`);

    res.json({
      success: true,
      message: `ยกเลิกคำสั่ง ${result.affectedRows} รายการเรียบร้อย`,
      cancelledCount: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Error canceling all pending orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการยกเลิกคำสั่ง' 
    });
  }
});

/**
 * ดึงค่า Config
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      walletAddress: USDT_ADDRESS,
      rate: FIX_RATE,
      minUSDT: MIN_USDT,
      minCNY: MIN_CNY,
      expiryMinutes: ORDER_EXPIRY_MINUTES,
      network: 'TRC20',
      currency: 'USDT',
      verifyPlayerId: VERIFY_PLAYER_ID
    }
  });
});

/**
 * Admin: ดึงคำสั่งฝากทั้งหมด
 */
router.get('/admin/all-orders', async (req, res) => {
  try {
    const { limit = 100, page = 1, status, playerId } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM crypto_deposits WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM crypto_deposits WHERE 1=1`;
    const params = [];

    // Filter by player
    if (playerId) {
      query += ` AND player_id = ?`;
      countQuery += ` AND player_id = ?`;
      params.push(playerId);
    }

    // Filter by status
    if (status && ['pending', 'paid', 'expired'].includes(status)) {
      query += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      orders: rows.map(row => ({
        id: row.id,
        orderId: row.order_id,
        playerId: row.player_id,
        cnyAmount: parseFloat(row.cny_amount),
        usdtAmount: parseFloat(row.usdt_amount),
        status: row.status,
        txHash: row.tx_hash,
        createdAt: row.created_at,
        paidAt: row.paid_at,
        expiresAt: row.expires_at
      })),
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาด' 
    });
  }
});

/**
 * Admin: ดึงสถิติทั้งหมด
 */
router.get('/admin/stats', async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidOrders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expiredOrders,
        SUM(CASE WHEN status = 'paid' THEN cny_amount ELSE 0 END) as totalCNY,
        SUM(CASE WHEN status = 'paid' THEN usdt_amount ELSE 0 END) as totalUSDT,
        COUNT(DISTINCT player_id) as uniquePlayers
       FROM crypto_deposits`
    );

    const [todayStats] = await pool.query(
      `SELECT 
        COUNT(*) as todayOrders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as todayPaid,
        SUM(CASE WHEN status = 'paid' THEN cny_amount ELSE 0 END) as todayCNY
       FROM crypto_deposits
       WHERE DATE(created_at) = CURDATE()`
    );

    res.json({
      success: true,
      allTime: {
        totalOrders: stats[0].totalOrders,
        paidOrders: stats[0].paidOrders,
        pendingOrders: stats[0].pendingOrders,
        expiredOrders: stats[0].expiredOrders,
        totalCNY: parseFloat(stats[0].totalCNY) || 0,
        totalUSDT: parseFloat(stats[0].totalUSDT) || 0,
        uniquePlayers: stats[0].uniquePlayers
      },
      today: {
        totalOrders: todayStats[0].todayOrders,
        paidOrders: todayStats[0].todayPaid,
        totalCNY: parseFloat(todayStats[0].todayCNY) || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาด' 
    });
  }
});

module.exports = router;