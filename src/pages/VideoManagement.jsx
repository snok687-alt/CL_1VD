import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getMoreVideosInCategory } from '../data/videoData';
import Swal from 'sweetalert2';

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
  const [globalPricing, setGlobalPricing] = useState(null);

  const loadingRef = useRef(false);
  const VIDEOS_PER_PAGE = 18;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('โหลดหมวดหมู่ไม่สำเร็จ:', error);
      }
    };
    loadCategories();
  }, []);

  const loadGlobalPricing = async () => {
    try {
      const response = await fetch('/backend-api/video/pricing/bulk-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bulkPricing) {
          setGlobalPricing(data.bulkPricing);
          return data.bulkPricing;
        }
      }
    } catch (error) {
      console.error('โหลดราคาแบบกลุ่มไม่สำเร็จ:', error);
    }
    return null;
  };

  const loadInitialVideos = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setVideos([]);
    setPage(1);
    setHasMore(true);

    try {
      const globalPrices = await loadGlobalPricing();
      const result = await getMoreVideosInCategory(
        selectedCategory,
        [],
        1,
        VIDEOS_PER_PAGE
      );

      const videosWithPriceStatus = await Promise.all(
        result.videos.map(async (video) => {
          try {
            const [priceStatus, rating, customPriceData] = await Promise.all([
              checkVideoPriceStatus(video.id),
              fetchRatingData(video.id),
              loadCustomVideoPrice(video.id)
            ]);

            const priceData = customPriceData || globalPrices?.priceTemplates;

            return {
              ...video,
              hasPricing: priceStatus.hasPricing,
              isPaid: priceStatus.isPaid,
              priceStatusLoaded: true,
              pricing_enabled: priceStatus.hasPricing,
              ratingData: rating,
              priceData: priceData,
              useGlobalPricing: !customPriceData,
              customPriceData: customPriceData
            };
          } catch (error) {
            return {
              ...video,
              hasPricing: false,
              isPaid: false,
              priceStatusLoaded: false,
              pricing_enabled: false,
              ratingData: null,
              priceData: globalPrices?.priceTemplates,
              useGlobalPricing: true,
              customPriceData: null
            };
          }
        })
      );

      setVideos(videosWithPriceStatus);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', error);
      Swal.fire({
        icon: 'error',
        title: 'โหลดข้อมูลล้มเหลว',
        text: 'ไม่สามารถโหลดข้อมูลวิดีโอได้',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedCategory]);

  const loadMoreVideos = useCallback(async () => {
    if (loadingMore || !hasMore || loadingRef.current || searchTerm.trim()) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const result = await getMoreVideosInCategory(
        selectedCategory,
        videos.map(v => v.id),
        nextPage,
        VIDEOS_PER_PAGE
      );

      if (result.videos.length > 0) {
        const videosWithPriceStatus = await Promise.all(
          result.videos.map(async (video) => {
            try {
              const [priceStatus, rating, customPriceData] = await Promise.all([
                checkVideoPriceStatus(video.id),
                fetchRatingData(video.id),
                loadCustomVideoPrice(video.id)
              ]);

              const priceData = customPriceData || globalPricing?.priceTemplates;

              return {
                ...video,
                hasPricing: priceStatus.hasPricing,
                isPaid: priceStatus.isPaid,
                priceStatusLoaded: true,
                pricing_enabled: priceStatus.hasPricing,
                ratingData: rating,
                priceData: priceData,
                useGlobalPricing: !customPriceData,
                customPriceData: customPriceData
              };
            } catch (error) {
              return {
                ...video,
                hasPricing: false,
                isPaid: false,
                priceStatusLoaded: false,
                pricing_enabled: false,
                ratingData: null,
                priceData: globalPricing?.priceTemplates,
                useGlobalPricing: true,
                customPriceData: null
              };
            }
          })
        );

        setVideos(prev => [...prev, ...videosWithPriceStatus]);
        setPage(nextPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('โหลดวิดีโอเพิ่มไม่สำเร็จ:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, selectedCategory, videos, page, searchTerm, globalPricing]);

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

  useEffect(() => {
    loadInitialVideos();
  }, [loadInitialVideos]);

  const filteredVideos = videos.filter(video => {
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(searchLower);
      const matchActor = video.actors && video.actors.some(actor =>
        actor.toLowerCase().includes(searchLower)
      );
      const matchId = video.id.toString().includes(searchTerm);

      if (!matchTitle && !matchActor && !matchId) return false;
    }

    if (priceFilter === 'paid' && !video.hasPricing) return false;
    if (priceFilter === 'free' && video.hasPricing) return false;

    return true;
  });

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

  const loadCustomVideoPrice = async (videoId) => {
    try {
      const response = await fetch(`/backend-api/video/pricing/settings/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.useGlobalPricing === false) {
          return data.basePrices;
        }
      }
    } catch (error) {
      console.error(`โหลดราคาวิดีโอ ${videoId} ไม่สำเร็จ:`, error);
    }
    return null;
  };

// ใน handleManagePricing เพิ่มการตรวจสอบ video id
const handleManagePricing = async (video) => {
  // ✅ ตรวจสอบว่า video มี id จริงหรือไม่
  if (!video || !video.id) {
    Swal.fire('ข้อผิดพลาด', 'วิดีโอไม่พบหรือไม่มีรหัส', 'error');
    return;
  }
  
  try {
    setLoadingVideos(prev => ({ ...prev, [video.id]: true }));
    
    const customPriceData = await loadCustomVideoPrice(video.id);
    
    navigate(`/video/${video.id}/pricing`, {
      state: {
        videoInfo: video,
        useGlobalPricing: !customPriceData,
        initialPrices: customPriceData || globalPricing?.priceTemplates
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลราคา:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลราคาได้', 'error');
  } finally {
    setLoadingVideos(prev => ({ ...prev, [video.id]: false }));
  }
};

  const handleAllVideosPricing = () => {
    navigate('/enhanced-price-setting/all', {
      state: {
        autoOpenBulkTab: true
      }
    });
  };

// ✅ แก้ไข handleEnableAllVideosInSystem
const handleEnableAllVideosInSystem = async () => {
  try {
    const result = await Swal.fire({
      title: 'เปิดใช้งานการชำระเงินสำหรับวิดีโอทั้งหมดในระบบ',
      text: `คุณแน่ใจหรือไม่ที่จะเปิดใช้งานการชำระเงินสำหรับวิดีโอทั้งหมดในระบบ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'เปิดใช้งานทั้งหมด',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const progressSwal = Swal.fire({
        title: 'กำลังดำเนินการ...',
        html: `กำลังเปิดใช้งานการชำระเงินสำหรับวิดีโอทั้งหมดในระบบ...`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch('/backend-api/video/pricing/enable-all-paid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const resultData = await response.json();

        await progressSwal.close();

        if (response.ok && resultData.success) {
          // ✅ โหลดข้อมูลใหม่ทั้งหมดจาก server
          await loadInitialVideos();
          
          Swal.fire({
            icon: 'success',
            title: 'ดำเนินการเสร็จสิ้น',
            html: `
            <div>
              <p>เปิดใช้งานการชำระเงินสำเร็จสำหรับวิดีโอทั้งหมด</p>
              <p class="text-sm text-gray-600">จำนวนวิดีโอ: ${resultData.totalVideos || 'ทั้งหมด'} รายการ</p>
              <p class="text-sm text-gray-600">สำเร็จ: ${resultData.successCount} รายการ</p>
              ${resultData.failCount > 0 ? `<p class="text-sm text-red-600">ล้มเหลว: ${resultData.failCount} รายการ</p>` : ''}
            </div>
          `,
            confirmButtonText: 'ตกลง'
          });
        } else {
          throw new Error(resultData.message || 'เปิดใช้งานไม่สำเร็จ');
        }
      } catch (error) {
        await progressSwal.close();
        throw error;
      }
    }
  } catch (error) {
    console.error('เปิดใช้งานการชำระเงินทั้งหมดผิดพลาด:', error);
    Swal.fire('ข้อผิดพลาด', 'ดำเนินการไม่สำเร็จ: ' + error.message, 'error');
  }
};
  const handleEnableAllVideosInPage = async () => {
    try {
      const currentPageVideoIds = filteredVideos.map(video => video.id);

      if (currentPageVideoIds.length === 0) {
        Swal.fire('แจ้งเตือน', 'ไม่มีวิดีโอในหน้าปัจจุบัน', 'warning');
        return;
      }

      const result = await Swal.fire({
        title: 'เปิดใช้งานการชำระเงินสำหรับวิดีโอทั้งหมดในหน้านี้',
        text: `คุณแน่ใจหรือไม่ที่จะเปิดใช้งานการชำระเงินสำหรับวิดีโอ ${currentPageVideoIds.length} รายการในหน้านี้?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'เปิดใช้งาน',
        cancelButtonText: 'ยกเลิก'
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
              
              setVideos(prev => prev.map(video => 
                video.id === videoId 
                  ? { 
                      ...video, 
                      hasPricing: true,
                      pricing_enabled: true 
                    }
                  : video
              ));
            } else {
              throw new Error(resultData.message || 'เปิดใช้งานไม่สำเร็จ');
            }
          } catch (error) {
            console.error(`เปิดใช้งานวิดีโอ ${videoId} ไม่สำเร็จ:`, error);
            failCount++;
          }
        }

        await progressSwal.close();

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

// ใน handleTogglePaidStatus - ลบการตรวจสอบ video_id
const handleTogglePaidStatus = async (videoId, enable) => {
  try {
    setLoadingVideos(prev => ({ ...prev, [videoId]: true }));

    const token = localStorage.getItem('token');

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

      // ⭐ โหลดราคาใหม่แบบเต็ม
      const newPricing = await loadSingleVideoPricing(videoId);

      // ⭐ อัพเดทข้อมูลทั้งหมดของวิดีโอใน state
      setVideos(prev =>
        prev.map(video =>
          video.id === videoId
            ? {
                ...video,
                ...newPricing,   // << สำคัญที่สุด
              }
            : video
        )
      );

      Swal.fire({
        icon: 'success',
        title: enable ? 'เปิดการชำระเงินแล้ว' : 'ปิดการชำระเงินแล้ว',
        text: result.message,
        timer: 1500
      });

    } else {
      throw new Error(result.message || 'ดำเนินการไม่สำเร็จ');
    }

  } catch (error) {
    Swal.fire('ข้อผิดพลาด', error.message, 'error');
  } finally {
    setLoadingVideos(prev => ({ ...prev, [videoId]: false }));
  }
};

// ✅ เพิ่ม function สำหรับโหลดข้อมูล video pricing ใหม่
const loadSingleVideoPricing = async (videoId) => {
  try {
    const [priceStatus, customPriceData] = await Promise.all([
      checkVideoPriceStatus(videoId),
      loadCustomVideoPrice(videoId)
    ]);

    return {
      hasPricing: priceStatus.hasPricing,
      isPaid: priceStatus.isPaid,
      priceStatusLoaded: true,
      pricing_enabled: priceStatus.hasPricing,
      useGlobalPricing: !customPriceData,
      customPriceData: customPriceData
    };
  } catch (error) {
    console.error(`โหลดข้อมูล video ${videoId} ไม่สำเร็จ:`, error);
    return {
      hasPricing: false,
      isPaid: false,
      priceStatusLoaded: false,
      pricing_enabled: false,
      useGlobalPricing: true,
      customPriceData: null
    };
  }
};

  const renderVideoPrices = (video) => {
    if (!video.priceData) {
      return (
        <div className="text-xs text-gray-500 text-center mt-1">
          ยังไม่ได้ตั้งราคา
        </div>
      );
    }

    const enabledPrices = Object.entries(video.priceData)
      .filter(([key, price]) => price.enabled && price.amount > 0);

    if (enabledPrices.length === 0) {
      return (
        <div className="text-xs text-gray-500 text-center mt-1">
          ยังไม่ได้ตั้งราคา
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="grid grid-cols-2 gap-1">
          {enabledPrices.map(([key, price], index) => (
            <div
              key={key}
              className={`flex flex-col items-center px-1 py-1 text-xs rounded-md border ${
                index % 2 === 0 
                  ? 'bg-gradient-to-br from-green-50 to-blue-50 text-green-800 border-green-200' 
                  : 'bg-gradient-to-br from-emerald-50 to-cyan-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <span className="font-bold">¥{price.amount}</span>
              <span className="text-[10px]">{price.days} วัน</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  const handleSelectAll = () => {
    const currentPageVideoIds = filteredVideos.map(video => video.id);
    setSelectedVideos(new Set(currentPageVideoIds));
  };

  const handleDeselectAll = () => {
    setSelectedVideos(new Set());
  };

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
        text: `คุณแน่ใจหรือไม่ที่จะดำเนินการ "${bulkAction === 'enable' ? 'เปิดใช้งานการชำระเงิน' : 'ปิดใช้งานการชำระเงิน'}" กับ ${selectedVideos.size} วิดีโอ?`,
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
              
              setVideos(prev => prev.map(video => {
                if (selectedVideos.has(video.id)) {
                  return {
                    ...video,
                    hasPricing: bulkAction === 'enable',
                    pricing_enabled: bulkAction === 'enable'
                  };
                }
                return video;
              }));
            } else {
              throw new Error(resultData.message || 'ดำเนินการไม่สำเร็จ');
            }
          } catch (error) {
            failCount++;
          }
        }

        await progressSwal.close();

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
          className="text-yellow-400 select-none"
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
        <span className="px-2 py-1 text-xs bg-gray-400 text-white rounded-full">
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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">จัดการราคาการดูวิดีโอ</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                จัดการการตั้งค่าการชำระเงินสำหรับวิดีโอทั้งหมด • ทั้งหมด {videos.length} วิดีโอ
                {selectedVideos.size > 0 && ` • เลือกแล้ว ${selectedVideos.size} วิดีโอ`}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <button
                onClick={handleEnableAllVideosInSystem}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isDarkMode
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                เปิดการชำระเงินทั้งหมดในระบบ
              </button>

              <button
                onClick={handleEnableAllVideosInPage}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isDarkMode
                    ? 'bg-purple-700 hover:bg-purple-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                เปิดการชำระเงินทั้งหมดในหน้านี้
              </button>

              <button
                onClick={handleAllVideosPricing}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isDarkMode
                    ? 'bg-green-700 hover:bg-green-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                ตั้งราคาวิดีโอทั้งหมด
              </button>

              <button
                onClick={() => navigate('/CL_____________________________________________________________________________________******_/Admin')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-white hover:bg-gray-200 border'
                }`}
              >
                กลับไปหน้าแรก
              </button>
            </div>
          </div>
        </div>

        {selectedVideos.size > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <span className="font-semibold">ดำเนินการแบบกลุ่ม:</span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
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

        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ค้นหาวิดีโอ</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ป้อนชื่อวิดีโอ, นักแสดง หรือ ID..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
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

            <div>
              <label className="block text-sm font-medium mb-2">สถานะการชำระเงิน</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">วิดีโอทั้งหมด</option>
                <option value="paid">วิดีโอแบบชำระเงิน</option>
                <option value="free">วิดีโอฟรี</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">สถิติ</label>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div>วิดีโอทั้งหมด: {videos.length} รายการ</div>
                <div>แบบชำระเงิน: {videos.filter(v => v.hasPricing).length} รายการ</div>
                <div>ฟรี: {videos.filter(v => !v.hasPricing).length} รายการ</div>
              </div>
            </div>
          </div>

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

        <div className="mb-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredVideos.map(video => {
              const viewData = formatViews(video.views);
              const maxStar = getMaxStar(video.ratingData);

              return (
                <div
                  key={video.id}
                  className={`rounded-md overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    isDarkMode ? 'bg-white' : 'bg-white'
                  } ${video.hasPricing ? 'ring-2 ring-green-500' : ''} ${
                    selectedVideos.has(video.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
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

                    <div className="absolute top-1 left-1 text-yellow-400 text-xs px-1.5 py-0.5 flex items-center space-x-0.5">
                      {maxStar > 0 ? (
                        renderStars(maxStar)
                      ) : (
                        <span className="text-gray-300">ยังไม่มีเรตติ้ง</span>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2">
                      {renderStatusBadge(video)}
                    </div>

                    <div className="absolute bottom-2 left-2">
                      <span className="px-1 py-0.5 text-xs bg-black bg-opacity-70 text-white rounded">
                        {viewData.text}
                      </span>
                    </div>

                    {loadingVideos[video.id] && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-xs text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                          กำลังดำเนินการ...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-2 py-1">
                    <p
                      className={`font-medium text-xs leading-tight truncate whitespace-nowrap overflow-hidden ${
                        isDarkMode ? 'text-gray-900' : 'text-black'
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
                      <span>{viewData.text}</span>
                      <span className="text-xs">{video.uploadDate}</span>
                    </div>

                    {renderVideoPrices(video)}
                  </div>

                  <div className="px-2 pb-2">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManagePricing(video);
                        }}
                        disabled={loadingVideos[video.id]}
                        className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                          video.hasPricing
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        } ${loadingVideos[video.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {video.hasPricing ? 'ปรับราคา' : 'ตั้งราคา'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePaidStatus(video.id, !video.pricing_enabled);
                        }}
                        disabled={loadingVideos[video.id]}
                        className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                          video.pricing_enabled
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        } ${loadingVideos[video.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {video.pricing_enabled ? 'ปิดการชำระเงิน' : 'เปิดการชำระเงิน'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVideos.length === 0 && !loading && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">ไม่พบวิดีโอที่ตรงกับเงื่อนไข</p>
              <p className="text-sm mt-2">ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
            </div>
          )}

          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">กำลังโหลดวิดีโอเพิ่มเติม...</span>
            </div>
          )}

          {hasMore && !searchTerm.trim() && (
            <div id="scroll-sentinel" className="h-1" />
          )}
        </div>

        {hasMore && !loadingMore && !searchTerm.trim() && (
          <div className="flex justify-center mb-6">
            <button
              onClick={loadMoreVideos}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              โหลดวิดีโอเพิ่มเติม
            </button>
          </div>
        )}

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