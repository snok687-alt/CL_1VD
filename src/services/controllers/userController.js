const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

// ✅ ฟังก์ชันช่วยดึงข้อมูล device จาก user-agent
function parseUserAgent(userAgent) {
  const ua = userAgent || '';

  let device = 'Desktop';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect device
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet/i.test(ua)) device = 'Tablet';

  // Detect browser
  if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';

  // Detect OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'MacOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}

const UserController = {

  async register(req, res) {
    try {
      const { name, password, role } = req.body;
      let imagePath = null;

      if (!name || !password)
        return res.status(400).json({ message: 'ກະລຸນາປ້ອນຊື່ ແລະ ລະຫັດຜ່ານ' });

      const exist = await UserModel.findByName(name);
      if (exist)
        return res.status(400).json({ message: 'ຊື່ນີ້ມີແລ້ວ!' });

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

      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ message: 'ຜິດພາດໃນການສະໝັກ' });
    }
  },

  // ✅ อัปเดต login ให้บันทึกประวัติ
  async login(req, res) {
    try {
      const { name, password } = req.body;
      if (!name || !password)
        return res.status(400).json({ message: 'ກະລຸນາປ້ອນຊື່ ແລະ ລະຫັດຜ່ານ' });

      const user = await UserModel.findByName(name);
      if (!user) {
        // บันทึกความพยายาม login ที่ล้มเหลว
        return res.status(404).json({ message: 'ບໍ່ພົບຜູ້ໃຊ້ນີ້' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'ລະຫັດຜິດ' });
      }

      // ✅ อัปเดต last_login
      await UserModel.updateLastLogin(user.id);

      // ✅ บันทึกประวัติการ login
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const { device, browser, os } = parseUserAgent(userAgent);

      await UserModel.createLoginHistory({
        userId: user.id,
        ipAddress,
        userAgent,
        device,
        browser,
        os,
        status: 'success'
      });

      // ✅ สร้างการแจ้งเตือน
      await UserModel.createNotification({
        userId: user.id,
        type: 'login',
        title: 'ເຂົ້າລະບົບສຳເລັດ',
        message: `ເຂົ້າລະບົບຈາກ ${device} - ${browser} ທີ່ IP: ${ipAddress}`
      });

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
          image: user.image,
          lastLogin: new Date()
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'ຜິດພາດໃນການເຂົ້າລະບົບ' });
    }
  },

  // ✅ ดึงข้อมูล user ปัจจุบัน
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ບໍ່ພົບຜູ້ໃຊ້'
        });
      }

      // ✅ ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
      const unreadNotifications = await UserModel.getUnreadNotifications(userId);

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.name,
          email: user.email || '',
          role: user.role,
          imageUrl: user.image,
          lastLogin: user.last_login
        },
        notifications: unreadNotifications
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'ຜິດພາດໃນການດຶງຂໍ້ມູນ'
      });
    }
  },

  // ✅ ดึงการแจ้งเตือนทั้งหมด
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;

      const notifications = await UserModel.getNotifications(userId, limit, offset);
      const unreadCount = await UserModel.getUnreadNotificationCount(userId);

      res.json({
        success: true,
        notifications,
        unreadCount,
        total: notifications.length
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'ຜິດພາດໃນການດຶງການແຈ້ງເຕືອນ'
      });
    }
  },

  // ✅ ทำเครื่องหมายว่าอ่านแล้ว
  async markNotificationAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      await UserModel.markNotificationAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'ທຳເຄື່ອງໝາຍວ່າອ່ານແລ້ວ'
      });
    } catch (error) {
      console.error('Mark notification error:', error);
      res.status(500).json({
        success: false,
        message: 'ຜິດພາດໃນການອັບເດດການແຈ້ງເຕືອນ'
      });
    }
  },

  // ✅ ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;
      await UserModel.markAllNotificationsAsRead(userId);

      res.json({
        success: true,
        message: 'ທຳເຄື່ອງໝາຍທັງໝົດວ່າອ່ານແລ້ວ'
      });
    } catch (error) {
      console.error('Mark all notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'ຜິດພາດໃນການອັບເດດການແຈ້ງເຕືອນ'
      });
    }
  },

  // ✅ ดึงประวัติการ login
  async getLoginHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const history = await UserModel.getLoginHistory(userId, limit, offset);

      res.json({
        success: true,
        history,
        total: history.length
      });
    } catch (error) {
      console.error('Get login history error:', error);
      res.status(500).json({
        success: false,
        message: 'ຜິດພາດໃນການດຶງປະຫວັດການເຂົ້າລະບົບ'
      });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'ຜິດພາດໃນການດຶງຂໍ້ມູນ' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const imagePath = await UserModel.deleteUser(id);

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
  },
async checkProfile(req, res) {
  try {
    const username =
      req.body.username ||
      req.body.name ||
      req.body.user ||
      null;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required"
      });
    }

    const user = await UserModel.findByName(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຊື່ນີ້" 
      });
    }

    return res.json({
      success: true,
      name: user.name,
      profile_image: user.image || null
    });

  } catch (error) {
    console.error("🔥 /check-profile ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}


};

module.exports = UserController;