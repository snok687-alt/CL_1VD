// controllers/viewController.js
const ViewModel = require('../models/viewModel');

// เพิ่มยอดวิว
exports.incrementView = async (req, res) => {
  try {
    const { video_id } = req.body;
    
    console.log('📥 รับคำขอเพิ่มวิว:', { video_id, body: req.body });

    if (!video_id && video_id !== 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'ต้องระบุ video_id',
        received: req.body 
      });
    }

    // ตรวจสอบว่า video_id เป็น number ที่ถูกต้อง
    const videoIdNum = parseInt(video_id);
    if (isNaN(videoIdNum)) {
      return res.status(400).json({ 
        success: false, 
        error: 'video_id ต้องเป็นตัวเลข',
        received: video_id 
      });
    }

    await ViewModel.incrementView(videoIdNum);
    const newCount = await ViewModel.getViewCount(videoIdNum);

    console.log(`✅ เพิ่มวิวสำเร็จ: video_id=${videoIdNum}, วิวใหม่=${newCount}`);

    res.json({ 
      success: true, 
      views: newCount,
      video_id: videoIdNum
    });

  } catch (err) {
    console.error('❌ incrementView controller error:', err);
    
    // ตรวจสอบ error จาก MySQL
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'video_id นี้ไม่มีอยู่ในระบบ',
        video_id: req.body.video_id
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการอัปเดตยอดวิว',
      details: err.message 
    });
  }
};

// ดึงยอดวิวของหลายวิดีโอ
exports.getViews = async (req, res) => {
  try {
    const { video_ids } = req.body;
    
    console.log('📥 รับคำขอ getViews:', { video_ids });

    if (!Array.isArray(video_ids)) {
      return res.status(400).json({ 
        success: false,
        error: 'video_ids ต้องเป็น array' 
      });
    }

    const views = await ViewModel.getViewCounts(video_ids);
    console.log('📊 ส่งกลับยอดวิว:', views);

    res.json(views);

  } catch (err) {
    console.error('❌ getViews controller error:', err);
    res.status(500).json({ 
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงยอดวิว',
      details: err.message 
    });
  }
};