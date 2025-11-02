import React, { useState, useEffect } from 'react';
import { AlertCircle, User, Lock, Wallet, History, LogOut, Settings, Users, DollarSign, TrendingUp, Search, Filter, Check, X, Menu, Play, RefreshCw, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';

const ADMIN_USERNAME = 'admin55';
const ADMIN_PASSWORD = 'admin1234';

const generateRandom = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const md5 = (str) => {
  const rotateLeft = (n, s) => (n << s) | (n >>> (32 - s));
  const addUnsigned = (x, y) => {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  };
  
  const utf8Encode = (str) => unescape(encodeURIComponent(str));
  const convertToWordArray = (str) => {
    const words = [];
    for (let i = 0; i < str.length * 8; i += 8) {
      words[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (i % 32);
    }
    return words;
  };
  
  const wordToHex = (words) => {
    let hex = '';
    for (let i = 0; i < words.length * 4; i++) {
      hex += ((words[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF).toString(16) +
             ((words[i >> 2] >> ((i % 4) * 8)) & 0xF).toString(16);
    }
    return hex;
  };
  
  const FF = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned((b & c) | ((~b) & d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  
  const GG = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned((b & d) | (c & (~d)), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  
  const HH = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(b ^ c ^ d, x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  
  const II = (a, b, c, d, x, s, ac) => {
    a = addUnsigned(a, addUnsigned(addUnsigned(c ^ (b | (~d)), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  
  const x = convertToWordArray(utf8Encode(str));
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  
  x[str.length * 8 >> 5] |= 0x80 << ((str.length * 8) % 32);
  x[(((str.length * 8 + 64) >>> 9) << 4) + 14] = str.length * 8;
  
  for (let i = 0; i < x.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d;
    a = FF(a, b, c, d, x[i + 0], 7, 0xD76AA478);
    d = FF(d, a, b, c, x[i + 1], 12, 0xE8C7B756);
    c = FF(c, d, a, b, x[i + 2], 17, 0x242070DB);
    b = FF(b, c, d, a, x[i + 3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[i + 4], 7, 0xF57C0FAF);
    d = FF(d, a, b, c, x[i + 5], 12, 0x4787C62A);
    c = FF(c, d, a, b, x[i + 6], 17, 0xA8304613);
    b = FF(b, c, d, a, x[i + 7], 22, 0xFD469501);
    a = FF(a, b, c, d, x[i + 8], 7, 0x698098D8);
    d = FF(d, a, b, c, x[i + 9], 12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[i + 10], 17, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[i + 11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, x[i + 12], 7, 0x6B901122);
    d = FF(d, a, b, c, x[i + 13], 12, 0xFD987193);
    c = FF(c, d, a, b, x[i + 14], 17, 0xA679438E);
    b = FF(b, c, d, a, x[i + 15], 22, 0x49B40821);
    a = GG(a, b, c, d, x[i + 1], 5, 0xF61E2562);
    d = GG(d, a, b, c, x[i + 6], 9, 0xC040B340);
    c = GG(c, d, a, b, x[i + 11], 14, 0x265E5A51);
    b = GG(b, c, d, a, x[i + 0], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[i + 5], 5, 0xD62F105D);
    d = GG(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[i + 15], 14, 0xD8A1E681);
    b = GG(b, c, d, a, x[i + 4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[i + 9], 5, 0x21E1CDE6);
    d = GG(d, a, b, c, x[i + 14], 9, 0xC33707D6);
    c = GG(c, d, a, b, x[i + 3], 14, 0xF4D50D87);
    b = GG(b, c, d, a, x[i + 8], 20, 0x455A14ED);
    a = GG(a, b, c, d, x[i + 13], 5, 0xA9E3E905);
    d = GG(d, a, b, c, x[i + 2], 9, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[i + 7], 14, 0x676F02D9);
    b = GG(b, c, d, a, x[i + 12], 20, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[i + 5], 4, 0xFFFA3942);
    d = HH(d, a, b, c, x[i + 8], 11, 0x8771F681);
    c = HH(c, d, a, b, x[i + 11], 16, 0x6D9D6122);
    b = HH(b, c, d, a, x[i + 14], 23, 0xFDE5380C);
    a = HH(a, b, c, d, x[i + 1], 4, 0xA4BEEA44);
    d = HH(d, a, b, c, x[i + 4], 11, 0x4BDECFA9);
    c = HH(c, d, a, b, x[i + 7], 16, 0xF6BB4B60);
    b = HH(b, c, d, a, x[i + 10], 23, 0xBEBFBC70);
    a = HH(a, b, c, d, x[i + 13], 4, 0x289B7EC6);
    d = HH(d, a, b, c, x[i + 0], 11, 0xEAA127FA);
    c = HH(c, d, a, b, x[i + 3], 16, 0xD4EF3085);
    b = HH(b, c, d, a, x[i + 6], 23, 0x04881D05);
    a = HH(a, b, c, d, x[i + 9], 4, 0xD9D4D039);
    d = HH(d, a, b, c, x[i + 12], 11, 0xE6DB99E5);
    c = HH(c, d, a, b, x[i + 15], 16, 0x1FA27CF8);
    b = HH(b, c, d, a, x[i + 2], 23, 0xC4AC5665);
    a = II(a, b, c, d, x[i + 0], 6, 0xF4292244);
    d = II(d, a, b, c, x[i + 7], 10, 0x432AFF97);
    c = II(c, d, a, b, x[i + 14], 15, 0xAB9423A7);
    b = II(b, c, d, a, x[i + 5], 21, 0xFC93A039);
    a = II(a, b, c, d, x[i + 12], 6, 0x655B59C3);
    d = II(d, a, b, c, x[i + 3], 10, 0x8F0CCC92);
    c = II(c, d, a, b, x[i + 10], 15, 0xFFEFF47D);
    b = II(b, c, d, a, x[i + 1], 21, 0x85845DD1);
    a = II(a, b, c, d, x[i + 8], 6, 0x6FA87E4F);
    d = II(d, a, b, c, x[i + 15], 10, 0xFE2CE6E0);
    c = II(c, d, a, b, x[i + 6], 15, 0xA3014314);
    b = II(b, c, d, a, x[i + 13], 21, 0x4E0811A1);
    a = II(a, b, c, d, x[i + 4], 6, 0xF7537E82);
    d = II(d, a, b, c, x[i + 11], 10, 0xBD3AF235);
    c = II(c, d, a, b, x[i + 2], 15, 0x2AD7D2BB);
    b = II(b, c, d, a, x[i + 9], 21, 0xEB86D391);
    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }
  
  return wordToHex([a, b, c, d]);
};

const createSignature = () => {
  const random = generateRandom();
  const sn = 'tnv';
  const secretKey = 'VJ3Z394e88U8Gz9wa64sMlW8871m481o';
  const sign = md5(random + sn + secretKey);
  return { sign, random, sn };
};

// ... โค้ดส่วนบน (การสร้าง md5, createSignature) ...

const apiCall = async (endpoint, data) => {
  try {
    const { sign, random, sn } = createSignature();
    
    // ✅ URL ถูกต้องแล้ว: ไม่ต้องระบุ :80
    const API_BASE_URL = 'http://47.238.3.148'; 
    
    // endpoint คือ '/login' ทำให้ URL เป็น http://47.238.3.148/backend-api/proxy/login
    const response = await fetch(`${API_BASE_URL}/backend-api/proxy${endpoint}`, {
      method: 'POST'
    // ... headers และ body ...
    });
    
    // 💡 การจัดการ Response จาก Server Express (ที่ทำ Error Handling มาแล้ว)
    const result = await response.json();
    
    // 💡 เพิ่มการตรวจสอบ Response.ok เพื่อจัดการ HTTP Errors ที่ไม่ใช่ 200 OK
    if (!response.ok) {
        // หาก Server Express ส่ง 500 หรือ 4xx กลับมา
        console.error('Server responded with HTTP Error:', response.status, result);
        return result; // คืนค่า Error message ที่มาจาก Express
    }

    return result;
  } catch (error) {
    console.error('API Call Error:', error);
    return {
      code: 99999,
      // ข้อความที่แจ้งเมื่อเชื่อมต่อไม่สำเร็จ หรือเกิด JSON parse error
      msg: '连接服务器失败 (Connection or Parsing Error)', 
      data: null
    };
  }
};


// ... โค้ดส่วนล่าง (mockUsers, GamingPlatform component, handleLogin) ...


const mockUsers = [
  { playerId: 'test001', password: '123456', currency: 'CNY', balance: 5000 },
  { playerId: 'test002', password: '123456', currency: 'CNY', balance: 3000 },
  { playerId: 'player001', password: '123456', currency: 'CNY', balance: 10000 },
];

export default function GamingPlatform() {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [playerId, setPlayerId] = useState('');
    const [password, setPassword] = useState('');
    const [currency, setCurrency] = useState('CNY');

const handleLogin = async () => {
  if (!playerId || !password) {
    setError('请输入完整信息');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // ✅ ตรวจสอบ Admin
    if (playerId === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setCurrentUser({ playerId: 'admin', currency: 'CNY', balance: 0, role: 'admin' });
      setCurrentView('admin');
      setLoading(false);
      return;
    }

    // ✅ เรียก API login จริง
    const response = await apiCall('/login', {
      playerId,
      password
    });

    if (response.code === 0) {  // ปรับตามโครงสร้าง API จริง
      setCurrentUser({
        playerId: response.data.playerId,
        currency: response.data.currency || 'CNY',
        balance: response.data.balance || 0,
        role: 'player'
      });
      setCurrentView('player');
      setSuccessMsg('登录成功！');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setError(response.msg || '登录失败');
    }
  } catch (err) {
    console.error(err);
    setError('连接服务器失败');
  } finally {
    setLoading(false);
  }
};


    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-blue-200 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {isRegister ? '创建账号' : '欢迎回来'}
            </h1>
            <p className="text-blue-600">
              {isRegister ? '注册新玩家账号' : '登录您的游戏账户'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-blue-700 mb-2 text-sm">玩家账号</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="输入账号"
                  className="w-full bg-blue-50 border border-blue-300 rounded-xl pl-12 pr-4 py-3 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-700 mb-2 text-sm">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full bg-blue-50 border border-blue-300 rounded-xl pl-12 pr-4 py-3 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? '处理中...' : '立即登录'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="text-center text-blue-600 text-xs">
              <div className="font-semibold mb-1">测试账号</div>
              <div>管理员: admin55 / admin1234</div>
              <div>玩家: test001 / 123456</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [transactions] = useState([
      { id: '1', playerId: 'player001', type: 'deposit', amount: 1000, status: 'pending', timestamp: '2025-10-12 14:30' },
      { id: '2', playerId: 'test001', type: 'withdrawal', amount: 500, status: 'approved', timestamp: '2025-10-12 14:25' },
      { id: '3', playerId: 'test002', type: 'deposit', amount: 2000, status: 'pending', timestamp: '2025-10-12 13:15' }
    ]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="bg-white/80 backdrop-blur-xl border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">管理员控制台</h1>
                <p className="text-sm text-blue-600">系统管理</p>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentUser(null);
                setCurrentView('login');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border border-blue-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{mockUsers.length}</div>
              </div>
              <div className="text-blue-700 text-sm">总玩家数</div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl p-6 border border-cyan-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-200 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="text-2xl font-bold text-cyan-900">¥ 3,500</div>
              </div>
              <div className="text-cyan-700 text-sm">总交易额</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border border-green-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">2</div>
              </div>
              <div className="text-green-700 text-sm">待处理交易</div>
            </div>
          </div>

          <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200">
            <h3 className="text-blue-900 font-bold text-lg mb-4">最近交易</h3>
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-blue-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {t.type === 'deposit' ? <ArrowDownCircle className="w-5 h-5 text-green-600" /> : <ArrowUpCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <div className="text-blue-900 font-medium">{t.playerId}</div>
                      <div className="text-blue-600 text-sm">{t.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-900 font-bold">¥ {t.amount.toLocaleString()}</div>
                    <div className={`text-xs ${t.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {t.status === 'pending' ? '待审批' : '已批准'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PlayerDashboard = () => {
    const [activeTab, setActiveTab] = useState('games');
    const [balance] = useState(currentUser?.balance || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('ag');

    const platforms = [
      { id: 'ag', name: 'AG真人', color: 'from-blue-400 to-cyan-400' },
      { id: 'bbin', name: 'BBIN', color: 'from-cyan-400 to-blue-400' },
      { id: 'cq9', name: 'CQ9电子', color: 'from-blue-500 to-cyan-500' },
      { id: 'pg', name: 'PG电子', color: 'from-cyan-500 to-blue-500' },
      { id: 'pp', name: 'PP电子', color: 'from-blue-600 to-cyan-600' },
      { id: 'jdb', name: 'JDB电子', color: 'from-cyan-600 to-blue-600' }
    ];

    const mockGames = [
      { name: '百家乐', platform: 'AG真人' },
      { name: '老虎机', platform: 'CQ9电子' },
      { name: '水果机', platform: 'CQ9电子' },
      { name: '轮盘', platform: 'BBIN' },
      { name: '骰宝', platform: 'AG真人' },
      { name: '龙虎斗', platform: 'AG真人' }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-20">
        <div className="bg-white/80 backdrop-blur-xl border-b border-blue-200 sticky top-0 z-50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-blue-900 font-semibold">{currentUser?.playerId}</div>
                  <div className="text-xs text-blue-600">玩家账户</div>
                </div>
              </div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <Menu className="w-5 h-5 text-blue-700" />
              </button>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="px-4 pt-4">
            <div className="p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{successMsg}</span>
            </div>
          </div>
        )}

        <div className="px-4 py-6">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 backdrop-blur-xl rounded-3xl p-6 border border-blue-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-blue-700 text-sm mb-1">账户余额</div>
                <div className="text-4xl font-bold text-blue-900">¥ {balance.toFixed(2)}</div>
              </div>
              <button className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center hover:bg-blue-300 transition-colors">
                <RefreshCw className="w-5 h-5 text-blue-700" />
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveTab('wallet')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownCircle className="w-5 h-5" />
                充值
              </button>
              <button 
                onClick={() => setActiveTab('wallet')}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpCircle className="w-5 h-5" />
                提现
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-blue-200 flex gap-2">
            <button
              onClick={() => setActiveTab('games')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === 'games' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'text-blue-600'}`}
            >
              游戏大厅
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === 'wallet' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'text-blue-600'}`}
            >
              我的钱包
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === 'history' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'text-blue-600'}`}
            >
              游戏记录
            </button>
          </div>
        </div>

        <div className="px-4">
          {activeTab === 'games' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`bg-gradient-to-br ${platform.color} rounded-2xl p-4 text-white font-bold text-sm transition-all ${selectedPlatform === platform.id ? 'ring-4 ring-blue-300 scale-105' : 'opacity-80'}`}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {mockGames.map((game, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-blue-200 hover:border-blue-300 transition-all">
                    <div className="p-4">
                      <div className="text-blue-900 font-semibold mb-2 truncate text-sm">
                        {game.name}
                      </div>
                      <button
                        onClick={() => setSuccessMsg('游戏即将启动...')}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        立即游戏
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200">
                <h3 className="text-blue-900 font-bold text-lg mb-4 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-blue-500" />
                  钱包管理
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-blue-700 text-sm mb-2">当前余额</div>
                    <div className="text-3xl font-bold text-blue-900">¥ {balance.toFixed(2)}</div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2">
                    <ArrowDownCircle className="w-5 h-5" />
                    充值
                  </button>
                  
                  <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
                    <ArrowUpCircle className="w-5 h-5" />
                    提现
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200">
                <h3 className="text-blue-900 font-bold text-lg mb-4 flex items-center gap-2">
                  <History className="w-6 h-6 text-blue-500" />
                  交易历史
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-blue-100">
                    <div>
                      <div className="text-blue-900 font-medium">充值</div>
                      <div className="text-xs text-blue-600">2025-10-12 14:30</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">+¥ 1,000</div>
                      <div className="text-xs text-green-600">已完成</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-blue-900 font-medium">提现</div>
                      <div className="text-xs text-blue-600">2025-10-11 18:45</div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-600 font-bold">-¥ 500</div>
                      <div className="text-xs text-green-600">已完成</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200">
              <h3 className="text-blue-900 font-bold text-lg mb-4 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-500" />
                游戏记录
              </h3>
              
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-blue-900 font-semibold">百家乐</div>
                    <div className="text-xs text-blue-600">AG真人</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-blue-700">投注: ¥100</div>
                      <div className="text-blue-600 text-xs">2025-10-12 15:30</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">+¥95</div>
                      <div className="text-xs text-green-600">赢</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-blue-900 font-semibold">老虎机</div>
                    <div className="text-xs text-blue-600">CQ9电子</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-blue-700">投注: ¥50</div>
                      <div className="text-blue-600 text-xs">2025-10-12 14:15</div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-600 font-bold">-¥50</div>
                      <div className="text-xs text-red-600">输</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">15</div>
                    <div className="text-xs text-blue-600">总局数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">+¥850</div>
                    <div className="text-xs text-blue-600">总赢额</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-700">60%</div>
                    <div className="text-xs text-blue-600">胜率</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showMenu && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowMenu(false)}>
            <div className="absolute right-4 top-20 bg-white/95 backdrop-blur-xl rounded-2xl p-2 border border-blue-200 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setActiveTab('wallet');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <Wallet className="w-5 h-5" />
                我的钱包
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setActiveTab('history');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <History className="w-5 h-5" />
                游戏记录
              </button>
              <div className="h-px bg-blue-200 my-2"></div>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentView('login');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                退出登录
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {currentView === 'login' && <LoginPage />}
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'player' && <PlayerDashboard />}
    </div>
  );
}