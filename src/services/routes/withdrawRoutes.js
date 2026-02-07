// routes/withdrawRoutes.js - UPDATED with sync balance
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { syncPlayerBalance, getPlayerBalance, callGameAPI } = require('../gameService');

// ฟังก์ชันสร้างการแจ้งเตือน
async function createNotification(conn, withdrawId, playerId, type, message) {
  await conn.query(
    `INSERT INTO withdraw_notifications (withdraw_id, player_id, notification_type, message)
     VALUES (?, ?, ?, ?)`,
    [withdrawId, playerId, type, message]
  );
}

// ฟังก์ชันดึงยอดเงินคงเหลือ (ใช้ฟังก์ชันจาก gameService)
async function getPlayerBalanceDB(conn, playerId) {
  const [rows] = await conn.query(
    `SELECT balance, locked_balance FROM player_balances WHERE player_id = ?`,
    [playerId]
  );

  if (rows.length === 0) {
    // สร้างบัญชีใหม่ถ้ายังไม่มี
    await conn.query(
      `INSERT INTO player_balances (player_id, balance, locked_balance) VALUES (?, 0, 0)`,
      [playerId]
    );
    return { balance: 0, locked_balance: 0 };
  }

  return rows[0];
}

// ฟังก์ชันหักยอดเงิน
async function deductBalance(conn, playerId, amount) {
  await conn.query(
    `UPDATE player_balances 
     SET balance = balance - ?, 
         locked_balance = locked_balance + ?,
         last_withdraw_at = NOW()
     WHERE player_id = ?`,
    [amount, amount, playerId]
  );
}

// ฟังก์ชันคืนเงิน
async function refundBalance(conn, playerId, amount) {
  await conn.query(
    `UPDATE player_balances 
     SET balance = balance + ?, 
         locked_balance = locked_balance - ?
     WHERE player_id = ?`,
    [amount, amount, playerId]
  );
}

// ฟังก์ชันปลดล็อคยอดเงิน (เมื่อจ่ายสำเร็จ)
async function unlockBalance(conn, playerId, amount) {
  await conn.query(
    `UPDATE player_balances 
     SET locked_balance = locked_balance - ?,
         total_withdraw = total_withdraw + ?,
         last_withdraw_at = NOW()
     WHERE player_id = ?`,
    [amount, amount, playerId]
  );
}

