const { pool } = require('../config/db');
const geoip = require('geoip-lite');

function getGeoFromIP(ip) {
  if (!ip) return { country: null, city: null, region: null };
  const geo = geoip.lookup(ip);
  if (!geo) return { country: null, city: null, region: null };
  return {
    country: geo.country || null,
    city: geo.city || null,
    region: geo.region || null
  };
}

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
    '/backend-api/admin'
  ];
  if (excludedPaths.some(path => req.originalUrl.startsWith(path))) return next();

  res.on('finish', async () => {
    try {
      const clientIP = getClientIP(req);
      const userAgentInfo = parseUserAgent(req.headers['user-agent']);
      const responseTime = Date.now() - start;

      const geo = getGeoFromIP(clientIP);

      await pool.query(
        `INSERT INTO access_logs (
          ip, method, url, status, user_agent, device, browser, os,
          referrer, hits, response_time, user_country, city, region, last_access
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE hits = hits + 1, last_access = NOW()`,
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
          geo.country,
          geo.city,
          geo.region
        ]
      );

      console.log(`✅ Logged: ${clientIP} (${geo.country}, ${geo.region}, ${geo.city})`);
    } catch (err) {
      console.error('❌ Error saving access log:', err.message);
    }
  });

  next();
}

function getClientIP(req) {
  if (req.headers["cf-connecting-ip"]) return cleanIP(req.headers["cf-connecting-ip"]);
  if (req.headers["x-forwarded-for"]) return cleanIP(req.headers["x-forwarded-for"].split(",")[0].trim());
  if (req.headers["x-real-ip"]) return cleanIP(req.headers["x-real-ip"]);
  return cleanIP(req.ip);
}

function cleanIP(ip) {
  if (!ip) return null;
  return ip.replace("::ffff:", "").split(":")[0];
}

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

module.exports = logRequest;
