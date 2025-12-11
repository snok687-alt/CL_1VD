import React, { useState } from "react";
import { FaQrcode, FaMobileAlt, FaCreditCard, FaUniversity } from "react-icons/fa";

function Type_Pay({ amount, onMethodSelected, onBack }) {
  const [selected, setSelected] = useState(null);

  const paymentMethods = [
    {
      key: "promptpay",
      label: "PromptPay",
      icon: <FaQrcode className="text-3xl text-blue-600" />
    },
    {
      key: "wallet",
      label: "TrueMoney 钱包",
      icon: <FaMobileAlt className="text-3xl text-orange-500" />
    },
    {
      key: "credit",
      label: "信用卡 / 借记卡",
      icon: <FaCreditCard className="text-3xl text-purple-600" />
    },
    {
      key: "bank",
      label: "银行转账",
      icon: <FaUniversity className="text-3xl text-green-600" />
    }
  ];

  const choose = (method) => {
    setSelected(method.key);
    setTimeout(() => {
      onMethodSelected?.(method.key);
    }, 200);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-center">选择支付方式</h2>

      <p className="text-center text-gray-600 mb-6">
        需支付金额：
        <span className="font-bold text-blue-600">¥{amount}</span>
      </p>

      <div className="grid grid-cols-2 gap-4">
        {paymentMethods.map((m) => (
          <button
            key={m.key}
            onClick={() => choose(m)}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
              selected === m.key
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
          >
            {m.icon}
            <span className="font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          返回
        </button>
      </div>
    </div>
  );
}

export default Type_Pay;
