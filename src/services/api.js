// api.js
import CryptoJS from 'crypto-js';

export const API_CONFIG = {
  baseUrl: '/api/game',
  serverUrl: '/api/server',
  backendUrl: '/backend-api',
  sn: 'tnv',
  secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

// ✅ ฟังก์ชันใหม่: ดึงรูปปกของเกมตามรหัส
export const getGameCover = async (gameCode) => {
  try {
    const res = await fetch(`${API_CONFIG.backendUrl}/game-images/cover/${gameCode}`);
    if (!res.ok) throw new Error('Failed to fetch cover');
    const data = await res.json();
    return data.data?.imageUrl || '/uploads/games/default/default-cover.jpg';
  } catch (error) {
    console.error('Error fetching game cover:', error);
    return '/uploads/games/default/default-cover.jpg';
  }
};

export const getGameCovers = async (gameCodes) => {
  try {
    if (!gameCodes || gameCodes.length === 0) {
      return [];
    }
    
    const res = await fetch('/backend-api/game-covers/covers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameCodes })
    });
    
    const data = await res.json();
    
    if (data.code === 10000) {
      console.log(`✅ ได้รูป ${data.data?.length || 0} ตัวจาก covers API`);
      return data.data || [];  // ✅ ส่ง array ว่าง ถ้าไม่เจอ
    }
    
    console.warn('⚠️ covers API ล้มเหลว:', data.msg);
    return [];
  } catch (error) {
    console.error('❌ Error fetching covers:', error);
    return [];
  }
};

