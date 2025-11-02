import React, { useState } from 'react';

function Star() {
  const [selectedRating, setSelectedRating] = useState(0);
  const [message, setMessage] = useState('');
  const videoId = 1; // สมมติ video id = 1

  const handleClick = async (rating) => {
    setSelectedRating(rating);
    setMessage('');

    try {
      const res = await fetch('http://47.238.3.148:80/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId, rating }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
      } else {
        setMessage(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ให้ดาววีดีโอ</h1>
      <div>วีดีโอ: ตัวอย่างวีดีโอ</div>
      <div style={{ fontSize: 40, cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleClick(star)}
            style={{ color: star <= selectedRating ? 'gold' : 'gray' }}
          >
            &#9733;
          </span>
        ))}
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Star;
