// routes/withdrawRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// CREATE Withdraw Request (ผู้เล่นกดถอน)
router.post('/request', async (req, res) => {
  try {
    const { player_id, amount, wallet_address } = req.body;

    if (!player_id || !amount || !wallet_address) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลครบถ้วน' });
    }

    // เพิ่ม request แบบ pending
    const [result] = await pool.query(
      `INSERT INTO withdraw_requests (player_id, amount, wallet_address) 
       VALUES (?, ?, ?)`,
      [player_id, amount, wallet_address]
    );

    // แจ้งผ่าน Socket.io ว่ามี request ใหม่ (Admin room)
    if (req.app.get('io')) {
      req.app.get('io').to('admin').emit('new_withdraw_request', {
        id: result.insertId,
        player_id,
        amount,
        status: 'pending'
      });
    }

    res.json({ success: true, message: 'Withdraw request created', requestId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Withdraw Requests (Admin)
router.get('/admin', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM withdraw_requests ORDER BY requested_at DESC`);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// APPROVE / MARK PAID (Admin ใส่ TX Hash)
router.post('/admin/:id/approve', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { tx_hash } = req.body;

    if (!tx_hash) return res.status(400).json({ success: false, message: 'กรุณาใส่ TX Hash' });

    await conn.beginTransaction();

    // ดึง withdraw request ก่อน
    const [rows] = await conn.query(`SELECT * FROM withdraw_requests WHERE id=? AND status='pending'`, [id]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Request ไม่พบหรือถูกดำเนินการแล้ว' });
    }

    const request = rows[0];

    // UPDATE status เป็น paid และเพิ่ม tx_hash + processed_at
    await conn.query(
      `UPDATE withdraw_requests SET status='paid', tx_hash=?, processed_at=NOW() WHERE id=?`,
      [tx_hash, id]
    );

    // TODO: deduct user balance (ถ้ามี column balance ใน users)
    // await conn.query(`UPDATE users SET balance = balance - ? WHERE player_id=?`, [request.amount, request.player_id]);

    await conn.commit();

    // แจ้งผู้เล่น realtime
    if (req.app.get('io')) {
      req.app.get('io').to(`player_${request.player_id}`).emit('withdraw_status', {
        id,
        status: 'paid',
        tx_hash,
        amount: request.amount
      });

      // แจ้ง admin room ด้วย (optional)
      req.app.get('io').to('admin').emit('withdraw_update', {
        id,
        status: 'paid',
        player_id: request.player_id,
        tx_hash,
        amount: request.amount
      });
    }

    res.json({ success: true, message: 'Withdraw approved and marked as paid' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});


// REJECT Withdraw (Admin)
router.post('/admin/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    // ดึง withdraw request ก่อน
    const [rows] = await pool.query(`SELECT * FROM withdraw_requests WHERE id=? AND status='pending'`, [id]);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'Request ไม่พบหรือถูกดำเนินการแล้ว' });

    const request = rows[0];

    // อัพเดท status เป็น rejected
    await pool.query(
      `UPDATE withdraw_requests SET status='rejected', processed_at=NOW(), remark=? WHERE id=?`,
      [remark || null, id]
    );

    // TODO: คืนเงิน balance ให้ผู้เล่นถ้ามี hold

    // แจ้งผู้เล่น realtime
    if (req.app.get('io')) {
      req.app.get('io').to(`player_${request.player_id}`).emit('withdraw_status', {
        id,
        status: 'rejected',
        remark
      });

      // แจ้ง admin room ด้วย
      req.app.get('io').to('admin').emit('withdraw_update', {
        id,
        status: 'rejected',
        player_id: request.player_id,
        remark
      });
    }

    res.json({ success: true, message: 'Withdraw rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ใน withdrawRoutes.js เพิ่ม
router.get('/player-history/:player_id', async (req, res) => {
  try {
    const { player_id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM withdraw_requests 
       WHERE player_id = ? 
       ORDER BY requested_at DESC 
       LIMIT 50`,
      [player_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;