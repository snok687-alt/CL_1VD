import { useState } from "react";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ใช้ relative path แทน absolute URL
      const res = await fetch("/backend-api/user/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();
      console.log("✅ Login response:", data);
      
      if (res.ok && data.token) {
        // ✅ บันทึก token ลง localStorage
        localStorage.setItem("token", data.token);
        console.log("✅ Token ถูกบันทึกแล้ว:", data.token.substring(0, 20) + "...");
        
        setMessage("✅ ເຂົ້າລະບົບສຳເລັດ");
        
        // ✅ รอสักครู่แล้ว redirect
        setTimeout(() => {
          window.location.href = "/CL_____________________________________________________________________________________******_/Admin";
        }, 1000);
        
      } else {
        setMessage(data.message || "ຊື່ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
        console.log("❌ Login failed:", data);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setMessage("ຜິດພາດໃນການເຂົ້າລະບົບ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ເຂົ້າລະບົບ
          </h2>
          <p className="text-gray-600 text-sm">
            ກະລຸນາໃສ່ຊື່ ແລະ ລະຫັດຜ່ານ
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="ຊື່ຜູ້ໃຊ້"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="password"
              placeholder="ລະຫັດຜ່ານ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              required
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ກຳລັງເຂົ້າລະບົບ...
            </>
          ) : (
            "ເຂົ້າລະບົບ"
          )}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-center text-sm font-medium ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          ຖ້າລືມລະຫັດຜ່ານ ກະລຸນາຕິດຕໍ່ເຈົ້າໜ້າທີ່
        </div>
      </form>
    </div>
  );
}