import React, { useState, useEffect } from 'react';
import {
  Gamepad2, LogOut, User, Loader2, ChevronRight, ExternalLink,
  AlertCircle, X, PlusCircle, CreditCard, CheckCircle,
  Settings, Server, Search, Wallet, RefreshCw, Download, Upload,
  History, BarChart3, Eye, PlayCircle, GamepadIcon,
  QrCode, Copy, Clock, Trash2, Filter
} from 'lucide-react';
import {
  API_CONFIG, apiCall, checkAccount, queryBalance, queryAllBalances,
  transferAllBalances, transferAmount, getDemoGameUrl, validatePlayerId,
  loadGameList, getGameName, GAME_TYPES, GAME_ICONS, getFallbackGames,
  testAllApiEndpoints, getGameCovers
} from '../services/api';
import {
  useTransferState,
  BalanceDetailModal,
  TransferModal,
  TransferHistoryModal,
  USDTDepositModal,
  USDTDepositHistoryModal,
  transferHandlers
} from './TransferModule';

const App = () => {
  // ✅ ฟังก์ชันบันทึก state ลง localStorage (แยกตาม playerId)
  const saveStateToLocalStorage = (state) => {
    try {
      if (!state.user?.playerId) return; // ถ้าไม่มี playerId ไม่บันทึก

      const storageKey = `appState_${state.user.playerId}`;
      const serializedState = JSON.stringify(state);
      localStorage.setItem(storageKey, serializedState);

      // บันทึก playerId ล่าสุดที่ login
      localStorage.setItem('lastPlayerId', state.user.playerId);
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  };

  // ✅ ฟังก์ชันโหลด state จาก localStorage (แยกตาม playerId)
  const loadStateFromLocalStorage = () => {
    try {
      // โหลดจาก playerId ล่าสุด
      const lastPlayerId = localStorage.getItem('lastPlayerId');
      if (!lastPlayerId) return undefined;

      const storageKey = `appState_${lastPlayerId}`;
      const serializedState = localStorage.getItem(storageKey);

      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      console.error('Error loading state from localStorage:', err);
      return undefined;
    }
  };

  // ✅ ฟังก์ชันล้าง state จาก localStorage (แยกตาม playerId)
  const clearStateFromLocalStorage = (playerId) => {
    if (playerId) {
      const storageKey = `appState_${playerId}`;
      localStorage.removeItem(storageKey);
    }
    localStorage.removeItem('lastPlayerId');
  };

  // โหลด state ที่บันทึกไว้ครั้งแรก
  const savedState = loadStateFromLocalStorage();

  // State ทั้งหมด
  const [user, setUser] = useState(savedState?.user || null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState(savedState?.playerId || '');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [gameList, setGameList] = useState(savedState?.gameList || []);
  const [selectedGameType, setSelectedGameType] = useState(
    savedState?.selectedGameType || '2'
  );
  const [showGames, setShowGames] = useState(savedState?.showGames || true);
  const [gameUrl, setGameUrl] = useState('');
  const [showGameModal, setShowGameModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [apiTestResults, setApiTestResults] = useState([]);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [createForm, setCreateForm] = useState({
    playerId: '',
    platType: 'ag',
    currency: 'CNY'
  });
  const [apiConfig, setApiConfig] = useState({ ...API_CONFIG });
  const [accountCheckResult, setAccountCheckResult] = useState(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  const [balances, setBalances] = useState({});
  const [allPlatformBalances, setAllPlatformBalances] = useState({});
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
  const [showDemoGameSettings, setShowDemoGameSettings] = useState(false);

  // Transfer Module State
  const transferState = useTransferState();

  // เพิ่ม state สำหรับติดตามว่ากำลัง restore เกมอยู่หรือไม่
  const [isRestoringGame, setIsRestoringGame] = useState(false);

  // ✅ บันทึก state ลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (user) { // บันทึกเฉพาะเมื่อมี user
      const stateToSave = {
        user,
        playerId,
        gameList,
        selectedGameType,
        showGames,
        balances,
        allPlatformBalances,
        transferHistory: transferState.transferHistory,
        apiConfig,
        showApiConfig,
        showCreateAccount,
        createForm,
        transferMode: transferState.transferMode,
        usdtDeposit: transferState.usdtDeposit,
        usdtOrders: transferState.usdtOrders
      };
      saveStateToLocalStorage(stateToSave);
    }
  }, [
    user, playerId, gameList, selectedGameType, showGames,
    balances, allPlatformBalances,
    apiConfig, showApiConfig, showCreateAccount, createForm,
    transferState.transferHistory, transferState.transferMode,
    transferState.usdtDeposit, transferState.usdtOrders
  ]);

  // ฟังก์ชันบันทึกเกมลง localStorage
  const saveGameSession = (game, url, playerId) => {
    try {
      const gameSession = {
        url,
        gameName: getGameName(game),
        gameCode: game.gameCode,
        platType: game.platType,
        gameType: game.gameType,
        playerId: playerId,
        timestamp: Date.now()
      };
      localStorage.setItem(`activeGameSession_${playerId}`, JSON.stringify(gameSession));
      sessionStorage.setItem(`hasActiveGame_${playerId}`, 'true');
    } catch (err) {
      console.error('Error saving game session:', err);
    }
  };

  // ฟังก์ชันล้างเกมจาก localStorage
  const clearGameSession = (playerId) => {
    if (playerId) {
      localStorage.removeItem(`activeGameSession_${playerId}`);
      sessionStorage.removeItem(`hasActiveGame_${playerId}`);
    }
  };

  // ฟังก์ชันโหลดเกมจาก localStorage
  const restoreGameSession = () => {
    try {
      if (!user?.playerId) return;

      const savedGame = localStorage.getItem(`activeGameSession_${user.playerId}`);
      const hasActiveGame = sessionStorage.getItem(`hasActiveGame_${user.playerId}`);

      if (savedGame && hasActiveGame === 'true') {
        setIsRestoringGame(true);
        const gameSession = JSON.parse(savedGame);

        // ตรวจสอบว่า session ยังไม่หมดอายุ (เช่น 8 ชั่วโมง)
        const hoursSinceLastAccess =
          (Date.now() - gameSession.timestamp) / (1000 * 60 * 60);

        if (hoursSinceLastAccess < 8) {
          setGameUrl(gameSession.url);
          setShowGameModal(true);
          setCurrentGame({
            platType: gameSession.platType,
            gameType: gameSession.gameType,
            gameCode: gameSession.gameCode,
            gameName: { 'zh-hans': gameSession.gameName }
          });
          console.log('✅ โหลดเกมที่บันทึกไว้สำเร็จ');
        } else {
          // ล้าง session ที่หมดอายุ
          clearGameSession(user.playerId);
          console.log('⚠️ Session เกมหมดอายุแล้ว');
        }
      }
    } catch (err) {
      console.error('Error restoring game session:', err);
      clearGameSession(user?.playerId);
    } finally {
      setIsRestoringGame(false);
    }
  };

  // โหลดเกมเมื่อ user login หรือเมื่อ component โหลด
  useEffect(() => {
    if (user && !isRestoringGame) {
      restoreGameSession();
    }
  }, [user]);

  // ฟังก์ชันปิดเกม
  const handleCloseGame = () => {
    setShowGameModal(false);
    clearGameSession(user?.playerId);
  };

  // ฟังก์ชันปิด demo เกม
  const handleCloseDemoGame = () => {
    setShowDemoGameModal(false);
  };

  const loadBalances = async () => {
    await transferHandlers.handleLoadBalances(
      user,
      queryBalance,
      queryAllBalances,
      setBalances,
      setAllPlatformBalances,
      setLoading
    );
  };

  // โหลดข้อมูลเมื่อมี user และยังไม่มี gameList
  useEffect(() => {
    const initializeData = async () => {
      if (user && gameList.length === 0) {
        await handleLoadGameList();
        await loadBalances();
      }
    };
    initializeData();
  }, [user]);

  const handleLoadGameList = async () => {
    try {
      const res = await fetch('/backend-api/game-covers/all');
      const data = await res.json();

      if (data.code === 10000 && data.data && data.data.length > 0) {
        console.log(`✅ ดึงเกม ${data.data.length} ตัว พร้อมรูปปก`);

        const games = data.data.map(game => ({
          platType: game.platType || 'ag',
          gameType: game.gameType || '1',
          gameCode: game.gameCode,
          gameName: {
            'zh-hans': game.gameName || game.gameCode
          },
          imageUrl: game.imageUrl,
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

  // โหลดข้อมูลจาก localStorage เมื่อ component โหลดครั้งแรก
  useEffect(() => {
    if (savedState && savedState.user) {
      // ถ้ามี user ที่บันทึกไว้ ให้โหลดข้อมูลเพิ่มเติม
      handleLoadGameList();
      loadBalances();
    }
  }, []);

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
    const payload = {
      playerId: createForm.playerId.trim(),
      platType: createForm.platType,
      currency: createForm.currency
    };
    const testResults = await handleTestAllApiEndpoints(payload);
    const validEndpoint = testResults.find(
      r => r.success && r.data?.code === 10000
    );
    if (validEndpoint) {
      transferState.setSuccess(
        `账号创建成功！使用端点: ${validEndpoint.endpoint}`
      );
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
    transferState.setSuccess('✅ 测试模式：账号创建成功（模拟）');
    setPlayerId(createForm.playerId);
    setTimeout(() => {
      setShowCreateAccount(false);
      setCreateForm({ playerId: '', platType: 'ag', currency: 'CNY' });
      transferState.setSuccess('');
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
    const currentPlayerId = user?.playerId;

    setUser(null);
    setPlayerId('');
    setGameList([]);
    setShowGames(false);
    setShowGameModal(false);
    setShowCreateAccount(false);
    setAccountCheckResult(null);
    setBalances({});
    setAllPlatformBalances({});
    transferState.setShowBalanceModal(false);
    transferState.setShowTransferModal(false);
    setShowDemoGameModal(false);
    transferState.setShowUSDTDepositModal(false);

    // ✅ ล้าง localStorage และ game session เฉพาะของ player คนนี้
    clearStateFromLocalStorage(currentPlayerId);
    clearGameSession(currentPlayerId);

    // ✅ ยกเลิกคำสั่ง pending ทั้งหมด
    if (currentPlayerId) {
      fetch('/backend-api/crypto/cancel-all-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId })
      });
    }
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

    // บันทึกเกมลง localStorage
    saveGameSession(game, url, user.playerId);

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

  const handlePlayDemoGameDirectly = async () => {
    setDemoGameLoading(true);
    try {
      const result = await getDemoGameUrl(
        'ag',
        'CNY',
        '2',
        '',
        'zh-hans',
        'device2'
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
    await transferHandlers.handleRefreshBalance(
      loadBalances,
      transferState.setSuccess,
      setLoading
    );
  };

  const handleTransferAll = async () => {
    await transferHandlers.handleTransferAll(
      user,
      transferAllBalances,
      loadBalances,
      setLoading,
      transferState.setSuccess,
      transferState.setError
    );
  };

  // ใน App component
useEffect(() => {
  // เมื่อ user เป็น null (logout) ให้ clear ทุกอย่าง
  if (!user) {
    // Clear USDT modal state
    transferState.setUsdtDeposit({
      amount: '',
      orderId: '',
      status: '',
      usdtAmount: 0,
      address: '',
      expiresAt: null,
      qrCodeUrl: ''
    });
    transferState.setUsdtOrders([]);
    transferState.setShowUSDTDepositModal(false);
    transferState.setShowUsdtHistory(false);
    
    // ส่ง request เพื่อ clear pending orders บน server
    const lastPlayerId = localStorage.getItem('lastPlayerId');
    if (lastPlayerId) {
      fetch('/backend-api/crypto/cancel-all-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: lastPlayerId })
      });
    }
  }
}, [user]);

  const handleTransfer = async () => {
    await transferHandlers.handleTransfer(
      user,
      transferState.transferMode,
      transferState.transferForm,
      transferAmount,
      loadBalances,
      transferState.setIsTransferring,
      transferState.setError,
      transferState.setSuccess,
      transferState.setTransferHistory,
      transferState.transferHistory,
      transferState.setTransferForm
    );
  };

  // USDT Deposit Functions
  const handleCreateUSDTOrder = async (playerId, amount) => {
    try {
      const response = await fetch('/backend-api/crypto/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cnyAmount: amount })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating USDT order:', err);
      return { success: false, message: '网络错误' };
    }
  };

  // ฟังก์ชันตรวจสอบว่าข้อมูลเป็นของผู้เล่นคนนี้
  const validateOrderOwnership = (orderData, currentPlayerId) => {
    if (!orderData || !currentPlayerId) return false;

    // ตรวจสอบว่ามี playerId ใน response และตรงกับผู้เล่นปัจจุบัน
    if (orderData.playerId && orderData.playerId !== currentPlayerId) {
      console.error('🚨 Security Alert: ผู้เล่นพยายามเข้าถึงคำสั่งซื้อของคนอื่น');
      console.log('Current player:', currentPlayerId);
      console.log('Order player:', orderData.playerId);
      return false;
    }

    return true;
  };

  // แล้วใช้ใน handleCheckUSDTOrder:
// แก้ไขฟังก์ชันใน App.js
const handleCheckUSDTOrder = async (orderId) => {
  try {
    // ✅ ตรวจสอบว่า orderId มีค่าหรือไม่
    if (!orderId || orderId.trim() === '') {
      console.error('❌ orderId ว่างเปล่า');
      return { 
        success: false, 
        message: 'orderId ไม่สามารถเป็นค่าว่างได้' 
      };
    }

    // ✅ สร้าง URL ให้ถูกต้อง
    const url = `/backend-api/crypto/check-order/${orderId}?playerId=${user.playerId}`;
    console.log('🔍 Checking USDT order URL:', url);

    const response = await fetch(url);
    
    // ✅ ตรวจสอบ status code
    if (!response.ok) {
      console.error('❌ Server response not OK:', response.status);
      return { 
        success: false, 
        message: `เซิร์ฟเวอร์ตอบกลับด้วยสถานะ ${response.status}` 
      };
    }

    // ✅ ตรวจสอบ content type ก่อน parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Response is not JSON:', text.substring(0, 200));
      return { 
        success: false, 
        message: 'เซิร์ฟเวอร์ตอบกลับด้วยข้อมูลที่ไม่ใช่ JSON' 
      };
    }

    const data = await response.json();
    
    // ✅ ตรวจสอบความเป็นเจ้าของ
    if (!validateOrderOwnership(data, user.playerId)) {
      return {
        success: false,
        message: '无权访问此订单'
      };
    }

    return data;
  } catch (err) {
    console.error('❌ Error checking USDT order:', err);
    
    // ✅ จัดการ error ที่เฉพาะเจาะจง
    if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
      return { 
        success: false, 
        message: 'ข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง' 
      };
    }
    
    return { 
      success: false, 
      message: '检查订单失败' 
    };
  }
};

  const handleLoadUSDTHistory = async (playerId) => {
    try {
      const response = await fetch(`/backend-api/crypto/deposit-history/${playerId}?limit=20`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error loading USDT history:', err);
      return { success: false, message: '加载历史失败' };
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
              <div
                key={i}
                className={`p-4 border rounded-lg ${r.success && r.data.code === 10000
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <code className="text-white">{r.endpoint}</code>
                  <span
                    className={
                      r.success && r.data.code === 10000
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {r.success ? `Code: ${r.data.code}` : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">服务器地址</label>
            <input
              type="text"
              value={apiConfig.serverUrl}
              onChange={(e) =>
                setApiConfig({ ...apiConfig, serverUrl: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-2">游戏API地址</label>
            <input
              type="text"
              value={apiConfig.baseUrl}
              onChange={(e) =>
                setApiConfig({ ...apiConfig, baseUrl: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">SN</label>
              <input
                type="text"
                value={apiConfig.sn}
                onChange={(e) =>
                  setApiConfig({ ...apiConfig, sn: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Secret</label>
              <input
                type="password"
                value={apiConfig.secret}
                onChange={(e) =>
                  setApiConfig({ ...apiConfig, secret: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                Object.assign(API_CONFIG, apiConfig);
                transferState.setSuccess('API配置已更新');
                setTimeout(() => transferState.setSuccess(''), 3000);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold"
            >
              保存配置
            </button>
            <button
              onClick={() => setShowApiConfig(false)}
              className="flex-1 py-3 bg-white/10 text-white rounded-lg"
            >
              返回
            </button>
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
          <button
            onClick={() => setShowApiConfig(true)}
            className="px-4 py-2 bg-white/10 rounded-lg text-white"
          >
            ⚙️ API诊断
          </button>
          <button
            onClick={handleTestCreateAccount}
            className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg"
          >
            🧪 测试模式
          </button>
        </div>
        {transferState.success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200">
            {transferState.success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">玩家账号 *</label>
            <input
              type="text"
              value={createForm.playerId}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  playerId: e.target.value.toLowerCase()
                })
              }
              placeholder="例如: player123"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              autoFocus
              disabled={loading}
            />
            <span
              className={`text-xs mt-1 ${validatePlayerId(createForm.playerId)
                ? 'text-green-400'
                : 'text-gray-400'
                }`}
            >
              {createForm.playerId.length === 0
                ? '请输入5-11位小写字母和数字'
                : validatePlayerId(createForm.playerId)
                  ? '✓ 账号格式正确'
                  : '❌ 格式不正确'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">游戏平台</label>
              <select
                value={createForm.platType}
                onChange={(e) =>
                  setCreateForm({ ...createForm, platType: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                disabled={loading}
              >
                <option value="ag">AG 平台</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">游戏货币</label>
              <select
                value={createForm.currency}
                onChange={(e) =>
                  setCreateForm({ ...createForm, currency: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                disabled={loading}
              >
                <option value="CNY">人民币 (CNY)</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreateAccount}
            disabled={loading || !validatePlayerId(createForm.playerId)}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading === 'create' ? '测试中...' : '创建账号'}
          </button>
          <button
            onClick={() => {
              setShowCreateAccount(false);
              setCreateForm({ playerId: '', platType: 'ag', currency: 'CNY' });
              setError('');
            }}
            className="w-full py-3 bg-white/10 text-white rounded-lg"
          >
            返回登录
          </button>
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
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!accountCheckResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-semibold">
                玩家账号
              </label>
              <input
                type="text"
                value={playerId}
                onChange={(e) => {
                  setPlayerId(e.target.value.toLowerCase());
                  setAccountCheckResult(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckAccount()}
                placeholder="输入您的账号"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                autoFocus
                disabled={isCheckingAccount}
              />
            </div>
            <button
              onClick={handleCheckAccount}
              disabled={isCheckingAccount || !playerId}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
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
                  <p className="text-green-200 text-sm">
                    该账号在系统中已注册
                  </p>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading === 'login'}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
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
                  <p className="text-orange-200 text-sm">
                    该账号未在系统中注册，请创建新账号
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCreateForm({ ...createForm, playerId });
                    setShowCreateAccount(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold"
                >
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
                  <p className="text-red-200 text-sm">
                    {accountCheckResult.error || '无法连接到服务器'}
                  </p>
                </div>
              </>
            )}
            <button
              onClick={() => {
                setAccountCheckResult(null);
                setPlayerId('');
              }}
              className="w-full py-3 bg-white/10 text-white rounded-lg"
            >
              返回
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const DemoGameModal = () => (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Overlay ด้านบนสุดสำหรับปุ่ม */}
      <div className="fixed top-0 left-0 right-0 z-50 p-1 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={handleCloseDemoGame}
          className="ml-auto block text-white rounded-full shadow-xl"
          title="关闭试玩游戏"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      {demoGameUrl ? (
        <iframe
          src={demoGameUrl}
          className="w-full h-full"
          title="试玩游戏"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        />
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
          <button
            onClick={() => setShowDemoGameSettings(false)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">游戏平台</label>
              <select
                value={demoGameForm.platType}
                onChange={(e) =>
                  setDemoGameForm({ ...demoGameForm, platType: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="ag">AG 平台</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">游戏类型</label>
              <select
                value={demoGameForm.gameType}
                onChange={(e) =>
                  setDemoGameForm({ ...demoGameForm, gameType: e.target.value })
                }
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
                onChange={(e) =>
                  setDemoGameForm({ ...demoGameForm, gameCode: e.target.value })
                }
                placeholder="留空进入游戏大厅"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">语言</label>
                <select
                  value={demoGameForm.lang}
                  onChange={(e) =>
                    setDemoGameForm({
                      ...demoGameForm,
                      lang: e.target.value
                    })
                  }
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
                  onChange={(e) =>
                    setDemoGameForm({
                      ...demoGameForm,
                      ingress: e.target.value
                    })
                  }
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
    const gamesByType = {};
    gameList.forEach(g => {
      const type = g.gameType || '2';
      if (!gamesByType[type]) gamesByType[type] = [];
      gamesByType[type].push(g);
    });

    const gameCategories = [
      { id: '1', name: '真人', icon: '👥' },
      { id: '2', name: '电子游戏', icon: '🎮' },
      { id: '6', name: '体育', icon: '🎣' }
    ];

    return (
      <>
        {/* ซ่อนหน้าหลักทั้งหมดเมื่อเปิดเกม */}
        {!showGameModal && (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/5 backdrop-blur-lg border-b border-white/10">
              <div className="max-w-7xl mx-auto p-2 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <User className="w-10 h-10 text-white" />
                  <div>
                    <p className="text-white font-bold">{user?.playerId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => transferState.setShowBalanceModal(true)}
                    className="p-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg text-white hover:bg-purple-600/30 transition flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>¥ {balances.ag?.toFixed(2) || '0.00'}</span>
                  </button>

                  <button
                    onClick={handlePlayDemoGameDirectly}
                    disabled={demoGameLoading}
                    className="p-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg text-white hover:bg-yellow-600/30 transition flex items-center gap-2 disabled:opacity-50"
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

                  <button
                    onClick={handleLogout}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Split Layout */}
            <div className="max-w-7xl mx-auto px-2 py-6">
              <div className="flex flex-row gap-2">
                {/* Left Sidebar - Game Categories */}
                <div className="lg:w-1/5">
                  <div className="sticky top-18">
                    <div className="flex flex-col items-center gap-2 py-6">
                      {gameCategories.map((category) => {
                        const isActive = selectedGameType === category.id;
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedGameType(category.id)}
                            className={`
                              w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-2
                              transition-all shadow-sm
                              ${isActive
                                ? 'bg-gradient-to-b from-yellow-300 to-amber-500 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                              }
                            `}
                          >
                            <span className="text-xl">{category.icon}</span>
                            <span className="text-[10px] font-medium">
                              {category.name}
                            </span>
                          </button>
                        );
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
                          </div>

                          <div className="p-1 flex-1 flex flex-col">
                            <h3 className="text-white font-bold text-sm mb-1 truncate">
                              {getGameName(g)}
                            </h3>
                            <p className="text-gray-400 text-xs mb-1">
                              {g.gameCode}
                            </p>
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
          </div>
        )}

        {/* Modal เกม (แสดงเต็มหน้าจอ) */}
        {showGameModal && currentGame && gameUrl && (
          <div className="fixed inset-0 z-50 flex flex-col">
            {/* Overlay ด้านบนสุดสำหรับปุ่ม */}
            <div className="fixed top-0 left-0 right-0 z-50 p-1 bg-gradient-to-b from-black/50 to-transparent">
              <button
                onClick={handleCloseGame}
                className="ml-auto block text-white rounded-full shadow-xl"
                title="关闭游戏"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <iframe
              src={gameUrl}
              title={getGameName(currentGame)}
              className="fixed inset-0 w-screen h-[100dvh]"
              style={{ border: 'none' }}
              allow="fullscreen autoplay encrypted-media"
              allowFullScreen
            />
          </div>
        )}

        {/* Modals อื่นๆ */}
        {transferState.showBalanceModal && (
          <BalanceDetailModal
            user={user}
            balances={balances}
            loading={loading}
            showBalanceModal={transferState.showBalanceModal}
            setShowBalanceModal={transferState.setShowBalanceModal}
            setTransferMode={transferState.setTransferMode}
            setShowTransferModal={transferState.setShowTransferModal}
            handleRefreshBalance={handleRefreshBalance}
            handleTransferAll={handleTransferAll}
            setShowUSDTDepositModal={transferState.setShowUSDTDepositModal}
          />
        )}
        {transferState.showTransferModal && (
          <TransferModal
            user={user}
            balances={balances}
            transferMode={transferState.transferMode}
            setTransferMode={transferState.setTransferMode}
            transferForm={transferState.transferForm}
            setTransferForm={transferState.setTransferForm}
            isTransferring={transferState.isTransferring}
            showTransferModal={transferState.showTransferModal}
            setShowTransferModal={transferState.setShowTransferModal}
            setShowTransferHistory={transferState.setShowTransferHistory}
            success={transferState.success}
            error={transferState.error}
            handleTransfer={handleTransfer}
          />
        )}
        {transferState.showTransferHistory && (
          <TransferHistoryModal
            transferHistory={transferState.transferHistory}
            showTransferHistory={transferState.showTransferHistory}
            setShowTransferHistory={transferState.setShowTransferHistory}
          />
        )}
        {transferState.showUSDTDepositModal && (
          <USDTDepositModal
            user={user}
            showUSDTDepositModal={transferState.showUSDTDepositModal}
            setShowUSDTDepositModal={transferState.setShowUSDTDepositModal}
            usdtDeposit={transferState.usdtDeposit}
            setUsdtDeposit={transferState.setUsdtDeposit}
            loading={loading}
            setLoading={setLoading}
            success={transferState.success}
            setSuccess={transferState.setSuccess}
            error={transferState.error}
            setError={transferState.setError}
            createUSDTOrder={handleCreateUSDTOrder}
            checkUSDTOrder={handleCheckUSDTOrder}
            loadUSDTHistory={handleLoadUSDTHistory}
            setUsdtOrders={transferState.setUsdtOrders}
            setShowUsdtHistory={transferState.setShowUsdtHistory}
          />
        )}
        {transferState.showUsdtHistory && (
          <USDTDepositHistoryModal
            usdtOrders={transferState.usdtOrders}
            showUsdtHistory={transferState.showUsdtHistory}
            setShowUsdtHistory={transferState.setShowUsdtHistory}
          />
        )}
        {showDemoGameModal && <DemoGameModal />}
        {showDemoGameSettings && <DemoGameSettingsModal />}
      </>
    );
  };

  // ถ้ากำลัง restore เกม ให้แสดง loading
  if (isRestoringGame) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white">กำลังโหลดเกมที่บันทึกไว้...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {showApiConfig ? (
        <ApiConfigPage />
      ) : showCreateAccount ? (
        <CreateAccountPage />
      ) : !user ? (
        <LoginPage />
      ) : (
        <HomePage />
      )}
    </div>
  );
};

export default App;