import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getMoreVideosInCategory } from '../data/videoData';
import Swal from 'sweetalert2';
import FireIcon from '../hook/Fire_Icon';
import '../style/star.css';

const VideoManagement = ({ isDarkMode }) => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [loadingVideos, setLoadingVideos] = useState({});

  const loadingRef = useRef(false);
  const VIDEOS_PER_PAGE = 18;

  // ✅ โหลดหมวดหมู่
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('❌ โหลดหมวดหมู่ไม่สำเร็จ:', error);
      }
    };
    loadCategories();
  }, []);

  // ✅ โหลดวิดีโอเริ่มต้น
  const loadInitialVideos = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setVideos([]);
    setPage(1);
    setHasMore(true);

    try {
      console.log(`📥 กำลังโหลดวิดีโอจากหมวดหมู่: ${selectedCategory}`);

      const result = await getMoreVideosInCategory(
        selectedCategory,
        [],
        1,
        VIDEOS_PER_PAGE
      );

      // ✅ ตรวจสอบสถานะราคา
      const videosWithPriceStatus = await Promise.all(
        result.videos.map(async (video) => {
          try {
            const [priceStatus, rating] = await Promise.all([
              checkVideoPriceStatus(video.id),
              fetchRatingData(video.id)
            ]);

            return {
              ...video,
              hasPricing: priceStatus.hasPricing,
              isPaid: priceStatus.isPaid,
              priceStatusLoaded: true,
              ratingData: rating
            };
          } catch (error) {
            console.error(`❌ ตรวจสอบสถานะวิดีโอ ${video.id} ไม่สำเร็จ:`, error);
            return {
              ...video,
              hasPricing: false,
              isPaid: false,
              priceStatusLoaded: false,
              ratingData: null
            };
          }
        })
      );

      setVideos(videosWithPriceStatus);
      setHasMore(result.hasMore);
      console.log(`✅ โหลดวิดีโอสำเร็จ: ${videosWithPriceStatus.length} รายการ`);

    } catch (error) {
      console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
      Swal.fire({
        icon: 'error',
        title: 'โหลดข้อมูลล้มเหลว',
        text: 'ไม่สามารถโหลดข้อมูลวิดีโอได้ กรุณารีเฟรชหน้าเว็บและลองอีกครั้ง',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedCategory]);

  // ✅ โหลดวิดีโอเพิ่มเติม (Infinite Scroll)
  const loadMoreVideos = useCallback(async () => {
    if (loadingMore || !hasMore || loadingRef.current || searchTerm.trim()) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      console.log(`📥 กำลังโหลดหน้าที่ ${nextPage}...`);

      const result = await getMoreVideosInCategory(
        selectedCategory,
        videos.map(v => v.id),
        nextPage,
        VIDEOS_PER_PAGE
      );

      if (result.videos.length > 0) {
        // ✅ ตรวจสอบสถานะราคา
        const videosWithPriceStatus = await Promise.all(
          result.videos.map(async (video) => {
            try {
              const [priceStatus, rating] = await Promise.all([
                checkVideoPriceStatus(video.id),
                fetchRatingData(video.id)
              ]);

              return {
                ...video,
                hasPricing: priceStatus.hasPricing,
                isPaid: priceStatus.isPaid,
                priceStatusLoaded: true,
                ratingData: rating
              };
            } catch (error) {
              return {
                ...video,
                hasPricing: false,
                isPaid: false,
                priceStatusLoaded: false,
                ratingData: null
              };
            }
          })
        );

        setVideos(prev => [...prev, ...videosWithPriceStatus]);
        setPage(nextPage);
        setHasMore(result.hasMore);
        console.log(`✅ โหลดเพิ่ม: ${videosWithPriceStatus.length} รายการ`);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ โหลดวิดีโอเพิ่มไม่สำเร็จ:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, selectedCategory, videos, page, searchTerm]);

  // ✅ Intersection Observer สำหรับ Infinite Scroll
  useEffect(() => {
    if (!hasMore || searchTerm.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loadMoreVideos, hasMore, searchTerm]);

  // ✅ โหลดวิดีโอเมื่อเปลี่ยนหมวดหมู่
  useEffect(() => {
    loadInitialVideos();
  }, [loadInitialVideos]);

  // ✅ กรองวิดีโอตามเงื่อนไข
  const filteredVideos = videos.filter(video => {
    // กรองตามคำค้นหา
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(searchLower);
      const matchActor = video.actors && video.actors.some(actor =>
        actor.toLowerCase().includes(searchLower)
      );
      const matchId = video.id.toString().includes(searchTerm);

      if (!matchTitle && !matchActor && !matchId) return false;
    }

    // กรองตามสถานะราคา
    if (priceFilter === 'paid' && !video.hasPricing) return false;
    if (priceFilter === 'free' && video.hasPricing) return false;

    return true;
  });

  // ✅ ตรวจสอบสถานะราคาของวิดีโอ
  const checkVideoPriceStatus = async (videoId) => {
    try {
      const response = await fetch(`/backend-api/video/prices/status/${videoId}`);
      if (response.ok) {
        return await response.json();
      }
      return { hasPricing: false, isPaid: false };
    } catch (error) {
      console.error('ตรวจสอบสถานะราคาผิดพลาด:', error);
      return { hasPricing: false, isPaid: false };
    }
  };

  // ✅ ดึงข้อมูล rating
  const fetchRatingData = async (videoId) => {
    try {
      const response = await fetch(`/backend-api/rating/${videoId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('โหลดข้อมูลเรตติ้งผิดพลาด:', error);
      return null;
    }
  };

  // ✅ จัดการราคา
  const handleManagePricing = (video) => {
    navigate(`/video/${video.id}/pricing`);
  };

  // ✅ ไปหน้าการตั้งราคาวิดีโอทั้งหมด
  const handleAllVideosPricing = () => {
    navigate('/enhanced-price-setting/all', {
      state: {
        autoOpenBulkTab: true
      }
    });
  };

  // ✅ เปิดใช้งานการชำระเงินสำหรับวิดีโอทั้งหมดในหน้านี้
  const handleEnableAllVideos = async () => {
    try {
      const currentPageVideoIds = filteredVideos.map(video => video.id);

      if (currentPageVideoIds.length === 0) {
        Swal.fire('แจ้งเตือน', 'ไม่มีวิดีโอในหน้าปัจจุบัน', 'warning');
        return;
      }

      const result = await Swal.fire({
        title: 'เปิดใช้งานการชำระเงินสำหรับวิดีโอทั้งหมด',
        text: `คุณแน่ใจหรือไม่ที่จะเปิดใช้งานการชำระเงินสำหรับวิดีโอ ${currentPageVideoIds.length} รายการในหน้านี้?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'เปิดใช้งาน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#3085d6',
      });

      if (result.isConfirmed) {
        const progressSwal = Swal.fire({
          title: 'กำลังดำเนินการ...',
          html: `กำลังเปิดใช้งานการชำระเงินสำหรับ ${currentPageVideoIds.length} วิดีโอ...`,
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        let successCount = 0;
        let failCount = 0;

        // ✅ เปิดใช้งานการชำระเงินสำหรับทุกวิดีโอในหน้านี้
        for (const videoId of currentPageVideoIds) {
          try {
            const response = await fetch('/backend-api/video/pricing/toggle-paid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                video_id: videoId,
                enable: true
              })
            });

            const resultData = await response.json();

            if (response.ok && resultData.success) {
              successCount++;
            } else {
              throw new Error(resultData.message || 'เปิดใช้งานไม่สำเร็จ');
            }
          } catch (error) {
            console.error(`เปิดใช้งานวิดีโอ ${videoId} ไม่สำเร็จ:`, error);
            failCount++;
          }
        }

        await progressSwal.close();

        // ✅ อัพเดทสถานะวิดีโอใน state
        setVideos(prev => prev.map(video => {
          if (currentPageVideoIds.includes(video.id)) {
            return {
              ...video,
              hasPricing: true
            };
          }
          return video;
        }));

        Swal.fire({
          icon: successCount > 0 ? 'success' : 'error',
          title: 'ดำเนินการเสร็จสิ้น',
          html: `
          <div>
            <p>เปิดใช้งานสำเร็จ: ${successCount} วิดีโอ</p>
            ${failCount > 0 ? `<p style="color: red;">ล้มเหลว: ${failCount} วิดีโอ</p>` : ''}
          </div>
        `,
          confirmButtonText: 'ตกลง'
        });
      }
    } catch (error) {
      console.error('เปิดใช้งานการชำระเงินทั้งหมดผิดพลาด:', error);
      Swal.fire('ข้อผิดพลาด', 'ดำเนินการไม่สำเร็จ', 'error');
    }
  };

  // ✅ ฟังก์ชันสลับสถานะการชำระเงิน
  const handleTogglePaidStatus = async (videoId, enable) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔄 ส่งคำขอสลับสถานะ:', { videoId, enable });

      const response = await fetch('/backend-api/video/pricing/toggle-paid', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          video_id: parseInt(videoId),
          enable: enable
        })
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: enable ? 'เปิดใช้งานการชำระเงินแล้ว' : 'ปิดใช้งานการชำระเงินแล้ว',
          text: result.message,
          confirmButtonText: 'ตกลง'
        });
        
        // ✅ อัพเดทสถานะใน state
        setVideos(prev => prev.map(video => 
          video.id === videoId 
            ? { ...video, hasPricing: enable }
            : video
        ));

      } else {
        throw new Error(result.message || 'ดำเนินการไม่สำเร็จ');
      }
    } catch (error) {
      console.error('❌ สลับสถานะการชำระเงินผิดพลาด:', error);
      Swal.fire({
        icon: 'error',
        title: 'ดำเนินการไม่สำเร็จ',
        text: 'เกิดข้อผิดพลาดในการสลับสถานะการชำระเงิน',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // ✅ เลือก/ยกเลิกเลือกวิดีโอ
  const handleSelectVideo = (videoId) => {
    setSelectedVideos(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(videoId)) {
        newSelected.delete(videoId);
      } else {
        newSelected.add(videoId);
      }
      return newSelected;
    });
  };

  // ✅ เลือกทั้งหมดในหน้านี้
  const handleSelectAll = () => {
    const currentPageVideoIds = filteredVideos.map(video => video.id);
    setSelectedVideos(prev => {
      const newSelected = new Set(prev);
      currentPageVideoIds.forEach(id => newSelected.add(id));
      return newSelected;
    });
  };

  // ✅ ยกเลิกเลือกทั้งหมด
  const handleDeselectAll = () => {
    setSelectedVideos(new Set());
  };

  // ✅ จัดการแบบกลุ่ม
  const handleBulkAction = async () => {
    if (selectedVideos.size === 0) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกวิดีโอก่อน', 'warning');
      return;
    }

    if (!bulkAction) {
      Swal.fire('แจ้งเตือน', 'กรุณาเลือกการดำเนินการ', 'warning');
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'ยืนยันการดำเนินการ',
        text: `คุณแน่ใจหรือไม่ที่จะดำเนินการ "${getBulkActionText(bulkAction)}" กับ ${selectedVideos.size} วิดีโอ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ดำเนินการ',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        const videoIds = Array.from(selectedVideos);

        const progressSwal = Swal.fire({
          title: 'กำลังดำเนินการ...',
          html: `กำลังประมวลผล ${videoIds.length} วิดีโอ...`,
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        let successCount = 0;
        let failCount = 0;

        for (const videoId of videoIds) {
          try {
            const response = await fetch('/backend-api/video/pricing/toggle-paid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                video_id: videoId,
                enable: bulkAction === 'enable'
              })
            });

            const resultData = await response.json();

            if (response.ok && resultData.success) {
              successCount++;
            } else {
              throw new Error(resultData.message || 'ดำเนินการไม่สำเร็จ');
            }
          } catch (error) {
            failCount++;
          }
        }

        await progressSwal.close();

        setVideos(prev => prev.map(video => {
          if (selectedVideos.has(video.id)) {
            return {
              ...video,
              hasPricing: bulkAction === 'enable'
            };
          }
          return video;
        }));

        Swal.fire({
          icon: successCount > 0 ? 'success' : 'error',
          title: 'ดำเนินการเสร็จสิ้น',
          html: `
          <div>
            <p>สำเร็จ: ${successCount} วิดีโอ</p>
            ${failCount > 0 ? `<p style="color: red;">ล้มเหลว: ${failCount} วิดีโอ</p>` : ''}
          </div>
        `,
          confirmButtonText: 'ตกลง'
        });

        setSelectedVideos(new Set());
        setBulkAction('');
      }
    } catch (error) {
      console.error('ดำเนินการแบบกลุ่มผิดพลาด:', error);
      Swal.fire('ข้อผิดพลาด', 'ดำเนินการไม่สำเร็จ', 'error');
    }
  };

  const getBulkActionText = (action) => {
    switch (action) {
      case 'enable': return 'เปิดใช้งานการชำระเงิน';
      case 'disable': return 'ปิดใช้งานการชำระเงิน';
      default: return '';
    }
  };

  // ✅ จัดรูปแบบยอดวิว
  const formatViews = (views) => {
    const viewCount = views || 0;
    if (viewCount >= 1000000) {
      return {
        text: `${(viewCount / 1000000).toFixed(1)}M ดู`,
        isPopular: true,
        level: 'mega'
      };
    }
    if (viewCount >= 1000) {
      return {
        text: `${(viewCount / 1000).toFixed(0)}K ดู`,
        isPopular: true,
        level: 'popular'
      };
    }
    return {
      text: `${viewCount} ดู`,
      isPopular: false,
      level: 'normal'
    };
  };

  // ✅ แสดงดาว rating
  const getMaxStar = (ratingData) => {
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

  const renderStatusBadge = (video) => {
    if (!video.priceStatusLoaded) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-400 text-white rounded-full animate-pulse">
          กำลังโหลด...
        </span>
      );
    }

    if (video.hasPricing) {
      return (
        <span className="px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
          วิดีโอแบบชำระเงิน
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded-full">
        วิดีโอฟรี
      </span>
    );
  };

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';
  };

  // ✅ Skeleton Loading
  const VideoCardSkeleton = () => (
    <div className={`rounded-md overflow-hidden shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="relative aspect-[6/4] bg-gray-600 animate-pulse"></div>
      <div className="px-2 py-1 space-y-1">
        <div className={`h-4 rounded-sm w-5/6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`}></div>
        <div className="flex items-center justify-around">
          <div className={`h-3 w-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`}></div>
          <div className={`h-3 w-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`}></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen py-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">จัดการราคาการดูวิดีโอ</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              กำลังโหลดข้อมูลวิดีโอ...
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, index) => (
              <VideoCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">จัดการราคาการดูวิดีโอ</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                จัดการการตั้งค่าการชำระเงินสำหรับวิดีโอทั้งหมด • ทั้งหมด {videos.length} วิดีโอ
                {selectedVideos.size > 0 && ` • เลือกแล้ว ${selectedVideos.size} วิดีโอ`}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              {/* ปุ่มเปิดใช้งานการชำระเงินสำหรับวิดีโอทั้งหมดในหน้านี้ */}
              <button
                onClick={handleEnableAllVideos}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${isDarkMode
                    ? 'bg-purple-700 hover:bg-purple-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                เปิดใช้งานการชำระเงินทั้งหมดในหน้านี้
              </button>

              {/* ปุ่มตั้งราคาวิดีโอทั้งหมด */}
              <button
                onClick={handleAllVideosPricing}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${isDarkMode
                    ? 'bg-green-700 hover:bg-green-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                ตั้งราคาวิดีโอทั้งหมด
              </button>

              <button
                onClick={() => navigate('/CL_____________________________________________________________________________________******_/Admin')}
                className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-white hover:bg-gray-200 border'
                  }`}
              >
                กลับไปหน้าแรก
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVideos.size > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <span className="font-semibold">ดำเนินการแบบกลุ่ม:</span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                    }`}
                >
                  <option value="">เลือกการดำเนินการ</option>
                  <option value="enable">เปิดใช้งานการชำระเงิน</option>
                  <option value="disable">ปิดใช้งานการชำระเงิน</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ดำเนินการ
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm">เลือกแล้ว {selectedVideos.size} วิดีโอ</span>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  ยกเลิกการเลือกทั้งหมด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">ค้นหาวิดีโอ</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ป้อนชื่อวิดีโอ, นักแสดง หรือ ID..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                  }`}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                  }`}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">สถานะการชำระเงิน</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                  }`}
              >
                <option value="all">วิดีโอทั้งหมด</option>
                <option value="paid">วิดีโอแบบชำระเงิน</option>
                <option value="free">วิดีโอฟรี</option>
              </select>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium mb-2">สถิติ</label>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div>วิดีโอทั้งหมด: {videos.length} รายการ</div>
                <div>แบบชำระเงิน: {videos.filter(v => v.hasPricing).length} รายการ</div>
                <div>ฟรี: {videos.filter(v => !v.hasPricing).length} รายการ</div>
              </div>
            </div>
          </div>

          {/* Selection Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                เลือกทั้งหมดในหน้านี้
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                ยกเลิกการเลือกทั้งหมด
              </button>
            </div>
            <div className="text-sm text-gray-500">
              แสดง {filteredVideos.length} วิดีโอ
              {hasMore && ' • เลื่อนเพื่อโหลดเพิ่ม'}
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredVideos.map(video => {
              const viewData = formatViews(video.views);
              const maxStar = getMaxStar(video.ratingData);

              return (
                <div
                  key={video.id}
                  className={`rounded-md overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${isDarkMode ? 'bg-white' : 'bg-white'
                    } ${video.hasPricing ? 'ring-2 ring-green-500' : ''} ${selectedVideos.has(video.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video.id)}
                      onChange={() => handleSelectVideo(video.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Thumbnail Section */}
                  <div
                    className="relative aspect-[6/4] bg-gray-700 overflow-hidden group"
                    onClick={() => handleSelectVideo(video.id)}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />

                    {/* Rating Stars */}
                    <div className="absolute top-1 left-1 text-yellow-400 text-xs px-1.5 py-0.5 flex items-center space-x-0.5">
                      {maxStar > 0 ? (
                        renderStars(maxStar)
                      ) : (
                        <span className="text-gray-300">ยังไม่มีเรตติ้ง</span>
                      )}
                    </div>

                    {/* Fire Icon for Popular Videos */}
                    {viewData.isPopular && (
                      <div className="absolute top-1 right-1">
                        <div
                          className={`flex items-center pr-0 rounded-full text-xs font-semibold ${viewData.level === 'mega'
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

                    {/* Status Badge */}
                    <div className="absolute bottom-2 right-2">
                      {renderStatusBadge(video)}
                    </div>

                    {/* Views Count */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-1 py-0.5 text-xs bg-black bg-opacity-70 text-white rounded">
                        {viewData.text}
                      </span>
                    </div>

                    {/* Loading Overlay */}
                    {loadingVideos[video.id] && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-xs text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                          กำลังดำเนินการ...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Info Section */}
                  <div className="px-2 py-1">
                    <p
                      className={`font-medium text-xs leading-tight truncate whitespace-nowrap overflow-hidden ${isDarkMode ? 'text-gray-900' : 'text-black'
                        }`}
                      title={video.title}
                    >
                      {video.title}
                    </p>
                    <div
                      className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-900' : 'text-gray-600'
                        }`}
                    >
                      <div className="flex items-center">
                        {viewData.isPopular && (
                          <div className="-mt-1 fire-icon-container">
                            <FireIcon />
                          </div>
                        )}
                        <span
                          className={`text-xs ${viewData.isPopular ? 'font-semibold' : ''} ${viewData.level === 'mega'
                              ? 'text-purple-400'
                              : viewData.level === 'popular'
                                ? 'text-orange-400'
                                : isDarkMode
                                  ? 'text-gray-900'
                                  : 'text-gray-600'
                            }`}
                        >
                          {viewData.text}
                        </span>
                      </div>
                      <span className="text-xs">{video.uploadDate}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-2 pb-2">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManagePricing(video);
                        }}
                        disabled={loadingVideos[video.id]}
                        className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${video.hasPricing
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                          } ${loadingVideos[video.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {video.hasPricing ? 'ปรับราคา' : 'ตั้งราคา'}
                      </button>

                      <button
                        onClick={() => handleTogglePaidStatus(video.id, !video.pricing_enabled)}
                        className={`px-3 py-1 rounded text-xs font-medium ${video.pricing_enabled
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                          }`}
                      >
                        {video.pricing_enabled ? 'ปิดการชำระเงิน' : 'เปิดการชำระเงิน'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredVideos.length === 0 && !loading && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">ไม่พบวิดีโอที่ตรงกับเงื่อนไข</p>
              <p className="text-sm mt-2">ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
            </div>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">กำลังโหลดวิดีโอเพิ่มเติม...</span>
            </div>
          )}

          {/* Scroll Sentinel for Infinite Scroll */}
          {hasMore && !searchTerm.trim() && (
            <div id="scroll-sentinel" className="h-1" />
          )}
        </div>

        {/* Show More Button (Alternative) */}
        {hasMore && !loadingMore && !searchTerm.trim() && (
          <div className="flex justify-center mb-6">
            <button
              onClick={loadMoreVideos}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
              โหลดวิดีโอเพิ่มเติม
            </button>
          </div>
        )}

        {/* End of List */}
        {!hasMore && filteredVideos.length > 0 && (
          <div className="text-center py-6">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              🎉 แสดงวิดีโอทั้งหมดแล้ว ({filteredVideos.length} รายการ)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManagement;