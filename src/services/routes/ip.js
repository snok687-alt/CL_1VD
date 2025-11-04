const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// ฟังก์ชันตรวจสอบ IP
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
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Base query - นับจำนวน project ที่เข้าใช้งาน (นับจาก path ที่เป็น project)
    let query = `
      SELECT 
        ip,
        COUNT(DISTINCT CASE WHEN url LIKE '/project/%' THEN url END) as project_access_count,
        COUNT(*) as total_requests,
        MAX(last_access) as last_activity,
        MIN(last_access) as first_activity,
        GROUP_CONCAT(DISTINCT user_agent) as user_agents
      FROM access_logs 
      WHERE last_access >= ?
    `;

    const queryParams = [startDate];

    // Add search filter
    if (search && search.trim() !== '') {
      query += ` AND (ip LIKE ? OR user_agent LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Add grouping and pagination
    query += ` 
      GROUP BY ip 
      ORDER BY project_access_count DESC, last_activity DESC 
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
      countQuery += ` AND (ip LIKE ? OR user_agent LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
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

    // ประมวลผลข้อมูล IP
    const processedIPs = ips.map(ip => ({
      ip: ip.ip,
      projectAccessCount: ip.project_access_count || 0, // จำนวนครั้งที่เข้า project
      totalRequests: ip.total_requests || 0, // จำนวน request ทั้งหมด
      lastActivity: ip.last_activity,
      firstActivity: ip.first_activity,
      userAgents: ip.user_agents ? ip.user_agents.split(',').filter(ua => ua) : [],
      isPrivate: isPrivateIP(ip.ip)
    }));

    console.log('✅ ส่งข้อมูล IP list สำเร็จ:', {
      totalIPs: total,
      currentPage: page,
      totalPages: totalPages,
      returnedIPs: processedIPs.length,
      suspiciousIPs: suspiciousIPs
    });

    res.json({
      success: true,
      ips: processedIPs,
      totalPages,
      totalIPs: total,
      recentIPs: processedIPs.length,
      totalCountries: 1, // ใช้ค่าเริ่มต้นก่อน
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

    // ดึงข้อมูลพื้นฐาน - นับจำนวน project ที่เข้าใช้งาน
    const [ipStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(DISTINCT CASE WHEN url LIKE '/project/%' THEN url END) as project_access_count,
        MAX(last_access) as last_activity,
        MIN(last_access) as first_activity,
        GROUP_CONCAT(DISTINCT user_agent) as user_agents
      FROM access_logs 
      WHERE ip = ?
    `, [ip]);

    // ดึง project ที่เข้าชมบ่อย
    const [topProjects] = await pool.query(`
      SELECT 
        url,
        COUNT(*) as count
      FROM access_logs 
      WHERE ip = ? AND url LIKE '/project/%'
      GROUP BY url
      ORDER BY count DESC
      LIMIT 10
    `, [ip]);

    const stats = ipStats[0];

    // ประมวลผล user agents
    const userAgents = stats?.user_agents ? 
      stats.user_agents.split(',').filter(ua => ua && ua.trim() !== '') : 
      [];

    const responseData = {
      success: true,
      ip: ip,
      totalRequests: stats?.total_requests || 0,
      projectAccessCount: stats?.project_access_count || 0, // จำนวนครั้งที่เข้า project
      lastActivity: stats?.last_activity,
      firstActivity: stats?.first_activity,
      userAgents: userAgents,
      topProjects: topProjects, // โครงการที่เข้าชมบ่อย
      country: 'Thailand', // ใช้ค่าเริ่มต้น
      city: 'ไม่ทราบ',
      region: 'ไม่ทราบ',
      isp: 'ไม่ทราบ',
      isPrivate: isPrivateIP(ip)
    };

    console.log('✅ ส่งรายละเอียด IP สำเร็จ:', {
      ip: ip,
      totalRequests: responseData.totalRequests,
      projectAccessCount: responseData.projectAccessCount,
      userAgentsCount: responseData.userAgents.length,
      topProjectsCount: responseData.topProjects.length
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