require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const http = require('http'); // ✅ เพิ่ม
const { Server } = require('socket.io'); // ✅ เพิ่ม
const { initializeDatabase } = require('./config/db');

const logRequest = require('./middlewares/logMiddleware');
const logRoutes = require('./routes/logRoutes');

const app = express();
const server = http.createServer(app); // ✅ ใช้ server เพื่อให้ Socket.IO ทำงานได้

// ✅ สร้าง Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // เปลี่ยนตามโดเมน frontend ถ้ามี
  },
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(logRequest);

// ✅ Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ โหลด routes
const viewRoutes = require('./routes/viewRoutes');
const starRoute = require('./routes/star');
const swapFaceRoute = require('./routes/swap-face');
const uploadRoute = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const ipRoutes = require('./routes/ip');
const userRoutes = require('./routes/userRoutes');

// ✅ Proxy example
app.post('/backend-api/proxy/login', async (req, res) => {
  try {
    const response = await fetch('https://ap.api-bet.net/player/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sign': req.headers.sign || '',
        'random': req.headers.random || '',
        'sn': req.headers.sn || ''
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ code: 99999, msg: 'Proxy failed' });
  }
});

app.use('/backend-api', viewRoutes);
app.use('/backend-api', starRoute);
app.use('/backend-api', swapFaceRoute);
app.use('/backend-api', uploadRoute);
app.use('/backend-api/admin', adminRoutes);
app.use('/backend-api/admin', ipRoutes);
app.use('/backend-api/user', userRoutes);
app.use('/backend-api', logRoutes);

app.get('/backend-api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
});

// ✅ Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// ✅ Broadcast event ไปให้ทุก client
app.post('/backend-api/notify-update', (req, res) => {
  io.emit('dashboard_update', { message: 'Dashboard updated' });
  res.json({ success: true });
});

initializeDatabase();

const PORT = process.env.PORT || 80;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
