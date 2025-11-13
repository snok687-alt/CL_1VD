import { useState } from "react";
import { User, Lock, Shield, Camera, X } from "lucide-react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // สร้าง URL สำหรับแสดงภาพตัวอย่าง
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // สร้าง FormData สำหรับส่งไฟล์ภาพ
      const formData = new FormData();
      formData.append("name", name);
      formData.append("password", password);
      formData.append("role", role);
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("http://47.238.3.148/backend-api/user/register", {
        method: "POST",
        body: formData,
        // ไม่ต้องกำหนด header Content-Type เมื่อใช้ FormData
        // browser จะกำหนดให้อัตโนมัติพร้อม boundary
      });

      const data = await res.json();
      setMessage(data.message);

      // รีเซ็ตฟอร์มหลังการสมัครสำเร็จ
      if (res.ok) {
        setName("");
        setPassword("");
        setRole("user");
        removeImage();
      }
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
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          ສະໝັກສະມາຊິກ
        </h2>

        {/* ส่วนอัพโหลดรูปภาพ */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition">
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <Camera className="text-gray-400" size={32} />
                )}
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            ຄລິກເພື່ອເລືອກຮູບພາບຂອງທ່ານ
          </p>
        </div>

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