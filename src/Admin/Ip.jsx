import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Globe,
  Shield,
  MapPin,
  Clock,
  Wifi,
  FolderOpen,
  Monitor,
  Smartphone,
  Tablet
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
  const [stats, setStats] = useState({
    totalIPs: 0,
    recentIPs: 0,
    totalCountries: 0,
    suspiciousIPs: 0
  });
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

      if (data.success) {
        setIpList(data.ips || []);
        setStats({
          totalIPs: data.totalIPs || 0,
          recentIPs: data.recentIPs || 0,
          totalCountries: data.totalCountries || 0,
          suspiciousIPs: data.suspiciousIPs || 0
        });
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error(data.error || 'Failed to fetch IP data');
      }
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
      
      if (data.success) {
        setIpDetails(data);
      } else {
        throw new Error(data.error || 'Failed to fetch IP details');
      }
    } catch (err) {
      console.error('❌ 获取IP详情错误:', err);
      alert('加载 IP 详情失败。');
      setIpDetails(null);
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

  // 🧩 Device Icon Component
  const DeviceIcon = ({ device }) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-blue-600" />;
      case 'desktop':
        return <Monitor className="h-4 w-4 text-purple-600" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-400" />;
    }
  };

  // 🧩 Detail Card
  const IpDetailCard = ({ ip }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">IP 详情: {ip}</h3>
        <button
          onClick={() => {
            setSelectedIP(null);
            setIpDetails(null);
          }}
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
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">总请求数</p>
                  <p className="text-2xl font-bold text-blue-900">{ipDetails.totalRequests}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">项目访问</p>
                  <p className="text-2xl font-bold text-green-900">{ipDetails.projectAccessCount}</p>
                </div>
                <Wifi className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">设备类型</p>
                  <p className="text-lg font-bold text-purple-900">
                    {ipDetails.devices?.length || 0} 种
                  </p>
                </div>
                <Monitor className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">浏览器</p>
                  <p className="text-lg font-bold text-orange-900">
                    {ipDetails.browsers?.length || 0} 种
                  </p>
                </div>
                <Globe className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* 位置和网络信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" /> 位置信息
              </h4>
              <div className="space-y-2">
                {[
                  { label: '国家', value: ipDetails.country },
                  { label: '城市', value: ipDetails.city },
                  { label: '地区', value: ipDetails.region },
                  { label: 'ISP', value: ipDetails.isp }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium">{item.value || '未知'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 时间信息 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" /> 时间信息
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">首次访问:</span>
                  <span className="font-medium">
                    {ipDetails.firstActivity ? new Date(ipDetails.firstActivity).toLocaleString() : '未知'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后访问:</span>
                  <span className="font-medium">
                    {ipDetails.lastActivity ? new Date(ipDetails.lastActivity).toLocaleString() : '未知'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IP 类型:</span>
                  <span className={`font-medium ${ipDetails.isPrivate ? 'text-red-600' : 'text-green-600'}`}>
                    {ipDetails.isPrivate ? '私有 IP' : '公有 IP'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 设备和浏览器信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">设备信息</h4>
              <div className="flex flex-wrap gap-2">
                {ipDetails.devices?.map((device, index) => (
                  <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                    <DeviceIcon device={device} />
                    <span className="ml-1">{device}</span>
                  </span>
                ))}
                {(!ipDetails.devices || ipDetails.devices.length === 0) && (
                  <span className="text-gray-500">无设备信息</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">浏览器信息</h4>
              <div className="flex flex-wrap gap-2">
                {ipDetails.browsers?.map((browser, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {browser}
                  </span>
                ))}
                {(!ipDetails.browsers || ipDetails.browsers.length === 0) && (
                  <span className="text-gray-500">无浏览器信息</span>
                )}
              </div>
            </div>
          </div>

          {/* 访问的 URL */}
          {ipDetails.topUrls && ipDetails.topUrls.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">最常访问的 URL</h4>
              <div className="space-y-2">
                {ipDetails.topUrls.map((url, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-mono truncate flex-1">{url.url}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {url.access_count} 次
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              onClick={() => navigate('/CL_____________________________________________________________________________________******_/Admin')}
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
              placeholder="搜索 IP、国家、城市或 ISP..."
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
                {['IP地址', '国家', '城市', 'ISP', '设备', '总请求', '最近活动', '操作'].map((head) => (
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
                  <td colSpan="8" className="text-center py-8 text-gray-400">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : ipList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    未找到 IP 数据
                  </td>
                </tr>
              ) : (
                ipList.map((ipItem) => (
                  <tr key={ipItem.ip} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono">
                      <div className="flex items-center space-x-2">
                        {ipItem.isPrivate && <Shield className="h-4 w-4 text-red-500" />}
                        <span className={ipItem.isPrivate ? 'text-red-600 font-semibold' : ''}>
                          {ipItem.ip}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{ipItem.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{ipItem.city}</td>
                    <td className="px-6 py-4">{ipItem.isp}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <DeviceIcon device={ipItem.device} />
                        <span>{ipItem.device}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {ipItem.totalRequests} 次
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ipItem.lastActivity
                        ? new Date(ipItem.lastActivity).toLocaleString()
                        : '未知'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => fetchIpDetails(ipItem.ip)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              显示第 {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, stats.totalIPs)} 条，共 {stats.totalIPs} 条
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
                第 {page} 页，共 {totalPages} 页
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ip;