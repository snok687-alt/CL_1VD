import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  Users, Gamepad, DollarSign, TrendingUp, TrendingDown,
  Clock, Crown, Star, Zap, Shield, Sword, Trophy,
  RefreshCw, Calendar, Filter, Download, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';

const GameDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // สีสำหรับกราฟ
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // โหลดข้อมูลเกม
  const fetchGameData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/backend-api/admin/game-stats?period=${selectedPeriod}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setGameData(data);
    } catch (error) {
      console.warn('⚠️ โหลดข้อมูลเกมไม่สำเร็จ ใช้ข้อมูลจำลองแทน:', error);
      setGameData(getSampleGameData());
      Swal.fire({
        icon: 'warning',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        text: 'กำลังใช้ข้อมูลจำลอง โปรดตรวจสอบการเชื่อมต่อ',
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, [selectedPeriod]);

  // ข้อมูลตัวอย่างสำหรับเกม
  const getSampleGameData = () => {
    const gameCategories = [
      'สล็อต', 'กีฬา', 'คาสิโนสด', 'ลอตเตอรี่', 'อาร์เคด', 'ยิงปลา'
    ];

    const games = [
      { id: 1, name: 'Fortune Tiger', category: 'สล็อต', players: 1250, revenue: 125000, sessions: 8900 },
      { id: 2, name: 'Football Betting', category: 'กีฬา', players: 980, revenue: 89000, sessions: 4500 },
      { id: 3, name: 'Baccarat Live', category: 'คาสิโนสด', players: 750, revenue: 156000, sessions: 3200 },
      { id: 4, name: 'Thai Lottery', category: 'ลอตเตอรี่', players: 2100, revenue: 45000, sessions: 12500 },
      { id: 5, name: 'Fish Hunter', category: 'ยิงปลา', players: 680, revenue: 78000, sessions: 5600 },
      { id: 6, name: 'Puzzle Arena', category: 'อาร์เคด', players: 420, revenue: 23000, sessions: 3100 }
    ];

    const dailyStats = [];
    const hourlyActivity = [];
    const playerDemographics = [];

    // สร้างข้อมูลรายวัน 7 วัน
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('th-TH', { weekday: 'short' });

      dailyStats.push({
        date: dayName,
        newPlayers: Math.floor(Math.random() * 50) + 20,
        activePlayers: Math.floor(Math.random() * 500) + 300,
        totalBets: Math.floor(Math.random() * 5000) + 2000,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        fullDate: date.toISOString().split('T')[0]
      });
    }

    // สร้างข้อมูลรายชั่วโมง
    for (let i = 0; i < 24; i++) {
      hourlyActivity.push({
        hour: `${i}:00`,
        players: Math.floor(Math.random() * 200) + 50,
        bets: Math.floor(Math.random() * 1000) + 300
      });
    }

    // ข้อมูลประชากรผู้เล่น
    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
    ageGroups.forEach(age => {
      playerDemographics.push({
        ageGroup: age,
        players: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.floor(Math.random() * 50000) + 20000
      });
    });

    return {
      summary: {
        totalPlayers: 6180,
        activePlayers: 3250,
        totalRevenue: 518000,
        totalGames: 42,
        avgSessionTime: 28,
        totalBets: 125000,
        playerGrowth: 12.5,
        revenueGrowth: 8.3,
        sessionGrowth: 15.2
      },
      games,
      dailyStats,
      hourlyActivity,
      playerDemographics,
      gameCategories: gameCategories.map(category => ({
        name: category,
        players: Math.floor(Math.random() * 2000) + 1000,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        games: Math.floor(Math.random() * 8) + 3
      })),
      topPlayers: [
        { id: 1, username: 'player_king', totalWagered: 1250000, wins: 12500, level: 'VIP Diamond' },
        { id: 2, username: 'lucky_star', totalWagered: 980000, wins: 8900, level: 'VIP Gold' },
        { id: 3, username: 'thai_warrior', totalWagered: 760000, wins: 6700, level: 'VIP Silver' },
        { id: 4, username: 'bangkok_bet', totalWagered: 540000, wins: 4500, level: 'VIP Bronze' },
        { id: 5, username: 'siamese_tiger', totalWagered: 320000, wins: 2800, level: 'Premium' }
      ]
    };
  };

  // คอมโพเนนต์การ์ดสถิติ
  const StatCard = ({ title, value, change, icon: Icon, trend, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-600' },
      red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' }
    };

    const colors = colorClasses[color];

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
            )}
            {change && (
              <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? 
                  <TrendingUp className="h-4 w-4 mr-1" /> : 
                  <TrendingDown className="h-4 w-4 mr-1" />
                }
                <span className="font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  // Custom Tooltip สำหรับกราฟ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const data = gameData || getSampleGameData();

  const tabs = [
    { id: 'overview', label: 'ภาพรวม', icon: Eye },
    { id: 'games', label: 'เกมทั้งหมด', icon: Gamepad },
    { id: 'players', label: 'ผู้เล่น', icon: Users },
    { id: 'revenue', label: 'รายได้', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูลเกม...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Gamepad className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                เกมดาต้าแดชบอร์ด
              </h1>
              <p className="text-gray-600">สถิติและข้อมูลเชิงลึกเกี่ยวกับเกมทั้งหมด</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white rounded-xl p-2">
              {['24h', '7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <button
              onClick={fetchGameData}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-1 mb-8 shadow-sm">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="ผู้เล่นทั้งหมด"
                value={data.summary.totalPlayers}
                change={`+${data.summary.playerGrowth}%`}
                icon={Users}
                trend="up"
                subtitle="ผู้เล่นที่ลงทะเบียน"
                color="blue"
              />
              <StatCard
                title="ผู้เล่นออนไลน์"
                value={data.summary.activePlayers}
                change={`+${data.summary.sessionGrowth}%`}
                icon={Zap}
                trend="up"
                subtitle="กำลังเล่นอยู่"
                color="green"
              />
              <StatCard
                title="รายได้รวม"
                value={`฿${data.summary.totalRevenue.toLocaleString()}`}
                change={`+${data.summary.revenueGrowth}%`}
                icon={DollarSign}
                trend="up"
                subtitle="รายได้ทั้งหมด"
                color="purple"
              />
              <StatCard
                title="เกมทั้งหมด"
                value={data.summary.totalGames}
                icon={Gamepad}
                subtitle="เกมในระบบ"
                color="orange"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Daily Activity */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">กิจกรรมรายวัน</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="activePlayers" stroke="#3b82f6" name="ผู้เล่นออนไลน์" />
                    <Line type="monotone" dataKey="newPlayers" stroke="#10b981" name="ผู้เล่นใหม่" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue by Category */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">รายได้ตามหมวดหมู่</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.gameCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.gameCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'รายได้']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Games */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">เกมยอดนิยม</h3>
                <div className="space-y-4">
                  {data.games.slice(0, 5).map((game, index) => (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100' :
                          index === 1 ? 'bg-gray-100' :
                          index === 2 ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                          <span className={`font-bold text-sm ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            index === 2 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{game.name}</p>
                          <p className="text-xs text-gray-500">{game.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{game.players.toLocaleString()} ผู้เล่น</p>
                        <p className="text-xs text-gray-500">฿{game.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Demographics */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">กลุ่มอายุผู้เล่น</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.playerDemographics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'ผู้เล่น']} />
                    <Bar dataKey="players" fill="#3b82f6" name="จำนวนผู้เล่น" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">เกมทั้งหมด</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เกม</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้เล่น</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รอบที่เล่น</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายได้</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.games.map((game) => (
                      <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <Gamepad className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{game.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {game.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {game.players.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {game.sessions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ฿{game.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Top Players */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">ผู้เล่นระดับสูง</h3>
                <div className="space-y-4">
                  {data.topPlayers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                          index === 1 ? 'bg-gray-100 border-2 border-gray-300' :
                          index === 2 ? 'bg-orange-100 border-2 border-orange-300' : 'bg-blue-100 border-2 border-blue-300'
                        }`}>
                          <Crown className={`h-5 w-5 ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            index === 2 ? 'text-orange-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{player.username}</p>
                          <p className="text-xs text-gray-500">{player.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">฿{player.totalWagered.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{player.wins.toLocaleString()} ชนะ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Activity */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">กิจกรรมรายชั่วโมง</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="players" fill="#3b82f6" name="ผู้เล่น" />
                    <Bar dataKey="bets" fill="#10b981" name="การเดิมพัน" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">แนวโน้มรายได้</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'รายได้']} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="รายได้" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue by Game Category */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">รายได้ตามประเภทเกม</h3>
                <div className="space-y-4">
                  {data.gameCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">฿{category.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{category.players.toLocaleString()} ผู้เล่น</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDashboard;