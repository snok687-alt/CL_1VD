import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom"

function Game() {
  const [visible, setVisible] = useState(true);
  const [showClose, setShowClose] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowClose(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative w-full max-w-auto mx-auto md:hidden rounded-xl overflow-hidden shadow-lg bg-gradient-to-r from-white to-blue-50">
      {/* ปุ่มปิด */}
      {showClose && (
        <button
          onClick={() => setVisible(false)}
          className="absolute top-0 right-0 text-gray-600 hover:text-red-600 bg-white/70 hover:bg-white rounded-full text-4xl flex items-center justify-center z-10"
        >
          ✕
        </button>
      )}

      {/* รูปภาพ + ลิงก์ */}
      <Link to={"/Gaming"}
      >
        <img
          src="https://image-sj.ng-demo.xyz/image//defaultImg/live/1.png"
          alt="AG真人"
          className="w-full object-cover"
        />
      </Link>

      {/* 🔹 ข้อความด้านบนตรงกลางภาพ */}
      <div className="absolute top-15 left-18 transform -translate-x-1/2 text-left">
        <h2 className="text-lg font-bold text-blue-600">AG真人</h2>
        <p className="text-xs text-blue-400">AG CASINO</p>
      </div>
    </div>
  );
}

export default Game;
