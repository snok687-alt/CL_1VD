const path = require('path');
const { saveImageMetadata, getAllImages } = require('../models/upload');

async function uploadImage(req, res) {
  console.log('📥 Received upload request');
  console.log('File:', req.file);
  
  if (!req.file) {
    console.log('❌ No file in request');
    return res.status(400).json({ message: '❌ ไม่พบไฟล์ที่อัปโหลด' });
  }

  const { filename, mimetype, size } = req.file;
  const { quantity, days } = req.body;
  console.log(`✅ File received: ${filename}, ${mimetype}, ${size} bytes`);

  try {
    const imageId = await saveImageMetadata(filename, mimetype, size, quantity || null, days || null);
    console.log(`✅ Saved to DB with ID: ${imageId}`);
    res.status(200).json({
      message: '✅ อัปโหลดสำเร็จ',
      imageId,
      filename
    });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
}

async function listImages(req, res) {
  try {
    const images = await getAllImages();
    res.status(200).json(images);
  } catch (err) {
    console.error('❌ ดึงรายการภาพล้มเหลว:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงรายการภาพได้' });
  }
}

module.exports = {
  uploadImage,
  listImages
};
