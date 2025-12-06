const { pool } = require('../config/db');
const geoip = require('geoip-lite');
const crypto = require('crypto');

// ฟังก์ชันสร้าง fingerprint จาก user agent
function generateDeviceFingerprint(req) {
  const userAgent = req.headers['user-agent'] || '';
  const accept = req.headers['accept'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // รวมข้อมูลเพื่อสร้าง fingerprint
  const fingerprintString = `${userAgent}::${accept}::${acceptLanguage}::${acceptEncoding}`;
  
  // สร้าง hash จากข้อมูล
  return crypto.createHash('sha256').update(fingerprintString).digest('hex').substring(0, 32);
}

// ฟังก์ชันดึง IP จริงจาก Cloudflare
function getRealIPFromCloudflare(req) {
  // Cloudflare headers สำหรับ IP จริง
  const headers = [
    'cf-connecting-ip',    // Cloudflare
    'x-forwarded-for',     // Standard proxy
    'x-real-ip',           // Nginx
    'true-client-ip',      // Akamai and Cloudflare
    'x-cluster-client-ip'  // Rackspace LB, Riverbed Stingray
  ];
  
  for (const header of headers) {
    if (req.headers[header]) {
      const ip = req.headers[header];
      // ถ้าเป็น x-forwarded-for อาจมีหลาย IP แยกด้วย comma
      if (header === 'x-forwarded-for') {
        return ip.split(',')[0].trim();
      }
      return ip;
    }
  }
  
  // ถ้าไม่มี header พิเศษ ให้ใช้ IP จาก connection
  return req.ip || req.connection.remoteAddress;
}

// ฟังก์ชันตรวจสอบว่าเป็น Cloudflare IP หรือไม่
function isCloudflareIP(ip) {
  if (!ip) return false;
  
  // Cloudflare IP ranges
  const cloudflareRanges = [
    /^104\.(16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)\..*/, // Cloudflare
    /^172\.(64|65|66|67|68|69|70|71)\..*/, // Cloudflare
    /^162\.158\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^108\.162\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^141\.101\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^190\.93\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^188\.114\.\d{1,3}\.\d{1,3}/  // Cloudflare
  ];
  
  return cloudflareRanges.some(range => range.test(ip));
}

// ฟังก์ชันล้าง IP
function cleanIP(ip) {
  if (!ip) return null;
  return ip.replace("::ffff:", "").split(":")[0];
}

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

async function logRequest(req, res, next) {
  const start = Date.now();
const excludedPaths = [
  '/CL_____________________________________________________________________________________******_/Admin',
  '/Addlinks',
  '/GameDashboard',
  '/gaming',
  '/upload',
  '/Login',
  '/Ip',                    // ✅ เพิ่มตรงนี้
  '/backend-api/admin',
  '/backend-api/ip-list',   // ✅ เพิ่มเส้นทาง API ของ ip-list ด้วย
  '/ip-list'                // ✅ เพิ่มรูปแบบอื่นๆถ้ามี
];
  
  if (excludedPaths.some(path => req.originalUrl.startsWith(path))) return next();

  res.on('finish', async () => {
    try {
      // ดึง IP จาก Cloudflare headers ก่อน
      const realIP = getRealIPFromCloudflare(req);
      const clientIP = cleanIP(realIP);
      const userAgentInfo = parseUserAgent(req.headers['user-agent']);
      const responseTime = Date.now() - start;
      
      // สร้าง device fingerprint
      const deviceFingerprint = generateDeviceFingerprint(req);
      
      // ดึง geo location จาก IP จริง
      const geo = getGeoFromIP(clientIP);
      
      // ตรวจสอบว่าเป็น Cloudflare IP หรือไม่
      const isCloudflare = isCloudflareIP(clientIP);
      let cfIP = null;
      
      if (isCloudflare) {
        // ถ้าเป็น Cloudflare IP ให้บันทึก IP จริงแยกต่างหาก
        cfIP = clientIP;
        // ใช้ IP จาก connection เป็นตัวแทน
        // หรือจะใช้ fingerprint แทนก็ได้
      }
      
await pool.query(
  `INSERT INTO access_logs (
    ip, method, url, status, user_agent, device, browser, os,
    referrer, hits, response_time, user_country, city, region,
    device_fingerprint, cf_ip, last_access, first_access
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  ON DUPLICATE KEY UPDATE 
    hits = hits + 1,
    last_access = NOW(),
    status = VALUES(status),
    user_agent = VALUES(user_agent),
    device = VALUES(device),
    browser = VALUES(browser),
    os = VALUES(os),
    response_time = VALUES(response_time),
    user_country = VALUES(user_country),
    city = VALUES(city),
    region = VALUES(region),
    cf_ip = VALUES(cf_ip)`
  ,
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
    geo.region,
    deviceFingerprint,
    cfIP
  ]
);


      console.log(`✅ Logged: ${clientIP} (${geo.country}, ${geo.region}, ${geo.city}) | Device: ${deviceFingerprint.substring(0, 8)}`);
    } catch (err) {
      console.error('❌ Error saving access log:', err.message);
    }
  });

  next();
}

module.exports = logRequest;