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
  Tablet,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Eye
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
    suspiciousIPs: 0,
    totalVideoViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIP, setSelectedIP] = useState(null);
  const [ipDetails, setIpDetails] = useState(null);
  const [sortBy, setSortBy] = useState('videoViewRequests'); // ✅ เปลี่ยนเริ่มต้นเรียงตามจำนวนการดูวิดีโอ
  const [sortOrder, setSortOrder] = useState('desc'); // ✅ เรียงจากมากไปน้อย

  const itemsPerPage = 20;
  const debouncedSearch = useDebounce(searchTerm, 500);

  /** 📦 ดึงข้อมูล IP ทั้งหมด */
  const fetchIpData = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const res = await fetch(
        `/backend-api/admin/ip-list?period=${selectedPeriod}&page=${page}&limit=${itemsPerPage}&search=${debouncedSearch}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        { signal }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success) {
        // ✅ เรียงข้อมูลตาม sortBy และ sortOrder
        let sortedIps = data.ips || [];
        
        if (sortBy === 'lastActivity') {
          sortedIps.sort((a, b) => {
            const timeA = new Date(a.lastActivity || 0).getTime();
            const timeB = new Date(b.lastActivity || 0).getTime();
            return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
          });
        } else if (sortBy === 'videoViewRequests') {
          sortedIps.sort((a, b) => {
            const viewsA = a.videoViewRequests || 0;
            const viewsB = b.videoViewRequests || 0;
            return sortOrder === 'desc' ? viewsB - viewsA : viewsA - viewsB;
          });
        }
        
        setIpList(sortedIps);
        setStats({
          totalIPs: data.totalIPs || 0,
          recentIPs: data.recentIPs || 0,
          totalCountries: data.totalCountries || 0,
          suspiciousIPs: data.suspiciousIPs || 0,
          totalVideoViews: data.totalVideoViews || 0 // ✅ เพิ่มยอดรวมการดูวิดีโอ
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
  }, [selectedPeriod, page, debouncedSearch, sortBy, sortOrder]);

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

  // 排序处理函数
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // ✅ เปลี่ยน: เรียงตามจำนวนการดูวิดีโอจากมากไปน้อยเป็นค่าเริ่มต้น
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchIpData();
  }, [fetchIpData]);

  // 🧩 Reusable Component: StatCard - 响应式调整
  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">
            {value?.toLocaleString() || 0}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color === 'blue' ? 'bg-blue-50' : ''} ${color === 'green' ? 'bg-green-50' : ''} ${color === 'purple' ? 'bg-purple-50' : ''} ${color === 'red' ? 'bg-red-50' : ''} ${color === 'orange' ? 'bg-orange-50' : ''}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color === 'blue' ? 'text-blue-600' : ''} ${color === 'green' ? 'text-green-600' : ''} ${color === 'purple' ? 'text-purple-600' : ''} ${color === 'red' ? 'text-red-600' : ''} ${color === 'orange' ? 'text-orange-600' : ''}`} />
        </div>
      </div>
    </div>
  );

  // 🧩 Device Icon Component
  const DeviceIcon = ({ device }) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case 'tablet':
        return <Tablet className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />;
      case 'desktop':
        return <Monitor className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />;
      default:
        return <Monitor className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
    }
  };

  // 🧩 Mobile-Friendly IP Detail Card
  const IpDetailCard = ({ ip }) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mx-2 sm:mx-0">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedIP(null);
              setIpDetails(null);
            }}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
              IP 详情: {ip}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">点击左上角返回列表</p>
          </div>
        </div>
        {ipDetails?.isPrivate && (
          <div className="flex items-center bg-red-50 text-red-700 px-2 sm:px-3 py-1 rounded-lg">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium">私有 IP</span>
          </div>
        )}
      </div>

      {loadingDetails ? (
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      ) : !ipDetails ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm sm:text-base">未找到该 IP 的数据</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* ✅ แก้ไข: ข้อมูลพื้นฐาน - แสดงเฉพาะการดูวิดีโอ */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-600">视频观看</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-900">
                    {ipDetails.videoViewRequests || 0}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">POST /views/increment</p>
                </div>
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-600">总请求</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-900">
                    {ipDetails.totalRequests || 0}
                  </p>
                  <p className="text-xs text-green-500 mt-1">所有请求类型</p>
                </div>
                <Wifi className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-600">设备</p>
                  <p className="text-base sm:text-lg font-bold text-purple-900">
                    {ipDetails.devices?.length || 0} 种
                  </p>
                  <p className="text-xs text-purple-500 mt-1">使用设备类型</p>
                </div>
                <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-600">浏览器</p>
                  <p className="text-base sm:text-lg font-bold text-orange-900">
                    {ipDetails.browsers?.length || 0} 种
                  </p>
                  <p className="text-xs text-orange-500 mt-1">使用浏览器</p>
                </div>
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* 位置和网络信息 - 移动端堆叠 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" /> 位置信息
              </h4>
              <div className="space-y-1 sm:space-y-2">
                {[
                  { label: '国家', value: ipDetails.country },
                  { label: '城市', value: ipDetails.city },
                  { label: '地区', value: ipDetails.region },
                  { label: 'ISP', value: ipDetails.isp }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-gray-600 text-xs sm:text-sm">{item.label}:</span>
                    <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none ml-2">
                      {item.value || '未知'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 时间信息 */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" /> 时间信息
              </h4>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs sm:text-sm">首次访问:</span>
                  <span className="font-medium text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none ml-2">
                    {ipDetails.firstActivity ? new Date(ipDetails.firstActivity).toLocaleDateString() : '未知'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs sm:text-sm">最后访问:</span>
                  <span className="font-medium text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none ml-2">
                    {ipDetails.lastActivity ? new Date(ipDetails.lastActivity).toLocaleString() : '未知'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-xs sm:text-sm">IP 类型:</span>
                  <span className={`font-medium text-xs sm:text-sm ${ipDetails.isPrivate ? 'text-red-600' : 'text-green-600'}`}>
                    {ipDetails.isPrivate ? '私有 IP' : '公有 IP'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 设备和浏览器信息 - 移动端优化 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">设备信息</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {ipDetails.devices?.map((device, index) => (
                  <span key={index} className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-xs flex items-center">
                    <DeviceIcon device={device} />
                    <span className="ml-1 truncate max-w-[60px] sm:max-w-none">{device}</span>
                  </span>
                ))}
                {(!ipDetails.devices || ipDetails.devices.length === 0) && (
                  <span className="text-gray-500 text-xs sm:text-sm">无设备信息</span>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">浏览器信息</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {ipDetails.browsers?.map((browser, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs truncate max-w-[80px] sm:max-w-none">
                    {browser}
                  </span>
                ))}
                {(!ipDetails.browsers || ipDetails.browsers.length === 0) && (
                  <span className="text-gray-500 text-xs sm:text-sm">无浏览器信息</span>
                )}
              </div>
            </div>
          </div>

          {/* ✅ แก้ไข: 访问的 URL - แสดงเฉพาะ /backend-api/views/increment */}
          {ipDetails.topUrls && ipDetails.topUrls.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center">
                <Eye className="h-4 w-4 mr-2 text-blue-600" /> 视频观看请求
              </h4>
              <div className="space-y-1 sm:space-y-2">
                {ipDetails.topUrls.slice(0, 5).map((url, index) => (
                  <div key={index} className="flex justify-between items-center bg-blue-50 p-2 sm:p-3 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mr-2">
                          POST
                        </span>
                        <span className="text-xs font-mono truncate flex-1">
                          {url.url.replace('/backend-api', '')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        最后访问: {new Date(url.last_access).toLocaleString()}
                      </div>
                    </div>
                    <span className="bg-blue-600 text-white px-2 py-0.5 sm:py-1 rounded text-xs whitespace-nowrap ml-2">
                      {url.access_count} 次
                    </span>
                  </div>
                ))}
                {ipDetails.topUrls.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    还有 {ipDetails.topUrls.length - 5} 个观看请求
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ✅ แสดงสถิติตามเวลาเฉพาะการดูวิดีโอ */}
          {ipDetails.hourlyStats && ipDetails.hourlyStats.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">观看时间分布</h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                {ipDetails.hourlyStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600">{stat.hour}:00</div>
                    <div className="mt-1">
                      <div 
                        className="bg-blue-500 rounded-sm mx-auto"
                        style={{ 
                          height: `${Math.min(stat.requests * 2, 40)}px`,
                          width: '80%',
                          opacity: stat.requests > 0 ? 0.8 : 0.3
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-800 font-medium mt-1">
                      {stat.requests || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (selectedIP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <IpDetailCard ip={selectedIP} />
        </div>
      </div>
    );
  }

  // 🧾 Main Table - 移动端优化
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - 移动端优化 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => navigate('/CL_____________________________________________________________________________________******_/Admin')}
              className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-50`}
            >
              <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                IP 管理
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">查看并分析访问视频的 IP</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* ✅ เพิ่มปุ่มเรียงตามจำนวนการดูวิดีโอ */}
            <button
              onClick={() => handleSort('videoViewRequests')}
              className="text-xs sm:text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              title="按观看次数排序"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {sortBy === 'videoViewRequests' && sortOrder === 'desc' ? '最多观看' : '最少观看'}
            </button>
            
            <button
              onClick={() => handleSort('lastActivity')}
              className="text-xs sm:text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              title="按时间排序"
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {sortBy === 'lastActivity' && sortOrder === 'desc' ? '最新' : '最旧'}
            </button>
            
            <button
              onClick={fetchIpData}
              disabled={loading}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-xs sm:text-sm">刷新</span>
            </button>
          </div>
        </div>

        {/* ✅ แก้ไข: Stats - แสดงข้อมูลการดูวิดีโอ */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <StatCard 
            title="活跃IP" 
            value={stats.totalIPs} 
            icon={Globe} 
            color="blue"
            subtitle="有观看记录的IP"
          />
          <StatCard 
            title="视频观看" 
            value={stats.totalVideoViews} 
            icon={Eye} 
            color="green"
            subtitle="总观看次数"
          />
          <StatCard 
            title="最近IP" 
            value={stats.recentIPs} 
            icon={Clock} 
            color="purple"
            subtitle="最近活跃"
          />
          <StatCard 
            title="国家" 
            value={stats.totalCountries} 
            icon={MapPin} 
            color="orange"
            subtitle="来源国家"
          />
          <StatCard 
            title="需检查" 
            value={stats.suspiciousIPs} 
            icon={Shield} 
            color="red"
            subtitle="私有IP地址"
          />
        </div>

        {/* Filters - 移动端优化 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索 IP、国家、城市或 ISP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                >
                  <option value="24h">24小时</option>
                  <option value="7d">7天</option>
                  <option value="30d">30天</option>
                  <option value="90d">90天</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View for small screens */}
        <div className="sm:hidden">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : ipList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>未找到 IP 数据</p>
              <p className="text-sm text-gray-400 mt-1">这段时间内没有视频观看记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ipList.map((ipItem) => (
                <div key={ipItem.ip} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 mb-1">
                        {ipItem.isPrivate && <Shield className="h-3 w-3 text-red-500 flex-shrink-0" />}
                        <span className={`font-mono text-sm font-semibold truncate ${ipItem.isPrivate ? 'text-red-600' : ''}`}>
                          {ipItem.ip}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[80px]">{ipItem.country || '未知'}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{ipItem.lastActivity ? new Date(ipItem.lastActivity).toLocaleDateString() : '未知'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => fetchIpDetails(ipItem.ip)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium ml-2"
                    >
                      详情
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">设备:</span>
                      <div className="flex items-center">
                        <DeviceIcon device={ipItem.device} />
                        <span className="ml-1 truncate">{ipItem.device || '未知'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-gray-500 mr-1">观看:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                        {ipItem.videoViewRequests || 0} 次
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">城市:</span>
                      <span className="truncate">{ipItem.city || '未知'}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-gray-500 mr-1">总请求:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                        {ipItem.totalRequests || 0} 次
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['IP地址', '国家', '城市', 'ISP', '设备', '视频观看', '总请求', '最近活动', '操作'].map((head) => (
                  <th
                    key={head}
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{head}</span>
                      {head === '视频观看' && (
                        <button
                          onClick={() => handleSort('videoViewRequests')}
                          className="focus:outline-none"
                          title={sortBy === 'videoViewRequests' && sortOrder === 'desc' ? '最多观看优先' : '最少观看优先'}
                        >
                          <Eye className="h-3 w-3 text-gray-400 hover:text-blue-500" />
                        </button>
                      )}
                      {head === '最近活动' && (
                        <button
                          onClick={() => handleSort('lastActivity')}
                          className="focus:outline-none"
                          title={sortBy === 'lastActivity' && sortOrder === 'desc' ? '最新优先' : '最旧优先'}
                        >
                          <Clock className="h-3 w-3 text-gray-400 hover:text-blue-500" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-400">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-sm">加载中...</p>
                  </td>
                </tr>
              ) : ipList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>未找到 IP 数据</p>
                    <p className="text-sm text-gray-400 mt-1">这段时间内没有视频观看记录</p>
                  </td>
                </tr>
              ) : (
                ipList.map((ipItem) => (
                  <tr key={ipItem.ip} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        {ipItem.isPrivate && <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />}
                        <span className={`font-mono text-sm ${ipItem.isPrivate ? 'text-red-600 font-semibold' : ''} truncate max-w-[120px] sm:max-w-none`}>
                          {ipItem.ip}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[60px] sm:max-w-none">{ipItem.country || '未知'}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm truncate max-w-[80px] sm:max-w-none">
                      {ipItem.city || '未知'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm truncate max-w-[100px] sm:max-w-none">
                      {ipItem.isp || '未知'}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <DeviceIcon device={ipItem.device} />
                        <span className="text-sm truncate max-w-[60px] sm:max-w-none">{ipItem.device || '未知'}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {ipItem.videoViewRequests || 0} 次
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {ipItem.totalRequests || 0} 次
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {ipItem.lastActivity
                        ? new Date(ipItem.lastActivity).toLocaleString()
                        : '未知'}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <button
                        onClick={() => fetchIpDetails(ipItem.ip)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline"
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

        {/* Pagination - 移动端优化 */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3">
            <div className="text-xs sm:text-sm text-gray-600">
              显示第 {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, stats.totalIPs)} 条，共 {stats.totalIPs} 条
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="上一页"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${page === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="下一页"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ip;