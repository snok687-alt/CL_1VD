import CryptoJS from 'crypto-js';

// ใช้ค่าเดียวกับ api.js
export const ADMIN_API_CONFIG = {
  baseUrl: '/api/game',
  sn: 'tnv',
  secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

// console.log('Admin API Config:', ADMIN_API_CONFIG);

// ใช้วิธีเดียวกับ api.js เดิม
const generateSignature = () => {
  const random = Math.random().toString(36).substring(2, 18);
  const signStr = `${random}${ADMIN_API_CONFIG.sn}${ADMIN_API_CONFIG.secret}`;
  const sign = CryptoJS.MD5(signStr).toString();
  
  return {
    random,
    sign
  };
};

// ฟังก์ชันเรียก API สำหรับ Admin - ใช้วิธีเดียวกับ api.js
export const adminApiCall = async (action, payload = {}) => {
  try {
    const { random, sign } = generateSignature();
    
    const apiUrl = `${ADMIN_API_CONFIG.baseUrl}/${action}`;
    console.log(`📡 API Call: ${apiUrl}`);
    console.log(`📡 Headers: random=${random}, sign=${sign}`);
    console.log(`📡 Payload:`, payload);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sn': ADMIN_API_CONFIG.sn,
        'random': random,
        'sign': sign,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 API Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📥 API Response Text:', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      throw new Error('Invalid JSON response from server');
    }
    
    console.log('✅ API Response Code:', data.code);
    console.log('✅ API Response Message:', data.msg);
    
    // ตรวจสอบ response code (ใช้ criteria เดียวกับ api.js)
    const isSuccess = data.code === 10000;
    
    return { 
      success: isSuccess, 
      data: data.data || data,
      message: data.msg || '',
      code: data.code,
      originalData: data
    };
  } catch (error) {
    console.error('❌ Admin API Error:', error);
    return { 
      success: false, 
      error: error.message,
      message: error.message,
      data: null,
      code: -1
    };
  }
};

// ฟังก์ชัน delay สำหรับ retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ฟังก์ชันเรียก API แบบ retry
export const adminApiCallWithRetry = async (action, payload = {}, retries = 2, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    if (i > 0) {
      console.log(`🔄 Retry ${i} for ${action} after ${delayMs}ms`);
      await delay(delayMs * i);
    }
    
    const result = await adminApiCall(action, payload);
    
    // ถ้าสำเร็จหรือไม่ใช่ frequent requests ให้ return
    if (result.success || result.code !== 10009) {
      return result;
    }
    
    if (i === retries - 1) {
      console.log(`❌ All retries failed for ${action}`);
      return result;
    }
  }
};

// 1. ดึงข้อมูลสถิติทั้งหมดจากระบบ
export const getDashboardStats = async (currency = 'CNY') => {
  console.log('📊 getDashboardStats called with currency:', currency);
  
  try {
    // ดึงข้อมูล quota (ข้อมูลจริง)
    const quotaResult = await adminApiCall('quota', { 
      currency: currency
    });
    
    console.log('📊 Quota Result:', quotaResult);
    
    let stats = {
      totalPlayers: 0,
      activePlayers: 0,
      totalBalance: 0,
      todayProfit: 0,
      onlinePlayers: 0,
      totalGames: 0,
      todayDeposits: 0,
      todayWithdrawals: 0
    };
    
    if (quotaResult.success && quotaResult.data) {
      const quotaData = quotaResult.data;
      console.log('📊 Quota Data Structure:', quotaData);
      
      // ใช้ข้อมูลจริงจาก quota
      if (quotaData.CNY) {
        stats.totalBalance = parseFloat(quotaData.CNY);
      }
      
      if (quotaData.model) {
        stats.model = quotaData.model;
      }
      
      if (quotaData.costRatio) {
        stats.costRatio = quotaData.costRatio;
      }
    }
    
    return {
      success: true,
      data: stats
    };
    
  } catch (error) {
    console.error('❌ getDashboardStats Error:', error);
    return { 
      success: false,
      error: error.message,
      data: null
    };
  }
};

