// scripts/syncGameCovers.js - FIXED VERSION (No Duplicate Covers)
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

const EXCLUDE_FILES = [
  'alice in the wild', 'default', 'placeholder', 'no image', 'cover', 'image'
];

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
      { headers: { 'Content-Type': 'application/json', 'sn': API_CONFIG.sn, 'random': random, 'sign': sign }, timeout: 30000 }
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
  
  if (!fs.existsSync(COVERS_DIR)) {
    console.log(`⚠️  โฟลเดอร์ยังไม่มี: ${COVERS_DIR}`);
    return files;
  }
  
  const allFiles = fs.readdirSync(COVERS_DIR);
  
  for (const file of allFiles) {
    if (/\.(png|jpg|jpeg)$/i.test(file)) {
      const lowerFile = file.toLowerCase();
      const isExcluded = EXCLUDE_FILES.some(exclude => lowerFile.includes(exclude));
      if (!isExcluded) {
        files.push({
          fullName: file,
          baseName: file.replace(/\.[^.]+$/, ''),
          normalized: file.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, ''),
          words: file.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2)
        });
      }
    }
  }
  
  console.log(`📁 พบไฟล์ทั้งหมด: ${files.length} ไฟล์ (หลีกเลี่ยง default images)\n`);
  return files;
}

function calculateMatchScore(gameCode, gameName, file) {
  let score = 0;
  const cleanCode = gameCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanName = gameName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  
  for (const exclude of EXCLUDE_FILES) {
    if (file.normalized.includes(exclude.replace(/[^a-z0-9]/g, ''))) return { score: -1 };
  }
  
  if (file.normalized === cleanCode) return { score: 100 };
  if (file.words.some(w => w === cleanCode)) return { score: 95 };
  if (file.normalized.includes(cleanCode)) score = Math.max(score, 85);
  
  const prefix2 = cleanCode.substring(0,2);
  const prefix3 = cleanCode.substring(0,3);
  if (prefix3.length >=3 && file.normalized.includes(prefix3)) score = Math.max(score, 75);
  else if (file.normalized.includes(prefix2)) score = Math.max(score, 50);
  
  const keywords = GAME_KEYWORDS[gameCode] || [];
  for (const keyword of keywords) {
    const norm = keyword.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
    if (file.normalized.includes(norm)) score = Math.max(score, 80);
  }
  
  if (cleanName.length > 2) {
    let common = 0;
    for (const c of cleanName) if (file.normalized.includes(c)) common++;
    const ratio = common / Math.max(cleanName.length,1);
    if (ratio > 0.6) score = Math.max(score, Math.floor(ratio*70));
  }
  
  if (file.baseName.length > 16 && score===0) score = Math.max(score, 45);
  
  return { score };
}

async function syncGameCovers() {
  let connection;
  try {
    console.log('🚀 เริ่มซิงค์ข้อมูลเกม (Advanced Matching v2)\n');
    
    const fileIndex = buildFileIndex();
    if (fileIndex.length === 0) return console.log('❌ ไม่พบไฟล์รูป');
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ เชื่อมต่อ database สำเร็จ\n');
    
    const games = await fetchGameList('ag', 500);
    if (games.length === 0) return console.log('❌ ไม่พบข้อมูลเกมจาก API');
    
    // สร้างตาราง
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'game_covers'"
    );
    if (tables.length === 0) {
      console.log('สร้างตาราง game_covers...');
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
    
    console.log(`📊 ประมวลผล ${games.length} เกม...\n`);
    
    let created=0, updated=0, matched=0, notMatched=0;
    const usedFiles = new Set();
    const matchedGamesList = [];
    
    for (let i=0;i<games.length;i++) {
      const game = games[i];
      const gameCode = game.gameCode;
      const gameType = game.gameType;
      const gameName = game.gameName?.['zh-hans'] || game.gameName?.['en'] || gameCode;
      
      let bestFile=null, bestScore=0;
      
      for (const file of fileIndex) {
        if (usedFiles.has(file.fullName)) continue; // ❌ ป้องกันใช้ไฟล์ซ้ำ
        const { score } = calculateMatchScore(gameCode, gameName, file);
        if (score > bestScore) {
          bestScore = score;
          bestFile = file;
        }
      }
      
      if (bestScore >= 50 && bestFile) {
        const imageUrl = `${COVERS_URL_PATH}/${bestFile.fullName}`;
        usedFiles.add(bestFile.fullName);
        
        const [existing] = await connection.query('SELECT id FROM game_covers WHERE game_code=?',[gameCode]);
        if (existing.length>0) {
          await connection.query(`UPDATE game_covers SET image_url=?, game_name=?, game_type=?, status=1, updated_at=NOW() WHERE game_code=?`, [imageUrl, gameName, gameType, gameCode]);
          updated++;
        } else {
          await connection.query(`INSERT INTO game_covers (game_code, plat_type, image_url, game_name, game_type, status) VALUES (?,?,?,?,?,?)`, [gameCode,'ag',imageUrl,gameName,gameType,1]);
          created++;
        }
        
        matched++;
        matchedGamesList.push({ code: gameCode, name: gameName, file: bestFile.fullName, score: bestScore });
      } else {
        notMatched++;
        if (i<5 || (i+1)%100===0) console.log(`⚠️  [${gameCode}] ไม่พบความตรงกัน (score: ${bestScore})`);
      }
      
      if ((i+1)%50===0) console.log(`⏳ ประมวลผล: ${i+1}/${games.length} (แมทได้: ${matched}, ไม่ได้: ${notMatched})`);
    }
    
    const unusedFiles = fileIndex.filter(f=>!usedFiles.has(f.fullName));
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ เสร็จสิ้น!`);
    console.log(`${'='.repeat(70)}`);
    console.log(`   ✨ สร้างใหม่: ${created}`);
    console.log(`   🔄 อัปเดต: ${updated}`);
    console.log(`   ✅ แมทได้ทั้งหมด: ${matched}`);
    console.log(`   ❌ แมทไม่ได้: ${notMatched}`);
    console.log(`   📊 สัดส่วน: ${matched}/${matched+notMatched} (${Math.round(matched/(matched+notMatched)*100)}%)`);
    console.log(`   📁 ไฟล์ที่ใช้แล้ว: ${usedFiles.size}/${fileIndex.length}`);
    console.log(`   📁 ไฟล์ที่ไม่ใช้: ${unusedFiles.length}\n`);
    
    console.log('📋 ตัวอย่างเกมที่แมทได้ (15 ตัวแรก):');
    matchedGamesList.slice(0,15).forEach((g,i)=>{
      console.log(`   ✅ [${i+1}] ${g.name} (${g.code}) [Score: ${g.score}] → ${g.file}`);
    });
    
  } catch(err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) syncGameCovers();
module.exports = { syncGameCovers };
