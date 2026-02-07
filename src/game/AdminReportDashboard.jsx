import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, BarChart3, Calendar, RefreshCw
} from 'lucide-react';

export default function AdminReportDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dailyReports, setDailyReports] = useState([]);
  const [platformStats, setPlatformStats] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedTab === 'daily') loadDailyReports();
    if (selectedTab === 'platform') loadPlatformStats();
    if (selectedTab === 'players') loadTopPlayers();
  }, [selectedTab, dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/backend-api/reports/dashboard-summary');
      const data = await res.json();
      if (data.success) setDashboardData(data);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyReports = async () => {
    const res = await fetch(`/backend-api/reports/daily-reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
    const data = await res.json();
    if (data.success) setDailyReports(data.reports);
  };

  const loadPlatformStats = async () => {
    const res = await fetch(`/backend-api/reports/platform-stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
    const data = await res.json();
    if (data.success) setPlatformStats(data.platforms);
  };

  const loadTopPlayers = async () => {
    const res = await fetch(`/backend-api/reports/top-players?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&limit=20`);
    const data = await res.json();
    if (data.success) setTopPlayers(data.players);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (selectedTab === 'daily') loadDailyReports();
    if (selectedTab === 'platform') loadPlatformStats();
    if (selectedTab === 'players') loadTopPlayers();
    setRefreshing(false);
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n || 0);

  const formatNumber = (n) => new Intl.NumberFormat('zh-CN').format(n || 0);

  if (loading) return <div className="p-10 text-center text-xl">Loading...</div>;

  const today = dashboardData?.today || {};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">📊 Admin Report Dashboard</h1>
        <button onClick={refreshData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded">
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Simple Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border rounded">
          <Users /> Active Players
          <div className="text-xl font-bold">{formatNumber(today.active_players)}</div>
        </div>

        <div className="bg-white p-4 border rounded">
          <BarChart3 /> Total Bet
          <div className="text-xl font-bold">{formatCurrency(today.total_bet_amount)}</div>
        </div>

        <div className="bg-white p-4 border rounded">
          <DollarSign /> GGR
          <div className="text-xl font-bold">{formatCurrency(today.gross_gaming_revenue)}</div>
        </div>

        <div className="bg-white p-4 border rounded">
          💰 Net Profit
          <div className="text-xl font-bold">{formatCurrency(today.net_revenue)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['overview', 'daily', 'platform', 'players'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedTab(t)}
            className={`px-4 py-2 border rounded ${selectedTab === t ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      {selectedTab !== 'overview' && (
        <div className="flex gap-2 mb-4">
          <input type="date" value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })} className="border px-2" />
          <input type="date" value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })} className="border px-2" />
        </div>
      )}

      {/* TABLES */}
      {selectedTab === 'daily' && (
        <table className="w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th>Date</th><th>Players</th><th>Bets</th><th>Total Bet</th><th>GGR</th><th>Net</th>
            </tr>
          </thead>
          <tbody>
            {dailyReports.map(r => (
              <tr key={r.id} className="border-t">
                <td>{r.report_date}</td>
                <td>{formatNumber(r.active_players)}</td>
                <td>{formatNumber(r.total_bets)}</td>
                <td>{formatCurrency(r.total_bet_amount)}</td>
                <td>{formatCurrency(r.gross_gaming_revenue)}</td>
                <td>{formatCurrency(r.net_revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedTab === 'platform' && (
        <table className="w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th>Platform</th>
              <th>Valid Bet</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            {platformStats.map(p => (
              <tr key={p.plat_type} className="border-t">
                <td>{p.plat_type}</td>
                <td>{formatCurrency(p.total_valid_amount)}</td>
                <td>{formatCurrency(p.total_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedTab === 'players' && (
        <table className="w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th>#</th><th>Player</th><th>Bets</th><th>Total Bet</th><th>Valid</th><th>Win/Loss</th>
            </tr>
          </thead>
          <tbody>
            {topPlayers.map((p, i) => (
              <tr key={p.player_id} className="border-t">
                <td>{i + 1}</td>
                <td>{p.player_id}</td>
                <td>{formatNumber(p.total_bets)}</td>
                <td>{formatCurrency(p.total_bet_amount)}</td>
                <td>{formatCurrency(p.total_valid_amount)}</td>
                <td className={p.total_win_loss > 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(p.total_win_loss)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
