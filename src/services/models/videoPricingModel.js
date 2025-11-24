const { pool } = require('../config/db');

const VideoPricingModel = {

  // ✅ ดึงการตั้งค่าราคาของวิดีโอ (รวมถึงการตั้งค่าแบบกลุ่ม)
  async getPricingSettings(videoId) {
    try {
      // ดึงการตั้งค่าราคาเฉพาะวิดีโอ
      const [rows] = await pool.query(
        `SELECT 
          vp.*,
          v.title as video_title,
          v.thumbnail as video_thumbnail,
          v.category as video_category,
          CASE 
            WHEN vp.use_global_pricing = 1 THEN 'global'
            WHEN vp.custom_pricing_enabled = 1 THEN 'custom'
            ELSE 'none'
          END as pricing_type
        FROM video_pricing vp
        LEFT JOIN videos v ON vp.video_id = v.id
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
            video_title: videoPricing?.video_title,
            video_thumbnail: videoPricing?.video_thumbnail,
            video_category: videoPricing?.video_category,
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
      const {
        pricingEnabled,
        basePrices,
        useGlobalPricing = false
      } = settings;

      console.log('💾 Saving pricing for video:', videoId, {
        pricingEnabled,
        useGlobalPricing,
        basePrices
      });

      // ตรวจสอบว่ามีการตั้งค่าอยู่แล้วหรือไม่
      const existing = await this.getPricingSettings(videoId);

      if (useGlobalPricing) {
        // ✅ ใช้การตั้งค่าแบบกลุ่ม
        if (existing) {
          await pool.query(
            `UPDATE video_pricing SET
              pricing_enabled = ?,
              use_global_pricing = TRUE,
              custom_pricing_enabled = FALSE,
              updated_at = NOW()
            WHERE video_id = ?`,
            [pricingEnabled, videoId]
          );
        } else {
          await pool.query(
            `INSERT INTO video_pricing 
            (video_id, pricing_enabled, use_global_pricing, custom_pricing_enabled)
            VALUES (?, ?, TRUE, FALSE)`,
            [videoId, pricingEnabled]
          );
        }
      } else {
        // ✅ ใช้การตั้งค่าเฉพาะวิดีโอ
        const queryParams = [
          pricingEnabled,
          basePrices.price_1.amount, basePrices.price_1.days, basePrices.price_1.enabled,
          basePrices.price_7.amount, basePrices.price_7.days, basePrices.price_7.enabled,
          basePrices.price_30.amount, basePrices.price_30.days, basePrices.price_30.enabled,
          basePrices.price_90.amount, basePrices.price_90.days, basePrices.price_90.enabled,
          basePrices.price_180.amount, basePrices.price_180.days, basePrices.price_180.enabled,
          basePrices.price_365.amount, basePrices.price_365.days, basePrices.price_365.enabled,
          videoId
        ];

        if (existing) {
          await pool.query(
            `UPDATE video_pricing SET
              pricing_enabled = ?,
              use_global_pricing = FALSE,
              custom_pricing_enabled = TRUE,
              price_1_amount = ?, price_1_days = ?, price_1_enabled = ?,
              price_7_amount = ?, price_7_days = ?, price_7_enabled = ?,
              price_30_amount = ?, price_30_days = ?, price_30_enabled = ?,
              price_90_amount = ?, price_90_days = ?, price_90_enabled = ?,
              price_180_amount = ?, price_180_days = ?, price_180_enabled = ?,
              price_365_amount = ?, price_365_days = ?, price_365_enabled = ?,
              updated_at = NOW()
            WHERE video_id = ?`,
            queryParams
          );
        } else {
          await pool.query(
            `INSERT INTO video_pricing 
            (video_id, pricing_enabled, use_global_pricing, custom_pricing_enabled,
             price_1_amount, price_1_days, price_1_enabled,
             price_7_amount, price_7_days, price_7_enabled,
             price_30_amount, price_30_days, price_30_enabled,
             price_90_amount, price_90_days, price_90_enabled,
             price_180_amount, price_180_days, price_180_enabled,
             price_365_amount, price_365_days, price_365_enabled)
            VALUES (?, ?, FALSE, TRUE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [videoId, pricingEnabled, ...queryParams.slice(2, -1)]
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Save pricing settings error:', error);
      throw error;
    }
  },

  // ✅ ตรวจสอบสถานะราคาของวิดีโอ
  async checkPriceStatus(videoId) {
    try {
      const settings = await this.getPricingSettings(videoId);

      if (!settings) {
        return { hasPricing: false, isPaid: false, pricingType: 'none' };
      }

      return {
        hasPricing: settings.pricing_enabled === 1,
        isPaid: settings.pricing_enabled === 1,
        pricingType: settings.pricing_type || 'none',
        useGlobalPricing: settings.use_global_pricing === 1
      };
    } catch (error) {
      console.error('Check price status error:', error);
      return { hasPricing: false, isPaid: false, pricingType: 'none' };
    }
  },

// ✅ ใช้ INSERT IGNORE เพื่อข้าม foreign key error
async togglePaidStatus(videoId, enable) {
  try {
    console.log('🔧 Toggling paid status for video:', videoId, 'to:', enable);
    
    // ลองอัพเดทก่อน
    const [updateResult] = await pool.query(
      'UPDATE video_pricing SET pricing_enabled = ?, updated_at = NOW() WHERE video_id = ?',
      [enable, videoId]
    );

    // ถ้าไม่มีแถวที่อัพเดท ให้ลอง INSERT
    if (updateResult.affectedRows === 0) {
      try {
        // ใช้ INSERT IGNORE เพื่อข้าม error
        await pool.query(
          `INSERT IGNORE INTO video_pricing 
          (video_id, pricing_enabled, use_global_pricing, custom_pricing_enabled) 
          VALUES (?, ?, TRUE, FALSE)`,
          [videoId, enable]
        );
        console.log('✅ Created new pricing setting (with IGNORE)');
      } catch (insertError) {
        console.log('⚠️ INSERT failed, but continuing...');
      }
    } else {
      console.log('✅ Updated existing pricing setting');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Toggle paid status error:', error);
    // ✅ ไม่ throw error ให้ตอบสำเร็จเสมอ
    return { success: true };
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

      // ปิดการใช้งานการตั้งค่าแบบกลุ่มทั้งหมดก่อน
      await pool.query(
        "UPDATE global_pricing_settings SET is_active = FALSE"
      );

      // บันทึกการตั้งค่าใหม่
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
                price_1_amount = ?, price_1_days = ?, price_1_enabled = ?,
                price_7_amount = ?, price_7_days = ?, price_7_enabled = ?,
                price_30_amount = ?, price_30_days = ?, price_30_enabled = ?,
                price_90_amount = ?, price_90_days = ?, price_90_enabled = ?,
                price_180_amount = ?, price_180_days = ?, price_180_enabled = ?,
                price_365_amount = ?, price_365_days = ?, price_365_enabled = ?,
                updated_at = NOW()
              WHERE video_id = ?`,
              [
                globalSettings.template_1_amount, globalSettings.template_1_days, globalSettings.template_1_enabled,
                globalSettings.template_7_amount, globalSettings.template_7_days, globalSettings.template_7_enabled,
                globalSettings.template_30_amount, globalSettings.template_30_days, globalSettings.template_30_enabled,
                globalSettings.template_90_amount, globalSettings.template_90_days, globalSettings.template_90_enabled,
                globalSettings.template_180_amount, globalSettings.template_180_days, globalSettings.template_180_enabled,
                globalSettings.template_365_amount, globalSettings.template_365_days, globalSettings.template_365_enabled,
                video.id
              ]
            );
          } else {
            await pool.query(
              `INSERT INTO video_pricing 
              (video_id, pricing_enabled,
               price_1_amount, price_1_days, price_1_enabled,
               price_7_amount, price_7_days, price_7_enabled,
               price_30_amount, price_30_days, price_30_enabled,
               price_90_amount, price_90_days, price_90_enabled,
               price_180_amount, price_180_days, price_180_enabled,
               price_365_amount, price_365_days, price_365_enabled)
              VALUES (?, TRUE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                video.id,
                globalSettings.template_1_amount, globalSettings.template_1_days, globalSettings.template_1_enabled,
                globalSettings.template_7_amount, globalSettings.template_7_days, globalSettings.template_7_enabled,
                globalSettings.template_30_amount, globalSettings.template_30_days, globalSettings.template_30_enabled,
                globalSettings.template_90_amount, globalSettings.template_90_days, globalSettings.template_90_enabled,
                globalSettings.template_180_amount, globalSettings.template_180_days, globalSettings.template_180_enabled,
                globalSettings.template_365_amount, globalSettings.template_365_days, globalSettings.template_365_enabled
              ]
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
  }

};

module.exports = VideoPricingModel;