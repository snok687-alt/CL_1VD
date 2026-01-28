//download-ag-covers.js
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadCovers() {
  const client = new ftp.Client();
  let count = 0;
  
  async function searchFolder(folderPath) {
    try {
      await client.cd(folderPath);
      const files = await client.list();
      
      for (const file of files) {
        if (file.isDirectory) {
          console.log(`📂 ค้นหา: ${folderPath}/${file.name}`);
          await searchFolder(file.name);
          await client.cdup();
        } else if (file.isFile && (file.name.endsWith('.png') || file.name.endsWith('.jpg'))) {
          try {
            await client.downloadTo(fs.createWriteStream(file.name), file.name);
            count++;
            console.log(`✅ ${file.name}`);
            if (count >= 200) throw new Error('limit');
          } catch (e) {
            if (e.message === 'limit') throw e;
          }
        }
      }
    } catch (err) {
      if (err.message === 'limit') throw err;
    }
  }
  
  try {
    console.log('🔗 เชื่อมต่อ FTP...');
    await client.access({
      host: 'ftp.asia-gaming.net',
      user: 'agedit',
      password: 'h79as56q',
      secure: false
    });
    
    console.log('📂 ไปที่ Electronic_games...\n');
    await client.cd('Electronic_games');
    
    await searchFolder('.');
    
    console.log(`\n✅ เสร็จ! ดาวน์โหลด ${count} รูป`);
    await client.close();
  } catch (err) {
    if (err.message !== 'limit') {
      console.error('❌ Error:', err.message);
    }
  }
}

downloadCovers();
