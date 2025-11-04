// middlewares/logMiddleware.js
const { pool } = require('../config/db');

// ฟังก์ชันดึง IP Address จริง
function getClientIP(req) {
  // 1. ตรวจสอบ Cloudflare (ถ้าใช้)
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }
  
  // 2. ตรวจสอบจาก headers มาตรฐาน
  const headersToCheck = [
    'x-client-ip',
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];

  for (const header of headersToCheck) {
    const value = req.headers[header];
    if (value) {
      // กรณีมี multiple IPs (เช่น x-forwarded-for: client, proxy1, proxy2)
      if (typeof value === 'string' && value.includes(',')) {
        const ips = value.split(',').map(ip => ip.trim());
        // เลือก IP แรกซึ่งเป็น client IP จริง
        for (const ip of ips) {
          if (isValidIP(ip) && !isPrivateIP(ip)) {
            return ip;
          }
        }
        return ips[0]; // fallback to first IP
      }
      return value;
    }
  }

  // 3. ตรวจสอบจาก connection (fallback)
  let clientIP = req.ip || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress;

  // ทำความสะอาด IP
  if (clientIP) {
    // ลบ IPv6 prefix
    if (clientIP.startsWith('::ffff:')) {
      clientIP = clientIP.substring(7);
    }
    
    // ลบ port number
    if (clientIP.includes(':')) {
      clientIP = clientIP.split(':')[0];
    }
  }

  return clientIP || 'unknown';
}

// ฟังก์ชันตรวจสอบว่า IP ถูกต้อง
function isValidIP(ip) {
  if (!ip || ip === 'unknown') return false;
  
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (แบบง่าย)
  const ipv6Pattern = /^[0-9a-fA-F:]+$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

// ฟังก์ชันตรวจสอบ Private IP
function isPrivateIP(ip) {
  if (!ip) return false;
  
  // Private IP ranges
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // localhost
    /^::1$/, // IPv6 localhost
    /^fc00:/, // IPv6 private
    /^fe80:/, // IPv6 link-local
    /^169\.254\./, // link-local
  ];

  return privateRanges.some(range => range.test(ip));
}

// ฟังก์ชันวิเคราะห์ User Agent
function parseUserAgent(userAgent) {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  
  // ตรวจสอบอุปกรณ์
  let device = 'Desktop';
  if (/mobile|android|iphone|ipod|phone|blackberry|opera mini|iemobile/i.test(ua)) {
    device = 'Mobile';
  } else if (/tablet|ipad|kindle|silk/i.test(ua)) {
    device = 'Tablet';
  }
  
  // ตรวจสอบ Browser
  let browser = 'Unknown';
  if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  else if (/opera/i.test(ua)) browser = 'Opera';
  
  // ตรวจสอบ OS
  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  
  return {
    device,
    browser,
    os,
    raw: userAgent.substring(0, 500) // จำกัดความยาว
  };
}

async function logRequest(req, res, next) {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      // ดึง IP Address จริง
      const clientIP = getClientIP(req);
      
      // วิเคราะห์ User Agent
      const userAgentInfo = parseUserAgent(req.headers['user-agent']);
      
      const logData = {
        ip: clientIP,
        method: req.method,
        url: req.originalUrl.substring(0, 500), // จำกัดความยาว URL
        status: res.statusCode,
        userAgent: userAgentInfo.raw,
        device: userAgentInfo.device,
        browser: userAgentInfo.browser,
        os: userAgentInfo.os,
        referrer: (req.headers['referer'] || req.headers['referrer'] || '').substring(0, 500),
        responseTime: Date.now() - start,
        userCountry: req.headers['cf-ipcountry'] || null, // Cloudflare country
      };

      console.log('📝 Logging request:', {
        ip: logData.ip,
        device: logData.device,
        method: logData.method,
        url: logData.url,
        status: logData.status,
        responseTime: logData.responseTime + 'ms'
      });

      // บันทึกข้อมูลลงฐานข้อมูล
      await pool.query(
        `
        INSERT INTO access_logs (
          ip, method, url, status, user_agent, device, browser, os, 
          referrer, hits, response_time, user_country, last_access
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          hits = hits + 1,
          status = VALUES(status),
          user_agent = VALUES(user_agent),
          device = VALUES(device),
          browser = VALUES(browser),
          os = VALUES(os),
          referrer = VALUES(referrer),
          response_time = VALUES(response_time),
          user_country = VALUES(user_country),
          last_access = NOW();
        `,
        [
          logData.ip,
          logData.method,
          logData.url,
          logData.status,
          logData.userAgent,
          logData.device,
          logData.browser,
          logData.os,
          logData.referrer,
          logData.responseTime,
          logData.userCountry
        ]
      );

      console.log('✅ Saved access log:', {
        ip: logData.ip,
        device: logData.device,
        browser: logData.browser,
        os: logData.os
      });

    } catch (err) {
      console.error('❌ Error saving access log:', err.message);
    }
  });

  next();
}

module.exports = logRequest;