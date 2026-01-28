// scripts/syncGameCovers.js - FIXED VERSION
require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'star'
};

const API_CONFIG = {
  baseUrl: 'https://ap.api-bet.net/api/server',
  sn: 'tnv',
  secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

const COVERS_DIR = path.join(__dirname, '../uploads/games/covers');
const COVERS_URL_PATH = '/uploads/games/covers';

// ✅ FIXED: ไฟล์ที่ต้องหลีกเลี่ยง (default/placeholder)
const EXCLUDE_FILES = [
  'alice in the wild',
  'default',
  'placeholder',
  'no image',
  'cover',
  'image'
];

// ✅ Game Code -> Keywords Mapping (ปรับปรุง)
const GAME_KEYWORDS = {
  'BAC': ['baccarat', 'bacon', '百家乐'],
  'DT': ['dragon', 'tiger', 'trio', 'sinbad'],
  'ROU': ['roulette', 'diamond', '轮盘'],
  'SG': ['three', 'gods', 'storm', '三公'],
  'FRU': ['fruit', 'aztec', '水果'],
  'FRU2': ['fruit', '水果', 'clover'],
  'SHB': ['sic', 'bo', 'dice', '骰'],
  'NN': ['cow', 'bull', '牛'],
  'VG': ['vela', 'gaming'],
  'HM': ['fishing', 'hunt', '捕鱼'],
  'HM2D': ['fishing', 'hunt', '捕鱼'],
  'HM3D': ['fishing', 'hunt', '捕鱼'],
  'HMFP': ['fishing', 'hunt', '捕鱼'],
  'HMSH': ['hunting', '猎'],
  'UH01': ['fishing', '鱼'],
  'XG': ['luck', '幸运'],
  'YP': ['yp', '斗'],
  'SB': ['slot', '老虎'],
  'WH': ['whale', '鲸'],
  'MA': ['magic', 'master'],
};

if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  console.log(`✅ สร้างโฟลเดอร์: ${COVERS_DIR}`);
}

function generateSignature() {
  const random = Math.random().toString(36).substring(2, 18);
  const signStr = `${random}${API_CONFIG.sn}${API_CONFIG.secret}`;
  const sign = CryptoJS.MD5(signStr).toString();
  return { random, sign };
}

