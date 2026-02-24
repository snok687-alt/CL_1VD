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

  const loadExchangeRate = async () => {
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

  const loadStats = () => {
    const statsData = {
      pending_count: withdraws.filter(w => w.status === 'pending').length,
      paid_count: withdraws.filter(w => w.status === 'paid').length,
      rejected_count: withdraws.filter(w => w.status === 'rejected').length,
      total_paid_amount: withdraws.filter(w => w.status === 'paid').reduce((sum, w) => sum + parseFloat(w.amount || 0), 0),
      total_paid_usdt: withdraws.filter(w => w.status === 'paid').reduce((sum, w) => {
        const usdtAmount = w.usdt_amount || calculateNetUSDT(w.amount);
        return sum + parseFloat(usdtAmount || 0);
      }, 0)
    };
    setStats(statsData);
  };

  useEffect(() => {
    if (withdraws.length > 0) loadStats();
  }, [withdraws]);

  const handleTxChange = (id, value) => {
    setTxHashes(prev => ({ ...prev, [id]: value }));
  };

  const copyToClipboard = (text, id, type) => {
    if (!text) return;
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
        const key = `${id}_${type}`;
        setCopiedIds(prev => ({ ...prev, [key]: true }));
        setTimeout(() => setCopiedIds(prev => ({ ...prev, [key]: false })), 1500);
      }
    } catch (err) {
      console.error('复制失败:', err);
    }
    document.body.removeChild(textArea);
  };

  const calculateUSDT = (cnyAmount) => parseFloat(cnyAmount) / exchangeRate;

  const calculateNetUSDT = (cnyAmount) => {
    const totalCNY = parseFloat(cnyAmount);
    const fee = totalCNY * 0.01;
    const netCNY = totalCNY - fee;
    return calculateUSDT(netCNY);
  };

  const formatUSDT = (amount) => parseFloat(amount).toFixed(6);

  const verifyTxHash = async (txHash, expectedAmount, expectedAddress) => {
    // TODO: ตรวจสอบ TX จาก TronGrid API
  };

  const markPaid = async (id) => {
    const txHash = txHashes[id];
    const withdraw = withdraws.find(w => w.id === id);

    const verifyResult = await verifyTxHash(txHash, withdraw?.usdt_amount || calculateNetUSDT(withdraw?.amount), withdraw?.wallet_address);

    if (verifyResult && !verifyResult.success) {
      alert('❌ TX Hash ไม่ถูกต้อง');
      return;
    }

    if (withdraw) {
      const usdtAmount = withdraw.usdt_amount || calculateNetUSDT(withdraw.amount);
      const confirmMessage = `确认批准取款请求？\n\n玩家: ${withdraw.player_id}\n金额 CNY: ${parseFloat(withdraw.amount).toFixed(2)} CNY\n手续费 (1%): ${parseFloat(withdraw.amount * 0.01).toFixed(2)} CNY\n需要转账的USDT数量: ${formatUSDT(usdtAmount)} USDT\n钱包地址: ${withdraw.wallet_address}\n\nTX Hash: ${txHash?.trim()}`;
      if (!confirm(confirmMessage)) return;
    }

    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/backend-api/withdraw/admin/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_hash: txHash?.trim(), usdt_amount: withdraw?.usdt_amount || calculateNetUSDT(withdraw?.amount) })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ 批准成功！`);
        loadWithdraws();
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
        loadWithdraws();
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

  const getStatusBadge = (status) => {
    const map = {
      paid:     { cls: 'bg-green-100 text-green-700 border border-green-200', label: '✅ 已支付' },
      rejected: { cls: 'bg-red-100 text-red-700 border border-red-200',       label: '❌ 已拒绝' },
      pending:  { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: '⏳ 待处理' },
    };
    return map[status] || { cls: 'bg-gray-100 text-gray-500 border border-gray-200', label: status };
  };

  // ── TABLE (desktop) ──────────────────────────────────────────────────
  const renderTableView = () => (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['ID','玩家','金额 CNY','USDT (净额)','钱包地址','状态','TX Hash','操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWithdraws.map(w => {
              const usdtAmount = w.usdt_amount || calculateNetUSDT(w.amount);
              const fee = w.fee || (w.amount * 0.01);
              const badge = getStatusBadge(w.status);
              return (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">#{w.id}</td>

                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{w.player_id}</p>
                    {w.username && <p className="text-xs text-gray-400">{w.username}</p>}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800">{parseFloat(w.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">fee: {parseFloat(fee).toFixed(2)} CNY</p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div>
                        <p className="font-bold text-emerald-600">{formatUSDT(usdtAmount)}</p>
                        <p className="text-xs text-gray-400">USDT</p>
                      </div>
                      <button onClick={() => copyToClipboard(formatUSDT(usdtAmount), w.id, 'usdt')}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        {copiedIds[`${w.id}_usdt`]
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 truncate max-w-[130px]">
                        {w.wallet_address}
                      </code>
                      <button onClick={() => copyToClipboard(w.wallet_address, w.id, 'wallet')}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        {copiedIds[`${w.id}_wallet`]
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {w.status === 'pending' ? (
                      <input type="text" value={txHashes[w.id] || ""} onChange={e => handleTxChange(w.id, e.target.value)}
                        placeholder="输入TX Hash..."
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                    ) : w.tx_hash ? (
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 truncate max-w-[90px]">
                          {w.tx_hash.substring(0, 10)}...
                        </code>
                        <a href={`https://tronscan.org/#/transaction/${w.tx_hash}`} target="_blank"
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        </a>
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>

                  <td className="px-4 py-3">
                    {w.status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => markPaid(w.id)} disabled={loadingIds[w.id]}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm">
                          <CheckCircle className="w-3 h-3" />批准
                        </button>
                        <button onClick={() => markRejected(w.id)} disabled={loadingIds[w.id]}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm">
                          <XCircle className="w-3 h-3" />拒绝
                        </button>
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── CARDS (mobile) ───────────────────────────────────────────────────
  const renderCardView = () => (
    <div className="space-y-3">
      {filteredWithdraws.map(w => {
        const usdtAmount = w.usdt_amount || calculateNetUSDT(w.amount);
        const fee = w.fee || (w.amount * 0.01);
        const badge = getStatusBadge(w.status);
        return (
          <div key={w.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            {/* Header row */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-400 font-mono">#{w.id}</p>
                <p className="font-bold text-gray-800 text-base">{w.player_id}</p>
                {w.username && <p className="text-xs text-gray-400">{w.username}</p>}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
                {badge.label}
              </span>
            </div>

            {/* Amount row */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">金额 CNY</p>
                <p className="font-bold text-gray-800">{parseFloat(w.amount).toFixed(2)} CNY</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs text-orange-400 mb-0.5">手续费 (1%)</p>
                <p className="font-semibold text-orange-600">{parseFloat(fee).toFixed(2)} CNY</p>
              </div>
            </div>

            {/* USDT box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 flex justify-between items-center">
              <div>
                <p className="text-xs text-emerald-600 mb-0.5">转账 USDT TRC20</p>
                <p className="text-xl font-bold text-emerald-700">{formatUSDT(usdtAmount)}</p>
                <p className="text-xs text-emerald-500">USDT</p>
              </div>
              <button onClick={() => copyToClipboard(formatUSDT(usdtAmount), w.id, 'usdt')}
                className="p-2.5 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm">
                {copiedIds[`${w.id}_usdt`]
                  ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                  : <Copy className="w-5 h-5 text-emerald-500" />}
              </button>
            </div>

            {/* Wallet address */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1.5">钱包地址</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <code className="text-xs text-gray-600 flex-1 break-all leading-relaxed">{w.wallet_address}</code>
                <button onClick={() => copyToClipboard(w.wallet_address, w.id, 'wallet')}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                  {copiedIds[`${w.id}_wallet`]
                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                    : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Pending: TX input + action buttons */}
            {w.status === 'pending' ? (
              <>
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1.5">TX Hash</p>
                  <input type="text" value={txHashes[w.id] || ""} onChange={e => handleTxChange(w.id, e.target.value)}
                    placeholder="输入TX Hash..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markPaid(w.id)} disabled={loadingIds[w.id]}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <CheckCircle className="w-4 h-4" />批准
                  </button>
                  <button onClick={() => markRejected(w.id)} disabled={loadingIds[w.id]}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <XCircle className="w-4 h-4" />拒绝
                  </button>
                </div>
              </>
            ) : w.tx_hash && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">TX Hash</p>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <code className="text-xs text-gray-600 flex-1 break-all">{w.tx_hash.substring(0, 20)}...</code>
                  <a href={`https://tronscan.org/#/transaction/${w.tx_hash}`} target="_blank"
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── MAIN RENDER ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">

        {/* ── PAGE HEADER ── */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                {activeTab === 'withdraw' ? '💰 取款管理' : '🎮 Games Dashboard'}
              </h1>
              <p className="text-sm text-gray-400">
                {activeTab === 'withdraw' ? '管理 USDT TRC-20 取款请求' : '游戏玩家数据统计'}
              </p>
            </div>
            {activeTab === 'withdraw' && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl">
                <Calculator className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-blue-400">汇率</p>
                  <p className="text-sm font-bold text-blue-700">1 CNY = {exchangeRate} USDT</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button onClick={() => handleTabChange('games')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'games'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              <Gamepad2 className="w-4 h-4" />Games Dashboard
            </button>
            <button onClick={() => handleTabChange('withdraw')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'withdraw'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              <CreditCard className="w-4 h-4" />Withdraw Management
            </button>
          </div>
        </div>

        {activeTab === 'withdraw' ? (
          <>
            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">待处理</p>
                    <p className="text-2xl font-bold text-amber-500">{withdraws.filter(w => w.status === 'pending').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">已支付</p>
                    <p className="text-2xl font-bold text-emerald-600">{withdraws.filter(w => w.status === 'paid').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">已拒绝</p>
                    <p className="text-2xl font-bold text-red-500">{withdraws.filter(w => w.status === 'rejected').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">支付总 USDT</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatUSDT(withdraws.filter(w => w.status === 'paid').reduce((sum, w) => {
                        return sum + parseFloat(w.usdt_amount || calculateNetUSDT(w.amount) || 0);
                      }, 0))}
                    </p>
                    <p className="text-xs text-gray-400">USDT</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── FILTER BAR ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="搜索玩家ID或钱包地址..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { key: 'all', label: '全部' },
                    { key: 'pending', label: '待处理' },
                    { key: 'paid', label: '已支付' },
                    { key: 'rejected', label: '已拒绝' },
                  ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === f.key
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <button onClick={loadWithdraws}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden md:inline text-sm">刷新</span>
                </button>
              </div>
            </div>

            {/* ── LIST ── */}
            {filteredWithdraws.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <CreditCard className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">没有取款请求</p>
                <p className="text-gray-300 text-sm mt-1">当前筛选条件下无数据</p>
              </div>
            ) : (
              <>
                <div className="md:hidden">{renderCardView()}</div>
                <div className="hidden md:block">{renderTableView()}</div>
              </>
            )}

            {filteredWithdraws.length > 0 && (
              <p className="text-center text-xs text-gray-400 mt-4">
                显示 {filteredWithdraws.length} 条记录（共 {withdraws.length} 条）
              </p>
            )}
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Games Dashboard</h2>
            <p className="text-gray-400 text-sm mb-1">กำลังเปลี่ยนไปยังหน้า Games Dashboard...</p>
            <p className="text-gray-300 text-xs">กดแท็บ "Games Dashboard" เพื่อดูรายงานผู้เล่น</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin_Paid;