import React, { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";

const GiftModal = ({ isOpen, onClose, isDarkMode }) => {
  const [points, setPoints] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [canClaimToday, setCanClaimToday] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  // USER
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI STATES
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  /** ========================================================
   *  LOAD CLAIM STATUS เมื่อเปิด Modal
   * ======================================================== */
  useEffect(() => {
    if (isOpen) {
      loadClaimStatus();
    }
  }, [isOpen]);

  /** ========================================================
   * โหลดสถานะการรับของขวัญตาม IP
   * ======================================================== */
  const loadClaimStatus = async () => {
    try {
      console.log("🔄 Loading claim status...");
      const res = await fetch("/backend-api/gift/check-status");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();

      if (data.success) {
        setPoints(data.amount_gift || 0);
        setLastClaimDate(data.last_claim_date);
        setCanClaimToday(data.can_claim);
        
        if (data.time_left) {
          setTimeLeft(data.time_left);
        }

        console.log("✅ Claim status loaded:", data);
      } else {
        setMessage(data.message || "❌ เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (err) {
      console.error("❌ Error loading claim status:", err);
      
      // ถ้าเป็น 404 ให้ลองใช้ API daily แทน
      if (err.message.includes('404')) {
        setMessage("⚠️ ระบบกำลังอัพเดต... กรุณาลองใหม่ในภายหลัง");
        // ลองโหลดข้อมูลจาก daily API
        loadFromDailyAPI();
      } else {
        setMessage("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  };

  /** ========================================================
   * ทางเลือก: โหลดข้อมูลจาก daily API ถ้า check-status ไม่ทำงาน
   * ======================================================== */
  const loadFromDailyAPI = async () => {
    try {
      const res = await fetch("/backend-api/gift/daily");
      const data = await res.json();
      
      if (data.success) {
        setPoints(data.amount_gift || 0);
        setCanClaimToday(false);
        setMessage("✅ โหลดข้อมูลสำเร็จ");
      } else if (data.message) {
        // ถ้าได้รับข้อความว่าได้รับแล้ว → อัพเดตสถานะ
        setCanClaimToday(false);
        setMessage(data.message);
      }
    } catch (err) {
      console.error("Error loading from daily API:", err);
    }
  };

  /** ========================================================
   *  LOGIN
   * ======================================================== */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/backend-api/gift/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("gift_token", data.token);
        localStorage.setItem("gift_username", data.user.username);

        setIsLoggedIn(true);
        setPoints(data.user.amount_gift || 0);
        setMessage("✅ ເຂົ້າລະບົບສຳເລັດ");
        
        // โหลดสถานะใหม่หลังจากล็อกอิน
        setTimeout(loadClaimStatus, 500);
      } else {
        setMessage(data.message || "❌ ຂໍ້ມູນບໍ່ຖືກຕ້ອງ");
      }
    } catch (err) {
      setMessage("❌ ເກີດຂໍ້ຜິດພາດ");
    }

    setLoading(false);
  };

  /** ========================================================
   *  REGISTER
   * ======================================================== */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password.length < 4) {
      setMessage("❌ ລະຫັດຕ້ອງ >= 4 ຕົວ");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("❌ ລະຫັດບໍ່ກົງກັນ");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/backend-api/gift/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }

      if (data.success) {
        setMessage("✅ ສະໝັກສຳເລັດ!");
        setTimeout(() => setShowRegister(false), 1500);
      } else {
        setMessage(data.message || "❌ ສະໝັກບໍ່ສຳເລັດ");
      }
    } catch (err) {
      console.error("注册错误:", err);
      setMessage(`❌ ${err.message || "ມີຂໍ້ຜິດພາດ"}`);
    }

    setLoading(false);
  };

  /** ========================================================
   *  DAILY GIFT
   * ======================================================== */
  const claimDailyGift = async () => {
    try {
      setLoading(true);
      const res = await fetch("/backend-api/gift/daily");
      const data = await res.json();

      if (data.success) {
        setPoints(data.amount_gift);
        setLastClaimDate(data.last_claim_date);
        setCanClaimToday(false);
        setMessage(`🎁 รับของขวัญสำเร็จ +1 元! (ยอดรวม: ${data.amount_gift} 元)`);
        
        // รีเฟรชสถานะ
        setTimeout(loadClaimStatus, 1000);
      } else {
        setMessage(data.message);
        // รีเฟรชสถานะถ้าได้รับแล้ว
        if (!data.can_claim_again) {
          loadClaimStatus();
        }
      }
    } catch (err) {
      setMessage("❌ เกิดข้อผิดพลาดในการรับของขวัญ");
    } finally {
      setLoading(false);
    }
  };

  /** ========================================================
   *  LOGOUT
   * ======================================================== */
  const handleLogout = () => {
    localStorage.removeItem("gift_token");
    localStorage.removeItem("gift_username");

    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setPoints(0);
    setLastClaimDate(null);
    setCanClaimToday(true);

    setMessage("👋 ອອກລະບົບສຳເລັດ");
  };

  /** ========================================================
   * รีเฟรชสถานะ
   * ======================================================== */
  const handleRefresh = () => {
    setMessage("🔄 กำลังโหลดข้อมูล...");
    loadClaimStatus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
      {/* CARD */}
      <div
        className={`w-[420px] p-6 rounded-3xl shadow-2xl relative animate-scaleIn ${
          isDarkMode ? "bg-[#1c1c1e] text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-105 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden shadow-lg ring-4 ring-white/40">
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-pink-400 to-purple-600">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold">
            {isLoggedIn
              ? "🎁 ຂອງຂວັນປະຈຳວັນ"
              : showRegister
              ? "ສ້າງບັນຊີໃໝ່"
              : "ເຂົ້າລະບົບ"}
          </h2>

          <p className="text-gray-400 text-sm">
            {isLoggedIn ? `ยินดีต้อนรับ, ${username}` : "รับของขวัญได้วันละ 1 ครั้งต่อ IP"}
          </p>
        </div>

        {/* ============================= LOGIN FORM ============================= */}
        {!isLoggedIn && !showRegister && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* USER */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className={`w-full pl-10 pr-3 py-3 rounded-xl border transition ${
                  isDarkMode ? "bg-[#2c2c2e] border-gray-600" : "border-gray-300"
                }`}
                placeholder="ຊື່ຜູ້ໃຊ້"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* PASS */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border transition ${
                  isDarkMode ? "bg-[#2c2c2e] border-gray-600" : "border-gray-300"
                }`}
                placeholder="ລະຫັດຜ່ານ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? "ກຳລັງເຂົ້າ..." : "ເຂົ້າລະບົບ"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-blue-400 hover:text-blue-500 text-sm"
              >
                <UserPlus className="inline w-4 h-4 mr-1" /> ສ້າງບັນຊີ
              </button>
            </div>
          </form>
        )}

        {/* ============================= REGISTER FORM ============================= */}
        {!isLoggedIn && showRegister && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* USER */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className={`w-full pl-10 pr-3 py-3 rounded-xl border transition ${
                  isDarkMode ? "bg-[#2c2c2e] border-gray-600" : "border-gray-300"
                }`}
                placeholder="ຊື່ຜູ້ໃຊ້"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* PASS */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border transition ${
                  isDarkMode ? "bg-[#2c2c2e] border-gray-600" : "border-gray-300"
                }`}
                placeholder="ລະຫັດຜ່ານ (>=4)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* CONFIRM PASS */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border transition ${
                  isDarkMode ? "bg-[#2c2c2e] border-gray-600" : "border-gray-300"
                }`}
                placeholder="ຢືນຢັນລະຫັດ"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? "ກຳລັງສະໝັກ..." : "ສະໝັກ"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-blue-400 hover:text-blue-500 text-sm"
              >
                <LogIn className="inline w-4 h-4 mr-1" /> ມີບັນຊີແລ້ວ
              </button>
            </div>
          </form>
        )}

        {/* ============================= LOGGED IN VIEW ============================= */}
        {isLoggedIn && (
          <div className="space-y-4">
            {/* ยอดเงินปัจจุบัน */}
            <div
              className={`p-4 rounded-2xl shadow-inner flex flex-col items-center ${
                isDarkMode ? "bg-[#2c2c2e]" : "bg-gray-100"
              }`}
            >
              <div className="text-lg font-bold">💰 เงินสะสม</div>
              <div className="text-3xl font-extrabold mt-1">{points} 元</div>
            </div>

            {/* สถานะการรับของขวัญ */}
            <div
              className={`p-3 rounded-xl text-sm ${
                canClaimToday 
                  ? "bg-green-500/20 text-green-600 border border-green-500/30"
                  : "bg-orange-500/20 text-orange-600 border border-orange-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {canClaimToday ? "✅ พร้อมรับของขวัญวันนี้" : "⏳ วันนี้รับของขวัญแล้ว"}
                  </span>
                </div>
                <button 
                  onClick={handleRefresh}
                  className="p-1 hover:bg-white/20 rounded transition"
                  title="รีเฟรช"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              
              {lastClaimDate && (
                <div className="mt-1 text-xs opacity-80">
                  รับล่าสุด: {new Date(lastClaimDate).toLocaleDateString('th-TH')}
                </div>
              )}

              {!canClaimToday && timeLeft && (
                <div className="mt-2 flex items-center gap-1 text-xs bg-black/10 p-2 rounded">
                  <Clock className="w-3 h-3" />
                  <span>รับอีกได้ใน: {timeLeft.hours} ชม. {timeLeft.minutes} นาที</span>
                </div>
              )}
            </div>

            {/* ปุ่มรับของขวัญ */}
            <button
              onClick={claimDailyGift}
              disabled={!canClaimToday || loading}
              className={`w-full py-3 rounded-xl font-bold shadow transition flex items-center justify-center gap-2 ${
                canClaimToday
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90 hover:scale-[1.02]"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              } ${loading ? "opacity-50" : ""}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Gift className="w-5 h-5" />
              )}
              {canClaimToday 
                ? (loading ? "กำลังรับ..." : "🎁 รับของขวัญวันนี้") 
                : "✅ รับแล้ว today"
              }
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2 text-sm text-red-400 hover:text-red-500 transition"
            >
              ออกจากระบบ
            </button>
          </div>
        )}

        {/* ============================= MESSAGE ============================= */}
        {message && (
          <div
            className={`mt-4 text-center p-3 rounded-xl text-sm font-medium animate-fadeIn ${
              message.includes("✅") || message.includes("สำเร็จ")
                ? "bg-green-100 text-green-700"
                : message.includes("⏳") || message.includes("รอ")
                ? "bg-orange-100 text-orange-700"
                : message.includes("⚠️") || message.includes("อัพเดต")
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {message.includes("⚠️") && <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftModal;