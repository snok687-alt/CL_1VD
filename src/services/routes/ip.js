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

// ✅ ฟังก์ชันจัดกลุ่ม IP ทั้งหมด (ไม่ใช่แค่ Cloudflare)
function getIPGroupKey(ip) {
  if (!ip) return ip;
  
  // ตัด IP เหลือแค่ 2 ส่วนแรก เช่น 192.168.x.x
  const parts = ip.split('.');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  
  return ip;
}

// ✅ ฟังก์ชันสร้าง Display IP
function getDisplayIP(ip) {
  const parts = ip.split('.');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  return ip;
}

// ✅ ดึงรายการ IP (จัดกลุ่มทุก IP)
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

    // ✅ Query ที่จัดกลุ่มทุก IP
    let query = `
      WITH raw_ip_data AS (
        SELECT 
          ip,
          -- จัดกลุ่มทุก IP ตามช่วง /16 (2 ส่วนแรก)
          CONCAT(
            SUBSTRING_INDEX(ip, '.', 2), 
            '.x.x'
          ) as group_key,
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
          GROUP_CONCAT(DISTINCT user_agent SEPARATOR '|||') as userAgents,
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

    // เพิ่ม search filter
    if (search && search.trim() !== '') {
      query += ` AND (ip LIKE ? OR user_agent LIKE ? OR user_country LIKE ? OR city LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` 
        GROUP BY ip, group_key
      ),
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
          GROUP_CONCAT(DISTINCT userAgents SEPARATOR '|||') as allUserAgents,
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

    console.log('🔍 Query IP list with grouping...');
    const [ips] = await pool.query(query, queryParams);

    // ✅ นับจำนวนกลุ่ม IP ทั้งหมด
    let countQuery = `
      SELECT COUNT(DISTINCT CONCAT(
        SUBSTRING_INDEX(ip, '.', 2), 
        '.x.x'
      )) as total 
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
      const ipCount = ip.ip_count || 1;
      const isGrouped = ipCount > 1;
      
      return {
        ip: ip.representative_ip || ip.group_key,
        displayIP: ip.group_key, // แสดงเป็น x.x.x.x
        groupKey: ip.group_key,
        isGrouped: isGrouped,
        ipCount: ipCount,
        videoViewRequests: ip.videoViewRequests || 0,
        totalRequests: ip.totalRequests || 0,
        lastActivity: ip.lastActivity,
        firstActivity: ip.firstActivity,
        userAgents: ip.allUserAgents ? 
          ip.allUserAgents.split('|||').filter(ua => ua && ua.trim()) : [],
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
      totalGroups: total,
      currentPage: page,
      totalPages: totalPages,
      returnedGroups: processedIPs.length,
      suspiciousIPs: suspiciousIPs,
      totalCountries: totalCountries,
      totalVideoViews: totalVideoViews
    });

    res.json({
      success: true,
      ips: processedIPs,
      totalPages,
      totalGroups: total, // เปลี่ยนจาก totalIPs
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

// ✅ ดึงรายละเอียด IP Group
router.get('/ip-details/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    
    console.log('🔍 ดึงรายละเอียด IP:', ip);

    // สร้าง pattern สำหรับค้นหา IP ในกลุ่ม
    let ipPattern = ip;
    let isGroup = false;
    
    // ถ้าเป็น format x.x.x.x หรือ x.x.%.% ให้ถือว่าเป็นกลุ่ม
    if (ip.includes('.x.x') || ip.includes('.%.%')) {
      const parts = ip.split('.');
      ipPattern = `${parts[0]}.${parts[1]}.%`;
      isGroup = true;
    } else {
      // ตรวจสอบว่า IP นี้มีหลาย IP ในกลุ่มเดียวกันไหม
      const groupKey = getIPGroupKey(ip);
      const [groupCheck] = await pool.query(`
        SELECT COUNT(DISTINCT ip) as count
        FROM access_logs 
        WHERE CONCAT(SUBSTRING_INDEX(ip, '.', 2), '.x.x') = ?
      `, [groupKey]);
      
      if (groupCheck[0]?.count > 1) {
        ipPattern = `${ip.split('.').slice(0, 2).join('.')}.%`;
        isGroup = true;
      }
    }

    // Query ข้อมูล
    const whereClause = isGroup ? 'ip LIKE ?' : 'ip = ?';
    
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
        COUNT(DISTINCT ip) as ip_count,
        MAX(last_access) as lastActivity,
        MIN(first_access) as firstActivity,
        GROUP_CONCAT(DISTINCT user_agent SEPARATOR '|||') as userAgents,
        GROUP_CONCAT(DISTINCT device SEPARATOR ',') as devices,
        GROUP_CONCAT(DISTINCT browser SEPARATOR ',') as browsers,
        GROUP_CONCAT(DISTINCT os SEPARATOR ',') as operatingSystems,
        MAX(user_country) as country,
        MAX(city) as city,
        MAX(region) as region,
        MAX(isp) as isp
      FROM access_logs 
      WHERE ${whereClause}
    `, [ipPattern]);

    const [topUrls] = await pool.query(`
      SELECT 
        url,
        SUM(hits) as access_count,
        MAX(last_access) as last_access
      FROM access_logs 
      WHERE ${whereClause}
      GROUP BY url
      ORDER BY access_count DESC
      LIMIT 10
    `, [ipPattern]);

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
      WHERE ${whereClause}
      GROUP BY HOUR(last_access)
      ORDER BY hour
    `, [ipPattern]);

    // ดึงรายการ IP ทั้งหมดในกลุ่ม (ถ้าเป็นกลุ่ม)
    let allIPs = [];
    if (isGroup) {
      const [ips] = await pool.query(`
        SELECT 
          ip,
          COUNT(*) as request_count,
          MAX(last_access) as last_activity,
          GROUP_CONCAT(DISTINCT device) as devices
        FROM access_logs 
        WHERE ${whereClause}
        GROUP BY ip
        ORDER BY last_activity DESC
      `, [ipPattern]);
      allIPs = ips;
    }

    const stats = ipStats[0];
    const groupKey = getIPGroupKey(ip);

    const responseData = {
      success: true,
      ip: ip,
      displayIP: groupKey,
      groupKey: groupKey,
      isGrouped: isGroup,
      ipCount: stats?.ip_count || 1,
      videoViewRequests: stats?.videoViewRequests || 0,
      totalRequests: stats?.totalRequests || 0,
      lastActivity: stats?.lastActivity,
      firstActivity: stats?.firstActivity,
      userAgents: stats?.userAgents ? 
        stats.userAgents.split('|||').filter(ua => ua && ua.trim()) : [],
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
      isPrivate: isPrivateIP(ip)
    };

    console.log('✅ ส่งรายละเอียด IP สำเร็จ:', {
      ip: ip,
      isGrouped: isGroup,
      ipCount: responseData.ipCount,
      videoViewRequests: responseData.videoViewRequests
    });

    res.json(responseData);

  } catch (error) {
    console.error('❌ Error fetching IP details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการดึงรายละเอียด IP',
      details: error.message 
    });
  }
});

