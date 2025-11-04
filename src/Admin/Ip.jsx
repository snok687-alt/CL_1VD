import { useState, useEffect } from 'react';
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

const Ip = () => {
  const navigate = useNavigate();
  const [ipData, setIpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIP, setSelectedIP] = useState(null);
  const [ipDetails, setIpDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const itemsPerPage = 20;

  // ฟังก์ชันดึงข้อมูล IP
  const fetchIpData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/backend-api/admin/ip-list?period=${selectedPeriod}&page=${page}&limit=${itemsPerPage}&search=${searchTerm}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setIpData(data.ips || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('❌ Error fetching IP data');
      }
    } catch (error) {
      console.error('❌ Error fetching IP data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึงรายละเอียด IP
  const fetchIpDetails = async (ip) => {
    setLoadingDetails(true);
    setSelectedIP(ip);
    try {
      const response = await fetch(`/backend-api/admin/ip-details/${encodeURIComponent(ip)}`);
      if (response.ok) {
        const data = await response.json();
        setIpDetails(data);
      }
    } catch (error) {
      console.error('❌ Error fetching IP details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchIpData();
  }, [selectedPeriod, page, searchTerm]);

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const IpDetailCard = ({ ip }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">รายละเอียด IP: {ip}</h3>
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
      ) : ipDetails ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-blue-600" />
              ข้อมูลพื้นฐาน
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ประเทศ:</span>
                <span className="font-medium">{ipDetails.country || 'ไม่ทราบ'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เมือง:</span>
                <span className="font-medium">{ipDetails.city || 'ไม่ทราบ'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ภูมิภาค:</span>
                <span className="font-medium">{ipDetails.region || 'ไม่ทราบ'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ISP:</span>
                <span className="font-medium">{ipDetails.isp || 'ไม่ทราบ'}</span>
              </div>
            </div>
          </div>

          {/* สถิติการใช้งาน */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-green-600" />
              สถิติการใช้งานโปรเจค
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">จำนวนครั้งที่เข้าโปรเจค:</span>
                <span className="font-medium">{ipDetails.projectAccessCount?.toLocaleString() || 0} ครั้ง</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">จำนวน request ทั้งหมด:</span>
                <span className="font-medium">{ipDetails.totalRequests?.toLocaleString() || 0} ครั้ง</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เข้าชมล่าสุด:</span>
                <span className="font-medium">
                  {ipDetails.lastActivity ? new Date(ipDetails.lastActivity).toLocaleString('th-TH') : 'ไม่ทราบ'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เข้าชมครั้งแรก:</span>
                <span className="font-medium">
                  {ipDetails.firstActivity ? new Date(ipDetails.firstActivity).toLocaleString('th-TH') : 'ไม่ทราบ'}
                </span>
              </div>
            </div>
          </div>

          {/* User Agents */}
          {ipDetails.userAgents && ipDetails.userAgents.length > 0 && (
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                อุปกรณ์ที่ใช้
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {ipDetails.userAgents.slice(0, 3).map((ua, index) => (
                  <div key={index} className="text-sm text-gray-700 mb-2 last:mb-0">
                    {ua}
                  </div>
                ))}
                {ipDetails.userAgents.length > 3 && (
                  <p className="text-sm text-gray-500 mt-2">
                    และอีก {ipDetails.userAgents.length - 3} อุปกรณ์...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* โปรเจคที่เข้าชม */}
          {ipDetails.topProjects && ipDetails.topProjects.length > 0 && (
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <FolderOpen className="h-5 w-5 mr-2 text-orange-600" />
                โปรเจคที่เข้าชมบ่อยที่สุด
              </h4>
              <div className="space-y-2">
                {ipDetails.topProjects.slice(0, 5).map((project, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {project.url.replace('/project/', 'โปรเจค: ')}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {project.count} ครั้ง
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>ไม่พบข้อมูลสำหรับ IP นี้</p>
        </div>
      )}
    </div>
  );

  if (selectedIP) {
    return <IpDetailCard ip={selectedIP} />;
  }

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
                การจัดการ IP
              </h1>
              <p className="text-gray-600">จัดการและตรวจสอบ IP address ที่เข้ามาใช้งานโปรเจค</p>
            </div>
          </div>

          <button
            onClick={fetchIpData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="IP ทั้งหมด"
            value={ipData.totalIPs?.toLocaleString() || '0'}
            icon={Globe}
            color="blue"
          />
          <StatCard
            title="ใช้งานล่าสุด"
            value={ipData.recentIPs?.toLocaleString() || '0'}
            icon={Clock}
            color="green"
          />
          <StatCard
            title="ประเทศ"
            value={ipData.totalCountries?.toLocaleString() || '0'}
            icon={MapPin}
            color="purple"
          />
          <StatCard
            title="ต้องตรวจสอบ"
            value={ipData.suspiciousIPs?.toLocaleString() || '0'}
            icon={Shield}
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหา IP, ประเทศ, หรือ ISP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">24 ชั่วโมง</option>
                <option value="7d">7 วัน</option>
                <option value="30d">30 วัน</option>
                <option value="90d">90 วัน</option>
              </select>
            </div>

            {/* Export Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* IP List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเทศ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จำนวนครั้งที่เข้าโปรเจค
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เข้าชมล่าสุด
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ipData.map((ip, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-mono text-sm">{ip.ip}</span>
                            {ip.isPrivate && (
                              <Shield className="h-3 w-3 text-red-500 ml-1" title="Private IP" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span>{ip.country || 'ไม่ทราบ'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FolderOpen className="h-3 w-3 mr-1" />
                              {ip.projectAccessCount?.toLocaleString()} โปรเจค
                            </span>
                            <span className="text-xs text-gray-500">
                              {ip.totalRequests?.toLocaleString()} requests
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ip.lastActivity ? new Date(ip.lastActivity).toLocaleString('th-TH') : 'ไม่ทราบ'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => fetchIpDetails(ip.ip)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ก่อนหน้า
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      หน้า {page} จาก {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ip;