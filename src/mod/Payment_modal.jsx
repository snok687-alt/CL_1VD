import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaTimes,
  FaStar
} from "react-icons/fa";

import Type_Pay from "./Type_Pay";

function PaymentModal({ videoId, onPaymentSuccess, onClose }) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [priceData, setPriceData] = useState(null);
  const [pricingEnabled, setPricingEnabled] = useState(false);

  const [activeTab, setActiveTab] = useState("money");
  const [userStamp, setUserStamp] = useState(0);
  const requiredStamp = 50;

  useEffect(() => {
    if (open && videoId) {
      fetchDisplayPricing();
      fetchStamp();
    }
  }, [open, videoId]);

  const fetchStamp = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("/backend-api/user/stamp", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStamp(data.stamp);
      }
    } catch (error) {
      console.error("加载积分失败:", error);
    }
  };

  const fetchDisplayPricing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/backend-api/video/pricing/display/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setPricingEnabled(data.pricingEnabled);
        setPriceData(data.prices);
      }
    } catch (error) {
      console.error("错误:", error);
      setPricingEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("请先登录");
        return;
      }

      const response = await fetch('/backend-api/video/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          video_id: parseInt(videoId),
          amount: selectedPrice.amount,
          days: selectedPrice.days,
          price_key: selectedPrice.key,
          payment_method: paymentMethod
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`支付成功 ¥${selectedPrice.amount}`);
        setOpen(false);
        onPaymentSuccess?.(result);
        onClose?.();
      } else {
        throw new Error(result.message || "支付失败");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemWithStamp = async () => {
    try {
      if (userStamp < requiredStamp) return alert("积分不足！");

      const token = localStorage.getItem("token");
      if (!token) return alert("请先登录");

      setLoading(true);
      const response = await fetch("/backend-api/video/redeem-stamp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          video_id: parseInt(videoId),
          cost: requiredStamp
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("使用积分兑换成功！");
        setOpen(false);
        onPaymentSuccess?.(result);
        onClose?.();
      } else {
        throw new Error(result.message || "兑换失败");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const pricePackages = priceData
    ? [
        { key: "price_1", ...priceData.price_1, label: "1 天" },
        { key: "price_7", ...priceData.price_7, label: "7 天" },
        { key: "price_30", ...priceData.price_30, label: "30 天" },
        { key: "price_90", ...priceData.price_90, label: "90 天" },
        { key: "price_180", ...priceData.price_180, label: "180 天" },
        { key: "price_365", ...priceData.price_365, label: "365 天" }
      ]
    : [];

  const leftColumn = pricePackages.slice(0, 3);
  const rightColumn = pricePackages.slice(3);

  const PriceCard = ({ price }) => (
    <button
      onClick={() => {
        if (price.enabled) {
          setSelectedPrice(price);
          setStep(2);
        }
      }}
      disabled={loading || !price.enabled}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
        !price.enabled
          ? "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed"
          : "border-blue-400 bg-blue-50 hover:bg-blue-100 hover:shadow-md cursor-pointer"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-2xl font-bold text-blue-600">¥{price.amount}</div>
          <div className="text-sm text-gray-600">{price.label}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">{price.days} 天</div>
          <div className="text-xs text-blue-500 font-medium">
            ¥{(price.amount / price.days).toFixed(2)}/天
          </div>
        </div>
      </div>
      <div className="text-xs text-center py-1 rounded bg-blue-600 text-white font-medium">
        {!price.enabled ? "不可用" : "选择套餐"}
      </div>
    </button>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-3xl" />
            <h2 className="text-2xl font-bold">支付观看视频</h2>
          </div>
          <button onClick={handleClose}>
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              {/* TABS */}
              <div className="flex border-b mb-6">
                <button
                  className={`flex-1 p-4 text-center font-bold ${
                    activeTab === "money"
                      ? "bg-blue-100 border-b-4 border-blue-600"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("money")}
                >
                  💴 使用人民币
                </button>

                <button
                  className={`flex-1 p-4 text-center font-bold ${
                    activeTab === "stamp"
                      ? "bg-purple-100 border-b-4 border-purple-600"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("stamp")}
                >
                  ⭐ 使用积分
                </button>
              </div>

              {/* MONEY TAB */}
              {activeTab === "money" && (
                <>
                  {!pricingEnabled ? (
                    <div className="text-center py-12">
                      <h3 className="text-2xl font-bold text-gray-800">该视频免费！</h3>
                      <button
                        onClick={handleClose}
                        className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg"
                      >
                        直接观看
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-4 text-center">
                        选择支付套餐
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {leftColumn.map((price) => (
                            <PriceCard key={price.key} price={price} />
                          ))}
                        </div>
                        <div className="space-y-3">
                          {rightColumn.map((price) => (
                            <PriceCard key={price.key} price={price} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* STAMP TAB */}
              {activeTab === "stamp" && (
                <div className="text-center py-8">
                  <FaStar className="text-5xl text-yellow-400 mx-auto mb-4" />

                  <h3 className="text-xl font-bold mb-2">使用积分兑换观看</h3>

                  <p className="text-gray-600 mb-4">
                    当前积分： <b>{userStamp}</b>
                  </p>

                  <p className="text-lg font-bold mb-6">
                    需要积分： <span className="text-purple-600">{requiredStamp}</span>
                  </p>

                  <button
                    disabled={userStamp < requiredStamp || loading}
                    onClick={handleRedeemWithStamp}
                    className={`px-6 py-3 rounded-lg text-white text-lg ${
                      userStamp >= requiredStamp
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "处理中..." : "使用积分兑换"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <Type_Pay
              amount={selectedPrice?.amount}
              onMethodSelected={(method) => {
                setPaymentMethod(method);
                handleConfirmPayment();
              }}
              onBack={() => setStep(1)}
            />
          )}
        </div>

        <div className="border-t p-4 text-right">
          <button onClick={handleClose} className="px-6 py-2">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