// 2. ดึงข้อมูลผู้เล่นจากระบบ
export const getRecentPlayers = async (currency = 'CNY', limit = 10) => {
  console.log('👥 getRecentPlayers called with currency:', currency);
  
  try {
    // ใช้ API recordAll เพื่อดึงข้อมูลผู้เล่นจริง
    const result = await adminApiCallWithRetry('recordAll', {
      currency,
      pageNo: 1,
      pageSize: limit
    });
    
    console.log('👥 Recent Players Result:', result);
    
    let players = [];
    
    if (result.success && result.data && result.data.list) {
      // แปลงข้อมูลจาก record เป็นข้อมูลผู้เล่น
      const playerMap = new Map();
      
      result.data.list.forEach(record => {
        const playerId = record.playerId;
        if (!playerMap.has(playerId)) {
          playerMap.set(playerId, {
            playerId,
            lastLogin: record.lastUpdateTime || record.betTime,
            platform: record.platType,
            lastGame: record.gameName,
            totalBet: 0,
            totalWins: 0,
            totalLoss: 0
          });
        }
        
        const player = playerMap.get(playerId);
        player.totalBet += parseFloat(record.betAmount || 0);
        
        const settledAmount = parseFloat(record.settledAmount || 0);
        if (settledAmount > 0) {
          player.totalWins += settledAmount;
        } else {
          player.totalLoss += Math.abs(settledAmount);
        }
      });
      
      // เปลี่ยน Map เป็น Array
      players = Array.from(playerMap.values()).slice(0, limit);
      
      // ดึง balance สำหรับแต่ละผู้เล่น
      for (const player of players) {
        try {
          const balanceResult = await adminApiCall('balanceAll', {
            playerId: player.playerId,
            currency: currency
          });
          
          if (balanceResult.success && balanceResult.data) {
            let totalBalance = 0;
            Object.values(balanceResult.data).forEach(balance => {
              if (balance !== null && balance !== undefined && balance !== 'null') {
                totalBalance += parseFloat(balance);
              }
            });
            player.balance = totalBalance;
          }
        } catch (balanceError) {
          console.log(`⚠️ Cannot get balance for ${player.playerId}:`, balanceError);
          player.balance = 0;
        }
      }
    }
    
    // กำหนดสถานะผู้เล่น
    players = players.map(player => {
      const lastLogin = player.lastLogin ? new Date(player.lastLogin) : null;
      const now = new Date();
      const hoursDiff = lastLogin ? Math.floor((now - lastLogin) / (1000 * 60 * 60)) : 999;
      
      return {
        ...player,
        status: hoursDiff < 1 ? 'online' : 'offline',
        lastLoginText: lastLogin ? formatTimeAgo(lastLogin) : 'ไม่ทราบ'
      };
    });
    
    return { 
      success: true,
      data: players
    };
    
  } catch (error) {
    console.error('❌ getRecentPlayers Error:', error);
    return { 
      success: false,
      error: error.message,
      data: []
    };
  }
};

// 3. ดึงข้อมูลธุรกรรมล่าสุดจาก API
export const getRecentTransactions = async (currency = 'CNY', limit = 10) => {
  console.log('💰 getRecentTransactions called with currency:', currency);
  
  try {
    const result = await adminApiCallWithRetry('recordAll', {
      currency,
      pageNo: 1,
      pageSize: limit
    });
    
    console.log('💰 Transactions Result:', result);
    
    let transactions = [];
    
    if (result.success && result.data && result.data.list) {
      transactions = result.data.list.map(record => {
        const betAmount = parseFloat(record.betAmount || 0);
        const winAmount = parseFloat(record.settledAmount || 0);
        
        let type = 'game_bet';
        let amount = winAmount - betAmount;
        
        if (betAmount > 0 && winAmount === 0) {
          type = 'loss';
        } else if (betAmount === 0 && winAmount > 0) {
          type = 'bonus';
          amount = winAmount;
        }
        
        return {
          id: record.gameOrderId || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          playerId: record.playerId,
          type: type,
          amount: amount,
          betAmount: betAmount,
          winAmount: winAmount,
          platform: record.platType,
          game: record.gameName,
          time: record.lastUpdateTime || record.betTime,
          status: record.status === 1 ? 'success' : 'pending',
          details: {
            round: record.round,
            table: record.table,
            betContent: record.betContent
          }
        };
      });
    }
    
    return { 
      success: true, 
      data: transactions 
    };
    
  } catch (error) {
    console.error('❌ getRecentTransactions Error:', error);
    return { 
      success: false,
      error: error.message,
      data: []
    };
  }
};