// ✅ ดึงรายการ IP ทั้งหมดในกลุ่ม
router.get('/ip-group/:groupKey', async (req, res) => {
  try {
    let { groupKey } = req.params;
    
    console.log('🔍 ดึง IP ทั้งหมดในกลุ่ม:', groupKey);

    // แปลง groupKey เป็น pattern
    // เช่น 192.168.x.x -> 192.168.%
    const parts = groupKey.replace('.x.x', '').split('.');
    const ipPattern = `${parts[0]}.${parts[1]}.%`;

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
        GROUP_CONCAT(DISTINCT user_agent SEPARATOR '|||') as userAgents,
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
    `, [ipPattern]);

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
    `, [ipPattern]);

    const processedIPs = groupIPs.map(ip => ({
      ip: ip.ip,
      videoViewRequests: ip.videoViewRequests || 0,
      totalRequests: ip.totalRequests || 0,
      lastActivity: ip.lastActivity,
      firstActivity: ip.firstActivity,
      userAgents: ip.userAgents ? 
        ip.userAgents.split('|||').filter(ua => ua && ua.trim()) : [],
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
        key: groupKey,
        name: groupKey,
        pattern: ipPattern,
        description: `กลุ่ม IP ที่ขึ้นต้นด้วย ${parts[0]}.${parts[1]}`
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