// ✅ SYNC Balance from Game API
router.post('/sync-balance/:player_id', async (req, res) => {
  try {
    const { player_id } = req.params;

    const result = await syncPlayerBalance(player_id);

    if (result.success) {
      res.json({
        success: true,
        balance: result.balance,
        message: 'ซิงค์ยอดเงินสำเร็จ'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    console.error('❌ Error syncing balance:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ CREATE Withdraw Request - อัพเดทแล้ว
router.post('/request', async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { player_id, amount, wallet_address } = req.body;

    if (!player_id || !amount || !wallet_address) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลครบถ้วน' });
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'จำนวนเงินต้องมากกว่า 0' });
    }

    // ✅ ซิงค์ยอดก่อนถอน
    console.log(`🔄 Syncing balance before withdrawal for ${player_id}`);
    await syncPlayerBalance(player_id);

    await conn.beginTransaction();

    // ตรวจสอบยอดเงินคงเหลือ
    const playerBalance = await getPlayerBalanceDB(conn, player_id);
    const availableBalance = playerBalance.balance - playerBalance.locked_balance;

    if (availableBalance < withdrawAmount) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `ยอดเงินไม่เพียงพอ (คงเหลือ: ${availableBalance.toFixed(2)} CNY)`
      });
    }

    // คำนวณค่าธรรมเนียมและ USDT
    const FEE_RATE = 0.01; // 1%
    const EXCHANGE_RATE = 7.2; // 1 USDT = 7.2 CNY

    const fee = withdrawAmount * FEE_RATE;
    const netCNY = withdrawAmount - fee;
    const usdtAmount = netCNY / EXCHANGE_RATE;
    const netUSDT = usdtAmount;

    // ✅ 1. เรียก Game API เพื่อหักเงินจากเกมก่อน
    const gameOrderId = `W${Date.now()}${player_id}`;
    const gameTransfer = await callGameAPI('transfer', {
      playerId: player_id,
      platType: 'ag',
      currency: 'CNY',
      type: '2', // type=2 = ถอนเงิน
      amount: withdrawAmount,
      orderId: gameOrderId
    });

    if (!gameTransfer.success) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถหักเงินจากเกมได้: ' + (gameTransfer.message || 'ไม่ทราบสาเหตุ')
      });
    }

    console.log(`✅ Game API หักเงินสำเร็จ: ${withdrawAmount} CNY`);

    // ✅ 2. หักยอดเงินใน database
    await deductBalance(conn, player_id, withdrawAmount);

    // ✅ 3. เพิ่ม request แบบ pending พร้อมหักยอดแล้ว
    const [result] = await conn.query(
      `INSERT INTO withdraw_requests 
       (player_id, amount, cny_amount, usdt_amount, fee, net_usdt, wallet_address, balance_deducted, deducted_at, status, game_order_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), 'pending', ?)`,
      [player_id, withdrawAmount, withdrawAmount, usdtAmount, fee, netUSDT, wallet_address, gameOrderId]
    );

    const withdrawId = result.insertId;

    // บันทึก balance transaction
    await conn.query(
      `INSERT INTO balance_transactions 
       (player_id, transaction_type, amount, before_balance, after_balance, related_id, remark)
       VALUES (?, 'withdraw', ?, ?, ?, ?, ?)`,
      [
        player_id,
        withdrawAmount,
        availableBalance,
        availableBalance - withdrawAmount,
        withdrawId.toString(),
        `ถอนเงิน ${withdrawAmount} CNY (รอดำเนินการ) | Game Order: ${gameOrderId}`
      ]
    );

    // สร้างการแจ้งเตือน
    await createNotification(
      conn,
      withdrawId,
      player_id,
      'request_created',
      `คำขอถอนเงิน ${withdrawAmount.toFixed(2)} CNY (${netUSDT.toFixed(6)} USDT) ถูกสร้างแล้ว รอการอนุมัติ`
    );

    await conn.commit();

    // แจ้งผ่าน Socket.io
    if (req.app.get('io')) {
      const io = req.app.get('io');

      // แจ้ง Admin
      io.to('admin').emit('new_withdraw_request', {
        id: withdrawId,
        player_id,
        amount: withdrawAmount,
        usdt_amount: netUSDT,
        fee,
        status: 'pending',
        wallet_address,
        game_order_id: gameOrderId
      });

      // แจ้งผู้เล่น
      io.to(`player_${player_id}`).emit('withdraw_notification', {
        type: 'request_created',
        message: `คำขอถอนเงิน ${withdrawAmount.toFixed(2)} CNY ถูกสร้างแล้ว`,
        withdrawId,
        amount: withdrawAmount,
        netUSDT: netUSDT.toFixed(6),
        newBalance: (availableBalance - withdrawAmount).toFixed(2)
      });
    }

    res.json({
      success: true,
      message: 'สร้างคำขอถอนเงินสำเร็จ ยอดเงินถูกหักแล้ว',
      requestId: withdrawId,
      data: {
        amount: withdrawAmount,
        fee: fee.toFixed(2),
        netUSDT: netUSDT.toFixed(6),
        newBalance: (availableBalance - withdrawAmount).toFixed(2),
        gameOrderId: gameOrderId
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('❌ Error creating withdraw request:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// GET Withdraw Requests (Admin)
router.get('/admin', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        w.*,
        CASE 
          WHEN w.balance_deducted THEN 'ถูกหักยอดแล้ว'
          ELSE 'ยังไม่ได้หักยอด'
        END as deduction_status
      FROM withdraw_requests w 
      ORDER BY w.requested_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Withdraw Statistics (Admin)
router.get('/admin/stats', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid_amount,
        SUM(CASE WHEN status = 'paid' THEN net_usdt ELSE 0 END) as total_paid_usdt,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
      FROM withdraw_requests
    `);

    res.json({ success: true, stats: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ APPROVE / MARK PAID - อัพเดทแล้ว
router.post('/admin/:id/approve', async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { id } = req.params;
    const { tx_hash } = req.body;

    if (!tx_hash) {
      return res.status(400).json({ success: false, message: 'กรุณาใส่ TX Hash' });
    }

    await conn.beginTransaction();

    // ดึง withdraw request ก่อน
    const [rows] = await conn.query(
      `SELECT * FROM withdraw_requests WHERE id=? AND status='pending'`,
      [id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: 'Request ไม่พบหรือถูกดำเนินการแล้ว'
      });
    }

    const request = rows[0];

    // ✅ ไม่ต้องเรียก Game API อีก เพราะหักเงินไปแล้วตอนสร้าง request
    // เพียงบันทึก TX Hash และเปลี่ยนสถานะ

    // UPDATE status เป็น paid และเพิ่ม tx_hash + processed_at
    await conn.query(
      `UPDATE withdraw_requests 
       SET status='paid', tx_hash=?, processed_at=NOW() 
       WHERE id=?`,
      [tx_hash, id]
    );

    // ปลดล็อคยอดเงิน (ไม่ต้องคืน เพราะจ่ายจริงแล้ว)
    await unlockBalance(conn, request.player_id, request.amount);

    // บันทึก balance transaction
    await conn.query(
      `INSERT INTO balance_transactions 
       (player_id, transaction_type, amount, before_balance, after_balance, related_id, remark)
       SELECT 
         ?, 'withdraw', ?, locked_balance, locked_balance - ?, ?, ?
       FROM player_balances 
       WHERE player_id = ?`,
      [
        request.player_id,
        request.amount,
        request.amount,
        id.toString(),
        `ถอนเงินสำเร็จ ${request.amount} CNY (TX: ${tx_hash.substring(0, 10)}...)`,
        request.player_id
      ]
    );

    // สร้างการแจ้งเตือน
    await createNotification(
      conn,
      id,
      request.player_id,
      'paid',
      `✅ การถอนเงิน ${request.amount} CNY (${request.net_usdt} USDT) สำเร็จแล้ว\nTX Hash: ${tx_hash}`
    );

    await conn.commit();

    // แจ้งผู้เล่น realtime
    if (req.app.get('io')) {
      const io = req.app.get('io');

      io.to(`player_${request.player_id}`).emit('withdraw_status', {
        id,
        status: 'paid',
        tx_hash,
        amount: request.amount,
        netUSDT: request.net_usdt,
        message: '✅ การถอนเงินสำเร็จ! เงินถูกโอนไปยังกระเป๋าของคุณแล้ว'
      });

      // แจ้ง admin room ด้วย
      io.to('admin').emit('withdraw_update', {
        id,
        status: 'paid',
        player_id: request.player_id,
        tx_hash,
        amount: request.amount
      });
    }

    res.json({
      success: true,
      message: 'อนุมัติการถอนเงินสำเร็จ',
      data: {
        withdrawId: id,
        txHash: tx_hash,
        amount: request.amount,
        netUSDT: request.net_usdt
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('❌ Error approving withdraw:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// ✅ REJECT Withdraw - อัพเดทแล้ว
router.post('/admin/:id/reject', async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { id } = req.params;
    const { remark } = req.body;

    await conn.beginTransaction();

    // ดึง withdraw request ก่อน
    const [rows] = await conn.query(
      `SELECT * FROM withdraw_requests WHERE id=? AND status='pending'`,
      [id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: 'Request ไม่พบหรือถูกดำเนินการแล้ว'
      });
    }

    const request = rows[0];

    // ✅ 1. เรียก Game API คืนเงินเข้าเกม
    const refundOrderId = `R${Date.now()}${request.id}`;
    const gameRefund = await callGameAPI('transfer', {
      playerId: request.player_id,
      platType: 'ag',
      currency: 'CNY',
      type: '1', // type=1 = ฝากเงิน (คืนเงิน)
      amount: request.amount,
      orderId: refundOrderId
    });

    if (!gameRefund.success) {
      await conn.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'ไม่สามารถคืนเงินไปยังเกมได้: ' + (gameRefund.message || 'ไม่ทราบสาเหตุ')
      });
    }

    console.log(`✅ Game API คืนเงินสำเร็จ: ${request.amount} CNY`);

    // ✅ 2. คืนเงินใน database
    await refundBalance(conn, request.player_id, request.amount);

    // ✅ 3. อัพเดท status เป็น rejected
    await conn.query(
      `UPDATE withdraw_requests 
       SET status='rejected', 
           processed_at=NOW(), 
           rejected_at=NOW(),
           remark=?,
           refunded=TRUE,
           refunded_at=NOW(),
           refund_order_id=?
       WHERE id=?`,
      [remark || null, refundOrderId, id]
    );

    // บันทึก balance transaction
    await conn.query(
      `INSERT INTO balance_transactions 
       (player_id, transaction_type, amount, before_balance, after_balance, related_id, remark)
       SELECT 
         ?, 'refund', ?, balance - ?, balance, ?, ?
       FROM player_balances 
       WHERE player_id = ?`,
      [
        request.player_id,
        request.amount,
        request.amount,
        id.toString(),
        `คืนเงิน: ${remark || 'การถอนถูกปฏิเสธ'} | Refund Order: ${refundOrderId}`,
        request.player_id
      ]
    );

    // สร้างการแจ้งเตือน
    await createNotification(
      conn,
      id,
      request.player_id,
      'rejected',
      `❌ การถอนเงิน ${request.amount} CNY ถูกปฏิเสธ\nเหตุผล: ${remark || 'ไม่ระบุ'}\n✅ เงินได้ถูกคืนให้แล้ว`
    );

    await conn.commit();

    // แจ้งผู้เล่น realtime
    if (req.app.get('io')) {
      const io = req.app.get('io');

      io.to(`player_${request.player_id}`).emit('withdraw_status', {
        id,
        status: 'rejected',
        remark,
        amount: request.amount,
        message: `❌ การถอนเงินถูกปฏิเสธ\nเหตุผล: ${remark || 'ไม่ระบุ'}\n✅ เงินได้ถูกคืนให้แล้ว`
      });

      // แจ้ง admin room ด้วย
      io.to('admin').emit('withdraw_update', {
        id,
        status: 'rejected',
        player_id: request.player_id,
        remark
      });
    }

    res.json({
      success: true,
      message: 'ปฏิเสธการถอนเงินแล้ว เงินได้ถูกคืนให้ผู้เล่น',
      data: {
        withdrawId: id,
        refundedAmount: request.amount,
        remark,
        refundOrderId: refundOrderId
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('❌ Error rejecting withdraw:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// GET Player History (ผู้เล่น)
router.get('/player-history/:player_id', async (req, res) => {
  try {
    const { player_id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        w.*,
        CASE 
          WHEN w.status = 'paid' THEN '✅ สำเร็จ'
          WHEN w.status = 'rejected' THEN '❌ ถูกปฏิเสธ'
          WHEN w.status = 'pending' THEN '⏳ รอดำเนินการ'
          ELSE w.status
        END as status_text
       FROM withdraw_requests w
       WHERE w.player_id = ? 
       ORDER BY w.requested_at DESC 
       LIMIT 50`,
      [player_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Player Balance (ผู้เล่น) - ✅ ใช้ฟังก์ชันจาก gameService
router.get('/player-balance/:player_id', async (req, res) => {
  try {
    const { player_id } = req.params;
    const autoSync = req.query.sync !== 'false'; // default: true

    const result = await getPlayerBalance(player_id, autoSync);

    if (result.success) {
      res.json({
        success: true,
        data: {
          balance: result.balance,
          lockedBalance: result.lockedBalance,
          availableBalance: result.availableBalance
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Player Notifications (ผู้เล่น)
router.get('/player-notifications/:player_id', async (req, res) => {
  try {
    const { player_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const [rows] = await pool.query(
      `SELECT * FROM withdraw_notifications 
       WHERE player_id = ? 
       ORDER BY sent_at DESC 
       LIMIT ?`,
      [player_id, limit]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark Notification as Read (ผู้เล่น)
router.post('/mark-notification-read/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE withdraw_notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'อ่านการแจ้งเตือนแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cancel Withdraw Request (ผู้เล่น - ยกเลิกได้เฉพาะสถานะ pending)
router.post('/cancel/:id', async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { id } = req.params;
    const { player_id } = req.body;

    await conn.beginTransaction();

    // ดึงข้อมูล request
    const [rows] = await conn.query(
      `SELECT * FROM withdraw_requests WHERE id=? AND player_id=? AND status='pending'`,
      [id, player_id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: 'ไม่พบคำขอหรือไม่สามารถยกเลิกได้'
      });
    }

    const request = rows[0];

    // ✅ เรียก Game API คืนเงินเมื่อผู้เล่นยกเลิก
    const cancelOrderId = `C${Date.now()}${request.id}`;
    const gameCancel = await callGameAPI('transfer', {
      playerId: player_id,
      platType: 'ag',
      currency: 'CNY',
      type: '1', // type=1 = ฝากเงิน (คืนเงิน)
      amount: request.amount,
      orderId: cancelOrderId
    });

    if (!gameCancel.success) {
      await conn.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'ไม่สามารถคืนเงินเมื่อยกเลิก: ' + (gameCancel.message || 'ไม่ทราบสาเหตุ')
      });
    }

    // คืนเงินใน database
    await refundBalance(conn, player_id, request.amount);

    // อัพเดทสถานะ
    await conn.query(
      `UPDATE withdraw_requests 
       SET status='cancelled', 
           processed_at=NOW(),
           refunded=TRUE,
           refunded_at=NOW(),
           remark='ผู้เล่นยกเลิกเอง',
           refund_order_id=?
       WHERE id=?`,
      [cancelOrderId, id]
    );

    // บันทึก balance transaction
    await conn.query(
      `INSERT INTO balance_transactions 
       (player_id, transaction_type, amount, before_balance, after_balance, related_id, remark)
       SELECT 
         ?, 'refund', ?, balance - ?, balance, ?, ?
       FROM player_balances 
       WHERE player_id = ?`,
      [
        player_id,
        request.amount,
        request.amount,
        id.toString(),
        `ยกเลิกการถอนเงิน | Cancel Order: ${cancelOrderId}`,
        player_id
      ]
    );

    // สร้างการแจ้งเตือน
    await createNotification(
      conn,
      id,
      player_id,
      'cancelled',
      `ยกเลิกคำขอถอนเงิน ${request.amount} CNY แล้ว เงินได้ถูกคืนให้`
    );

    await conn.commit();

    // แจ้ง Socket.io
    if (req.app.get('io')) {
      const io = req.app.get('io');

      io.to(`player_${player_id}`).emit('withdraw_notification', {
        type: 'cancelled',
        message: 'ยกเลิกคำขอถอนเงินแล้ว เงินได้ถูกคืนให้',
        withdrawId: id,
        refundedAmount: request.amount
      });

      io.to('admin').emit('withdraw_update', {
        id,
        status: 'cancelled',
        player_id
      });
    }

    res.json({
      success: true,
      message: 'ยกเลิกคำขอถอนเงินแล้ว เงินได้ถูกคืนให้',
      refundedAmount: request.amount
    });

  } catch (err) {
    await conn.rollback();
    console.error('❌ Error cancelling withdraw:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;