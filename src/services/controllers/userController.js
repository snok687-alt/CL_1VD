const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

const UserController = {

  // ✅ สมัครสมาชิก (รองรับรูปภาพ)
  async register(req, res) {
    try {
      const { name, password, role } = req.body;
      let imagePath = null;

      if (!name || !password)
        return res.status(400).json({ message: 'ກະລຸນາປ້ອນຊື່ ແລະ ລະຫັດຜ່ານ' });

      const exist = await UserModel.findByName(name);
      if (exist)
        return res.status(400).json({ message: 'ຊື່ນີ້ມີແລ້ວ!' });

      // ✅ ตรวจสอบว่ามีไฟล์ภาพถูกอัพโหลดมาหรือไม่
      if (req.file) {
        imagePath = `/uploads/users/${req.file.filename}`;
      }

      const hashed = await bcrypt.hash(password, 10);
      await UserModel.createUser(name, hashed, role || 'user', imagePath);

      res.json({ 
        message: 'ສະໝັກສຳເລັດ',
        image: imagePath 
      });
    } catch (error) {
      console.error('Register error:', error);
      
      // ✅ ลบไฟล์ภาพที่อัพโหลดแล้วถ้าเกิด error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: 'ຜິດພາດໃນການສະໝັກ' });
    }
  },

  // ✅ เข้าสู่ระบบ
  async login(req, res) {
    try {
      const { name, password } = req.body;
      if (!name || !password)
        return res.status(400).json({ message: 'ກະລຸນາປ້ອນຊື່ ແລະ ລະຫັດຜ່ານ' });

      const user = await UserModel.findByName(name);
      if (!user)
        return res.status(404).json({ message: 'ບໍ່ພົບຜູ້ໃຊ້ນີ້' });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: 'ລະຫັດຜິດ' });

      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'ເຂົ້າລະບົບສຳເລັດ',
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role,
          image: user.image 
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'ຜິດພາດໃນການເຂົ້າລະບົບ' });
    }
  },

  // ✅ ดึงผู้ใช้ทั้งหมด
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'ຜິດພາດໃນການດຶງຂໍ້ມູນ' });
    }
  },

  // ✅ ลบผู้ใช้ (ลบรูปภาพด้วย)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const imagePath = await UserModel.deleteUser(id);
      
      // ✅ ลบไฟล์รูปภาพถ้ามี
      if (imagePath) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      
      res.json({ message: 'ລົບສຳເລັດ' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'ຜິດພາດໃນການລົບ' });
    }
  }
};

module.exports = UserController;