export const getAllGameCoversFromDB = async () => {
  try {
    const res = await fetch('/backend-api/game-covers/all');
    const data = await res.json();
    
    if (data.code === 10000) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const getAllGameCovers = async () => {
  try {
    const res = await fetch('/backend-api/game-covers/all');
    const data = await res.json();
    if (data.code === 10000) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching all covers:', error);
    return [];
  }
};

// ฟังก์ชันทดสอบ API endpoint
export const testApiEndpoint = async (endpoint, payload) => {
  try {
    const random = Math.random().toString(36).substring(2, 18);
    const signStr = `${random}${API_CONFIG.sn}${API_CONFIG.secret}`;
    const sign = CryptoJS.MD5(signStr).toString();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'sn': API_CONFIG.sn, 'random': random, 'sign': sign },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data, status: res.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ฟังก์ชันหลักสำหรับเรียก API
export const apiCall = async (action, payload, baseUrl = API_CONFIG.baseUrl) => {
  try {
    const random = Math.random().toString(36).substring(2, 18);
    const signStr = `${random}${API_CONFIG.sn}${API_CONFIG.secret}`;
    const sign = CryptoJS.MD5(signStr).toString();
    const res = await fetch(`${baseUrl}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'sn': API_CONFIG.sn, 'random': random, 'sign': sign },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    return { code: -1, msg: error.message, data: null };
  }
};

// ฟังก์ชันตรวจสอบบัญชี
export const checkAccount = async (playerId) => {
  try {
    const result = await apiCall('gameUrl', {
      playerId: playerId.trim(),
      platType: 'ag',
      currency: 'CNY',
      gameType: '2',
      gameCode: 'CQSL',
      ingress: 'device2',
      lang: 'zh-hans'
    });
    
    const exists = result.code === 10000;
    return {
      exists: exists,
      data: result.data,
      message: result.msg,
      code: result.code
    };
  } catch (error) {
    return { exists: null, error: error.message };
  }
};

// ค่าคงที่สำหรับเกม
export const GAME_TYPES = { 
  '1': '视讯',
  '2': '电子游艺', 
  '3': '彩票游戏', 
  '4': '体育竞技', 
  '5': '电子竞技', 
  '6': '捕鱼游戏', 
  '7': '棋牌游戏',
  '8': '真人娱乐'
};

export const GAME_ICONS = { 
  '1': '👤',
  '2': '🎮', 
  '3': '🎲', 
  '4': '⚽', 
  '5': '🎯', 
  '6': '🎣', 
  '7': '🃏',
  '8': '👤'
};

// เกมสำรอง
// ✅ วิธีแก้ 1: อัปเดต getFallbackGames ให้ใช้เกมที่มีจริง
export const getFallbackGames = () => [
  { 
    platType: 'ag', 
    gameType: '1', 
    gameCode: 'BAC', 
    gameName: { 'zh-hans': '百家乐' }, 
    imageUrl: '/uploads/games/covers/BAC.jpg', 
    status: 1 
  },
  { 
    platType: 'ag', 
    gameType: '1', 
    gameCode: 'DT', 
    gameName: { 'zh-hans': '龙虎' }, 
    imageUrl: '/uploads/games/covers/DT.jpg', 
    status: 1 
  },
  { 
    platType: 'ag', 
    gameType: '1', 
    gameCode: 'SHB', 
    gameName: { 'zh-hans': '骰宝' }, 
    imageUrl: '/uploads/games/covers/SHB.jpg', 
    status: 1 
  },
];

// ฟังก์ชัน: ค้นหาคงเหลือในแพลตฟอร์มเดียว
export const queryBalance = async (playerId, platType = 'ag', currency = 'CNY') => {
  try {
    const result = await apiCall('balance', {
      playerId: playerId.trim(),
      platType: platType,
      currency: currency
    });
    
    return {
      success: result.code === 10000,
      balance: result.data?.balance,
      message: result.msg,
      code: result.code
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ฟังก์ชัน: ค้นหาคงเหลือในทุกแพลตฟอร์ม
export const queryAllBalances = async (playerId, currency = 'CNY') => {
  try {
    const result = await apiCall('balanceAll', {
      playerId: playerId.trim(),
      currency: currency
    });
    
    return {
      success: result.code === 10000,
      balances: result.data,
      message: result.msg,
      code: result.code
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ฟังก์ชัน: เรียกคืนเงินทั้งหมดจากทุกแพลตฟอร์ม
export const transferAllBalances = async (playerId, currency = 'CNY') => {
  try {
    const result = await apiCall('transferAll', {
      playerId: playerId.trim(),
      currency: currency
    });

    return {
      success: result.code === 10000,
      transferResult: result.data,
      message: result.msg,
      code: result.code
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ฟังก์ชัน: โอนย้ายเงิน (เข้าหรือออก)
export const transferAmount = async (playerId, platType, currency, type, amount, orderId) => {
  try {
    const result = await apiCall('transfer', {
      playerId: playerId.trim(),
      platType: platType,
      currency: currency,
      type: type,
      amount: amount,
      orderId: orderId || Math.random().toString(36).substring(2, 18)
    });
    
    return {
      success: result.code === 10000,
      data: result.data,
      message: result.msg,
      code: result.code
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ฟังก์ชัน: รับลิงค์เกมทดลองเล่น
export const getDemoGameUrl = async (platType = 'ag', currency = 'CNY', gameType = '2', gameCode = '', lang = 'zh-hans', ingress = 'device2') => {
  try {
    const result = await apiCall('demoUrl', {
      platType: platType,
      currency: currency,
      gameType: gameType,
      gameCode: gameCode,
      lang: lang,
      ingress: ingress
    });
    
    return {
      success: result.code === 10000,
      url: result.data?.url,
      message: result.msg,
      code: result.code
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ฟังก์ชัน: ตรวจสอบรหัสผู้เล่น
export const validatePlayerId = (id) => /^[a-z0-9]{5,11}$/.test(id);

// ✅ วิธีแก้ 2: ฟังก์ชันสำหรับโหลดเกมจากฐานข้อมูล
export const loadGameList = async () => {
  try {
    // ✅ ลองเรียก API ดึงเกมทั้งหมด
    const res = await fetch('/backend-api/game-covers/all');
    const data = await res.json();
    
    if (data.code === 10000 && Array.isArray(data.data) && data.data.length > 0) {
      console.log(`✅ ดึงเกม ${data.data.length} ตัวจาก game_covers`);
      
      // แปลงรูปแบบจาก game_covers ให้ตรงกับ game list
      return data.data.map(game => ({
        platType: game.platType || 'ag',
        gameType: game.gameType || '1',
        gameCode: game.gameCode,
        gameName: {
          'zh-hans': game.gameName || game.gameCode
        },
        imageUrl: game.imageUrl,
        status: 1
      }));
    }
    
    console.warn('⚠️ ไม่พบเกมใน game_covers, ใช้ fallback');
    return getFallbackGames();
  } catch (err) {
    console.error('❌ Error loading games:', err);
    return getFallbackGames();
  }
};

// ฟังก์ชัน: รับชื่อเกม
export const getGameName = (game) => {
  if (!game.gameName) return game.gameCode;
  return typeof game.gameName === 'string' 
    ? game.gameName 
    : (game.gameName['zh-hans'] || game.gameName['en'] || game.gameCode);
};

// ฟังก์ชัน: ทดสอบ API endpoint ทั้งหมด
export const testAllApiEndpoints = async (payload) => {
  const endpoints = ['/api/server/create', '/api/game/create', '/api/create'];
  const results = [];
  for (const endpoint of endpoints) {
    results.push({ endpoint, ...(await testApiEndpoint(endpoint, payload)) });
  }
  return results;
};