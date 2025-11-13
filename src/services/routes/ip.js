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

// ดึงรายการ IP
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

    // Base query - นับจำนวน project ที่เข้าใช้งาน
    let query = `
      SELECT 
        ip,
        COUNT(DISTINCT CASE WHEN url LIKE '/project/%' THEN url END) as project_access_count,
        COUNT(*) as total_requests,
        MAX(last_access) as last_activity,
        MIN(first_access) as first_activity,
        GROUP_CONCAT(DISTINCT user_agent) as user_agents,
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

    // Add grouping and pagination
    query += ` 
      GROUP BY ip 
      ORDER BY total_requests DESC, last_activity DESC 
      LIMIT ? OFFSET ?
    `;
    queryParams.push(parseInt(limit), parseInt(offset));

    console.log('🔍 Query IP list:', query);
    console.log('📋 Query params:', queryParams);

    const [ips] = await pool.query(query, queryParams);

    // ดึงจำนวนทั้งหมดสำหรับ pagination
    let countQuery = `
      SELECT COUNT(DISTINCT ip) as total 
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

    // นับ IP ที่ต้องตรวจสอบ (private IPs)
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

    // นับจำนวนประเทศที่ไม่ซ้ำ
    let countryQuery = `
      SELECT COUNT(DISTINCT user_country) as total_countries 
      FROM access_logs 
      WHERE last_access >= ? AND user_country IS NOT NULL AND user_country != ''
    `;
    const [countryResult] = await pool.query(countryQuery, [startDate]);
    const totalCountries = countryResult[0]?.total_countries || 0;

    // ประมวลผลข้อมูล IP
    const processedIPs = ips.map(ip => ({
      ip: ip.ip,
      projectAccessCount: ip.project_access_count || 0,
      totalRequests: ip.total_requests || 0,
      lastActivity: ip.last_activity,
      firstActivity: ip.first_activity,
      userAgents: ip.user_agents ? ip.user_agents.split(',').filter(ua => ua) : [],
      device: ip.device || 'Unknown',
      browser: ip.browser || 'Unknown',
      os: ip.os || 'Unknown',
      country: ip.country || 'Unknown',
      city: ip.city || 'Unknown',
      region: ip.region || 'Unknown',
      isp: ip.isp || 'Unknown',
      isPrivate: isPrivateIP(ip.ip)
    }));

    console.log('✅ ส่งข้อมูล IP list สำเร็จ:', {
      totalIPs: total,
      currentPage: page,
      totalPages: totalPages,
      returnedIPs: processedIPs.length,
      suspiciousIPs: suspiciousIPs,
      totalCountries: totalCountries
    });

    res.json({
      success: true,
      ips: processedIPs,
      totalPages,
      totalIPs: total,
      recentIPs: processedIPs.length,
      totalCountries: totalCountries,
      suspiciousIPs: suspiciousIPs
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

// ดึงรายละเอียด IP
router.get('/ip-details/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    
    console.log('🔍 ดึงรายละเอียด IP:', ip);

    // ดึงข้อมูลพื้นฐาน
    const [ipStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(DISTINCT CASE WHEN url LIKE '/project/%' THEN url END) as project_access_count,
        MAX(last_access) as last_activity,
        MIN(first_access) as first_activity,
        GROUP_CONCAT(DISTINCT user_agent) as user_agents,
        GROUP_CONCAT(DISTINCT device) as devices,
        GROUP_CONCAT(DISTINCT browser) as browsers,
        GROUP_CONCAT(DISTINCT os) as os_list,
        MAX(user_country) as country,
        MAX(city) as city,
        MAX(region) as region,
        MAX(isp) as isp
      FROM access_logs 
      WHERE ip = ?
    `, [ip]);

    // ดึง URL ที่เข้าชมบ่อย
    const [topUrls] = await pool.query(`
      SELECT 
        url,
        COUNT(*) as access_count,
        MAX(last_access) as last_access
      FROM access_logs 
      WHERE ip = ?
      GROUP BY url
      ORDER BY access_count DESC
      LIMIT 10
    `, [ip]);

    // ดึงสถิติการใช้งานตามเวลา
    const [hourlyStats] = await pool.query(`
      SELECT 
        HOUR(last_access) as hour,
        COUNT(*) as requests
      FROM access_logs 
      WHERE ip = ?
      GROUP BY HOUR(last_access)
      ORDER BY hour
    `, [ip]);

    const stats = ipStats[0];

    // ประมวลผลข้อมูล
    const userAgents = stats?.user_agents ? 
      stats.user_agents.split(',').filter(ua => ua && ua.trim() !== '') : [];
    
    const devices = stats?.devices ? 
      stats.devices.split(',').filter(d => d && d.trim() !== '') : [];
    
    const browsers = stats?.browsers ? 
      stats.browsers.split(',').filter(b => b && b.trim() !== '') : [];
    
    const osList = stats?.os_list ? 
      stats.os_list.split(',').filter(os => os && os.trim() !== '') : [];

    const responseData = {
      success: true,
      ip: ip,
      totalRequests: stats?.total_requests || 0,
      projectAccessCount: stats?.project_access_count || 0,
      lastActivity: stats?.last_activity,
      firstActivity: stats?.first_activity,
      userAgents: userAgents,
      devices: [...new Set(devices)], // Remove duplicates
      browsers: [...new Set(browsers)],
      operatingSystems: [...new Set(osList)],
      topUrls: topUrls,
      hourlyStats: hourlyStats,
      country: stats?.country || 'Unknown',
      city: stats?.city || 'Unknown',
      region: stats?.region || 'Unknown',
      isp: stats?.isp || 'Unknown',
      isPrivate: isPrivateIP(ip)
    };

    console.log('✅ ส่งรายละเอียด IP สำเร็จ:', {
      ip: ip,
      totalRequests: responseData.totalRequests,
      projectAccessCount: responseData.projectAccessCount,
      userAgentsCount: responseData.userAgents.length
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

module.exports = router;