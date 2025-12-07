const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// ฟังก์ชันตรวจสอบ IP
function isPrivateIP(ip) {
  if (!ip) return false;
  
  const privateRanges = [
    /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./, 
    /^127\./, /^::1$/, /^fc00:/, /^fe80:/
  ];

  return privateRanges.some(range => range.test(ip));
}

// ฟังก์ชันตรวจจับว่าเป็น Cloudflare IP หรือไม่
function isCloudflareIP(ip) {
  if (!ip) return false;
  
  const cloudflareRanges = [
    /^104\.(28|27|26|25|24|23|22|21|20|19|18|17|16)\./, // Cloudflare
    /^172\.(64|65|66|67|68|69|70|71)\./, // Cloudflare
    /^162\.158\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^108\.162\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^141\.101\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^190\.93\.\d{1,3}\.\d{1,3}/, // Cloudflare
    /^188\.114\.\d{1,3}\.\d{1,3}/  // Cloudflare
  ];
  
  return cloudflareRanges.some(range => range.test(ip));
}

// ฟังก์ชันสร้าง IP Group Key
function getIPGroupKey(ip) {
  if (!ip) return ip;
  
  // ตรวจสอบ Cloudflare IPs
  if (ip.startsWith('104.28.')) return 'cloudflare_104_28';
  if (ip.startsWith('104.27.')) return 'cloudflare_104_27';
  if (ip.startsWith('172.67.')) return 'cloudflare_172_67';
  if (ip.startsWith('172.64.')) return 'cloudflare_172_64';
  
  return ip; // ถ้าไม่ใช่ Cloudflare IP ให้ใช้ IP เอง
}

