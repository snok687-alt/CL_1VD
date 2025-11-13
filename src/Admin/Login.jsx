import { useState } from "react";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://47.238.3.148/backend-api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);
      
      if (res.ok) {
        // ✅ บันทึก token
        localStorage.setItem("token", data.token);
        setMessage("✅ ເຂົ້າລະບົບສຳເລັດ");
        
        // ✅ ใช้ window.location.replace เพื่อป้องกัน history issue
        setTimeout(() => {
          window.location.replace("/CL_____________________________________________________________________________________******_/Admin");
        }, 500);
        
      } else {
        setMessage(data.message || "ຊື່ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("ຜິດພາດໃນການເຂົ້າລະບົບ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          ເຂົ້າລະບົບ
        </h2>

        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="ຊື່ຜູ້ໃຊ້"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            placeholder="ລະຫັດຜ່ານ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
        >
          ເຂົ້າລະບົບ
        </button>

        {message && (
          <p className={`text-center mt-2 text-sm ${
            message.includes('✅') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}