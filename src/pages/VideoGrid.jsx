import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { getCategoryName } from '../routes/Router';
import { getVideosByCategory, searchVideos, getMoreVideosInCategory } from '../data/videoData';

/**
 * Skeleton component ສຳລັບສະແດງຂະນະທີ່ກຳລັງໂຫລດ
 * @param {boolean} isDarkMode - ໂໝດມືດ/ສະຫວ່າງ
 */
const VideoCardSkeleton = ({ isDarkMode }) => {
  return (
    <div
      className={`rounded-md overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-fadeInUp ${isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[6/4] bg-gray-600 animate-pulse"></div>

      {/* Metadata */}
      <div className="px-2 py-1 space-y-1">
        {/* Title */}
        <div
          className={`h-4 rounded-sm w-5/6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
            } animate-pulse`}
        ></div>

        {/* View + Upload Date Row */}
        <div className="flex items-center justify-around text-xs">
          {/* Views */}
          <div
            className={`h-3 w-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              } animate-pulse`}
          ></div>

          {/* Dot */}
          <div className="w-1 h-1 rounded-full bg-gray-500"></div>

          {/* Upload Date */}
          <div
            className={`h-3 w-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              } animate-pulse`}
          ></div>
        </div>
      </div>
    </div>
  );
};


/**
 * VideoGrid Component - ສະແດງ grid ຂອງວິດີໂອພ້ອມ infinite scroll
 * @param {string} title - ຫົວຂໍ້ຂອງ grid
 * @param {*} filter - ຕົວກອງທີ່ຈະນຳໃຊ້ (ບໍ່ໄດ້ໃຊ້ໃນປັດຈຸບັນ)
 */
const VideoGrid = ({ title, filter }) => {
  // States ສຳລັບຈັດການຂໍ້ມູນ
  const [videos, setVideos] = useState([]); // ລາຍການວິດີໂອ
  const [loading, setLoading] = useState(true); // ສະຖານະການໂຫລດເລີ່ມຕົ້ນ
  const [loadingMore, setLoadingMore] = useState(false); // ສະຖານະການໂຫລດເພີ່ມ
  const [hasMore, setHasMore] = useState(true); // ມີຂໍ້ມູນເພີ່ມບໍ່
  const [page, setPage] = useState(1); // ຫນ້າປັດຈຸບັນ

  // ດຶງຂໍ້ມູນຈາກ context ແລະ location
  const { searchTerm, isDarkMode } = useOutletContext();
  const location = useLocation();
  const loadingRef = useRef(false); // ປ້ອງກັນການໂຫລດຊ້ອນກັນ

  // ກວດສອບວ່າເປັນໜ້າໝວດໝູ່ ແລະ ດຶງ category ID
  const isCategoryPage = location.pathname.startsWith('/category/');
  const categoryId = isCategoryPage ? location.pathname.split('/').pop() : null;

  // ກຳນົດຈຳນວນວິດີໂອຕໍ່ໜ້າເປັນ 18
  const VIDEOS_PER_PAGE = 18;

  /**
   * ໂຫລດວິດີໂອເລີ່ມຕົ້ນ
   * ຫຼຸດຄວາມຊ້ຳຊ້ອນຂອງ loadInitialVideos
   */
  const loadInitialVideos = useCallback(async () => {
    // ປ້ອງກັນການໂຫລດຊ້ອນກັນ
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const videosData = await getVideosByCategory(categoryId, VIDEOS_PER_PAGE);
      setVideos(videosData);
      // ກວດສອບວ່າມີຂໍ້ມູນເພີ່ມບໍ່
      setHasMore(videosData.length >= VIDEOS_PER_PAGE);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [categoryId, VIDEOS_PER_PAGE]);

  /**
   * ໂຫລດວິດີໂອເພີ່ມເຕີມ (Infinite Scroll)
   */
  const loadMoreVideos = useCallback(async () => {
    // ກວດສອບເງື່ອນໄຂກ່ອນໂຫລດ
    if (loadingMore || !hasMore || loadingRef.current || searchTerm?.trim()) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const result = await getMoreVideosInCategory(
        categoryId,
        videos.map(v => v.id), // ສົ່ງ ID ຂອງວິດີໂອທີ່ມີຢູ່ແລ້ວເພື່ອຫຼີກເວັ້ນການຊ້ຳ
        nextPage,
        VIDEOS_PER_PAGE
      );

      if (result.videos.length > 0) {
        setVideos(prev => [...prev, ...result.videos]); // ເພີ່ມວິດີໂອໃໝ່ເຂົ້າໃນລິດ
        setPage(nextPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, categoryId, videos, page, searchTerm, VIDEOS_PER_PAGE]);

  /**
   * Intersection Observer ສຳລັບ infinite scroll
   * ເມື່ອຜູ້ໃຊ້ເລື່ອນໄປຫາສ່ວນລຸ່ມສຸດ ຈະໂຫລດຂໍ້ມູນເພີ່ມ
   */
  useEffect(() => {
    // ບໍ່ເຮັດ infinite scroll ຖ້າບໍ່ມີຂໍ້ມູນເພີ່ມ ຫຼື ກຳລັງຄ້ນຫາ
    if (!hasMore || searchTerm?.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 } // ລົດ threshold ເພື່ອໃຫ້ໂຫລດເລັວຂຶ້ນ
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loadMoreVideos, hasMore, searchTerm]);

  /**
   * ໂຫລດວິດີໂອເມື່ອມີການປ່ຽນແປງ parameters
   * ເພີ່ມ debounce ສຳລັບການຄ້ນຫາ
   */
  useEffect(() => {
    const timeoutId = setTimeout(loadInitialVideos, searchTerm ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [loadInitialVideos, searchTerm]);

  // ກຳນົດ title ທີ່ຈະສະແດງ
  let displayTitle = title;
  if (searchTerm?.trim()) {
    displayTitle = `ຄ້ນຫາ "${searchTerm}" ໃນ ${getCategoryName(categoryId)}`;
  } else if (isCategoryPage) {
    displayTitle = getCategoryName(categoryId);
  }

  // ສະແດງໜ້າ loading ດ້ວຍ skeleton cards
  if (loading) {
    return (
      <div className={`min-h-screen p-1 md:p-2 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2 md:gap-2">
            {/* ສະແດງ 18 skeleton cards */}
            {Array.from({ length: VIDEOS_PER_PAGE }).map((_, index) => (
              <VideoCardSkeleton key={index} isDarkMode={isDarkMode} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  // ສະແດງເນື້ອຫາຫຼັກ
  return (
    <div className={`min-h-screen p-1 md:p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-full mx-auto">
        {/* ກໍລະນີບໍ່ມີວິດີໂອ */}
        {videos.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-lg mb-2">
              {searchTerm?.trim() ? '未找到搜索结果' : '未找到此类别中的视频'}
            </p>
          </div>
        ) : (
          <>
            {/* ສະແດງຈຳນວນຜົນການຄ້ນຫາ */}
            {searchTerm?.trim() && (
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                找到 {videos.length} 个视频
              </p>
            )}
              
            {/* Grid ສະແດງວິດີໂອ */}
            <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 md:gap-2">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            {/* Loading More Skeleton - ສະແດງຂະນະທີ່ກຳລັງໂຫລດເພີ່ມ */}
            {loadingMore && (
              <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 mt-4">
                {/* ສະແດງ 18 skeleton cards ສຳລັບການໂຫລດເພີ່ມ */}
                {Array.from({ length: VIDEOS_PER_PAGE }).map((_, index) => (
                  <VideoCardSkeleton key={`skeleton-${index}`} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}

            {/* Scroll Sentinel - element ທີ່ໃຊ້ສຳລັບ intersection observer */}
            {hasMore && !searchTerm?.trim() && (
              <div id="scroll-sentinel" className="h-10 w-full"></div>
            )}

            {/* ຂໍ້ຄວາມສິ້ນສຸດ */}
            {!hasMore && videos.length > 0 && (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>所有视频已加载完成（{videos.length} 个视频）</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoGrid; 