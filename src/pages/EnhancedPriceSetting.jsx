import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const EnhancedPriceSetting = ({ isDarkMode }) => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState(
    location.state?.autoOpenBulkTab ? 'bulk' : 'single'
  );
  
  // ✅ 6 ราคาแบบตายตัวเท่านั้น
  const [pricingEnabled, setPricingEnabled] = useState(false);
  const [basePrices, setBasePrices] = useState({
    price_1: { amount: 1, days: 1, enabled: false },
    price_7: { amount: 7, days: 7, enabled: false },
    price_30: { amount: 30, days: 30, enabled: false },
    price_90: { amount: 90, days: 90, enabled: false },
    price_180: { amount: 180, days: 180, enabled: false },
    price_365: { amount: 365, days: 365, enabled: false }
  });

  // ✅ 6 ราคาแบบตายตัวสำหรับการตั้งค่าแบบกลุ่ม
  const [bulkPricing, setBulkPricing] = useState({
    enabled: false,
    priceTemplates: {
      template_1: { amount: 1, days: 1, enabled: false },
      template_7: { amount: 7, days: 7, enabled: false },
      template_30: { amount: 30, days: 30, enabled: false },
      template_90: { amount: 90, days: 90, enabled: false },
      template_180: { amount: 180, days: 180, enabled: false },
      template_365: { amount: 365, days: 365, enabled: false }
    },
    applyToAll: true
  });

  useEffect(() => {
    if (location.state?.autoOpenBulkTab) {
      setActiveTab('bulk');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ โหลดข้อมูลเมื่อเปลี่ยน tab หรือ videoId
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'single' && videoId) {
          await loadPriceSettings(videoId);
        } else if (activeTab === 'bulk') {
          await loadBulkPriceSettings();
        }
      } catch (error) {
        console.error('❌ ข้อผิดพลาดในการโหลดข้อมูล:', error);
        Swal.fire('ข้อผิดพลาด', 'โหลดข้อมูลล้มเหลว', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [videoId, activeTab]);

  // ✅ โหลดการตั้งค่าราคาจากฐานข้อมูล
  const loadPriceSettings = async (id) => {
    try {
      const response = await fetch(`/backend-api/video/pricing/settings/${id}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // ✅ ตั้งค่าข้อมูลวิดีโอ
          if (data.videoInfo) {
            setVideo(data.videoInfo);
          }
          
          // ✅ ตั้งค่าสถานะการเปิดใช้งาน
          setPricingEnabled(data.pricingEnabled || false);
          
          // ✅ ตั้งค่าราคาจากฐานข้อมูล (6 ราคาเท่านั้น)
          if (data.basePrices) {
            setBasePrices(data.basePrices);
          }
          
          console.log('✅ โหลดการตั้งค่าราคาจากฐานข้อมูลเรียบร้อยแล้ว:', data.basePrices);
        }
      } else {
        throw new Error('โหลดการตั้งค่าราคาล้มเหลว');
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการโหลดการตั้งค่าราคา:', error);
      // หากโหลดไม่สำเร็จ ให้ใช้ค่าเริ่มต้น
      if (videoId) {
        await loadVideoInfo(videoId);
      }
    }
  };

  // ✅ โหลดข้อมูลวิดีโอ
  const loadVideoInfo = async (id) => {
    try {
      const response = await fetch(`/backend-api/videos/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVideo(data.video);
        }
      }
    } catch (error) {
      console.error('ข้อผิดพลาดในการโหลดข้อมูลวิดีโอ:', error);
    }
  };

  // ✅ โหลดการตั้งค่าราคาแบบกลุ่ม
  const loadBulkPriceSettings = async () => {
    try {
      const response = await fetch('/backend-api/video/pricing/bulk-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bulkPricing) {
          setBulkPricing(data.bulkPricing);
          console.log('✅ โหลดการตั้งค่าราคาแบบกลุ่มเรียบร้อยแล้ว:', data.bulkPricing);
        }
      } else {
        throw new Error('โหลดการตั้งค่าแบบกลุ่มล้มเหลว');
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการโหลดการตั้งค่าราคาแบบกลุ่ม:', error);
    }
  };

  // ✅ จัดการการเปิด/ปิดราคา (6 ราคาเท่านั้น)
  const handleBasePriceToggle = (priceKey) => {
    setBasePrices(prev => ({
      ...prev,
      [priceKey]: {
        ...prev[priceKey],
        enabled: !prev[priceKey].enabled
      }
    }));
  };

  // ✅ จัดการการเปลี่ยนแปลงราคา (6 ราคาเท่านั้น)
  const handleBasePriceChange = (priceKey, field, value) => {
    setBasePrices(prev => ({
      ...prev,
      [priceKey]: {
        ...prev[priceKey],
        [field]: field === 'amount' ? parseFloat(value) || 0 : parseInt(value) || 0
      }
    }));
  };

  // ✅ จัดการการเปิด/ปิดราคาแบบกลุ่ม (6 ราคาเท่านั้น)
  const handleBulkTemplateToggle = (templateKey) => {
    setBulkPricing(prev => ({
      ...prev,
      priceTemplates: {
        ...prev.priceTemplates,
        [templateKey]: {
          ...prev.priceTemplates[templateKey],
          enabled: !prev.priceTemplates[templateKey].enabled
        }
      }
    }));
  };

  // ✅ จัดการการเปลี่ยนแปลงราคาแบบกลุ่ม (6 ราคาเท่านั้น)
  const handleBulkTemplateChange = (templateKey, field, value) => {
    setBulkPricing(prev => ({
      ...prev,
      priceTemplates: {
        ...prev.priceTemplates,
        [templateKey]: {
          ...prev.priceTemplates[templateKey],
          [field]: field === 'amount' ? parseFloat(value) || 0 : parseInt(value) || 0
        }
      }
    }));
  };

  // ✅ บันทึกการตั้งค่าทั้งหมด (6 ราคาเท่านั้น)
  const handleSaveAllSettings = async () => {
    try {
      setSaving(true);
      
      let settingsData;
      const token = localStorage.getItem('token');

      if (activeTab === 'single') {
        if (!videoId) {
          Swal.fire({
            icon: 'error',
            title: 'บันทึกล้มเหลว',
            text: 'ไอดีวิดีโอไม่สมบูรณ์ ไม่สามารถบันทึกการตั้งค่า',
            confirmButtonText: 'ตกลง'
          });
          return;
        }

        // ✅ ข้อมูลสำหรับวิดีโอเดียว (6 ราคาเท่านั้น)
        settingsData = {
          settingType: 'single',
          video_id: parseInt(videoId),
          pricingEnabled: pricingEnabled,
          basePrices: basePrices
        };

        console.log('📤 ส่งการตั้งค่าวิดีโอเดียว:', settingsData);
      } else {
        // ✅ ข้อมูลสำหรับแบบกลุ่ม (6 ราคาเท่านั้น)
        settingsData = {
          settingType: 'bulk',
          bulkPricing: {
            enabled: true,
            priceTemplates: bulkPricing.priceTemplates,
            applyToAll: true
          }
        };

        console.log('📤 ส่งการตั้งค่าราคาแบบกลุ่ม:', settingsData);
      }

      const response = await fetch('/backend-api/video/pricing/save-all', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsData)
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: activeTab === 'single' 
            ? 'บันทึกการตั้งค่าราคาวิดีโอเรียบร้อยแล้ว' 
            : `บันทึกการตั้งค่าราคาแบบกลุ่มเรียบร้อยแล้ว ใช้กับวิดีโอ ${result.totalVideos || 'ทั้งหมด'} รายการ`,
          confirmButtonText: 'ตกลง'
        });
        
        console.log('✅ บันทึกสำเร็จ:', result);
      } else {
        throw new Error(result.message || 'บันทึกล้มเหลว');
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการบันทึกการตั้งค่า:', error);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกล้มเหลว',
        text: error.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ ส่งออกการตั้งค่า
  const handleExportSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/backend-api/video/pricing/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoIds: activeTab === 'single' && videoId ? [parseInt(videoId)] : []
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // สร้างและดาวน์โหลดไฟล์ JSON
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pricing-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Swal.fire('ส่งออกสำเร็จ', 'ส่งออกการตั้งค่าราคาเป็นไฟล์ JSON เรียบร้อยแล้ว', 'success');
      } else {
        throw new Error(result.message || 'ส่งออกล้มเหลว');
      }
    } catch (error) {
      console.error('ข้อผิดพลาดในการส่งออก:', error);
      Swal.fire('ส่งออกล้มเหลว', error.message, 'error');
    }
  };

  // ✅ นำเข้าข้อมูล
  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        
        Swal.fire({
          title: 'ยืนยันการนำเข้า',
          text: `แน่ใจหรือไม่ที่จะนำเข้าการตั้งค่าราคา?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'นำเข้า',
          cancelButtonText: 'ยกเลิก'
        }).then((result) => {
          if (result.isConfirmed) {
            if (importedSettings.settingType === 'single') {
              setPricingEnabled(importedSettings.pricingEnabled);
              setBasePrices(importedSettings.basePrices);
            } else if (importedSettings.bulkPricing) {
              setBulkPricing(importedSettings.bulkPricing);
            }
            Swal.fire('นำเข้าแล้ว', 'นำเข้าการตั้งค่าราคาเรียบร้อยแล้ว', 'success');
          }
        });
      } catch (error) {
        Swal.fire('ข้อผิดพลาด', 'รูปแบบไฟล์นำเข้าไม่ถูกต้อง', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            {activeTab === 'single' ? 'กำลังโหลดการตั้งค่าราคาวิดีโอ...' : 'กำลังโหลดการตั้งค่าแบบกลุ่ม...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate('/video-management')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200 border'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับไปจัดการวิดีโอ
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={handleExportSettings}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ส่งออกการตั้งค่า
              </button>
              
              <label className={`flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200 border'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                นำเข้าข้อมูล
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Video Info - แสดงเฉพาะในโหมดวิดีโอเดียว */}
          {activeTab === 'single' && video && (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex items-start space-x-6">
                {video.thumbnail && (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-24 h-18 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>ไอดีวิดีโอ:</span>
                      <span className="ml-2 font-mono">{video.id}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>หมวดหมู่:</span>
                      <span className="ml-2">{video.category}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>สถานะการชำระเงิน:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        pricingEnabled 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {pricingEnabled ? 'เปิดใช้งานแล้ว' : 'ยังไม่ได้เปิดใช้งาน'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>อัพเดตล่าสุด:</span>
                      <span className="ml-2 text-sm">
                        {new Date().toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header สำหรับโหมด Bulk */}
          {activeTab === 'bulk' && (
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex items-start space-x-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-100'}`}>
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">การตั้งค่าราคาวิดีโอทั้งหมด</h1>
                  <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    ตั้งค่าแผนราคา 6 แบบแบบ統一สำหรับวิดีโอทั้งหมดในระบบ
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>ขอบเขตการใช้งาน:</span>
                      <span className="ml-2 font-semibold text-green-600">วิดีโอทั้งหมด</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>แผนราคา:</span>
                      <span className="ml-2">6 ราคาแบบตายตัว</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>ใช้งานอัตโนมัติ:</span>
                      <span className="ml-2 text-green-600">ใช่ (รวมถึงวิดีโอใหม่)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={`mb-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('single')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'single'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ตั้งค่าราคาวิดีโอเดียว
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'bulk'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                ตั้งค่าราคาวิดีโอทั้งหมด
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab 1: ตั้งค่าราคาวิดีโอเดียว - 6 ราคาเท่านั้น */}
            {activeTab === 'single' && (
              <div>
                {/* Main Switch สำหรับวิดีโอเดียว */}
                <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">เปิดใช้งานฟังก์ชันการชำระเงิน</h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        เมื่อเปิดใช้งาน ผู้ใช้จะต้องซื้อแพ็กเกจเพื่อดูวิดีโอนี้
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricingEnabled}
                        onChange={() => setPricingEnabled(!pricingEnabled)}
                        className="sr-only peer"
                      />
                      <div className={`w-14 h-7 rounded-full peer ${
                        pricingEnabled 
                          ? 'bg-blue-600' 
                          : 'bg-gray-200 dark:bg-gray-600'
                      } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all`}></div>
                    </label>
                  </div>
                </div>

                {pricingEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">การตั้งค่าแพ็กเกจราคา 6 แบบ</h3>
                      <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        แผนราคา 6 แบบแบบตายตัว
                      </span>
                    </div>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ตั้งค่าแพ็กเกจราคา 6 แบบที่แตกต่างกันสำหรับวิดีโอนี้ ข้อมูลจะถูกโหลดจากฐานข้อมูลและสามารถอัพเดตได้
                    </p>

                    {/* ✅ 6 ราคาแบบตายตัว */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {/* ราคาที่ 1: 1 วัน */}
                      <div className={`p-4 rounded-lg border transition-all ${
                        basePrices.price_1.enabled 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={basePrices.price_1.enabled}
                                onChange={() => handleBasePriceToggle('price_1')}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full peer ${
                                basePrices.price_1.enabled 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                            <span className={`font-medium ${basePrices.price_1.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                              แพ็กเกจ 1 วัน
                            </span>
                          </div>
                          {basePrices.price_1.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              เปิดใช้งานแล้ว
                            </span>
                          )}
                        </div>

                        {basePrices.price_1.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                              <input
                                type="number"
                                value={basePrices.price_1.amount}
                                onChange={(e) => handleBasePriceChange('price_1', 'amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                              <input
                                type="number"
                                value={basePrices.price_1.days}
                                onChange={(e) => handleBasePriceChange('price_1', 'days', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ราคาที่ 2: 7 วัน */}
                      <div className={`p-4 rounded-lg border transition-all ${
                        basePrices.price_7.enabled 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={basePrices.price_7.enabled}
                                onChange={() => handleBasePriceToggle('price_7')}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full peer ${
                                basePrices.price_7.enabled 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                            <span className={`font-medium ${basePrices.price_7.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                              แพ็กเกจ 7 วัน
                            </span>
                          </div>
                          {basePrices.price_7.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              เปิดใช้งานแล้ว
                            </span>
                          )}
                        </div>

                        {basePrices.price_7.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                              <input
                                type="number"
                                value={basePrices.price_7.amount}
                                onChange={(e) => handleBasePriceChange('price_7', 'amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                              <input
                                type="number"
                                value={basePrices.price_7.days}
                                onChange={(e) => handleBasePriceChange('price_7', 'days', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ราคาที่ 3: 30 วัน */}
                      <div className={`p-4 rounded-lg border transition-all ${
                        basePrices.price_30.enabled 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={basePrices.price_30.enabled}
                                onChange={() => handleBasePriceToggle('price_30')}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full peer ${
                                basePrices.price_30.enabled 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                            <span className={`font-medium ${basePrices.price_30.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                              แพ็กเกจ 30 วัน
                            </span>
                          </div>
                          {basePrices.price_30.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              เปิดใช้งานแล้ว
                            </span>
                          )}
                        </div>

                        {basePrices.price_30.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                              <input
                                type="number"
                                value={basePrices.price_30.amount}
                                onChange={(e) => handleBasePriceChange('price_30', 'amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                              <input
                                type="number"
                                value={basePrices.price_30.days}
                                onChange={(e) => handleBasePriceChange('price_30', 'days', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ราคาที่ 4: 90 วัน */}
                      <div className={`p-4 rounded-lg border transition-all ${
                        basePrices.price_90.enabled 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={basePrices.price_90.enabled}
                                onChange={() => handleBasePriceToggle('price_90')}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full peer ${
                                basePrices.price_90.enabled 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                            <span className={`font-medium ${basePrices.price_90.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                              แพ็กเกจ 90 วัน
                            </span>
                          </div>
                          {basePrices.price_90.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              เปิดใช้งานแล้ว
                            </span>
                          )}
                        </div>

                        {basePrices.price_90.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                              <input
                                type="number"
                                value={basePrices.price_90.amount}
                                onChange={(e) => handleBasePriceChange('price_90', 'amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                              <input
                                type="number"
                                value={basePrices.price_90.days}
                                onChange={(e) => handleBasePriceChange('price_90', 'days', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ราคาที่ 5: 180 วัน */}
                      <div className={`p-4 rounded-lg border transition-all ${
                        basePrices.price_180.enabled 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={basePrices.price_180.enabled}
                                onChange={() => handleBasePriceToggle('price_180')}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full peer ${
                                basePrices.price_180.enabled 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                            <span className={`font-medium ${basePrices.price_180.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                              แพ็กเกจ 180 วัน
                            </span>
                          </div>
                          {basePrices.price_180.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              เปิดใช้งานแล้ว
                            </span>
                          )}
                        </div>

                        {basePrices.price_180.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                              <input
                                type="number"
                                value={basePrices.price_180.amount}
                                onChange={(e) => handleBasePriceChange('price_180', 'amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                              <input
                                type="number"
                                value={basePrices.price_180.days}
                                onChange={(e) => handleBasePriceChange('price_180', 'days', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ราคาที่ 6: 365 วัน */}
                      <div className={`p-4 rounded-lg border transition-all ${
                        basePrices.price_365.enabled 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={basePrices.price_365.enabled}
                                onChange={() => handleBasePriceToggle('price_365')}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 rounded-full peer ${
                                basePrices.price_365.enabled 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-200 dark:bg-gray-600'
                              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            </label>
                            <span className={`font-medium ${basePrices.price_365.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                              แพ็กเกจ 365 วัน
                            </span>
                          </div>
                          {basePrices.price_365.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              เปิดใช้งานแล้ว
                            </span>
                          )}
                        </div>

                        {basePrices.price_365.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                              <input
                                type="number"
                                value={basePrices.price_365.amount}
                                onChange={(e) => handleBasePriceChange('price_365', 'amount', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                              <input
                                type="number"
                                value={basePrices.price_365.days}
                                onChange={(e) => handleBasePriceChange('price_365', 'days', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'bg-white border-gray-300'
                                }`}
                                min="1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className="font-semibold mb-2">สรุปการตั้งค่าราคา</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                        {Object.entries(basePrices).map(([key, price]) => (
                          <div key={key} className={`text-center p-2 rounded ${
                            price.enabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            <div className="font-medium">{price.days} วัน</div>
                            <div>{price.enabled ? `฿${price.amount}` : 'ยังไม่ได้เปิดใช้งาน'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: ตั้งค่าราคาวิดีโอทั้งหมด - 6 ราคาเท่านั้น */}
            {activeTab === 'bulk' && (
              <div>
                <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">การตั้งค่าราคาวิดีโอทั้งหมด</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        การตั้งค่านี้จะถูกนำไปใช้กับวิดีโอทั้งหมดในระบบ รวมถึงวิดีโอที่มีอยู่และวิดีโอใหม่ที่เพิ่มในอนาคต
                        การดำเนินการนี้ไม่สามารถย้อนกลับได้ โปรดตั้งค่าอย่างระมัดระวัง ระบบใช้แผนราคา 6 แบบแบบตายตัว
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">เทมเพลตราคาแบบรวม 6 แบบ</h3>
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          แผนราคา 6 แบบแบบตายตัว
                        </span>
                      </div>
                      <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        ตั้งค่าแพ็กเกจราคา 6 แบบแบบ統一สำหรับวิดีโอทั้งหมด
                      </p>

                      {/* ✅ 6 ราคาแบบตายตัวสำหรับแบบกลุ่ม */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Template 1: 1 วัน */}
                        <div className={`p-4 rounded-lg border transition-all ${
                          bulkPricing.priceTemplates.template_1.enabled 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkPricing.priceTemplates.template_1.enabled}
                                  onChange={() => handleBulkTemplateToggle('template_1')}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  bulkPricing.priceTemplates.template_1.enabled 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-200 dark:bg-gray-600'
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                              </label>
                              <span className={`font-medium ${bulkPricing.priceTemplates.template_1.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                แพ็กเกจ 1 วัน
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_1.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                เปิดใช้งานแล้ว
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_1.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_1.amount}
                                  onChange={(e) => handleBulkTemplateChange('template_1', 'amount', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_1.days}
                                  onChange={(e) => handleBulkTemplateChange('template_1', 'days', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="1"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Template 2: 7 วัน */}
                        <div className={`p-4 rounded-lg border transition-all ${
                          bulkPricing.priceTemplates.template_7.enabled 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkPricing.priceTemplates.template_7.enabled}
                                  onChange={() => handleBulkTemplateToggle('template_7')}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  bulkPricing.priceTemplates.template_7.enabled 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-200 dark:bg-gray-600'
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                              </label>
                              <span className={`font-medium ${bulkPricing.priceTemplates.template_7.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                แพ็กเกจ 7 วัน
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_7.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                เปิดใช้งานแล้ว
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_7.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_7.amount}
                                  onChange={(e) => handleBulkTemplateChange('template_7', 'amount', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_7.days}
                                  onChange={(e) => handleBulkTemplateChange('template_7', 'days', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="1"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Template 3: 30 วัน */}
                        <div className={`p-4 rounded-lg border transition-all ${
                          bulkPricing.priceTemplates.template_30.enabled 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkPricing.priceTemplates.template_30.enabled}
                                  onChange={() => handleBulkTemplateToggle('template_30')}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  bulkPricing.priceTemplates.template_30.enabled 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-200 dark:bg-gray-600'
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                              </label>
                              <span className={`font-medium ${bulkPricing.priceTemplates.template_30.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                แพ็กเกจ 30 วัน
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_30.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                เปิดใช้งานแล้ว
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_30.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_30.amount}
                                  onChange={(e) => handleBulkTemplateChange('template_30', 'amount', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_30.days}
                                  onChange={(e) => handleBulkTemplateChange('template_30', 'days', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="1"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Template 4: 90 วัน */}
                        <div className={`p-4 rounded-lg border transition-all ${
                          bulkPricing.priceTemplates.template_90.enabled 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkPricing.priceTemplates.template_90.enabled}
                                  onChange={() => handleBulkTemplateToggle('template_90')}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  bulkPricing.priceTemplates.template_90.enabled 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-200 dark:bg-gray-600'
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                              </label>
                              <span className={`font-medium ${bulkPricing.priceTemplates.template_90.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                แพ็กเกจ 90 วัน
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_90.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                เปิดใช้งานแล้ว
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_90.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_90.amount}
                                  onChange={(e) => handleBulkTemplateChange('template_90', 'amount', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_90.days}
                                  onChange={(e) => handleBulkTemplateChange('template_90', 'days', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="1"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Template 5: 180 วัน */}
                        <div className={`p-4 rounded-lg border transition-all ${
                          bulkPricing.priceTemplates.template_180.enabled 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkPricing.priceTemplates.template_180.enabled}
                                  onChange={() => handleBulkTemplateToggle('template_180')}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  bulkPricing.priceTemplates.template_180.enabled 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-200 dark:bg-gray-600'
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                              </label>
                              <span className={`font-medium ${bulkPricing.priceTemplates.template_180.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                แพ็กเกจ 180 วัน
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_180.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                เปิดใช้งานแล้ว
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_180.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_180.amount}
                                  onChange={(e) => handleBulkTemplateChange('template_180', 'amount', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_180.days}
                                  onChange={(e) => handleBulkTemplateChange('template_180', 'days', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="1"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Template 6: 365 วัน */}
                        <div className={`p-4 rounded-lg border transition-all ${
                          bulkPricing.priceTemplates.template_365.enabled 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkPricing.priceTemplates.template_365.enabled}
                                  onChange={() => handleBulkTemplateToggle('template_365')}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  bulkPricing.priceTemplates.template_365.enabled 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-200 dark:bg-gray-600'
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                              </label>
                              <span className={`font-medium ${bulkPricing.priceTemplates.template_365.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                แพ็กเกจ 365 วัน
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_365.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                เปิดใช้งานแล้ว
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_365.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">ราคา (บาท)</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_365.amount}
                                  onChange={(e) => handleBulkTemplateChange('template_365', 'amount', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">จำนวนวัน</label>
                                <input
                                  type="number"
                                  value={bulkPricing.priceTemplates.template_365.days}
                                  onChange={(e) => handleBulkTemplateChange('template_365', 'days', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="1"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">คำอธิบายขอบเขตการใช้งาน</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          <li>• การตั้งค่านี้จะถูกนำไปใช้กับวิดีโอทั้งหมดในปัจจุบัน</li>
                          <li>• วิดีโอใหม่ที่เพิ่มในอนาคตจะถูกนำการตั้งค่าราคานี้ไปใช้โดยอัตโนมัติ</li>
                          <li>• ระบบใช้แผนราคา 6 แบบแบบตายตัว ไม่สามารถเพิ่มหรือลบได้</li>
                          <li>• การตั้งค่าเฉพาะวิดีโอแต่ละรายการจะถูกเขียนทับ</li>
                          <li>• หากต้องการตั้งค่าราคาที่แตกต่างสำหรับวิดีโอเฉพาะ กรุณาตั้งค่าใน "ตั้งค่าราคาวิดีโอเดียว"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveAllSettings}
              disabled={saving}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : activeTab === 'single'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : activeTab === 'single' ? (
                'บันทึกการตั้งค่าวิดีโอเดียว'
              ) : (
                'บันทึกการตั้งค่าราคาวิดีโอทั้งหมด'
              )}
            </button>
            
            <button
              onClick={() => navigate('/video-management')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              กลับไปจัดการ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPriceSetting;