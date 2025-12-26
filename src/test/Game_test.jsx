import React, { useState } from "react";

function Game_test() {
  const navItems = [
    { label: "真人", icon: "🎲" },
    { label: "电子", icon: "🎮" },
    { label: "棋牌", icon: "♟️" },
    { label: "彩票", icon: "🎫" },
    { label: "体育", icon: "⚽" },
    { label: "捕鱼", icon: "🎣" },
    { label: "电竞", icon: "🕹️" },
  ];

  const cardItems = [
    { label: "AG真人", img: "https://i.imgur.com/8DkQAj5.png" },
    { label: "BBIN 真人", img: "https://i.imgur.com/68a4Ltg.png" },
    { label: "MG 真人", img: "https://i.imgur.com/0uqLqQg.png" },
    { label: "AG 真人", img: "https://i.imgur.com/cV3Gdxx.png" },
    { label: "GG 真人", img: "https://i.imgur.com/EG7Peuc.png" },
    { label: "BG 真人", img: "https://i.imgur.com/BX0Q6Yf.png" },
    { label: "CQ9 真人", img: "https://i.imgur.com/Fb4p6NE.png" },
    { label: "DG 真人", img: "https://i.imgur.com/3vl5oOI.png" },
    { label: "eBet 真人", img: "https://i.imgur.com/9d7mcaQ.png" },
    { label: "欧博 真人", img: "https://i.imgur.com/FlBAXTx.png" },
  ];

  const footerItems = [
    {
      label: "首页",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      label: "优惠",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      label: "客服",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M18 12l-6-6v12z" />
        </svg>
      ),
    },
    {
      label: "存款",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
    },
    {
      label: "我的",
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
        </svg>
      ),
    },
  ];

  const [activeNav, setActiveNav] = useState("真人");
  const [activeFooter, setActiveFooter] = useState("首页");

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      {/* Header Banner */}
      <header className="p-2">
        <img
          src="https://i.imgur.com/oL6Lx0D.png"
          alt="Banner"
          className="w-full rounded-lg"
        />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 border border-gray-200 rounded-lg overflow-hidden">
        {/* Sidebar Nav */}
        <nav className="w-20 bg-gray-100 flex flex-col gap-3 p-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`flex flex-col items-center p-2 rounded-xl text-sm font-semibold
                ${
                  activeNav === item.label
                    ? "bg-blue-300 text-blue-900"
                    : "text-gray-600 hover:bg-blue-100"
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Grid Cards */}
        <section className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto bg-gray-50">
          {cardItems.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-md cursor-pointer flex flex-col items-center p-2"
            >
              <img
                src={card.img}
                alt={card.label}
                className="rounded-xl mb-2 max-h-32 object-contain"
              />
              <div className="font-semibold text-gray-800 text-center">
                {card.label}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="flex justify-around items-center bg-white border-t border-gray-300 py-2 mt-2 rounded-lg">
        {footerItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveFooter(item.label)}
            className={`flex flex-col items-center text-xs text-gray-600 hover:text-blue-700 ${
              activeFooter === item.label ? "text-blue-700" : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </footer>
    </div>
  );
}

export default Game_test;