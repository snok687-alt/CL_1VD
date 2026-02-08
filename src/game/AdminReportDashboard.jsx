import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, DollarSign, BarChart3, RefreshCw,
  TrendingUp, TrendingDown, Activity, Wallet,
  Wifi, WifiOff, Clock, CheckCircle,
  Gamepad2, CreditCard
} from 'lucide-react';

export default function SimplePlayersReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playersData, setPlayersData] = useState(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('games');

  useEffect(() => {
    // 根据当前路径设置初始选项卡
    if (location.pathname.includes('Admin_Paid')) {
      setActiveTab('paid');
    } else if (location.pathname.includes('games')) {
      setActiveTab('games');
    } else {
      setActiveTab('games'); // 默认
    }
    
    loadPlayersData();
  }, [location.pathname]);

  const loadPlayersData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/backend-api/reports/simple-players-report');
      const data = await res.json();
      if (data.success) setPlayersData(data);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadPlayersData();
    setRefreshing(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'games') {
      navigate('/CL_____________________________________________________________________________________******_/Admin/games');
    } else if (tab === 'paid') {
      navigate('/CL_____________________________________________________________________________________******_/Admin/Admin_Paid');
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n || 0);

  const formatNumber = (n) => new Intl.NumberFormat('zh-CN').format(n || 0);

  const formatDate = (dateString) => {
    if (!dateString) return '从未登录';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '🟢 ONLINE': return 'text-green-600 bg-green-50';
      case '🟡 RECENT (1H)': return 'text-yellow-600 bg-yellow-50';
      case '🟠 TODAY': return 'text-orange-600 bg-orange-50';
      case '⚫ OFFLINE': return 'text-gray-600 bg-gray-50';
      case 'NEVER LOGGED IN': return 'text-gray-400 bg-gray-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccountStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-800 bg-green-100';
      case 'inactive': return 'text-gray-800 bg-gray-100';
      case 'suspended': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在加载玩家数据...</p>
      </div>
    </div>
  );

  const summary = playersData?.summary || {};
  const players = playersData?.players || [];
  
  // 如果需要，只过滤在线玩家
  const displayedPlayers = showOnlineOnly 
    ? players.filter(p => p.online_status === '🟢 ONLINE')
    : players;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* 顶部标题和选项卡 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-800">👥 玩家报表</h1>
            <p className="text-gray-600">系统中所有玩家的信息</p>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>

        {/* 选项卡导航 */}
        <div className="flex border-b">
          <button
            onClick={() => handleTabChange('games')}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${
              activeTab === 'games'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            游戏仪表板
          </button>
          
          <button
            onClick={() => handleTabChange('paid')}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${
              activeTab === 'paid'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            管理员支付
          </button>
        </div>
      </div>

      {/* 根据活动选项卡显示内容 */}
      {activeTab === 'games' ? (
        <>
          {/* 在线状态摘要 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">当前在线</span>
              </div>
              <div className="text-xl font-bold mt-1">{summary.online_players || 0}</div>
            </div>
            
            <div className="bg-white p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">最近1小时</span>
              </div>
              <div className="text-xl font-bold mt-1">{summary.recent_players || 0}</div>
            </div>
            
            <div className="bg-white p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">今天</span>
              </div>
              <div className="text-xl font-bold mt-1">{summary.today_players || 0}</div>
            </div>
            
            <div className="bg-white p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-700">离线</span>
              </div>
              <div className="text-xl font-bold mt-1">
                {(summary.offline_players || 0) + (summary.never_logged || 0)}
              </div>
            </div>
          </div>

          {/* 财务摘要 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white p-3 border rounded">
              <div className="text-gray-700">总余额</div>
              <div className="text-lg font-bold">{formatCurrency(summary.total_balance)}</div>
            </div>
            
            <div className="bg-white p-3 border rounded">
              <div className="text-gray-700">总利润</div>
              <div className={`text-lg font-bold ${
                summary.total_profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.total_profit)}
              </div>
            </div>
            
            <div className="bg-white p-3 border rounded">
              <div className="text-gray-700">总存款</div>
              <div className="text-lg font-bold">{formatCurrency(summary.total_deposit)}</div>
              <div className="text-sm text-gray-600">
                {formatNumber(summary.total_deposit_times)} 次
              </div>
            </div>
            
            <div className="bg-white p-3 border rounded">
              <div className="text-gray-700">总取款</div>
              <div className="text-lg font-bold">{formatCurrency(summary.total_withdraw)}</div>
              <div className="text-sm text-gray-600">
                {formatNumber(summary.total_withdraw_times)} 次
              </div>
            </div>
          </div>

          {/* 在线切换按钮 */}
          <div className="mb-4">
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`px-3 py-1 border rounded flex items-center gap-1 ${
                showOnlineOnly 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-white text-gray-700'
              }`}
            >
              {showOnlineOnly ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>仅显示在线 ({summary.online_players})</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>显示所有玩家 ({players.length})</span>
                </>
              )}
            </button>
          </div>

          {/* 玩家表格 */}
          <div className="bg-white border rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">玩家ID</th>
                    <th className="text-left p-2">账户状态</th>
                    <th className="text-left p-2">在线状态</th>
                    <th className="text-left p-2">最后登录</th>
                    <th className="text-left p-2">余额</th>
                    <th className="text-left p-2">总投注</th>
                    <th className="text-left p-2">利润</th>
                    <th className="text-left p-2">存款</th>
                    <th className="text-left p-2">取款</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPlayers.map((player) => (
                    <tr key={player.player_id} className="border-t hover:bg-gray-50">
                      <td className="p-2 font-mono">{player.player_id}</td>
                      
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          getAccountStatusColor(player.account_status)
                        }`}>
                          {player.account_status === 'active' ? '活跃' : 
                           player.account_status === 'inactive' ? '非活跃' : 
                           player.account_status === 'suspended' ? '已暂停' : player.account_status}
                        </span>
                      </td>
                      
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          getStatusColor(player.online_status)
                        }`}>
                          {player.online_status === '🟢 ONLINE' ? '🟢 在线' :
                           player.online_status === '🟡 RECENT (1H)' ? '🟡 最近1小时' :
                           player.online_status === '🟠 TODAY' ? '🟠 今天' :
                           player.online_status === '⚫ OFFLINE' ? '⚫ 离线' :
                           player.online_status === 'NEVER LOGGED IN' ? '从未登录' : player.online_status}
                        </span>
                      </td>
                      
                      <td className="p-2 text-gray-600">
                        {formatDate(player.last_login)}
                      </td>
                      
                      <td className="p-2 font-medium">
                        {formatCurrency(player.total_balance)}
                      </td>
                      
                      <td className="p-2">
                        {formatCurrency(player.total_cost)}
                      </td>
                      
                      <td className={`p-2 font-medium ${
                        player.player_profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(player.player_profit)}
                      </td>
                      
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{formatCurrency(player.total_deposit)}</div>
                          <div className="text-xs text-gray-600">
                            {formatNumber(player.deposit_times)} 次
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{formatCurrency(player.total_withdraw)}</div>
                          <div className="text-xs text-gray-600">
                            {formatNumber(player.withdraw_times)} 次
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 底部摘要 */}
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <div>
                显示 {displayedPlayers.length} / {players.length} 名玩家
                {showOnlineOnly && ` (仅在线: ${summary.online_players})`}
              </div>
              <div>
                最后更新: {playersData?.generated_at ? 
                  new Date(playersData.generated_at).toLocaleTimeString('zh-CN') : 
                  '无数据'}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border rounded p-6 text-center">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">管理员支付页面</h2>
          <p className="text-gray-600 mb-4">
            点击"管理员支付"选项卡时激活此页面
          </p>
          <div className="text-sm text-gray-500">
            路径: /admin/Admin_Paid
          </div>
        </div>
      )}
    </div>
  );
}