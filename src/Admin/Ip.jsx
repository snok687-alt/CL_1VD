import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  ArrowLeft,
  RefreshCw,
  User,
  Globe,
  Calendar,
  Eye,
  Shield,
  MapPin,
  Clock,
  Wifi,
  FolderOpen
} from 'lucide-react';

// ✅ Helper สำหรับ debounce
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const Ip = () => {
  const navigate = useNavigate();

  const [ipList, setIpList] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIP, setSelectedIP] = useState(null);
  const [ipDetails, setIpDetails] = useState(null);

  const itemsPerPage = 20;
  const debouncedSearch = useDebounce(searchTerm, 500);

  /** 📦 ดึงข้อมูล IP ทั้งหมด */
  const fetchIpData = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const res = await fetch(
        `/backend-api/admin/ip-list?period=${selectedPeriod}&page=${page}&limit=${itemsPerPage}&search=${debouncedSearch}`,
        { signal }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // สมมุติ API ส่งแบบ { ips: [...], stats: {...}, totalPages: N }
      setIpList(data.ips || []);
      setStats(data.stats || {});
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('❌ 获取IP数据错误:', err);
        alert('加载数据失败，请稍后再试。');
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [selectedPeriod, page, debouncedSearch]);

  /** 📡 ดึงรายละเอียด IP */
  const fetchIpDetails = useCallback(async (ip) => {
    setLoadingDetails(true);
    setSelectedIP(ip);
    try {
      const res = await fetch(`/backend-api/admin/ip-details/${encodeURIComponent(ip)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIpDetails(data);
    } catch (err) {
      console.error('❌ 获取IP详情错误:', err);
      alert('加载 IP 详情失败。');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    fetchIpData();
  }, [fetchIpData]);

  // 🧩 Reusable Component: StatCard
  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value?.toLocaleString() || 0}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  // 🧩 Detail Card
  const IpDetailCard = ({ ip }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">IP 详情: {ip}</h3>
        <button
          onClick={() => setSelectedIP(null)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {loadingDetails ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : !ipDetails ? (
        <div className="text-center py-8 text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>未找到该 IP 的数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-blue-600" /> 基本信息
            </h4>
            <div className="space-y-2">
              {['country', 'city', 'region', 'isp'].map((key) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key.toUpperCase()}:</span>
                  <span className="font-medium">{ipDetails[key] || '未知'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-green-600" /> 项目统计
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">访问项目次数:</span>
                <span className="font-medium">{ipDetails.projectAccessCount || 0} 次</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总请求:</span>
                <span className="font-medium">{ipDetails.totalRequests || 0} 次</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最近访问:</span>
                <span className="font-medium">
                  {ipDetails.lastActivity ? new Date(ipDetails.lastActivity).toLocaleString() : '未知'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (selectedIP) return <IpDetailCard ip={selectedIP} />;

  // 🧾 Main Table
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                IP 管理
              </h1>
              <p className="text-gray-600">查看并分析访问项目的 IP</p>
            </div>
          </div>

          <button
            onClick={fetchIpData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="总 IP 数" value={stats.totalIPs} icon={Globe} color="blue" />
          <StatCard title="最近使用" value={stats.recentIPs} icon={Clock} color="green" />
          <StatCard title="国家数量" value={stats.totalCountries} icon={MapPin} color="purple" />
          <StatCard title="需检查" value={stats.suspiciousIPs} icon={Shield} color="red" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索 IP、国家或 ISP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">24小时</option>
              <option value="7d">7天</option>
              <option value="30d">30天</option>
              <option value="90d">90天</option>
            </select>
          </div>
        </div>

        {/* IP Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['IP地址', '国家', 'ISP', '最近活动', '操作'].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : ipList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    未找到 IP
                  </td>
                </tr>
              ) : (
                ipList.map((ipItem) => (
                  <tr key={ipItem.ip} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">{ipItem.ip}</td>
                    <td className="px-6 py-4">{ipItem.country || '未知'}</td>
                    <td className="px-6 py-4">{ipItem.isp || '未知'}</td>
                    <td className="px-6 py-4">
                      {ipItem.lastActivity
                        ? new Date(ipItem.lastActivity).toLocaleString()
                        : '未知'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => fetchIpDetails(ipItem.ip)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-3 py-1 border rounded-lg">{page}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ip;
