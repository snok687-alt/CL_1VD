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
        console.error('❌ 加载数据错误:', error);
        Swal.fire('错误', '加载数据失败', 'error');
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
          
          console.log('✅ Loaded pricing settings from database:', data.basePrices);
        }
      } else {
        throw new Error('Failed to load price settings');
      }
    } catch (error) {
      console.error('❌ 加载价格设置错误:', error);
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
      console.error('Load video info error:', error);
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
          console.log('✅ Loaded bulk pricing settings:', data.bulkPricing);
        }
      } else {
        throw new Error('Failed to load bulk settings');
      }
    } catch (error) {
      console.error('❌ 加载批量价格设置错误:', error);
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
            title: '保存失败',
            text: '视频ID不完整，无法保存设置',
            confirmButtonText: '确定'
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

        console.log('📤 Sending single video settings:', settingsData);
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

        console.log('📤 Sending bulk pricing settings:', settingsData);
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
          title: '保存成功',
          text: activeTab === 'single' 
            ? '视频价格设置已成功保存' 
            : `批量价格设置已成功应用到 ${result.totalVideos || '所有'} 个视频`,
          confirmButtonText: '确定'
        });
        
        console.log('✅ Save successful:', result);
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('❌ 保存设置错误:', error);
      Swal.fire({
        icon: 'error',
        title: '保存失败',
        text: error.message || '保存设置时发生错误',
        confirmButtonText: '确定'
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
        // Create and download JSON file
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
        
        Swal.fire('导出成功', '价格设置已导出为JSON文件', 'success');
      } else {
        throw new Error(result.message || '导出失败');
      }
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire('导出失败', error.message, 'error');
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
          title: '确认导入',
          text: `确定要导入价格设置吗？`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '确定导入',
          cancelButtonText: '取消'
        }).then((result) => {
          if (result.isConfirmed) {
            if (importedSettings.settingType === 'single') {
              setPricingEnabled(importedSettings.pricingEnabled);
              setBasePrices(importedSettings.basePrices);
            } else if (importedSettings.bulkPricing) {
              setBulkPricing(importedSettings.bulkPricing);
            }
            Swal.fire('已导入', '价格设置已成功导入', 'success');
          }
        });
      } catch (error) {
        Swal.fire('错误', '导入文件格式不正确', 'error');
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
            {activeTab === 'single' ? '正在加载视频价格设置...' : '正在加载批量设置...'}
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
              返回视频管理
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
                导出设置
              </button>
              
              <label className={`flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200 border'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                导入设置
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
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>视频ID:</span>
                      <span className="ml-2 font-mono">{video.id}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>分类:</span>
                      <span className="ml-2">{video.category}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>付费状态:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        pricingEnabled 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {pricingEnabled ? '已启用' : '未启用'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>最后更新:</span>
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
                  <h1 className="text-2xl font-bold mb-2">所有视频定价设置</h1>
                  <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    为系统中的所有视频设置统一的6种价格方案
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>应用范围:</span>
                      <span className="ml-2 font-semibold text-green-600">所有视频</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>价格方案:</span>
                      <span className="ml-2">6种固定价格</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>自动应用:</span>
                      <span className="ml-2 text-green-600">是（包括新视频）</span>
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
                单个视频定价
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
                所有视频定价
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab 1: 单个视频定价 - 6 ราคาเท่านั้น */}
            {activeTab === 'single' && (
              <div>
                {/* Main Switch สำหรับวิดีโอเดียว */}
                <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">启用付费功能</h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        启用后用户需要购买套餐才能观看此视频
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
                      <h3 className="text-xl font-semibold">6种价格套餐设置</h3>
                      <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        固定6种价格方案
                      </span>
                    </div>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      为此视频设置6种不同的价格套餐，数据将从数据库加载并可以更新
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
                              1 天套餐
                            </span>
                          </div>
                          {basePrices.price_1.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              已启用
                            </span>
                          )}
                        </div>

                        {basePrices.price_1.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                              <label className="block text-sm font-medium mb-2">天数</label>
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
                              7 天套餐
                            </span>
                          </div>
                          {basePrices.price_7.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              已启用
                            </span>
                          )}
                        </div>

                        {basePrices.price_7.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                              <label className="block text-sm font-medium mb-2">天数</label>
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
                              30 天套餐
                            </span>
                          </div>
                          {basePrices.price_30.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              已启用
                            </span>
                          )}
                        </div>

                        {basePrices.price_30.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                              <label className="block text-sm font-medium mb-2">天数</label>
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
                              90 天套餐
                            </span>
                          </div>
                          {basePrices.price_90.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              已启用
                            </span>
                          )}
                        </div>

                        {basePrices.price_90.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                              <label className="block text-sm font-medium mb-2">天数</label>
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
                              180 天套餐
                            </span>
                          </div>
                          {basePrices.price_180.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              已启用
                            </span>
                          )}
                        </div>

                        {basePrices.price_180.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                              <label className="block text-sm font-medium mb-2">天数</label>
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
                              365 天套餐
                            </span>
                          </div>
                          {basePrices.price_365.enabled && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              已启用
                            </span>
                          )}
                        </div>

                        {basePrices.price_365.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                              <label className="block text-sm font-medium mb-2">天数</label>
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
                      <h4 className="font-semibold mb-2">价格设置摘要</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                        {Object.entries(basePrices).map(([key, price]) => (
                          <div key={key} className={`text-center p-2 rounded ${
                            price.enabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            <div className="font-medium">{price.days} 天</div>
                            <div>{price.enabled ? `฿${price.amount}` : '未启用'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: 所有视频定价 - 6 ราคาเท่านั้น */}
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
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">所有视频定价设置</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        此设置将应用到系统中的所有视频，包括现有视频和未来新增的视频。
                        操作不可逆，请谨慎设置。系统使用6种固定价格方案。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">全局6种价格模板</h3>
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          固定6种价格方案
                        </span>
                      </div>
                      <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        为所有视频设置统一的6种价格套餐
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
                                1 天套餐
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_1.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                已启用
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_1.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                                <label className="block text-sm font-medium mb-2">天数</label>
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
                                7 天套餐
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_7.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                已启用
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_7.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                                <label className="block text-sm font-medium mb-2">天数</label>
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
                                30 天套餐
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_30.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                已启用
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_30.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                                <label className="block text-sm font-medium mb-2">天数</label>
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
                                90 天套餐
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_90.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                已启用
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_90.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                                <label className="block text-sm font-medium mb-2">天数</label>
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
                                180 天套餐
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_180.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                已启用
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_180.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                                <label className="block text-sm font-medium mb-2">天数</label>
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
                                365 天套餐
                              </span>
                            </div>
                            {bulkPricing.priceTemplates.template_365.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                已启用
                              </span>
                            )}
                          </div>

                          {bulkPricing.priceTemplates.template_365.enabled && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
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
                                <label className="block text-sm font-medium mb-2">天数</label>
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
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">应用范围说明</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          <li>• 此设置将应用到当前所有视频</li>
                          <li>• 未来新增的视频也会自动应用此价格设置</li>
                          <li>• 系统使用6种固定价格方案，无法添加或删除</li>
                          <li>• 单个视频的独立设置将被覆盖</li>
                          <li>• 如需为特定视频设置不同价格，请在"单个视频定价"中设置</li>
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
                  保存中...
                </span>
              ) : activeTab === 'single' ? (
                '保存单个视频设置'
              ) : (
                '保存所有视频价格设置'
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
              返回管理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPriceSetting;