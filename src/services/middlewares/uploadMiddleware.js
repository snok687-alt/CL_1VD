const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const userImagesDir = path.join(uploadDir, 'users');
if (!fs.existsSync(userImagesDir)) {
  fs.mkdirSync(userImagesDir, { recursive: true });
}

// ✅ ตั้งค่า storage สำหรับ multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userImagesDir);
  },
  filename: (req, file, cb) => {
    // สร้างชื่อไฟล์แบบ unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'user-' + uniqueSuffix + ext);
  }
});

// ✅ ฟิลเตอร์ไฟล์ (รับเฉพาะภาพ)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์ภาพเท่านั้น!'), false);
  }
};

// ✅ สร้าง middleware อัพโหลด
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

module.exports = upload;