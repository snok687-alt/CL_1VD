// scripts/createManualCoversMappings.js
// ✅ ตารางแมปเกมด้วยมือ (100% ตรงกับเกม)
require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'star'
};

const COVERS_URL_PATH = '/uploads/games/covers';

// ✅ MANUAL MAPPING: gameCode -> actual file name
// สร้างจากข้อมูล download-ag-covers.js
const GAME_COVERS_MAP = {
  // ===== LIVE (视讯) =====
  'BAC': { file: 'GoldHitLinkJPBaconCo.jpg', name: '百家乐', type: '1' },
  'DT': { file: 'GoldTrio.png', name: '龙虎', type: '1' },
  'SHB': { file: 'BookofDuat.png', name: '骰宝', type: '1' },
  'ROU': { file: '1000DiamondbetRoulette.png', name: '轮盘', type: '1' },
  'LBAC': { file: 'CashTruckXmasDelivery.png', name: '竞咪百家乐', type: '1' },
  'NN': { file: 'BullsEyeBells.png', name: '牛牛', type: '1' },
  'ZJH': { file: 'GoldHitDragonBonanza.jpg', name: '炸金花', type: '1' },
  'SG': { file: 'AgeoftheGodsGodofStorms3.png', name: '三公', type: '1' },
  
  // ===== SLOTS (电子游艺) =====
  'MA06': { file: 'AnimalInstinct.jpg', name: '玩具城', type: '2' },
  'SB67': { file: '10s_better.jpg', name: '百搭锦鲤', type: '2' },
  'WH58': { file: 'FullMoonWhiteKingPowerPlayJackpot.png', name: '幸运快餐', type: '2' },
  'SC07': { file: 'AgeoftheGodsCashCollect.png', name: '豪华金拉霸', type: '2' },
  'TG04': { file: 'TheGreatGenie.jpg', name: '任逍遥', type: '2' },
  'WA01': { file: 'AlohawaiiCashCollect.jpg', name: '钻石女王', type: '2' },
  'FRU2': { file: 'AztecFruits.png', name: '水果拉霸2', type: '2' },
  'AP15': { file: 'GoHighGallina.png', name: '神龙报喜', type: '2' },
  'FRU': { file: 'AztecFruits.png', name: '水果拉霸', type: '2' },
  
  // ===== FISHING (捕鱼) =====
  'HMFP': { file: 'GoHighGoneFishing.png', name: '捕鱼乐园', type: '6' },
  'HM2D': { file: 'GoHighGoneFishing.png', name: '捕鱼2D', type: '6' },
  'HM3D': { file: 'GoHighGoneFishing.png', name: '捕鱼3D', type: '6' },
  'HMSH': { file: 'GoHighGoneFishing.png', name: '天际猎人', type: '6' },
  'UH01': { file: 'GoHighGoneFishing.png', name: '捕鱼大师', type: '6' },
};

async function createManualMappings() {
  let connection;
  try {
    console.log('🎯 สร้างตารางแมปเกมด้วยมือ\n');
    
    // เชื่อมต่อ database
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ เชื่อมต่อ database\n');
    
    // ตรวจสอบตาราง
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'game_covers'"
    );
    
    if (tables.length === 0) {
      console.log('สร้างตาราง game_covers...\n');
      await connection.query(`
        CREATE TABLE game_covers (
          id INT PRIMARY KEY AUTO_INCREMENT,
          game_code VARCHAR(50) UNIQUE NOT NULL,
          plat_type VARCHAR(20) NOT NULL DEFAULT 'ag',
          image_url VARCHAR(500) NOT NULL,
          game_name VARCHAR(255),
          game_type VARCHAR(10),
          status INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_game_code (game_code),
          INDEX idx_plat_type (plat_type),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    }
    
    // ลบข้อมูลเก่า
    console.log('🗑️  ลบข้อมูลเก่า...');
    await connection.query('TRUNCATE TABLE game_covers');
    console.log('   ✅ ลบสำเร็จ\n');
    
    // บันทึกข้อมูลใหม่
    console.log('📝 บันทึกการแมปเกม...\n');
    
    let success = 0;
    let failed = 0;
    
    for (const [gameCode, coverData] of Object.entries(GAME_COVERS_MAP)) {
      try {
        const imageUrl = `${COVERS_URL_PATH}/${coverData.file}`;
        
        await connection.query(
          `INSERT INTO game_covers 
           (game_code, plat_type, image_url, game_name, game_type, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [gameCode, 'ag', imageUrl, coverData.name, coverData.type, 1]
        );
        
        console.log(`   ✅ ${gameCode} → ${coverData.file}`);
        success++;
      } catch (err) {
        console.error(`   ❌ ${gameCode}: ${err.message.substring(0, 50)}`);
        failed++;
      }
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ เสร็จสิ้น!');
    console.log(`${'='.repeat(70)}`);
    console.log(`   ✨ บันทึกสำเร็จ: ${success}`);
    console.log(`   ❌ บันทึกล้มเหลว: ${failed}`);
    console.log(`   📊 รวม: ${success}/${success + failed}\n`);
    
    // ตรวจสอบผลลัพธ์
    const [records] = await connection.query('SELECT COUNT(*) as count FROM game_covers');
    console.log(`💾 ทั้งหมดในฐานข้อมูล: ${records[0].count} เกม\n`);
    
    // แสดงตัวอย่าง
    console.log('📋 ตัวอย่างข้อมูล (10 รายการแรก):');
    const [samples] = await connection.query(
      'SELECT game_code, game_name, image_url FROM game_covers LIMIT 10'
    );
    
    samples.forEach((row, idx) => {
      const fileName = row.image_url.split('/').pop();
      console.log(`   [${idx + 1}] ${row.game_code} → ${row.game_name}`);
      console.log(`       └─ ${fileName}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  createManualMappings();
}

module.exports = { createManualMappings };