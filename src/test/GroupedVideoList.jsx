import React, { useEffect, useState } from 'react';
import { getAllVideos } from '../data/videoData';

const PREFIXES = [
  'MIDV','MIDE','MIAA','MIMK','SSIS','SSNI','OFJE','IPX','IPZ','ABP',
  'ABW','ATID','SHKD','RBD','ADN','JUY','JUL','JUC','STARS','STAR',
  'SDDE','SDJS','SDMU','HND','HMN','GVH','CAWD','PRED','DASD','MEYD',
  'DOCP','WAAA','URE','EBOD','EYAN','MDBK','BLK','DVAJ','JUFD','JUTA',
  'MIAE','MIFD','APNS','APAK','VEC','VAGU','VGD','MIST','MISM',
  'NACR','NADE','KIR','FC2-PPV','HEYZO','CARIB','SIRO','GACHI','KBI'
];

// ดึง prefix จาก title เช่น MIDE-123 หรือ MIDE 123
function extractPrefix(title) {
  if (!title) return null;
  for (const p of PREFIXES) {
    const pattern = new RegExp(`\\b${p}[-_ ]?\\d+`, 'i');
    if (pattern.test(title)) {
      return p;
    }
  }
  return null;
}

const GroupedVideoList = () => {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAndGroup() {
      try {
        const videos = await getAllVideos(500); // ดึงสูงสุด 500 รายการ (หรือมากกว่านี้ตามต้องการ)

        const result = {};

        videos.forEach(video => {
          const prefix = extractPrefix(video.title || '');
          if (prefix) {
            if (!result[prefix]) result[prefix] = [];
            result[prefix].push({
              id: video.id,
              title: video.title
            });
          }
        });

        setGrouped(result);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    }

    fetchAndGroup();
  }, []);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div>❌ {error}</div>;

  return (
    <div>
      <h2>📊 สรุปวิดีโอตาม Prefix</h2>
      {Object.keys(grouped).length === 0 ? (
        <div>ไม่พบวิดีโอที่ตรงกับ prefix ใด ๆ</div>
      ) : (
        Object.entries(grouped).sort().map(([prefix, items]) => (
          <div key={prefix} style={{ marginBottom: '20px' }}>
            <h3>{prefix} — {items.length} รายการ</h3>
            <ul>
              {items.map(video => (
                <li key={video.id}>
                  <strong>{video.title}</strong> (ID: {video.id})
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default GroupedVideoList;
