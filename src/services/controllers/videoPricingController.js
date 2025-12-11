const VideoPricingModel = require('../models/videoPricingModel');
const { pool } = require('../config/db');

const VideoPricingController = {

  async getPricingSettings(req, res) {
    try {
      const { videoId } = req.params;
      const settings = await VideoPricingModel.getPricingSettings(videoId);

      if (!settings) {
        return res.json({
          success: true,
          videoInfo: { id: parseInt(videoId) },
          pricingEnabled: false,
          useGlobalPricing: true,
          pricingType: 'none',
          basePrices: {
            price_1: { amount: 1, days: 1, enabled: false },
            price_7: { amount: 7, days: 7, enabled: false },
            price_30: { amount: 30, days: 30, enabled: false },
            price_90: { amount: 90, days: 90, enabled: false },
            price_180: { amount: 180, days: 180, enabled: false },
            price_365: { amount: 365, days: 365, enabled: false }
          }
        });
      }

      const isGlobal = settings.pricing_type === 'global';

      res.json({
        success: true,
        videoInfo: { id: settings.video_id },
        pricingEnabled: settings.pricing_enabled === 1,
        useGlobalPricing: isGlobal,
        pricingType: settings.pricing_type,
        basePrices: {
          price_1: {
            amount: parseFloat(isGlobal ? settings.template_1_amount : settings.price_1_amount || 1),
            days: isGlobal ? settings.template_1_days : settings.price_1_days || 1,
            enabled: isGlobal ? settings.template_1_enabled === 1 : settings.price_1_enabled === 1
          },
          price_7: {
            amount: parseFloat(isGlobal ? settings.template_7_amount : settings.price_7_amount || 7),
            days: isGlobal ? settings.template_7_days : settings.price_7_days || 7,
            enabled: isGlobal ? settings.template_7_enabled === 1 : settings.price_7_enabled === 1
          },
          price_30: {
            amount: parseFloat(isGlobal ? settings.template_30_amount : settings.price_30_amount || 30),
            days: isGlobal ? settings.template_30_days : settings.price_30_days || 30,
            enabled: isGlobal ? settings.template_30_enabled === 1 : settings.price_30_enabled === 1
          },
          price_90: {
            amount: parseFloat(isGlobal ? settings.template_90_amount : settings.price_90_amount || 90),
            days: isGlobal ? settings.template_90_days : settings.price_90_days || 90,
            enabled: isGlobal ? settings.template_90_enabled === 1 : settings.price_90_enabled === 1
          },
          price_180: {
            amount: parseFloat(isGlobal ? settings.template_180_amount : settings.price_180_amount || 180),
            days: isGlobal ? settings.template_180_days : settings.price_180_days || 180,
            enabled: isGlobal ? settings.template_180_enabled === 1 : settings.price_180_enabled === 1
          },
          price_365: {
            amount: parseFloat(isGlobal ? settings.template_365_amount : settings.price_365_amount || 365),
            days: isGlobal ? settings.template_365_days : settings.price_365_days || 365,
            enabled: isGlobal ? settings.template_365_enabled === 1 : settings.price_365_enabled === 1
          }
        }
      });

    } catch (error) {
      console.error('Get pricing settings error:', error);
      res.status(500).json({ success: false, message: '获取价格设置失败' });
    }
  },

  async getDisplayPricing(req, res) {
    try {
      const { videoId } = req.params;
      console.log('🎯 Get display pricing for video:', videoId);

      const settings = await VideoPricingModel.getPricingSettings(videoId);
      const globalSettings = await VideoPricingModel.getGlobalPricingSettings();

      console.log('📊 Video settings:', {
        exists: !!settings,
        pricing_enabled: settings?.pricing_enabled,
        use_global_pricing: settings?.use_global_pricing,
        pricing_type: settings?.pricing_type
      });

      console.log('🌍 Global settings:', {
        exists: !!globalSettings,
        enabled: globalSettings?.enabled,
        is_active: globalSettings?.is_active
      });

      const isGlobal = !settings || settings.use_global_pricing === 1 || settings.pricing_type === 'global';
      
      if (isGlobal && globalSettings && globalSettings.enabled === 1) {
        const displayPrices = {
          price_1: {
            amount: parseFloat(globalSettings.template_1_amount || 1),
            days: globalSettings.template_1_days || 1,
            enabled: globalSettings.template_1_enabled === 1
          },
          price_7: {
            amount: parseFloat(globalSettings.template_7_amount || 7),
            days: globalSettings.template_7_days || 7,
            enabled: globalSettings.template_7_enabled === 1
          },
          price_30: {
            amount: parseFloat(globalSettings.template_30_amount || 30),
            days: globalSettings.template_30_days || 30,
            enabled: globalSettings.template_30_enabled === 1
          },
          price_90: {
            amount: parseFloat(globalSettings.template_90_amount || 90),
            days: globalSettings.template_90_days || 90,
            enabled: globalSettings.template_90_enabled === 1
          },
          price_180: {
            amount: parseFloat(globalSettings.template_180_amount || 180),
            days: globalSettings.template_180_days || 180,
            enabled: globalSettings.template_180_enabled === 1
          },
          price_365: {
            amount: parseFloat(globalSettings.template_365_amount || 365),
            days: globalSettings.template_365_days || 365,
            enabled: globalSettings.template_365_enabled === 1
          }
        };

        console.log('✅ Showing GLOBAL pricing:', displayPrices);

        return res.json({
          success: true,
          pricingEnabled: true,
          useGlobalPricing: true,
          prices: displayPrices,
          message: 'ใช้ราคารวม (Global Pricing)'
        });
      }

      if (settings && settings.pricing_enabled === 1 && settings.custom_pricing_enabled === 1) {
        const displayPrices = {
          price_1: {
            amount: parseFloat(settings.price_1_amount || 1),
            days: settings.price_1_days || 1,
            enabled: settings.price_1_enabled === 1
          },
          price_7: {
            amount: parseFloat(settings.price_7_amount || 7),
            days: settings.price_7_days || 7,
            enabled: settings.price_7_enabled === 1
          },
          price_30: {
            amount: parseFloat(settings.price_30_amount || 30),
            days: settings.price_30_days || 30,
            enabled: settings.price_30_enabled === 1
          },
          price_90: {
            amount: parseFloat(settings.price_90_amount || 90),
            days: settings.price_90_days || 90,
            enabled: settings.price_90_enabled === 1
          },
          price_180: {
            amount: parseFloat(settings.price_180_amount || 180),
            days: settings.price_180_days || 180,
            enabled: settings.price_180_enabled === 1
          },
          price_365: {
            amount: parseFloat(settings.price_365_amount || 365),
            days: settings.price_365_days || 365,
            enabled: settings.price_365_enabled === 1
          }
        };

        console.log('✅ Showing CUSTOM pricing:', displayPrices);

        return res.json({
          success: true,
          pricingEnabled: true,
          useGlobalPricing: false,
          prices: displayPrices,
          message: 'ใช้ราคาเฉพาะ (Custom Pricing)'
        });
      }

      console.log('ℹ️ Video is FREE');
      return res.json({
        success: true,
        pricingEnabled: false,
        useGlobalPricing: isGlobal,
        prices: null,
        message: 'วิดีโอนี้ฟรี'
      });

    } catch (error) {
      console.error('❌ Get display pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถดึงข้อมูลราคาได้',
        error: error.message
      });
    }
  },

  // ✅ ปิดการชำระเงินทั้งหมดในระบบ
  async disableAllPaid(req, res) {
    try {
      console.log('🚫 ปิดการชำระเงินทั้งหมดในระบบ');

      const [videos] = await pool.query('SELECT id FROM videos');
      
      let successCount = 0;
      let failCount = 0;

      for (const video of videos) {
        try {
          const result = await VideoPricingModel.togglePaidStatus(video.id, false);
          
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`ปิดการชำระเงินสำหรับวิดีโอ ${video.id} ล้มเหลว:`, error);
          failCount++;
        }
      }

      res.json({
        success: true,
        message: `ปิดการชำระเงินสำเร็จสำหรับ ${successCount} วิดีโอ`,
        totalVideos: videos.length,
        successCount,
        failCount
      });

    } catch (error) {
      console.error('❌ ปิดการชำระเงินทั้งหมดในระบบล้มเหลว:', error);
      res.status(500).json({
        success: false,
        message: 'ปิดการชำระเงินทั้งหมดในระบบไม่สำเร็จ'
      });
    }
  },

  // ✅ เปิดการชำระเงินทั้งหมดในระบบ - ปรับปรุงให้ค้นหา ID ทั้งหมดแล้วเปิด
