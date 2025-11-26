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
  CheckCircle2
} from 'lucide-react';

const GiftModal = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  // ຕົວແປຫຼັກ
  const [points, setPoints] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [canClaimToday, setCanClaimToday] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  // ຂໍ້ມູນຜູ້ໃຊ້
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ສະຖານະ UI
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ຟັງຊັນຊ່ວຍເຫຼືອ: ດຶງຂໍ້ມູນຈາກ API
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
  // ລີເຊັດສະຖານະເມື່ອປິດ Modal
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
    setIsLoggedIn(false);
    setShowRegister(false);
  };

  // ============================================================
  // ປິດ Modal (ລີເຊັດ + callback)
  // ============================================================
  const handleClose = () => {
    resetStates();
    onClose();
  };

  // ============================================================
  // ປຸ່ມປິດ: ອອກຈາກລະບົບຖ້າເຊັບຢູ່
  // ============================================================
  const handleCloseButton = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isLoggedIn) handleLogout();
    handleClose();
  };

  // ປ້ອງກັນການຄລິກໃນ Modal ຈະປິດ Modal ແມ່
  const handleModalClick = (e) => e.stopPropagation();

  // ============================================================
  // ດຶງສະຖານະການຮັບຂອງຂວັນ
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
      
      // ຕັ້ງຄ່າສະຖານະຕາມຂໍ້ມູນຈາກ backend
      setPoints(data.amount_gift || 0);
      setLastClaimDate(data.last_claim_date || null);
      
      // ໃຊ້ claimedRecently ຈາກ backend
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
  // effect: ເມື່ອເປີດ Modal, ກວດສອບ token ແລະ ດຶງສະຖານະ
  // ============================================================
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  // ============================================================
  // ປຸ່ມຟື້ນຟີວ
  // ============================================================
  const handleRefresh = async () => {
    const token = localStorage.getItem("gift_token");
    setMessage("🔄 加载中...");
    await loadClaimStatus(token);
    setMessage("");
  };

  // ============================================================
  // ເຂົ້າສູ່ລະບົບ
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
          // ສຳຄັນ: ໂຫຼດສະຖານະໃໝ່ໂດຍໃຊ້ token
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
  // ລົງທະບຽນ
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
  // ຮັບຂອງຂວັນປະຈຳວັນ
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
        setMessage(`✅ 领取礼物成功! 总计: ${data.amount_gift} 元`);
        
        // ໂຫຼດສະຖານະໃໝ່ເພື່ອສະແດງເວລາທີ່ເຫຼືອ
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
      setMessage("❌ 领取礼物时发生错误");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ອອກຈາກລະບົບ (ລຶບ token)
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("gift_token");
    localStorage.removeItem("gift_username");
    setIsLoggedIn(false);
    setMessage("👋 已退出系统");
    resetStates();
  };

  // ປຸ່ມ Escape ປິດ Modal
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
  // RENDER
  // ===================================================================
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn p-4"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl relative animate-scaleIn overflow-hidden ${
          isDarkMode ? "bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] text-white" : "bg-gradient-to-br from-white to-gray-50 text-gray-800"
        }`}
        onClick={handleModalClick}
      >
        {/* ປຸ່ມປິດ (ອອກຈາກລະບົບດ້ວຍ) */}
        <button
          onClick={handleCloseButton}
          className="absolute top-4 right-4 text-red-500 w-10 h-10 flex items-center justify-center z-50 pointer-events-auto hover:bg-red-100/20 rounded-full transition"
          type="button"
          title="关闭 (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8">
          {/* ສ່ວນຫົວ */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl ring-4 ring-purple-500/30 animate-pulse">
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
                  <Gift className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              {isLoggedIn ? "每日礼物" : showRegister ? "创建新账户" : "登录"}
            </h2>

            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {isLoggedIn ? `欢迎, ${username}` : "每24小时可领取礼物"}
            </p>
          </div>

          {/* ແບບຟອມເຂົ້າສູ່ລະບົບ */}
          {!isLoggedIn && !showRegister && (
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-4 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:border-purple-500 text-gray-800"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-purple-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:border-purple-500 text-gray-800"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                <LogIn className="inline-block w-5 h-5 mr-2" />
                {loading ? "登录中..." : "登录"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="text-purple-400 hover:text-purple-300 transition"
                >
                  <UserPlus className="inline w-4 h-4 mr-1" /> 创建账户
                </button>
              </div>
            </div>
          )}

          {/* ແບບຟອມລົງທະບຽນ */}
          {!isLoggedIn && showRegister && (
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-4 text-green-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:border-green-500 text-gray-800"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-green-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:border-green-500 text-gray-800"
                  placeholder="密码 (>=4)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-green-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:border-green-500 text-gray-800"
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                <UserPlus className="inline-block w-5 h-5 mr-2" />
                {loading ? "注册中..." : "注册"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="text-green-400 hover:text-green-300 transition"
                >
                  <LogIn className="inline w-4 h-4 mr-1" /> 已有账户
                </button>
              </div>
            </div>
          )}

          {/* ມຸມມອງຫຼັງເຂົ້າສູ່ລະບົບ */}
          {isLoggedIn && (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-purple-100 border border-purple-200">
                <div className="text-sm opacity-80 mb-1 text-purple-700">💰 累计金额</div>
                <div className="text-4xl font-extrabold text-purple-600">
                  {points} 元
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-100 border border-green-400">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {canClaimToday ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Calendar className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-semibold text-sm text-gray-700">
                      {canClaimToday ? "✅ 可领取礼物" : "⏳ 已领取"}
                    </span>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="text-gray-600 hover:text-gray-800 transition p-1"
                    title="刷新"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {!canClaimToday && timeLeft.hours >= 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      可再次领取: {timeLeft.hours} 小时 {timeLeft.minutes} 分钟
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={claimDailyGift}
                disabled={!canClaimToday || loading}
                className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                  canClaimToday && !loading
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Gift className="w-6 h-6" />
                {canClaimToday ? "🎁 领取礼物" : "✅ 已领取"}
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                退出系统
              </button>
            </div>
          )}

          {/* ຂໍ້ຄວາມ */}
          {message && (
            <div className={`mt-6 p-3.5 rounded-xl border text-center text-sm ${
              message.includes('✅') || message.includes('👋') || message.includes('成功')
                ? 'bg-green-100 border-green-300 text-green-700'
                : message.includes('❌')
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-yellow-100 border-yellow-300 text-yellow-700'
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