import React, { useState } from 'react';
import {
  X, CreditCard, History, Upload, Download, RefreshCw,
  Loader2, BarChart3, Wallet
} from 'lucide-react';

export const useTransferState = () => {
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferHistory, setShowTransferHistory] = useState(false);
  const [transferForm, setTransferForm] = useState({
    platType: 'ag',
    type: '1',
    amount: '',
    orderId: ''
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [transferMode, setTransferMode] = useState('deposit'); // 'deposit' หรือ 'withdraw'
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  return {
    showBalanceModal,
    setShowBalanceModal,
    showTransferModal,
    setShowTransferModal,
    showTransferHistory,
    setShowTransferHistory,
    transferForm,
    setTransferForm,
    isTransferring,
    setIsTransferring,
    transferHistory,
    setTransferHistory,
    transferMode,
    setTransferMode,
    success,
    setSuccess,
    error,
    setError,
    loading,
    setLoading
  };
};

export const BalanceDetailModal = ({
  user,
  balances,
  loading,
  showBalanceModal,
  setShowBalanceModal,
  setTransferMode,
  setShowBalanceModal: closeBalance,
  setShowTransferModal,
  handleRefreshBalance,
  handleTransferAll
}) => (
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
        <button
          onClick={() => setShowBalanceModal(false)}
          className="p-2 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">主账户余额</p>
              <p className="text-3xl font-bold text-white mt-2">
                ¥ {balances.ag?.toFixed(2) || '0.00'}
              </p>
            </div>
            <button
              onClick={handleRefreshBalance}
              disabled={loading === 'refresh'}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-white ${
                  loading === 'refresh' ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            各平台余额
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(balances).map(([platform, balance]) => (
              <div
                key={platform}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
              >
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
              setTransferMode('deposit');
              setShowBalanceModal(false);
              setShowTransferModal(true);
            }}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            เติมเงิน
          </button>
          <button
            onClick={() => {
              setTransferMode('withdraw');
              setShowBalanceModal(false);
              setShowTransferModal(true);
            }}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            ถอนเงิน
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const TransferModal = ({
  user,
  balances,
  transferMode,
  setTransferMode,
  transferForm,
  setTransferForm,
  isTransferring,
  showTransferModal,
  setShowTransferModal,
  setShowTransferHistory,
  success,
  error,
  handleTransfer
}) => {
  const isDeposit = transferMode === 'deposit';
  const title = isDeposit ? 'เติมเงิน' : 'ถอนเงิน';
  const buttonText = isDeposit ? 'เติมเงิน' : 'ถอนเงิน';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                {title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">玩家: {user?.playerId}</p>
            </div>
            <button
              onClick={() => setShowTransferModal(false)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ปุ่มเลือกโหมด */}
          <div className="flex gap-2">
            <button
              onClick={() => setTransferMode('deposit')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                transferMode === 'deposit'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              เติมเงิน
            </button>
            <button
              onClick={() => setTransferMode('withdraw')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                transferMode === 'withdraw'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              ถอนเงิน
            </button>
          </div>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">游戏平台</label>
              <select
                value={transferForm.platType}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, platType: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="ag">AG 平台</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">
                {isDeposit ? 'เติม金额 (¥)' : 'ถอน金额 (¥)'}
              </label>
              <input
                type="number"
                value={transferForm.amount}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, amount: e.target.value })
                }
                placeholder={`输入${isDeposit ? 'เติม' : 'ถอน'}金额`}
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
                onChange={(e) =>
                  setTransferForm({ ...transferForm, orderId: e.target.value })
                }
                placeholder="留空将自动生成"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">当前余额:</span>
                <span className="text-white font-bold">
                  ¥ {balances.ag?.toFixed(2) || '0.00'}
                </span>
              </div>
              {isDeposit && (
                <div className="text-sm text-gray-400">เติมเงินเข้าสู่ระบบ AG</div>
              )}
              {!isDeposit && (
                <div className="text-sm text-gray-400">ถอนเงินออกจากระบบ AG</div>
              )}
            </div>

            <button
              onClick={handleTransfer}
              disabled={isTransferring || !transferForm.amount}
              className={`w-full py-3 rounded-lg font-semibold disabled:opacity-50 ${
                isDeposit
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
              }`}
            >
              {isTransferring ? '处理中...' : buttonText}
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
};

export const TransferHistoryModal = ({
  transferHistory,
  showTransferHistory,
  setShowTransferHistory
}) => (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5" />
          转换记录
        </h3>
        <button
          onClick={() => setShowTransferHistory(false)}
          className="p-2 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {transferHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无转换记录</div>
        ) : (
          <div className="space-y-3">
            {transferHistory.map((item) => {
              const isDeposit = item.type === '1';
              const modeText = isDeposit ? 'เติมเงิน' : 'ถอนเงิน';

              return (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            isDeposit
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {modeText}
                        </span>
                        <span className="text-sm text-gray-400">
                          {item.platType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        ¥ {parseFloat(item.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">订单号</p>
                      <p className="text-sm text-gray-300 font-mono">
                        {item.orderId}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
);

export const transferHandlers = {
  handleLoadBalances: async (user, queryBalance, queryAllBalances, setBalances, setAllPlatformBalances, setLoading) => {
    if (!user) return;
    setLoading('balance');
    try {
      const balanceResult = await queryBalance(user.playerId, 'ag', 'CNY');
      if (balanceResult.success) {
        setBalances((prev) => ({
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
  },

  handleRefreshBalance: async (
    loadBalances,
    setSuccess,
    setLoading
  ) => {
    setLoading('refresh');
    await loadBalances();
    setSuccess('余额已刷新');
    setTimeout(() => setSuccess(''), 3000);
    setLoading('');
  },

  handleTransferAll: async (
    user,
    transferAllBalances,
    loadBalances,
    setLoading,
    setSuccess,
    setError
  ) => {
    if (!user) return;
    if (!window.confirm('确定要一键回收所有平台的余额吗？')) return;

    setLoading('transfer-all');
    try {
      const result = await transferAllBalances(user.playerId, 'CNY');

      if (result.success) {
        setSuccess(
          `回收成功！总计回收金额: ${result.transferResult?.balanceAll || 0}`
        );
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
    if (!user) return;

    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      setError('请输入有效的金额');
      return;
    }

    const type = transferMode === 'deposit' ? '1' : '2';
    const actionText = transferMode === 'deposit' ? 'เติมเงิน' : 'ถอนเงิน';

    setIsTransferring(true);
    setError('');
    setSuccess('');

    try {
      const result = await transferAmount(
        user.playerId,
        transferForm.platType,
        'CNY',
        type,
        transferForm.amount,
        transferForm.orderId
      );

      if (result.success) {
        setSuccess(`${actionText}成功！金额: ${transferForm.amount}`);

        const historyItem = {
          id: Date.now(),
          type: type,
          amount: transferForm.amount,
          platType: transferForm.platType,
          time: new Date().toLocaleString(),
          orderId: transferForm.orderId || '自动生成',
          mode: transferMode
        };
        setTransferHistory([historyItem, ...transferHistory]);

        await loadBalances();

        setTransferForm({
          platType: 'ag',
          type: type,
          amount: '',
          orderId: ''
        });

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(`${actionText}失败: ${result.message}`);
      }
    } catch (err) {
      setError(`${actionText}失败，请稍后重试`);
    } finally {
      setIsTransferring(false);
    }
  }
};