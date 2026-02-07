// healthMonitor.js - System Health Monitoring
const { pool } = require('./config/db');
const logger = require('./logger').Logger('health-monitor');
const { getAPIHealth, testConnection } = require('./gameService');
const { getHealthStatus } = require('./tronWatcher');

let healthCache = {
  lastCheck: null,
  database: { status: 'unknown', latency: 0 },
  gameAPI: { status: 'unknown', latency: 0 },
  tronGrid: { status: 'unknown', consecutiveFailures: 0 },
  memory: { used: 0, total: 0, percentage: 0 },
  uptime: 0
};

/**
 * ✅ ตรวจสอบ Database Health
 */
async function checkDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    
    const latency = Date.now() - startTime;
    
    return {
      status: latency < 100 ? 'healthy' : 'degraded',
      latency,
      healthy: true
    };
  } catch (error) {
    logger.error('Database health check failed', {
      error: error.message
    });
    
    return {
      status: 'unhealthy',
      latency: -1,
      healthy: false,
      error: error.message
    };
  }
}

/**
 * ✅ ตรวจสอบ Memory Usage
 */
function checkMemoryUsage() {
  const usage = process.memoryUsage();
  const totalMem = require('os').totalmem();
  const freeMem = require('os').freemem();
  const usedMem = totalMem - freeMem;
  
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    systemUsed: Math.round(usedMem / 1024 / 1024), // MB
    systemTotal: Math.round(totalMem / 1024 / 1024), // MB
    systemPercentage: Math.round((usedMem / totalMem) * 100)
  };
}

/**
 * ✅ ตรวจสอบสถานะทั้งหมด
 */
async function checkAllHealth() {
  logger.info('🏥 Running health check...');
  
  const [dbHealth, gameAPITest, tronHealth] = await Promise.all([
    checkDatabaseHealth(),
    testConnection(),
    Promise.resolve(getHealthStatus())
  ]);
  
  const gameAPIHealth = getAPIHealth();
  const memory = checkMemoryUsage();
  
  healthCache = {
    lastCheck: new Date().toISOString(),
    database: dbHealth,
    gameAPI: {
      status: gameAPIHealth.isHealthy ? 'healthy' : 'unhealthy',
      latency: gameAPITest.latency || -1,
      consecutiveFailures: gameAPIHealth.consecutiveFailures,
      healthy: gameAPIHealth.isHealthy
    },
    tronGrid: {
      status: tronHealth.isHealthy ? 'healthy' : 'unhealthy',
      consecutiveFailures: tronHealth.consecutiveFailures,
      cacheSize: tronHealth.cacheSize,
      healthy: tronHealth.isHealthy
    },
    memory,
    uptime: Math.round(process.uptime())
  };
  
  // แจ้งเตือนถ้ามีปัญหา
  const issues = [];
  
  if (!dbHealth.healthy) {
    issues.push('Database unreachable');
  }
  
  if (!gameAPIHealth.isHealthy) {
    issues.push('Game API down');
  }
  
  if (!tronHealth.isHealthy) {
    issues.push('TronGrid API down');
  }
  
  if (memory.systemPercentage > 90) {
    issues.push('High memory usage');
  }
  
  if (issues.length > 0) {
    logger.warn('⚠️ Health issues detected', { issues });
  } else {
    logger.info('✅ All systems healthy');
  }
  
  return healthCache;
}

/**
 * ✅ ดึงสถานะสุขภาพล่าสุด
 */
function getHealthCache() {
  return healthCache;
}

/**
 * ✅ ตรวจสอบว่าระบบพร้อมใช้งานหรือไม่
 */
function isSystemReady() {
  const { database, gameAPI, tronGrid } = healthCache;
  
  return database.healthy && 
         (gameAPI.healthy || gameAPI.consecutiveFailures < 5) &&
         (tronGrid.healthy || tronGrid.consecutiveFailures < 10);
}

/**
 * ✅ ดึงสถิติระบบ
 */
async function getSystemStats() {
  try {
    // ดึงสถิติจากฐานข้อมูล
    const [depositStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_deposits,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_deposits,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_deposits,
        SUM(CASE WHEN status = 'paid' THEN cny_amount ELSE 0 END) as total_paid_cny,
        SUM(CASE WHEN status = 'paid' THEN usdt_amount ELSE 0 END) as total_paid_usdt
      FROM crypto_deposits
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    const [withdrawStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_withdraws,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_withdraws,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_withdraws,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid_amount
      FROM withdraw_requests
      WHERE requested_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    return {
      deposits: depositStats[0],
      withdrawals: withdrawStats[0],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting system stats', {
      error: error.message
    });
    
    return null;
  }
}

/**
 * ✅ Express Middleware - Health Check Endpoint
 */
function healthCheckMiddleware(req, res) {
  const health = getHealthCache();
  const isReady = isSystemReady();
  
  const statusCode = isReady ? 200 : 503;
  
  res.status(statusCode).json({
    status: isReady ? 'ok' : 'degraded',
    timestamp: health.lastCheck,
    uptime: health.uptime,
    components: {
      database: health.database,
      gameAPI: health.gameAPI,
      tronGrid: health.tronGrid
    },
    memory: health.memory,
    ready: isReady
  });
}

/**
 * ✅ Express Middleware - Stats Endpoint
 */
async function statsMiddleware(req, res) {
  try {
    const stats = await getSystemStats();
    const health = getHealthCache();
    
    res.json({
      success: true,
      health: {
        database: health.database.status,
        gameAPI: health.gameAPI.status,
        tronGrid: health.tronGrid.status
      },
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  checkAllHealth,
  checkDatabaseHealth,
  checkMemoryUsage,
  getHealthCache,
  isSystemReady,
  getSystemStats,
  healthCheckMiddleware,
  statsMiddleware
};