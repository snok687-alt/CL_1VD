import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, CreditCard, History, Upload, Download, RefreshCw,
  Wallet, BarChart3, QrCode, Copy, CheckCircle, Clock, ExternalLink
} from 'lucide-react';
import tronLogo from "../../public/USDT-TRC20.png";

export const useTransferState = () => {
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferHistory, setShowTransferHistory] = useState(false);
  const [showUSDTDepositModal, setShowUSDTDepositModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    platType: 'ag',
    amount: '',
    orderId: '',
    walletAddress: ''
  });
  const [transferMode, setTransferMode] = useState('deposit');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [balances, setBalances] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  // USDT Deposit States
  const [usdtDeposit, setUsdtDeposit] = useState({
    amount: '',
    orderId: '',
    status: '',
    usdtAmount: 0,
    address: '',
    expiresAt: null,
    qrCodeUrl: ''
  });

  const [usdtOrders, setUsdtOrders] = useState([]);
  const [showUsdtHistory, setShowUsdtHistory] = useState(false);

  return {
    showBalanceModal, setShowBalanceModal,
    showTransferModal, setShowTransferModal,
    showTransferHistory, setShowTransferHistory,
    transferForm, setTransferForm,
    transferMode, setTransferMode,
    isTransferring, setIsTransferring,
    transferHistory, setTransferHistory,
    balances, setBalances,
    success, setSuccess,
    error, setError,
    loading, setLoading,

    // USDT Deposit States
    showUSDTDepositModal, setShowUSDTDepositModal,
    usdtDeposit, setUsdtDeposit,
    usdtOrders, setUsdtOrders,
    showUsdtHistory, setShowUsdtHistory
  };
};

// ----------------------- MODALS -----------------------
const ModalWrapper = ({ children, show, onClose, className = 'max-w-2xl' }) =>
  show ? (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className={`bg-slate-800 border border-slate-700 rounded-2xl w-full ${className} max-h-[90vh] overflow-y-auto relative`}>
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  ) : null;

