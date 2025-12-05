import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaLock, FaCreditCard, FaShieldAlt } from "react-icons/fa";

function PaymentModal({ videoId, onPaymentSuccess, onClose }) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [pricingEnabled, setPricingEnabled] = useState(false);

  // ดึงข้อมูลราคา
  useEffect(() => {
    if (open && videoId) {
      fetchPricingData();
    }
  }, [open, videoId]);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/backend-api/video/pricing/settings/${videoId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPricingEnabled(data.pricingEnabled);
        setPriceData(data.basePrices);
      }
    } catch (error) {
      console.error('Error:', error);
      setPricingEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (priceOption) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('กรุณาล็อกอินก่อนชำระเงิน');
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
          amount: priceOption.amount,
          days: priceOption.days,
          price_key: priceOption.key
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        Swal.fire('สำเร็จ!', `ชำระเงิน ¥${priceOption.amount} สำเร็จ`, 'success');
        setOpen(false);
        if (onPaymentSuccess) onPaymentSuccess(result);
        if (onClose) onClose();
      } else {
        throw new Error(result.message || 'การชำระเงินล้มเหลว');
      }

    } catch (error) {
      Swal.fire('ผิดพลาด!', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  // แพ็กเกจทั้งหมด 6 รายการ
  const allPackages = [
    { key: 'price_1', amount: 1, days: 1, label: '1 วัน' },
    { key: 'price_7', amount: 7, days: 7, label: '7 วัน' },
    { key: 'price_30', amount: 30, days: 30, label: '30 วัน' },
    { key: 'price_90', amount: 90, days: 90, label: '90 วัน' },
    { key: 'price_180', amount: 180, days: 180, label: '180 วัน' },
    { key: 'price_365', amount: 365, days: 365, label: '365 วัน' }
  ];

  // ผสานข้อมูลกับ API
  const pricePackages = allPackages.map(pkg => {
    const apiData = priceData?.[pkg.key];
    return {
      ...pkg,
      amount: apiData?.amount || pkg.amount,
      days: apiData?.days || pkg.days,
      enabled: apiData?.enabled || false
    };
  });

  // แบ่ง 2 columns
  const leftColumn = pricePackages.slice(0, 3);
  const rightColumn = pricePackages.slice(3);

  const PriceCard = ({ price }) => (
    <button
      onClick={() => price.enabled && handlePayment(price)}
      disabled={loading || !price.enabled}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
        !price.enabled 
          ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed' 
          : 'border-blue-400 bg-blue-50 hover:bg-blue-100 hover:shadow-md cursor-pointer'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-xl font-bold text-gray-800">¥{price.amount}</div>
          <div className="text-sm font-semibold text-gray-700">{price.label}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">{price.days} วัน</div>
          <div className="text-sm text-green-600">¥{(price.amount/price.days).toFixed(2)}/วัน</div>
        </div>
      </div>
      
      <div className={`text-center py-2 rounded font-semibold ${
        !price.enabled ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}>
        {!price.enabled ? 'ปิดใช้งาน' : loading ? 'กำลังประมวลผล...' : 'เลือกแพ็กเกจ'}
      </div>
    </button>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl">
        
        {/* Header */}
        <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <FaLock className="mr-2" />
            ชำระเงินเพื่อดูวิดีโอ
          </h2>
          <button onClick={handleClose} className="text-white text-2xl">✕</button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && !priceData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p>กำลังโหลด...</p>
            </div>
          ) : !pricingEnabled ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">วิดีโอนี้ฟรี!</h3>
              <p className="text-gray-600 mb-4">คุณสามารถดูวิดีโอนี้ได้โดยไม่ต้องชำระเงิน</p>
              <button onClick={handleClose} className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                ดูวิดีโอเลย
              </button>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-700 mb-6">เลือกแพ็กเกจที่ต้องการ</p>
              
              {/* 2 Columns */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mb-6">
                <div className="space-y-4">
                  {leftColumn.map(price => <PriceCard key={price.key} price={price} />)}
                </div>
                <div className="space-y-4">
                  {rightColumn.map(price => <PriceCard key={price.key} price={price} />)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {pricingEnabled && (
          <div className="border-t p-4 bg-gray-50 rounded-b-lg">
            <button onClick={handleClose} className="text-gray-600 hover:text-gray-800">
              ยกเลิก
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;