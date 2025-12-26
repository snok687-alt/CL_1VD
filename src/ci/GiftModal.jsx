import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Gift,
  X,
  LogIn,
  UserPlus,
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Coins,
  LogOut
} from 'lucide-react';

const GiftModal = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  onLoginSuccess,
  isLoggedIn: initialIsLoggedIn, // รับจาก parent
  setIsLoggedIn: setParentIsLoggedIn // รับจาก parent
}) => {
  if (!isOpen) return null;

  // ตัวแปรหลัก
  const [points, setPoints] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [canClaimToday, setCanClaimToday] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  // ข้อมูลผู้ใช้
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // สถานะ UI
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // ✅ ใช้ค่า initial จาก parent แทนการตั้งค่าเริ่มต้นเอง
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn || false);
  const [showRegister, setShowRegister] = useState(false);

  // ✅ เมื่อ isLoggedIn เปลี่ยนแปลงใน GiftModal ให้อัพเดท parent ด้วย
  useEffect(() => {
    if (setParentIsLoggedIn) {
      setParentIsLoggedIn(isLoggedIn);
    }
  }, [isLoggedIn, setParentIsLoggedIn]);

  // ✅ เมื่อได้รับ initialIsLoggedIn จาก parent ให้อัพเดท state
  useEffect(() => {
    if (initialIsLoggedIn !== undefined) {
      setIsLoggedIn(initialIsLoggedIn);
    }
  }, [initialIsLoggedIn]);

  // ฟังก์ชันช่วยเหลือ: ดึงข้อมูลจาก API
  const apiFetch = async (url, opts = {}) => {
    try {
      const res = await fetch(url, opts);
      const contentType = res.headers.get('content-type') || '';
      let body;
      if (contentType.includes('application/json')) {
        try {
          body = await res.json();
        } catch (e) {
          body = { __raw: await res.text() };
        }
      } else {
        body = { __raw: await res.text() };
      }
      return { ok: res.ok, status: res.status, body, headers: res.headers };
    } catch (err) {
      return { ok: false, status: 0, body: { __raw: err.message || String(err) } };
    }
  };

  // ============================================================
  // รีเซ็ตสถานะเมื่อปิด Modal
  // ============================================================
  const resetStates = () => {
    setPoints(0);
    setLastClaimDate(null);
    setCanClaimToday(true);
    setTimeLeft({ hours: 0, minutes: 0 });
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowRegister(false);
    // ไม่รีเซ็ต isLoggedIn เพราะ parent ควบคุม
  };

  // ============================================================
  // ปิด Modal (รีเซ็ต + callback)
  // ============================================================
  const handleClose = () => {
    resetStates();
    onClose();
  };

  // ============================================================
  // ปุ่มปิด: ออกจากระบบถ้าเข้าสู่ระบบอยู่
  // ============================================================
  const handleCloseButton = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isLoggedIn) handleLogout();
    handleClose();
  };

  // ป้องกันการคลิกใน Modal จะปิด Modal แม่
  const handleModalClick = (e) => e.stopPropagation();

  // ============================================================
  // ดึงสถานะการรับของขวัญ
  // ============================================================
  const loadClaimStatus = async (token = null) => {
    try {
      setLoading(true);
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const { ok, status, body } = await apiFetch("/backend-api/gift/check-status", {
        method: 'GET',
        headers
      });

      if (!ok) {
        console.warn("check-status failed:", status, body);
        const msg = body?.message || body?.__raw || `HTTP ${status}`;
        setMessage(`⚠️ 无法加载状态: ${msg}`);
        return;
      }

      const data = body;

      console.log("🔍 Status loaded:", data);

      // ตั้งค่าสถานะตามข้อมูลจาก backend
      setPoints(data.amount_gift || 0);
      setLastClaimDate(data.last_claim_date || null);

      // ใช้ claimedRecently จาก backend
      setCanClaimToday(!data.claimedRecently);

      if (data.claimedRecently && data.time_left) {
        setTimeLeft(data.time_left);
      } else {
        setTimeLeft({ hours: 0, minutes: 0 });
      }

    } catch (err) {
      console.error("Error loading status:", err);
      setMessage("⚠️ 无法加载状态");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // effect: เมื่อเปิด Modal, ตรวจสอบ token และ ดึงสถานะ
  // ============================================================
  useEffect(() => {
    if (!isOpen) return;
    
    // ✅ ตรวจสอบว่า parent บังคับให้แสดงหน้า Login หรือไม่
    if (initialIsLoggedIn === false) {
      // ถ้า parent บังคับให้แสดงหน้า Login (locked state)
      setIsLoggedIn(false);
      setMessage("🔒 请登录以解锁视频");
      return;
    }
    
    const token = localStorage.getItem("gift_token");
    const savedUsername = localStorage.getItem("gift_username");
    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
      loadClaimStatus(token);
    } else {
      loadClaimStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialIsLoggedIn]);

  // ============================================================
  // ปุ่มรีเฟรช
  // ============================================================
  const handleRefresh = async () => {
    const token = localStorage.getItem("gift_token");
    setMessage("🔄 加载中...");
    await loadClaimStatus(token);
    setMessage("");
  };

  // ============================================================
  // เข้าสู่ระบบ
  // ============================================================
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { ok, status, body } = await apiFetch("/backend-api/gift/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password })
      });

      if (!ok) {
        console.warn("login failed:", status, body);
        const msg = body?.message || body?.__raw || `HTTP ${status}`;
        setMessage(msg);
      } else {
        const data = body;
        if (data.token) {
          localStorage.setItem("gift_token", data.token);
          localStorage.setItem("gift_username", data.user.username);
          setIsLoggedIn(true);
          setPoints(data.user.amount_gift || 0);
          setMessage("✅ 登录成功!");

          // ✅ สำคัญ: รีเซ็ต counter การดูวิดีโอ
          if (onLoginSuccess) {
            onLoginSuccess();
          }

          // ✅ เรียก event เพื่อแจ้งให้ component อื่นรู้ว่าล็อกอินสำเร็จ
          window.dispatchEvent(new CustomEvent('userLoggedIn'));

          // โหลดสถานะใหม่
          setTimeout(() => loadClaimStatus(data.token), 500);
        } else {
          setMessage(data.message || "❌ 用户名或密码错误");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ 发生错误");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ลงทะเบียน
  // ============================================================
  const handleRegister = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage("");

    if (password.length < 4) {
      setMessage("❌ 密码至少需要4个字符");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("❌ 密码不匹配");
      setLoading(false);
      return;
    }

    try {
      const { ok, status, body } = await apiFetch("/backend-api/gift/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password })
      });

      if (!ok) {
        console.warn("register failed:", status, body);
        const msg = body?.message || body?.__raw || `HTTP ${status}`;
        setMessage(msg);
      } else {
        const data = body;
        if (data.success) {
          setMessage("✅ 注册成功!");
          setTimeout(() => {
            setShowRegister(false);
            setPassword("");
            setConfirmPassword("");
            setMessage("👉 请登录");
          }, 1200);
        } else {
          setMessage(data.message || "❌ 注册失败");
        }
      }
    } catch (err) {
      console.error("Register error:", err);
      setMessage("❌ 发生错误");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // รับของขวัญประจำวัน
  // ============================================================
  const claimDailyGift = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("gift_token");
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      console.log("🎁 Claiming gift with token:", !!token);

      const { ok, status, body } = await apiFetch("/backend-api/gift/daily", {
        method: 'GET',
        headers
      });

      console.log("🎁 Claim response:", { ok, status, body });

      if (!ok) {
        console.warn("claim failed:", status, body);
        const msg = body?.message || body?.__raw || `HTTP ${status}`;
        setMessage(msg);

        if (body?.claimedRecently) {
          setCanClaimToday(false);
          if (body.time_left) setTimeLeft(body.time_left);
        }
        return;
      }

      const data = body;

      if (data.success) {
        setPoints(data.amount_gift);
        setLastClaimDate(data.last_claim_date || null);
        setCanClaimToday(false);
        setMessage(`✅ 领取成功! 总计: ${data.amount_gift} 元`);

        // โหลดสถานะใหม่เพื่อแสดงเวลาที่เหลือ
        setTimeout(() => loadClaimStatus(token), 1000);
      } else {
        setMessage(data.message || "❌ 发生错误");
        if (data.claimedRecently) {
          setCanClaimToday(false);
          if (data.time_left) setTimeLeft(data.time_left);
        }
      }
    } catch (err) {
      console.error('Claim error:', err);
      setMessage("❌ 领取时发生错误");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ออกจากระบบ (ลบ token)
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("gift_token");
    localStorage.removeItem("gift_username");
    setIsLoggedIn(false);
    setMessage("👋 已退出系统");
    resetStates();
  };

  // ปุ่ม Escape ปิด Modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ===================================================================
  // RENDER - โทนเหล็กที่มีสีสัน
  // ===================================================================
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] animate-fadeIn p-4"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl relative animate-scaleIn overflow-hidden border-2 ${isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-gray-600 text-white"
          : "bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 border-gray-400 text-gray-800"
          }`}
        onClick={handleModalClick}
      >
        {/* ปุ่มปิด - โทนเหล็ก */}
        <button
          onClick={handleCloseButton}
          className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center z-50 pointer-events-auto rounded-lg transition ${isDarkMode
            ? "bg-gray-700 hover:bg-red-600 text-gray-300"
            : "bg-gray-300 hover:bg-red-500 text-gray-700"
            }`}
          type="button"
          title="关闭 (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8">
          {/* ส่วนหัว - โทนเหล็ก */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold mb-2 flex items-center justify-center gap-2 ${isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}>
              <Sparkles className="w-5 h-5 text-yellow-500" />
              {isLoggedIn ? "每日奖励" : showRegister ? "创建账户" : "用户登录"}
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {isLoggedIn ? "领取每日奖励并解锁所有功能" : "登录后您可以解锁所有视频，并领取每日礼物。"}
            </p>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {isLoggedIn ? `欢迎, ${username}` : "登录以访问完整内容"}
            </p>
          </div>

          {/* ✅ แบบฟอร์มเข้าสู่ระบบ - แสดงเมื่อไม่ได้ล็อกอิน */}
          {!isLoggedIn && !showRegister && (
            <div className="space-y-4">
              <div className="relative">
                <User className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-blue-500"
                  }`} />
                <input
                  type="text"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-blue-500"
                  }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-4 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-500 hover:text-blue-400"
                    }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-semibold transition disabled:opacity-50 border-2 ${isDarkMode
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 shadow-lg shadow-yellow-900/30"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-400/30"
                  }`}
              >
                <LogIn className="inline-block w-5 h-5 mr-2" />
                {loading ? "登录中..." : "登录"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className={`transition ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-600 hover:text-blue-800"
                    }`}
                >
                  <UserPlus className="inline w-4 h-4 mr-1" /> 创建账户
                </button>
              </div>
            </div>
          )}

          {/* ✅ แบบฟอร์มลงทะเบียน - แสดงเมื่อไม่ได้ล็อกอินและต้องการสมัครสมาชิก */}
          {!isLoggedIn && showRegister && (
            <div className="space-y-4">
              <div className="relative">
                <User className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-green-500"
                  }`} />
                <input
                  type="text"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    }`}
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-green-500"
                  }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    }`}
                  placeholder="密码 (>=4)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-4 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-green-500 hover:text-green-400"
                    }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-green-500"
                  }`} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    }`}
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-4 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-green-500 hover:text-green-400"
                    }`}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-semibold transition disabled:opacity-50 border-2 ${isDarkMode
                  ? "bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-900/30"
                  : "bg-gradient-to-r from-green-500 to-green-600 border-green-400 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-400/30"
                  }`}
              >
                <UserPlus className="inline-block w-5 h-5 mr-2" />
                {loading ? "注册中..." : "注册"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className={`transition ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-600 hover:text-blue-800"
                    }`}
                >
                  <LogIn className="inline w-4 h-4 mr-1" /> 已有账户
                </button>
              </div>
            </div>
          )}

          {/* ✅ มุมมองหลังเข้าสู่ระบบ - แสดงเฉพาะเมื่อล็อกอินแล้ว */}
          {isLoggedIn && (
            <div className="space-y-5">
              <div className={`p-6 rounded-2xl border-2 ${isDarkMode
                ? "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600"
                : "bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500"
                }`}>
                <div className={`flex items-center gap-2 text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span>累计金额</span>
                </div>
                <div className={`text-4xl font-extrabold ${isDarkMode ? "text-gray-100" : "text-gray-800"
                  }`}>
                  <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                    {points} 元
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border-2 ${isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-300 border-gray-400"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {canClaimToday ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Calendar className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className={`font-semibold text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                      {canClaimToday ? "✅ 可领取奖励" : "⏳ 已领取"}
                    </span>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className={`transition p-1 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-600 hover:text-blue-800"
                      }`}
                    title="刷新"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {!canClaimToday && timeLeft.hours >= 0 && (
                  <div className={`mt-3 flex items-center gap-2 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      可再次领取: <span className="font-bold text-yellow-600">{timeLeft.hours}</span> 小时 <span className="font-bold text-yellow-600">{timeLeft.minutes}</span> 分钟
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={claimDailyGift}
                disabled={!canClaimToday || loading}
                className={`w-full py-4 rounded-lg font-bold transition flex items-center justify-center gap-2 border-2 ${canClaimToday && !loading
                  ? isDarkMode
                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500 text-white hover:from-yellow-500 hover:to-orange-500 cursor-pointer shadow-lg shadow-yellow-900/30"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-white hover:from-yellow-600 hover:to-orange-600 cursor-pointer shadow-lg shadow-yellow-400/30"
                  : isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gray-400 border-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <Gift className="w-6 h-6" />
                {canClaimToday ? "🎁 领取奖励" : "✅ 已领取"}
              </button>

              <button
                onClick={handleLogout}
                className={`w-full py-3 rounded-lg font-semibold transition border-2 ${isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-red-700 hover:border-red-600"
                  : "bg-gray-400 border-gray-300 text-gray-700 hover:bg-red-500 hover:text-white hover:border-red-400"
                  }`}
              >
                <LogOut className="inline-block w-4 h-4 mr-2" />
                退出登录
              </button>
            </div>
          )}

          {/* ข้อความ - โทนเหล็ก */}
          {message && (
            <div className={`mt-6 p-3.5 rounded-lg border-2 text-center text-sm ${message.includes('✅') || message.includes('👋') || message.includes('成功')
              ? isDarkMode
                ? 'bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-600 text-green-300'
                : 'bg-gradient-to-r from-green-100 to-green-50 border-green-500 text-green-700'
              : message.includes('❌')
                ? isDarkMode
                  ? 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-600 text-red-300'
                  : 'bg-gradient-to-r from-red-100 to-red-50 border-red-500 text-red-700'
                : isDarkMode
                  ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-600 text-yellow-300'
                  : 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-500 text-yellow-700'
              }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftModal;