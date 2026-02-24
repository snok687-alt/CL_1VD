import React, { useState, useEffect, useRef } from 'react';
import {
    Gamepad2, LogOut, User, Loader2, ChevronRight, ExternalLink,
    AlertCircle, X, PlusCircle, CreditCard, CheckCircle,
    Settings, Server, Search, Wallet, RefreshCw, Download, Upload,
    History, BarChart3, Eye, PlayCircle, GamepadIcon,
    QrCode, Copy, Clock, Trash2, Filter, ChevronLeft
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
            if (!state.user?.playerId) return;
            const storageKey = `appState_${state.user.playerId}`;
            const serializedState = JSON.stringify(state);
            localStorage.setItem(storageKey, serializedState);
            localStorage.setItem('lastPlayerId', state.user.playerId);
        } catch (err) {
            console.error('Error saving state to localStorage:', err);
        }
    };

    const loadStateFromLocalStorage = () => {
        try {
            const lastPlayerId = localStorage.getItem('lastPlayerId');
            if (!lastPlayerId) return undefined;
            const storageKey = `appState_${lastPlayerId}`;
            const serializedState = localStorage.getItem(storageKey);
            if (serializedState === null) return undefined;
            return JSON.parse(serializedState);
        } catch (err) {
            console.error('Error loading state from localStorage:', err);
            return undefined;
        }
    };

    const clearStateFromLocalStorage = (playerId) => {
        if (playerId) {
            const storageKey = `appState_${playerId}`;
            localStorage.removeItem(storageKey);
        }
        localStorage.removeItem('lastPlayerId');
    };

    const savedState = loadStateFromLocalStorage();

    const [user, setUser] = useState(savedState?.user || null);
    const [loading, setLoading] = useState('');
    const [error, setError] = useState('');
    const [playerId, setPlayerId] = useState(savedState?.playerId || '');
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [gameList, setGameList] = useState(savedState?.gameList || []);
    const [selectedGameType, setSelectedGameType] = useState(savedState?.selectedGameType || '1');
    const [showGames, setShowGames] = useState(savedState?.showGames || true);
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
    const [showDemoGameModal, setShowDemoGameModal] = useState(false);
    const [demoGameUrl, setDemoGameUrl] = useState('');
    const [demoGameLoading, setDemoGameLoading] = useState(false);
    const [demoGameForm, setDemoGameForm] = useState({ platType: 'ag', currency: 'CNY', gameType: '2', gameCode: '', lang: 'zh-hans', ingress: 'device2' });
    const [showDemoGameSettings, setShowDemoGameSettings] = useState(false);
    const transferState = useTransferState();
    const [isRestoringGame, setIsRestoringGame] = useState(false);

    // ✅ Gift states
    const [giftAmount, setGiftAmount] = useState(0);
    const [isRedeeming, setIsRedeeming] = useState(false);

    useEffect(() => {
        if (user) {
            const stateToSave = {
                user, playerId, gameList, selectedGameType, showGames, balances,
                allPlatformBalances, transferHistory: transferState.transferHistory,
                apiConfig, showApiConfig, showCreateAccount, createForm,
                transferMode: transferState.transferMode, usdtDeposit: transferState.usdtDeposit,
                usdtOrders: transferState.usdtOrders
            };
            saveStateToLocalStorage(stateToSave);
        }
    }, [user, playerId, gameList, selectedGameType, showGames, balances, allPlatformBalances,
        apiConfig, showApiConfig, showCreateAccount, createForm,
        transferState.transferHistory, transferState.transferMode,
        transferState.usdtDeposit, transferState.usdtOrders]);

    const saveGameSession = (game, url, playerId) => {
        try {
            const gameSession = {
                url, gameName: getGameName(game), gameCode: game.gameCode,
                platType: game.platType, gameType: game.gameType,
                playerId, timestamp: Date.now()
            };
            localStorage.setItem(`activeGameSession_${playerId}`, JSON.stringify(gameSession));
            sessionStorage.setItem(`hasActiveGame_${playerId}`, 'true');
        } catch (err) { console.error('Error saving game session:', err); }
    };

    const clearGameSession = (playerId) => {
        if (playerId) {
            localStorage.removeItem(`activeGameSession_${playerId}`);
            sessionStorage.removeItem(`hasActiveGame_${playerId}`);
        }
    };

    const restoreGameSession = () => {
        try {
            if (!user?.playerId) return;
            const savedGame = localStorage.getItem(`activeGameSession_${user.playerId}`);
            const hasActiveGame = sessionStorage.getItem(`hasActiveGame_${user.playerId}`);
            if (savedGame && hasActiveGame === 'true') {
                setIsRestoringGame(true);
                const gameSession = JSON.parse(savedGame);
                const hoursSinceLastAccess = (Date.now() - gameSession.timestamp) / (1000 * 60 * 60);
                if (hoursSinceLastAccess < 8) {
                    setGameUrl(gameSession.url);
                    setShowGameModal(true);
                    setCurrentGame({
                        platType: gameSession.platType, gameType: gameSession.gameType,
                        gameCode: gameSession.gameCode, gameName: { 'zh-hans': gameSession.gameName }
                    });
                } else {
                    clearGameSession(user.playerId);
                }
            }
        } catch (err) {
            console.error('Error restoring game session:', err);
            clearGameSession(user?.playerId);
        } finally {
            setIsRestoringGame(false);
        }
    };

    useEffect(() => {
        if (user && !isRestoringGame) restoreGameSession();
    }, [user]);

    const handleCloseGame = () => {
        setShowGameModal(false);
        clearGameSession(user?.playerId);
    };

    const handleCloseDemoGame = () => setShowDemoGameModal(false);

    // ✅ โหลด balance จาก AG API แล้ว sync เข้า MySQL แล้วดึงกลับมาแสดง
    const syncAndLoadBalance = async (currentUser) => {
        const targetUser = currentUser || user;
        if (!targetUser?.playerId) return;
        try {
            // 1. ดึง balance จาก AG API
            const agResult = await queryBalance(targetUser.playerId, 'ag', 'CNY');
            const agBalance = agResult?.data?.balance ?? agResult?.balance ?? 0;

            // 2. บันทึกลง MySQL (player_balances)
            try {
                await fetch('/backend-api/game/sync-balance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        playerId: targetUser.playerId,
                        balance: agBalance
                    })
                });
            } catch (syncErr) {
                console.warn('sync-balance failed:', syncErr);
            }

            // 3. ดึงจาก MySQL มาแสดง (เป็น source of truth)
            try {
                const res = await fetch(`/backend-api/game/player-balance/${targetUser.playerId}`);
                const data = await res.json();
                if (data.success) {
                    setBalances({ ag: parseFloat(data.balance || 0) });
                } else {
                    // fallback ใช้ค่าจาก AG API โดยตรง
                    setBalances({ ag: parseFloat(agBalance || 0) });
                }
            } catch (fetchErr) {
                // fallback ใช้ค่าจาก AG API โดยตรง
                setBalances({ ag: parseFloat(agBalance || 0) });
            }
        } catch (err) {
            console.error('syncAndLoadBalance error:', err);
            // fallback: ใช้ loadBalances เดิม
            await transferHandlers.handleLoadBalances(
                targetUser, queryBalance, queryAllBalances,
                setBalances, setAllPlatformBalances, setLoading
            );
        }
    };

    // ✅ loadBalances ยังคงไว้สำหรับ TransferModule ที่ใช้ queryAllBalances
    const loadBalances = async () => {
        await syncAndLoadBalance();
    };

    // ✅ โหลดยอดของขวัญ
    const loadGiftAmount = async () => {
        try {
            const token = localStorage.getItem('gift_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch('/backend-api/gift/check-status', { headers });
            const data = await res.json();
            if (data.success !== false) {
                setGiftAmount(data.amount_gift || 0);
            }
        } catch (err) {
            console.error('load gift error:', err);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            if (user && gameList.length === 0) {
                await handleLoadGameList();
                await syncAndLoadBalance(user);
                await loadGiftAmount();
            }
        };
        initializeData();
    }, [user]);

    const handleLoadGameList = async () => {
        try {
            const res = await fetch('/backend-api/game-covers/all');
            const data = await res.json();
            if (data.code === 10000 && data.data && data.data.length > 0) {
                const games = data.data.map(game => ({
                    platType: game.platType || 'ag', gameType: game.gameType || '1',
                    gameCode: game.gameCode, gameName: { 'zh-hans': game.gameName || game.gameCode },
                    imageUrl: game.imageUrl, status: 1
                }));
                setGameList(games);
            } else {
                setGameList(getFallbackGames());
            }
        } catch (err) {
            setGameList(getFallbackGames());
        }
    };

    useEffect(() => {
        if (savedState && savedState.user) {
            handleLoadGameList();
            syncAndLoadBalance(savedState.user);
            loadGiftAmount();
        }
    }, []);

    const handleTestAllApiEndpoints = async (payload) => {
        const results = await testAllApiEndpoints(payload);
        setApiTestResults(results);
        return results;
    };

    const handleCheckAccount = async () => {
        if (!playerId.trim()) { setError('โปรดป้อนหมายเลขบัญชี'); return; }
        if (!validatePlayerId(playerId)) { setError('รูปแบบบัญชีไม่ถูกต้อง (5-11 ตัวอักษรและตัวเลข)'); return; }
        setIsCheckingAccount(true);
        setError('');
        try {
            const mysqlCheck = await fetch(`/backend-api/game/check-game-account?playerId=${playerId}`);
            const mysqlData = await mysqlCheck.json();
            if (!mysqlCheck.ok) throw new Error('MySQL 检查失败');
            if (mysqlData.exists === true) {
                await fetch('/backend-api/game/update-game-login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId: playerId.trim() })
                });
                setAccountCheckResult({ exists: true, message: '账号存在 (数据库验证)' });
                setLoading('login');
                setTimeout(() => {
                    setUser({ playerId: playerId.trim(), currency: 'CNY', platType: 'ag', fromMysql: true });
                    setLoading('');
                }, 500);
            } else {
                const apiResult = await checkAccount(playerId);
                setAccountCheckResult(apiResult);
                if (apiResult.exists === true) {
                    try {
                        await fetch('/backend-api/game/create-game-account', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ playerId: playerId.trim(), platType: 'ag', currency: 'CNY' })
                        });
                    } catch (dbError) { console.warn('⚠️ ไม่สามารถบันทึกลง MySQL:', dbError); }
                    setLoading('login');
                    setTimeout(() => {
                        setUser({ playerId: playerId.trim(), currency: 'CNY', platType: 'ag', fromApi: true });
                        setLoading('');
                    }, 500);
                }
            }
        } catch (err) {
            setAccountCheckResult({ exists: null, error: '检查失败，请稍后重试' });
        } finally {
            setIsCheckingAccount(false);
        }
    };

    const handleCreateAccount = async () => {
        if (!validatePlayerId(createForm.playerId)) { setError('玩家账号必须为 5-11 位小写字母和数字组合'); return; }
        setLoading('create');
        const payload = { playerId: createForm.playerId.trim(), platType: createForm.platType, currency: createForm.currency };
        const testResults = await handleTestAllApiEndpoints(payload);
        const validEndpoint = testResults.find(r => r.success && r.data?.code === 10000);
        if (validEndpoint) {
            transferState.setSuccess(`账号创建成功！使用端点: ${validEndpoint.endpoint}`);
            setPlayerId(createForm.playerId);
        } else {
            setError('❌ 创建账号API不可用，请使用测试模式');
        }
        setLoading('');
    };

    const handleTestCreateAccount = async () => {
        if (!validatePlayerId(createForm.playerId)) { setError('玩家账号必须为 5-11 位小写字母和数字组合'); return; }
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
        if (!playerId.trim()) { setError('请输入玩家账号'); return; }
        setLoading('login');
        try {
            const newUser = { playerId: playerId.trim(), currency: 'CNY', platType: 'ag' };
            const mysqlCheck = await fetch(`/backend-api/game/check-game-account?playerId=${playerId}`);
            if (mysqlCheck.ok) {
                const mysqlData = await mysqlCheck.json();
                if (mysqlData.exists === true) {
                    await fetch('/backend-api/game/update-game-login', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerId: playerId.trim() })
                    });
                }
            }
            setUser(newUser);
            await handleLoadGameList();
            await syncAndLoadBalance(newUser);
            await loadGiftAmount();
            setAccountCheckResult(null);
        } catch (err) { setError('登录失败'); }
        finally { setLoading(''); }
    };

    const handleLogout = () => {
        const currentPlayerId = user?.playerId;
        setUser(null); setPlayerId(''); setGameList([]); setShowGames(false);
        setShowGameModal(false); setShowCreateAccount(false); setAccountCheckResult(null);
        setBalances({}); setAllPlatformBalances({});
        setGiftAmount(0);
        transferState.setShowBalanceModal(false); transferState.setShowTransferModal(false);
        setShowDemoGameModal(false); transferState.setShowUSDTDepositModal(false);
        clearStateFromLocalStorage(currentPlayerId);
        clearGameSession(currentPlayerId);
        if (currentPlayerId) {
            fetch('/backend-api/crypto/cancel-all-pending', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: currentPlayerId })
            });
        }
    };

    const getClientIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) { return 'unknown'; }
    };

    const handlePlayGame = async (game) => {
        setLoading(game.gameCode);
        const result = await apiCall('gameUrl', {
            playerId: user.playerId, platType: game.platType, currency: 'CNY',
            gameType: game.gameType, gameCode: game.gameCode, ingress: 'device2', lang: 'zh-hans'
        });
        const url = result?.data?.url;
        if (!url) { setError('❌ ไม่สามารถเปิดเกมได้ (API ไม่ส่ง URL)'); setLoading(''); return; }
        const clientIP = await getClientIP();
        try {
            await fetch('/backend-api/logs/game-access', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: user.playerId, platType: game.platType,
                    gameType: game.gameType, gameCode: game.gameCode,
                    ingress: 'device2', url, returnUrl: window.location.href,
                    ipAddress: clientIP, userAgent: navigator.userAgent
                })
            });
        } catch (err) { console.warn('⚠️ Failed to log game access:', err); }
        saveGameSession(game, url, user.playerId);
        setCurrentGame(game); setGameUrl(url); setShowGameModal(true); setLoading('');
    };

    const handlePlayDemoGame = async (game) => {
        setDemoGameLoading(true);
        try {
            const result = await getDemoGameUrl(game.platType || 'ag', 'CNY', game.gameType || '2', game.gameCode, 'zh-hans', 'device2');
            if (result.success && result.url) {
                try {
                    await fetch('/backend-api/logs/game-demo', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            platType: game.platType || 'ag', gameType: game.gameType || '2',
                            gameCode: game.gameCode, ingress: 'device2', url: result.url,
                            returnUrl: window.location.href, ipAddress: '', userAgent: navigator.userAgent
                        })
                    });
                } catch (err) { console.warn('⚠️ Failed to log demo access:', err); }
                setDemoGameUrl(result.url); setCurrentGame(game); setShowDemoGameModal(true);
            } else { setError(`试玩失败: ${result.message}`); }
        } catch (error) { setError('试玩功能暂时不可用'); }
        finally { setDemoGameLoading(false); }
    };

    const handlePlayDemoGameDirectly = async () => {
        setDemoGameLoading(true);
        try {
            const result = await getDemoGameUrl('ag', 'CNY', '2', '', 'zh-hans', 'device2');
            if (result.success && result.url) {
                setDemoGameUrl(result.url);
                setCurrentGame({ platType: 'ag', gameType: '2', gameCode: '', gameName: { 'zh-hans': 'AG游戏大厅 - 试玩模式' } });
                setShowDemoGameModal(true);
            } else { setError(`试玩失败: ${result.message}`); }
        } catch (error) { setError('试玩功能暂时不可用'); }
        finally { setDemoGameLoading(false); }
    };

    const handleCustomDemoGame = async () => {
        setDemoGameLoading(true);
        try {
            const result = await getDemoGameUrl(demoGameForm.platType, demoGameForm.currency, demoGameForm.gameType, demoGameForm.gameCode, demoGameForm.lang, demoGameForm.ingress);
            if (result.success && result.url) {
                setDemoGameUrl(result.url);
                setCurrentGame({ platType: demoGameForm.platType, gameType: demoGameForm.gameType, gameCode: demoGameForm.gameCode, gameName: { 'zh-hans': '试玩游戏' } });
                setShowDemoGameModal(true);
            } else { setError(`试玩失败: ${result.message}`); }
        } catch (error) { setError('试玩功能暂时不可用'); }
        finally { setDemoGameLoading(false); }
    };

    const handleRefreshBalance = async () => {
        setLoading('refresh');
        await syncAndLoadBalance();
        transferState.setSuccess('✅ 余额已更新');
        setTimeout(() => transferState.setSuccess(''), 2000);
        setLoading('');
    };

    const handleTransferAll = async () => {
        await transferHandlers.handleTransferAll(
            user, transferAllBalances, loadBalances, setLoading,
            transferState.setSuccess, transferState.setError
        );
    };

    useEffect(() => {
        if (!user) {
            transferState.setUsdtDeposit({ amount: '', orderId: '', status: '', usdtAmount: 0, address: '', expiresAt: null, qrCodeUrl: '' });
            transferState.setUsdtOrders([]);
            transferState.setShowUSDTDepositModal(false);
            transferState.setShowUsdtHistory(false);
            setGiftAmount(0);
            const lastPlayerId = localStorage.getItem('lastPlayerId');
            if (lastPlayerId) {
                fetch('/backend-api/crypto/cancel-all-pending', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId: lastPlayerId })
                });
            }
        }
    }, [user]);

    const handleTransfer = async () => {
        await transferHandlers.handleTransfer(
            user, transferState.transferMode, transferState.transferForm, transferAmount,
            loadBalances, transferState.setIsTransferring, transferState.setError,
            transferState.setSuccess, transferState.setTransferHistory,
            transferState.transferHistory, transferState.setTransferForm
        );
        // ✅ หลังโอนเงินสำเร็จ sync balance เข้า MySQL ด้วย
        await syncAndLoadBalance();
    };

    const handleCreateUSDTOrder = async (playerId, amount) => {
        try {
            const response = await fetch('/backend-api/crypto/create-order', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId, cnyAmount: amount })
            });
            return await response.json();
        } catch (err) { return { success: false, message: '网络错误' }; }
    };

    const validateOrderOwnership = (orderData, currentPlayerId) => {
        if (!orderData || !currentPlayerId) return false;
        if (orderData.playerId && orderData.playerId !== currentPlayerId) return false;
        return true;
    };

    const handleCheckUSDTOrder = async (orderId) => {
        try {
            if (!orderId || orderId.trim() === '') return { success: false, message: 'orderId ไม่สามารถเป็นค่าว่างได้' };
            const url = `/backend-api/crypto/check-order/${orderId}?playerId=${user.playerId}`;
            const response = await fetch(url);
            if (!response.ok) return { success: false, message: `เซิร์ฟเวอร์ตอบกลับด้วยสถานะ ${response.status}` };
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) return { success: false, message: 'เซิร์ฟเวอร์ตอบกลับด้วยข้อมูลที่ไม่ใช่ JSON' };
            const data = await response.json();
            if (!validateOrderOwnership(data, user.playerId)) return { success: false, message: '无权访问此订单' };
            // ✅ ถ้า order paid แล้ว sync balance
            if (data.status === 'paid') {
                await syncAndLoadBalance();
            }
            return data;
        } catch (err) {
            if (err.name === 'SyntaxError' && err.message.includes('JSON')) return { success: false, message: 'ข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง' };
            return { success: false, message: '检查订单失败' };
        }
    };

    const handleLoadUSDTHistory = async (playerId) => {
        try {
            const response = await fetch(`/backend-api/crypto/deposit-history/${playerId}?limit=20`);
            return await response.json();
        } catch (err) { return { success: false, message: '加载历史失败' }; }
    };

    // ✅ แลกของขวัญเป็นเงินเกม + sync balance เข้า MySQL
    const handleRedeemGift = async () => {
        if (giftAmount <= 0 || isRedeeming) return;
        setIsRedeeming(true);
        setError('');
        try {
            const token = localStorage.getItem('gift_token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            };

            // 1. แลกของขวัญกับ backend
            const redeemRes = await fetch('/backend-api/gift/redeem', { method: 'POST', headers });
            const redeemData = await redeemRes.json();

            if (!redeemData.success) {
                setError(redeemData.message || '❌ 兑换失败');
                setTimeout(() => setError(''), 3000);
                return;
            }

            const redeemAmount = redeemData.redeemAmount;

            // 2. โอนเงินเข้าบัญชีเกม
            const transferResult = await transferAmount(
                user.playerId, 'ag', 'CNY', '1',
                redeemAmount,
                `gift_${Date.now()}`
            );

            if (transferResult.success || transferResult?.data?.code === 10000) {
                transferState.setSuccess(`🎁 兑换成功！¥${redeemAmount} 已存入游戏账号`);
                setGiftAmount(0);
                // ✅ sync balance เข้า MySQL หลังแลกของขวัญ
                await syncAndLoadBalance();
                setTimeout(() => transferState.setSuccess(''), 3000);
            } else {
                setError('❌ 转账失败，请联系客服处理');
                await loadGiftAmount();
                setTimeout(() => setError(''), 4000);
            }
        } catch (err) {
            console.error('Redeem error:', err);
            setError('❌ 兑换失败，请稍后重试');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsRedeeming(false);
        }
    };

    // ─── PAGE COMPONENTS ───────────────────────────────────────────────

    const BannerSlider = React.memo(() => {
        const [idx, setIdx] = useState(0);
        const items = [
            { bg: 'from-blue-900 to-indigo-900', text: '体育赛事享重礼', sub: '每周好礼不断', detail: '88+1888超豪礼金等你来赢' },
            { bg: 'from-purple-900 to-pink-900', text: '真人娱乐盛典', sub: '全新体验等你来', detail: '首存送100%红利' },
            { bg: 'from-green-900 to-teal-900', text: '电子游艺', sub: '百款游戏畅玩', detail: '每日返水无上限' },
        ];
        useEffect(() => {
            const t = setInterval(() => setIdx(p => (p + 1) % items.length), 3500);
            return () => clearInterval(t);
        }, []);
        return (
            <div className="mx-3 mt-3 rounded-2xl overflow-hidden h-36 relative shadow-md flex-shrink-0">
                {items.map((b, i) => (
                    <div key={i} className={`absolute inset-0 bg-gradient-to-r ${b.bg} flex flex-col justify-center px-5 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute right-0 bottom-0 opacity-20 text-8xl select-none">⚽</div>
                        <p className="text-white text-lg font-bold leading-tight">{b.text}</p>
                        <p className="text-white/80 text-sm">{b.sub}</p>
                        <p className="text-yellow-300 text-xs mt-1">{b.detail}</p>
                    </div>
                ))}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {items.map((_, i) => (
                        <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`} />
                    ))}
                </div>
            </div>
        );
    });

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
                    <div><label className="block text-white mb-2">服务器地址</label><input type="text" value={apiConfig.serverUrl} onChange={(e) => setApiConfig({ ...apiConfig, serverUrl: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" /></div>
                    <div><label className="block text-white mb-2">游戏API地址</label><input type="text" value={apiConfig.baseUrl} onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-white mb-2">SN</label><input type="text" value={apiConfig.sn} onChange={(e) => setApiConfig({ ...apiConfig, sn: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" /></div>
                        <div><label className="block text-white mb-2">Secret</label><input type="password" value={apiConfig.secret} onChange={(e) => setApiConfig({ ...apiConfig, secret: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" /></div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => { Object.assign(API_CONFIG, apiConfig); transferState.setSuccess('API配置已更新'); setTimeout(() => transferState.setSuccess(''), 3000); }} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold">保存配置</button>
                        <button onClick={() => setShowApiConfig(false)} className="flex-1 py-3 bg-white/10 text-white rounded-lg">返回</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const CreateAccountPage = () => <div></div>;

    // ─── LOGIN PAGE ────────────────────────────────────────────────────
    const LoginPage = () => (
        <div className="min-h-screen flex flex-col" style={{ background: '#f0f4ff' }}>
            <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">多米体育</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">游客</span>
                    <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 rounded-full">会员</span>
                </div>
            </div>
            <BannerSlider />
            <div className="mx-3 mt-3 bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-xs text-gray-400">您还未登录</p>
                    <p className="text-xs text-gray-400">请先登录/注册后查看</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-1">
                            <Download className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="text-xs text-gray-500">存款</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-1">
                            <Upload className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-xs text-gray-500">取款</span>
                    </div>
                </div>
            </div>
            <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm p-5 flex-1">
                <div className="text-center mb-5">
                    <h2 className="text-lg font-bold text-gray-800">登录账号</h2>
                    <p className="text-sm text-gray-400">请输入您的玩家账号</p>
                </div>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm">{error}</div>
                )}
                {!accountCheckResult ? (
                    <div className="space-y-3">
                        <input
                            type="text" value={playerId}
                            onChange={(e) => { setPlayerId(e.target.value.toLowerCase()); setAccountCheckResult(null); }}
                            onKeyPress={(e) => e.key === 'Enter' && handleCheckAccount()}
                            placeholder="输入您的账号"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-blue-400"
                            autoFocus disabled={isCheckingAccount}
                        />
                        <button onClick={handleCheckAccount} disabled={isCheckingAccount || !playerId}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
                            {isCheckingAccount ? <><Loader2 className="w-4 h-4 animate-spin" />检查中...</> : <><Search className="w-4 h-4" />检查账号</>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {accountCheckResult.exists === true ? (
                            <>
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center gap-2 text-green-600 font-semibold mb-1 text-sm"><CheckCircle className="w-4 h-4" />账号存在</div>
                                    <p className="text-green-500 text-xs">该账号在系统中已注册</p>
                                </div>
                                <button onClick={handleLogin} disabled={loading === 'login'}
                                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold text-sm disabled:opacity-50 shadow-md">
                                    {loading === 'login' ? '登录中...' : '继续登录'}
                                </button>
                            </>
                        ) : accountCheckResult.exists === false ? (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                <div className="flex items-center gap-2 text-orange-500 font-semibold mb-1 text-sm"><AlertCircle className="w-4 h-4" />账号不存在</div>
                                <p className="text-orange-400 text-xs">该账号未在系统中注册，请创建新账号</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center gap-2 text-red-500 font-semibold mb-1 text-sm"><AlertCircle className="w-4 h-4" />检查失败</div>
                                <p className="text-red-400 text-xs">{accountCheckResult.error || '无法连接到服务器'}</p>
                            </div>
                        )}
                        <button onClick={() => { setAccountCheckResult(null); setPlayerId(''); }} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-sm">返回</button>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── DEMO GAME MODAL ───────────────────────────────────────────────
    const DemoGameModal = () => (
        <div className="fixed inset-0 z-50 flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 p-1 bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={handleCloseDemoGame} className="ml-auto block text-white rounded-full shadow-xl"><X className="w-7 h-7" /></button>
            </div>
            {demoGameUrl ? (
                <iframe src={demoGameUrl} className="w-full h-full" title="试玩游戏" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation" />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-900">
                    <div className="text-center"><GamepadIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-400">加载试玩游戏中...</p></div>
                </div>
            )}
        </div>
    );

    const DemoGameSettingsModal = () => (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
                <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><PlayCircle className="w-5 h-5 text-green-400" />自定义试玩游戏</h3>
                        <p className="text-gray-400 text-sm mt-1">无需账号即可体验</p>
                    </div>
                    <button onClick={() => setShowDemoGameSettings(false)} className="p-2 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">
                    {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>}
                    <div className="space-y-4">
                        <div><label className="block text-white mb-2">游戏平台</label><select value={demoGameForm.platType} onChange={(e) => setDemoGameForm({ ...demoGameForm, platType: e.target.value })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="ag">AG 平台</option></select></div>
                        <div><label className="block text-white mb-2">游戏类型</label><select value={demoGameForm.gameType} onChange={(e) => setDemoGameForm({ ...demoGameForm, gameType: e.target.value })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="1">视讯</option><option value="2">电子游艺</option><option value="3">彩票游戏</option><option value="4">体育竞技</option><option value="5">电子竞技</option><option value="6">捕鱼游戏</option><option value="7">棋牌游戏</option><option value="8">真人娱乐</option></select></div>
                        <div><label className="block text-white mb-2">游戏代码 (可选)</label><input type="text" value={demoGameForm.gameCode} onChange={(e) => setDemoGameForm({ ...demoGameForm, gameCode: e.target.value })} placeholder="留空进入游戏大厅" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-white mb-2">语言</label><select value={demoGameForm.lang} onChange={(e) => setDemoGameForm({ ...demoGameForm, lang: e.target.value })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="zh-hans">简体中文</option><option value="zh-hant">繁体中文</option><option value="en">英语</option><option value="th">泰语</option><option value="vi">越南语</option></select></div>
                            <div><label className="block text-white mb-2">终端类型</label><select value={demoGameForm.ingress} onChange={(e) => setDemoGameForm({ ...demoGameForm, ingress: e.target.value })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="device1">电脑网页版</option><option value="device2">手机网页版</option></select></div>
                        </div>
                        <button onClick={handleCustomDemoGame} disabled={demoGameLoading} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                            {demoGameLoading ? <><Loader2 className="w-4 h-4 animate-spin" />加载中...</> : <><PlayCircle className="w-4 h-4" />开始试玩</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ─── HOME PAGE ─────────────────────────────────────────────────────
    const HomePage = () => {
        const gamesByType = {};
        gameList.forEach(g => {
            const type = g.gameType || '2';
            if (!gamesByType[type]) gamesByType[type] = [];
            gamesByType[type].push(g);
        });

        const gameCategories = [
            { id: '1', name: '真人' },
            { id: '2', name: '电子' },
            { id: '7', name: '棋牌' },
            { id: '3', name: '彩票' },
            { id: '4', name: '体育' },
            { id: '6', name: '捕鱼' },
            { id: '5', name: '电竞' },
        ];

        return (
            <>
                {!showGameModal && (
                    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#eef2ff' }}>

                        {/* ── TOP HEADER ── */}
                        <div className="bg-white shadow-sm px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-40">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow">
                                    <Gamepad2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm leading-tight">多米体育</p>
                                    <p className="text-gray-400 text-[10px]">{user?.playerId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePlayDemoGameDirectly} disabled={demoGameLoading}
                                    className="text-xs text-white bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 rounded-full font-medium shadow disabled:opacity-50 flex items-center gap-1">
                                    {demoGameLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                                    试玩
                                </button>
                                <button onClick={handleLogout} className="p-1.5 bg-red-50 text-red-400 rounded-full">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── BANNER ── */}
                        <BannerSlider />

                        {/* ── NOTICE BAR ── */}
                        <div className="mx-3 mt-2 bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                            <span className="text-xs text-amber-500">
                                <img src="https://net.ng-demo.xyz/Areas/Wap11/Content/images/main/iconNoitce.png" alt="" className='w-6 h-6' />
                            </span>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs text-gray-400 whitespace-nowrap animate-scroll">
                                    欢迎来到多米体育，祝您游戏愉快！
                                </p>
                            </div>
                            <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        </div>

                        {/* ── BALANCE BAR ── */}
                        <div className="mx-3 mt-2 bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <Wallet className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-gray-500">余额</span>
                                    {/* ✅ แสดง label ว่าดึงจาก MySQL */}
                                    <span className="text-[9px] text-green-400 bg-green-50 px-1 rounded">DB</span>
                                </div>
                                <button
                                    onClick={() => transferState.setShowBalanceModal(true)}
                                    className="text-xl font-bold text-gray-800 mt-0.5 hover:text-blue-600 transition-colors"
                                >
                                    ¥ {balances.ag?.toFixed(2) || '0.00'}
                                </button>
                            </div>
                            <div className="flex gap-3">

                                {/* ✅ ปุ่มแลกของขวัญ */}
                                <button onClick={handleRedeemGift} disabled={giftAmount <= 0 || isRedeeming} className="flex flex-col items-center gap-0.5">
                                    <div className={`flex items-center justify-center'
                                        }`}>
                                        {isRedeeming
                                            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                            : <span className={`text-lg leading-none ${giftAmount > 0 ? '' : 'grayscale opacity-40'}`}>
                                                <img src="/icon/icon_02 - Copy.png" className='w-10 h-10' alt="" />
                                            </span>
                                        }
                                        {giftAmount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-[9px] font-bold text-gray-800 rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow">
                                                {giftAmount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-500">兑换</span>
                                </button>

                                {/* ปุ่ม 存款 */}
                                <button onClick={() => { transferState.setTransferMode('deposit'); transferState.setShowUSDTDepositModal(true); }} className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center justify-center">
                                        <img src="/icon/icon_01.png" className='w-10 h-10' alt="" />
                                    </div>
                                    <span className="text-[10px] text-gray-500">存款</span>
                                </button>

                                {/* ปุ่ม 取款 */}
                                <button onClick={() => { transferState.setTransferMode('withdraw'); transferState.setShowTransferModal(true); }} className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center justify-center">
                                        <img src="/icon/icon_03 - Copy.png" className='w-10 h-10' alt="" />
                                    </div>
                                    <span className="text-[10px] text-gray-500">取款</span>
                                </button>

                                {/* ปุ่ม 刷新 */}
                                <button onClick={handleRefreshBalance} className="flex flex-col items-center gap-0.5">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                        <RefreshCw className={`w-4 h-4 text-gray-500 ${loading === 'refresh' ? 'animate-spin' : ''}`} />
                                    </div>
                                    <span className="text-[10px] text-gray-500">刷新</span>
                                </button>
                            </div>
                        </div>

                        {/* ── Error toast ── */}
                        {error && (
                            <div className="mx-3 mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-xs flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* ── Success toast ── */}
                        {transferState.success && (
                            <div className="mx-3 mt-2 p-2.5 bg-green-50 border border-green-200 rounded-xl text-green-600 text-xs flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                {transferState.success}
                            </div>
                        )}

                        {/* ── MAIN CONTENT: Sidebar + Game Grid ── */}
                        <div className="flex flex-1 mt-2 pb-3 gap-2 min-h-0">

                            {/* LEFT SIDEBAR */}
                            <div className="w-[78px] ml-2 flex flex-col items-center pt-4 gap-4">
                                {gameCategories.map((cat) => {
                                    const isActive = selectedGameType === cat.id;
                                    return (
                                        <button key={cat.id} onClick={() => setSelectedGameType(cat.id)} className="w-auto h-auto relative active:scale-95 transition-transform px-1">
                                            <div className={`absolute inset-0 rounded-2xl ${isActive ? 'bg-gradient-to-b from-[#f6e2b7] to-[#e3b97a] shadow-[0_4px_10px_rgba(0,0,0,0.12)]' : 'bg-white shadow-[0_3px_8px_rgba(0,0,0,0.06)]'}`} />
                                            <div className="relative z-10 flex flex-col-2 items-center justify-center h-full">
                                                <img src={isActive ? `/images/tabs/tab_${cat.id}_g.png` : `/images/tabs/tab_${cat.id}_w.png`} className="w-10 h-10 mb-1" />
                                                <span className={`text-[14px] font-medium leading-none whitespace-nowrap ${isActive ? 'text-[#ffffff]' : 'text-blue-300'}`}>{cat.name}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* RIGHT - Game Grid */}
                            <div className="flex-1 min-w-0 overflow-y-auto pb-4" style={{ scrollbarWidth: 'none' }}>
                                {gamesByType[selectedGameType]?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2 px-2 pb-4">
                                        {(selectedGameType === '1'
                                            ? gamesByType[selectedGameType].slice(0, 1).map(g => ({ ...g, imageUrl: '/20251121_mb_loading_hans.jpg' }))
                                            : gamesByType[selectedGameType]
                                        ).map((g, i) => (
                                            <button key={i} onClick={() => handlePlayGame(g)} disabled={loading === g.gameCode}
                                                className="overflow-hidden transition-all active:scale-95 text-left disabled:opacity-70">
                                                <div className="relative w-full bg-slate-800 rounded-t-xl overflow-hidden">
                                                    {g.imageUrl ? (
                                                        <img src={g.imageUrl} alt={getGameName(g)} className="w-full h-auto block" style={{ display: 'block' }} />
                                                    ) : (
                                                        <div className="w-full aspect-square flex items-center justify-center">
                                                            <GamepadIcon className="w-10 h-10 text-indigo-300" />
                                                        </div>
                                                    )}
                                                    {loading === g.gameCode && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 left-2">
                                                        <span className="text-[9px] bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium uppercase">{g.platType || 'AG'}</span>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1.5">
                                                    <p className="text-gray-800 font-semibold text-xs truncate leading-tight">{getGameName(g)}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 text-center mr-2">
                                        <GamepadIcon className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-gray-400 text-sm">此分类暂无游戏</p>
                                        <p className="text-gray-300 text-xs mt-1">请选择其他分类</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── FULL-SCREEN GAME MODAL ── */}
                {showGameModal && currentGame && gameUrl && (
                    <div className="fixed inset-0 z-50 flex flex-col">
                        <div className="fixed top-0 left-0 right-0 z-50 p-1 bg-gradient-to-b from-black/50 to-transparent">
                            <button onClick={handleCloseGame} className="ml-auto block text-white rounded-full shadow-xl" title="关闭游戏">
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        <iframe src={gameUrl} title={getGameName(currentGame)} className="fixed inset-0 w-screen h-[100dvh]" style={{ border: 'none' }} allow="fullscreen autoplay encrypted-media" allowFullScreen />
                    </div>
                )}

                {/* ── OTHER MODALS ── */}
                {transferState.showBalanceModal && (
                    <BalanceDetailModal user={user} balances={balances} loading={loading} showBalanceModal={transferState.showBalanceModal} setShowBalanceModal={transferState.setShowBalanceModal} setTransferMode={transferState.setTransferMode} setShowTransferModal={transferState.setShowTransferModal} handleRefreshBalance={handleRefreshBalance} handleTransferAll={handleTransferAll} setShowUSDTDepositModal={transferState.setShowUSDTDepositModal} />
                )}
                {transferState.showTransferModal && (
                    <TransferModal user={user} balances={balances} transferMode={transferState.transferMode} setTransferMode={transferState.setTransferMode} transferForm={transferState.transferForm} setTransferForm={transferState.setTransferForm} isTransferring={transferState.isTransferring} showTransferModal={transferState.showTransferModal} setShowTransferModal={transferState.setShowTransferModal} setShowTransferHistory={transferState.setShowTransferHistory} success={transferState.success} error={transferState.error} handleTransfer={handleTransfer} />
                )}
                {transferState.showTransferHistory && (
                    <TransferHistoryModal transferHistory={transferState.transferHistory} showTransferHistory={transferState.showTransferHistory} setShowTransferHistory={transferState.setShowTransferHistory} />
                )}
                {transferState.showUSDTDepositModal && (
                    <USDTDepositModal user={user} showUSDTDepositModal={transferState.showUSDTDepositModal} setShowUSDTDepositModal={transferState.setShowUSDTDepositModal} usdtDeposit={transferState.usdtDeposit} setUsdtDeposit={transferState.setUsdtDeposit} loading={loading} setLoading={setLoading} success={transferState.success} setSuccess={transferState.setSuccess} error={transferState.error} setError={transferState.setError} createUSDTOrder={handleCreateUSDTOrder} checkUSDTOrder={handleCheckUSDTOrder} loadUSDTHistory={handleLoadUSDTHistory} setUsdtOrders={transferState.setUsdtOrders} setShowUsdtHistory={transferState.setShowUsdtHistory} />
                )}
                {transferState.showUsdtHistory && (
                    <USDTDepositHistoryModal usdtOrders={transferState.usdtOrders} showUsdtHistory={transferState.showUsdtHistory} setShowUsdtHistory={transferState.setShowUsdtHistory} />
                )}
                {showDemoGameModal && <DemoGameModal />}
                {showDemoGameSettings && <DemoGameSettingsModal />}
            </>
        );
    };

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
        <div className="min-h-screen flex justify-center bg-[#e9edf7]">
            <div className="w-full max-w-[430px] bg-[#eef2ff] min-h-screen shadow-xl">
                {showApiConfig
                    ? <ApiConfigPage />
                    : showCreateAccount
                        ? <CreateAccountPage />
                        : !user
                            ? <LoginPage />
                            : <HomePage />}
            </div>
        </div>
    );
};

export default App;