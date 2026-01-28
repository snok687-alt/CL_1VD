import { useEffect, useState } from "react";
import { User, Coins, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Gift_List({ isDarkMode = false }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // ✅ 检查token并加载数据
  const loadUserInfo = async () => {
    const token = localStorage.getItem("gift_token");

    if (!token) {
      setIsLoggedIn(false);
      setInfo(null);
      setLoading(false);
      return;
    }

    // ✅ 检查token是否过期（1小时）
    const tokenTime = localStorage.getItem("gift_token_time");
    if (tokenTime) {
      const tokenTimestamp = parseInt(tokenTime, 10);
      const currentTime = Date.now();
      const hoursPassed = (currentTime - tokenTimestamp) / (1000 * 60 * 60);

      if (hoursPassed >= 1) {
        // Token已过期
        localStorage.removeItem("gift_token");
        localStorage.removeItem("gift_username");
        localStorage.removeItem("gift_token_time");
        setIsLoggedIn(false);
        setInfo(null);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/backend-api/gift/user-info", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token无效
          localStorage.removeItem("gift_token");
          localStorage.removeItem("gift_username");
          localStorage.removeItem("gift_token_time");
          setIsLoggedIn(false);
          setInfo(null);
          throw new Error("登录已过期");
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        setInfo(data.user);
      } else {
        setIsLoggedIn(false);
        setInfo(null);
        setError(data.message || "未找到用户信息");
      }
    } catch (err) {
      console.error("加载用户信息时出错:", err);
      setError(err.message);
      setIsLoggedIn(false);
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 首次加载数据
  useEffect(() => {
    loadUserInfo();
  }, []);

  // ✅ 监听用户登录/登出事件
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log("Gift_List: 用户已登录，重新加载信息");
      loadUserInfo();
    };

    const handleUserLoggedOut = () => {
      console.log("Gift_List: 用户已登出，清除信息");
      setIsLoggedIn(false);
      setInfo(null);
      setLoading(false);
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('userLoggedOut', handleUserLoggedOut);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, []);

  // ✅ 刷新数据
  const handleRefresh = () => {
    loadUserInfo();
  };

  // ✅ 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "尚未领取";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  // ✅ 显示加载中
  if (loading) {
    return (
      <div className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} animate-pulse`}>
        <div className="flex items-center justify-center">
          <RefreshCw className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"} animate-spin mr-3`} />
          <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>正在加载数据...</span>
        </div>
      </div>
    );
  }

  // ✅ 显示错误
  if (error && !isLoggedIn) {
    return (
      <div className={`p-6 rounded-xl ${isDarkMode ? "bg-red-900/30 border border-red-800" : "bg-red-50 border border-red-200"}`}>
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className={`w-5 h-5 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
          <h3 className={`font-medium ${isDarkMode ? "text-red-300" : "text-red-700"}`}>发生错误</h3>
        </div>
        <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
        <button
          onClick={handleRefresh}
          className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode
            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
        >
          重试
        </button>
      </div>
    );
  }

  // ✅ 如果未登录
  if (!isLoggedIn || !info) {
    return (
      <div className={`p-6 rounded-xl text-center ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-200"}`}>
        <button
          onClick={() => navigate('/')}
          className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-50`}
        >
          <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回
        </button>
        <div className="flex flex-col items-center justify-center gap-3">
          <User className={`w-10 h-10 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
          <div>
            <h3 className={`font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>未登录</h3>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              请登录查看礼物信息
            </p>
            <p>注意：需要先登录</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ 登录后显示信息
  return (
    <div className={`p-6 rounded-xl border-2 ${isDarkMode
      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
      : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"}`}>

      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-50`}
        >
          <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回
        </button>
        <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
          <User className="w-5 h-5 text-blue-500" />
          用户信息
        </h2>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full transition ${isDarkMode
            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
            : "bg-gray-200 hover:bg-gray-300 text-gray-600"}`}
          title="刷新数据"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* 用户信息 */}
      <div className="space-y-4">
        {/* 用户名 */}
        <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>用户名:</span>
          </div>
          <p className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {info.username}
          </p>
        </div>

        {/* 累计金额 */}
        <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Coins className={`w-4 h-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-500"}`} />
            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>累计金额:</span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>
            {info.amount_gift || 0} 元
          </p>
        </div>

        {/* 最后领取日期 */}
        <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>最后领取:</span>
          </div>
          <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
            {formatDate(info.last_claim_date)}
          </p>
        </div>

        {/* 账户创建日期 */}
        {info.created_at && (
          <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              注册时间: {formatDate(info.created_at)}
            </p>
          </div>
        )}
      </div>

      {/* 状态 */}
      <div className={`mt-6 p-3 rounded-lg text-center text-sm ${isDarkMode
        ? "bg-blue-900/30 text-blue-300 border border-blue-800"
        : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
        <p>✅ 您已登录，可以领取每日礼物</p>
      </div>
    </div>
  );
}

export default Gift_List;