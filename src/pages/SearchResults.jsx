// SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { searchVideos, getVideosByCategory } from '../data/videoData';

const SearchResults = () => {
  const location = useLocation();
  const { isDarkMode, searchTerm, setSearchTerm, currentCategory } = useOutletContext();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลการค้นหาจากหลายแหล่ง
  const searchQuery = location.state?.searchTerm || 
    new URLSearchParams(location.search).get('q') || 
    searchTerm || 
    '';

  // ตรวจสอบว่าอยู่ในหมวดหมู่ใด
  const fromCategory = location.state?.fromCategory || currentCategory;
  const isHomePage = location.pathname === '/' && !searchQuery;

  useEffect(() => {
    if (isHomePage) {
      loadCategoryVideos('32');
    } else if (searchQuery) {
      setSearchTerm(searchQuery);
      performSearch(searchQuery);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      // Cleanup function
    };
  }, [searchQuery, setSearchTerm, isHomePage]);

  const loadCategoryVideos = async (categoryId) => {
    setLoading(true);
    try {
      const categoryVideos = await getVideosByCategory(categoryId);
      setResults(categoryVideos);
    } catch (error) {
      console.error('Error loading category videos:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const searchResults = await searchVideos(query, 0);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching videos:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSearchUpdated = (event) => {
      const { searchTerm: newSearchTerm, fromCategory: searchFromCategory } = event.detail;
      setSearchTerm(newSearchTerm);
      if (newSearchTerm) {
        performSearch(newSearchTerm);
      } else if (searchFromCategory) {
        // ถ้ายกเลิกการค้นหาและมีหมวดหมู่เดิม ให้โหลดวิดีโอจากหมวดหมู่นั้น
        loadCategoryVideos(searchFromCategory);
      } else {
        setResults([]);
      }
    };

    window.addEventListener('searchUpdated', handleSearchUpdated);
    return () => {
      window.removeEventListener('searchUpdated', handleSearchUpdated);
    };
  }, []);

  // แสดงชื่อหมวดหมู่ถ้ามี
  const getCategoryName = (categoryId) => {
    const categories = {
      '32': '国产视频',
      '33': '国产主播',
      '34': '91大神',
      '35': '热门事件',
      '36': '传媒自拍',
      '38': '日本有码',
      '39': '日本无码',
      '40': '日韩主播',
      '41': '动漫肉番',
      '42': '女同性恋',
      '43': '中文字幕',
      '44': '强奸乱伦',
      '45': '熟女人妻',
      '46': '制服诱惑',
      '47': 'AV解说',
      '48': '女星换脸',
      '49': '百万三区',
      '50': '欧美精品'
    };
    return categories[categoryId] || `หมวดหมู่ ${categoryId}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20 md:py-70">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isHomePage ? '正在加载视频...' : '正在搜索视频...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-xl md:text-2xl text-start font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {isHomePage
            ? '国产视频'
            : searchQuery
              ? `搜索结果: "${searchQuery}"`
              : fromCategory
                ? getCategoryName(fromCategory)
                : '搜索视频'
          }
        </h1>

        {results.length === 0 && !isHomePage ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg mb-2">未找到搜索结果</p>
            <p className="text-sm">试试其他关键词或标签进行搜索</p>
          </div>
        ) : results.length === 0 && isHomePage ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg mb-2">此类别中没有视频</p>
          </div>
        ) : results.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg mb-2">开始搜索</p>
            <p className="text-sm">在上方输入关键词以搜索视频</p>
          </div>
        ) : (
          <>
            {!isHomePage && (
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery 
                  ? `找到 ${results.length} 视频`
                  : `找到 ${results.length} 个视频在 ${getCategoryName(fromCategory)}`
                }
              </p>
            )}

            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
              {results.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;