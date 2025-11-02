const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadImage, listImages } = require('../controllers/upload');

const router = express.Router();

console.log('✅ Upload route loaded');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/images');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('รูปภาพเท่านั้น (PNG, JPG, JPEG, GIF, WebP)'));
    }
  }
});

// เพิ่ม middleware เพื่อดู request
router.use((req, res, next) => {
  console.log(`📨 Received ${req.method} request to: ${req.originalUrl}`);
  next();
});

router.post('/upload', upload.single('image'), uploadImage);
router.get('/images', listImages);

// เพิ่ม error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'ไฟล์มีขนาดใหญ่เกิน 25MB' });
    }
  }
  res.status(500).json({ message: error.message });
});

module.exports = router;