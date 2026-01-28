// [file name]: Dashboard.jsx
// [file content begin]
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import GiftModal from "../ci/GiftModal"; // ✅ นำเข้า GiftModal
import useTotle from "../ci/useTotle"; // ✅ นำเข้า Hook

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [currentCategory, setCurrentCategory] = useState(null);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const searchTimeout = useRef(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const { authenticated } = useTotle();

  const isVideoPage = location.pathname.startsWith('/watch');
  const isSearchPage = location.pathname === '/search';
  const isProfilePage = location.pathname.startsWith('/profile');
  const isCategoryPage = location.pathname.startsWith('/category/');
  const isVideoManagementPage = location.pathname.startsWith('/video-management') ||
    location.pathname.includes('pricing') ||
    location.pathname.includes('enhanced-price-setting/all')
    ;
    const openGiftModal = () => {
  setGiftOpen(true);
};

  // อัพเดทหมวดหมู่ปัจจุบันเมื่อเปลี่ยนหน้า
  useEffect(() => {
    if (isCategoryPage) {
      const categoryId = location.pathname.split('/').pop();
      setCurrentCategory(categoryId);
    } else if (isSearchPage) {
      const fromCategory = location.state?.fromCategory;
      if (fromCategory) {
        setCurrentCategory(fromCategory);
      }
    }
  }, [location, isCategoryPage, isSearchPage]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (term.trim() !== '') {
        const navigateState = {
          searchTerm: term,
          fromCategory: currentCategory || (isCategoryPage ? location.pathname.split('/').pop() : null)
        };

        if (isSearchPage) {
          window.dispatchEvent(new CustomEvent('searchUpdated', {
            detail: {
              searchTerm: term,
              fromCategory: currentCategory
            }
          }));
        } else {
          navigate('/search', { state: navigateState });
        }
      } else {
        if (isSearchPage) {
          window.dispatchEvent(new CustomEvent('searchUpdated', {
            detail: {
              searchTerm: '',
              fromCategory: currentCategory
            }
          }));

          if (currentCategory) {
            navigate(`/category/${currentCategory}`);
          } else {
            navigate('/category/1'); // ✅ เปลี่ยนเป็นหมวดหมู่เริ่มต้นของ API ใหม่
          }
        }
      }
    }, 500);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if ((isVideoPage && isLargeScreen) || isVideoManagementPage) {
        setIsHeaderVisible(true);
        setIsFooterVisible(true);
        return;
      }

      if (isProfilePage) {
        return;
      }

      // Logic สำหรับ Header และ Footer
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
        setIsFooterVisible(false);
      }
      else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
        setIsFooterVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [isVideoPage, isProfilePage, isLargeScreen, isVideoManagementPage]);

  useEffect(() => {
    const handleHeaderToggle = (e) => {
      setIsHeaderVisible(e.detail === 'show');
    };

    window.addEventListener('toggleHeader', handleHeaderToggle);
    return () => window.removeEventListener('toggleHeader', handleHeaderToggle);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
        }`}
    >
      {/* ✅ ซ่อน Header ในหน้า VideoManagement */}
      {!isProfilePage && !isVideoManagementPage && (!isVideoPage || (isVideoPage && isLargeScreen)) && (
        <Header
          className={`header ${isHeaderVisible ? 'visible' : 'hidden'}`}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          isVisible={isHeaderVisible}
          currentCategory={currentCategory}
          authenticated={authenticated}
          openGiftModal={openGiftModal}
        />
      )}

      <main className={`flex-grow ${isVideoPage ? 'pt-0' : ''} ${!isFooterVisible ? 'mb-16' : ''}`}>
        <Outlet context={{
          searchTerm,
          isDarkMode,
          setSearchTerm,
          currentCategory,
          authenticated
        }} />

        {/* ✅ Gift Modal */}
        <GiftModal
          isOpen={giftOpen}
          onClose={() => setGiftOpen(false)}
          isDarkMode={isDarkMode}
          onLoginSuccess={() => {
            window.location.reload();
          }}
        />
      </main>
      <Footer
        isDarkMode={isDarkMode}
        isVisible={isFooterVisible}
      />
    </div>
  );
};

export default Dashboard;
// [file content end]