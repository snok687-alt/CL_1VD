import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById } from '../data/videoData';
import Swal from 'sweetalert2';

const EnhancedPriceSetting = ({ isDarkMode }) => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // 'single' หรือ 'bulk'
  
  // การตั้งค่าราคาสำหรับวิดีโอเดียว
  const [pricingEnabled, setPricingEnabled] = useState(false);
  const [basePrices, setBasePrices] = useState({
    price_1: { amount: 1, days: 1, enabled: false },
    price_7: { amount: 7, days: 7, enabled: false },
    price_30: { amount: 30, days: 30, enabled: false },
    price_90: { amount: 90, days: 90, enabled: false },
    price_180: { amount: 180, days: 180, enabled: false },
    price_365: { amount: 365, days: 365, enabled: false }
  });

  // การตั้งค่าราคาแบบกลุ่ม (สำหรับวิดีโอทั้งหมด)
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
    applyToAll: true, // ตั้งค่าให้เป็น true เสมอเพราะเป็นราคาสำหรับวิดีโอทั้งหมด
    priceRanges: {
      minPrice: 0,
      maxPrice: 0
    }
  });

  // โหลดข้อมูล
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const videoData = await getVideoById(videoId);
        if (!videoData) {
          Swal.fire('错误', '未找到视频', 'error');
          navigate('/video-management');
          return;
        }
        setVideo(videoData);
        
        // โหลดการตั้งค่าราคาที่มีอยู่
        await loadPriceSettings(videoId);
      } catch (error) {
        console.error('加载数据错误:', error);
        Swal.fire('错误', '加载数据失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [videoId, navigate]);

  // โหลดการตั้งค่าราคา
  const loadPriceSettings = async (id) => {
    try {
      const response = await fetch(`/backend-api/video/pricing/settings/${id}`);
      if (response.ok) {
        const settings = await response.json();
        
        if (settings) {
          setPricingEnabled(settings.pricingEnabled || false);
          setBasePrices(settings.basePrices || basePrices);
        }
      }
    } catch (error) {
      console.error('加载价格设置错误:', error);
    }
  };

  // จัดการราคาสำหรับวิดีโอเดียว
  const handleBasePriceToggle = (priceKey) => {
    setBasePrices(prev => ({
      ...prev,
      [priceKey]: {
        ...prev[priceKey],
        enabled: !prev[priceKey].enabled
      }
    }));
  };

  const handleBasePriceChange = (priceKey, field, value) => {
    setBasePrices(prev => ({
      ...prev,
      [priceKey]: {
        ...prev[priceKey],
        [field]: field === 'amount' || field === 'days' ? parseInt(value) || 0 : value
      }
    }));
  };

  // จัดการราคาแบบกลุ่ม (สำหรับวิดีโอทั้งหมด)
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

  const handleBulkTemplateChange = (templateKey, field, value) => {
    setBulkPricing(prev => ({
      ...prev,
      priceTemplates: {
        ...prev.priceTemplates,
        [templateKey]: {
          ...prev.priceTemplates[templateKey],
          [field]: field === 'amount' || field === 'days' ? parseInt(value) || 0 : value
        }
      }
    }));
  };

  // บันทึกการตั้งค่าทั้งหมด
  const handleSaveAllSettings = async () => {
    try {
      setSaving(true);
      
      let settingsData;

      if (activeTab === 'single') {
        // บันทึกราคาสำหรับวิดีโอเดียว
        settingsData = {
          video_id: parseInt(videoId),
          pricingEnabled,
          basePrices,
          settingType: 'single'
        };
      } else {
        // บันทึกราคาแบบกลุ่มสำหรับวิดีโอทั้งหมด
        settingsData = {
          settingType: 'bulk',
          bulkPricing: {
            ...bulkPricing,
            applyToAll: true, // ตั้งค่าให้เป็น true เสมอ
            totalVideos: 'all' // บ่งชี้ว่าเป็นวิดีโอทั้งหมด
          }
        };
      }

      const response = await fetch('/backend-api/video/pricing/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: '保存成功',
          text: activeTab === 'single' 
            ? '视频价格设置已成功保存' 
            : '批量价格设置已成功应用到所有视频',
          confirmButtonText: '确定'
        });
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存设置错误:', error);
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

  // นำเข้าการตั้งค่า
  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        
        Swal.fire({
          title: '确认导入',
          text: `确定要导入价格设置吗？`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '确定导入',
          cancelButtonText: '取消'
        }).then((result) => {
          if (result.isConfirmed) {
            if (settings.settingType === 'single') {
              setPricingEnabled(settings.pricingEnabled);
              setBasePrices(settings.basePrices);
            } else {
              setBulkPricing(settings.bulkPricing);
            }
            Swal.fire('已导入', '价格设置已成功导入', 'success');
          }
        });
      } catch (error) {
        Swal.fire('错误', '导入文件格式不正确', 'error');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>正在加载视频数据...</p>
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
              <label className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200 border'
              }`}>
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
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-24 h-18 object-cover rounded-lg"
                />
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
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>观看次数:</span>
                      <span className="ml-2">{video.views?.toLocaleString()}</span>
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
            {/* Tab 1: 单个视频定价 */}
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
                    <h3 className="text-xl font-semibold mb-4">价格套餐设置</h3>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      为此视频设置不同的价格套餐
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(basePrices).map(([key, price]) => (
                        <div 
                          key={key}
                          className={`p-4 rounded-lg border transition-all ${
                            price.enabled 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={price.enabled}
                                  onChange={() => handleBasePriceToggle(key)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 rounded-full peer ${
                                  price.enabled 
                                    ? 'bg-blue-600' 
                                    : 'bg-gray-200 dark:bg-gray-600'
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                              </label>
                              <span className={`font-medium ${price.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                {price.days} 天套餐
                              </span>
                            </div>
                            {price.enabled && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                已启用
                              </span>
                            )}
                          </div>

                          {price.enabled && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
                                <input
                                  type="number"
                                  value={price.amount}
                                  onChange={(e) => handleBasePriceChange(key, 'amount', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">天数</label>
                                <input
                                  type="number"
                                  value={price.days}
                                  onChange={(e) => handleBasePriceChange(key, 'days', e.target.value)}
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: 所有视频定价 */}
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
                        操作不可逆，请谨慎设置。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Price Templates สำหรับวิดีโอทั้งหมด */}
                  <div className="lg:col-span-2">
                    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className="text-xl font-semibold mb-4">全局价格模板</h3>
                      <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        为所有视频设置统一的价格套餐
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(bulkPricing.priceTemplates).map(([key, template]) => (
                          <div 
                            key={key}
                            className={`p-4 rounded-lg border transition-all ${
                              template.enabled 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={template.enabled}
                                    onChange={() => handleBulkTemplateToggle(key)}
                                    className="sr-only peer"
                                  />
                                  <div className={`w-11 h-6 rounded-full peer ${
                                    template.enabled 
                                      ? 'bg-green-600' 
                                      : 'bg-gray-200 dark:bg-gray-600'
                                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                                </label>
                                <span className={`font-medium ${template.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                  {template.days} 天套餐
                                </span>
                              </div>
                              {template.enabled && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                  已启用
                                </span>
                              )}
                            </div>

                            {template.enabled && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium mb-2">价格 (บาท)</label>
                                  <input
                                    type="number"
                                    value={template.amount}
                                    onChange={(e) => handleBulkTemplateChange(key, 'amount', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                                      isDarkMode 
                                        ? 'bg-gray-600 border-gray-500 text-white' 
                                        : 'bg-white border-gray-300'
                                    }`}
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">天数</label>
                                  <input
                                    type="number"
                                    value={template.days}
                                    onChange={(e) => handleBulkTemplateChange(key, 'days', e.target.value)}
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
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">应用范围说明</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          <li>• 此设置将应用到当前所有视频</li>
                          <li>• 未来新增的视频也会自动应用此价格设置</li>
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