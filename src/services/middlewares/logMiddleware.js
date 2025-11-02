const { pool } = require('../config/db');

async function logRequest(req, res, next) {
  const start = Date.now();

  res.on('finish', async () => {
    const logData = {
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      userAgent: req.headers['user-agent'] || null,
      referrer: req.headers['referer'] || null,
    };

    try {
      // ใช้ INSERT ... ON DUPLICATE KEY UPDATE
      await pool.query(
        `
        INSERT INTO access_logs (ip, method, url, status, user_agent, referrer, hits, last_access)
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE
          hits = hits + 1,
          status = VALUES(status),
          user_agent = VALUES(user_agent),
          referrer = VALUES(referrer),
          last_access = NOW();
        `,
        [
          logData.ip,
          logData.method,
          logData.url,
          logData.status,
          logData.userAgent,
          logData.referrer
        ]
      );
    } catch (err) {
      console.error('❌ Error saving access log:', err.message);
    }
  });

  next();
}

module.exports = logRequest;
