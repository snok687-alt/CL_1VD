import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaLock } from "react-icons/fa";

function PaymentModal({ videoId, onPaymentSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [pricingEnabled, setPricingEnabled] = useState(false);

  // ดึงข้อมูลราคาเมื่อเปิด modal
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
        
        if (data.success && data.pricingEnabled) {
          setPricingEnabled(true);
          setPriceData(data.basePrices);
        } else {
          setPricingEnabled(false);
          setPriceData(null);
        }
      }
    } catch (error) {
      console.error('โหลดข้อมูลราคาไม่สำเร็จ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (priceOption) => {
    try {
      setLoading(true);
      
      // จำลองการชำระเงิน (ควรเชื่อมต่อกับ API จริง)
      const response = await fetch('/backend-api/video/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          video_id: videoId,
          amount: priceOption.amount,
          days: priceOption.days
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // แจ้งเตือนสำเร็จ
        alert(`ชำระเงินสำเร็จ!\nจำนวน: ${priceOption.amount} บาท\nระยะเวลา: ${priceOption.days} วัน`);
        
        setOpen(false);
        
        // เรียก callback เมื่อชำระเงินสำเร็จ
        if (onPaymentSuccess) {
          onPaymentSuccess(result);
        }
      } else {
        throw new Error('การชำระเงินล้มเหลว');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการชำระเงิน:', error);
      alert('เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // กรองเฉพาะราคาที่เปิดใช้งาน
  const getEnabledPrices = () => {
    if (!priceData) return [];
    
    return Object.entries(priceData)
      .filter(([key, price]) => price.enabled && price.amount > 0)
      .map(([key, price]) => ({
        key,
        amount: price.amount,
        days: price.days
      }));
  };

  const enabledPrices = getEnabledPrices();

  return (
    <div>
      {/* ปุ่มไอคอน */}
      <button 
        onClick={() => setOpen(true)} 
        className="text-2xl p-2 hover:text-green-600 transition-colors"
        title="ชำระเงินเพื่อดูวิดีโอ"
      >
        <FaMoneyBillWave />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center">
                  <FaLock className="mr-2" />
                  เลือกแพ็กเกจการดู
                </h2>
                <button 
                  onClick={() => setOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                  <span className="ml-3 text-gray-600">กำลังโหลด...</span>
                </div>
              ) : !pricingEnabled || enabledPrices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">วิดีโอนี้ฟรี!</h3>
                  <p className="text-gray-600">คุณสามารถดูวิดีโอนี้ได้โดยไม่ต้องชำระเงิน</p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    ดูวิดีโอเลย
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4 text-center">
                    เลือกระยะเวลาที่ต้องการดูวิดีโอ
                  </p>

                  {/* แสดงตัวเลือกราคา */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {enabledPrices.map((price, index) => (
                      <button
                        key={price.key}
                        onClick={() => handlePayment(price)}
                        disabled={loading}
                        className={`relative border-2 p-4 rounded-lg text-center hover:shadow-lg transition-all transform hover:-translate-y-1 ${
                          index % 2 === 0
                            ? 'border-green-500 hover:bg-green-50'
                            : 'border-emerald-500 hover:bg-emerald-50'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="text-2xl font-bold text-gray-800">
                          ¥{price.amount}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {price.days} วัน
                        </div>
                        {price.days >= 30 && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                            คุ้มที่สุด
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* ข้อมูลเพิ่มเติม */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium mb-1">ข้อมูลสำคัญ:</p>
                        <ul className="space-y-1">
                          <li>• สามารถดูได้ไม่จำกัดครั้งในช่วงเวลาที่กำหนด</li>
                          <li>• ราคาเป็นหยวน (¥) สามารถชำระผ่านช่องทางต่างๆ</li>
                          <li>• เมื่อหมดเวลาสามารถต่ออายุได้</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {pricingEnabled && enabledPrices.length > 0 && (
              <div className="border-t p-4 bg-gray-50 rounded-b-lg">
                <button 
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentModal;