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
const jwt = require('jsonwebtoken'); // ✅ 新增：导入 jwt 模块

const logRequest = require('./middlewares/logMiddleware');
const logRoutes = require('./routes/logRoutes');

const app = express();
const server = http.createServer(app);


// JWT 密钥配置
const JWT_SECRET = process.env.JWT_SECRET; // ✅ 确保有 JWT 密钥

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(logRequest);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const viewRoutes = require('./routes/viewRoutes');
const starRoute = require('./routes/star');
const swapFaceRoute = require('./routes/swap-face');
const uploadRoute = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const ipRoutes = require('./routes/ip');
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');

app.use('/backend-api', viewRoutes);
app.use('/backend-api', starRoute);
app.use('/backend-api', swapFaceRoute);
app.use('/backend-api', uploadRoute);
app.use('/backend-api/admin', adminRoutes);
app.use('/backend-api/admin', ipRoutes);
app.use('/backend-api/user', userRoutes);
app.use('/backend-api', logRoutes);
app.use('/backend-api', linkRoutes);

app.get('/backend-api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
});

app.post('/backend-api/notify-update', (req, res) => {
  io.emit('dashboard_update', { message: 'Dashboard updated' });
  res.json({ success: true });
});


initializeDatabase();

const PORT = process.env.PORT || 80;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});