// 4. ดึงสถิติแพลตฟอร์มเกมจาก API
export const getPlatformStats = async (currency = 'CNY') => {
  console.log('🎮 getPlatformStats called with currency:', currency);
  
  try {
    // ดึงข้อมูล quota เพื่อใช้ ratios จริง
    const quotaResult = await adminApiCall('quota', { 
      currency: currency
    });
    
    // ดึงข้อมูลธุรกรรมล่าสุด
    const recordResult = await adminApiCallWithRetry('recordAll', {
      currency,
      pageNo: 1,
      pageSize: 100
    });
    
    console.log('🎮 Platform Stats Results:', { quotaResult, recordResult });
    
    let ratios = [];
    if (quotaResult.success && quotaResult.data && quotaResult.data.ratios) {
      ratios = quotaResult.data.ratios;
    }
    
    const platformStats = {};
    
    // คำนวณสถิติจากข้อมูลธุรกรรม
    if (recordResult.success && recordResult.data && recordResult.data.list) {
      recordResult.data.list.forEach(record => {
        const platform = record.platType?.toUpperCase() || 'UNKNOWN';
        
        if (!platformStats[platform]) {
          platformStats[platform] = {
            platform,
            players: new Set(),
            totalBet: 0,
            totalWin: 0,
            profit: 0,
            gameCount: 0,
            transactions: []
          };
        }
        
        const stats = platformStats[platform];
        stats.players.add(record.playerId);
        stats.totalBet += parseFloat(record.betAmount || 0);
        stats.totalWin += parseFloat(record.settledAmount || 0);
        stats.profit += (parseFloat(record.betAmount || 0) - parseFloat(record.settledAmount || 0));
        stats.gameCount++;
        stats.transactions.push({
          playerId: record.playerId,
          betAmount: parseFloat(record.betAmount || 0),
          winAmount: parseFloat(record.settledAmount || 0),
          time: record.lastUpdateTime || record.betTime
        });
      });
    }
    
    // แปลงเป็น array และเพิ่มข้อมูล commission
    let statsArray = Object.values(platformStats).map(stats => {
      const platformLower = stats.platform.toLowerCase();
      const commission = ratios.find(r => r.platfrom === platformLower);
      
      return {
        platform: stats.platform,
        players: stats.players.size,
        totalBet: stats.totalBet,
        totalWin: stats.totalWin,
        profit: stats.profit,
        gameCount: stats.gameCount,
        avgBet: stats.gameCount > 0 ? stats.totalBet / stats.gameCount : 0,
        trend: stats.profit > 0 ? 'up' : stats.profit < 0 ? 'down' : 'stable',
        commission: commission ? commission.ratio * 100 : 0
      };
    });
    
    // เรียงตามกำไร
    statsArray.sort((a, b) => b.profit - a.profit);
    
    return { 
      success: true, 
      data: statsArray 
    };
    
  } catch (error) {
    console.error('❌ getPlatformStats Error:', error);
    return { 
      success: false,
      error: error.message,
      data: []
    };
  }
};

// 5. ดึงยอดเงินรวมของระบบจาก API
export const getSystemQuota = async (currency = 'CNY') => {
  console.log('💳 getSystemQuota called with currency:', currency);
  
  try {
    const result = await adminApiCall('quota', { 
      currency: currency
    });
    
    console.log('💳 System Quota Result:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to get system quota');
    }
    
    const quotaData = result.data || {};
    
    return {
      success: true,
      data: {
        totalQuota: quotaData.CNY ? parseFloat(quotaData.CNY) : 0,
        costRatio: quotaData.costRatio || 1.00,
        ratios: quotaData.ratios || [],
        model: quotaData.model || '1',
        rawData: quotaData
      }
    };
    
  } catch (error) {
    console.error('❌ getSystemQuota Error:', error);
    return { 
      success: false,
      error: error.message,
      data: null
    };
  }
};

