const { pool } = require('../config/db');

const VideoPricingModel = {

  // ✅ แก้ไข method getPricingSettings - ลบ JOIN ที่ไม่จำเป็น
  async getPricingSettings(videoId) {
    try {
      // ✅ ดึงข้อมูลจาก video_pricing โดยตรง ไม่ต้อง JOIN กับ videos
      const [rows] = await pool.query(
        `SELECT 
            vp.*,
            CASE 
              WHEN vp.use_global_pricing = 1 THEN 'global'
              WHEN vp.custom_pricing_enabled = 1 THEN 'custom'
              ELSE 'none'
            END as pricing_type
          FROM video_pricing vp
          WHERE vp.video_id = ?`,
        [videoId]
      );

      const videoPricing = rows[0];

      // หากวิดีโอนี้ใช้การตั้งค่าแบบกลุ่ม
      if (!videoPricing || videoPricing.use_global_pricing) {
        const globalSettings = await this.getActiveGlobalPricingSettings();
        if (globalSettings) {
          return {
            ...globalSettings,
            video_id: videoId,
            use_global_pricing: true,
            custom_pricing_enabled: false,
            pricing_type: 'global'
          };
        }
      }

      return videoPricing || null;
    } catch (error) {
      console.error('Get pricing settings error:', error);
      return null;
    }
  },

  // ✅ ดึงการตั้งค่าราคาแบบกลุ่มที่ใช้งานอยู่
  async getActiveGlobalPricingSettings() {
    try {
      const [rows] = await pool.query(
        "SELECT *, 'global' as pricing_type FROM global_pricing_settings WHERE is_active = TRUE AND enabled = TRUE LIMIT 1"
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Get active global pricing error:', error);
      return null;
    }
  },

  // ✅ บันทึกการตั้งค่าราคาสำหรับวิดีโอเดียว
  async savePricingSettings(videoId, settings) {
    try {
      const { pricingEnabled, basePrices, useGlobalPricing = true } = settings;
      
      console.log('💾 Saving pricing settings for video:', {
        videoId,
        pricingEnabled,
        useGlobalPricing,
        hasBasePrices: !!basePrices
      });

      // ✅ ตรวจสอบและสร้าง video entry ถ้ายังไม่มี
      await this.ensureVideoExists(videoId);

      // ✅ ตรวจสอบว่ามีการตั้งค่าใน video_pricing แล้วหรือยัง
      const [existingSettings] = await pool.query(
        'SELECT * FROM video_pricing WHERE video_id = ?',
        [videoId]
      );

      if (existingSettings.length > 0) {
        // ✅ อัปเดตการตั้งค่าที่มีอยู่
        if (useGlobalPricing) {
          // เมื่อใช้ global pricing
          await pool.query(`
            UPDATE video_pricing SET
              pricing_enabled = ?,
              use_global_pricing = ?,
              custom_pricing_enabled = ?,
              price_1_amount = 1.00,
              price_1_days = 1,
              price_1_enabled = 0,
              price_7_amount = 7.00,
              price_7_days = 7,
              price_7_enabled = 0,
              price_30_amount = 30.00,
              price_30_days = 30,
              price_30_enabled = 0,
              price_90_amount = 90.00,
              price_90_days = 90,
              price_90_enabled = 0,
              price_180_amount = 180.00,
              price_180_days = 180,
              price_180_enabled = 0,
              price_365_amount = 365.00,
              price_365_days = 365,
              price_365_enabled = 0,
              updated_at = CURRENT_TIMESTAMP
            WHERE video_id = ?
          `, [
            pricingEnabled ? 1 : 0,
            1, // use_global_pricing = true
            0, // custom_pricing_enabled = false
            videoId
          ]);
        } else {
          // เมื่อใช้ custom pricing
          await pool.query(`
            UPDATE video_pricing SET
              pricing_enabled = ?,
              use_global_pricing = ?,
              custom_pricing_enabled = ?,
              price_1_amount = ?,
              price_1_days = ?,
              price_1_enabled = ?,
              price_7_amount = ?,
              price_7_days = ?,
              price_7_enabled = ?,
              price_30_amount = ?,
              price_30_days = ?,
              price_30_enabled = ?,
              price_90_amount = ?,
              price_90_days = ?,
              price_90_enabled = ?,
              price_180_amount = ?,
              price_180_days = ?,
              price_180_enabled = ?,
              price_365_amount = ?,
              price_365_days = ?,
              price_365_enabled = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE video_id = ?
          `, [
            pricingEnabled ? 1 : 0,
            0, // use_global_pricing = false
            1, // custom_pricing_enabled = true
            basePrices.price_1.amount,
            basePrices.price_1.days,
            basePrices.price_1.enabled ? 1 : 0,
            basePrices.price_7.amount,
            basePrices.price_7.days,
            basePrices.price_7.enabled ? 1 : 0,
            basePrices.price_30.amount,
            basePrices.price_30.days,
            basePrices.price_30.enabled ? 1 : 0,
            basePrices.price_90.amount,
            basePrices.price_90.days,
            basePrices.price_90.enabled ? 1 : 0,
            basePrices.price_180.amount,
            basePrices.price_180.days,
            basePrices.price_180.enabled ? 1 : 0,
            basePrices.price_365.amount,
            basePrices.price_365.days,
            basePrices.price_365.enabled ? 1 : 0,
            videoId
          ]);
        }
      } else {
        // ✅ สร้างการตั้งค่าใหม่
        if (useGlobalPricing) {
          await pool.query(`
            INSERT INTO video_pricing (
              video_id,
              pricing_enabled,
              use_global_pricing,
              custom_pricing_enabled,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            videoId,
            pricingEnabled ? 1 : 0,
            1, // use_global_pricing = true
            0  // custom_pricing_enabled = false
          ]);
        } else {
          await pool.query(`
            INSERT INTO video_pricing (
              video_id,
              pricing_enabled,
              use_global_pricing,
              custom_pricing_enabled,
              price_1_amount, price_1_days, price_1_enabled,
              price_7_amount, price_7_days, price_7_enabled,
              price_30_amount, price_30_days, price_30_enabled,
              price_90_amount, price_90_days, price_90_enabled,
              price_180_amount, price_180_days, price_180_enabled,
              price_365_amount, price_365_days, price_365_enabled,
              created_at,
              updated_at
            ) VALUES (
              ?, ?, ?, ?,
              ?, ?, ?,
              ?, ?, ?,
              ?, ?, ?,
              ?, ?, ?,
              ?, ?, ?,
              ?, ?, ?,
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            )
          `, [
            videoId,
            pricingEnabled ? 1 : 0,
            0, // use_global_pricing = false
            1, // custom_pricing_enabled = true
            basePrices.price_1.amount,
            basePrices.price_1.days,
            basePrices.price_1.enabled ? 1 : 0,
            basePrices.price_7.amount,
            basePrices.price_7.days,
            basePrices.price_7.enabled ? 1 : 0,
            basePrices.price_30.amount,
            basePrices.price_30.days,
            basePrices.price_30.enabled ? 1 : 0,
            basePrices.price_90.amount,
            basePrices.price_90.days,
            basePrices.price_90.enabled ? 1 : 0,
            basePrices.price_180.amount,
            basePrices.price_180.days,
            basePrices.price_180.enabled ? 1 : 0,
            basePrices.price_365.amount,
            basePrices.price_365.days,
            basePrices.price_365.enabled ? 1 : 0
          ]);
        }
      }

      return {
        success: true,
        videoId,
        pricingEnabled,
        useGlobalPricing
      };

    } catch (error) {
      console.error('❌ Save pricing settings error:', error);
      throw error;
    }
  },

  async refreshAllVideoPricing() {
    try {
      const [videos] = await pool.query(`
        SELECT 
          v.*,
          COALESCE(vp.pricing_enabled, 0) as pricing_enabled,
          COALESCE(vp.use_global_pricing, 1) as use_global_pricing,
          COALESCE(vp.custom_pricing_enabled, 0) as custom_pricing_enabled,
          vp.updated_at as pricing_updated
        FROM videos v
        LEFT JOIN video_pricing vp ON v.id = vp.video_id
        ORDER BY v.created_at DESC
      `);
      return videos;
    } catch (error) {
      console.error('Refresh all video pricing error:', error);
      return [];
    }
  },

  async checkPriceStatus(videoId) {
    try {
      const [settings] = await pool.query(
        'SELECT pricing_enabled, use_global_pricing, custom_pricing_enabled FROM video_pricing WHERE video_id = ?',
        [videoId]
      );

      if (settings.length === 0) {
        return {
          hasPricing: false,
          isPaid: false,
          useGlobalPricing: true,
          customPricingEnabled: false
        };
      }

      const setting = settings[0];
      
      return {
        hasPricing: setting.pricing_enabled === 1,
        isPaid: setting.pricing_enabled === 1,
        useGlobalPricing: setting.use_global_pricing === 1,
        customPricingEnabled: setting.custom_pricing_enabled === 1
      };
    } catch (error) {
      console.error('Check price status error:', error);
      return {
        hasPricing: false,
        isPaid: false,
        useGlobalPricing: true,
        customPricingEnabled: false
      };
    }
  },

  async getVideoInfo(videoId) {
    try {
      const [video] = await pool.query(
        'SELECT id, title FROM videos WHERE id = ?',
        [videoId]
      );
      
      return video.length > 0 ? video[0] : null;
    } catch (error) {
      console.error('Get video info error:', error);
      return null;
    }
  },

  // ✅ เพิ่ม method เพื่อสร้าง video entry ถ้ายังไม่มี
  async ensureVideoExists(videoId) {
    try {
      const [video] = await pool.query(
        'SELECT id FROM videos WHERE id = ?',
        [videoId]
      );
      
      if (video.length === 0) {
        console.log(`📝 Creating video entry for ${videoId}`);
        await pool.query(
          'INSERT INTO videos (id, title) VALUES (?, ?)',
          [videoId, `Video ${videoId}`]
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ensure video exists error:', error);
      throw error;
    }
  },

  // ✅ แก้ไข method togglePaidStatus ให้บันทึกข้อมูลถูกต้อง
  async togglePaidStatus(videoId, enable) {
    try {
      console.log('🔄 Toggle paid status for video:', { videoId, enable });

      // ✅ ตรวจสอบและสร้าง video entry ถ้ายังไม่มี
      await this.ensureVideoExists(videoId);

      // ✅ ตรวจสอบว่ามีการตั้งค่าใน video_pricing แล้วหรือยัง
      const [existingSettings] = await pool.query(
        'SELECT * FROM video_pricing WHERE video_id = ?',
        [videoId]
      );

      if (existingSettings.length > 0) {
        // ✅ อัปเดตสถานะที่มีอยู่
        await pool.query(`
          UPDATE video_pricing 
          SET pricing_enabled = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE video_id = ?
        `, [enable ? 1 : 0, videoId]);
      } else {
        // ✅ สร้างการตั้งค่าใหม่ (ใช้ global pricing เป็นค่าเริ่มต้น)
        await pool.query(`
          INSERT INTO video_pricing (
            video_id,
            pricing_enabled,
            use_global_pricing,
            custom_pricing_enabled,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          videoId,
          enable ? 1 : 0,
          1, // use_global_pricing = true
          0  // custom_pricing_enabled = false
        ]);
      }

      return {
        success: true,
        videoId,
        enabled: enable,
        useGlobalPricing: true,
        message: enable ? '已开启付费功能并使用全局价格' : '已关闭付费功能'
      };

    } catch (error) {
      console.error('❌ Toggle paid status error:', error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  },

  // ✅ ดึงการตั้งค่าราคาแบบกลุ่ม (6 ราคาเท่านั้น)
  async getGlobalPricingSettings() {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM global_pricing_settings WHERE setting_name = 'default_global_pricing'"
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Get global pricing settings error:', error);
      return null;
    }
  },

  // ✅ บันทึกการตั้งค่าราคาแบบกลุ่ม
  async saveGlobalPricingSettings(settings) {
    try {
      const { enabled, priceTemplates, applyToAll } = settings;

      console.log('💾 Saving global pricing:', { enabled, priceTemplates });

      // ตรวจสอบว่ามีการตั้งค่าอยู่แล้วหรือไม่
      const [existing] = await pool.query(
        "SELECT * FROM global_pricing_settings WHERE setting_name = 'default_global_pricing'"
      );

      if (existing.length > 0) {
        // อัพเดทการตั้งค่าที่มีอยู่
        await pool.query(
          `UPDATE global_pricing_settings SET
            enabled = ?,
            template_1_amount = ?, template_1_days = ?, template_1_enabled = ?,
            template_7_amount = ?, template_7_days = ?, template_7_enabled = ?,
            template_30_amount = ?, template_30_days = ?, template_30_enabled = ?,
            template_90_amount = ?, template_90_days = ?, template_90_enabled = ?,
            template_180_amount = ?, template_180_days = ?, template_180_enabled = ?,
            template_365_amount = ?, template_365_days = ?, template_365_enabled = ?,
            apply_to_all = ?,
            is_active = TRUE,
            updated_at = NOW()
          WHERE setting_name = 'default_global_pricing'`,
          [
            enabled,
            priceTemplates.template_1.amount, priceTemplates.template_1.days, priceTemplates.template_1.enabled,
            priceTemplates.template_7.amount, priceTemplates.template_7.days, priceTemplates.template_7.enabled,
            priceTemplates.template_30.amount, priceTemplates.template_30.days, priceTemplates.template_30.enabled,
            priceTemplates.template_90.amount, priceTemplates.template_90.days, priceTemplates.template_90.enabled,
            priceTemplates.template_180.amount, priceTemplates.template_180.days, priceTemplates.template_180.enabled,
            priceTemplates.template_365.amount, priceTemplates.template_365.days, priceTemplates.template_365.enabled,
            applyToAll !== undefined ? applyToAll : true
          ]
        );
      } else {
        // สร้างการตั้งค่าใหม่
        await pool.query(
          `INSERT INTO global_pricing_settings 
          (setting_name, enabled, 
           template_1_amount, template_1_days, template_1_enabled,
           template_7_amount, template_7_days, template_7_enabled,
           template_30_amount, template_30_days, template_30_enabled,
           template_90_amount, template_90_days, template_90_enabled,
           template_180_amount, template_180_days, template_180_enabled,
           template_365_amount, template_365_days, template_365_enabled,
           apply_to_all, is_active)
          VALUES ('default_global_pricing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [
            enabled,
            priceTemplates.template_1.amount, priceTemplates.template_1.days, priceTemplates.template_1.enabled,
            priceTemplates.template_7.amount, priceTemplates.template_7.days, priceTemplates.template_7.enabled,
            priceTemplates.template_30.amount, priceTemplates.template_30.days, priceTemplates.template_30.enabled,
            priceTemplates.template_90.amount, priceTemplates.template_90.days, priceTemplates.template_90.enabled,
            priceTemplates.template_180.amount, priceTemplates.template_180.days, priceTemplates.template_180.enabled,
            priceTemplates.template_365.amount, priceTemplates.template_365.days, priceTemplates.template_365.enabled,
            applyToAll !== undefined ? applyToAll : true
          ]
        );
      }

      console.log('✅ Global pricing settings saved and activated');
      return { success: true };
    } catch (error) {
      console.error('❌ Save global pricing settings error:', error);
      throw error;
    }
  },

  // ✅ นำการตั้งค่าแบบกลุ่มไปใช้กับวิดีโอทั้งหมด
  async applyGlobalPricingToAllVideos() {
    try {
      const globalSettings = await this.getGlobalPricingSettings();
      if (!globalSettings) {
        throw new Error('No global settings found');
      }

      // ดึงรายการวิดีโอทั้งหมด
      const [videos] = await pool.query('SELECT id FROM videos');

      let successCount = 0;
      let failCount = 0;

      for (const video of videos) {
        try {
          const existing = await this.getPricingSettings(video.id);

          if (existing) {
            await pool.query(
              `UPDATE video_pricing SET
                pricing_enabled = TRUE,
                use_global_pricing = TRUE,
                custom_pricing_enabled = FALSE,
                updated_at = NOW()
              WHERE video_id = ?`,
              [video.id]
            );
          } else {
            await pool.query(
              `INSERT INTO video_pricing 
              (video_id, pricing_enabled, use_global_pricing, custom_pricing_enabled)
              VALUES (?, TRUE, TRUE, FALSE)`,
              [video.id]
            );
          }
          successCount++;
        } catch (error) {
          console.error(`Apply pricing to video ${video.id} error:`, error);
          failCount++;
        }
      }

      return {
        success: true,
        totalVideos: videos.length,
        successCount,
        failCount
      };
    } catch (error) {
      console.error('Apply global pricing error:', error);
      throw error;
    }
  },

  // ✅ ดึงวิดีโอทั้งหมดพร้อมสถานะราคา
  async getAllVideosWithPricing() {
    try {
      const [videos] = await pool.query(`
        SELECT 
          v.*,
          COALESCE(vp.pricing_enabled, 0) as pricing_enabled,
          COALESCE(vp.use_global_pricing, 1) as use_global_pricing,
          COALESCE(vp.custom_pricing_enabled, 0) as custom_pricing_enabled,
          vp.updated_at as pricing_updated,
          CASE 
            WHEN vp.use_global_pricing = 1 THEN 'global'
            WHEN vp.custom_pricing_enabled = 1 THEN 'custom'
            ELSE 'none'
          END as pricing_type
        FROM videos v
        LEFT JOIN video_pricing vp ON v.id = vp.video_id
        ORDER BY v.created_at DESC
      `);
      return videos;
    } catch (error) {
      console.error('Get all videos with pricing error:', error);
      return [];
    }
  },

  // ✅ เพิ่มฟังก์ชันปิดการชำระเงินและใช้ราคารวม
  async disablePricingAndUseGlobal(videoId) {
    try {
      console.log('🔄 Disabling pricing and using global for video:', videoId);

      // 1. ปิดการชำระเงิน
      const toggleResult = await this.togglePaidStatus(videoId, false);
      
      if (!toggleResult.success) {
        throw new Error(toggleResult.message || 'Failed to disable pricing');
      }

      // 2. ตั้งค่าให้ใช้ global pricing
      const saveResult = await this.savePricingSettings(videoId, {
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

      return {
        success: true,
        videoId,
        pricingEnabled: false,
        useGlobalPricing: true,
        message: 'Successfully disabled pricing and switched to global pricing'
      };

    } catch (error) {
      console.error('❌ Disable pricing and use global error:', error);
      throw error;
    }
  },
  async disableMultipleVideosPricing(videoIds) {
  try {
    console.log('🔄 ปิดการชำระเงินสำหรับวิดีโอหลายรายการ:', videoIds.length);

    let successCount = 0;
    let failCount = 0;

    for (const videoId of videoIds) {
      try {
        const result = await this.togglePaidStatus(videoId, false);
        
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`ปิดการชำระเงินวิดีโอ ${videoId} ล้มเหลว:`, error);
        failCount++;
      }
    }

    return {
      success: true,
      totalVideos: videoIds.length,
      successCount,
      failCount
    };
  } catch (error) {
    console.error('❌ ปิดการชำระเงินหลายวิดีโอล้มเหลว:', error);
    throw error;
  }
}

};

module.exports = VideoPricingModel;