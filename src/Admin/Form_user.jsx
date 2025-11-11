import { useState } from "react";
import { User, Lock, Shield } from "lucide-react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://47.238.3.148/backend-api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, role }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Register error:", error);
      setMessage("ຜິດພາດໃນການສະໝັກ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          ສະໝັກສະມາຊິກ
        </h2>

        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="ຊື່ຜູ້ໃຊ້"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
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
          />
        </div>

        <div className="relative">
          <Shield className="absolute left-3 top-3 text-gray-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
        >
          ສະໝັກສະມາຊິກ
        </button>

        {message && (
          <p className="text-center mt-2 text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
