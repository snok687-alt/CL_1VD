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
  Bell,
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
  Globe,
  Clock,
  UserCheck,
  Zap,
  Calendar,
  FileText,
  Server,
  Cpu,
  Database,
  Network,
  Shield,
  AlertTriangle
} from 'lucide-react';
import Swal from 'sweetalert2';

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
      // console.log('🔄 ดึงข้อมูล Dashboard...');

      const response = await fetch(`/backend-api/admin/dashboard?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log('📊 ข้อมูล Dashboard ที่ได้รับ:', data);

      setDashboardData(data);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // ใช้ข้อมูลตัวอย่างถ้า API ล้มเหลว
      setDashboardData(getSampleData());
      
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

  // ข้อมูลตัวอย่างครบชุด
  const getSampleData = () => {
    const now = new Date();
    const sampleRevenueStats = [];
    const sampleUserGrowth = [];
    const samplePerformance = [];
    const sampleHourlyTraffic = [];
    const sampleCategoryStats = [];
    const sampleGeoData = [];

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

    // สร้างข้อมูลรายชั่วโมง
    for (let i = 0; i < 24; i++) {
      sampleHourlyTraffic.push({
        hour: `${i}:00`,
        traffic: Math.floor(Math.random() * 1000) + 200,
        users: Math.floor(Math.random() * 500) + 100
      });
    }

    // ข้อมูลหมวดหมู่
    const categories = ['หนังโรแมนติก', 'หนังแอคชั่น', 'หนังคอมเมดี้', 'หนังสยองขวัญ', 'หนังไซไฟ', 'หนังดราม่า'];
    categories.forEach(category => {
      sampleCategoryStats.push({
        name: category,
        views: Math.floor(Math.random() * 50000) + 10000,
        videos: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 50000)
      });
    });

    // ข้อมูลภูมิศาสตร์
    const countries = ['ไทย', 'จีน', 'ญี่ปุ่น', 'เกาหลีใต้', 'ไต้หวัน', 'เวียดนาม'];
    countries.forEach(country => {
      sampleGeoData.push({
        name: country,
        value: Math.floor(Math.random() * 30) + 10,
        users: Math.floor(Math.random() * 5000) + 1000
      });
    });

    return {
      stats: {
        // Core Metrics
        totalViews: 154230,
        totalVideos: 2847,
        totalUsers: 4832,
        totalRevenue: 0,
        uniqueIPs: 8920,
        
        // Performance Metrics
        avgLoadTime: 1.8,
        uptime: 99.8,
        errorRate: 0.2,
        bandwidthUsage: 1250,
        
        // User Metrics
        activeUsers: 3250,
        newUsers: 245,
        returningUsers: 2780,
        avgSessionDuration: 8.5,
        
        // Change Metrics
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
        { name: 'Mobile', value: 45, count: 4500, color: '#3b82f6' },
        { name: 'Desktop', value: 35, count: 3500, color: '#10b981' },
        { name: 'Tablet', value: 20, count: 2000, color: '#f59e0b' }
      ],
      browserData: [
        { name: 'Chrome', value: 65, color: '#4285f4' },
        { name: 'Safari', value: 18, color: '#ff6d01' },
        { name: 'Firefox', value: 8, color: '#ff7139' },
        { name: 'Edge', value: 6, color: '#0078d7' },
        { name: 'อื่นๆ', value: 3, color: '#6b7280' }
      ],
      topVideos: [
        { id: 1, title: 'Video 1 - หนังโรแมนติก', views: 12500, estimatedRevenue: 1250, duration: '2:15:00' },
        { id: 2, title: 'Video 2 - หนังแอคชั่น', views: 11200, estimatedRevenue: 1120, duration: '1:45:00' },
        { id: 3, title: 'Video 3 - หนังคอมเมดี้', views: 9800, estimatedRevenue: 980, duration: '1:30:00' },
        { id: 4, title: 'Video 4 - หนังสยองขวัญ', views: 8700, estimatedRevenue: 870, duration: '1:55:00' },
        { id: 5, title: 'Video 5 - หนังไซไฟ', views: 7600, estimatedRevenue: 760, duration: '2:20:00' }
      ],
      systemAlerts: [
        { id: 1, type: 'warning', message: 'เซิร์ฟเวอร์ใช้ทรัพยากรสูง', time: '2 นาทีที่แล้ว' },
        { id: 2, type: 'info', message: 'อัพเดทระบบเรียบร้อย', time: '1 ชั่วโมงที่แล้ว' },
        { id: 3, type: 'success', message: 'การสำรองข้อมูลเสร็จสิ้น', time: '3 ชั่วโมงที่แล้ว' }
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
                  `฿${entry.value.toLocaleString()}` :
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
          <p className="text-sm text-blue-600">เวลาโหลด: {payload[0]?.value}s</p>
          <p className="text-sm text-green-600">อัพไทม์: {payload[1]?.value}%</p>
          <p className="text-sm text-red-600">ข้อผิดพลาด: {payload[2]?.value} ครั้ง</p>
        </div>
      );
    }
    return null;
  };

  const data = dashboardData || getSampleData();

  const tabs = [
    { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
    { id: 'performance', label: 'ประสิทธิภาพ', icon: Zap },
    { id: 'users', label: 'ผู้ใช้งาน', icon: Users },
    { id: 'content', label: 'เนื้อหา', icon: Video },
    { id: 'revenue', label: 'รายได้', icon: DollarSign },
  ];

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
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    VideoAnalytics
                  </span>
                  <p className="text-xs text-gray-500 mt-1">ระบบวิเคราะห์วิดีโอครบวงจร</p>
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
                    ระบบวิเคราะห์วิดีโอ
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
                {/* System Status */}
                <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <Server className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">ระบบทำงานปกติ</span>
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

            {/* Tabs Navigation */}
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
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                      title="ยอดวิวทั้งหมด"
                      value={data.stats.totalViews}
                      subtitle="จำนวนการดูวิดีโอ"
                      change={`${data.stats.viewChange > 0 ? '+' : ''}${data.stats.viewChange}%`}
                      icon={Eye}
                      trend={data.stats.viewChange >= 0 ? "up" : "down"}
                      color="blue"
                    />
                    <StatCard
                      title="ผู้ใช้งานทั้งหมด"
                      value={data.stats.uniqueIPs}
                      subtitle="จำนวน IP ที่ไม่ซ้ำ"
                      change={`${data.stats.userChange > 0 ? '+' : ''}${data.stats.userChange}%`}
                      icon={Users}
                      trend={data.stats.userChange >= 0 ? "up" : "down"}
                      color="green"
                      onClick={() => navigate('/ip')}
                    />
                    <StatCard
                      title="วิดีโอทั้งหมด"
                      value={data.stats.totalVideos}
                      subtitle="วิดีโอในระบบ"
                      change={`${data.stats.videoChange > 0 ? '+' : ''}${data.stats.videoChange}%`}
                      icon={Video}
                      trend={data.stats.videoChange >= 0 ? "up" : "down"}
                      color="purple"
                    />
                    <StatCard
                      title="ผู้ใช้งานปัจจุบัน"
                      value={data.stats.activeUsers}
                      subtitle="ผู้ใช้งานที่ออนไลน์"
                      change={`${data.stats.activeUserChange > 0 ? '+' : ''}${data.stats.activeUserChange}%`}
                      icon={UserCheck}
                      trend={data.stats.activeUserChange >= 0 ? "up" : "down"}
                      color="orange"
                    />
                  </div>

                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                      title="เวลาโหลดเฉลี่ย"
                      value={data.stats.avgLoadTime}
                      subtitle="วินาที"
                      change="เสถียร"
                      icon={Zap}
                      trend="neutral"
                      color="blue"
                    />
                    <StatCard
                      title="อัพไทม์ระบบ"
                      value={`${data.stats.uptime}%`}
                      subtitle="ความเสถียร"
                      change="ดีเยี่ยม"
                      icon={Server}
                      trend="up"
                      color="green"
                    />
                    <StatCard
                      title="ระยะเวลาใช้งานเฉลี่ย"
                      value={`${data.stats.avgSessionDuration} นาที`}
                      subtitle="ต่อเซสชัน"
                      change={`${data.stats.sessionChange > 0 ? '+' : ''}${data.stats.sessionChange}%`}
                      icon={Clock}
                      trend={data.stats.sessionChange >= 0 ? "up" : "down"}
                      color="purple"
                    />
                    <StatCard
                      title="อัตราข้อผิดพลาด"
                      value={`${data.stats.errorRate}%`}
                      subtitle="ของระบบ"
                      change="ต่ำมาก"
                      icon={AlertTriangle}
                      trend="down"
                      color="red"
                    />
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Traffic Overview */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">ภาพรวมการใช้งาน</h3>
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
                          <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#viewsGradient)" name="จำนวนวิว" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* User Growth */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">การเติบโตของผู้ใช้</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#8b5cf6" name="ผู้ใช้ทั้งหมด" />
                          <Line type="monotone" dataKey="newUsers" stroke="#10b981" name="ผู้ใช้ใหม่" />
                          <Line type="monotone" dataKey="returning" stroke="#f59e0b" name="ผู้ใช้กลับมา" />
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
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top Videos */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">วิดีโอยอดนิยม</h3>
                      <div className="space-y-4">
                        {data.topVideos.slice(0, 5).map((video, index) => (
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
                                <p className="text-xs text-gray-500">ระยะเวลา: {video.duration}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">{video.views.toLocaleString()} วิว</p>
                              <p className="text-xs text-gray-500">
                                ประมาณการ: ฿{video.estimatedRevenue.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* System Performance */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">ประสิทธิภาพระบบ</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.performanceStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip content={<PerformanceTooltip />} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="loadTime" stroke="#3b82f6" name="เวลาโหลด (s)" />
                          <Line yAxisId="right" type="monotone" dataKey="uptime" stroke="#10b981" name="อัพไทม์ (%)" />
                          <Line yAxisId="left" type="monotone" dataKey="errors" stroke="#ef4444" name="ข้อผิดพลาด" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Hourly Traffic */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">การใช้งานรายชั่วโมง</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.hourlyTraffic}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="traffic" fill="#3b82f6" name="ปริมาณการใช้งาน" />
                          <Bar dataKey="users" fill="#10b981" name="ผู้ใช้งาน" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Browser Usage */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">เบราว์เซอร์ที่ใช้</h3>
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

                    {/* System Alerts */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">การแจ้งเตือนระบบ</h3>
                      <div className="space-y-3">
                        {data.systemAlerts.map((alert) => (
                          <div key={alert.id} className={`p-3 rounded-lg border ${
                            alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
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

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* User Demographics */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">ภูมิศาสตร์ผู้ใช้งาน</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.geoData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3b82f6" name="เปอร์เซ็นต์ (%)" />
                          <Bar dataKey="users" fill="#10b981" name="จำนวนผู้ใช้" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* User Engagement */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">การมีส่วนร่วมของผู้ใช้</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-900">ผู้ใช้งานเฉลี่ยต่อวัน</span>
                          <span className="text-lg font-bold text-blue-600">{data.stats.activeUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-900">ผู้ใช้งานใหม่</span>
                          <span className="text-lg font-bold text-green-600">{data.stats.newUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium text-purple-900">ผู้ใช้งานกลับมา</span>
                          <span className="text-lg font-bold text-purple-600">{data.stats.returningUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                          <span className="text-sm font-medium text-orange-900">ระยะเวลาใช้งานเฉลี่ย</span>
                          <span className="text-lg font-bold text-orange-600">{data.stats.avgSessionDuration} นาที</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Category Performance */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">ประสิทธิภาพหมวดหมู่</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data.categoryStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" fill="#3b82f6" name="จำนวนวิว" />
                          <Bar dataKey="videos" fill="#10b981" name="จำนวนวิดีโอ" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Content Statistics */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">สถิติเนื้อหา</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{data.stats.totalVideos}</p>
                            <p className="text-sm text-blue-800">วิดีโอทั้งหมด</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">{Math.round(data.stats.totalViews / data.stats.totalVideos)}</p>
                            <p className="text-sm text-green-800">วิวเฉลี่ยต่อวิดีโอ</p>
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-800 mb-2">หมวดหมู่ที่ได้รับความนิยม</p>
                          <div className="space-y-2">
                            {data.categoryStats.slice(0, 3).map((category, index) => (
                              <div key={category.name} className="flex justify-between items-center">
                                <span className="text-sm text-purple-700">{category.name}</span>
                                <span className="text-sm font-bold text-purple-600">{category.views.toLocaleString()} วิว</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
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

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Estimated Revenue */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">รายได้ประมาณการ</h3>
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
                          <Area type="monotone" dataKey="estimated" stroke="#3b82f6" fillOpacity={1} fill="url(#estimatedGradient)" name="รายได้ประมาณการ" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Revenue by Category */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">รายได้ตามหมวดหมู่</h3>
                      <div className="space-y-4">
                        {data.categoryStats.map((category, index) => (
                          <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                ฿{Math.floor(category.views * 0.1).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">{category.views.toLocaleString()} วิว</p>
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