// scripts/checkGameTypes.js
require('dotenv').config();
const axios = require('axios');
const CryptoJS = require('crypto-js');

const API_CONFIG = {
  baseUrl: 'https://ap.api-bet.net/api/server',
  sn: 'tnv',
  secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

// สามารถใส่หลาย platType ได้
const PLAT_TYPES = ['ag', 'mg', 'pt', 'bg', 'xg'];

function generateSignature() {
  const random = Math.random().toString(36).substring(2,18);
  const sign = CryptoJS.MD5(`${random}${API_CONFIG.sn}${API_CONFIG.secret}`).toString();
  return { random, sign };
}

async function fetchGames(platType='ag', limit=500) {
  try {
    const { random, sign } = generateSignature();
    const res = await axios.post(
      `${API_CONFIG.baseUrl}/gameCode`,
      { platType, limit },
      { headers: { sn: API_CONFIG.sn, random, sign } }
    );

    if (res.data.code === 10000 && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    console.error(`❌ API error (${platType}):`, res.data.msg);
    return [];
  } catch(err) {
    console.error(`❌ Fetch error (${platType}):`, err.message);
    return [];
  }
}

async function checkGameTypes() {
  const allGames = [];
  
  for (const plat of PLAT_TYPES) {
    const games = await fetchGames(plat, 500);
    console.log(`📡 [${plat}] ดึงเกมมา: ${games.length} ตัว`);
    allGames.push(...games);
  }

  if (!allGames.length) return console.log('❌ ไม่พบเกมจาก API');

  const typeCount = {};
  const sampleGames = {};

  for (const g of allGames) {
    const t = g.gameType || 'unknown';
    typeCount[t] = (typeCount[t] || 0) + 1;

    // เก็บตัวอย่างเกมต่อ type
    if (!sampleGames[t]) sampleGames[t] = [];
    if (sampleGames[t].length < 3) {
      const name = g.gameName?.['en'] || g.gameName?.['zh-hans'] || g.gameCode;
      sampleGames[t].push(name);
    }
  }

  console.log('\n🎯 สรุปหมวดเกมจาก API จริง:\n');
  console.table(typeCount);

  console.log('\n📌 ตัวอย่างเกมแต่ละหมวด:\n');
  for (const [type, names] of Object.entries(sampleGames)) {
    console.log(`- gameType ${type} (${typeCount[type]} เกม):`, names.join(', '));
  }

  console.log(`\n🧮 รวมเกมทั้งหมด: ${allGames.length}`);
}

if (require.main === module) checkGameTypes();
module.exports = { checkGameTypes };
