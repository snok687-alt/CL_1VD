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
  BarChart3,
  Globe,
  AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';

const Admin = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

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
    { id: 'dashboard', label: 'แดชบอร์ดผู้ดูแล', icon: Home, path: '/CL_____________________________________________________________________________________******_/Admin' },
    { id: 'ip', label: 'การจัดการ IP', icon: Globe, path: '/ip' },
    { id: 'videos', label: 'การจัดการวิดีโอ', icon: Video, path: '/Addpayment' },
    { id: 'videos_links', label: 'Link วีดีโอไหม่', icon: Video, path: '/Addlinks' },
    { id: 'games', label: 'การจัดการเกม', icon: BarChart3, path: '/GmaeDashboard' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/backend-api/admin/dashboard?period=${selectedPeriod}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      console.log('📊 ข้อมูลที่ได้รับ:', data);
      
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto refreshing dashboard...');
      fetchDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

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
                  value > 0 ? `¥${value.toLocaleString()}` : 'ยังไม่มีรายได้'
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
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const data = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-lg shadow-2xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
            <div className={`flex items-center space-x-3 transition-all ${sidebarOpen ? '' : 'justify-center w-full'}`}>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-xl font-bold text-gray-800">แพลตฟอร์มวิเคราะห์</p>
                  <p className="text-xs text-gray-500">ระบบจัดการวิดีโอ</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 p-2 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenuItem === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={async () => {
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

          <div className="p-4 border-t border-gray-200/60">
            <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">ผู้ดูแลระบบ</p>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-3">
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

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {data && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard
                    title="จำนวนการดูทั้งหมด"
                    value={data.stats.totalViews}
                    subtitle="ยอดดูวิดีโอรวม"
                    change={`${data.stats.viewChange > 0 ? '+' : ''}${data.stats.viewChange}%`}
                    icon={Eye}
                    trend={data.stats.viewChange >= 0 ? "up" : "down"}
                    color="blue"
                  />
                  <StatCard
                    title="ผู้ชมวิดีโอทั้งหมด"
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
                    title="รายได้รวม"
                    value={data.stats.totalRevenue}
                    subtitle="รายได้เดือนนี้"
                    change={`${data.stats.revenueChange > 0 ? '+' : ''}${data.stats.revenueChange}%`}
                    icon={DollarSign}
                    trend={data.stats.revenueChange >= 0 ? "up" : "down"}
                    color="green"
                    isRevenue={true}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">ภาพรวมการดู</h3>
                    {data.revenueStats && data.revenueStats.length > 0 ? (
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
                          <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#viewsGradient)" name="การดู" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        ไม่มีข้อมูลในช่วงเวลานี้
                      </div>
                    )}
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">การเติบโตของผู้ใช้</h3>
                    {data.userGrowth && data.userGrowth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#8b5cf6" name="ผู้ใช้ทั้งหมด" />
                          <Line type="monotone" dataKey="newUsers" stroke="#10b981" name="ผู้ใช้ใหม่" />
                          <Line type="monotone" dataKey="active" stroke="#f59e0b" name="ผู้ใช้ที่ใช้งาน" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        ไม่มีข้อมูลในช่วงเวลานี้
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">การใช้อุปกรณ์</h3>
                    {data.deviceData && data.deviceData.length > 0 ? (
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
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        ไม่มีข้อมูลอุปกรณ์
                      </div>
                    )}
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">วิดีโอยอดนิยม</h3>
                    {data.topVideos && data.topVideos.length > 0 ? (
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
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">{video.views.toLocaleString()} ครั้ง</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        ไม่มีข้อมูลวิดีโอ
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;