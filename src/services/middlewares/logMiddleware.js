const { pool } = require('../config/db');
const geoip = require('geoip-lite');
const crypto = require('crypto');

// สร้าง fingerprint จาก user agent
function generateDeviceFingerprint(req) {
  const userAgent = req.headers['user-agent'] || '';
  const accept = req.headers['accept'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';

  const fingerprintString = `${userAgent}::${accept}::${acceptLanguage}::${acceptEncoding}`;
  return crypto.createHash('sha256').update(fingerprintString).digest('hex').substring(0, 32);
}

// ดึง IP จริงจาก Cloudflare headers หรือ fallback
function getRealIPFromCloudflare(req) {
  const headers = [
    'cf-connecting-ip',
    'x-forwarded-for',
    'x-real-ip',
    'true-client-ip',
    'x-cluster-client-ip'
  ];

  for (const header of headers) {
    if (req.headers[header]) {
      const ip = req.headers[header];
      if (header === 'x-forwarded-for') return ip.split(',')[0].trim();
      return ip;
    }
  }

  return req.ip || req.connection.remoteAddress;
}

// ล้าง IP (remove ::ffff:)
function cleanIP(ip) {
  if (!ip) return null;
  return ip.replace("::ffff:", "").split(":")[0];
}

// geo info จาก IP
function getGeoFromIP(ip) {
  if (!ip) return { country: null, city: null, region: null };
  const geo = geoip.lookup(ip);
  if (!geo) return { country: null, city: null, region: null };
  return { country: geo.country || null, city: geo.city || null, region: geo.region || null };
}

// แยก device, browser, os จาก user-agent
function parseUserAgent(ua) {
  if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown', raw: 'Unknown' };
  ua = ua.toLowerCase();
  const device = /mobile|android|iphone|phone/i.test(ua) ? 'Mobile' :
                 /tablet|ipad/i.test(ua) ? 'Tablet' : 'Desktop';
  const browser = /chrome/i.test(ua) ? 'Chrome' :
                  /firefox/i.test(ua) ? 'Firefox' :
                  /safari/i.test(ua) ? 'Safari' :
                  /edge/i.test(ua) ? 'Edge' : 'Other';
  const os = /windows/i.test(ua) ? 'Windows' :
             /mac os|macintosh/i.test(ua) ? 'macOS' :
             /android/i.test(ua) ? 'Android' :
             /linux/i.test(ua) ? 'Linux' :
             /iphone|ipad/i.test(ua) ? 'iOS' : 'Other';
  return { device, browser, os, raw: ua.substring(0, 500) };
}

// middleware log request
async function logRequest(req, res, next) {
  const start = Date.now();
  const excludedPaths = [
    '/CL_____________________________________________________________________________________******_/Admin',
    '/Addlinks',
    '/GameDashboard',
    '/gaming',
    '/upload',
    '/Login',
    '/Ip',
    '/backend-api/admin',
    '/backend-api/ip-list',
    '/ip-list'
  ];

  if (excludedPaths.some(path => req.originalUrl.startsWith(path))) return next();

  res.on('finish', async () => {
    try {
      const realIP = getRealIPFromCloudflare(req);
      const clientIP = cleanIP(realIP);
      const userAgentInfo = parseUserAgent(req.headers['user-agent']);
      const responseTime = Date.now() - start;
      const deviceFingerprint = generateDeviceFingerprint(req);
      const geo = getGeoFromIP(clientIP);

      // SQL: จัดกลุ่มตาม fingerprint แทน IP
      await pool.query(
        `INSERT INTO access_logs (
          device_fingerprint, ip, method, url, status, user_agent, device, browser, os,
          referrer, hits, response_time, user_country, city, region, cf_ip, last_access, first_access
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          hits = hits + 1,
          last_access = NOW(),
          ip = VALUES(ip),
          status = VALUES(status),
          user_agent = VALUES(user_agent),
          device = VALUES(device),
          browser = VALUES(browser),
          os = VALUES(os),
          response_time = VALUES(response_time),
          user_country = VALUES(user_country),
          city = VALUES(city),
          region = VALUES(region),
          cf_ip = VALUES(cf_ip)
        `,
        [
          deviceFingerprint,
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
          geo.country,
          geo.city,
          geo.region,
          null // cf_ip ถ้าอยากเพิ่ม logic Cloudflare ให้ใส่ที่นี่
        ]
      );

      console.log(`✅ Logged: Fingerprint ${deviceFingerprint.substring(0, 8)} | Latest IP: ${clientIP} | ${geo.country}, ${geo.region}, ${geo.city}`);
    } catch (err) {
      console.error('❌ Error saving access log:', err.message);
    }
  });

  next();
}

module.exports = logRequest;
