import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Video,
  DollarSign,
  Bell,
  Filter,
  Download,
  Home,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  CreditCard,
  BarChart3,
  Globe
} from 'lucide-react';
import Swal from 'sweetalert2';

const Admin = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [notifications, setNotifications] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ตรวจสอบขนาดหน้าจอ
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
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
    { id: 'ip', label: 'จัดการ IP', icon: Globe, path: '/ip' },
    { id: 'videos', label: 'จัดการวิดีโอ', icon: Video, path: '/' },
    { id: 'games', label: 'เกม', icon: BarChart3, path: '/gaming' },
  ];

  // ฟังก์ชันดึงข้อมูล Dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('🔄 ดึงข้อมูล Dashboard...');

      const response = await fetch(`/backend-api/admin/dashboard?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 ข้อมูล Dashboard ที่ได้รับ:', data);

      setDashboardData(data);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // ใช้ข้อมูลตัวอย่างถ้า API ล้มเหลว
      setDashboardData(getSampleData());
      
      // แสดง error message
      Swal.fire({
        icon: 'warning',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        text: 'กำลังใช้ข้อมูลตัวอย่าง กรุณาตรวจสอบการเชื่อมต่อ',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  // ข้อมูลตัวอย่างถ้า API ไม่ทำงาน
  const getSampleData = () => {
    const now = new Date();
    const sampleRevenueStats = [];
    const sampleUserGrowth = [];

    // สร้างข้อมูล 7 วันย้อนหลัง
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('th-TH', { weekday: 'short' });

      sampleRevenueStats.push({
        name: dayName,
        revenue: 0,
        views: Math.floor(Math.random() * 10000) + 5000,
        estimated: Math.floor(Math.random() * 5000) + 1000,
        date: date.toISOString().split('T')[0]
      });

      sampleUserGrowth.push({
        name: `Day ${7 - i}`,
        users: Math.floor(Math.random() * 3000) + 2000,
        newUsers: Math.floor(Math.random() * 200) + 100,
        active: Math.floor(Math.random() * 2500) + 1500,
        date: date.toISOString().split('T')[0]
      });
    }

    return {
      stats: {
        totalViews: 154230,
        totalVideos: 2847,
        totalUsers: 4832,
        totalRevenue: 0,
        uniqueIPs: 8920,
        viewChange: 12.5,
        videoChange: 8.2,
        userChange: 15.3,
        revenueChange: 0
      },
      revenueStats: sampleRevenueStats,
      userGrowth: sampleUserGrowth,
      deviceData: [
        { name: 'Mobile', value: 45, count: 4500, color: '#3b82f6' },
        { name: 'Desktop', value: 35, count: 3500, color: '#10b981' },
        { name: 'Tablet', value: 20, count: 2000, color: '#f59e0b' }
      ],
      topVideos: [
        { id: 1, title: 'Video 1', views: 12500, estimatedRevenue: 1250 },
        { id: 2, title: 'Video 2', views: 11200, estimatedRevenue: 1120 },
        { id: 3, title: 'Video 3', views: 9800, estimatedRevenue: 980 },
        { id: 4, title: 'Video 4', views: 8700, estimatedRevenue: 870 },
        { id: 5, title: 'Video 5', views: 7600, estimatedRevenue: 760 }
      ]
    };
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, subtitle, isRevenue = false, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105
      ${onClick ? 'cursor-pointer hover:bg-blue-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold mb-2 ${isRevenue ? 'text-green-600' : 'text-gray-900'}`}>
            {typeof value === 'number' ? (
              isRevenue ? (
                value > 0 ? `฿${value.toLocaleString()}` : 'ยังไม่มีรายได้'
              ) : (
                value.toLocaleString()
              )
            ) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          )}
          {change && change !== '0%' && (
            <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
              {trend === 'up' ?
                <TrendingUp className="h-4 w-4 mr-1" /> :
                trend === 'down' ?
                  <TrendingDown className="h-4 w-4 mr-1" /> :
                  <DollarSign className="h-4 w-4 mr-1" />
              }
              <span className="font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-green-50' :
          trend === 'down' ? 'bg-red-50' :
            'bg-blue-50'
          } shadow-sm`}>
          <Icon className={`h-6 w-6 ${trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' :
              'text-blue-600'
            }`} />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? (
                entry.dataKey === 'revenue' || entry.dataKey === 'estimated' ?
                  `฿${entry.value.toLocaleString()}` :
                  entry.value.toLocaleString()
              ) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600 mb-1">รายได้จริง: <span className="font-medium text-green-600">฿0</span></p>
          <p className="text-sm text-gray-600">รายได้ประมาณการ: <span className="font-medium text-blue-600">฿{payload[0]?.value?.toLocaleString() || '0'}</span></p>
          <p className="text-xs text-gray-500 mt-1">*ระบบรายได้ยังไม่เปิดใช้งาน</p>
        </div>
      );
    }
    return null;
  };

  const DeviceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{payload[0]?.payload?.name || label}</p>
          <p className="text-sm text-gray-600">
            เปอร์เซ็นต์: <span className="font-medium">{payload[0]?.value}%</span>
          </p>
          <p className="text-sm text-gray-600">
            จำนวนครั้ง: <span className="font-medium">{payload[0]?.payload?.count?.toLocaleString() || 0}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const data = dashboardData || getSampleData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-lg shadow-2xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
            <div className={`flex items-center space-x-3 transition-all ${sidebarOpen ? '' : 'justify-center w-full'}`}>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    RevenueAdmin
                  </span>
                  <p className="text-xs text-gray-500 mt-1">ระบบจัดการรายได้วิดีโอ</p>
                </div>
              )}
            </div>

            {/* Collapse button - desktop */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenuItem === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={async () => {
                        // ถ้าเป็นเมนูเกม หรือ วิดีโอ ให้ถามก่อน
                        if (item.id === 'videos' || item.id === 'games') {
                          const result = await Swal.fire({
                            title: 'ยืนยันการเปลี่ยนหน้า?',
                            text: `คุณต้องการไปที่หน้า "${item.label}" หรือไม่?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#3b82f6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'ตกลง',
                            cancelButtonText: 'ยกเลิก',
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

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200/60">
            <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">ผู้ดูแลระบบ</p>
                  <p className="text-xs text-gray-500 truncate">admin@videoapp.com</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button 
                onClick={() => {
                  Swal.fire({
                    title: 'ออกจากระบบ?',
                    text: 'คุณต้องการออกจากระบบหรือไม่?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'ออกจากระบบ',
                    cancelButtonText: 'ยกเลิก'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // Logic การออกจากระบบ
                      navigate('/login');
                    }
                  });
                }}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    ภาพรวมระบบ
                  </h1>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    title="รีเฟรชข้อมูล"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  {lastUpdated && (
                    <span className="text-xs text-gray-500 hidden sm:block">
                      อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString('th-TH')}
                    </span>
                  )}
                </div>

                {/* Period Selector */}
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

              <div className="flex items-center space-x-3">
                {/* Revenue Status */}
                <div className="hidden sm:flex items-center space-x-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                  <CreditCard className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 font-medium">ระบบรายได้ยังไม่เปิดใช้งาน</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Period Selector */}
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

        {/* Dashboard Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="ยอดวิวทั้งหมด"
                  value={data.stats.totalViews}
                  subtitle="จำนวนการดูวิดีโอ"
                  change={`${data.stats.viewChange > 0 ? '+' : ''}${data.stats.viewChange}% จากสัปดาห์ที่แล้ว`}
                  icon={Eye}
                  trend={data.stats.viewChange >= 0 ? "up" : "down"}
                />
                <StatCard
                  title="วิดีโอทั้งหมด"
                  value={data.stats.totalVideos}
                  subtitle="วิดีโอในระบบ"
                  change={`${data.stats.videoChange > 0 ? '+' : ''}${data.stats.videoChange}% จากเดือนที่แล้ว`}
                  icon={Video}
                  trend={data.stats.videoChange >= 0 ? "up" : "down"}
                />
                <StatCard
                  title="ผู้ใช้งานทั้งหมด"
                  value={data.stats.uniqueIPs}
                  subtitle="จำนวน IP ที่ไม่ซ้ำ"
                  change={`${data.stats.userChange > 0 ? '+' : ''}${data.stats.userChange}% จากสัปดาห์ที่แล้ว`}
                  icon={Users}
                  trend={data.stats.userChange >= 0 ? "up" : "down"}
                  onClick={() => navigate('/ip')}
                />
                <StatCard
                  title="รายได้ทั้งหมด"
                  value={data.stats.totalRevenue}
                  subtitle="รายได้จากวิดีโอ"
                  change="ยังไม่มีรายได้"
                  icon={DollarSign}
                  trend="neutral"
                  isRevenue={true}
                />
              </div>

              {/* Revenue Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">ระบบรายได้ยังไม่เปิดใช้งาน</h3>
                    <p className="text-yellow-700 mt-1">
                      ขณะนี้ระบบยังไม่มีการเก็บรายได้จากวิดีโอ กราฟด้านล่างแสดงรายได้ประมาณการหากเปิดใช้งานระบบรายได้
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Revenue Performance Chart */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900">รายได้จากวิดีโอ</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                        title="รีเฟรชข้อมูล"
                      >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        title="ดาวน์โหลดรายงาน"
                      >
                        <Download className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 text-center">
                      💡 กราฟแสดงรายได้ประมาณการหากเปิดใช้งานระบบรายได้ (คิดที่ 0.1 บาทต่อการดู)
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.revenueStats}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="estimatedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<RevenueTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#revenueGradient)" name="รายได้จริง" />
                      <Area type="monotone" dataKey="estimated" stroke="#3b82f6" fillOpacity={1} fill="url(#estimatedGradient)" name="รายได้ประมาณการ" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900">การเติบโตของผู้ใช้</h3>
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors self-start sm:self-auto">
                      <Download className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                        name="ผู้ใช้ทั้งหมด"
                      />
                      <Line
                        type="monotone"
                        dataKey="active"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', r: 3 }}
                        name="ผู้ใช้ที่ใช้งาน"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Usage */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">อุปกรณ์ที่ใช้</h3>
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
                      <Tooltip content={<DeviceTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {data.deviceData.map((device, index) => (
                      <div key={device.name} className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: device.color }} />
                        <span className="text-sm text-gray-600">
                          {device.name}: {device.value}% 
                          {device.count && ` (${device.count.toLocaleString()} ครั้ง)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Videos */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">วิดีโอยอดนิยม</h3>
                  <div className="space-y-4">
                    {data.topVideos && data.topVideos.slice(0, 5).map((video, index) => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                            <p className="text-xs text-gray-500">ID: {video.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{video.views.toLocaleString()} วิว</p>
                          <p className="text-xs text-gray-500">
                            ประมาณการ: ฿{Math.floor(video.views * 0.1).toLocaleString()}
                          </p>
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
    </div>
  );
};

export default Admin;