// Balance Modal
export const BalanceDetailModal = ({
  user, balances, loading,
  showBalanceModal, setShowBalanceModal,
  setTransferMode, setShowTransferModal,
  handleRefreshBalance, handleTransferAll,
  setShowUSDTDepositModal
}) => (
  <ModalWrapper show={showBalanceModal} onClose={() => setShowBalanceModal(false)}>
    <div className="p-6">
      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
        <Wallet className="w-7 h-7 text-blue-400" /> 余额详情
      </h3>

      <p className="text-gray-400 mt-1">玩家: {user?.playerId}</p>

      <div className="my-6 p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">主账户余额</p>
          <p className="text-3xl font-bold text-white mt-2">¥ {balances.ag?.toFixed(2) || '0.00'}</p>
        </div>
        <button onClick={handleRefreshBalance} disabled={loading === 'refresh'} className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50">
          <RefreshCw className={`w-5 h-5 text-white ${loading === 'refresh' ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" /> 各平台余额
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(balances).map(([plat, bal]) => (
          <div key={plat} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">{plat.toUpperCase()}</p>
            <p className="text-xl font-bold text-white">{bal == null ? '--' : `¥ ${parseFloat(bal || 0).toFixed(2)}`}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex gap-3">
          <button onClick={() => { setTransferMode('withdraw'); setShowBalanceModal(false); setShowTransferModal(true); }} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> 提现
          </button>

          {/* ปุ่ม USDT Deposit - ระบบฝากเงินหลัก */}
          <button
            onClick={() => {
              setShowBalanceModal(false);
              setShowUSDTDepositModal(true);
            }}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />存款
          </button>
        </div>
      </div>
    </div>
  </ModalWrapper>
);

// USDT Deposit Modal
export const USDTDepositModal = ({
  user,
  showUSDTDepositModal,
  setShowUSDTDepositModal,
  usdtDeposit,
  setUsdtDeposit,
  loading,
  setLoading,
  success,
  setSuccess,
  error,
  setError,
  createUSDTOrder,
  checkUSDTOrder,
  loadUSDTHistory,
  setUsdtOrders,
  setShowUsdtHistory
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const checkInterval = useRef(null);

  const USDT_ADDRESS = 'TTvu6ZR9BEyQZYQsHeYnF4HBsWhAyq8i3S';
  const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT TRC-20 Contract
  const FIX_RATE = 7.2;
  const MIN_AMOUNT = 10; // 10 CNY = 1.388889 USDT

  useEffect(() => {
    setIsClient(true);
  }, []);

  // สร้าง QR Code URL
  const generateQRCode = (address, amount) => {
    const qrData = `${address}%0A%0A%0A${amount}`; // แสดง address ตรง
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;
  };

  // เปิด Wallet App ผ่าน Deep Link
  const openWalletApp = useCallback((walletType) => {
    const address = USDT_ADDRESS;
    const amount = usdtDeposit.usdtAmount;
    const contract = USDT_CONTRACT;

    let deepLink = '';
    let walletName = '';

    switch (walletType) {
      case 'tronlink':
        walletName = 'TronLink';
        // TronLink Deep Link สำหรับ Mobile
        deepLink = `tronlinkoutside://transaction?to=${address}&amount=${amount}&token=${contract}&decimals=6`;
        break;

      case 'trust':
        walletName = 'Trust Wallet';
        // Trust Wallet Deep Link
        deepLink = `trust://send?asset=c${contract.toLowerCase()}&address=${address}&amount=${amount}`;
        break;

      case 'binance':
        walletName = 'Binance';
        // Binance App Deep Link
        deepLink = `binance://send?coin=USDT&network=TRX&address=${address}&amount=${amount}`;
        break;

      case 'imtoken':
        walletName = 'imToken';
        // imToken Deep Link
        deepLink = `imtokenv2://navigate/DappView?url=${encodeURIComponent(`tron:${address}?amount=${amount}&token=${contract}`)}`;
        break;

      default:
        // Universal Tron URI
        deepLink = `tron:${address}?amount=${amount}&token=${contract}`;
        walletName = 'Wallet';
    }

    console.log('🔗 Opening:', deepLink);

    // พยายามเปิด Deep Link
    window.location.href = deepLink;

    // ถ้า App ไม่เปิด ให้แสดงคำแนะนำ
    setTimeout(() => {
      if (document.hasFocus()) {
        const message = `ไม่พบ ${walletName} App บนอุปกรณ์นี้\n\nวิธีแก้ไข:\n\n1. ติดตั้ง ${walletName} App ก่อน\n2. หรือคัดลอกข้อมูลด้านล่างและเปิด App เอง\n\n📍 ที่อยู่:\n${address}\n\n💰 จำนวน:\n${amount} USDT\n\n🔗 Token:\nUSDT (TRC-20)`;
        alert(message);
      }
    }, 2000);
  }, [usdtDeposit.usdtAmount, USDT_ADDRESS, USDT_CONTRACT]);

  // คัดลอกที่อยู่
  const copyToClipboard = useCallback((text, type = 'address') => {
    if (!isClient) return;

    const fallbackCopyToClipboard = (textToCopy) => {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          if (type === 'address') {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } else {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Fallback: ไม่สามารถคัดลอกได้', err);
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          if (type === 'address') {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } else {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
          }
        })
        .catch(err => {
          console.error('Clipboard API failed, using fallback:', err);
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  }, [isClient]);

  // สร้างคำสั่งฝาก USDT
  const handleCreateOrder = async () => {
    if (!usdtDeposit.amount || Number(usdtDeposit.amount) < MIN_AMOUNT) {
      setError(`จำนวนเงินขั้นต่ำ ${MIN_AMOUNT} CNY (10 USDT)`);
      return;
    }

    setLoading('usdt');
    setError('');

    try {
      const result = await createUSDTOrder(user.playerId, usdtDeposit.amount);

      if (result.success) {
        const qrCodeUrl = generateQRCode(USDT_ADDRESS, result.usdtAmount);

        setUsdtDeposit({
          ...usdtDeposit,
          orderId: result.orderId,
          usdtAmount: result.usdtAmount,
          address: USDT_ADDRESS,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          qrCodeUrl: qrCodeUrl,
          status: 'pending'
        });

        setSuccess('สร้างคำสั่งฝากสำเร็จ! กรุณาชำระเงินภายใน 30 นาที');
        startOrderChecking(result.orderId);
      } else {
        setError(result.message || 'สร้างคำสั่งฝากล้มเหลว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสร้างคำสั่งฝาก');
    } finally {
      setLoading('');
    }
  };

  // ใน USDTDepositModal component
  const startOrderChecking = (orderId) => {
    if (!orderId) {
      console.error('❌ ไม่มี orderId สำหรับการตรวจสอบ');
      return;
    }

    console.log('🔄 เริ่มตรวจสอบ orderId:', orderId);

    if (checkInterval.current) clearInterval(checkInterval.current);

    checkInterval.current = setInterval(async () => {
      setIsChecking(true);

      try {
        // ✅ ต้องส่ง orderId ไปด้วย
        const result = await checkUSDTOrder(orderId, user.playerId);
        setIsChecking(false);

        if (result.success) {
          if (result.status === 'paid') {
            setUsdtDeposit(prev => ({ ...prev, status: 'paid' }));
            setSuccess('✅ ชำระเงินสำเร็จ! เงินกำลังเข้าบัญชี...');
            clearInterval(checkInterval.current);

            setTimeout(() => {
              if (typeof window.loadBalances === 'function') {
                window.loadBalances();
              }
            }, 2000);
          } else if (result.status === 'expired') {
            setUsdtDeposit(prev => ({ ...prev, status: 'expired' }));
            setError('⏰ คำสั่งฝากหมดอายุแล้ว');
            clearInterval(checkInterval.current);
          }
        }
      } catch (error) {
        setIsChecking(false);
        console.error('❌ Error in checking interval:', error);
      }
    }, 10000);
  };

  // แสดงตัวนับเวลา
  const TimerDisplay = () => {
    const [timeLeft, setTimeLeft] = useState(1800);

    useEffect(() => {
      if (usdtDeposit.expiresAt) {
        const updateTimer = () => {
          const now = new Date();
          const expires = new Date(usdtDeposit.expiresAt);
          const diff = Math.max(0, Math.floor((expires - now) / 1000));
          setTimeLeft(diff);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
      }
    }, [usdtDeposit.expiresAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <Clock className="w-4 h-4" />
        <span className="font-mono">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  // โหลดประวัติ USDT
  const loadHistory = async () => {
    if (user?.playerId) {
      const result = await loadUSDTHistory(user.playerId);
      if (result.success) {
        setUsdtOrders(result.deposits || []);
        setShowUsdtHistory(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current);
    };
  }, []);

  return (
    <ModalWrapper show={showUSDTDepositModal} onClose={() => setShowUSDTDepositModal(false)} className="max-w-4xl">
      <div className="p-6 space-y-6">
        {/* หัวข้อ */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <CreditCard className="w-7 h-7 text-purple-400" /> USDT
          </h3>
          <p className="text-gray-400 mt-1">玩家: {user?.playerId}</p>
        </div>

        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* ฟอร์มป้อนจำนวนเงิน */}
        {!usdtDeposit.orderId ? (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">汇率 (固定)</span>
                <span className="text-white font-bold">1 USDT = {FIX_RATE} CNY</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">最低存款</span>
                <span className="text-white font-bold">10 CNY</span>
              </div>
              <div className="mt-3 p-2 bg-blue-900/30 rounded text-sm text-blue-300">
                💡 注意: 系统仅接受 USDT 存款，请确保发送 USDT 币种
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-white text-lg font-semibold">存款金额 (CNY)</label>
              <input
                type="number"
                value={usdtDeposit.amount}
                onChange={(e) => setUsdtDeposit({ ...usdtDeposit, amount: e.target.value })}
                placeholder={`最少 ${MIN_AMOUNT} CNY`}
                min={MIN_AMOUNT}
                step="1"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xl text-center"
              />
              <div className="text-center text-xl font-bold text-purple-300">
                ≈ {(Number(usdtDeposit.amount) / FIX_RATE).toFixed(6)} USDT
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={loading === 'usdt' || !usdtDeposit.amount || Number(usdtDeposit.amount) < MIN_AMOUNT}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 text-lg"
            >
              {loading === 'usdt' ? 'กำลังสร้างคำสั่ง...' : '创建存款订单'}
            </button>

            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <h4 className="text-yellow-300 font-semibold mb-2">存款流程说明:</h4>
              <ol className="text-gray-300 text-sm space-y-1 ml-4 list-decimal">
                <li>输入 CNY 金额并创建订单</li>
                <li>扫描 QR Code 或选择钱包 App</li>
                <li>系统自动验证交易 (约 1-3 分钟)</li>
                <li>验证成功后自动充值到游戏账户</li>
              </ol>
            </div>
          </div>
        ) : (
          /* ข้อมูลการชำระเงิน */
          <div className="space-y-6">
            {/* สถานะคำสั่ง */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${usdtDeposit.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                  usdtDeposit.status === 'expired' ? 'bg-red-500/20 text-red-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                  {usdtDeposit.status === 'paid' ? 'ชำระแล้ว' :
                    usdtDeposit.status === 'expired' ? 'หมดอายุ' :
                      'รอการชำระ'}
                </div>
                {isChecking && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    กำลังตรวจสอบ...
                  </div>
                )}
              </div>
              {usdtDeposit.status === 'pending' && <TimerDisplay />}
            </div>

            {/* ข้อมูลคำสั่ง */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ข้อมูลด้านซ้าย */}
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">订单号:</span>
                      <span className="text-white font-mono text-sm">{usdtDeposit.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">存款金额:</span>
                      <span className="text-white font-bold text-lg">{usdtDeposit.amount} CNY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">支付金额:</span>
                      <span className="text-white font-bold text-lg">{usdtDeposit.usdtAmount} USDT</span>
                    </div>
                  </div>
                </div>

                {/* ที่อยู่ Wallet */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <label className="block text-gray-400 mb-2 flex items-center gap-2">
                    <img src={tronLogo} className="w-5 h-5" />
                    <span>USDT tron (TRC-20)</span>
                  </label>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 bg-slate-800 px-3 py-2 rounded text-white break-all font-mono text-xs">
                      {USDT_ADDRESS}
                    </code>
                    <button
                      onClick={() => copyToClipboard(USDT_ADDRESS, 'address')}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm whitespace-nowrap"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                      <span className="text-white">{copied ? '已复制' : '复制'}</span>
                    </button>
                  </div>

                  {/* จำนวน USDT */}
                  <label className="block text-gray-400 mb-2">支付金额</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 px-3 py-2 rounded">
                      <span className="text-white font-bold text-lg">{usdtDeposit.usdtAmount} USDT</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(usdtDeposit.usdtAmount.toString(), 'amount')}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm whitespace-nowrap"
                    >
                      {copiedAmount ? <CheckCircle className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                      <span className="text-white">{copiedAmount ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code + Wallet Buttons ด้านขวา */}
              <div className="flex flex-col items-center justify-start space-y-4">
                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  {usdtDeposit.qrCodeUrl ? (
                    <img
                      src={usdtDeposit.qrCodeUrl}
                      alt="QR Code"
                      className="w-48 h-48"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${USDT_ADDRESS}`;
                      }}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* คำแนะนำเพิ่มเติม */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                如何支付:
              </h4>
              <ol className="text-gray-300 text-sm space-y-1 ml-4 list-decimal">
                <li>扫描 QR Code 或点击钱包按钮</li>
                <li>确认地址和金额正确</li>
                <li>选择 USDT (TRC-20) 币种</li>
                <li>完成支付并等待确认</li>
                <li>系统将在 1-3 分钟内自动充值</li>
              </ol>
            </div>

            {/* สถานะการตรวจสอบอัตโนมัติ */}
            <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isChecking ? 'bg-yellow-500 animate-pulse' : usdtDeposit.status === 'paid' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-gray-400">
                  {isChecking ? '正在自动检查支付状态...' :
                    usdtDeposit.status === 'paid' ? '支付已验证，余额已更新' :
                      '等待支付确认'}
                </span>
              </div>
              {usdtDeposit.status === 'pending' && (
                <p className="text-xs text-gray-500 mt-1">
                  系统每 10 秒自动检查一次支付状态
                </p>
              )}
            </div>

            {/* ปุ่มดำเนินการ */}
            <div className="flex gap-3">
              <button
                onClick={loadHistory}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <History className="w-4 h-4" /> 查看历史
              </button>
              <button
                onClick={() => {
                  setUsdtDeposit({
                    amount: '',
                    orderId: '',
                    status: '',
                    usdtAmount: 0,
                    address: '',
                    expiresAt: null,
                    qrCodeUrl: ''
                  });
                  setSuccess('');
                  setError('');
                  if (checkInterval.current) clearInterval(checkInterval.current);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                创建新订单
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

// USDT History Modal
export const USDTDepositHistoryModal = ({
  usdtOrders,
  showUsdtHistory,
  setShowUsdtHistory
}) => (
  <ModalWrapper show={showUsdtHistory} onClose={() => setShowUsdtHistory(false)}>
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <History className="w-5 h-5" /> USDT 存款历史
      </h3>

      {usdtOrders.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">暂无存款记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {usdtOrders.map((order, index) => (
            <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                    order.status === 'expired' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                    {order.status === 'paid' ? '成功' :
                      order.status === 'expired' ? '过期' :
                        order.status === 'pending' ? '等待中' : order.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">订单: {order.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{order.cnyAmount} CNY</p>
                  <p className="text-sm text-gray-400">{order.usdtAmount} USDT</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">创建时间</p>
                  <p className="text-gray-300">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">支付时间</p>
                  <p className="text-gray-300">
                    {order.paidAt ? new Date(order.paidAt).toLocaleString() : '--'}
                  </p>
                </div>
              </div>

              {order.txHash && (
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <p className="text-xs text-gray-500">交易哈希:</p>
                  <code className="text-xs text-gray-300 break-all">{order.txHash}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </ModalWrapper>
);

// Transfer Modal (สำหรับถอนเงินเท่านั้น)
export const TransferModal = ({
  user, balances, transferMode, setTransferMode,
  transferForm, setTransferForm, isTransferring,
  showTransferModal, setShowTransferModal,
  setShowTransferHistory, success, error, handleTransfer
}) => {
  const isDeposit = false;
  const title = 'ถอนเงิน';

  return (
    <ModalWrapper show={showTransferModal} onClose={() => setShowTransferModal(false)} className="max-w-md">
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" /> {title}
        </h3>
        <p className="text-gray-400 text-sm">玩家: {user?.playerId}</p>

        {success && <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">{success}</div>}
        {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{error}</div>}

        <div>
          <label className="block text-white mb-2">玩家 ID</label>
          <input
            type="text"
            value={user?.playerId || ''}
            disabled
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-gray-400"
            placeholder="玩家 ID"
          />
        </div>

        <div>
          <label className="block text-white mb-2">提现金额</label>
          <input
            type="number"
            placeholder="金额"
            value={transferForm.amount}
            onChange={e => {
              let value = parseFloat(e.target.value) || 0;
              let max = parseFloat(balances?.ag || 0);

              if (value > max) value = max; // ✅ บังคับไม่ให้เกิน
              if (value < 0) value = 0;

              setTransferForm({ ...transferForm, amount: value });
            }}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />


        </div>

        <div>
          <label className="block text-gray-400 mb-2 flex items-center gap-2">
            <img src={tronLogo} className="w-5 h-5" />
            <span>USDT tron (TRC-20)</span>
          </label>
          <input
            type="text"
            placeholder="请输入 TRON 钱包地址"
            value={transferForm.walletAddress || ''}
            onChange={e => setTransferForm({ ...transferForm, walletAddress: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-white mb-2">订单号 (可选)</label>
          <input
            type="text"
            placeholder="订单号 (可选)"
            value={transferForm.orderId}
            onChange={e => setTransferForm({ ...transferForm, orderId: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
        </div>

        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex justify-between">
          <span className="text-gray-400">当前余额:</span>
          <span className="text-white font-bold">¥ {balances.ag?.toFixed(2) || '0.00'}</span>
        </div>

        <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
          ⚠️ 注意: 存款请使用 USDT 存款系统，此功能仅用于提现
        </div>

        <button
          onClick={handleTransfer}
          disabled={
            isTransferring ||
            !transferForm.amount ||
            parseFloat(transferForm.amount) > parseFloat(balances?.ag || 0)
          }
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {isTransferring ? '处理中...' : title}
        </button>

        <button
          onClick={() => setShowTransferHistory(true)}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1 mx-auto"
        >
          <History className="w-4 h-4" /> 查看转换记录
        </button>
      </div>
    </ModalWrapper>
  );
};

// Transfer History Modal
export const TransferHistoryModal = ({
  transferHistory,
  showTransferHistory,
  setShowTransferHistory
}) => (
  <ModalWrapper show={showTransferHistory} onClose={() => setShowTransferHistory(false)} className="max-w-3xl">
    <div className="p-6 space-y-3">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <History className="w-5 h-5" /> 提现记录
      </h3>

      {transferHistory.length === 0 ? (
        <div className="text-center py-8">
          <Download className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">暂无提现记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transferHistory.map((item, index) => (
            <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">玩家 ID</p>
                  <p className="text-white font-medium">{item.playerId || user?.playerId || '--'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">金额</p>
                  <p className="text-lg font-bold text-white">
                    ¥ {parseFloat(item.amount || 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">TRON 地址</p>
                  <p className="text-white text-sm break-all">
                    {item.tronAddress || item.walletAddress || '--'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">订单号</p>
                  <p className="text-white font-mono text-sm">
                    {item.orderId || '自动生成'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">状态</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                    item.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                    {item.status === 'paid' ? '已支付' :
                      item.status === 'rejected' ? '已拒绝' : '待处理'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">类型</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${item.type === '1' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-cyan-500/20 text-cyan-300'
                    }`}>
                    {item.type === '1' ? '存款' : '提现'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">平台</p>
                  <p className="text-white text-sm">{item.platType?.toUpperCase() || 'AG'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">创建时间</p>
                  <p className="text-white text-sm">{item.createdAt ?
                    new Date(item.createdAt).toLocaleString() :
                    item.time || new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              {item.txHash && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-sm text-gray-500 mb-1">交易哈希</p>
                  <code className="text-xs text-gray-300 break-all">{item.txHash}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </ModalWrapper>
);

// ----------------------- HANDLERS -----------------------
export const transferHandlers = {
  handleLoadBalances: async (user, queryBalance, queryAllBalances, setBalances, setAllPlatformBalances, setLoading) => {
    if (!user) return;
    setLoading('balance');
    try {
      const res = await queryBalance(user.playerId, 'ag', 'CNY');
      if (res.success) setBalances(prev => ({ ...prev, ag: res.balance || 0 }));
      const allRes = await queryAllBalances(user.playerId, 'CNY');
      if (allRes.success) setAllPlatformBalances(allRes.balances || {});
    } catch (e) { console.error('加载余额失败:', e); }
    finally { setLoading(''); }
  },

  handleRefreshBalance: async (loadBalances, setSuccess, setLoading) => {
    setLoading('refresh');
    await loadBalances();
    setSuccess('余额已刷新');
    setTimeout(() => setSuccess(''), 3000);
    setLoading('');
  },

  handleTransferAll: async (user, transferAllBalances, loadBalances, setLoading, setSuccess, setError) => {
    if (!user || !window.confirm('确定要一键回收所有平台的余额吗？')) return;
    setLoading('transfer-all');
    try {
      const result = await transferAllBalances(user.playerId, 'CNY');
      if (result.success) {
        setSuccess(`回收成功！总计回收金额: ${result.transferResult?.balanceAll || 0}`);
        await loadBalances();
      } else setError(`回收失败: ${result.message}`);
    } catch (e) { setError('回收失败，请稍后重试'); }
    finally {
      setLoading('');
      setTimeout(() => { setSuccess(''); setError(''); }, 5000);
    }
  },

  handleTransfer: async (
    user,
    transferMode,
    transferForm,
    transferAmount,
    loadBalances,
    setIsTransferring,
    setError,
    setSuccess,
    setTransferHistory,
    transferHistory,
    setTransferForm
  ) => {
    if (!user || !transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      return setError('请输入有效的金额');
    }

    if (!transferForm.walletAddress) {
      return setError('请输入 TRON 钱包地址');
    }

    setIsTransferring(true);
    setError('');
    setSuccess('');

    try {
      // ส่งข้อมูลไปยัง API withdrawRoutes.js (แทนที่จะใช้ transferAmount เดิม)
      const response = await fetch('/backend-api/withdraw/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: user.playerId,
          amount: transferForm.amount,
          wallet_address: transferForm.walletAddress
          // order_id: transferForm.orderId ไม่ได้ใช้ใน backend นี้
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`提现申请提交成功! 申请ID: ${data.requestId}`);

        // เพิ่มข้อมูลในประวัติ frontend
        const newHistory = {
          id: data.requestId || Date.now(),
          playerId: user.playerId,
          amount: transferForm.amount,
          walletAddress: transferForm.walletAddress,
          orderId: transferForm.orderId || `W${Date.now()}`,
          status: 'pending',
          type: 'withdrawal',
          requested_at: new Date().toISOString(),
          time: new Date().toLocaleString()
        };

        setTransferHistory([newHistory, ...transferHistory]);

        // คืนค่าให้ฟอร์มว่าง
        setTransferForm({
          platType: 'ag',
          amount: '',
          orderId: '',
          walletAddress: ''
        });

        // โหลดยอดเงินใหม่
        await loadBalances();

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(`提现失败: ${data.message}`);
      }
    } catch (e) {
      setError(`提现失败，请稍后重试`);
      console.error('Withdrawal error:', e);
    } finally {
      setIsTransferring(false);
    }
  },

  // USDT Deposit Handlers
  handleCreateUSDTOrder: async (playerId, amount, createUSDTOrder, setLoading, setSuccess, setError) => {
    setLoading('usdt');
    try {
      const response = await fetch('/backend-api/crypto/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, cnyAmount: amount })
      });
      const data = await response.json();

      if (data.success) {
        setSuccess('คำสั่งฝากถูกสร้างแล้ว');
        return data;
      } else {
        setError(data.message || '创建订单失败');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      return { success: false, message: '网络错误' };
    } finally {
      setLoading('');
    }
  },

  handleCheckUSDTOrder: async (orderId, playerId) => {
    try {
      // ✅ เพิ่ม playerId ใน request
      const response = await fetch(`/backend-api/crypto/check-order/${orderId}?playerId=${playerId}`);
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, message: '检查订单失败' };
    }
  },

  handleLoadUSDTHistory: async (playerId) => {
    try {
      const response = await fetch(`/backend-api/crypto/deposit-history/${playerId}?limit=50`);
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, message: '加载历史失败' };
    }
  },

  handleLoadWithdrawalHistory: async (playerId, setTransferHistory) => {
    try {
      const response = await fetch(`/backend-api/withdraw/player-history/${playerId}`);
      const data = await response.json();

      if (data.success) {
        // แปลงข้อมูลให้เป็นรูปแบบที่ frontend ต้องการ
        const formatted = (data.data || []).map(item => ({
          id: item.id,
          player_id: item.player_id,
          amount: item.amount,
          wallet_address: item.wallet_address,
          status: item.status,
          tx_hash: item.tx_hash,
          requested_at: item.requested_at,
          processed_at: item.processed_at,
          remark: item.remark
        }));

        setTransferHistory(formatted);
        return { success: true, withdrawals: formatted };
      } else {
        console.error('Load withdrawal history failed:', data.message);
        return { success: false, message: data.message, withdrawals: [] };
      }
    } catch (err) {
      console.error('Error loading withdrawal history:', err);
      return { success: false, message: 'เกิดข้อผิดพลาดในการโหลดประวัติ', withdrawals: [] };
    }
  },

  // Socket.io Integration for Real-time Updates
  setupWithdrawSocket: (socket, playerId, setTransferHistory, setSuccess, setError) => {
    if (!socket) return;

    // Join player room
    socket.emit('join_player', playerId);

    // Listen for withdraw status updates
    socket.on('withdraw_status', (data) => {
      console.log('📩 Withdraw status update:', data);

      if (data.status === 'paid') {
        setSuccess(`✅ ${data.message || 'การถอนเงินสำเร็จ!'}\nจำนวน: ${data.amount} USDT`);

        // อัพเดทประวัติในหน้าจอ
        setTransferHistory(prev =>
          prev.map(item =>
            item.id === data.id
              ? { ...item, status: 'paid', tx_hash: data.tx_hash, processed_at: new Date().toISOString() }
              : item
          )
        );

        setTimeout(() => setSuccess(''), 5000);
      } else if (data.status === 'rejected') {
        setError(`❌ คำขอถอนเงินถูกปฏิเสธ\n${data.remark || ''}`);

        setTransferHistory(prev =>
          prev.map(item =>
            item.id === data.id
              ? { ...item, status: 'rejected', remark: data.remark, processed_at: new Date().toISOString() }
              : item
          )
        );

        setTimeout(() => setError(''), 5000);
      }
    });

    // Listen for new withdraw requests from admin
    socket.on('withdraw_update', (data) => {
      console.log('📩 Withdraw update from admin:', data);
      // Refresh history
      transferHandlers.handleLoadWithdrawalHistory(playerId, setTransferHistory);
    });

    return () => {
      socket.off('withdraw_status');
      socket.off('withdraw_update');
      socket.emit('leave_player', playerId);
    };
  }
};