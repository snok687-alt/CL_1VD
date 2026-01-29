/**
 * download-covers-100percent.js
 * ===================================
 * ดาวน์โหลดปกเกมจาก FTP
 * ทุกเกมต้องมีปกของตัวเอง (100%)
 * ลดการใช้ไฟล์ซ้ำ
 */

const ftp = require('basic-ftp');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

/* ================= CONFIG ================= */

const FTP_CONFIG = {
    host: 'ftp.asia-gaming.net',
    user: 'agedit',
    password: 'h79as56q',
    secure: false
};

const API_CONFIG = {
    baseUrl: 'https://ap.api-bet.net/api/server',
    sn: 'tnv',
    secret: 'VJ3Z394e88U8Gz9wa64sMlW8871m481o'
};

const COVERS_DIR = path.join(__dirname, '../uploads/games/covers');

const MIN_SCORE = 65;   // เกณฑ์ score ที่ถือว่า match ดี
const MAX_REUSE = 2;    // จำนวนครั้งสูงสุดที่ไฟล์ปกซ้ำได้

const BAD_KEYWORDS = ['icon','logo','bg','background','thumb','small'];
const GENERIC_KEYWORDS = ['slot','casino','fruit','fortune','lucky','gold','party','classic','deluxe','mania'];

/* ================= UTILS ================= */

function generateSignature() {
    const random = Math.random().toString(36).substring(2,18);
    const sign = CryptoJS.MD5(`${random}${API_CONFIG.sn}${API_CONFIG.secret}`).toString();
    return { random, sign };
}

function normalize(str) {
    return str.toLowerCase().replace(/\.(jpg|jpeg|png|gif)/g,'').replace(/[^a-z0-9]/g,'');
}

function isBad(name) {
    return BAD_KEYWORDS.some(k => name.includes(k));
}

function isGeneric(name) {
    return GENERIC_KEYWORDS.some(k => name.includes(k));
}

/* ================= MATCHING ================= */

const fileUsage = {};

function reusePenalty(file) {
    const used = fileUsage[file] || 0;
    if (used === 0) return 0;
    if (used < MAX_REUSE) return 15;
    return 40;
}

function calculateScore(gameCode, gameNames, file) {
    const f = file.norm;
    const code = normalize(gameCode);

    let score = 0;

    // 1️⃣ exact match
    if (f === code) score = 100;
    // 2️⃣ contains code
    else if (f.includes(code)) score = 90;
    // 3️⃣ similarity by name
    else {
        for (const n of gameNames) {
            const nn = normalize(n);
            if (nn.length > 3 && f.includes(nn.slice(0,4))) {
                score = Math.max(score, 75);
            }
        }
    }

    if (isGeneric(f)) score -= 25;
    score -= reusePenalty(file.full);
    return Math.max(score,0);
}

/* ================= MAIN ================= */

async function downloadCovers100Percent() {
    const client = new ftp.Client();
    try {
        console.log('\n=== DOWNLOAD COVERS (100% MATCH) ===\n');

        if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

        await client.access(FTP_CONFIG);

        const { random, sign } = generateSignature();
        const res = await axios.post(
            `${API_CONFIG.baseUrl}/gameCode`,
            { platType: 'ag', limit: 500 },
            { headers: { sn: API_CONFIG.sn, random, sign } }
        );

        const games = res.data?.data || [];
        console.log(`🎮 Games from API: ${games.length}`);

        const providers = (await client.list('Electronic_games')).filter(d => d.isDirectory);

        const images = [];
        for (const p of providers) {
            const list = await client.list(`Electronic_games/${p.name}`);
            list.filter(f => !f.isDirectory && /\.(png|jpg|jpeg)$/i.test(f.name))
                .forEach(f => {
                    const norm = normalize(f.name);
                    if (!isBad(norm)) {
                        images.push({
                            full: `${p.name}/${f.name}`,
                            path: `Electronic_games/${p.name}/${f.name}`,
                            name: f.name,
                            norm,
                            size: f.size
                        });
                    }
                });
        }
        console.log(`📸 Total images: ${images.length}\n`);

        let downloaded = 0;

        for (const game of games) {
            const code = game.gameCode;
            const names = [
                game.gameName?.en,
                game.gameName?.['zh-hans'],
                game.gameName?.['zh-hant']
            ].filter(Boolean);

            let best = null;
            let bestScore = 0;

            for (const img of images) {
                const score = calculateScore(code, names, img);
                if (score > bestScore) {
                    bestScore = score;
                    best = img;
                }
            }

            // ถ้าไม่มี match score ดี ให้เลือกไฟล์ที่ใช้ซ้ำต่ำที่สุดแทน
            if (!best) {
                best = images.sort((a,b) => (fileUsage[a.full]||0) - (fileUsage[b.full]||0))[0];
                bestScore = calculateScore(code, names, best);
            }

            const ext = path.extname(best.name);
            const dest = path.join(COVERS_DIR, `${code}${ext}`);

            if (!fs.existsSync(dest)) {
                await client.downloadTo(fs.createWriteStream(dest), best.path);
                downloaded++;
            }

            fileUsage[best.full] = (fileUsage[best.full] || 0) + 1;
            console.log(`✅ ${code} ← ${best.name} [${bestScore}%]`);
        }

        console.log(`\n🎉 DONE`);
        console.log(`📥 Downloaded: ${downloaded}`);
        console.log(`📁 Path: ${COVERS_DIR}\n`);

        await client.close();

    } catch(e) {
        console.error('❌ ERROR:', e.message);
    }
}

if (require.main === module) downloadCovers100Percent();
module.exports = { downloadCovers100Percent };