async function fetchGameList(platType = 'ag', limit = 500) {
  try {
    const { random, sign } = generateSignature();
    console.log(`📡 ดึงเกมจาก API...`);
    
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/gameCode`,
      { platType, limit },
      {
        headers: {
          'Content-Type': 'application/json',
          'sn': API_CONFIG.sn,
          'random': random,
          'sign': sign
        },
        timeout: 30000
      }
    );
    
    if (response.data.code === 10000 && Array.isArray(response.data.data)) {
      console.log(`✅ ได้เกม ${response.data.data.length} ตัว\n`);
      return response.data.data;
    }
    
    console.error('❌ API Error:', response.data.msg);
    return [];
  } catch (error) {
    console.error('❌ Error fetching games:', error.message);
    return [];
  }
}

function buildFileIndex() {
  const files = [];
  
  try {
    if (!fs.existsSync(COVERS_DIR)) {
      console.log(`⚠️  โฟลเดอร์ยังไม่มี: ${COVERS_DIR}`);
      return files;
    }
    
    const allFiles = fs.readdirSync(COVERS_DIR);
    
    for (const file of allFiles) {
      if (/\.(png|jpg|jpeg)$/i.test(file)) {
        // ✅ FIXED: ตรวจหา exclude files ก่อน
        const lowerFile = file.toLowerCase();
        const isExcluded = EXCLUDE_FILES.some(exclude => lowerFile.includes(exclude));
        
        if (!isExcluded) {
          files.push({
            fullName: file,
            baseName: file.replace(/\.[^.]+$/, ''),
            normalized: file.toLowerCase().replace(/[^a-z0-9]/g, ''),
            words: file.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2)
          });
        }
      }
    }
    
    console.log(`📁 พบไฟล์ทั้งหมด: ${files.length} ไฟล์ (หลีกเลี่ยง default images)\n`);
    return files;
  } catch (err) {
    console.error('❌ Error reading covers directory:', err.message);
    return files;
  }
}

// ✅ FIXED: ปรับปรุง matching algorithm
function calculateMatchScore(gameCode, gameName, file, debug = false) {
  let score = 0;
  const reasons = [];
  
  const cleanCode = gameCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanName = gameName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  
  // ❌ ตรวจหาไฟล์ที่ต้องหลีกเลี่ยง
  for (const exclude of EXCLUDE_FILES) {
    if (file.normalized.includes(exclude.replace(/[^a-z0-9]/g, ''))) {
      return { score: -1, reasons: ['❌ ไฟล์ default/placeholder'] };
    }
  }
  
  // 1️⃣ รหัสเกมตรงกับชื่อไฟล์ (100% match)
  if (file.normalized === cleanCode) {
    score = 100;
    reasons.push('✓ รหัสตรงกับชื่อไฟล์ (+100)');
    return { score, reasons };
  }
  
  // 2️⃣ รหัสเกมอยู่ในชื่อไฟล์ (word boundary)
  if (file.words.some(w => w === cleanCode)) {
    score += 95;
    reasons.push(`✓ รหัส "${gameCode}" เป็น word แยก (+95)`);
    return { score, reasons };
  }
  
  // 3️⃣ รหัสเกมอยู่ในชื่อไฟล์ (substring)
  if (file.normalized.includes(cleanCode)) {
    score += 85;
    reasons.push(`✓ รหัส "${gameCode}" อยู่ในไฟล์ (+85)`);
  }
  
  // 4️⃣ ตัวแรก 3+ ตัวของรหัส
  if (cleanCode.length >= 2) {
    const prefix2 = cleanCode.substring(0, 2);
    const prefix3 = cleanCode.substring(0, 3);
    
    if (prefix3.length >= 3 && file.normalized.includes(prefix3)) {
      if (score < 85) {
        score = Math.max(score, 75);
        reasons.push(`✓ ตัวแรก 3 ตัว "${prefix3}" ตรง (+75)`);
      }
    } else if (file.normalized.includes(prefix2)) {
      if (score < 75) {
        score = Math.max(score, 50);
        reasons.push(`✓ ตัวแรก 2 ตัว "${prefix2}" ตรง (+50)`);
      }
    }
  }
  
  // 5️⃣ ค้นหาจาก keywords mapping
  const keywords = GAME_KEYWORDS[gameCode] || [];
  if (keywords.length > 0) {
    for (const keyword of keywords) {
      const keywordNorm = keyword.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
      if (file.normalized.includes(keywordNorm)) {
        score = Math.max(score, 80);
        reasons.push(`✓ Keyword "${keyword}" ตรงกับไฟล์ (+80)`);
        break;
      }
    }
  }
  
  // 6️⃣ ชื่อเกม Chinese ตรงกับชื่อไฟล์
  if (cleanName.length > 2) {
    const fileNormalized = file.normalized;
    let commonChars = 0;
    
    for (const char of cleanName) {
      if (fileNormalized.includes(char)) commonChars++;
    }
    
    const matchRatio = commonChars / Math.max(cleanName.length, 1);
    if (matchRatio > 0.6) {
      const points = Math.floor(matchRatio * 70);
      score = Math.max(score, points);
      reasons.push(`✓ ชื่อเกม Chinese ตรง ${Math.round(matchRatio * 100)}% (+${points})`);
    }
  }
  
  // 7️⃣ ชื่อไฟล์ยาวและมี game code = ระบบใช้ข้างต้นแล้ว
  if (file.baseName.length > 16 && score === 0) {
    score = Math.max(score, 45);
    reasons.push(`✓ ชื่อไฟล์ยาว (${file.baseName.length} ตัว) = เกมจริง (+45)`);
  }
  
  if (debug && score > 0) {
    console.log(`  [${gameCode}] → [${file.fullName}]: ${score}pts`);
    reasons.forEach(r => console.log(`    ${r}`));
  }
  
  return { score, reasons };
}

async function syncGameCovers() {
  let connection;
  try {
    console.log('🚀 เริ่มซิงค์ข้อมูลเกม (Advanced Matching v2)\n');
    console.log('📋 Config:');
    console.log(`   Database: ${DB_CONFIG.database}`);
    console.log(`   Covers Dir: ${COVERS_DIR}`);
    console.log(`   Exclude Files: ${EXCLUDE_FILES.join(', ')}\n`);
    
    // สร้าง file index
    const fileIndex = buildFileIndex();
    
    if (fileIndex.length === 0) {
      console.log('❌ ไม่พบไฟล์รูปในโฟลเดอร์ (หรือถูกตัดออกทั้งหมด)');
      return;
    }
    
    // เชื่อมต่อ database
    console.log('🔗 เชื่อมต่อ database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ เชื่อมต่อ database สำเร็จ\n');
    
    // ดึงเกม
    const games = await fetchGameList('ag', 500);
    
    if (games.length === 0) {
      console.log('❌ ไม่พบข้อมูลเกมจาก API');
      return;
    }
    
    // สร้างตาราง
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
      console.log('✅ สร้างตาราง game_covers\n');
    }
    
    // ✅ FIXED: ลบข้อมูลเก่า (ตัวเลือก)
    console.log('🗑️  ลบข้อมูลเก่าที่มี "Alice in the Wild"...');
    const [deleteResult] = await connection.query(
      `DELETE FROM game_covers WHERE image_url LIKE '%Alice%' OR image_url LIKE '%#%'`
    );
    if (deleteResult.affectedRows > 0) {
      console.log(`   ลบ ${deleteResult.affectedRows} รายการเก่า\n`);
    }
    
    console.log(`📊 กำลังประมวลผล ${games.length} เกม...\n`);
    
    let created = 0;
    let updated = 0;
    let matched = 0;
    let notMatched = 0;
    let skipped = 0;
    const matchedGamesList = [];
    const usedFiles = new Set();
    
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const gameCode = game.gameCode;
      const gameType = game.gameType;
      const gameName = game.gameName?.['zh-hans'] || game.gameName?.['en'] || gameCode;
      
      let bestFile = null;
      let bestScore = 0;
      
      // ค้นหาไฟล์ที่ดีที่สุด
      for (const file of fileIndex) {
        const { score } = calculateMatchScore(gameCode, gameName, file, false);
        if (score > bestScore) {
          bestScore = score;
          bestFile = file;
        }
      }
      
      // ✅ FIXED: ยอมรับเฉพาะ score >= 50 (หลีกเลี่ยงแมทผิด)
      if (bestScore >= 50 && bestFile) {
        try {
          const imageUrl = `${COVERS_URL_PATH}/${bestFile.fullName}`;
          usedFiles.add(bestFile.fullName);
          
          const [existing] = await connection.query(
            'SELECT id FROM game_covers WHERE game_code = ?',
            [gameCode]
          );
          
          if (existing.length > 0) {
            await connection.query(
              `UPDATE game_covers 
               SET image_url = ?, game_name = ?, game_type = ?, status = 1, updated_at = NOW()
               WHERE game_code = ?`,
              [imageUrl, gameName, gameType, gameCode]
            );
            updated++;
          } else {
            await connection.query(
              `INSERT INTO game_covers 
               (game_code, plat_type, image_url, game_name, game_type, status)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [gameCode, 'ag', imageUrl, gameName, gameType, 1]
            );
            created++;
          }
          
          matched++;
          matchedGamesList.push({
            code: gameCode,
            name: gameName,
            file: bestFile.fullName,
            score: bestScore
          });
        } catch (err) {
          console.error(`❌ DB Error [${gameCode}]: ${err.message.substring(0, 40)}`);
        }
      } else {
        notMatched++;
        // ✅ FIXED: บันทึกเกมที่แมทไม่ได้
        if (i < 5 || (i + 1) % 100 === 0) {
          const scoreStr = bestScore > 0 ? ` (score: ${bestScore})` : '';
          console.log(`   ⚠️  [${gameCode}] ไม่พบความตรงกัน${scoreStr}`);
        }
      }
      
      if ((i + 1) % 50 === 0) {
        console.log(`⏳ ประมวลผล: ${i + 1}/${games.length} (แมทได้: ${matched}, ไม่ได้: ${notMatched})`);
      }
    }
    
    const unusedFiles = fileIndex.filter(f => !usedFiles.has(f.fullName));
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ เสร็จสิ้น!`);
    console.log(`${'='.repeat(70)}`);
    console.log(`   ✨ สร้างใหม่: ${created}`);
    console.log(`   🔄 อัปเดต: ${updated}`);
    console.log(`   ✅ แมทได้ทั้งหมด: ${matched}`);
    console.log(`   ❌ แมทไม่ได้: ${notMatched}`);
    console.log(`   📊 สัดส่วน: ${matched}/${matched + notMatched} (${Math.round(matched / (matched + notMatched) * 100)}%)`);
    console.log(`   📁 ไฟล์ที่ใช้แล้ว: ${usedFiles.size}/${fileIndex.length}`);
    console.log(`   📁 ไฟล์ที่ไม่ใช้: ${unusedFiles.length}\n`);
    
    // แสดงตัวอย่าง
    console.log('📋 ตัวอย่างเกมที่แมทได้ (15 ตัวแรก):');
    matchedGamesList.slice(0, 15).forEach((game, idx) => {
      console.log(`   ✅ [${idx + 1}] ${game.name} (${game.code}) [Score: ${game.score}]`);
      console.log(`      → ${game.file}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  syncGameCovers();
}

module.exports = { syncGameCovers };