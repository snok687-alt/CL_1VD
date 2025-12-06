'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, TrendingDown, 
  X, Search, Eye, 
  LogOut, RefreshCw, Menu,
  LayoutDashboard, Wallet, History,
  Settings, ChevronRight, Award,
  ChevronLeft, CheckCircle, XCircle,
  UserPlus, CreditCard, DollarSign,
  BarChart3, Shield, Activity,
  Filter, Download, Calendar,
  Bell, ChevronDown, MoreVertical,
  Edit, Trash2, Star, Clock,
  CheckSquare, AlertCircle, ArrowUpRight,
  ArrowDownRight, Percent, Target,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from 'lucide-react';

const AdminPanel = () => {
  // Authentication states
  const [token, setToken] = useState('');
  const [admin, setAdmin] = useState({
    id: 1,
    username: 'admin',
    fullName: 'System Administrator',
    role: 'Super Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalMembers: 1250,
    pendingDeposits: { count: 15, amount: 45000 },
    pendingWithdrawals: { count: 8, amount: 28000 },
    totalBalances: 2500000,
    activeUsers: 856,
    totalDeposits: 8500000,
    totalWithdrawals: 6200000,
    monthlyGrowth: 12.5,
    conversionRate: 3.2
  });

  // Members data
  const [members, setMembers] = useState([
    { id: 1, player_id: 'AG001', status: 'active', main_wallet: '15000', ag_wallet: '5000', total_deposit: '50000', total_withdrawal: '30000', created_at: '2024-01-15', last_login: '2024-03-10', country: 'TH' },
    { id: 2, player_id: 'AG002', status: 'active', main_wallet: '25000', ag_wallet: '8000', total_deposit: '120000', total_withdrawal: '80000', created_at: '2024-01-20', last_login: '2024-03-09', country: 'VN' },
    { id: 3, player_id: 'AG003', status: 'inactive', main_wallet: '5000', ag_wallet: '2000', total_deposit: '30000', total_withdrawal: '25000', created_at: '2024-02-01', last_login: '2024-02-28', country: 'ID' },
    { id: 4, player_id: 'AG004', status: 'active', main_wallet: '45000', ag_wallet: '15000', total_deposit: '200000', total_withdrawal: '150000', created_at: '2024-01-10', last_login: '2024-03-10', country: 'MY' },
    { id: 5, player_id: 'AG005', status: 'suspended', main_wallet: '0', ag_wallet: '0', total_deposit: '100000', total_withdrawal: '100000', created_at: '2024-01-05', last_login: '2024-02-15', country: 'TH' },
    { id: 6, player_id: 'AG006', status: 'active', main_wallet: '32000', ag_wallet: '10000', total_deposit: '150000', total_withdrawal: '100000', created_at: '2024-02-15', last_login: '2024-03-08', country: 'VN' },
  ]);

  // Deposits data
  const [deposits, setDeposits] = useState([
    { id: 1, request_id: 'DEP001', player_id: 'AG001', amount: '5000', currency: 'THB', payment_method: 'Bank Transfer', depositor_name: 'John Doe', bank_account: '123-456-7890', note: 'Deposit for weekend play', status: 'approved', created_at: '2024-03-10 10:30:00' },
    { id: 2, request_id: 'DEP002', player_id: 'AG002', amount: '10000', currency: 'THB', payment_method: 'PromptPay', depositor_name: 'Jane Smith', bank_account: '098-765-4321', note: '', status: 'pending', created_at: '2024-03-10 11:45:00' },
    { id: 3, request_id: 'DEP003', player_id: 'AG003', amount: '3000', currency: 'THB', payment_method: 'Credit Card', depositor_name: 'Bob Johnson', bank_account: '', note: 'First deposit', status: 'pending', created_at: '2024-03-09 14:20:00' },
    { id: 4, request_id: 'DEP004', player_id: 'AG004', amount: '15000', currency: 'THB', payment_method: 'Bank Transfer', depositor_name: 'Alice Brown', bank_account: '555-123-4567', note: 'Monthly deposit', status: 'approved', created_at: '2024-03-09 09:15:00' },
    { id: 5, request_id: 'DEP005', player_id: 'AG005', amount: '8000', currency: 'THB', payment_method: 'PromptPay', depositor_name: 'Charlie Wilson', bank_account: '777-888-9999', note: '', status: 'rejected', created_at: '2024-03-08 16:45:00' },
  ]);

  // Withdrawals data
  const [withdrawals, setWithdrawals] = useState([
    { id: 1, request_id: 'WDR001', player_id: 'AG001', amount: '3000', currency: 'THB', withdrawal_method: 'Bank Transfer', bank_name: 'Bangkok Bank', bank_account: '123-456-7890', account_holder: 'John Doe', note: 'Withdrawal request', status: 'approved', created_at: '2024-03-10 09:15:00' },
    { id: 2, request_id: 'WDR002', player_id: 'AG002', amount: '5000', currency: 'THB', withdrawal_method: 'PromptPay', bank_name: '', bank_account: '098-765-4321', account_holder: 'Jane Smith', note: 'Need funds', status: 'pending', created_at: '2024-03-10 13:30:00' },
    { id: 3, request_id: 'WDR003', player_id: 'AG004', amount: '10000', currency: 'THB', withdrawal_method: 'Bank Transfer', bank_name: 'Kasikorn Bank', bank_account: '555-123-4567', account_holder: 'Alice Brown', note: '', status: 'pending', created_at: '2024-03-09 15:45:00' },
    { id: 4, request_id: 'WDR004', player_id: 'AG006', amount: '7000', currency: 'THB', withdrawal_method: 'Bank Transfer', bank_name: 'SCB', bank_account: '777-888-9999', account_holder: 'Charlie Wilson', note: 'Emergency withdrawal', status: 'approved', created_at: '2024-03-08 11:20:00' },
  ]);

  // Transactions data
  const [transactions, setTransactions] = useState([
    { id: 1, transaction_id: 'TXN001', player_id: 'AG001', transaction_type: 'deposit', amount: '5000', balance_before: '10000', balance_after: '15000', status: 'success', created_at: '2024-03-10 10:30:00' },
    { id: 2, transaction_id: 'TXN002', player_id: 'AG002', transaction_type: 'withdrawal', amount: '3000', balance_before: '15000', balance_after: '12000', status: 'success', created_at: '2024-03-10 09:15:00' },
    { id: 3, transaction_id: 'TXN003', player_id: 'AG003', transaction_type: 'deposit', amount: '3000', balance_before: '2000', balance_after: '5000', status: 'success', created_at: '2024-03-09 14:20:00' },
    { id: 4, transaction_id: 'TXN004', player_id: 'AG004', transaction_type: 'bonus', amount: '1000', balance_before: '40000', balance_after: '41000', status: 'success', created_at: '2024-03-09 12:45:00' },
    { id: 5, transaction_id: 'TXN005', player_id: 'AG001', transaction_type: 'bet', amount: '-2000', balance_before: '15000', balance_after: '13000', status: 'success', created_at: '2024-03-10 11:30:00' },
    { id: 6, transaction_id: 'TXN006', player_id: 'AG002', transaction_type: 'win', amount: '5000', balance_before: '12000', balance_after: '17000', status: 'success', created_at: '2024-03-10 12:45:00' },
  ]);

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [note, setNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  
  // Search and filter states
  const [membersSearch, setMembersSearch] = useState('');
  const [membersFilter, setMembersFilter] = useState('all');
  const [depositsSearch, setDepositsSearch] = useState('');
  const [depositsFilter, setDepositsFilter] = useState('pending');
  const [withdrawalsSearch, setWithdrawalsSearch] = useState('');
  const [withdrawalsFilter, setWithdrawalsFilter] = useState('pending');
  
  // Pagination states
  const [membersPage, setMembersPage] = useState(1);
  const [depositsPage, setDepositsPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  
  const itemsPerPage = 10;

  // Simulate login
  useEffect(() => {
    // Auto login for demo
    setToken('demo-token');
  }, []);

  // Simulate API calls
  const simulateAPICall = (data, delay = 500) => {
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, data }), delay);
    });
  };

  const handleLogin = async (username, password) => {
    setLoading(true);
    await simulateAPICall({ token: 'demo-token', admin: {
      id: 1,
      username: 'admin',
      fullName: 'System Administrator',
      role: 'Super Admin'
    }});
    setToken('demo-token');
    setLoading(false);
  };

  const handleLogout = () => {
    setToken('');
    setAdmin(null);
  };

  const handleApproveDeposit = async (depositId, note = '') => {
    setLoading(true);
    await simulateAPICall({}, 1000);
    alert('Deposit approved!');
    setLoading(false);
    setModalOpen(false);
  };

  const handleRejectDeposit = async (depositId, reason) => {
    setLoading(true);
    await simulateAPICall({}, 1000);
    alert('Deposit rejected!');
    setLoading(false);
    setModalOpen(false);
  };

  const handleApproveWithdrawal = async (withdrawalId, note = '') => {
    setLoading(true);
    await simulateAPICall({}, 1000);
    alert('Withdrawal approved!');
    setLoading(false);
    setModalOpen(false);
  };

  const handleRejectWithdrawal = async (withdrawalId, reason) => {
    setLoading(true);
    await simulateAPICall({}, 1000);
    alert('Withdrawal rejected!');
    setLoading(false);
    setModalOpen(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  // Menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'members', label: 'Members', icon: Users, badge: null },
    { id: 'deposits', label: 'Deposits', icon: TrendingDown, badge: deposits.filter(d => d.status === 'pending').length },
    { id: 'withdrawals', label: 'Withdrawals', icon: TrendingUp, badge: withdrawals.filter(w => w.status === 'pending').length },
    { id: 'transactions', label: 'Transactions', icon: History, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  // Stats cards data
  const statCards = [
    { 
      title: 'Total Members', 
      value: stats.totalMembers.toLocaleString(), 
      change: '+12.5%', 
      icon: Users, 
      color: 'from-blue-500 to-cyan-500',
      trend: 'up'
    },
    { 
      title: 'Active Users', 
      value: stats.activeUsers.toLocaleString(), 
      change: '+8.2%', 
      icon: Activity, 
      color: 'from-emerald-500 to-teal-500',
      trend: 'up'
    },
    { 
      title: 'Pending Deposits', 
      value: stats.pendingDeposits.count, 
      amount: `฿${stats.pendingDeposits.amount.toLocaleString()}`, 
      icon: Clock, 
      color: 'from-amber-500 to-yellow-500',
      trend: 'neutral'
    },
    { 
      title: 'Pending Withdrawals', 
      value: stats.pendingWithdrawals.count, 
      amount: `฿${stats.pendingWithdrawals.amount.toLocaleString()}`, 
      icon: AlertCircle, 
      color: 'from-rose-500 to-pink-500',
      trend: 'neutral'
    },
    { 
      title: 'Total Balance', 
      value: `฿${stats.totalBalances.toLocaleString()}`, 
      change: '+5.3%', 
      icon: Wallet, 
      color: 'from-purple-500 to-pink-500',
      trend: 'up'
    },
    { 
      title: 'Conversion Rate', 
      value: `${stats.conversionRate}%`, 
      change: '+1.2%', 
      icon: Percent, 
      color: 'from-indigo-500 to-blue-500',
      trend: 'up'
    },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, user: 'AG001', action: 'Deposit approved', amount: '฿5,000', time: '10 min ago', type: 'deposit' },
    { id: 2, user: 'AG002', action: 'Withdrawal requested', amount: '฿3,000', time: '25 min ago', type: 'withdrawal' },
    { id: 3, user: 'AG003', action: 'New member registered', amount: '', time: '1 hour ago', type: 'member' },
    { id: 4, user: 'AG004', action: 'Large win', amount: '฿50,000', time: '2 hours ago', type: 'win' },
    { id: 5, user: 'AG005', action: 'Account suspended', amount: '', time: '3 hours ago', type: 'alert' },
  ];

  // If no token, show login page
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AG Casino Admin</h1>
            <p className="text-slate-400">Enter your credentials to continue</p>
          </div>

          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const form = e.target;
            handleLogin(form.username.value, form.password.value); 
          }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                defaultValue="admin"
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                defaultValue="password"
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-center text-slate-400 text-sm">
              Demo Credentials: admin / password
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Mobile header */}
      <div className="lg:hidden bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg mr-3"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
                <Award className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">AG Casino</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-800 rounded-lg relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg">
                <img 
                  src={admin.avatar} 
                  alt={admin.fullName}
                  className="w-8 h-8 rounded-full border-2 border-purple-500/30"
                />
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar for desktop */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden lg:flex flex-col transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-r border-purple-500/20`}>
          <div className="p-6 border-b border-slate-800">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
              <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center ${sidebarOpen ? 'mr-3' : ''}`}>
                <Award className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="text-white font-bold">AG Casino</h2>
                  <p className="text-slate-400 text-xs">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center ${sidebarOpen ? 'px-4 justify-start' : 'px-3 justify-center'} py-3 rounded-xl transition-all relative ${
                    active 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
              <div className="flex items-center">
                <img 
                  src={admin.avatar} 
                  alt={admin.fullName}
                  className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                />
                {sidebarOpen && (
                  <div className="ml-3">
                    <p className="text-white font-semibold text-sm">{admin.fullName}</p>
                    <p className="text-slate-400 text-xs">{admin.role}</p>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2">Logout</span>}
            </button>
            {sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full mt-3 flex items-center justify-center px-4 py-2 bg-slate-800/50 text-slate-400 rounded-xl hover:bg-slate-800/70 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-purple-500/20">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">AG Casino</h2>
                    <p className="text-slate-400 text-xs">Admin Panel</p>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                        active 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-3 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop header */}
          <div className="hidden lg:flex bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {!sidebarOpen && (
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-slate-800 rounded-lg mr-4"
                  >
                    <Menu className="w-5 h-5 text-slate-400" />
                  </button>
                )}
                <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 w-64"
                  />
                </div>
                
                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                <button className="p-2 hover:bg-slate-800 rounded-lg relative">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                </button>
                
                <div className="h-6 w-px bg-slate-700"></div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">{admin.fullName}</p>
                    <p className="text-slate-400 text-xs">{admin.role}</p>
                  </div>
                  <img 
                    src={admin.avatar} 
                    alt={admin.fullName}
                    className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Dashboard Page */}
            {currentPage === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome header */}
                <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {admin.fullName}! 👋</h2>
                      <p className="text-slate-300">Here's what's happening with your casino today.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                        <UserPlus className="w-4 h-4 inline mr-2" />
                        Add Member
                      </button>
                      <button className="px-4 py-2 bg-slate-800/50 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800/70 transition-all">
                        <Download className="w-4 h-4 inline mr-2" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <div key={index} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {card.trend === 'up' && (
                            <div className="flex items-center text-emerald-400 text-sm">
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                              {card.change}
                            </div>
                          )}
                          {card.trend === 'down' && (
                            <div className="flex items-center text-rose-400 text-sm">
                              <ArrowDownRight className="w-4 h-4 mr-1" />
                              {card.change}
                            </div>
                          )}
                          {card.trend === 'neutral' && card.amount && (
                            <div className="text-amber-400 text-sm font-semibold">
                              {card.amount}
                            </div>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm mb-1">{card.title}</p>
                        <p className="text-white text-2xl font-bold">{card.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Charts and tables row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent deposits */}
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20">
                    <div className="p-6 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Recent Deposits</h3>
                        <button className="text-purple-400 text-sm hover:text-purple-300">
                          View all
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {deposits.slice(0, 3).map((deposit) => (
                          <div key={deposit.id} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-xl">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mr-3">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{deposit.player_id}</p>
                                <p className="text-slate-400 text-sm">{deposit.payment_method}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">฿{parseInt(deposit.amount).toLocaleString()}</p>
                              <p className={`text-xs ${
                                deposit.status === 'approved' ? 'text-emerald-400' :
                                deposit.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {deposit.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent withdrawals */}
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20">
                    <div className="p-6 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Recent Withdrawals</h3>
                        <button className="text-purple-400 text-sm hover:text-purple-300">
                          View all
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {withdrawals.slice(0, 3).map((withdrawal) => (
                          <div key={withdrawal.id} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-xl">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center mr-3">
                                <CreditCard className="w-5 h-5 text-rose-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{withdrawal.player_id}</p>
                                <p className="text-slate-400 text-sm">{withdrawal.withdrawal_method}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">฿{parseInt(withdrawal.amount).toLocaleString()}</p>
                              <p className={`text-xs ${
                                withdrawal.status === 'approved' ? 'text-emerald-400' :
                                withdrawal.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {withdrawal.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20">
                  <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-xl">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                              activity.type === 'deposit' ? 'bg-emerald-500/20' :
                              activity.type === 'withdrawal' ? 'bg-rose-500/20' :
                              activity.type === 'member' ? 'bg-blue-500/20' :
                              activity.type === 'win' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                            }`}>
                              {activity.type === 'deposit' && <DollarSign className="w-5 h-5 text-emerald-400" />}
                              {activity.type === 'withdrawal' && <CreditCard className="w-5 h-5 text-rose-400" />}
                              {activity.type === 'member' && <UserPlus className="w-5 h-5 text-blue-400" />}
                              {activity.type === 'win' && <Star className="w-5 h-5 text-amber-400" />}
                              {activity.type === 'alert' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                            </div>
                            <div>
                              <p className="text-white font-medium">{activity.user}</p>
                              <p className="text-slate-400 text-sm">{activity.action}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{activity.amount}</p>
                            <p className="text-slate-400 text-sm">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members Page */}
            {currentPage === 'members' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Members Management</h2>
                    <p className="text-slate-400">Manage all casino members and their accounts</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={membersSearch}
                        onChange={(e) => setMembersSearch(e.target.value)}
                        placeholder="Search Player ID..."
                        className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <select
                      value={membersFilter}
                      onChange={(e) => setMembersFilter(e.target.value)}
                      className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <button className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      Add Member
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-white text-center py-20">Loading members...</div>
                ) : (
                  <>
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Player ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Country</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Main Wallet</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">AG Wallet</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Total Deposit</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Total Withdrawal</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {members.filter(member => {
                              if (!membersSearch) return true;
                              return member.player_id.toLowerCase().includes(membersSearch.toLowerCase());
                            }).filter(member => {
                              if (membersFilter === 'all') return true;
                              return member.status === membersFilter;
                            }).slice((membersPage - 1) * itemsPerPage, membersPage * itemsPerPage).map((member) => (
                              <tr key={member.id} className="hover:bg-slate-800/30">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                                      <span className="text-white text-xs font-bold">{member.country}</span>
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">{member.player_id}</p>
                                      <p className="text-slate-400 text-xs">{new Date(member.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                    member.status === 'inactive' ? 'bg-slate-500/20 text-slate-400' :
                                    'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-white">{member.country}</span>
                                </td>
                                <td className="px-6 py-4 text-right text-white font-medium">฿{parseInt(member.main_wallet).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-white font-medium">฿{parseInt(member.ag_wallet).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-emerald-400 font-medium">฿{parseInt(member.total_deposit).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-rose-400 font-medium">฿{parseInt(member.total_withdrawal).toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button className="p-1.5 hover:bg-slate-800 rounded-lg">
                                      <Eye className="w-4 h-4 text-slate-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-800 rounded-lg">
                                      <Edit className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-800 rounded-lg">
                                      <Trash2 className="w-4 h-4 text-rose-400" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">
                        Showing {(membersPage - 1) * itemsPerPage + 1} to {Math.min(membersPage * itemsPerPage, members.length)} of {members.length} members
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMembersPage(prev => Math.max(1, prev - 1))}
                          disabled={membersPage === 1}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setMembersPage(prev => prev + 1)}
                          disabled={membersPage * itemsPerPage >= members.length}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Deposits Page */}
            {currentPage === 'deposits' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Deposit Requests</h2>
                    <p className="text-slate-400">Review and process deposit requests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={depositsSearch}
                        onChange={(e) => setDepositsSearch(e.target.value)}
                        placeholder="Search Player ID or Request ID..."
                        className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <select
                      value={depositsFilter}
                      onChange={(e) => setDepositsFilter(e.target.value)}
                      className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-white text-center py-20">Loading deposits...</div>
                ) : (
                  <>
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Request ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Player ID</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Amount</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Payment Method</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase">Created At</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {deposits.filter(deposit => {
                              if (!depositsSearch) return true;
                              return deposit.player_id.toLowerCase().includes(depositsSearch.toLowerCase()) ||
                                     deposit.request_id.toLowerCase().includes(depositsSearch.toLowerCase());
                            }).filter(deposit => {
                              if (depositsFilter === 'all') return true;
                              return deposit.status === depositsFilter;
                            }).slice((depositsPage - 1) * itemsPerPage, depositsPage * itemsPerPage).map((deposit) => (
                              <tr key={deposit.id} className="hover:bg-slate-800/30">
                                <td className="px-6 py-4">
                                  <p className="text-white font-mono text-sm">{deposit.request_id}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-white font-medium">{deposit.player_id}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <p className="text-emerald-400 font-bold text-lg">฿{parseInt(deposit.amount).toLocaleString()}</p>
                                  <p className="text-slate-400 text-sm">{deposit.currency}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-2">
                                      <CreditCard className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-300">{deposit.payment_method}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    deposit.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                    deposit.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                    'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {deposit.status === 'pending' ? 'Pending' :
                                     deposit.status === 'approved' ? 'Approved' : 'Rejected'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-400 text-sm">
                                  {new Date(deposit.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedItem(deposit);
                                      setModalType('deposit');
                                      setModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">
                        Showing {(depositsPage - 1) * itemsPerPage + 1} to {Math.min(depositsPage * itemsPerPage, deposits.length)} of {deposits.length} deposits
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDepositsPage(prev => Math.max(1, prev - 1))}
                          disabled={depositsPage === 1}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDepositsPage(prev => prev + 1)}
                          disabled={depositsPage * itemsPerPage >= deposits.length}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Withdrawals Page */}
            {currentPage === 'withdrawals' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Withdrawal Requests</h2>
                    <p className="text-slate-400">Review and process withdrawal requests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={withdrawalsSearch}
                        onChange={(e) => setWithdrawalsSearch(e.target.value)}
                        placeholder="Search Player ID or Request ID..."
                        className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <select
                      value={withdrawalsFilter}
                      onChange={(e) => setWithdrawalsFilter(e.target.value)}
                      className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-white text-center py-20">Loading withdrawals...</div>
                ) : (
                  <>
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Request ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Player ID</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Amount</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Withdrawal Method</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase">Created At</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {withdrawals.filter(withdrawal => {
                              if (!withdrawalsSearch) return true;
                              return withdrawal.player_id.toLowerCase().includes(withdrawalsSearch.toLowerCase()) ||
                                     withdrawal.request_id.toLowerCase().includes(withdrawalsSearch.toLowerCase());
                            }).filter(withdrawal => {
                              if (withdrawalsFilter === 'all') return true;
                              return withdrawal.status === withdrawalsFilter;
                            }).slice((withdrawalsPage - 1) * itemsPerPage, withdrawalsPage * itemsPerPage).map((withdrawal) => (
                              <tr key={withdrawal.id} className="hover:bg-slate-800/30">
                                <td className="px-6 py-4">
                                  <p className="text-white font-mono text-sm">{withdrawal.request_id}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-white font-medium">{withdrawal.player_id}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <p className="text-rose-400 font-bold text-lg">฿{parseInt(withdrawal.amount).toLocaleString()}</p>
                                  <p className="text-slate-400 text-sm">{withdrawal.currency}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center mr-2">
                                      <CreditCard className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <span className="text-slate-300">{withdrawal.withdrawal_method}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    withdrawal.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                    withdrawal.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                    'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {withdrawal.status === 'pending' ? 'Pending' :
                                     withdrawal.status === 'approved' ? 'Approved' : 'Rejected'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-400 text-sm">
                                  {new Date(withdrawal.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedItem(withdrawal);
                                      setModalType('withdrawal');
                                      setModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">
                        Showing {(withdrawalsPage - 1) * itemsPerPage + 1} to {Math.min(withdrawalsPage * itemsPerPage, withdrawals.length)} of {withdrawals.length} withdrawals
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setWithdrawalsPage(prev => Math.max(1, prev - 1))}
                          disabled={withdrawalsPage === 1}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setWithdrawalsPage(prev => prev + 1)}
                          disabled={withdrawalsPage * itemsPerPage >= withdrawals.length}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Transactions Page */}
            {currentPage === 'transactions' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                    <p className="text-slate-400">View all casino transactions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Player ID or Transaction ID..."
                        className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <button className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-800/70 transition-all">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Filter by Date
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-white text-center py-20">Loading transactions...</div>
                ) : (
                  <>
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Transaction ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Player ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Type</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Amount</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Balance Before</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Balance After</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase">Status</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {transactions.slice((transactionsPage - 1) * itemsPerPage, transactionsPage * itemsPerPage).map((txn) => (
                              <tr key={txn.id} className="hover:bg-slate-800/30">
                                <td className="px-6 py-4">
                                  <p className="text-white font-mono text-sm">{txn.transaction_id}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-white font-medium">{txn.player_id}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    txn.transaction_type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' :
                                    txn.transaction_type === 'withdrawal' ? 'bg-rose-500/20 text-rose-400' :
                                    txn.transaction_type === 'bonus' ? 'bg-amber-500/20 text-amber-400' :
                                    txn.transaction_type === 'bet' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-purple-500/20 text-purple-400'
                                  }`}>
                                    {txn.transaction_type}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold text-lg ${
                                  txn.transaction_type === 'deposit' || txn.transaction_type === 'win' || txn.transaction_type === 'bonus' 
                                    ? 'text-emerald-400' 
                                    : 'text-rose-400'
                                }`}>
                                  {parseFloat(txn.amount) > 0 ? '+' : ''}฿{Math.abs(parseInt(txn.amount)).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-400">฿{parseInt(txn.balance_before).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-white font-semibold">฿{parseInt(txn.balance_after).toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    txn.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {txn.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-400 text-sm">
                                  {new Date(txn.created_at).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">
                        Showing {(transactionsPage - 1) * itemsPerPage + 1} to {Math.min(transactionsPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTransactionsPage(prev => Math.max(1, prev - 1))}
                          disabled={transactionsPage === 1}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setTransactionsPage(prev => prev + 1)}
                          disabled={transactionsPage * itemsPerPage >= transactions.length}
                          className="px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Analytics Page */}
            {currentPage === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                  <p className="text-slate-400">Detailed analytics and insights</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Monthly Overview</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mr-3">
                            <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-slate-300 text-sm">Total Revenue</p>
                            <p className="text-white font-bold text-xl">฿1,250,000</p>
                          </div>
                        </div>
                        <span className="text-emerald-400 text-sm font-semibold">+12.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-slate-300 text-sm">New Members</p>
                            <p className="text-white font-bold text-xl">145</p>
                          </div>
                        </div>
                        <span className="text-emerald-400 text-sm font-semibold">+8.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mr-3">
                            <Activity className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <p className="text-slate-300 text-sm">Active Users</p>
                            <p className="text-white font-bold text-xl">856</p>
                          </div>
                        </div>
                        <span className="text-emerald-400 text-sm font-semibold">+5.3%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
                    <div className="space-y-4">
                      {members.slice(0, 3).map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-xl">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.player_id}</p>
                              <p className="text-slate-400 text-sm">Total: ฿{parseInt(member.total_deposit).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-bold">฿{parseInt(member.main_wallet).toLocaleString()}</p>
                            <p className="text-slate-400 text-sm">Balance</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Page */}
            {currentPage === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">System Settings</h2>
                  <p className="text-slate-400">Manage system configuration and preferences</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">General Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">Site Name</label>
                          <input 
                            type="text" 
                            defaultValue="AG Casino" 
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm mb-2 block">Maintenance Mode</label>
                          <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl">Enabled</button>
                            <button className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-xl">Disabled</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Admin Profile</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={admin.avatar} 
                            alt={admin.fullName}
                            className="w-20 h-20 rounded-2xl border-2 border-purple-500/50"
                          />
                          <div>
                            <p className="text-white font-bold text-lg">{admin.fullName}</p>
                            <p className="text-slate-400">{admin.role}</p>
                            <button className="mt-2 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800/70">
                              Change Avatar
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-slate-300 text-sm mb-2 block">Full Name</label>
                            <input 
                              type="text" 
                              defaultValue={admin.fullName}
                              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 text-sm mb-2 block">Email</label>
                            <input 
                              type="email" 
                              defaultValue="admin@agcasino.com"
                              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full flex items-center px-4 py-3 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800/70">
                          <Shield className="w-5 h-5 mr-3" />
                          Security Settings
                        </button>
                        <button className="w-full flex items-center px-4 py-3 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800/70">
                          <Bell className="w-5 h-5 mr-3" />
                          Notification Settings
                        </button>
                        <button className="w-full flex items-center px-4 py-3 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800/70">
                          <Download className="w-5 h-5 mr-3" />
                          Backup Data
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">System Info</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Version</span>
                          <span className="text-white">v2.5.1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Updated</span>
                          <span className="text-white">2024-03-01</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Database Size</span>
                          <span className="text-white">1.2 GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {modalOpen && modalType === 'deposit' && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Deposit Request Details</h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Request ID</p>
                  <p className="text-white font-mono">{selectedItem.request_id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Player ID</p>
                  <p className="text-white font-semibold">{selectedItem.player_id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Amount</p>
                  <p className="text-emerald-400 font-bold text-xl">฿{parseInt(selectedItem.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Currency</p>
                  <p className="text-white">{selectedItem.currency}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Payment Method</p>
                  <p className="text-white">{selectedItem.payment_method}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Depositor Name</p>
                  <p className="text-white">{selectedItem.depositor_name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Bank Account</p>
                  <p className="text-white">{selectedItem.bank_account || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Created At</p>
                  <p className="text-white">{new Date(selectedItem.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedItem.note && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">Note</p>
                  <p className="text-white bg-slate-800/50 rounded-lg p-3">{selectedItem.note}</p>
                </div>
              )}

              {selectedItem.status === 'pending' && !showReject && (
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Approval Note (Optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add note here..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    rows={3}
                  />
                </div>
              )}

              {showReject && (
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Rejection Reason *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please specify the reason for rejection..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            {selectedItem.status === 'pending' && (
              <div className="p-6 border-t border-slate-800 flex gap-3">
                {!showReject ? (
                  <>
                    <button
                      onClick={() => handleApproveDeposit(selectedItem.id, note)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => setShowReject(true)}
                      disabled={loading}
                      className="flex-1 bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl hover:bg-rose-500/30 disabled:opacity-50 transition-all"
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Reject Request
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowReject(false)}
                      disabled={loading}
                      className="flex-1 bg-slate-800/50 text-white font-bold py-3 rounded-xl hover:bg-slate-800/70 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRejectDeposit(selectedItem.id, rejectReason)}
                      disabled={loading || !rejectReason}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 transition-all"
                    >
                      Confirm Rejection
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {modalOpen && modalType === 'withdrawal' && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Withdrawal Request Details</h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Request ID</p>
                  <p className="text-white font-mono">{selectedItem.request_id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Player ID</p>
                  <p className="text-white font-semibold">{selectedItem.player_id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Amount</p>
                  <p className="text-rose-400 font-bold text-xl">฿{parseInt(selectedItem.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Currency</p>
                  <p className="text-white">{selectedItem.currency}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Withdrawal Method</p>
                  <p className="text-white">{selectedItem.withdrawal_method}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Bank Name</p>
                  <p className="text-white">{selectedItem.bank_name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Bank Account</p>
                  <p className="text-white">{selectedItem.bank_account || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Account Holder</p>
                  <p className="text-white">{selectedItem.account_holder || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 text-sm mb-1">Created At</p>
                  <p className="text-white">{new Date(selectedItem.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedItem.note && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">Note</p>
                  <p className="text-white bg-slate-800/50 rounded-lg p-3">{selectedItem.note}</p>
                </div>
              )}

              {selectedItem.status === 'pending' && !showReject && (
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Approval Note (Optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add note here..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    rows={3}
                  />
                </div>
              )}

              {showReject && (
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Rejection Reason *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please specify the reason for rejection..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>

            {selectedItem.status === 'pending' && (
              <div className="p-6 border-t border-slate-800 flex gap-3">
                {!showReject ? (
                  <>
                    <button
                      onClick={() => handleApproveWithdrawal(selectedItem.id, note)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => setShowReject(true)}
                      disabled={loading}
                      className="flex-1 bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl hover:bg-rose-500/30 disabled:opacity-50 transition-all"
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Reject Request
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowReject(false)}
                      disabled={loading}
                      className="flex-1 bg-slate-800/50 text-white font-bold py-3 rounded-xl hover:bg-slate-800/70 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRejectWithdrawal(selectedItem.id, rejectReason)}
                      disabled={loading || !rejectReason}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 transition-all"
                    >
                      Confirm Rejection
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;