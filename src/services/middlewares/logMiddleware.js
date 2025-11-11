const { pool } = require('../config/db');

async function logRequest(req, res, next) {
  const start = Date.now();

  // ✅ ยกเว้น path ที่ไม่ต้องการเก็บ log
  const excludedPaths = ['/CL_____/Admin', '/backend-api/admin'];
  if (excludedPaths.some(path => req.originalUrl.startsWith(path))) {
    return next();
  }

  res.on('finish', async () => {
    try {
      const clientIP = getClientIP(req);
      const userAgentInfo = parseUserAgent(req.headers['user-agent']);
      const responseTime = Date.now() - start;

      // ✅ ตรวจสอบว่ามี IP นี้อยู่แล้วหรือยัง
      const [existing] = await pool.query(
        `SELECT id FROM access_logs WHERE ip = ? LIMIT 1`,
        [clientIP]
      );

      if (existing.length > 0) {
        // ✅ ถ้ามีอยู่แล้ว → ไม่ต้องบันทึกซ้ำ
        console.log(`⚠️  Skipped duplicate IP log: ${clientIP}`);
        return;
      }

      // ✅ ถ้าไม่มี ให้บันทึกข้อมูลใหม่
      await pool.query(
        `
        INSERT INTO access_logs (
          ip, method, url, status, user_agent, device, browser, os,
          referrer, hits, response_time, user_country, last_access
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NOW())
        `,
        [
          clientIP,
          req.method,
          req.originalUrl.substring(0, 500),
          res.statusCode,
          userAgentInfo.raw,
          userAgentInfo.device,
          userAgentInfo.browser,
          userAgentInfo.os,
          (req.headers['referer'] || req.headers['referrer'] || '').substring(0, 500),
          responseTime,
          req.headers['cf-ipcountry'] || null
        ]
      );

      console.log(`✅ New IP logged: ${clientIP}`);

    } catch (err) {
      console.error('❌ Error saving access log:', err.message);
    }
  });

  next();
}

// 🧩 Helper Functions
function getClientIP(req) {
  const headersToCheck = [
    'cf-connecting-ip', 'x-client-ip', 'x-forwarded-for',
    'x-real-ip', 'x-cluster-client-ip', 'forwarded-for', 'forwarded'
  ];

  for (const header of headersToCheck) {
    const value = req.headers[header];
    if (value) return value.split(',')[0].trim();
  }

  let ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  if (ip.includes(':')) ip = ip.split(':')[0];
  return ip;
}

function parseUserAgent(ua) {
  if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown', raw: 'Unknown' };
  ua = ua.toLowerCase();

  let device = /mobile|android|iphone|phone/i.test(ua)
    ? 'Mobile'
    : /tablet|ipad/i.test(ua)
    ? 'Tablet'
    : 'Desktop';

  let browser = /chrome/i.test(ua)
    ? 'Chrome'
    : /firefox/i.test(ua)
    ? 'Firefox'
    : /safari/i.test(ua)
    ? 'Safari'
    : /edge/i.test(ua)
    ? 'Edge'
    : 'Other';

  let os = /windows/i.test(ua)
    ? 'Windows'
    : /mac/i.test(ua)
    ? 'macOS'
    : /android/i.test(ua)
    ? 'Android'
    : /linux/i.test(ua)
    ? 'Linux'
    : /iphone|ipad/i.test(ua)
    ? 'iOS'
    : 'Other';

  return { device, browser, os, raw: ua.substring(0, 500) };
}

module.exports = logRequest;
