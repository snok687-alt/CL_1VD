import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { getVideoById, getMoreVideosInCategory } from '../data/videoData';
import Hls from 'hls.js';
import Swal from 'sweetalert2';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const relatedContainerRef = useRef(null);
  const { isDarkMode } = useOutletContext();

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedPage, setRelatedPage] = useState(1);
  const [hasMoreRelated, setHasMoreRelated] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // ใน VideoPlayer.jsx
// ใน VideoPlayer.jsx - แก้ไข useEffect การบันทึกวิว
// useEffect(() => {
//   if (!video?.id) return;

//   const recordAndFetchViews = async () => {
//     try {
//       console.log('🔄 บันทึกและดึงยอดวิวล่าสุดสำหรับ video_id:', video.id);
      
//       // ✅ บันทึกวิว
//       const incrementResponse = await fetch('/backend-api/views/increment', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ video_id: video.id }),
//       });
      
//       if (incrementResponse.ok) {
//         console.log(`✅ บันทึกวิวสำเร็จ: video_id = ${video.id}`);
        
//         // ✅ ดึงยอดวิวล่าสุดจาก server
//         const viewsResponse = await fetch('/backend-api/views/get', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ video_ids: [video.id] }),
//         });
        
//         if (viewsResponse.ok) {
//           const viewsData = await viewsResponse.json();
//           const latestViews = viewsData[video.id] || (video.views || 0) + 1;
          
//           console.log(`📊 ยอดวิวล่าสุด: ${latestViews}`);
          
//           // ✅ อัปเดต state ด้วยยอดวิวล่าสุดจาก server
//           setVideo(prev => prev ? { ...prev, views: latestViews } : null);
//         }
//       } else {
//         console.error('❌ ไม่สามารถบันทึกวิวได้:', await incrementResponse.text());
//       }
//     } catch (error) {
//       console.error('❌ เกิดข้อผิดพลาดในการบันทึกวิว:', error);
//     }
//   };

//   // บันทึกและดึงยอดวิวทันทีเมื่อโหลดวิดีโอเสร็จ
//   recordAndFetchViews();

// }, [video?.id]);

