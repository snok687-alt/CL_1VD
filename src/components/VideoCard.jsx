import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import FireIcon from '../hook/Fire_Icon';
import '../style/star.css';
import ImageSelector from '../uploads/ImageSelector';

const VideoCard = ({ video, onClick, isDarkMode }) => {
  const navigate = useNavigate();
  const [ratingData, setRatingData] = useState(null);
  const [loadingRating, setLoadingRating] = useState(true);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedFaceImage, setSelectedFaceImage] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  
  // ✅ State สำหรับยอดวิว real-time
  const [currentViews, setCurrentViews] = useState(video.views || 0);
  const [loadingViews, setLoadingViews] = useState(false);

  const handleVideoClick = () => {
    if (onClick) {
      onClick(video);
    } else {
      navigate(`/watch/${video.id}`);
    }
  };

  // ✅ ฟังก์ชันดึงยอดวิว real-time จาก server
  const fetchRealTimeViews = async () => {
    if (!video?.id) return;
    
    try {
      setLoadingViews(true);
      // console.log(`🔄 ดึงยอดวิว real-time สำหรับ video_id: ${video.id}`);
      
      const response = await fetch('/backend-api/views/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_ids: [video.id] }),
      });

      if (response.ok) {
        const viewsData = await response.json();
        const latestViews = viewsData[video.id] || currentViews;
        
        // ✅ อัปเดต state เฉพาะยอดวิว
        setCurrentViews(latestViews);
        // console.log(`✅ อัปเดตยอดวิว real-time: ${video.id} -> ${latestViews}`);
      } else {
        console.error('❌ ไม่สามารถดึงยอดวิวได้:', await response.text());
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการดึงยอดวิว real-time:', error);
    } finally {
      setLoadingViews(false);
    }
  };

  // ✅ ฟังก์ชันดึง rating และยอดวิว
  const fetchRatingAndViews = async () => {
    try {
      setLoadingRating(true);
      
      // ดึง rating
      const ratingRes = await fetch(`/backend-api/rating/${video.id}`);
      if (ratingRes.ok) {
        const ratingData = await ratingRes.json();
        setRatingData(ratingData);
      }
      
      // ดึงยอดวิวล่าสุด
      await fetchRealTimeViews();
      
    } catch (err) {
      console.error('Error fetching rating and views:', err);
      setRatingData(null);
    } finally {
      setLoadingRating(false);
    }
  };

  // ✅ ดึงข้อมูลครั้งแรกเมื่อ component โหลด
  useEffect(() => {
    fetchRatingAndViews();
  }, [video.id]);

  // ✅ ดึงยอดวิวทุก 30 วินาที (real-time polling)
  useEffect(() => {
    if (!video?.id) return;

    const intervalId = setInterval(() => {
      fetchRealTimeViews();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [video?.id]);

  // ✅ ฟังก์ชันจัดรูปแบบยอดวิว (ใช้ currentViews แทน video.views)
  const formatViews = (views) => {
    const viewCount = views || 0;
    if (viewCount >= 1000000) {
      return {
        text: `${(viewCount / 1000000).toFixed(1)}M 看`,
        isPopular: true,
        level: 'mega'
      };
    }
    if (viewCount >= 1000) {
      return {
        text: `${(viewCount / 1000).toFixed(0)}K 看`,
        isPopular: true,
        level: 'popular'
      };
    }
    return {
      text: `${viewCount} 看`,
      isPopular: false,
      level: 'normal'
    };
  };

  const handleImageError = (e) => {
    e.target.src = '';
  };

  // ✅ ใช้ currentViews สำหรับการแสดงผล
  const viewData = formatViews(currentViews);

  const getMaxStar = () => {
    if (!ratingData) return 0;
    const stars = [ratingData.star_1, ratingData.star_2, ratingData.star_3, ratingData.star_4, ratingData.star_5];
    let maxIndex = 0;
    let maxValue = stars[0];
    for (let i = 1; i < stars.length; i++) {
      if (stars[i] > maxValue) {
        maxValue = stars[i];
        maxIndex = i;
      }
    }
    return maxValue > 0 ? maxIndex + 1 : 0;
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(
        <span
          key={i}
          className="text-yellow-400 select-none animate-float-star"
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const maxStar = getMaxStar();

  const handleFaceClick = (e) => {
    e.stopPropagation();
    console.log("เปิดตัวเลือกรูปภาพสำหรับวิดีโอ:", video.id);
    setShowImageSelector(true);
  };

  const handleImageSelect = async (image) => {
    console.log("เลือกรูปภาพสำหรับแปลงหน้า:", image);
    setSelectedFaceImage(image);
    setShowImageSelector(false);

    // เริ่มแปลงหน้า
    await handleFaceSwap(video, image);
  };

  const handleFaceSwap = async (video, faceImage) => {
    if (!video || !faceImage) {
      Swal.fire('错误', '请先选择照片和视频', 'warning');
      return;
    }

    try {
      setIsSwapping(true);
      
      let progressInterval;
      const progressSwal = Swal.fire({
        title: '正在换脸...',
        html: `
          <div style="text-align: left;">
            <p>预计时间: 1-2分钟</p>
            <div class="progress-container" style="margin-top: 10px; background: #f0f0f0; border-radius: 5px; height: 10px;">
              <div class="progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #007bff, #00ff88); border-radius: 5px; transition: width 0.5s;"></div>
            </div>
            <p class="progress-text" style="margin-top: 5px; font-size: 12px; color: #666;">0% - เริ่มต้น...</p>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          let progress = 0;
          progressInterval = setInterval(() => {
            progress += Math.random() * 8 + 2; // 2-10% per second
            if (progress > 85) progress = 85; // หยุดที่ 85% รอผลลัพธ์จริง
            
            const progressBar = document.querySelector('.progress-bar');
            const progressText = document.querySelector('.progress-text');
            if (progressBar && progressText) {
              progressBar.style.width = `${progress}%`;
              
              let statusText = '';
              if (progress < 30) statusText = 'กำลังดาวน์โหลดวิดีโอ...';
              else if (progress < 60) statusText = 'กำลังประมวลผลใบหน้า...';
              else statusText = 'กำลังสร้างวิดีโอใหม่...';
              
              progressText.textContent = `${Math.round(progress)}% - ${statusText}`;
            }
          }, 1000);
        }
      });

      const res = await axios.post('/backend-api/swap-face', {
        videoId: video.id,
        videoUrl: video.videoUrl,
        faceImageFilename: faceImage.filename,
      }, {
        timeout: 120000, // 2 นาที
      });

      clearInterval(progressInterval);
      setIsSwapping(false);
      
      await progressSwal.close();

      if (res.data.success && res.data.outputUrl) {
        const processingTime = res.data.processingTime || 45;
        
        Swal.fire({
          icon: 'success',
          title: '换脸完成! 🎉',
          html: `
            <div style="text-align: center;">
              <p>แปลงหน้าเสร็จสมบูรณ์!</p>
              <p style="font-size: 14px; color: #666;">ใช้เวลา: ${processingTime.toFixed(1)} วินาที</p>
              <p style="font-size: 12px; color: #888;">วิดีโอใหม่พร้อมแล้ว</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'ดูวิดีโอ',
          cancelButtonText: 'ปิด',
          confirmButtonColor: '#3085d6',
        }).then((result) => {
          if (result.isConfirmed) {
            const fullUrl = window.location.origin + res.data.outputUrl;
            window.open(fullUrl, '_blank');
          }
        });
      } else {
        throw new Error(res.data.message || 'ไม่สามารถสร้างวิดีโอได้');
      }

    } catch (err) {
      console.error("ข้อผิดพลาดในการแปลงหน้า:", err);
      setIsSwapping(false);
      
      if (Swal.isVisible()) {
        Swal.close();
      }
      
      let errorMessage = 'เกิดข้อผิดพลาดในการแปลงหน้า';
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes('timeout')) {
        errorMessage = 'การประมวลผลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
      });
    }
  };

  // โหลดรูปภาพที่เลือกไว้ก่อนหน้า
  useEffect(() => {
    const saved = localStorage.getItem(`faceImage_${video.id}`);
    if (saved) {
      setSelectedFaceImage(JSON.parse(saved));
    }
  }, [video.id]);

  return (
    <>
      <div
        className={`rounded-md overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-fadeInUp ${
          isDarkMode ? 'bg-white' : 'bg-white'
        }`}
        onClick={handleVideoClick}
      >
        <div className="relative aspect-[6/4] bg-gray-700 overflow-hidden group">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />

          {/* ✅ Loading indicator สำหรับยอดวิว */}
          {loadingViews && (
            <div className="absolute top-1 left-10 bg-black bg-opacity-70 rounded px-1 py-0.5">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs">更新中...</span>
              </div>
            </div>
          )}

          <div className="absolute top-1 left-1 text-yellow-400 text-xs px-1.5 py-0.5 flex items-center space-x-0.5">
            {loadingRating ? (
              <span className="text-gray-200">...</span>
            ) : maxStar > 0 ? (
              renderStars(maxStar)
            ) : (
              <span className="text-gray-300">暂无评分</span>
            )}
          </div>

          {viewData.isPopular && (
            <div className="absolute top-1 right-1">
              <div
                className={`flex items-center pr-0 rounded-full text-xs font-semibold ${
                  viewData.level === 'mega'
                    ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border-purple-300/30'
                    : ''
                }`}
              >
                <div className="-mr-1 -mt-1 fire-icon-container">
                  <FireIcon />
                </div>
                {viewData.level === 'mega' ? 'HOT 🔥' : ''}
              </div>
            </div>
          )}

          {/* <button
            onClick={handleFaceClick}
            className={`absolute bottom-2 right-2 p-1 text-2xl font-semibold transition-all transform hover:scale-110 flex items-center gap-1 w-10 h-10 justify-center rounded-full bg-opacity-80 text-white`}
            title={isSwapping ? 'กำลังแปลงหน้า...' : selectedFaceImage ? 'เปลี่ยนรูปหน้า' : 'เลือกรูปหน้า'}
            disabled={isSwapping}
          >
            {isSwapping ? '⏳' : '🎭'}
          </button> */}
          
          {isSwapping && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-xs text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                กำลังประมวลผล...
              </div>
            </div>
          )}
        </div>

        <div className="px-2 py-1">
          <p
            className={`font-medium text-xs leading-tight truncate whitespace-nowrap overflow-hidden ${
              isDarkMode ? 'text-gray-900 ' : 'text-black'
            }`}
            title={video.title}
          >
            {video.title}
          </p>
          <div
            className={`flex items-center justify-between text-xs ${
              isDarkMode ? 'text-gray-900' : 'text-gray-600'
            }`}
          >
            <div className="flex items-center">
              {viewData.isPopular && (
                <div className="-mt-1 fire-icon-container">
                  <FireIcon />
                </div>
              )}
              <span
                className={`text-xs ${viewData.isPopular ? 'font-semibold' : ''} ${
                  viewData.level === 'mega'
                    ? 'text-purple-400'
                    : viewData.level === 'popular'
                    ? 'text-orange-400'
                    : isDarkMode
                    ? 'text-gray-900'
                    : 'text-gray-600'
                }`}
              >
                {/* ✅ แสดงยอดวิว real-time */}
                {loadingViews ? (
                  <span className="text-blue-500 animate-pulse">更新中...</span>
                ) : (
                  viewData.text
                )}
              </span>
            </div>
            <span className="text-xs opacity-50">ID: {video.id}</span>
            <span className="text-xs">{video.uploadDate}</span>
          </div>
        </div>
      </div>

      {showImageSelector && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <h3 className="text-lg font-bold">选择图片进行换脸</h3>
              <button
                onClick={() => setShowImageSelector(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <ImageSelector
                onImageSelect={handleImageSelect}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;