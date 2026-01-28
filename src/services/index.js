require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const http = require('http');
const { Server } = require('socket.io');
const { initializeDatabase } = require('./config/db');
const jwt = require('jsonwebtoken');

const logRequest = require('./middlewares/logMiddleware');
const logRoutes = require('./routes/logRoutes');

const app = express();
app.set("trust proxy", true);
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(logRequest);

// ✅ แก้ไข: ให้ serve uploads ได้ถูกต้อง
const uploadsPath = path.resolve(__dirname, 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);
console.log('✅ Uploads exists:', fs.existsSync(uploadsPath));
app.use('/uploads', express.static(uploadsPath));

// ✅ ทดสอบ: เพิ่ม debug endpoint (ต้องอยู่ก่อน frontend route)
app.get('/backend-api/debug/uploads', (req, res) => {
  try {
    const coversPath = path.resolve(__dirname, 'uploads/games/covers');
    const files = fs.readdirSync(coversPath).slice(0, 10);
    res.json({
      uploadsPath,
      coversPath,
      exists: fs.existsSync(coversPath),
      fileCount: fs.readdirSync(coversPath).length,
      sampleFiles: files
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.get('/backend-api/test', (req, res) => {
  res.json({
    message: 'API 正常工作!',
    timestamp: new Date().toISOString(),
  });
});

app.post('/backend-api/notify-update', (req, res) => {
  io.emit('dashboard_update', { message: '仪表板已更新' });
  res.json({ success: true });
});

initializeDatabase();

const PORT = process.env.PORT || 80;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
});