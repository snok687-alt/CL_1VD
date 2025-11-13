// controllers/linkController.js
const linkModel = require('../models/linkModel');

// ✅ เพิ่มลิงก์ใหม่
exports.addLink = async (req, res) => {
  try {
    const { title_links, name_links } = req.body;
    if (!title_links || !name_links) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    const id = await linkModel.createLink(title_links, name_links);
    res.json({ message: 'บันทึกลิงก์สำเร็จ', id });
  } catch (err) {
    console.error('❌ addLink error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
};

// ✅ ดึงลิงก์ทั้งหมด
exports.getLinks = async (req, res) => {
  try {
    const links = await linkModel.getAllLinks();
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

// ✅ อัปเดตลิงก์
exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title_links, name_links } = req.body;
    await linkModel.updateLink(id, title_links, name_links);
    res.json({ message: 'อัปเดตลิงก์สำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถอัปเดตได้' });
  }
};

// ✅ ลบลิงก์
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    await linkModel.deleteLink(id);
    res.json({ message: 'ลบลิงก์สำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถลบได้' });
  }
};
