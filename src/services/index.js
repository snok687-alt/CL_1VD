require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { initializeDatabase } = require('./config/db');
const fetch = require('node-fetch');

// ✅ เพิ่มสองบรรทัดนี้
const logRequest = require('./middlewares/logMiddleware');
const logRoutes = require('./routes/logRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// ✅ ใช้งาน middleware บันทึก log ทุก request
app.use(logRequest);

// ✅ Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ โหลด routes อื่น ๆ
const starRoute = require('./routes/star');
const swapFaceRoute = require('./routes/swap-face');
const uploadRoute = require('./routes/upload');
const viewRoutes = require('./routes/viewRoutes');

// ✅ Proxy route สำหรับ ap.api-bet.net
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

    const data = await response.json(); // ✅ ใช้ .json() ถ้า API ส่ง JSON
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ code: 99999, msg: 'Proxy to ap.api-bet.net failed' });
  }
});


app.use('/backend-api', starRoute);
app.use('/backend-api', swapFaceRoute);
app.use('/backend-api', uploadRoute);
app.use('/backend-api', viewRoutes);

// ✅ เพิ่ม route สำหรับดู logs
app.use('/backend-api', logRoutes);

// ✅ Test route
app.get('/backend-api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
});

// ✅ Error handler...
// (เหมือนของคุณเดิม)

initializeDatabase();

const PORT = process.env.PORT || 80;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
