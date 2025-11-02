const {
  getVideoById,
  insertVideo,
  getRating,
  insertRating,
  updateRating
} = require('../models/star');

async function rateVideo(req, res) {
  const { video_id, rating } = req.body;

  if (!video_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลไม่ถูกต้อง (video_id หรือ rating ผิด)'
    });
  }

  try {
    const video = await getVideoById(video_id);

    if (!video) {
      await insertVideo(video_id, `Video ${video_id}`);
    }

    const ratingData = await getRating(video_id);

    if (!ratingData) {
      const initialStars = [0, 0, 0, 0, 0];
      initialStars[rating - 1] = 1;
      await insertRating(video_id, initialStars);
    } else {
      await updateRating(video_id, rating);
    }

    console.log('✅ บันทึกคะแนนสำเร็จ');
    return res.json({ success: true, message: `ให้ ${rating} ดาวแล้ว` });
  } catch (err) {
    console.error('❌ ให้คะแนนผิดพลาด:', err);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์: ' + err.message
    });
  }
}

async function getRatingByVideoId(req, res) {
  const { videoId } = req.params;

  try {
    const ratingData = await getRating(videoId);

    if (!ratingData) {
      return res.json({
        video_id: parseInt(videoId),
        star_1: 0,
        star_2: 0,
        star_3: 0,
        star_4: 0,
        star_5: 0
      });
    }

    res.json(ratingData);
  } catch (err) {
    console.error('❌ ดึงข้อมูลคะแนนผิดพลาด:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
}

module.exports = {
  rateVideo,
  getRatingByVideoId
};
