import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  Eye, 
  Trash2, 
  Calendar,
  X,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserVideoHistory = ({ isDarkMode, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 从 localStorage 获取 token
  const getToken = () => {
    return localStorage.getItem('gift_token');
  };

  // 获取历史记录
  const fetchHistory = async () => {
    try {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      const response = await fetch('/backend-api/user/history?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除单条历史记录
  const deleteHistoryItem = async (id) => {
    if (!window.confirm('你确定要删除这条观看记录吗？')) return;

    try {
      const token = getToken();
      const response = await fetch(`/backend-api/user/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setHistory(history.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('无法删除观看记录');
    }
  };

  // 清空所有历史记录
  const clearAllHistory = async () => {
    if (!window.confirm('你确定要清空所有观看记录吗？')) return;

    try {
      const token = getToken();
      const response = await fetch('/backend-api/user/history/clear/all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setHistory([]);
        alert(`成功清空 ${data.deleted_count} 条记录`);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('无法清空观看记录');
    }
  };

  // 时间格式化
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} 分钟`;
    if (diffHours < 24) return `${diffHours} 小时`;
    if (diffDays < 7) return `${diffDays} 天`;
    
    return date.toLocaleDateString('zh-CN', {
      day: 'numeric',
      month: 'short'
    });
  };

  // 时长格式化
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 按最近观看时间排序
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.last_watched_time) - new Date(a.last_watched_time)
  );

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[10000] p-2 sm:p-4`}>
      <div 
        className={`w-full h-[90vh] max-w-5xl rounded-2xl shadow-2xl overflow-hidden border-2 flex flex-col ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-gray-600 text-white'
            : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 border-gray-400 text-gray-800'
        }`}
      >
        {/* Header */}
        <div className={`p-3 sm:p-4 border-b-2 flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-yellow-500' : 'text-blue-600'}`} />
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold">📺 观看历史</h2>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  已观看 {history.length} 个视频
                </p>
                <p>注意：需要先登录</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className={`p-1 sm:p-2 rounded-lg transition flex-shrink-0 ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-300 text-gray-600 hover:text-gray-800'
              }`}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <History className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">暂无观看记录</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                开始观看视频以保存历史记录
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {sortedHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-2 sm:p-3 rounded-lg transition border flex gap-2 sm:gap-3 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                      : 'bg-white/50 border-gray-300 hover:bg-white'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-12 sm:w-32 sm:h-20 rounded-md overflow-hidden bg-gray-900">
                      {item.thumbnail_url ? (
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.video_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
                      {item.video_title}
                    </h3>
                    
                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm mb-1">
                      <div className={`flex items-center gap-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatTimeAgo(item.last_watched_time)}</span>
                      </div>
                      
                      <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                      
                      <div className={`flex items-center gap-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDuration(item.watch_duration)}</span>
                      </div>

                      {item.watch_count > 1 && (
                        <>
                          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                          <div className={`flex items-center gap-0.5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{item.watch_count} 次</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full">
                      <div className={`w-full rounded-full h-1.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.progress_percentage >= 90 
                              ? 'bg-green-500' 
                              : item.progress_percentage >= 50 
                                ? 'bg-blue-500' 
                                : 'bg-yellow-500'
                          }`}
                          style={{ width: `${item.progress_percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-0.5 text-gray-400">
                        {item.progress_percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className={`p-1.5 sm:p-2 rounded-lg transition flex-shrink-0 ${
                      isDarkMode 
                        ? 'text-gray-500 hover:text-red-400 hover:bg-gray-600' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-200'
                    }`}
                    title="删除记录"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 sm:p-4 border-t-2 flex-shrink-0 flex justify-between items-center gap-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {sortedHistory.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearAllHistory}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm ${
                isDarkMode 
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-800/40 disabled:opacity-50' 
                  : 'bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50'
              }`}
              disabled={history.length === 0}
            >
              清空全部
            </button>
            <button
              onClick={() => navigate('/')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVideoHistory;