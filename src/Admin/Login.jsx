import { useState, useEffect } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!username.trim()) {
      setProfileImage(null);
      setMessage(""); // เคลียร์ข้อความ
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setCheckingProfile(true);

      try {
        const res = await fetch("/backend-api/user/check-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (data.profile_image) {
            setProfileImage(`http://47.238.3.148${data.profile_image}?t=${Date.now()}`);
          } else {
            setProfileImage(null);
          }
          setMessage(""); // ล้างข้อความ
        } else if (res.status === 404) {
          setProfileImage(null);
          setMessage("ບໍ່ພົບຊື່ນີ້"); // แสดงข้อความเมื่อไม่พบ
        } else {
          setProfileImage(null);
          setMessage(""); // หรือข้อความอื่น ๆ ถ้าต้องการ
        }

      } catch (e) {
        setProfileImage(null);
        setMessage(""); // เกิด error ไม่แสดงข้อความ
      }

      setCheckingProfile(false);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [username]);



  // 👉 ฟังก์ชัน Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/backend-api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setMessage("✅ ເຂົ້າລະບົບສຳເລັດ");

        setTimeout(() => {
          window.location.href = "/CL_____________________________________________________________________________________******_/Admin";
        }, 800);
      } else {
        setMessage(data.message || "ຊື່ ຫຼື ລະຫັດຜ່ານຜິດ");
      }
    } catch (error) {
      setMessage("ເກີດຂໍ້ຜິດພາດ");
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">

      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        {/* Header */}
        <div className="text-center">

          <div className="w-28 h-28 mx-auto mb-3 relative">
            {checkingProfile ? (
              <div className="w-full h-full rounded-full bg-gray-200 animate-pulse"></div>
            ) : profileImage ? (
              <img
                src={profileImage}
                className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center shadow-lg border-4 border-white">
                <User className="w-14 h-14 text-gray-400" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">ເຂົ້າລະບົບ</h2>
          <p className="text-gray-500">ຍິນດີຕ້ອນຮັບກັບຄືນ</p>

          {username && (
            <div className="mt-2 font-semibold text-gray-700">{username}</div>
          )}
        </div>

        {/* Username */}
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="ຊື່ຜູ້ໃຊ້"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-purple-600 outline-none"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="ລະຫັດຜ່ານ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-3 focus:ring-2 focus:ring-purple-600 outline-none"
            required
          />

          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "ກຳລັງເຂົ້າ..." : "ເຂົ້າລະບົບ"}
        </button>

        {message && (
          <div className={`p-3 text-center rounded-lg text-sm font-medium 
            ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          `}>
            {message}
          </div>
        )}

      </form>
    </div>
  );
}
