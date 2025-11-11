import { useState } from "react";

export default function AddLinkForm() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://47.238.3.148/backend-api/links/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, description }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ เพิ่มลิงก์สำเร็จ!");
        setUrl("");
        setDescription("");
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">เพิ่มลิงก์ใหม่</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="คำอธิบาย (ไม่บังคับ)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          เพิ่มลิงก์
        </button>
      </form>
      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
}
