import React, { useState, useEffect } from 'react';
import {
  Gamepad2, LogOut, User, Loader2, ChevronRight, ExternalLink,
  AlertCircle, X, PlusCircle, CreditCard, CheckCircle,
  Settings, Server, Search, Wallet, RefreshCw, Download, Upload,
  History, BarChart3, Eye, PlayCircle, GamepadIcon
} from 'lucide-react';
import {
  API_CONFIG, apiCall, checkAccount, queryBalance, queryAllBalances,
  transferAllBalances, transferAmount, getDemoGameUrl, validatePlayerId,
  loadGameList, getGameName, GAME_TYPES, GAME_ICONS, getFallbackGames,
  testAllApiEndpoints, getGameCovers
} from '../services/api';

const App = () => {
  // ... (คง state เดิมทั้งหมดไว้เหมือนเดิม)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [gameList, setGameList] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState('2'); // เริ่มที่ 2 (電子游藝)
  const [showGames, setShowGames] = useState(true); // เปิดโชว์เกมเริ่มต้น
  const [gameUrl, setGameUrl] = useState('');
  const [showGameModal, setShowGameModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [apiTestResults, setApiTestResults] = useState([]);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [createForm, setCreateForm] = useState({ playerId: '', platType: 'ag', currency: 'CNY' });
  const [apiConfig, setApiConfig] = useState({ ...API_CONFIG });
  const [accountCheckResult, setAccountCheckResult] = useState(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  const [balances, setBalances] = useState({});
  const [allPlatformBalances, setAllPlatformBalances] = useState({});
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    platType: 'ag',
    type: '1',
    amount: '',
    orderId: ''
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [showTransferHistory, setShowTransferHistory] = useState(false);
  const [showDemoGameModal, setShowDemoGameModal] = useState(false);
  const [demoGameUrl, setDemoGameUrl] = useState('');
  const [demoGameLoading, setDemoGameLoading] = useState(false);
  const [demoGameForm, setDemoGameForm] = useState({
    platType: 'ag',
    currency: 'CNY',
    gameType: '2',
    gameCode: '',
    lang: 'zh-hans',
    ingress: 'device2'
  });

  // ... (คงฟังก์ชันทั้งหมดไว้เหมือนเดิม)
  const loadBalances = async () => {
    if (!user) return;
    setLoading('balance');
    try {
      const balanceResult = await queryBalance(user.playerId, 'ag', 'CNY');
      if (balanceResult.success) {
        setBalances(prev => ({
          ...prev,
          ag: balanceResult.balance || 0
        }));
      }

      const allBalancesResult = await queryAllBalances(user.playerId, 'CNY');
      if (allBalancesResult.success) {
        setAllPlatformBalances(allBalancesResult.balances || {});
      }
    } catch (err) {
      console.error('加载余额失败:', err);
    } finally {
      setLoading('');
    }
  };

  // ✅ ตรงนี้เปลี่ยน
  const handleLoadGameList = async () => {
    try {
      // ✅ ดึงเกมจาก API ที่มีรูปปกแล้ว
      const res = await fetch('/backend-api/game-covers/all');
      const data = await res.json();

      if (data.code === 10000 && data.data && data.data.length > 0) {
        console.log(`✅ ดึงเกม ${data.data.length} ตัว พร้อมรูปปก`);

        // แปลงข้อมูลให้ตรงกับ format ของ frontend
        const games = data.data.map(game => ({
          platType: game.platType || 'ag',
          gameType: game.gameType || '1',
          gameCode: game.gameCode,
          gameName: {
            'zh-hans': game.gameName || game.gameCode
          },
          imageUrl: game.imageUrl, // ✅ ใช้ URL จาก database โดยตรง
          status: 1
        }));

        console.log('✅ ตัวอย่างเกม:', games.slice(0, 3));
        setGameList(games);
      } else {
        console.warn('⚠️ ไม่พบเกมในฐานข้อมูล, ใช้ fallback');
        setGameList(getFallbackGames());
      }
    } catch (err) {
      console.error('❌ Error loading games:', err);
      setGameList(getFallbackGames());
    }
  };

  useEffect(() => {
    if (user) {
      handleLoadGameList();
      loadBalances();
    }
  }, [user]);

  const handleTestAllApiEndpoints = async (payload) => {
    const results = await testAllApiEndpoints(payload);
    setApiTestResults(results);
    return results;
  };

  const handleCheckAccount = async () => {
    if (!playerId.trim()) {
      setError('โปรดป้อนหมายเลขบัญชี');
      return;
    }
    if (!validatePlayerId(playerId)) {
      setError('รูปแบบบัญชีไม่ถูกต้อง (5-11 ตัวอักษรและตัวเลข)');
      return;
    }
    setIsCheckingAccount(true);
    setError('');
    const result = await checkAccount(playerId);
    setAccountCheckResult(result);

    if (result.exists === true) {
      setLoading('login');
      setTimeout(() => {
        setUser({ playerId: playerId.trim(), currency: 'CNY', platType: 'ag' });
        setLoading('');
      }, 500);
    }

    setIsCheckingAccount(false);
  };

  const handleCreateAccount = async () => {
    if (!validatePlayerId(createForm.playerId)) {
      setError('玩家账号必须为 5-11 位小写字母和数字组合');
      return;
    }
    setLoading('create');
    const payload = { playerId: createForm.playerId.trim(), platType: createForm.platType, currency: createForm.currency };
    const testResults = await handleTestAllApiEndpoints(payload);
    const validEndpoint = testResults.find(r => r.success && r.data?.code === 10000);
    if (validEndpoint) {
      setSuccess(`账号创建成功！使用端点: ${validEndpoint.endpoint}`);
      setPlayerId(createForm.playerId);
    } else {
      setError('❌ 创建账号API不可用，请使用测试模式');
    }
    setLoading('');
  };

  const handleTestCreateAccount = async () => {
    if (!validatePlayerId(createForm.playerId)) {
      setError('玩家账号必须为 5-11 位小写字母和数字组合');
      return;
    }
    setLoading('test-create');
    setSuccess('✅ 测试模式：账号创建成功（模拟）');
    setPlayerId(createForm.playerId);
    setTimeout(() => {
      setShowCreateAccount(false);
      setCreateForm({ playerId: '', platType: 'ag', currency: 'CNY' });
      setSuccess('');
    }, 2000);
    setLoading('');
  };

  const handleLogin = async () => {
    if (!playerId.trim()) {
      setError('请输入玩家账号');
      return;
    }
    setLoading('login');
    setUser({ playerId: playerId.trim(), currency: 'CNY', platType: 'ag' });
    await handleLoadGameList();
    await loadBalances();
    setAccountCheckResult(null);
    setLoading('');
  };

  const handleLogout = () => {
    setUser(null);
    setPlayerId('');
    setGameList([]);
    setShowGames(false);
    setShowGameModal(false);
    setShowCreateAccount(false);
    setAccountCheckResult(null);
    setBalances({});
    setAllPlatformBalances({});
    setShowBalanceModal(false);
    setShowTransferModal(false);
    setShowDemoGameModal(false);
  };

  const handlePlayGame = async (game) => {
    setLoading(game.gameCode);

    const result = await apiCall('gameUrl', {
      playerId: user.playerId,
      platType: game.platType,
      currency: 'CNY',
      gameType: game.gameType,
      gameCode: game.gameCode,
      ingress: 'device2',
      lang: 'zh-hans'
    });

    const url = result?.data?.url;

    if (!url) {
      setError('❌ ไม่สามารถเปิดเกมได้ (API ไม่ส่ง URL)');
      setLoading('');
      return;
    }

    setCurrentGame(game);
    setGameUrl(url);
    setShowGameModal(true);
    setLoading('');
  };

  const handlePlayDemoGame = async (game) => {
    setDemoGameLoading(true);
    try {
      const result = await getDemoGameUrl(
        game.platType || 'ag',
        'CNY',
        game.gameType || '2',
        game.gameCode,
        'zh-hans',
        'device2'
      );

      if (result.success && result.url) {
        setDemoGameUrl(result.url);
        setCurrentGame(game);
        setShowDemoGameModal(true);
      } else {
        setError(`试玩失败: ${result.message}`);
      }
    } catch (error) {
      setError('试玩功能暂时不可用');
    } finally {
      setDemoGameLoading(false);
    }
  };

  // ฟังก์ชันใหม่: เมื่อกดปุ่ม "试玩游戏" บนเมนูหลัก
  const handlePlayDemoGameDirectly = async () => {
    setDemoGameLoading(true);
    try {
      // ใช้ค่าเริ่มต้นสำหรับเกมทดลอง
      const result = await getDemoGameUrl(
        'ag',           // platType
        'CNY',         // currency
        '2',           // gameType (電子游藝)
        '',            // gameCode (ว่าง = เข้าสู่ล็อบบี้)
        'zh-hans',     // lang
        'device2'      // ingress (มือถือ)
      );

      if (result.success && result.url) {
        setDemoGameUrl(result.url);
        setCurrentGame({
          platType: 'ag',
          gameType: '2',
          gameCode: '',
          gameName: { 'zh-hans': 'AG游戏大厅 - 试玩模式' }
        });
        setShowDemoGameModal(true);
      } else {
        setError(`试玩失败: ${result.message}`);
      }
    } catch (error) {
      setError('试玩功能暂时不可用');
    } finally {
      setDemoGameLoading(false);
    }
  };

  const handleCustomDemoGame = async () => {
    setDemoGameLoading(true);
    try {
      const result = await getDemoGameUrl(
        demoGameForm.platType,
        demoGameForm.currency,
        demoGameForm.gameType,
        demoGameForm.gameCode,
        demoGameForm.lang,
        demoGameForm.ingress
      );

      if (result.success && result.url) {
        setDemoGameUrl(result.url);
        setCurrentGame({
          platType: demoGameForm.platType,
          gameType: demoGameForm.gameType,
          gameCode: demoGameForm.gameCode,
          gameName: { 'zh-hans': '试玩游戏' }
        });
        setShowDemoGameModal(true);
      } else {
        setError(`试玩失败: ${result.message}`);
      }
    } catch (error) {
      setError('试玩功能暂时不可用');
    } finally {
      setDemoGameLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    setLoading('refresh');
    await loadBalances();
    setSuccess('余额已刷新');
    setTimeout(() => setSuccess(''), 3000);
    setLoading('');
  };

  const handleTransferAll = async () => {
    if (!user) return;
    if (!window.confirm('确定要一键回收所有平台的余额吗？')) return;

    setLoading('transfer-all');
    try {
      const result = await transferAllBalances(user.playerId, 'CNY');

      if (result.success) {
        setSuccess(`回收成功！总计回收金额: ${result.transferResult?.balanceAll || 0}`);
        await loadBalances();
      } else {
        setError(`回收失败: ${result.message}`);
      }
    } catch (err) {
      setError('回收失败，请稍后重试');
    } finally {
      setLoading('');
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  const handleTransfer = async () => {
    if (!user) return;

    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      setError('请输入有效的金额');
      return;
    }

    setIsTransferring(true);
    setError('');
    setSuccess('');

    try {
      const result = await transferAmount(
        user.playerId,
        transferForm.platType,
        'CNY',
        transferForm.type,
        transferForm.amount,
        transferForm.orderId
      );

      if (result.success) {
        setSuccess(`${transferForm.type === '1' ? '转入' : '转出'}成功！金额: ${transferForm.amount}`);

        const historyItem = {
          id: Date.now(),
          type: transferForm.type,
          amount: transferForm.amount,
          platType: transferForm.platType,
          time: new Date().toLocaleString(),
          orderId: transferForm.orderId || '自动生成'
        };
        setTransferHistory([historyItem, ...transferHistory]);

        await loadBalances();

        setTransferForm({
          platType: 'ag',
          type: '1',
          amount: '',
          orderId: ''
        });

        setTimeout(() => {
          setShowTransferModal(false);
          setSuccess('');
        }, 3000);
      } else {
        setError(`${transferForm.type === '1' ? '转入' : '转出'}失败: ${result.message}`);
      }
    } catch (err) {
      setError('转换失败，请稍后重试');
    } finally {
      setIsTransferring(false);
    }
  };

  const ApiConfigPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <Server className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">API 配置与诊断</h1>
        </div>
        {apiTestResults.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-white font-semibold">API端点测试结果</h3>
            {apiTestResults.map((r, i) => (
              <div key={i} className={`p-4 border rounded-lg ${r.success && r.data.code === 10000 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex justify-between items-center">
                  <code className="text-white">{r.endpoint}</code>
                  <span className={r.success && r.data.code === 10000 ? 'text-green-400' : 'text-red-400'}>{r.success ? `Code: ${r.data.code}` : 'Failed'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">服务器地址</label>
            <input type="text" value={apiConfig.serverUrl} onChange={(e) => setApiConfig({ ...apiConfig, serverUrl: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-white mb-2">游戏API地址</label>
            <input type="text" value={apiConfig.baseUrl} onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">SN</label>
              <input type="text" value={apiConfig.sn} onChange={(e) => setApiConfig({ ...apiConfig, sn: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-white mb-2">Secret</label>
              <input type="password" value={apiConfig.secret} onChange={(e) => setApiConfig({ ...apiConfig, secret: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => { Object.assign(API_CONFIG, apiConfig); setSuccess('API配置已更新'); setTimeout(() => setSuccess(''), 3000); }} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold">保存配置</button>
            <button onClick={() => setShowApiConfig(false)} className="flex-1 py-3 bg-white/10 text-white rounded-lg">返回</button>
          </div>
        </div>
      </div>
    </div>
  );

  const CreateAccountPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <PlusCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h1 className="text-3xl font-bold text-white">创建玩家账号</h1>
          <p className="text-purple-200">快速注册，立即开始游戏</p>
        </div>
        <div className="flex gap-2 mb-6 justify-center">
          <button onClick={() => setShowApiConfig(true)} className="px-4 py-2 bg-white/10 rounded-lg text-white">⚙️ API诊断</button>
          <button onClick={handleTestCreateAccount} className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg">🧪 测试模式</button>
        </div>
        {success && <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200">{success}</div>}
        {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">玩家账号 *</label>
            <input type="text" value={createForm.playerId} onChange={(e) => setCreateForm({ ...createForm, playerId: e.target.value.toLowerCase() })} placeholder="例如: player123" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" autoFocus disabled={loading} />
            <span className={`text-xs mt-1 ${validatePlayerId(createForm.playerId) ? 'text-green-400' : 'text-gray-400'}`}>{createForm.playerId.length === 0 ? '请输入5-11位小写字母和数字' : validatePlayerId(createForm.playerId) ? '✓ 账号格式正确' : '❌ 格式不正确'}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">游戏平台</label>
              <select value={createForm.platType} onChange={(e) => setCreateForm({ ...createForm, platType: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" disabled={loading}>
                <option value="ag">AG 平台</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">游戏货币</label>
              <select value={createForm.currency} onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" disabled={loading}>
                <option value="CNY">人民币 (CNY)</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreateAccount} disabled={loading || !validatePlayerId(createForm.playerId)} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50">{loading === 'create' ? '测试中...' : '创建账号'}</button>
          <button onClick={() => { setShowCreateAccount(false); setCreateForm({ playerId: '', platType: 'ag', currency: 'CNY' }); setError(''); }} className="w-full py-3 bg-white/10 text-white rounded-lg">返回登录</button>
        </div>
      </div>
    </div>
  );

  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">AG Games</h1>
          <p className="text-purple-200">极致游戏体验</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">{error}</div>}

        {!accountCheckResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-semibold">玩家账号</label>
              <input type="text" value={playerId} onChange={(e) => { setPlayerId(e.target.value.toLowerCase()); setAccountCheckResult(null); }} onKeyPress={(e) => e.key === 'Enter' && handleCheckAccount()} placeholder="输入您的账号" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" autoFocus disabled={isCheckingAccount} />
            </div>
            <button onClick={handleCheckAccount} disabled={isCheckingAccount || !playerId} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {isCheckingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  检查中...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  检查账号
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {accountCheckResult.exists === true ? (
              <>
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-300 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    账号存在
                  </div>
                  <p className="text-green-200 text-sm">该账号在系统中已注册</p>
                </div>
                <button onClick={handleLogin} disabled={loading === 'login'} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50">
                  {loading === 'login' ? '登录中...' : '继续登录'}
                </button>
              </>
            ) : accountCheckResult.exists === false ? (
              <>
                <div className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-300 font-semibold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    账号不存在
                  </div>
                  <p className="text-orange-200 text-sm">该账号未在系统中注册，请创建新账号</p>
                </div>
                <button onClick={() => { setCreateForm({ ...createForm, playerId }); setShowCreateAccount(true); }} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold">
                  创建这个账号
                </button>
              </>
            ) : (
              <>
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-300 font-semibold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    检查失败
                  </div>
                  <p className="text-red-200 text-sm">{accountCheckResult.error || '无法连接到服务器'}</p>
                </div>
              </>
            )}
            <button onClick={() => { setAccountCheckResult(null); setPlayerId(''); }} className="w-full py-3 bg-white/10 text-white rounded-lg">
              返回
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const BalanceDetailModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Wallet className="w-7 h-7 text-blue-400" />
              余额详情
            </h3>
            <p className="text-gray-400 mt-1">玩家: {user?.playerId}</p>
          </div>
          <button onClick={() => setShowBalanceModal(false)} className="p-2 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">主账户余额</p>
                <p className="text-3xl font-bold text-white mt-2">¥ {balances.ag?.toFixed(2) || '0.00'}</p>
              </div>
              <button
                onClick={handleRefreshBalance}
                disabled={loading === 'refresh'}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-white ${loading === 'refresh' ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              各平台余额
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(allPlatformBalances).map(([platform, balance]) => (
                <div key={platform} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">{platform.toUpperCase()}</p>
                  <p className="text-xl font-bold text-white">
                    {balance === null ? '--' : `¥ ${parseFloat(balance || 0).toFixed(2)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleTransferAll}
              disabled={loading === 'transfer-all'}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading === 'transfer-all' ? '回收中...' : '一键回收'}
            </button>
            <button
              onClick={() => {
                setShowBalanceModal(false);
                setShowTransferModal(true);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              额度转换
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TransferModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              额度转换
            </h3>
            <p className="text-gray-400 text-sm mt-1">玩家: {user?.playerId}</p>
          </div>
          <button onClick={() => setShowTransferModal(false)} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success && <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">游戏平台</label>
              <select
                value={transferForm.platType}
                onChange={(e) => setTransferForm({ ...transferForm, platType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="ag">AG 平台</option>
                <option value="bbin">BBIN 平台</option>
                <option value="cq9">CQ9 平台</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">转换类型</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTransferForm({ ...transferForm, type: '1' })}
                  className={`flex-1 py-3 rounded-lg font-semibold ${transferForm.type === '1' ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  转入游戏
                </button>
                <button
                  onClick={() => setTransferForm({ ...transferForm, type: '2' })}
                  className={`flex-1 py-3 rounded-lg font-semibold ${transferForm.type === '2' ? 'bg-red-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  转出游戏
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">转换金额 (¥)</label>
              <input
                type="number"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                placeholder="输入金额"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                step="0.01"
                min="1"
              />
            </div>

            <div>
              <label className="block text-white mb-2">订单号 (可选)</label>
              <input
                type="text"
                value={transferForm.orderId}
                onChange={(e) => setTransferForm({ ...transferForm, orderId: e.target.value })}
                placeholder="留空将自动生成"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <button
              onClick={handleTransfer}
              disabled={isTransferring || !transferForm.amount}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {isTransferring ? '处理中...' : '确认转换'}
            </button>

            <div className="text-center">
              <button
                onClick={() => setShowTransferHistory(true)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1 mx-auto"
              >
                <History className="w-4 h-4" />
                查看转换记录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TransferHistoryModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            转换记录
          </h3>
          <button onClick={() => setShowTransferHistory(false)} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {transferHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无转换记录
            </div>
          ) : (
            <div className="space-y-3">
              {transferHistory.map((item) => (
                <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.type === '1' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {item.type === '1' ? '转入' : '转出'}
                        </span>
                        <span className="text-sm text-gray-400">{item.platType.toUpperCase()}</span>
                      </div>
                      <p className="text-lg font-bold text-white">¥ {parseFloat(item.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-400 mt-1">{item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">订单号</p>
                      <p className="text-sm text-gray-300 font-mono">{item.orderId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const DemoGameModal = () => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-white/10">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-400" />
            {currentGame ? getGameName(currentGame) : '试玩游戏'}
          </h3>
          <p className="text-gray-400 text-sm">试玩模式 - 无需登录</p>
        </div>
        <div className="flex gap-2">
          {demoGameUrl && <button onClick={() => window.open(demoGameUrl, '_blank')} className="p-2 text-white hover:text-blue-400"><ExternalLink className="w-5 h-5" /></button>}
          <button onClick={() => setShowDemoGameModal(false)} className="p-2 text-red-400 hover:text-red-300"><X className="w-5 h-5" /></button>
        </div>
      </div>
      {demoGameUrl ? (
        <iframe src={demoGameUrl} className="flex-1 w-full" title="试玩游戏" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation" />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <GamepadIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">加载试玩游戏中...</p>
          </div>
        </div>
      )}
    </div>
  );

  const DemoGameSettingsModal = () => (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-green-400" />
              自定义试玩游戏
            </h3>
            <p className="text-gray-400 text-sm mt-1">无需账号即可体验</p>
          </div>
          <button onClick={() => setShowDemoGameSettings(false)} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">游戏平台</label>
              <select
                value={demoGameForm.platType}
                onChange={(e) => setDemoGameForm({ ...demoGameForm, platType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="ag">AG 平台</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">游戏类型</label>
              <select
                value={demoGameForm.gameType}
                onChange={(e) => setDemoGameForm({ ...demoGameForm, gameType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="1">视讯</option>
                <option value="2">电子游艺</option>
                <option value="3">彩票游戏</option>
                <option value="4">体育竞技</option>
                <option value="5">电子竞技</option>
                <option value="6">捕鱼游戏</option>
                <option value="7">棋牌游戏</option>
                <option value="8">真人娱乐</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">游戏代码 (可选)</label>
              <input
                type="text"
                value={demoGameForm.gameCode}
                onChange={(e) => setDemoGameForm({ ...demoGameForm, gameCode: e.target.value })}
                placeholder="留空进入游戏大厅"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">语言</label>
                <select
                  value={demoGameForm.lang}
                  onChange={(e) => setDemoGameForm({ ...demoGameForm, lang: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="zh-hans">简体中文</option>
                  <option value="zh-hant">繁体中文</option>
                  <option value="en">英语</option>
                  <option value="th">泰语</option>
                  <option value="vi">越南语</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">终端类型</label>
                <select
                  value={demoGameForm.ingress}
                  onChange={(e) => setDemoGameForm({ ...demoGameForm, ingress: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="device1">电脑网页版</option>
                  <option value="device2">手机网页版</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCustomDemoGame}
              disabled={demoGameLoading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {demoGameLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  开始试玩
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HomePage = () => {
    // จัดกลุ่มเกมตามประเภท
    const gamesByType = {};
    gameList.forEach(g => {
      const type = g.gameType || '2';
      if (!gamesByType[type]) gamesByType[type] = [];
      gamesByType[type].push(g);
    });

    // หมวดหมู่ที่มีในรูป (เรียงตามรูปที่ให้มา)
    const gameCategories = [
      { id: '1', name: '真人', icon: '👥' },
      { id: '2', name: '电子游戏', icon: '🎮' },
      { id: '6', name: '体育', icon: '🎣' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/5 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <User className="w-10 h-10 text-white" />
              <div>
                <p className="text-white font-bold">{user?.playerId}</p>
                <p className="text-gray-400 text-sm">AG 游戏平台</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBalanceModal(true)}
                className="p-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg text-white hover:bg-blue-600/30 transition flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>¥ {balances.ag?.toFixed(2) || '0.00'}</span>
              </button>

              <button
                onClick={handlePlayDemoGameDirectly}
                disabled={demoGameLoading}
                className="p-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg text-white hover:bg-green-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {demoGameLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>加载中...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>试玩游戏</span>
                  </>
                )}
              </button>

              <button onClick={handleLogout} className="p-1 bg-red-500/20 text-red-300 rounded-lg font-semibold flex items-center gap-2">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-row gap-6">
            {/* Left Sidebar - Game Categories */}
            {/* Left Sidebar - Game Categories */}
            <div className="lg:w-1/5">
              <div className="sticky top-16">
                <div className="flex flex-col items-center gap-3 py-4">
                  {gameCategories.map((category) => {
                    const isActive = selectedGameType === category.id
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedGameType(category.id)}
                        className={`
                          w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1
                          transition-all shadow-sm
                          ${isActive
                            ? 'bg-gradient-to-b from-yellow-300 to-amber-500 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-500 hover:bg-gray-100'}
                       `}
                      >
                        <span className="text-xl">{category.icon}</span>
                        <span className="text-[10px] font-medium">
                          {category.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Content - Games Grid */}
            <div className="lg:w-4/5">
              {gamesByType[selectedGameType]?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {gamesByType[selectedGameType].map((g, i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition group h-full flex flex-col"
                    >
                      {/* เพิ่มการกดที่รูปได้เลย */}
                      <div
                        className="relative h-40 bg-gradient-to-b from-slate-700 to-slate-800 overflow-hidden cursor-pointer"
                        onClick={() => handlePlayGame(g)}
                      >
                        <img
                          src={g.imageUrl}
                          alt={getGameName(g)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs bg-black/50 text-white rounded">
                            {g.platType?.toUpperCase()}
                          </span>
                        </div>
                        {/* เพิ่ม overlay สำหรับปุ่มเล่น */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <div className="flex items-center gap-2 bg-blue-600/80 px-4 py-2 rounded-lg">
                            <PlayCircle className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold text-sm">开始游戏</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-1 flex-1 flex flex-col">
                        <h3 className="text-white font-bold text-sm mb-1 truncate">
                          {getGameName(g)}
                        </h3>
                        <p className="text-gray-400 text-xs mb-3">{g.gameCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                  <GamepadIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">此分类暂无游戏</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showGameModal && currentGame && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-white/10">
              <div>
                <h3 className="text-white font-bold">{getGameName(currentGame)}</h3>
                <p className="text-gray-400 text-sm">{currentGame.gameCode}</p>
              </div>
              <div className="flex gap-2">
                {gameUrl && <button onClick={() => window.open(gameUrl, '_blank')} className="p-2 text-white hover:text-blue-400"><ExternalLink className="w-5 h-5" /></button>}
                <button onClick={() => setShowGameModal(false)} className="p-2 text-red-400 hover:text-red-300"><X className="w-5 h-5" /></button>
              </div>
            </div>
            {gameUrl && <iframe src={gameUrl} className="flex-1 w-full" title={getGameName(currentGame)} sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation" />}
          </div>
        )}

        {showBalanceModal && <BalanceDetailModal />}
        {showTransferModal && <TransferModal />}
        {showTransferHistory && <TransferHistoryModal />}
        {showDemoGameModal && <DemoGameModal />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {showApiConfig ? <ApiConfigPage /> : showCreateAccount ? <CreateAccountPage /> : (!user ? <LoginPage /> : <HomePage />)}
    </div>
  );
};

export default App;