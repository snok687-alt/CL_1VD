// 📁 components/VideoHistory.js
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function VideoHistory() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ip, setIp] = useState("");

  // ดึง IP ของผู้ใช้
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(response => response.json())
      .then(data => setIp(data.ip))
      .catch(() => {
        // ถ้าไม่ได้ ให้ลองใช้ IP จาก localStorage
        const storedIP = localStorage.getItem("user_ip");
        if (storedIP) {
          setIp(storedIP);
        }
      });
  }, []);

  // ดึงประวัติการดูจาก API
  useEffect(() => {
    if (!ip) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/backend-api/watch-history/${ip}`);
        const data = await response.json();
        
        if (data.success) {
          setHistory(data.data);
          
          // ดึงสถิติ
          const statsRes = await fetch(`/backend-api/watch-history/stats/${ip}`);
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("ไม่สามารถดึงประวัติได้");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [ip]);

  // บันทึกประวัติเมื่อดูวิดีโอ
  const saveWatchHistory = async (videoData) => {
    try {
      await fetch('/backend-api/watch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: ip,
          video_id: videoData.id,
          video_title: videoData.title,
          thumbnail_url: videoData.thumbnail,
          progress_percentage: videoData.progress || 0
        })
      });
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  // ลบรายการประวัติ
  const deleteHistoryItem = async (id) => {
    if (!window.confirm("คุณแน่ใจที่จะลบประวัตินี้?")) return;
    
    try {
      const response = await fetch(`/backend-api/watch-history/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setHistory(history.filter(item => item.id !== id));
        toast.success("ลบประวัติเรียบร้อยแล้ว");
      }
    } catch (error) {
      toast.error("ไม่สามารถลบประวัติได้");
    }
  };

  // ล้างประวัติทั้งหมด
  const clearAllHistory = async () => {
    if (!window.confirm("คุณแน่ใจที่จะล้างประวัติทั้งหมด?")) return;
    
    try {
      const response = await fetch(`/backend-api/watch-history/clear/${ip}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setHistory([]);
        setStats(null);
        toast.success("ล้างประวัติทั้งหมดเรียบร้อยแล้ว");
      }
    } catch (error) {
      toast.error("ไม่สามารถล้างประวัติได้");
    }
  };

  // จัดรูปแบบวันที่
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // คำนวณเวลาที่ผ่านมา
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'เมื่อสักครู่นี้';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* หัวข้อ */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📺 ประวัติการดูวิดีโอ
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            IP ของคุณ: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {ip}
            </span>
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            ล้างประวัติทั้งหมด
          </button>
        )}
      </div>

      {/* สถิติ */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total_watched_videos || 0}
            </div>
            <div className="text-gray-600 text-sm">วิดีโอที่ดู</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.total_views || 0}
            </div>
            <div className="text-gray-600 text-sm">จำนวนครั้งที่ดู</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.avg_completion_rate || 0)}%
            </div>
            <div className="text-gray-600 text-sm">อัตราดูครบ</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm font-semibold text-gray-800">
              {stats.last_watched ? timeAgo(stats.last_watched) : 'ยังไม่เคยดู'}
            </div>
            <div className="text-gray-600 text-sm">ดูล่าสุด</div>
          </div>
        </div>
      )}

      {/* รายการประวัติ */}
      {history.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📺</div>
          <h3 className="text-xl text-gray-600 mb-2">ยังไม่มีประวัติการดู</h3>
          <p className="text-gray-500">เริ่มดูวิดีโอเพื่อบันทึกประวัติ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex bg-white rounded-xl shadow hover:shadow-md transition-shadow p-4 gap-4"
            >
              {/* ภาพ thumbnail */}
              <div className="flex-shrink-0">
                <img
                  src={item.thumbnail_url || '/default-thumbnail.jpg'}
                  alt={item.video_title}
                  className="w-40 h-24 object-cover rounded-lg"
                />
              </div>

              {/* ข้อมูลวิดีโอ */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {item.video_title || `วิดีโอ #${item.video_id}`}
                  </h3>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="ลบประวัติ"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>ความคืบหน้า</span>
                      <span>{item.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* ข้อมูลเพิ่มเติม */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>ดู {item.watch_count} ครั้ง</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>ดูล่าสุด: {timeAgo(item.last_watched_time)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span>🔥</span>
                      <span>{item.total_views || 0} คนดูทั้งหมด</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ปุ่มไปดูวิดีโอ */}
              <div className="flex flex-col justify-center">
                <a
                  href={`/video/${item.video_id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
                >
                  ดูอีกครั้ง
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoHistory;