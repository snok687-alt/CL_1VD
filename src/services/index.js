// index.js - Main Server with Socket.io Integration
// require('dotenv').config();
require('dotenv').config({ path: '/usr/share/nginx/html/src/services/.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');


const { initializeDatabase } = require('./config/db');
const { checkUSDTTransfers, setSocketIO, checkAPIHealth } = require('./tronWatcher');

// Middlewares และ Routes
const logRequest = require('./middlewares/logMiddleware');
const logRoutes = require('./routes/logRoutes');
const viewRoutes = require('./routes/viewRoutes');
const starRoute = require('./routes/star');
const swapFaceRoute = require('./routes/swap-face');
const uploadRoute = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const ipRoutes = require('./routes/ip');
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');
const videoPricingRoutes = require('./routes/videoPricingRoutes');
const usersCustomGiftRoutes = require('./routes/usersCustomGift.routes');
const accountRoutes = require('./routes/accountRoutes');
const videoHistoryRoutes = require('./routes/videoHistoryRoutes');
const gameCoverRoutes = require('./routes/gameCoverRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const gameReportService = require('./gameReportService');
const gameAccountRoutes = require('./routes/gameAccountRoutes');
const gameLogRoutes = require('./routes/gameLogRoutes');
const ipCapture = require('./middlewares/ipCapture');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.set('trust proxy', true);

// HTTP Server + Socket.io
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(logRequest);

// Serve uploads
const uploadsPath = path.resolve(__dirname, 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Debug uploads
app.get('/backend-api/debug/uploads', (req, res) => {
  try {
    const coversPath = path.resolve(__dirname, 'uploads/games/covers');
    const files = fs.existsSync(coversPath) ? fs.readdirSync(coversPath).slice(0, 10) : [];
    res.json({
      uploadsPath,
      coversPath,
      exists: fs.existsSync(coversPath),
      fileCount: fs.existsSync(coversPath) ? fs.readdirSync(coversPath).length : 0,
      sampleFiles: files
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/backend-api', viewRoutes);
app.use('/backend-api', starRoute);
app.use('/backend-api', swapFaceRoute);
app.use('/backend-api', uploadRoute);
app.use('/backend-api/admin', adminRoutes);
app.use('/backend-api/admin', ipRoutes);
app.use('/backend-api/user', userRoutes);
app.use('/backend-api', logRoutes);
app.use('/backend-api', linkRoutes);
app.use('/backend-api/video', videoPricingRoutes);
app.use('/backend-api', usersCustomGiftRoutes);
app.use('/backend-api/account', accountRoutes);
app.use('/backend-api/user', videoHistoryRoutes);
app.use('/backend-api/game-covers', gameCoverRoutes);
app.use('/backend-api/crypto', cryptoRoutes);
app.use('/backend-api/withdraw', withdrawRoutes);
app.use('/backend-api/game', gameAccountRoutes);
app.use('/backend-api', gameLogRoutes);
app.use(ipCapture);
app.use('/backend-api/reports', reportRoutes);

app.use('/backend-api', (req, res, next) => {
  // เติม IP address ลงใน body ถ้าไม่มี
  if (req.body && !req.body.ipAddress) {
    req.body.ipAddress = req.clientIp;
  }
  next();
});

// Test endpoint
app.get('/backend-api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API 正常工作!', 
    timestamp: new Date().toISOString(),
    socketConnected: io.engine.clientsCount
  });
});

// Health check endpoint
app.get('/backend-api/health', async (req, res) => {
  const tronHealthy = await checkAPIHealth();
  res.json({
    success: true,
    server: 'ok',
    tronGrid: tronHealthy ? 'ok' : 'error',
    socketClients: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

// Dashboard update via Socket.io
app.post('/backend-api/notify-update', (req, res) => {
  io.emit('dashboard_update', { message: '仪表板已更新' });
  res.json({ success: true });
});

// Socket.io Connection Management
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  // Join player room
  socket.on('join_player', (playerId) => {
    socket.join(`player_${playerId}`);
    console.log(`👤 Player ${playerId} joined room`);
    socket.emit('joined', { playerId, room: `player_${playerId}` });
  });

  // Join admin room
  socket.on('join_admin', () => {
    socket.join('admin');
    console.log('👑 Admin joined room');
    socket.emit('joined', { role: 'admin' });
  });

  // Leave player room
  socket.on('leave_player', (playerId) => {
    socket.leave(`player_${playerId}`);
    console.log(`👤 Player ${playerId} left room`);
  });

  // Subscribe to order updates
  socket.on('subscribe_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`📋 Subscribed to order: ${orderId}`);
  });

  // Unsubscribe from order
  socket.on('unsubscribe_order', (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`📋 Unsubscribed from order: ${orderId}`);
  });

  // Ping-pong for connection check
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('⚡ Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('⚡ Socket error:', error);
  });
});

// PORT
const PORT = process.env.PORT || 3001;

// Initialize DB and start server
(async () => {
  try {
    // Initialize Database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Set Socket.io instance for tronWatcher
    setSocketIO(io);
    console.log('✅ Socket.IO connected to TronWatcher');

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
      console.log(`🔌 Socket.IO ready for connections`);
      console.log(`💰 USDT Watcher: Running (every 30 seconds)`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Kill the process or use another port.`);
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });

    // Cron job: check USDT deposits every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      try {
        await checkUSDTTransfers();
      } catch (err) {
        console.error('❌ Error in USDT watcher cron:', err);
      }
    });

    // Cron job: broadcast server status every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      const isHealthy = await checkAPIHealth();
      io.emit('server_status', {
        timestamp: new Date().toISOString(),
        tronGrid: isHealthy ? 'ok' : 'error',
        clients: io.engine.clientsCount
      });
    });

    console.log('✅ All systems operational');

  } catch (err) {
    console.error('❌ Failed to initialize:', err);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Cron: ดึงรายงานแบบ realtime ทุก 2 นาที
cron.schedule('*/2 * * * *', async () => {
  try {
    console.log('🎮 Fetching realtime game records...');
    const result = await gameReportService.fetchRealtimeRecords('CNY', 1, 2000);
    
    if (result.success && result.data.length > 0) {
      await gameReportService.saveGameRecords(result.data);
      console.log(`✅ Saved ${result.data.length} realtime records`);
      
      // แจ้งเตือนผ่าน Socket.io
      io.emit('realtime_records_update', {
        timestamp: new Date().toISOString(),
        recordCount: result.data.length
      });
    } else {
      console.log('ℹ️ No new realtime records');
    }
  } catch (err) {
    console.error('❌ Error in realtime records cron:', err);
  }
});

// Cron: สร้างรายงานรายวันอัตโนมัติ ทุกวันเวลา 00:05
cron.schedule('5 0 * * *', async () => {
  try {
    console.log('📊 Generating daily report...');
    
    // สร้างรายงานสำหรับเมื่อวาน
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const result = await gameReportService.generateDailyReport(yesterday);
    
    if (result.success) {
      console.log(`✅ Daily report generated for ${yesterday}`);
      console.log(`  - Active Players: ${result.report.activePlayers}`);
      console.log(`  - Total Bets: ${result.report.totalBets}`);
      console.log(`  - GGR: ${result.report.grossGamingRevenue.toFixed(2)} CNY`);
      console.log(`  - Net Revenue: ${result.report.netRevenue.toFixed(2)} CNY`);
      
      // แจ้งเตือน Admin
      io.to('admin').emit('daily_report_generated', {
        date: yesterday,
        report: result.report
      });
    } else {
      console.error(`❌ Failed to generate daily report: ${result.message}`);
    }
  } catch (err) {
    console.error('❌ Error in daily report cron:', err);
  }
});

// Cron: ดึงรายงานประวัติย้อนหลัง (ทุก 1 ชั่วโมง)
// ใช้สำหรับดึงข้อมูลที่อาจหลุดลอดจาก realtime
cron.schedule('0 * * * *', async () => {
  try {
    console.log('📜 Fetching historical game records...');
    
    // ดึงข้อมูล 2 ชั่วโมงย้อนหลัง
    const endTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const startTime = new Date(Date.now() - 2 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
    
    const result = await gameReportService.fetchHistoryRecords('CNY', startTime, endTime, 1, 2000);
    
    if (result.success && result.data.length > 0) {
      const saved = await gameReportService.saveGameRecords(result.data);
      console.log(`✅ Historical sync: ${saved.saved} saved, ${saved.skipped} skipped`);
    } else {
      console.log('ℹ️ No historical records to sync');
    }
  } catch (err) {
    console.error('❌ Error in historical records cron:', err);
  }
});

// 4. เพิ่ม API endpoint สำหรับ manual trigger
app.post('/backend-api/admin/trigger-daily-report', async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const result = await gameReportService.generateDailyReport(targetDate);
    
    if (result.success) {
      res.json({
        success: true,
        message: `สร้างรายงานวันที่ ${targetDate} สำเร็จ`,
        report: result.report
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

// 5. เพิ่ม API endpoint สำหรับ manual sync records
app.post('/backend-api/admin/sync-records', async (req, res) => {
  try {
    const { startTime, endTime, currency = 'CNY' } = req.body;
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ startTime และ endTime (YYYY-MM-DD HH:mm:ss)'
      });
    }
    
    // ดึงข้อมูล
    const result = await gameReportService.fetchHistoryRecords(currency, startTime, endTime, 1, 2000);
    
    if (result.success && result.data.length > 0) {
      // บันทึกลง database
      const saved = await gameReportService.saveGameRecords(result.data);
      
      res.json({
        success: true,
        message: 'ซิงค์ข้อมูลสำเร็จ',
        totalRecords: result.data.length,
        saved: saved.saved,
        skipped: saved.skipped
      });
    } else {
      res.json({
        success: true,
        message: 'ไม่พบข้อมูลในช่วงเวลาที่ระบุ',
        totalRecords: 0
      });
    }
  } catch (err) {
    console.error('❌ Error syncing records:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

console.log('✅ Game Report System initialized');
console.log('📊 Cron jobs scheduled:');
console.log('  - Realtime records: every 2 minutes');
console.log('  - Daily report: 00:05 AM daily');
console.log('  - Historical sync: every hour');

// Export for testing
module.exports = { app, server, io };