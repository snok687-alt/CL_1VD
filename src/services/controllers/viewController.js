const ViewModel = require('../models/viewModel');

// ดึงยอดวิวของหลายวิดีโอ
exports.getViews = async (req, res) => {
  try {
    const { video_ids } = req.body;
    if (!Array.isArray(video_ids)) {
      return res.status(400).json({ error: 'video_ids ต้องเป็น array' });
    }

    const views = await ViewModel.getViewCounts(video_ids);
    res.json(views);
  } catch (err) {
    console.error('❌ getViews error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงยอดวิว' });
  }
};

// เพิ่มยอดวิว (เวลามีคนดู)
exports.incrementView = async (req, res) => {
  try {
    const { video_id } = req.body;
    if (!video_id) {
      return res.status(400).json({ error: 'ต้องระบุ video_id' });
    }

    await ViewModel.incrementView(video_id);
    const newCount = await ViewModel.getViewCount(video_id);

    res.json({ success: true, views: newCount });
  } catch (err) {
    console.error('❌ incrementView error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตยอดวิว' });
  }
};
