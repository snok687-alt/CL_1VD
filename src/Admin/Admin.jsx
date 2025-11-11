import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Video,
  DollarSign,
  Home,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CreditCard,
  BarChart3,
  Globe,
  Zap,

} from 'lucide-react';
import Swal from 'sweetalert2';
import { io } from "socket.io-client";

const socket = io(window.location.origin, {
  path: "/socket.io",
  transports: ["websocket"]
});

const Admin = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [notifications, setNotifications] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 检查屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: '管理仪表板', icon: Home, path: '/CL_____________________________________________________________________________________******_/Admin' },
    { id: 'ip', label: 'IP 管理', icon: Globe, path: '/ip' },
    { id: 'videos', label: '视频管理', icon: Video, path: '/Addpayment' },
    { id: 'games', label: '游戏管理', icon: BarChart3, path: '/gaming' },
  ];

  // 获取 Dashboard 数据函数
  // โหลดข้อมูล Dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/backend-api/admin/dashboard?period=${selectedPeriod}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.warn('⚠️ โหลดข้อมูลไม่สำเร็จ ใช้ข้อมูลจำลองแทน:', error);
      setDashboardData(getSampleData());
      Swal.fire({
        icon: 'warning',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        text: 'กำลังใช้ข้อมูลจำลอง โปรดตรวจสอบการเชื่อมต่อ',
        timer: 2500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ โหลดใหม่อัตโนมัติเมื่อ selectedPeriod หรือ activeTab เปลี่ยน
  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, activeTab]);

  // ✅ ตั้ง auto-refresh ทุก 1 นาที (สามารถปรับเวลาได้)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto refreshing dashboard...');
      fetchDashboardData();
    }, 60000);

    return () => clearInterval(interval); // ล้างเมื่อออกจากหน้า
  }, []);
  useEffect(() => {
    socket.on("dashboard_update", (newData) => {
      console.log("📡 ได้รับข้อมูลใหม่จาก socket:", newData);
      setDashboardData((prev) => ({ ...prev, ...newData }));
      setLastUpdated(new Date());
    });
    return () => socket.off("dashboard_update");
  }, []);

  // 完整示例数据集
  const getSampleData = () => {
    const now = new Date();
    const sampleRevenueStats = [];
    const sampleUserGrowth = [];
    const samplePerformance = [];
    const sampleHourlyTraffic = [];
    const sampleCategoryStats = [];
    const sampleGeoData = [];

    // 生成过去7天的数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });

      sampleRevenueStats.push({
        name: dayName,
        revenue: 0,
        views: Math.floor(Math.random() * 10000) + 5000,
        estimated: Math.floor(Math.random() * 5000) + 1000,
        ads: Math.floor(Math.random() * 1000) + 500,
        date: date.toISOString().split('T')[0]
      });

      sampleUserGrowth.push({
        name: dayName,
        users: Math.floor(Math.random() * 3000) + 2000,
        newUsers: Math.floor(Math.random() * 200) + 100,
        active: Math.floor(Math.random() * 2500) + 1500,
        returning: Math.floor(Math.random() * 1800) + 1200,
        date: date.toISOString().split('T')[0]
      });

      samplePerformance.push({
        name: dayName,
        loadTime: (Math.random() * 2 + 1).toFixed(1),
        uptime: 99.5 + (Math.random() * 0.5),
        errors: Math.floor(Math.random() * 10),
        bandwidth: Math.floor(Math.random() * 500) + 200
      });
    }

    // 生成每小时数据
    for (let i = 0; i < 24; i++) {
      sampleHourlyTraffic.push({
        hour: `${i}:00`,
        traffic: Math.floor(Math.random() * 1000) + 200,
        users: Math.floor(Math.random() * 500) + 100
      });
    }

    // 分类数据
    const categories = ['浪漫电影', '动作电影', '喜剧电影', '恐怖电影', '科幻电影', '剧情电影'];
    categories.forEach(category => {
      sampleCategoryStats.push({
        name: category,
        views: Math.floor(Math.random() * 50000) + 10000,
        videos: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 50000)
      });
    });

    // 地理数据
    const countries = ['泰国', '中国', '日本', '韩国', '台湾', '越南'];
    countries.forEach(country => {
      sampleGeoData.push({
        name: country,
        value: Math.floor(Math.random() * 30) + 10,
        users: Math.floor(Math.random() * 5000) + 1000
      });
    });

    return {
      stats: {
        // 核心指标
        totalViews: 154230,
        totalVideos: 2847,
        totalUsers: 4832,
        totalRevenue: 0,
        uniqueIPs: 8920,

        // 性能指标
        avgLoadTime: 1.8,
        uptime: 99.8,
        errorRate: 0.2,
        bandwidthUsage: 1250,

        // 用户指标
        activeUsers: 3250,
        newUsers: 245,
        returningUsers: 2780,
        avgSessionDuration: 8.5,

        // 变化指标
        viewChange: 12.5,
        videoChange: 8.2,
        userChange: 15.3,
        revenueChange: 0,
        activeUserChange: 10.2,
        sessionChange: 5.7
      },
      revenueStats: sampleRevenueStats,
      userGrowth: sampleUserGrowth,
      performanceStats: samplePerformance,
      hourlyTraffic: sampleHourlyTraffic,
      categoryStats: sampleCategoryStats,
      geoData: sampleGeoData,
      deviceData: [
        { name: '移动端', value: 45, count: 4500, color: '#3b82f6' },
        { name: '桌面端', value: 35, count: 3500, color: '#10b981' },
        { name: '平板', value: 20, count: 2000, color: '#f59e0b' }
      ],
      browserData: [
        { name: 'Chrome', value: 65, color: '#4285f4' },
        { name: 'Safari', value: 18, color: '#ff6d01' },
        { name: 'Firefox', value: 8, color: '#ff7139' },
        { name: 'Edge', value: 6, color: '#0078d7' },
        { name: '其他', value: 3, color: '#6b7280' }
      ],
      topVideos: [
        { id: 1, title: '视频 1 - 浪漫电影', views: 12500, estimatedRevenue: 1250, duration: '2:15:00' },
        { id: 2, title: '视频 2 - 动作电影', views: 11200, estimatedRevenue: 1120, duration: '1:45:00' },
        { id: 3, title: '视频 3 - 喜剧电影', views: 9800, estimatedRevenue: 980, duration: '1:30:00' },
        { id: 4, title: '视频 4 - 恐怖电影', views: 8700, estimatedRevenue: 870, duration: '1:55:00' },
        { id: 5, title: '视频 5 - 科幻电影', views: 7600, estimatedRevenue: 760, duration: '2:20:00' }
      ],
      systemAlerts: [
        { id: 1, type: 'warning', message: '服务器资源使用率高', time: '2分钟前' },
        { id: 2, type: 'info', message: '系统更新完成', time: '1小时前' },
        { id: 3, type: 'success', message: '数据备份完成', time: '3小时前' }
      ]
    };
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, subtitle, isRevenue = false, onClick, color = 'blue' }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-600' },
      red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' }
    };

    const colors = colorClasses[color];

    return (
      <div
        onClick={onClick}
        className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold mb-2 ${isRevenue ? 'text-green-600' : 'text-gray-900'}`}>
              {typeof value === 'number' ? (
                isRevenue ? (
                  value > 0 ? `¥${value.toLocaleString()}` : '暂无收入'
                ) : (
                  value.toLocaleString()
                )
              ) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
            )}
            {change && change !== '0%' && (
              <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : colors.text}`}>
                {trend === 'up' ?
                  <TrendingUp className="h-4 w-4 mr-1" /> :
                  trend === 'down' ?
                    <TrendingDown className="h-4 w-4 mr-1" /> :
                    <Icon className="h-4 w-4 mr-1" />
                }
                <span className="font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors.bg} shadow-sm`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? (
                entry.dataKey === 'revenue' || entry.dataKey === 'estimated' || entry.dataKey === 'ads' ?
                  `¥${entry.value.toLocaleString()}` :
                  entry.dataKey === 'uptime' || entry.dataKey === 'loadTime' ?
                    `${entry.value}${entry.dataKey === 'uptime' ? '%' : 's'}` :
                    entry.value.toLocaleString()
              ) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PerformanceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-blue-600">加载时间: {payload[0]?.value}s</p>
          <p className="text-sm text-green-600">正常运行时间: {payload[1]?.value}%</p>
          <p className="text-sm text-red-600">错误: {payload[2]?.value} 次</p>
        </div>
      );
    }
    return null;
  };

  const data = dashboardData || getSampleData();

  const tabs = [
    { id: 'overview', label: '概览', icon: BarChart3 },
    { id: 'performance', label: '性能', icon: Zap },
    { id: 'users', label: '用户', icon: Users },
    { id: 'content', label: '内容', icon: Video },
    { id: 'revenue', label: '收入', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* 移动菜单遮罩 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-lg shadow-2xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo 部分 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
            <div className={`flex items-center space-x-3 transition-all ${sidebarOpen ? '' : 'justify-center w-full'}`}>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-2xl font-bold text-gray-500 mt-1">视频综合分析平台</p>
                </div>
              )}
            </div>

            {/* 折叠按钮 - 桌面端 */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* 导航 */}
          <nav className="flex-1 p-2 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenuItem === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={async () => {
                        if (item.id === 'videos' || item.id === 'games') {
                          const result = await Swal.fire({
                            title: '确认切换页面?',
                            text: `您确定要前往"${item.label}"页面吗?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#3b82f6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            reverseButtons: true
                          });

                          if (!result.isConfirmed) return;
                        }

                        setActiveMenuItem(item.id);
                        setIsMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-4 border-blue-500 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        } 
                        ${sidebarOpen ? '' : 'justify-center'}`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'} ${sidebarOpen ? 'mr-3' : ''}`} />
                      {sidebarOpen && (
                        <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 用户资料 */}
          <div className="p-4 border-t border-gray-200/60">
            <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">系统管理员</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={() => {
                  Swal.fire({
                    title: '退出登录?',
                    text: '您确定要退出登录吗?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: '退出登录',
                    cancelButtonText: '取消'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      navigate('/login');
                    }
                  });
                }}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 头部 */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* 移动端菜单按钮 */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-3">
                  {/* 刷新按钮 */}
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    title="刷新数据"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  {lastUpdated && (
                    <span className="text-xs text-gray-500 hidden sm:block">
                      最后更新: {lastUpdated.toLocaleTimeString('zh-CN')}
                    </span>
                  )}
                </div>

                {/* 时间段选择器 */}
                <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
                  {['24h', '7d', '30d', '90d'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${selectedPeriod === period
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 标签导航 */}
            <div className="mt-4 overflow-x-auto">
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0
                        ${isActive
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 移动端时间段选择器 */}
            <div className="sm:hidden mt-3 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {['24h', '7d', '30d', '90d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                      ${selectedPeriod === period
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard 内容 */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">正在加载数据...</span>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">

              {/* 概览标签页 */}
              {activeTab === 'overview' && (
                <>
                  {/* 核心指标网格 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                      title="总观看次数"
                      value={data.stats.totalViews}
                      subtitle="视频观看总数"
                      change={`${data.stats.viewChange > 0 ? '+' : ''}${data.stats.viewChange}%`}
                      icon={Eye}
                      trend={data.stats.viewChange >= 0 ? "up" : "down"}
                      color="blue"
                    />
                    <StatCard
                      title="总视频观众"
                      value={data.stats.uniqueIPs}
                      subtitle="不重复 IP 数量"
                      change={`${data.stats.userChange > 0 ? '+' : ''}${data.stats.userChange}%`}
                      icon={Users}
                      trend={data.stats.userChange >= 0 ? "up" : "down"}
                      color="green"
                      onClick={() => navigate('/ip')}
                    />
                    <StatCard
                      title="总游戏玩家"
                      value={data.stats.totalVideos}
                      subtitle="系统中的视频"
                      change={`${data.stats.videoChange > 0 ? '+' : ''}${data.stats.videoChange}%`}
                      icon={Video}
                      trend={data.stats.videoChange >= 0 ? "up" : "down"}
                      color="purple"
                    />
                    <StatCard
                      title="收入汇总"
                      value={`¥${data.stats.totalRevenue.toLocaleString()}`}
                      subtitle="本月总收入"
                      change={`${data.stats.revenueChange > 0 ? '+' : ''}${data.stats.revenueChange}%`}
                      icon={DollarSign}
                      trend={data.stats.revenueChange >= 0 ? "up" : "down"}
                      color="green"
                    />
                  </div>

                  {/* 图表网格 */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* 流量概览 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">观看次数概览</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.revenueStats}>
                          <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#viewsGradient)" name="观看次数" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 用户增长 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">用户增长</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#8b5cf6" name="全部用户" />
                          <Line type="monotone" dataKey="newUsers" stroke="#10b981" name="新用户" />
                          <Line type="monotone" dataKey="returning" stroke="#f59e0b" name="回访用户" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 底部网格 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 设备使用情况 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">设备使用情况</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name} ${value}%`}
                          >
                            {data.deviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 热门视频 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">热门视频</h3>
                      <div className="space-y-4">
                        {data.topVideos.slice(0, 5).map((video, index) => (
                          <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-yellow-100' :
                                index === 1 ? 'bg-gray-100' :
                                  index === 2 ? 'bg-orange-100' : 'bg-blue-100'
                                }`}>
                                <span className={`font-bold text-sm ${index === 0 ? 'text-yellow-600' :
                                  index === 1 ? 'text-gray-600' :
                                    index === 2 ? 'text-orange-600' : 'text-blue-600'
                                  }`}>
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                                <p className="text-xs text-gray-500">时长: {video.duration}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">{video.views.toLocaleString()} 观看</p>
                              <p className="text-xs text-gray-500">
                                预估收入: ¥{video.estimatedRevenue.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 性能标签页 */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* 系统性能 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">系统性能</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.performanceStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip content={<PerformanceTooltip />} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="loadTime" stroke="#3b82f6" name="加载时间 (s)" />
                          <Line yAxisId="right" type="monotone" dataKey="uptime" stroke="#10b981" name="正常运行时间 (%)" />
                          <Line yAxisId="left" type="monotone" dataKey="errors" stroke="#ef4444" name="错误次数" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 每小时流量 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">每小时使用情况</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.hourlyTraffic}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="traffic" fill="#3b82f6" name="流量" />
                          <Bar dataKey="users" fill="#10b981" name="用户" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 浏览器使用情况 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">浏览器使用情况</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.browserData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name} ${value}%`}
                          >
                            {data.browserData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 系统警报 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">系统警报</h3>
                      <div className="space-y-3">
                        {data.systemAlerts.map((alert) => (
                          <div key={alert.id} className={`p-3 rounded-lg border ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                            alert.type === 'error' ? 'bg-red-50 border-red-200' :
                              alert.type === 'success' ? 'bg-green-50 border-green-200' :
                                'bg-blue-50 border-blue-200'
                            }`}>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                              <span className="text-xs text-gray-500">{alert.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 用户标签页 */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* 用户人口统计 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">用户地理分布</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.geoData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3b82f6" name="百分比 (%)" />
                          <Bar dataKey="users" fill="#10b981" name="用户数量" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 用户参与度 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">用户参与度</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-900">日均活跃用户</span>
                          <span className="text-lg font-bold text-blue-600">{data.stats.activeUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-900">新用户</span>
                          <span className="text-lg font-bold text-green-600">{data.stats.newUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium text-purple-900">回访用户</span>
                          <span className="text-lg font-bold text-purple-600">{data.stats.returningUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                          <span className="text-sm font-medium text-orange-900">平均使用时长</span>
                          <span className="text-lg font-bold text-orange-600">{data.stats.avgSessionDuration} 分钟</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 内容标签页 */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* 分类表现 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">分类表现</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data.categoryStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" fill="#3b82f6" name="观看次数" />
                          <Bar dataKey="videos" fill="#10b981" name="视频数量" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 内容统计 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">内容统计</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{data.stats.totalVideos}</p>
                            <p className="text-sm text-blue-800">总视频数</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">{Math.round(data.stats.totalViews / data.stats.totalVideos)}</p>
                            <p className="text-sm text-green-800">平均观看次数</p>
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-800 mb-2">热门分类</p>
                          <div className="space-y-2">
                            {data.categoryStats.slice(0, 3).map((category, index) => (
                              <div key={category.name} className="flex justify-between items-center">
                                <span className="text-sm text-purple-700">{category.name}</span>
                                <span className="text-sm font-bold text-purple-600">{category.views.toLocaleString()} 观看</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 收入标签页 */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  {/* 收入通知 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-yellow-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-800">收入系统尚未启用</h3>
                        <p className="text-yellow-700 mt-1">
                          当前系统尚未从视频中收取收入，下方图表显示如果启用收入系统的预估收入
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* 预估收入 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">预估收入</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.revenueStats}>
                          <defs>
                            <linearGradient id="estimatedGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="estimated" stroke="#3b82f6" fillOpacity={1} fill="url(#estimatedGradient)" name="预估收入" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 按分类收入 */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">按分类收入</h3>
                      <div className="space-y-4">
                        {data.categoryStats.map((category, index) => (
                          <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                ¥{Math.floor(category.views * 0.1).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">{category.views.toLocaleString()} 观看</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;