// test-game-matching.js - ทดสอบการแมปเกมให้แม่นยำ
require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const API_CONFIG = {
  baseUrl: 'https://ap.api-bet.net/api/server',
  sn: 'tnv',
  secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

const COVERS_DIR = path.join(__dirname, '../uploads/games/covers');

function generateSignature() {
  const random = Math.random().toString(36).substring(2, 18);
  const signStr = `${random}${API_CONFIG.sn}${API_CONFIG.secret}`;
  const sign = CryptoJS.MD5(signStr).toString();
  return { random, sign };
}

async function testMatching() {
  try {
    console.log('🧪 ทดสอบการแมปเกม\n');
    
    // ดึงรายการไฟล์ที่มี
    if (!fs.existsSync(COVERS_DIR)) {
      console.log('❌ ไม่พบโฟลเดอร์รูป:', COVERS_DIR);
      return;
    }
    
    const files = fs.readdirSync(COVERS_DIR)
      .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      .sort();
    
    console.log(`📁 พบไฟล์รูป: ${files.length} ไฟล์`);
    console.log(`   ตัวอย่าง: ${files.slice(0, 10).join(', ')}\n`);
    
    // ดึงรายการเกมจาก API
    console.log('📡 ดึงรายการเกมจาก API...');
    const { random, sign } = generateSignature();
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/gameCode`,
      { platType: 'ag', limit: 500 },
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
    
    const games = response.data.code === 10000 && Array.isArray(response.data.data)
      ? response.data.data
      : [];
    
    console.log(`✅ ได้เกม: ${games.length} ตัว\n`);
    
    // วิเคราะห์รูปแบบการตั้งชื่อไฟล์
    console.log('📊 วิเคราะห์รูปแบบการตั้งชื่อไฟล์:');
    const patterns = {};
    
    files.forEach(f => {
      const ext = path.extname(f).toLowerCase();
      const name = path.basename(f, ext);
      
      let pattern = 'unknown';
      if (/^[A-Z]+\d*$/i.test(name)) {
        pattern = 'CODE_ONLY'; // เช่น BAC, DT, etc
      } else if (/^[A-Z]+/.test(name)) {
        pattern = 'CODE_PREFIX'; // เช่น BAC_GAME, BAC game
      } else if (/[a-z0-9]{6,}/.test(name.toLowerCase())) {
        pattern = 'DESCRIPTIVE'; // เช่น baccarat_game, dragon_tiger
      }
      
      if (!patterns[pattern]) patterns[pattern] = [];
      patterns[pattern].push(f);
    });
    
    Object.entries(patterns).forEach(([pattern, list]) => {
      console.log(`   ${pattern}: ${list.length} ไฟล์`);
      if (list.length <= 5) {
        list.forEach(f => console.log(`      - ${f}`));
      } else {
        list.slice(0, 3).forEach(f => console.log(`      - ${f}`));
        console.log(`      ... และอีก ${list.length - 3} ไฟล์`);
      }
    });
    
    // เสนอแนะการแมป
    console.log('\n💡 เสนอแนะ:');
    console.log('   1. ตั้งชื่อไฟล์ตรงตามรหัสเกม (เช่น BAC.jpg, DT.jpg)');
    console.log('   2. หรือตั้งชื่อโดยมีรหัสที่จุดเริ่มต้น (เช่น BAC_Baccarat.jpg)');
    console.log('   3. หลีกเลี่ยงการใช้ชื่อที่คลุมเครือเช่น default, image');
    
    // แสดงเกม 20 ตัวแรก
    console.log('\n📋 รายการเกม 20 ตัวแรก:');
    games.slice(0, 20).forEach((g, idx) => {
      const gameName = g.gameName?.['zh-hans'] || g.gameName?.['en'] || g.gameCode;
      const matchedFile = files.find(f => {
        const cleanCode = g.gameCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = f.toLowerCase().replace(/[^a-z0-9]/g, '');
        return fileName.includes(cleanCode) || fileName.startsWith(cleanCode);
      });
      
      console.log(`   [${idx + 1}] ${g.gameCode.padEnd(10)} - ${gameName.substring(0, 20).padEnd(20)} ${matchedFile ? '✅ ' + matchedFile : '❌ ไม่เจอ'}`);
    });
    
    // สถิติการแมป
    const matchCount = games.slice(0, games.length).filter(g => {
      const cleanCode = g.gameCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      return files.some(f => {
        const fileName = f.toLowerCase().replace(/[^a-z0-9]/g, '');
        return fileName.includes(cleanCode) || fileName.startsWith(cleanCode);
      });
    }).length;
    
    console.log(`\n📊 สถิติการแมป (ระดับขั้นต่ำ):`);
    console.log(`   ได้แมป: ${matchCount}/${games.length} (${Math.round(matchCount / games.length * 100)}%)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  testMatching();
}

module.exports = { testMatching };