// เวอร์ชัน Debug พร้อม log เยอะ
async enableAllPaid(req, res) {
  try {
    console.log("========================================");
    console.log("🚀 เริ่มเปิดการชำระเงินเฉพาะ 500 วิดีโอแรก");
    console.log("========================================");

    const axios = require("axios");
    const MAX_LIMIT = 75813;     // ⭐ โหลดสูงสุด 75813 วิดีโอแรก
    const PAGE_SIZE = 50;
    const MAX_PAGES = 800;
    const MAX_RETRY = 3;

    let allVideoIds = [];
    let emptyCount = 0;

    console.log("📋 การตั้งค่า:");
    console.log(`   - โหลดสูงสุด: ${MAX_LIMIT} วิดีโอ`);
    console.log(`   - หน้าละ: ${PAGE_SIZE}`);
    console.log(`   - หน้าไม่เกิน: ${MAX_PAGES}`);
    console.log("");

    // ==================================================
    // ⭐ helper: ดึงข้อมูล พร้อม retry 3 ครั้ง
    // ==================================================
    const loadPage = async (page) => {
      const url = `http://localhost/api/?ac=list&pg=${page}&pgsize=${PAGE_SIZE}`;

      for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
          console.log(`\n📄 กำลังโหลดหน้า ${page} (พยายาม ${attempt}/${MAX_RETRY})`);
          const res = await axios.get(url, { timeout: 15000 });

          if (!res.data) throw new Error("Response ว่าง");
          return res.data;

        } catch (err) {
          console.log(`   ❌ โหลดหน้า ${page} ล้มเหลว: ${err.message}`);
          if (attempt === MAX_RETRY) return null;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    };

    // ==================================================
    // ⭐ Loop โหลดข้อมูล (หยุดเมื่อครบ 500)
    // ==================================================
    for (let page = 1; page <= MAX_PAGES; page++) {
      const data = await loadPage(page);

      if (!data) {
        console.log(`   ⏭️ ข้ามหน้า ${page}`);
        continue;
      }

      // หา key array ที่เป็น list วิดีโอ
      const list = data.list || data.data || [];
      if (!Array.isArray(list)) {
        console.log(`   ⚠️ หน้า ${page}: โครงสร้างข้อมูลไม่ถูกต้อง`);
        continue;
      }

      console.log(`   📦 วิดีโอในหน้านี้: ${list.length}`);

      if (list.length === 0) {
        emptyCount++;
        if (emptyCount >= 10) {
          console.log("🛑 พบหน้าว่างติดกัน 10 หน้า -> หยุดโหลด");
          break;
        }
        continue;
      }
      emptyCount = 0;

      // เก็บ ID
      const ids = list
        .map(v => v.vod_id || v.id)
        .filter(id => id);

      allVideoIds.push(...ids);

      console.log(`   🔢 รวมสะสม: ${allVideoIds.length}`);

      // ⭐ หยุดทันทีเมื่อครบ 500
      if (allVideoIds.length >= MAX_LIMIT) {
        allVideoIds = allVideoIds.slice(0, MAX_LIMIT);
        console.log("🛑 ถึงขีดจำกัด 500 วิดีโอ -> หยุดโหลด");
        break;
      }
    }

    // ---------------------------------------------------
    // ⭐ ลบ ID ซ้ำ
    // ---------------------------------------------------
    let uniqueIds = [...new Set(allVideoIds)];

    console.log("========================================");
    console.log("📊 สรุปการโหลดวิดีโอ");
    console.log("========================================");
    console.log(`🎯 โหลดทั้งหมด: ${uniqueIds.length} วิดีโอ`);
    console.log("========================================");

    if (uniqueIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบวิดีโอ"
      });
    }

    // ---------------------------------------------------
    // ⭐ เปิดการชำระเงิน
    // ---------------------------------------------------
    let success = 0;
    let fail = 0;

    for (let i = 0; i < uniqueIds.length; i++) {
      const videoId = uniqueIds[i];

      try {
        const result = await VideoPricingModel.togglePaidStatus(videoId, true);
        if (result.success) success++;
        else fail++;
      } catch (err) {
        fail++;
      }

      if ((i + 1) % 50 === 0) {
        console.log(`📈 ความคืบหน้า: ${i + 1}/${uniqueIds.length}`);
      }
    }

    console.log("========================================");
    console.log("🎉 เสร็จสิ้น!");
    console.log("========================================");
    console.log(`✅ สำเร็จ: ${success}`);
    console.log(`❌ ล้มเหลว: ${fail}`);
    console.log("========================================");

    return res.json({
      success: true,
      message: `เปิดการชำระเงิน 500 วิดีโอแรกเสร็จสมบูรณ์`,
      totalVideos: uniqueIds.length,
      successCount: success,
      failCount: fail
    });

  } catch (err) {
    console.error("❌ Fatal Error:", err);
    return res.status(500).json({
      success: false,
      message: "ระบบมีปัญหา",
      error: err.message
    });
  }
}
,

  // ✅ บันทึกการตั้งค่าราคา
  async saveAllSettings(req, res) {
    try {
      const { settingType, video_id, pricingEnabled, basePrices, bulkPricing, useGlobalPricing } = req.body;

      console.log('📦 Received save request:', { 
        settingType, 
        video_id, 
        pricingEnabled, 
        useGlobalPricing,
        hasBasePrices: !!basePrices
      });

      if (settingType === 'single') {
        if (!video_id) {
          return res.status(400).json({
            success: false,
            message: '缺少视频ID'
          });
        }

        if (useGlobalPricing === true) {
          console.log(`🌍 Setting video ${video_id} to use global pricing`);
          
          const result = await VideoPricingModel.savePricingSettings(video_id, {
            pricingEnabled: false,
            basePrices: {
              price_1: { amount: 1, days: 1, enabled: false },
              price_7: { amount: 7, days: 7, enabled: false },
              price_30: { amount: 30, days: 30, enabled: false },
              price_90: { amount: 90, days: 90, enabled: false },
              price_180: { amount: 180, days: 180, enabled: false },
              price_365: { amount: 365, days: 365, enabled: false }
            },
            useGlobalPricing: true
          });

          res.json({
            success: true,
            message: '已设置为使用全局价格',
            data: result,
            useGlobalPricing: true
          });
        } else {
          console.log(`🎯 Setting video ${video_id} to use custom pricing`);
          
          const result = await VideoPricingModel.savePricingSettings(video_id, {
            pricingEnabled: pricingEnabled || true,
            basePrices: basePrices,
            useGlobalPricing: false
          });

          res.json({
            success: true,
            message: '单个视频价格设置已保存',
            data: result,
            useGlobalPricing: false
          });
        }

      } else if (settingType === 'bulk') {
        await VideoPricingModel.saveGlobalPricingSettings(bulkPricing);

        if (bulkPricing.applyToAll) {
          await VideoPricingModel.applyGlobalPricingToAllVideos();
        }

        res.json({
          success: true,
          message: '全局价格设置已保存并激活'
        });

      } else {
        res.status(400).json({
          success: false,
          message: '无效的设置类型'
        });
      }

    } catch (error) {
      console.error('❌ Save settings error:', error);
      res.status(500).json({
        success: false,
        message: '保存设置失败',
        error: error.message
      });
    }
  },

  async checkPriceStatus(req, res) {
    try {
      const { videoId } = req.params;

      console.log('🔍 Check price status for video:', videoId);

      const status = await VideoPricingModel.checkPriceStatus(videoId);

      res.json({
        success: true,
        hasPricing: status.hasPricing,
        isPaid: status.isPaid,
        useGlobalPricing: status.useGlobalPricing,
        customPricingEnabled: status.customPricingEnabled
      });
    } catch (error) {
      console.error('Check price status error:', error);
      res.status(500).json({
        success: false,
        hasPricing: false,
        isPaid: false,
        useGlobalPricing: true,
        customPricingEnabled: false
      });
    }
  },

  async togglePaidStatus(req, res) {
    try {
      const { video_id, enable } = req.body;

      console.log('🔄 Toggle paid status request:', { video_id, enable });

      if (!video_id) {
        return res.status(400).json({
          success: false,
          message: '缺少视频ID'
        });
      }

      const result = await VideoPricingModel.togglePaidStatus(video_id, enable);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result,
          useGlobalPricing: result.useGlobalPricing,
          hasPricing: enable
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || '操作失败',
          error: result.error
        });
      }

    } catch (error) {
      console.error('❌ Toggle paid status error:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误: ' + error.message
      });
    }
  },

  async getBulkSettings(req, res) {
    try {
      const settings = await VideoPricingModel.getGlobalPricingSettings();

      if (!settings) {
        return res.json({
          success: true,
          bulkPricing: {
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
          }
        });
      }

      const response = {
        success: true,
        bulkPricing: {
          enabled: settings.enabled === 1,
          priceTemplates: {
            template_1: {
              amount: parseFloat(settings.template_1_amount || 1),
              days: settings.template_1_days || 1,
              enabled: settings.template_1_enabled === 1
            },
            template_7: {
              amount: parseFloat(settings.template_7_amount || 7),
              days: settings.template_7_days || 7,
              enabled: settings.template_7_enabled === 1
            },
            template_30: {
              amount: parseFloat(settings.template_30_amount || 30),
              days: settings.template_30_days || 30,
              enabled: settings.template_30_enabled === 1
            },
            template_90: {
              amount: parseFloat(settings.template_90_amount || 90),
              days: settings.template_90_days || 90,
              enabled: settings.template_90_enabled === 1
            },
            template_180: {
              amount: parseFloat(settings.template_180_amount || 180),
              days: settings.template_180_days || 180,
              enabled: settings.template_180_enabled === 1
            },
            template_365: {
              amount: parseFloat(settings.template_365_amount || 365),
              days: settings.template_365_days || 365,
              enabled: settings.template_365_enabled === 1
            }
          },
          applyToAll: settings.apply_to_all === 1
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get bulk settings error:', error);
      res.status(500).json({
        success: false,
        message: '获取批量设置失败'
      });
    }
  },

  async getAllVideosWithPricing(req, res) {
    try {
      const videos = await VideoPricingModel.getAllVideosWithPricing();

      res.json({
        success: true,
        videos
      });
    } catch (error) {
      console.error('Get all videos error:', error);
      res.status(500).json({
        success: false,
        message: '获取视频列表失败'
      });
    }
  },

  // ✅ ฟังก์ชันใหม่: ปิดการชำระเงินและใช้ราคารวมทันที
  async disablePricingAndUseGlobal(req, res) {
    try {
      const { video_id } = req.body;

      console.log('🔄 ปิดการชำระเงินและใช้ราคารวมสำหรับวิดีโอ:', video_id);

      if (!video_id) {
        return res.status(400).json({
          success: false,
          message: '缺少视频ID'
        });
      }

      // 1. ปิดการชำระเงิน
      const toggleResult = await VideoPricingModel.togglePaidStatus(video_id, false);
      
      if (!toggleResult.success) {
        return res.status(500).json({
          success: false,
          message: toggleResult.message || '关闭付费功能失败'
        });
      }

      // 2. ตั้งค่าให้ใช้ global pricing
      const saveResult = await VideoPricingModel.savePricingSettings(video_id, {
        pricingEnabled: false,
        basePrices: {
          price_1: { amount: 1, days: 1, enabled: false },
          price_7: { amount: 7, days: 7, enabled: false },
          price_30: { amount: 30, days: 30, enabled: false },
          price_90: { amount: 90, days: 90, enabled: false },
          price_180: { amount: 180, days: 180, enabled: false },
          price_365: { amount: 365, days: 365, enabled: false }
        },
        useGlobalPricing: true
      });

      res.json({
        success: true,
        message: '已关闭付费功能并使用全局价格',
        data: {
          video_id,
          pricingEnabled: false,
          useGlobalPricing: true
        }
      });

    } catch (error) {
      console.error('❌ Disable pricing and use global error:', error);
      res.status(500).json({
        success: false,
        message: '关闭付费功能并使用全局价格失败',
        error: error.message
      });
    }
  }
};

module.exports = VideoPricingController;