// 6. เช็คสถานะระบบจาก API จริง
export const checkSystemStatus = async () => {
  console.log('🔧 checkSystemStatus called');
  
  const apiStatus = [];
  const startTime = Date.now();
  
  try {
    // Test quota API
    const quotaStart = Date.now();
    const quotaResult = await adminApiCall('quota', { 
      currency: 'CNY'
    });
    const quotaEnd = Date.now();
    
    apiStatus.push({
      name: 'quota',
      status: quotaResult.success ? 'online' : 'offline',
      responseTime: quotaEnd - quotaStart,
      message: quotaResult.message || (quotaResult.success ? 'OK' : 'Failed'),
      code: quotaResult.code,
      data: quotaResult.data ? 'Available' : 'No data'
    });
    
    // Test recordAll API
    const recordStart = Date.now();
    const recordResult = await adminApiCall('recordAll', { 
      currency: 'CNY',
      pageNo: 1,
      pageSize: 1
    });
    const recordEnd = Date.now();
    
    apiStatus.push({
      name: 'recordAll',
      status: recordResult.code === 10009 ? 'rate_limited' : (recordResult.success ? 'online' : 'offline'),
      responseTime: recordEnd - recordStart,
      message: recordResult.message || (recordResult.success ? 'OK' : 'Failed'),
      code: recordResult.code,
      data: recordResult.data ? 'Available' : 'No data'
    });
    
    // Test balanceAll API
    const balanceStart = Date.now();
    const balanceResult = await adminApiCall('balanceAll', { 
      playerId: 'test001',
      currency: 'CNY'
    });
    const balanceEnd = Date.now();
    
    apiStatus.push({
      name: 'balanceAll',
      status: balanceResult.success ? 'online' : 'offline',
      responseTime: balanceEnd - balanceStart,
      message: balanceResult.message || (balanceResult.success ? 'OK' : 'Failed'),
      code: balanceResult.code,
      data: balanceResult.data ? 'Available' : 'No data'
    });
    
    const onlineCount = apiStatus.filter(r => r.status === 'online').length;
    const totalApis = apiStatus.length;
    
    let systemStatus;
    if (onlineCount === totalApis) {
      systemStatus = 'online';
    } else if (onlineCount > 0) {
      systemStatus = 'degraded';
    } else {
      systemStatus = 'offline';
    }
    
    console.log('🔧 System Status:', {
      systemStatus,
      onlineCount,
      totalApis,
      apiStatus
    });
    
    return {
      success: true,
      data: {
        systemStatus,
        apiStatus,
        overallHealth: `${onlineCount}/${totalApis} APIs working`,
        lastChecked: new Date().toISOString(),
        totalResponseTime: Date.now() - startTime
      }
    };
    
  } catch (error) {
    console.error('❌ checkSystemStatus Error:', error);
    
    return {
      success: false,
      error: error.message,
      data: {
        systemStatus: 'error',
        apiStatus: [],
        overallHealth: 'Error checking system status',
        lastChecked: new Date().toISOString(),
        error: error.message
      }
    };
  }
};

// 7. ดึงข้อมูลทั้งหมดพร้อมกัน
export const getAllDashboardData = async (currency = 'CNY') => {
  console.log('📈 getAllDashboardData called with currency:', currency);
  
  try {
    const [quotaResult, recordResult, statusResult] = await Promise.all([
      adminApiCall('quota', { currency }),
      adminApiCallWithRetry('recordAll', { currency, pageNo: 1, pageSize: 50 }),
      checkSystemStatus()
    ]);
    
    return {
      success: true,
      data: {
        quota: quotaResult,
        records: recordResult,
        status: statusResult,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ getAllDashboardData Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function: แปลงเวลาเป็นภาษามนุษย์
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'ไม่กี่นาทีที่แล้ว';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  return `${diffDays} วันที่แล้ว`;
};

export default {
  ADMIN_API_CONFIG,
  adminApiCall,
  adminApiCallWithRetry,
  getDashboardStats,
  getRecentPlayers,
  getRecentTransactions,
  getPlatformStats,
  getSystemQuota,
  checkSystemStatus,
  getAllDashboardData
};