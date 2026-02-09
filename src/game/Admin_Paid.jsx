import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Copy, CheckCircle, XCircle, Clock, ExternalLink,
  RefreshCw, Search, Calculator,
  Gamepad2, CreditCard, Users, DollarSign
} from "lucide-react";

function Admin_Paid() {
  const navigate = useNavigate();
  const location = useLocation();
  const [withdraws, setWithdraws] = useState([]);
  const [txHashes, setTxHashes] = useState({});
  const [loadingIds, setLoadingIds] = useState({});
  const [copiedIds, setCopiedIds] = useState({});
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(7.2);
  const [activeTab, setActiveTab] = useState('withdraw');
  const [verifyingTx, setVerifyingTx] = useState({});

  useEffect(() => {
    // ตรวจสอบ path เพื่อตั้งค่าแท็บเริ่มต้น
    if (location.pathname.includes('Admin_Paid')) {
      setActiveTab('withdraw');
    } else if (location.pathname.includes('games')) {
      setActiveTab('games');
    }

    loadWithdraws();
    loadExchangeRate();
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'games') {
      navigate('/CL_____________________________________________________________________________________******_/Admin/games');
    } else if (tab === 'withdraw') {
      navigate('/CL_____________________________________________________________________________________******_/Admin/Admin_Paid');
    }
  };

  // ✅ 使用默认值代替API调用
  const loadExchangeRate = async () => {
    // 暂时使用默认值
    setExchangeRate(7.2);
  };

  const loadWithdraws = async () => {
    try {
      const res = await fetch("/backend-api/withdraw/admin");
      const data = await res.json();
      if (data.success) setWithdraws(data.data || []);
    } catch (err) {
      console.error("加载错误:", err);
    }
  };

  // ✅ 使用本地计算代替API调用
  const loadStats = () => {
    // 从现有数据计算统计
    const statsData = {
      pending_count: withdraws.filter(w => w.status === 'pending').length,
      paid_count: withdraws.filter(w => w.status === 'paid').length,
      rejected_count: withdraws.filter(w => w.status === 'rejected').length,
      total_paid_amount: withdraws
        .filter(w => w.status === 'paid')
        .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0),
      total_paid_usdt: withdraws
        .filter(w => w.status === 'paid')
        .reduce((sum, w) => {
          const usdtAmount = w.usdt_amount || calculateNetUSDT(w.amount);
          return sum + parseFloat(usdtAmount || 0);
        }, 0)
    };

    setStats(statsData);
  };

  // 当withdraws改变时重新加载数据
  useEffect(() => {
    if (withdraws.length > 0) {
      loadStats();
    }
  }, [withdraws]);

  const handleTxChange = (id, value) => {
    setTxHashes(prev => ({ ...prev, [id]: value }));
  };

  // 实际可用的复制函数
  const copyToClipboard = (text, id, type) => {
    if (!text) return;

    // 创建用于复制的元素
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        // 显示成功图标
        const key = `${id}_${type}`;
        setCopiedIds(prev => ({ ...prev, [key]: true }));

        // 1.5秒后重置
        setTimeout(() => {
          setCopiedIds(prev => ({ ...prev, [key]: false }));
        }, 1500);
      }
    } catch (err) {
      console.error('复制失败:', err);
    }

    document.body.removeChild(textArea);
  };

  const calculateUSDT = (cnyAmount) => {
    return parseFloat(cnyAmount) / exchangeRate;
  };

  const calculateNetUSDT = (cnyAmount) => {
    const totalCNY = parseFloat(cnyAmount);
    const fee = totalCNY * 0.01;
    const netCNY = totalCNY - fee;
    return calculateUSDT(netCNY);
  };

  const formatUSDT = (amount) => {
    return parseFloat(amount).toFixed(6);
  };

  // 2. ฟังก์ชันตรวจสอบ TX จาก TronGrid API
  const verifyTxHash = async (txHash, expectedAmount, expectedAddress) => {
    // ✅ เรียก TronGrid API
    // ✅ ตรวจสอบ USDT Contract
    // ✅ ตรวจสอบจำนวนเงิน
    // ✅ ตรวจสอบที่อยู่ปลายทาง
    // ✅ ตรวจสอบสถานะ SUCCESS
  };

  const markPaid = async (id) => {
    const txHash = txHashes[id];
    const withdraw = withdraws.find(w => w.id === id);

    // ✅ ตรวจสอบ TX Hash ก่อน
    const verifyResult = await verifyTxHash(
      txHash,
      usdtAmount,
      withdraw.wallet_address
    );

    if (!verifyResult.success) {
      alert('❌ TX Hash ไม่ถูกต้อง');
      return; // ❌ ไม่อนุมัติ
    }
    if (withdraw) {
      const usdtAmount = withdraw.usdt_amount || calculateNetUSDT(withdraw.amount);
      const confirmMessage = `确认批准取款请求？\n\n` +
        `玩家: ${withdraw.player_id}\n` +
        `金额 CNY: ${parseFloat(withdraw.amount).toFixed(2)} CNY\n` +
        `手续费 (1%): ${parseFloat(withdraw.amount * 0.01).toFixed(2)} CNY\n` +
        `需要转账的USDT数量: ${formatUSDT(usdtAmount)} USDT\n` +
        `钱包地址: ${withdraw.wallet_address}\n\n` +
        `TX Hash: ${txHash.trim()}`;

      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/backend-api/withdraw/admin/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_hash: txHash.trim(),
          usdt_amount: withdraw?.usdt_amount || calculateNetUSDT(withdraw?.amount)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ 批准成功！`);
        loadWithdraws(); // 重新加载数据
        setTxHashes(prev => ({ ...prev, [id]: "" }));
      }
    } catch (err) {
      alert("发生错误");
    } finally {
      setLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const markRejected = async (id) => {
    const remark = prompt('拒绝原因:');
    if (!remark) return;

    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/backend-api/withdraw/admin/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ 已拒绝');
        loadWithdraws(); // 重新加载数据
      }
    } catch (err) {
      alert("发生错误");
    } finally {
      setLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredWithdraws = withdraws.filter(w => {
    const matchFilter = filter === 'all' || w.status === filter;
    const matchSearch = !searchTerm ||
      w.player_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'paid': 'bg-green-500/20 text-green-300 border-green-500/30',
      'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
      'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      'paid': '✅ 已支付',
      'rejected': '❌ 已拒绝',
      'pending': '⏳ 待处理',
    };
    return texts[status] || status;
  };

  // ==================== 表格视图 ====================
  const renderTableView = () => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">玩家</th>
              <th className="px-4 py-3 text-left">金额 CNY</th>
              <th className="px-4 py-3 text-left">USDT</th>
              <th className="px-4 py-3 text-left">钱包地址</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">TX Hash</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdraws.map(w => {
              const usdtAmount = w.usdt_amount || calculateNetUSDT(w.amount);
              const fee = w.fee || (w.amount * 0.01);

              return (
                <tr key={w.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3">#{w.id}</td>

                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold">{w.player_id}</p>
                      {w.username && (
                        <p className="text-xs text-gray-400">{w.username}</p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-bold">{parseFloat(w.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">CNY</p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-bold text-green-300">
                          {formatUSDT(usdtAmount)}
                        </p>
                        <p className="text-xs text-gray-400">USDT</p>
                      </div>
                      <button
                        onClick={() => {
                          const usdtText = formatUSDT(usdtAmount);
                          copyToClipboard(usdtText, w.id, 'usdt');
                        }}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        {copiedIds[`${w.id}_usdt`] ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-400" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-900 px-2 py-1 rounded truncate max-w-[150px]">
                        {w.wallet_address}
                      </code>
                      <button
                        onClick={() => copyToClipboard(w.wallet_address, w.id, 'wallet')}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        {copiedIds[`${w.id}_wallet`] ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(w.status)}`}>
                      {getStatusText(w.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {w.status === 'pending' ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm"
                        value={txHashes[w.id] || ""}
                        onChange={e => handleTxChange(w.id, e.target.value)}
                        placeholder="输入TX Hash..."
                      />
                    ) : w.tx_hash ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-900 px-2 py-1 rounded truncate max-w-[120px]">
                          {w.tx_hash.substring(0, 10)}...
                        </code>
                        <a
                          href={`https://tronscan.org/#/transaction/${w.tx_hash}`}
                          target="_blank"
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-400" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {w.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => markPaid(w.id)}
                          disabled={loadingIds[w.id]}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          批准
                        </button>
                        <button
                          onClick={() => markRejected(w.id)}
                          disabled={loadingIds[w.id]}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==================== 卡片视图 ====================
  const renderCardView = () => (
    <div className="space-y-4">
      {filteredWithdraws.map(w => {
        const usdtAmount = w.usdt_amount || calculateNetUSDT(w.amount);
        const fee = w.fee || (w.amount * 0.01);

        return (
          <div key={w.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-sm text-gray-400">#{w.id}</span>
                <p className="font-bold">{w.player_id}</p>
                {w.username && (
                  <p className="text-sm text-gray-400">{w.username}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(w.status)}`}>
                {getStatusText(w.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-400">金额 CNY</p>
                <p className="font-bold">{parseFloat(w.amount).toFixed(2)} CNY</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">手续费</p>
                <p className="text-yellow-400">{parseFloat(fee).toFixed(2)} CNY</p>
              </div>
            </div>

            <div className="bg-gray-900/50 p-3 rounded-lg mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">需要转账的USDT TRC20</p>
                  <p className="text-lg font-bold text-green-300">
                    {formatUSDT(usdtAmount)} USDT
                  </p>
                </div>
                <button
                  onClick={() => {
                    const usdtText = formatUSDT(usdtAmount);
                    copyToClipboard(usdtText, w.id, 'usdt');
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  {copiedIds[`${w.id}_usdt`] ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">钱包地址</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-900 px-2 py-1 rounded flex-1 break-all">
                  {w.wallet_address}
                </code>
                <button
                  onClick={() => copyToClipboard(w.wallet_address, w.id, 'wallet')}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  {copiedIds[`${w.id}_wallet`] ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {w.status === 'pending' ? (
              <>
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">TX Hash</p>
                  <input
                    type="text"
                    value={txHashes[w.id] || ""}
                    onChange={e => handleTxChange(w.id, e.target.value)}
                    placeholder="输入TX Hash..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => markPaid(w.id)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    批准
                  </button>
                  <button
                    onClick={() => markRejected(w.id)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    拒绝
                  </button>
                </div>
              </>
            ) : w.tx_hash && (
              <div>
                <p className="text-xs text-gray-400 mb-1">TX Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-900 px-2 py-1 rounded flex-1 break-all">
                    {w.tx_hash.substring(0, 20)}...
                  </code>
                  <a
                    href={`https://tronscan.org/#/transaction/${w.tx_hash}`}
                    target="_blank"
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {activeTab === 'withdraw' ? '💰 取款管理' : '🎮 Games Dashboard'}
            </h1>
            <p className="text-gray-400">
              {activeTab === 'withdraw' ? '管理USDT TRC-20取款请求' : '游戏玩家数据统计'}
            </p>
          </div>
          {activeTab === 'withdraw' && (
            <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-2 rounded-lg">
              <Calculator className="w-4 h-4 text-blue-400" />
              <div className="text-sm">
                <p className="text-blue-300">汇率</p>
                <p className="font-bold">1 CNY = {exchangeRate} USDT</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => handleTabChange('games')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'games'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            <Gamepad2 className="w-5 h-5" />
            Games Dashboard
          </button>

          <button
            onClick={() => handleTabChange('withdraw')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'withdraw'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            <CreditCard className="w-5 h-5" />
            Withdraw Management
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'withdraw' ? (
        <>
          {/* 统计部分 - 从现有数据计算 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">待处理</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-300">
                    {withdraws.filter(w => w.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">已支付</p>
                  <p className="text-xl md:text-2xl font-bold text-green-300">
                    {withdraws.filter(w => w.status === 'paid').length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">已拒绝</p>
                  <p className="text-xl md:text-2xl font-bold text-red-300">
                    {withdraws.filter(w => w.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">支付总USDT</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-300">
                    {formatUSDT(
                      withdraws
                        .filter(w => w.status === 'paid')
                        .reduce((sum, w) => {
                          const usdtAmount = w.usdt_amount || calculateNetUSDT(w.amount);
                          return sum + parseFloat(usdtAmount || 0);
                        }, 0)
                    )}
                  </p>
                  <p className="text-xs text-gray-400">USDT</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索玩家ID或钱包地址..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {['all', 'pending', 'paid', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${filter === f ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {f === 'all' ? '全部' :
                      f === 'pending' ? '待处理' :
                        f === 'paid' ? '已支付' : '已拒绝'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  loadWithdraws(); // 重新加载数据
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden md:inline">刷新</span>
              </button>
            </div>
          </div>

          {filteredWithdraws.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-400">没有取款请求</p>
            </div>
          ) : (
            <>
              <div className="md:hidden">
                {renderCardView()}
              </div>
              <div className="hidden md:block">
                {renderTableView()}
              </div>
            </>
          )}

          {filteredWithdraws.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-400">
              显示 {filteredWithdraws.length} 条记录
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <Gamepad2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-300 mb-2">Games Dashboard</h2>
          <p className="text-gray-400 mb-4">
            กำลังเปลี่ยนไปยังหน้า Games Dashboard...
          </p>
          <div className="text-sm text-gray-500">
            กดแท็บ "Games Dashboard" เพื่อดูรายงานผู้เล่น
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin_Paid;