// ใน VideoPlayer.jsx - แก้ไขการบันทึกวิว
useEffect(() => {
  if (!video?.id) return;

  const recordView = async () => {
    try {
      // console.log('🔄 บันทึกวิวสำหรับ video_id:', video.id);
      
      // ✅ ยังคงบันทึกวิวลง MySQL ตามปกติ (สำหรับเก็บสถิติ)
      const incrementResponse = await fetch('/backend-api/views/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_id: video.id }),
      });
      
      if (incrementResponse.ok) {
        // console.log(`✅ บันทึกวิวสำเร็จ: video_id = ${video.id}`);
        
        // 🗃️ เก็บไว้ก่อน: การดึงยอดวิวล่าสุดจาก server (ถ้าต้องการใช้งานในอนาคต)
        /*
        const viewsResponse = await fetch('/backend-api/views/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ video_ids: [video.id] }),
        });
        
        if (viewsResponse.ok) {
          const viewsData = await viewsResponse.json();
          const latestViews = viewsData[video.id] || (video.views || 0) + 1;
          setVideo(prev => prev ? { ...prev, views: latestViews } : null);
        }
        */
      } else {
        console.error('❌ ไม่สามารถบันทึกวิวได้:', await incrementResponse.text());
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึกวิว:', error);
    }
  };

  recordView();
}, [video?.id]);


  const handleRating = async (rating) => {
    if (!video?.id || userRating > 0) return;

    try {
      console.log('📤 กำลังส่งคะแนน:', { video_id: video.id, rating });

      // ✅ ใช้ endpoint ที่เฉพาะเจาะจง
      const response = await fetch(`/backend-api/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_id: parseInt(video.id), // ✅ แปลงเป็น number
          rating: rating
        })
      });

      console.log('📡 Response status:', response.status);

      const result = await response.json();
      console.log('📥 ได้รับผลลัพธ์:', result);

      // ✅ ตรวจสอบ response ตามรูปแบบใหม่
      if (result.success) {
        setUserRating(rating);
        Swal.fire({
          icon: 'success',
          title: `评分成功！`,
          text: `您已成功给予 ${rating} 星评价。`,
          confirmButtonText: '好的',
        });
      } else {
        console.error(`❌ 不可评分: ${result.message}`);
        Swal.fire({
          icon: 'error',
          title: '评分失败',
          text: result.message || '评分时发生错误，请稍后再试。',
          confirmButtonText: '确定',
        });
      }

    } catch (err) {
      console.error('❌ ให้คะแนนล้มเหลว:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };


  // Auto-hide header on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        window.dispatchEvent(new CustomEvent('toggleHeader', { detail: 'hide' }));
      } else if (currentScrollY < lastScrollY) {
        window.dispatchEvent(new CustomEvent('toggleHeader', { detail: 'show' }));
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Process video URL
  const processVideoUrl = useCallback((playUrl) => {
    if (!playUrl) return null;
    const patterns = [
      /(https?:\/\/[^$]+\.m3u8[^$]*)/i,
      /(https?:\/\/[^$]+\.mp4[^$]*)/i,
      /\$([^$]+\.m3u8[^$]*)/i,
      /\$([^$]+\.mp4[^$]*)/i
    ];
    for (const pattern of patterns) {
      const match = playUrl.match(pattern);
      if (match) return (match[1] || match[0]).replace(/\$+/g, '').trim();
    }
    return null;
  }, []);

  // Load video player
  const loadVideo = useCallback(async (videoUrl) => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoUrl) return;

    setVideoLoading(true);
    if (hlsRef.current) hlsRef.current.destroy();

    try {
      if (Hls.isSupported()) {
        const hls = new Hls({ debug: false, enableWorker: true });
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setVideoLoading(false);
          videoElement.play().catch(() => setVideoLoading(false));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError('ไม่สามารถเล่นวีดีโอได้');
            setVideoLoading(false);
          }
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = videoUrl;
        videoElement.addEventListener('loadedmetadata', () => {
          setVideoLoading(false);
          videoElement.play().catch(() => setVideoLoading(false));
        });
      } else {
        setError('เบราว์เซอร์ไม่รองรับรูปแบบวีดีโอนี้');
        setVideoLoading(false);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดวีดีโอได้');
      setVideoLoading(false);
    }
  }, []);

  // Load more related videos
  const loadMoreRelated = useCallback(async () => {
    if (relatedLoading || !hasMoreRelated || !video?.type_id) return;
    setRelatedLoading(true);
    try {
      const result = await getMoreVideosInCategory(
        video.type_id,
        relatedVideos.map(v => v.id),
        relatedPage + 1,
        18
      );
      if (result.videos.length > 0) {
        const filteredNewVideos = result.videos.filter(v => v.id !== video.id);
        if (filteredNewVideos.length > 0) {
          setRelatedVideos(prev => [...prev, ...filteredNewVideos]);
          setRelatedPage(prev => prev + 1);
        }
        setHasMoreRelated(result.hasMore && filteredNewVideos.length > 0);
      } else {
        setHasMoreRelated(false);
      }
    } catch (error) {
      setHasMoreRelated(false);
    } finally {
      setRelatedLoading(false);
    }
  }, [relatedLoading, hasMoreRelated, video, relatedVideos, relatedPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMoreRelated || relatedLoading) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMoreRelated(),
      { threshold: 0.1 }
    );
    const container = relatedContainerRef.current;
    if (!container) return;
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    container.appendChild(sentinel);
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      if (container.contains(sentinel)) container.removeChild(sentinel);
    };
  }, [loadMoreRelated, hasMoreRelated, relatedLoading]);

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) return;
      setLoading(true);
      setError(null);
      try {
        const videoData = await getVideoById(videoId);
        if (!videoData) throw new Error('ไม่พบวีดีโอนี้');
        const videoUrl = processVideoUrl(videoData.videoUrl || videoData.rawData?.vod_play_url);
        setVideo({ ...videoData, videoUrl });
        videoUrl ? setTimeout(() => loadVideo(videoUrl), 100) : setError('ไม่พบไฟล์วีดีโอ');
      } catch (err) {
        setError(err.message || 'ไม่สามารถโหลดวีดีโอได้');
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
    return () => hlsRef.current?.destroy();
  }, [videoId, processVideoUrl, loadVideo]);

  // Fetch related videos
  useEffect(() => {
    const fetchRelated = async () => {
      if (!video?.id || !video?.type_id) return;
      try {
        const result = await getMoreVideosInCategory(video.type_id, [video.id], 1, 18);
        if (result.videos.length > 0) {
          const filteredRelated = result.videos.filter(v => v.id !== video.id);
          setRelatedVideos(filteredRelated.sort((a, b) => b.views - a.views));
          setHasMoreRelated(result.hasMore);
        } else {
          setRelatedVideos([]);
          setHasMoreRelated(false);
        }
      } catch (error) {
        setRelatedVideos([]);
        setHasMoreRelated(false);
      }
    };
    if (video && !videoLoading) fetchRelated();
  }, [video, videoLoading]);

  // Helper functions
  const removeHtmlTags = (html) => html?.replace(/<[^>]*>/g, '') || '';
  const truncateDescription = (text, maxLength = 150) => {
    const cleanText = removeHtmlTags(text);
    return cleanText.length <= maxLength ? cleanText : cleanText.substring(0, maxLength) + '...';
  };
  const handleVideoClick = useCallback((clickedVideo) => navigate(`/watch/${clickedVideo.id}`), [navigate]);

  // Loading state
  if (loading) return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-full mx-auto md:mt-4">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="w-full md:pl-5 lg:w-2/3 space-y-4">
            <div className="w-full aspect-video bg-gray-800 animate-pulse" />
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />
              <div className="flex gap-2 items-center mb-2">
                <div className="h-4 w-24 bg-gray-600 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-600 rounded animate-pulse" />
              </div>
              <div className="h-4 bg-gray-600 rounded w-full mb-2 animate-pulse" />
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="h-6 w-2/3 mb-4 bg-gray-600 rounded animate-pulse" />
              <div className="grid grid-cols-3 gap-2">
                {Array(18).fill().map((_, idx) => (
                  <div key={idx} className="space-y-2 animate-pulse">
                    <div className="aspect-video bg-gray-700 rounded" />
                    <div className="h-3 w-5/6 bg-gray-600 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error || !video) return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-lg mb-4">{error || '未找到此视频'}</p>
      <button onClick={() => navigate('/')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
        返回
      </button>
    </div>
  );

  const cleanDescription = removeHtmlTags(video.description);
  const shouldTruncate = cleanDescription.length > 150;
  const displayDescription = showFullDescription ? cleanDescription : truncateDescription(cleanDescription);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-full mx-auto md:mt-4 md:ml-4 lg:p-1">
        <div className="flex flex-col lg:flex-row gap-2 md:gap-x-8">

          {/* Video Player Section */}
          <div className="w-full lg:w-2/3">
            <div className="relative w-full aspect-video bg-black overflow-hidden shadow-lg">
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="text-white text-sm">正在加载视频...</p>
                  </div>
                </div>
              )}
              <video ref={videoRef} controls className="w-full h-full" poster={video.thumbnail} playsInline preload="metadata" />
            </div>

            {/* Video Info */}
            <div className={`px-2 py-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Rating Stars */}
              <div className="mt-4">
                <h4 className="text-sm mb-1 space-x-1">给个评分吧！</h4>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 cursor-pointer transition-colors ${(hoverRating || userRating) >= star
                        ? 'text-yellow-400'
                        : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  {userRating > 0 && (
                    <span className="ml-2 text-sm text-green-500">你已评分 {userRating} 星</span>
                  )}
                </div>
              </div>

              <h1 className="text-md md:text-2xl font-bold">{video.title}</h1>
              <div className="flex flex-wrap items-center text-sm">
                <span className="mr-3">{video.channelName}</span>
                <span className="mr-3">•</span>
                {video.views > 0 && (
                  <>
                    <span>{video.views.toLocaleString()} 次观看</span>
                    <span className="mx-3">•</span>
                  </>
                )}
                <span>{video.uploadDate}</span>
                <span className="mx-3">•</span>
                <span className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  {video.category}
                </span>
              </div>
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                <p className="whitespace-pre-line mb-2">{displayDescription}</p>
                {shouldTruncate && (
                  <button onClick={() => setShowFullDescription(!showFullDescription)} className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}>
                    {showFullDescription ? 'แสดงน้อยลง' : 'แสดงเพิ่มเติม'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Related Videos Section */}
          <div className="w-full lg:w-1/3">
            <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800 lg:bg-transparent' : 'bg-white lg:bg-transparent'}`}>
              <h3 className={`text-xl font-bold mb-0 py-1 pl-2 sticky top-0 ${isDarkMode ? 'bg-gradient-to-r from-gray-900 to-transparent' : 'bg-gradient-to-r from-gray-100 to-transparent'}`}>
                相关视频 ({relatedVideos.length}{hasMoreRelated ? '+' : ''})
              </h3>

              <div ref={relatedContainerRef} className="grid grid-cols-3 md:grid-cols-3 gap-1 md:overflow-y-auto md:max-h-screen px-2">
                {relatedVideos.map((relatedVideo, index) => (
                  <div key={`${relatedVideo.id}-${index}`} className="transform transition-transform duration-300 hover:scale-105">
                    <VideoCard video={relatedVideo} onClick={handleVideoClick} isDarkMode={isDarkMode} />
                  </div>
                ))}

                {relatedLoading && Array(18).fill().map((_, idx) => (
                  <div key={`loading-${idx}`} className="animate-pulse space-y-2">
                    <div className="aspect-video bg-gray-700 rounded" />
                    <div className="h-3 w-5/6 bg-gray-600 rounded" />
                    <div className="h-2 w-3/4 bg-gray-600 rounded" />
                  </div>
                ))}

                {hasMoreRelated && !relatedLoading && relatedVideos.length > 0 && (
                  <div className="col-span-3 flex justify-center py-4">
                    <button onClick={loadMoreRelated} className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>
                      加载更多 ({relatedVideos.length} 视频)
                    </button>
                  </div>
                )}
                {relatedVideos.length === 0 && !relatedLoading && (
                  <div className="col-span-3 text-center py-8">
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>正在加载视频...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;