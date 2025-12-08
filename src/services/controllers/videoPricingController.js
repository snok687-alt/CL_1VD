const VideoPricingModel = require('../models/videoPricingModel');

const VideoPricingController = {

  // ✅ แก้ไข method getPricingSettings
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

        // ✅ ถ้า useGlobalPricing เป็น true ให้ตั้งค่าใช้ global pricing
        if (useGlobalPricing === true) {
          console.log(`🌍 Setting video ${video_id} to use global pricing`);
          
          // ✅ บันทึกการตั้งค่าเป็น global pricing
          const result = await VideoPricingModel.savePricingSettings(video_id, {
            pricingEnabled: false, // เมื่อใช้ global pricing ไม่ต้องเปิด pricingEnabled
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
          // ✅ ถ้า useGlobalPricing เป็น false ให้ตั้งค่าใช้ custom pricing
          console.log(`🎯 Setting video ${video_id} to use custom pricing`);
          
          const result = await VideoPricingModel.savePricingSettings(video_id, {
            pricingEnabled: pricingEnabled || true, // เมื่อใช้ custom pricing ต้องเปิด pricingEnabled
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
        // ✅ บันทึกการตั้งค่าแบบกลุ่ม
        await VideoPricingModel.saveGlobalPricingSettings(bulkPricing);

        // ✅ นำการตั้งค่าแบบกลุ่มไปใช้กับวิดีโอทั้งหมด
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

  // ✅ ตรวจสอบสถานะราคาของวิดีโอ
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

  // ✅ แก้ไข method togglePaidStatus ให้จัดการ error ดีขึ้น
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

  // ✅ ดึงการตั้งค่าราคาแบบกลุ่ม (6 ราคาเท่านั้น)
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

  // ✅ ดึงวิดีโอทั้งหมดพร้อมสถานะราคา
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

  // ✅ เปิดการชำระเงินทั้งหมดในระบบ
  async enableAllPaid(req, res) {
    try {
      console.log('🚀 Enabling paid status for all videos in system');

      // ดึงวิดีโอทั้งหมด
      const [videos] = await pool.query('SELECT id FROM videos');
      
      let successCount = 0;
      let failCount = 0;

      for (const video of videos) {
        try {
          // ✅ ใช้ method togglePaidStatus ที่แก้ไขแล้ว
          const result = await VideoPricingModel.togglePaidStatus(video.id, true);
          
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Enable paid for video ${video.id} error:`, error);
          failCount++;
        }
      }

      res.json({
        success: true,
        message: `เปิดใช้งานการชำระเงินสำเร็จสำหรับ ${successCount} วิดีโอ`,
        totalVideos: videos.length,
        successCount,
        failCount
      });

    } catch (error) {
      console.error('❌ Enable all paid error:', error);
      res.status(500).json({
        success: false,
        message: 'เปิดใช้งานการชำระเงินทั้งหมดไม่สำเร็จ'
      });
    }
  },

  // ✅ เพิ่มฟังก์ชันปิดการชำระเงินและใช้ราคารวม
  async disablePricingAndUseGlobal(req, res) {
    try {
      const { video_id } = req.body;

      console.log('🔄 Disable pricing and use global for video:', video_id);

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