// ฟังก์ชันสร้าง Display IP สำหรับกลุ่ม
function getDisplayIP(ip, groupKey) {
  if (groupKey.includes('cloudflare')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  return ip;
}

// ✅ ดึงรายการ IP (จัดกลุ่ม Cloudflare IPs)
// วิธีที่ง่ายกว่า: ใช้ subquery แยกขั้นตอน
// แก้ไขในส่วน query ของ ip-list ให้รองรับ ONLY_FULL_GROUP_BY
router.get('/ip-list', async (req, res) => {
  try {
    const { period = '7d', page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    console.log('📥 รับคำขอ IP list:', { period, page, limit, search });

    // คำนวณวันที่เริ่มต้น
    const startDate = new Date();
    switch (period) {
      case '24h': startDate.setDate(startDate.getDate() - 1); break;
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
    }

    // ✅ แก้ไข: Query แบบง่ายๆ ที่รองรับ ONLY_FULL_GROUP_BY
    let query = `
      -- ขั้นตอนที่ 1: ดึงข้อมูล IP ทั้งหมด
      WITH raw_ip_data AS (
        SELECT 
          ip,
          -- สร้าง group key สำหรับ Cloudflare IPs
          CASE 
            WHEN ip LIKE '104.28.%' THEN 'cloudflare_104_28'
            WHEN ip LIKE '104.27.%' THEN 'cloudflare_104_27'
            WHEN ip LIKE '172.67.%' THEN 'cloudflare_172_67'
            WHEN ip LIKE '172.64.%' THEN 'cloudflare_172_64'
            ELSE ip 
          END as group_key,
          SUM(CASE 
            WHEN method = 'POST' 
            AND url LIKE '%/backend-api/views/increment%' 
            AND status = 200 
            THEN hits 
            ELSE 0 
          END) as videoViewRequests,
          COUNT(*) as totalRequests,
          MAX(last_access) as lastActivity,
          MIN(first_access) as firstActivity,
          GROUP_CONCAT(DISTINCT user_agent) as userAgents,
          MAX(device) as device,
          MAX(browser) as browser,
          MAX(os) as os,
          MAX(user_country) as country,
          MAX(city) as city,
          MAX(region) as region,
          MAX(isp) as isp
        FROM access_logs 
        WHERE last_access >= ?
    `;

    const queryParams = [startDate];

    // Add search filter
    if (search && search.trim() !== '') {
      query += ` AND (ip LIKE ? OR user_agent LIKE ? OR user_country LIKE ? OR city LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` 
        GROUP BY ip, group_key
      ),
      -- ขั้นตอนที่ 2: จัดกลุ่มตาม group_key
      grouped_data AS (
        SELECT 
          group_key,
          -- หา IP ล่าสุดในกลุ่ม
          (SELECT ip FROM raw_ip_data d2 
           WHERE d2.group_key = d1.group_key 
           ORDER BY d2.lastActivity DESC 
           LIMIT 1) as representative_ip,
          COUNT(DISTINCT ip) as ip_count,
          SUM(videoViewRequests) as videoViewRequests,
          SUM(totalRequests) as totalRequests,
          MAX(lastActivity) as lastActivity,
          MIN(firstActivity) as firstActivity,
          GROUP_CONCAT(DISTINCT userAgents SEPARATOR '|') as allUserAgents,
          GROUP_CONCAT(DISTINCT device SEPARATOR ',') as devices,
          GROUP_CONCAT(DISTINCT browser SEPARATOR ',') as browsers,
          GROUP_CONCAT(DISTINCT os SEPARATOR ',') as operatingSystems,
          MAX(country) as country,
          MAX(city) as city,
          MAX(region) as region,
          MAX(isp) as isp
        FROM raw_ip_data d1
        GROUP BY group_key
      )
      SELECT * FROM grouped_data
      ORDER BY lastActivity DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    console.log('🔍 Query IP list:', query);
    console.log('📋 Query params:', queryParams);

    const [ips] = await pool.query(query, queryParams);

    // ✅ ดึงจำนวนทั้งหมด
    let countQuery = `
      SELECT COUNT(DISTINCT 
        CASE 
          WHEN ip LIKE '104.28.%' THEN 'cloudflare_104_28'
          WHEN ip LIKE '104.27.%' THEN 'cloudflare_104_27'
          WHEN ip LIKE '172.67.%' THEN 'cloudflare_172_67'
          WHEN ip LIKE '172.64.%' THEN 'cloudflare_172_64'
          ELSE ip 
        END
      ) as total 
      FROM access_logs 
      WHERE last_access >= ?
    `;
    const countParams = [startDate];

    if (search && search.trim() !== '') {
      countQuery += ` AND (ip LIKE ? OR user_agent LIKE ? OR user_country LIKE ? OR city LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // ✅ ดึงยอดรวมการดูวิดีโอทั้งหมด
    let totalViewsQuery = `
      SELECT SUM(CASE 
        WHEN method = 'POST' 
        AND url LIKE '%/backend-api/views/increment%' 
        AND status = 200 
        THEN hits 
        ELSE 0 
      END) as totalVideoViews
      FROM access_logs 
      WHERE last_access >= ?
    `;
    const [totalViewsResult] = await pool.query(totalViewsQuery, [startDate]);
    const totalVideoViews = totalViewsResult[0]?.totalVideoViews || 0;

    // ✅ นับ IP ที่ต้องตรวจสอบ (private IPs)
    let suspiciousQuery = `
      SELECT COUNT(DISTINCT ip) as suspicious 
      FROM access_logs 
      WHERE last_access >= ? AND (
        ip LIKE '10.%' OR 
        ip LIKE '172.1%' OR 
        ip LIKE '172.2%' OR 
        ip LIKE '172.3%' OR 
        ip LIKE '192.168.%' OR
        ip = '127.0.0.1' OR
        ip = '::1' OR
        ip = 'localhost'
      )
    `;
    const [suspiciousResult] = await pool.query(suspiciousQuery, [startDate]);
    const suspiciousIPs = suspiciousResult[0]?.suspicious || 0;

    // ✅ นับจำนวนประเทศที่ไม่ซ้ำ
    let countryQuery = `
      SELECT COUNT(DISTINCT user_country) as totalCountries 
      FROM access_logs 
      WHERE last_access >= ? AND user_country IS NOT NULL AND user_country != ''
    `;
    const [countryResult] = await pool.query(countryQuery, [startDate]);
    const totalCountries = countryResult[0]?.totalCountries || 0;

    // ✅ ประมวลผลข้อมูล IP
    const processedIPs = ips.map(ip => {
      const isCloudflareGroup = ip.group_key.includes('cloudflare');
      const ipCount = ip.ip_count || 1;
      
      return {
        ip: ip.representative_ip || ip.group_key,
        groupKey: ip.group_key,
        isCloudflareGroup: isCloudflareGroup,
        ipCount: ipCount,
        videoViewRequests: ip.videoViewRequests || 0,
        totalRequests: ip.totalRequests || 0,
        lastActivity: ip.lastActivity,
        firstActivity: ip.firstActivity,
        userAgents: ip.allUserAgents ? 
          ip.allUserAgents.split('|').filter(ua => ua).flatMap(ua => 
            ua.split(',').filter(item => item)
          ) : [],
        devices: ip.devices ? ip.devices.split(',').filter(d => d) : [],
        browsers: ip.browsers ? ip.browsers.split(',').filter(b => b) : [],
        operatingSystems: ip.operatingSystems ? ip.operatingSystems.split(',').filter(os => os) : [],
        country: ip.country || 'Unknown',
        city: ip.city || 'Unknown',
        region: ip.region || 'Unknown',
        isp: ip.isp || 'Unknown',
        isPrivate: isPrivateIP(ip.representative_ip)
      };
    });

    console.log('✅ ส่งข้อมูล IP list สำเร็จ:', {
      totalIPs: total,
      currentPage: page,
      totalPages: totalPages,
      returnedIPs: processedIPs.length,
      suspiciousIPs: suspiciousIPs,
      totalCountries: totalCountries,
      totalVideoViews: totalVideoViews
    });

    res.json({
      success: true,
      ips: processedIPs,
      totalPages,
      totalIPs: total,
      recentIPs: processedIPs.length,
      totalCountries: totalCountries,
      suspiciousIPs: suspiciousIPs,
      totalVideoViews: totalVideoViews
    });

  } catch (error) {
    console.error('❌ Error fetching IP list:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงรายการ IP',
      details: error.message 
    });
  }
});

// ✅ ดึงรายละเอียด IP เดี่ยวหรือกลุ่ม
router.get('/ip-details/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    
    console.log('🔍 ดึงรายละเอียด IP:', ip);

    // ตรวจสอบว่าเป็นกลุ่มหรือ IP เดี่ยว
    const isCloudflare = isCloudflareIP(ip);
    
    if (isCloudflare) {
      // ดึงข้อมูลกลุ่ม
      const groupKey = getIPGroupKey(ip);
      const displayIP = getDisplayIP(ip, groupKey);
      
      const [ipStats] = await pool.query(`
        SELECT 
          '${groupKey}' as group_key,
          '${displayIP}' as display_ip,
          COUNT(DISTINCT ip) as ip_count,
          SUM(CASE 
            WHEN method = 'POST' 
            AND url LIKE '%/backend-api/views/increment%' 
            AND status = 200 
            THEN hits 
            ELSE 0 
          END) as videoViewRequests,
          COUNT(*) as totalRequests,
          MAX(last_access) as lastActivity,
          MIN(first_access) as firstActivity,
          GROUP_CONCAT(DISTINCT user_agent) as userAgents,
          GROUP_CONCAT(DISTINCT device) as devices,
          GROUP_CONCAT(DISTINCT browser) as browsers,
          GROUP_CONCAT(DISTINCT os) as operatingSystems,
          MAX(user_country) as country,
          MAX(city) as city,
          MAX(region) as region,
          MAX(isp) as isp
        FROM access_logs 
        WHERE ip LIKE ?
      `, [`${ip.split('.').slice(0, 2).join('.')}.%`]);

      const [topUrls] = await pool.query(`
        SELECT 
          url,
          SUM(hits) as access_count,
          MAX(last_access) as last_access
        FROM access_logs 
        WHERE ip LIKE ?
        GROUP BY url
        ORDER BY access_count DESC
        LIMIT 10
      `, [`${ip.split('.').slice(0, 2).join('.')}.%`]);

      const [hourlyStats] = await pool.query(`
        SELECT 
          HOUR(last_access) as hour,
          SUM(CASE 
            WHEN method = 'POST' 
            AND url LIKE '%/backend-api/views/increment%' 
            AND status = 200 
            THEN hits 
            ELSE 0 
          END) as requests
        FROM access_logs 
        WHERE ip LIKE ?
        GROUP BY HOUR(last_access)
        ORDER BY hour
      `, [`${ip.split('.').slice(0, 2).join('.')}.%`]);

      const [allIPs] = await pool.query(`
        SELECT 
          ip,
          COUNT(*) as request_count,
          MAX(last_access) as last_activity,
          GROUP_CONCAT(DISTINCT device) as devices
        FROM access_logs 
        WHERE ip LIKE ?
        GROUP BY ip
        ORDER BY last_activity DESC
      `, [`${ip.split('.').slice(0, 2).join('.')}.%`]);

      const stats = ipStats[0];

      const responseData = {
        success: true,
        ip: ip,
        displayIP: displayIP,
        groupKey: groupKey,
        isCloudflareGroup: true,
        ipCount: stats?.ip_count || 0,
        videoViewRequests: stats?.videoViewRequests || 0,
        totalRequests: stats?.totalRequests || 0,
        lastActivity: stats?.lastActivity,
        firstActivity: stats?.firstActivity,
        userAgents: stats?.userAgents ? stats.userAgents.split(',').filter(ua => ua) : [],
        devices: stats?.devices ? [...new Set(stats.devices.split(',').filter(d => d))] : [],
        browsers: stats?.browsers ? [...new Set(stats.browsers.split(',').filter(b => b))] : [],
        operatingSystems: stats?.operatingSystems ? [...new Set(stats.operatingSystems.split(',').filter(os => os))] : [],
        topUrls: topUrls,
        hourlyStats: hourlyStats,
        allIPs: allIPs,
        country: stats?.country || 'Unknown',
        city: stats?.city || 'Unknown',
        region: stats?.region || 'Unknown',
        isp: stats?.isp || 'Unknown',
        isPrivate: false
      };

      console.log('✅ ส่งรายละเอียด IP Group สำเร็จ:', {
        group: groupKey,
        ipCount: responseData.ipCount,
        videoViewRequests: responseData.videoViewRequests
      });

      res.json(responseData);
    } else {
      // ดึงข้อมูล IP เดี่ยว
      const [ipStats] = await pool.query(`
        SELECT 
          SUM(CASE 
            WHEN method = 'POST' 
            AND url LIKE '%/backend-api/views/increment%' 
            AND status = 200 
            THEN hits 
            ELSE 0 
          END) as videoViewRequests,
          COUNT(*) as totalRequests,
          MAX(last_access) as lastActivity,
          MIN(first_access) as firstActivity,
          GROUP_CONCAT(DISTINCT user_agent) as userAgents,
          GROUP_CONCAT(DISTINCT device) as devices,
          GROUP_CONCAT(DISTINCT browser) as browsers,
          GROUP_CONCAT(DISTINCT os) as operatingSystems,
          MAX(user_country) as country,
          MAX(city) as city,
          MAX(region) as region,
          MAX(isp) as isp
        FROM access_logs 
        WHERE ip = ?
      `, [ip]);

      const [topUrls] = await pool.query(`
        SELECT 
          url,
          SUM(hits) as access_count,
          MAX(last_access) as last_access
        FROM access_logs 
        WHERE ip = ?
        GROUP BY url
        ORDER BY access_count DESC
        LIMIT 10
      `, [ip]);

      const [hourlyStats] = await pool.query(`
        SELECT 
          HOUR(last_access) as hour,
          SUM(CASE 
            WHEN method = 'POST' 
            AND url LIKE '%/backend-api/views/increment%' 
            AND status = 200 
            THEN hits 
            ELSE 0 
          END) as requests
        FROM access_logs 
        WHERE ip = ?
        GROUP BY HOUR(last_access)
        ORDER BY hour
      `, [ip]);

      const stats = ipStats[0];

      const responseData = {
        success: true,
        ip: ip,
        isCloudflareGroup: false,
        ipCount: 1,
        videoViewRequests: stats?.videoViewRequests || 0,
        totalRequests: stats?.totalRequests || 0,
        lastActivity: stats?.lastActivity,
        firstActivity: stats?.firstActivity,
        userAgents: stats?.userAgents ? stats.userAgents.split(',').filter(ua => ua) : [],
        devices: stats?.devices ? [...new Set(stats.devices.split(',').filter(d => d))] : [],
        browsers: stats?.browsers ? [...new Set(stats.browsers.split(',').filter(b => b))] : [],
        operatingSystems: stats?.operatingSystems ? [...new Set(stats.operatingSystems.split(',').filter(os => os))] : [],
        topUrls: topUrls,
        hourlyStats: hourlyStats,
        country: stats?.country || 'Unknown',
        city: stats?.city || 'Unknown',
        region: stats?.region || 'Unknown',
        isp: stats?.isp || 'Unknown',
        isPrivate: isPrivateIP(ip)
      };

      console.log('✅ ส่งรายละเอียด IP เดี่ยวสำเร็จ:', {
        ip: ip,
        videoViewRequests: responseData.videoViewRequests
      });

      res.json(responseData);
    }

  } catch (error) {
    console.error('❌ Error fetching IP details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงรายละเอียด IP',
      details: error.message 
    });
  }
});

// ✅ API สำหรับดู IP ทั้งหมดในกลุ่ม
router.get('/ip-group/:groupKey', async (req, res) => {
  try {
    const { groupKey } = req.params;
    
    console.log('🔍 ดึง IP ทั้งหมดในกลุ่ม:', groupKey);

    // ดึงข้อมูลกลุ่มจากตาราง ip_groups
    const [groupInfo] = await pool.query(`
      SELECT * FROM ip_groups WHERE group_key = ?
    `, [groupKey]);

    if (groupInfo.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบกลุ่ม IP นี้'
      });
    }

    const group = groupInfo[0];

    // ดึง IP ทั้งหมดในกลุ่ม
    const [groupIPs] = await pool.query(`
      SELECT 
        ip,
        SUM(CASE 
          WHEN method = 'POST' 
          AND url LIKE '%/backend-api/views/increment%' 
          AND status = 200 
          THEN hits 
          ELSE 0 
        END) as videoViewRequests,
        COUNT(*) as totalRequests,
        MAX(last_access) as lastActivity,
        MIN(first_access) as firstActivity,
        GROUP_CONCAT(DISTINCT user_agent) as userAgents,
        MAX(device) as device,
        MAX(browser) as browser,
        MAX(os) as os,
        MAX(user_country) as country,
        MAX(city) as city,
        MAX(region) as region,
        MAX(isp) as isp
      FROM access_logs 
      WHERE ip LIKE ?
      GROUP BY ip
      ORDER BY lastActivity DESC
    `, [group.ip_pattern]);

    // ดึงสถิติรวมของกลุ่ม
    const [groupStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT ip) as totalIPs,
        SUM(CASE 
          WHEN method = 'POST' 
          AND url LIKE '%/backend-api/views/increment%' 
          AND status = 200 
          THEN hits 
          ELSE 0 
        END) as totalVideoViews,
        SUM(hits) as totalRequests,
        MAX(last_access) as lastActivity,
        MIN(first_access) as firstActivity
      FROM access_logs 
      WHERE ip LIKE ?
    `, [group.ip_pattern]);

    const processedIPs = groupIPs.map(ip => ({
      ip: ip.ip,
      videoViewRequests: ip.videoViewRequests || 0,
      totalRequests: ip.totalRequests || 0,
      lastActivity: ip.lastActivity,
      firstActivity: ip.firstActivity,
      userAgents: ip.userAgents ? ip.userAgents.split(',').filter(ua => ua) : [],
      device: ip.device || 'Unknown',
      browser: ip.browser || 'Unknown',
      os: ip.os || 'Unknown',
      country: ip.country || 'Unknown',
      city: ip.city || 'Unknown',
      region: ip.region || 'Unknown',
      isp: ip.isp || 'Unknown',
      isPrivate: isPrivateIP(ip.ip)
    }));

    res.json({
      success: true,
      group: {
        key: group.group_key,
        name: group.display_name,
        pattern: group.ip_pattern,
        description: group.description
      },
      stats: groupStats[0],
      ips: processedIPs,
      totalIPs: processedIPs.length
    });

  } catch (error) {
    console.error('❌ Error fetching IP group:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่ม IP',
      details: error.message 
    });
  }
});

module.exports = router;