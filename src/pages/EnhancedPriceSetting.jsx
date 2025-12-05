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
  const [activeTab, setActiveTab] = useState('single'); // 设置默认值为single
  const [pricingEnabled, setPricingEnabled] = useState(false);
  
  // 定义6个初始套餐
  const [basePrices, setBasePrices] = useState({
    price_1: { amount: 1, days: 1, enabled: true },
    price_7: { amount: 7, days: 7, enabled: true },
    price_30: { amount: 30, days: 30, enabled: true },
    price_90: { amount: 90, days: 90, enabled: true },
    price_180: { amount: 180, days: 180, enabled: true },
    price_365: { amount: 365, days: 365, enabled: true }
  });

  const [bulkPricing, setBulkPricing] = useState({
    enabled: false,
    priceTemplates: {
      template_1: { amount: 1, days: 1, enabled: true },
      template_7: { amount: 7, days: 7, enabled: true },
      template_30: { amount: 30, days: 30, enabled: true },
      template_90: { amount: 90, days: 90, enabled: true },
      template_180: { amount: 180, days: 180, enabled: true },
      template_365: { amount: 365, days: 365, enabled: true }
    },
    applyToAll: true
  });

  const [originalPrices, setOriginalPrices] = useState(null);
  const [usingBulkPricing, setUsingBulkPricing] = useState(false);
  const [hasValidAccess, setHasValidAccess] = useState(false);

  // ✅ 检查访问权限 - 如果没有videoId，禁止直接进入bulk页面
  useEffect(() => {
    if (location.state?.autoOpenBulkTab) {
      // 如果有autoOpenBulkTab状态，则打开bulk标签页
      setActiveTab('bulk');
      setHasValidAccess(true);
    } else if (videoId && videoId !== 'all') {
      // 如果有非'all'的videoId，则打开single标签页
      setActiveTab('single');
      setHasValidAccess(true);
    } else {
      // 如果没有videoId或videoId为'all'但没有autoOpenBulkTab状态
      // 重定向回video-management
      Swal.fire({
        icon: 'error',
        title: '访问无效',
        text: '请从视频管理页面选择视频',
        confirmButtonText: '确定'
      }).then(() => {
        navigate('/video-management');
      });
    }
  }, [videoId, location.state, navigate]);

  // ✅ 修改loadData的useEffect
  useEffect(() => {
    if (!hasValidAccess) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'single' && videoId && videoId !== 'all') {
          await loadPriceSettings(videoId);
        } else if (activeTab === 'bulk') {
          await loadBulkPriceSettings();
        }
      } catch (error) {
        console.error('加载数据时出错:', error);
        if (activeTab === 'single' && videoId && videoId !== 'all') {
          await loadVideoInfo(videoId);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [videoId, activeTab, hasValidAccess]);

  const loadPriceSettings = async (id) => {
    try {
      const response = await fetch(`/backend-api/video/pricing/settings/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          if (data.videoInfo) {
            setVideo(data.videoInfo);
          }
          setPricingEnabled(data.pricingEnabled || false);
          
          if (data.originalPrices) {
            setOriginalPrices(data.originalPrices);
            setUsingBulkPricing(data.usingBulkPricing || false);
          }
          
          if (data.basePrices) {
            const loadedPrices = { ...basePrices };
            Object.keys(data.basePrices).forEach(key => {
              if (loadedPrices[key]) {
                loadedPrices[key] = data.basePrices[key];
              }
            });
            setBasePrices(loadedPrices);
          }
          return;
        }
      }
      
      await loadVideoInfo(id);
      
    } catch (error) {
      console.error('加载价格设置时出错:', error);
      await loadVideoInfo(id);
    }
  };

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
      console.error('加载视频信息时出错:', error);
    }
  };

  const loadBulkPriceSettings = async () => {
    try {
      const response = await fetch('/backend-api/video/pricing/bulk-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bulkPricing) {
          setBulkPricing(data.bulkPricing);
        }
      }
    } catch (error) {
      console.error('加载批量价格设置时出错:', error);
    }
  };

  // 批量启用/禁用所有6个价格
  const toggleAllPrices = (enabled) => {
    const updatedPrices = { ...basePrices };
    Object.keys(updatedPrices).forEach(key => {
      updatedPrices[key] = {
        ...updatedPrices[key],
        enabled: enabled
      };
    });
    setBasePrices(updatedPrices);
  };

  // 将价格设置为等于天数
  const setPriceEqualToDays = () => {
    const updatedPrices = { ...basePrices };
    Object.keys(updatedPrices).forEach(key => {
      const price = updatedPrices[key];
      updatedPrices[key] = {
        ...price,
        amount: price.days,
        enabled: true
      };
    });
    setBasePrices(updatedPrices);
    
    Swal.fire({
      icon: 'success',
      title: '设置成功',
      text: '已将所有套餐价格设置为等于天数',
      confirmButtonText: '确定',
      customClass: {
        popup: isDarkMode ? 'dark-swal' : ''
      }
    });
  };

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
    const newValue = field === 'amount' ? parseFloat(value) || 0 : parseInt(value) || 0;
    
    setBasePrices(prev => ({
      ...prev,
      [priceKey]: {
        ...prev[priceKey],
        [field]: newValue
      }
    }));
  };

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
    const newValue = field === 'amount' ? parseFloat(value) || 0 : parseInt(value) || 0;
    
    setBulkPricing(prev => ({
      ...prev,
      priceTemplates: {
        ...prev.priceTemplates,
        [templateKey]: {
          ...prev.priceTemplates[templateKey],
          [field]: newValue
        }
      }
    }));
  };

  // ✅ 修改handleSaveAllSettings
  const handleSaveAllSettings = async () => {
    try {
      setSaving(true);
      
      let settingsData;
      const token = localStorage.getItem('token');

      if (activeTab === 'single') {
        if (!videoId || videoId === 'all') {
          Swal.fire({
            icon: 'error',
            title: '保存失败',
            text: '视频ID不完整',
            confirmButtonText: '确定',
            customClass: {
              popup: isDarkMode ? 'dark-swal' : ''
            }
          });
          return;
        }

        settingsData = {
          settingType: 'single',
          video_id: parseInt(videoId),
          pricingEnabled: pricingEnabled,
          basePrices: basePrices,
          useGlobalPricing: false
        };
      } else {
        settingsData = {
          settingType: 'bulk',
          bulkPricing: {
            enabled: true,
            priceTemplates: bulkPricing.priceTemplates,
            applyToAll: true
          }
        };
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
            ? '视频价格设置已保存' 
            : '批量价格设置已保存',
          confirmButtonText: '确定',
          customClass: {
            popup: isDarkMode ? 'dark-swal' : ''
          }
        });
        
        if (activeTab === 'single' && pricingEnabled) {
          await fetch('/backend-api/video/pricing/toggle-paid', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              video_id: parseInt(videoId),
              enable: true
            })
          });
        }
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存设置时出错:', error);
      Swal.fire({
        icon: 'error',
        title: '保存失败',
        text: error.message || '保存设置时出错',
        confirmButtonText: '确定',
        customClass: {
          popup: isDarkMode ? 'dark-swal' : ''
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalPrice = (prices) => {
    return Object.values(prices).reduce((total, price) => {
      return price.enabled ? total + price.amount : total;
    }, 0);
  };

  // 为SweetAlert2的dark mode样式
  useEffect(() => {
    if (isDarkMode) {
      const style = document.createElement('style');
      style.innerHTML = `
        .dark-swal {
          background-color: #1f2937 !important;
          color: white !important;
        }
        .dark-swal .swal2-title {
          color: white !important;
        }
        .dark-swal .swal2-content {
          color: #d1d5db !important;
        }
        .dark-swal .swal2-confirm {
          background-color: #3b82f6 !important;
        }
      `;
      document.head.appendChild(style);
      return () => style.remove();
    }
  }, [isDarkMode]);

  // ✅ 如果没有访问权限，显示loading或重定向
  if (!hasValidAccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            正在检查访问权限...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            {activeTab === 'single' ? '正在加载视频价格设置...' : '正在加载批量价格设置...'}
          </p>
        </div>
      </div>
    );
  }

  // 价格套餐卡片组件（可重复用于single和bulk）
  const PricePackageCard = ({ 
    item, 
    keyName, 
    isEnabled, 
    onToggle, 
    onChange, 
    type = 'single',
    isDarkMode 
  }) => {
    const isSingle = type === 'single';
    
    return (
      <div className={`p-2 sm:p-3 rounded-lg border transition-all min-h-[180px] ${
        isEnabled 
          ? (isSingle ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-green-500 bg-green-50 dark:bg-green-900/20') 
          : 'border-gray-200 dark:border-gray-600'
      }`}>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={onToggle}
                className="sr-only peer"
              />
              <div className={`w-9 h-5 rounded-full peer ${
                isEnabled 
                  ? (isSingle ? 'bg-blue-600' : 'bg-green-600') 
                  : 'bg-gray-200 dark:bg-gray-600'
              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
            </label>
            <span className={`text-sm font-medium whitespace-nowrap ${isEnabled ? (isSingle ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400') : 'text-gray-500'}`}>
              {item.days} 天
            </span>
          </div>
          {isEnabled && (
            <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs rounded ${
              isSingle 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              已启用
            </span>
          )}
        </div>

        {isEnabled && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium mb-1">价格 (¥)</label>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => onChange(keyName, 'amount', e.target.value)}
                className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-2 ${
                  isSingle ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                } ${isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">天数</label>
              <input
                type="number"
                value={item.days}
                onChange={(e) => onChange(keyName, 'days', e.target.value)}
                className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-2 ${
                  isSingle ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                } ${isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300'
                }`}
                min="1"
              />
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <div className="truncate">平均: ¥{(item.amount / item.days).toFixed(2)}/天</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen py-3 sm:py-6 px-2 sm:px-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header和返回按钮 */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button 
              onClick={() => navigate('/video-management')}
              className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200 border'
              }`}
            >
              <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回
            </button>
          </div>
          
          {/* 显示视频信息或批量定价信息 */}
          {activeTab === 'single' && video && (
            <div className={`p-3 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {video.thumbnail && (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full sm:w-20 h-32 sm:h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-base sm:text-xl font-bold mb-2 line-clamp-2">{video.title}</h1>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="truncate">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>ID:</span>
                      <span className="ml-1 font-mono">{video.id}</span>
                    </div>
                    <div className="truncate">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>分类:</span>
                      <span className="ml-1 truncate">{video.category}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>状态:</span>
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${
                        pricingEnabled 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {pricingEnabled ? '开启' : '关闭'}
                      </span>
                    </div>
                    {originalPrices && (
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>使用:</span>
                        <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${
                          usingBulkPricing 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          {usingBulkPricing ? '批量' : '自定义'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {originalPrices && (
                    <div className={`mt-3 p-2 sm:p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                        <div className="flex-1">
                          <span className="text-xs sm:text-sm font-medium block mb-1">
                            {usingBulkPricing ? '正在使用的批量价格' : '正在使用的自定义价格'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(originalPrices).map(([key, price]) => (
                              price.enabled && (
                                <span key={key} className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                  {price.days}天:¥{price.amount}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xs sm:text-sm font-medium">总计: </span>
                          <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                            ¥{calculateTotalPrice(originalPrices)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className={`p-3 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-100'}`}>
                  <svg className="w-5 h-5 sm:w-8 sm:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-base sm:text-xl font-bold mb-2">批量视频价格设置</h1>
                  <p className={`text-xs sm:text-base mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    为所有视频设置相同的价格方案
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 标签页 - 只显示相关标签页 */}
        <div className={`mb-4 sm:mb-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {videoId && videoId !== 'all' && (
                <button
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-2 sm:py-4 px-1 sm:px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-colors ${
                    activeTab === 'single'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  单个
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-2 sm:py-4 px-1 sm:px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-colors ${
                  activeTab === 'bulk'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                批量
              </button>
            </nav>
          </div>

          <div className="p-3 sm:p-6">
            {activeTab === 'single' && (
              <div>
                {/* 定价开关 */}
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-lg font-semibold">启用付费功能</h3>
                      <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        为此视频启用付费功能
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer self-start sm:self-center">
                      <input
                        type="checkbox"
                        checked={pricingEnabled}
                        onChange={() => setPricingEnabled(!pricingEnabled)}
                        className="sr-only peer"
                      />
                      <div className={`w-10 h-5 sm:w-14 sm:h-7 rounded-full peer ${
                        pricingEnabled 
                          ? 'bg-blue-600' 
                          : 'bg-gray-200 dark:bg-gray-600'
                      } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-6 sm:after:w-6 after:transition-all`}></div>
                    </label>
                  </div>
                </div>

                {pricingEnabled && (
                  <div>
                    {/* 批量控制按钮 */}
                    <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-xl font-semibold">设置价格套餐</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1">
                            设置6个不同的价格套餐
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <button
                            onClick={() => toggleAllPrices(true)}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
                          >
                            全部启用
                          </button>
                          <button
                            onClick={() => toggleAllPrices(false)}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
                          >
                            全部禁用
                          </button>
                          <button
                            onClick={setPriceEqualToDays}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
                          >
                            价格=天数
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 显示6个套餐 - 所有屏幕尺寸上均为2列 */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      {Object.entries(basePrices).map(([key, price]) => (
                        <PricePackageCard
                          key={key}
                          item={price}
                          keyName={key}
                          isEnabled={price.enabled}
                          onToggle={() => handleBasePriceToggle(key)}
                          onChange={handleBasePriceChange}
                          type="single"
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bulk' && (
              <div>
                {/* 警告信息 */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <h3 className="text-sm sm:text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                        批量价格设置
                      </h3>
                      <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-0.5 sm:mt-1">
                        将应用于系统中的所有视频
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
                    <h3 className="text-base sm:text-xl font-semibold">批量价格模板</h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          const updatedTemplates = { ...bulkPricing.priceTemplates };
                          Object.keys(updatedTemplates).forEach(key => {
                            updatedTemplates[key].enabled = true;
                            updatedTemplates[key].amount = updatedTemplates[key].days;
                          });
                          setBulkPricing(prev => ({
                            ...prev,
                            priceTemplates: updatedTemplates
                          }));
                        }}
                        className="px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm rounded transition-colors whitespace-nowrap"
                      >
                        全部启用
                      </button>
                      <button
                        onClick={() => {
                          const updatedTemplates = { ...bulkPricing.priceTemplates };
                          Object.keys(updatedTemplates).forEach(key => {
                            updatedTemplates[key].enabled = false;
                          });
                          setBulkPricing(prev => ({
                            ...prev,
                            priceTemplates: updatedTemplates
                          }));
                        }}
                        className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm rounded transition-colors whitespace-nowrap"
                      >
                        全部禁用
                      </button>
                    </div>
                  </div>

                  {/* 显示6个模板 - 所有屏幕尺寸上均为2列 */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {Object.entries(bulkPricing.priceTemplates).map(([key, template]) => (
                      <PricePackageCard
                        key={key}
                        item={template}
                        keyName={key}
                        isEnabled={template.enabled}
                        onToggle={() => handleBulkTemplateToggle(key)}
                        onChange={handleBulkTemplateChange}
                        type="bulk"
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleSaveAllSettings}
              disabled={saving}
              className={`flex-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-xs sm:text-base ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : activeTab === 'single'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在保存...
                </span>
              ) : activeTab === 'single' ? (
                '保存单个视频'
              ) : (
                '保存批量价格'
              )}
            </button>
            
            <button
              onClick={() => navigate('/video-management')}
              className={`px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-xs sm:text-base ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPriceSetting;