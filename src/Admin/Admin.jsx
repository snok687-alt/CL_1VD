import React from 'react';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Home, LogOut, Menu, ChevronLeft, ChevronRight, RefreshCw,
  Globe, AlertCircle, LinkIcon, Gamepad2, MonitorPlay, User, Bell,
  CheckCheck, Clock, Shield, Activity, Gift, Eye, Users, Video, DollarSign,
  TrendingUp, TrendingDown
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

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
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ ตรวจสอบ active menu item จาก pathname
  useEffect(() => {
    if (location.pathname.includes('/ip')) setActiveMenuItem('ip');
    else if (location.pathname.includes('video-management')) setActiveMenuItem('videos');
    else if (location.pathname.includes('/links')) setActiveMenuItem('videos_links');
    else if (location.pathname.includes('/games')) setActiveMenuItem('games');
    else if (location.pathname.includes('/accounts')) setActiveMenuItem('gift_accounts');
    else setActiveMenuItem('dashboard');
  }, [location.pathname]);

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

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/backend-api/user/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/backend-api/user/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/backend-api/user/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/backend-api/user/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: Home, path: '/CL_____________________________________________________________________________________******_/Admin' },
    { id: 'ip', label: 'IP管理', icon: Globe, path: '/CL_____________________________________________________________________________________******_/Admin/ip' },
    { id: 'videos', label: '视频管理', icon: MonitorPlay, path: '/CL_____________________________________________________________________________________******_/Admin/video-management' },
    { id: 'videos_links', label: '新视频链接', icon: LinkIcon, path: '/CL_____________________________________________________________________________________******_/Admin/links' },
    { id: 'games', label: '游戏管理', icon: Gamepad2, path: '/CL_____________________________________________________________________________________******_/Admin/games' },
    { id: 'gift_accounts', label: '礼品账户', icon: Gift, path: '/CL_____________________________________________________________________________________******_/Admin/accounts' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/backend-api/admin/dashboard?period=${selectedPeriod}`);
      if (!response.ok) throw new Error(`HTTP错误! 状态: ${response.status}`);
      const data = await response.json();

      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: '发生错误',
        text: '无法加载数据，请检查连接',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchCurrentUser();
  }, [selectedPeriod]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const UserAvatar = ({ user, size = "md" }) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12"
    };

    if (user?.imageUrl) {
      return (
        <img
          src={user.imageUrl}
          alt={user.username || '用户头像'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      );
    }

    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm`}>
        <User className="h-4 w-4 text-white" />
      </div>
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'login': return <Shield className="h-5 w-5" />;
      case 'security': return <AlertCircle className="h-5 w-5" />;
      case 'activity': return <Activity className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, subtitle, isRevenue = false, isGift = false, onClick, color = 'blue' }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-600' },
      red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' },
      pink: { bg: 'bg-pink-50', icon: 'text-pink-600', text: 'text-pink-600' }
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
            <p className={`text-2xl font-bold mb-2 ${isRevenue ? 'text-green-600' : isGift ? 'text-pink-600' : 'text-gray-900'}`}>
              {typeof value === 'number' ? (
                isRevenue ? (
                  value > 0 ? `¥${value.toLocaleString()}` : '尚无收入'
                ) : isGift ? (
                  value > 0 ? `${value.toLocaleString()} 账户` : '尚无账户'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ✅ Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-lg shadow-2xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80' : 'w-20'} 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-3 border-b border-gray-200/60">
            <div className={`flex items-center space-x-3 transition-all ${sidebarOpen ? '' : 'justify-center w-full'}`}>
              <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
                <UserAvatar user={currentUser} size="lg" />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {currentUser?.username || '系统管理员'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser?.role === 'admin' ? '管理员' : '用户'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center h-8 w-8 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-4 w-4" />}
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
                      onClick={() => {
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
                      <Icon className={`h-7 w-7 ${isActive ? 'text-blue-600' : 'text-gray-400'} ${sidebarOpen ? 'mr-3' : ''}`} />
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
            {sidebarOpen && currentUser && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserAvatar user={currentUser} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentUser.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      最后登录: {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString('zh-CN') : '未知'}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    localStorage.removeItem('token');
                    navigate('/Login');
                  }
                });
              }}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Menu className="h-10 w-10" />
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    title="刷新数据"
                  >
                    <RefreshCw className={`h-6 w-6 md:h-5 md:w-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  {lastUpdated && (
                    <span className="text-xs text-gray-500 hidden sm:block">
                      最后更新: {lastUpdated.toLocaleTimeString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Notification Bell */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      fetchNotifications();
                    }}
                    className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Bell className="h-7 w-7 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-[90vw] sm:w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
                      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                        <h3 className="font-semibold text-gray-900">通知中心</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <CheckCheck className="h-3 w-3" />
                            全部已读
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-6 sm:p-8 text-center text-gray-500">
                            <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm sm:text-base">暂无通知</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                                className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                              >
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${notif.type === 'login'
                                    ? 'bg-green-100 text-green-600'
                                    : notif.type === 'security'
                                      ? 'bg-red-100 text-red-600'
                                      : notif.type === 'activity'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getNotificationIcon(notif.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1 sm:gap-2">
                                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                        {notif.title}
                                      </p>
                                      {!notif.is_read && (
                                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                                      {notif.message}
                                    </p>
                                    <div className="flex items-center gap-1 sm:gap-2 mt-2 text-xs text-gray-400">
                                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                      <span className="truncate">{new Date(notif.created_at).toLocaleString('zh-CN')}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ✅ Content Area with Outlet */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* ✅ Check if we're on dashboard (no route matched or root admin) */}
            {location.pathname === '/CL_____________________________________________________________________________________******_/Admin' ? (
              <>
                {/* Dashboard Period Selector */}
                <div className="mb-6 flex justify-center sm:justify-start">
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

                {/* Dashboard Loading State */}
                {loading && !dashboardData ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">正在加载数据...</p>
                    </div>
                  </div>
                ) : error && !dashboardData ? (
                  <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">发生错误</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={fetchDashboardData}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      重试
                    </button>
                  </div>
                ) : dashboardData ? (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <StatCard
                        title="总观看次数"
                        value={dashboardData.stats.totalViews}
                        subtitle="视频观看总数"
                        change={`${dashboardData.stats.viewChange > 0 ? '+' : ''}${dashboardData.stats.viewChange}%`}
                        icon={Eye}
                        trend={dashboardData.stats.viewChange >= 0 ? "up" : "down"}
                        color="blue"
                      />

                      <StatCard
                        title="视频观众总数"
                        value={dashboardData.stats.uniqueIPs}
                        subtitle="不重复IP数量"
                        change={`${dashboardData.stats.userChange > 0 ? '+' : ''}${dashboardData.stats.userChange}%`}
                        icon={Users}
                        trend={dashboardData.stats.userChange >= 0 ? "up" : "down"}
                        color="green"
                        onClick={() => navigate('/CL_____________________________________________________________________________________******_/Admin/ip')}
                      />

                      <StatCard
                        title="礼品账户总数"
                        value={dashboardData.stats.giftAccounts || 0}
                        subtitle={`礼品总额: ${dashboardData.giftAccountStats?.totalGiftAmount || 0} 份`}
                        change={`${dashboardData.stats.giftAccountChange > 0 ? '+' : ''}${dashboardData.stats.giftAccountChange || 0}%`}
                        icon={Gift}
                        trend={dashboardData.stats.giftAccountChange >= 0 ? "up" : "down"}
                        color="pink"
                        isGift={true}
                        onClick={() => navigate('/CL_____________________________________________________________________________________******_/Admin/accounts')}
                      />

                      <StatCard
                        title="视频总数"
                        value={dashboardData.stats.totalVideos}
                        subtitle="系统中的视频"
                        change={`${dashboardData.stats.videoChange > 0 ? '+' : ''}${dashboardData.stats.videoChange}%`}
                        icon={Video}
                        trend={dashboardData.stats.videoChange >= 0 ? "up" : "down"}
                        color="purple"
                      />

                      <StatCard
                        title="总收入"
                        value={dashboardData.stats.totalRevenue}
                        subtitle="本月收入"
                        change={`${dashboardData.stats.revenueChange > 0 ? '+' : ''}${dashboardData.stats.revenueChange}%`}
                        icon={DollarSign}
                        trend={dashboardData.stats.revenueChange >= 0 ? "up" : "down"}
                        color="green"
                        isRevenue={true}
                      />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">观看概览</h3>
                        {dashboardData.revenueStats && dashboardData.revenueStats.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dashboardData.revenueStats}>
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
                        ) : (
                          <div className="h-[300px] flex items-center justify-center text-gray-500">
                            此时间段内没有数据
                          </div>
                        )}
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">用户增长</h3>
                        {dashboardData.userGrowth && dashboardData.userGrowth.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData.userGrowth}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip content={<CustomTooltip />} />
                              <Line type="monotone" dataKey="users" stroke="#8b5cf6" name="总用户" />
                              <Line type="monotone" dataKey="newUsers" stroke="#10b981" name="新用户" />
                              <Line type="monotone" dataKey="active" stroke="#f59e0b" name="活跃用户" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center text-gray-500">
                            此时间段内没有数据
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">设备使用情况</h3>
                        {dashboardData.deviceData && dashboardData.deviceData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={dashboardData.deviceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, value }) => `${name} ${value}%`}
                              >
                                {dashboardData.deviceData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center text-gray-500">
                            没有设备数据
                          </div>
                        )}
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">热门视频</h3>
                        {dashboardData.topVideos && dashboardData.topVideos.length > 0 ? (
                          <div className="space-y-4">
                            {dashboardData.topVideos.slice(0, 5).map((video, index) => (
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
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">{video.views.toLocaleString()} 次</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center text-gray-500">
                            没有视频数据
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <Outlet context={{ dashboardData, loading, error, selectedPeriod, setSelectedPeriod }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;