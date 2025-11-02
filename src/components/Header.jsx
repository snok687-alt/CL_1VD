// Header.jsx
import React from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import Cat from '../../public/you.jpg';
import Navbar from './Navbar';
import SearchBox from './SearchBox';
import ProfileCarousel from '../helpers/ProfileCarousel';
import Game from '../game/Game'

const Header = ({ searchTerm, onSearchChange, isDarkMode, toggleTheme, isVisible, currentCategory }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRightIcons, setShowRightIcons] = React.useState(true);
  const [typingTimeout, setTypingTimeout] = React.useState(null);

  const categories = [
    { id: '32', name: '国产视频', path: '/category/32' },
    { id: '33', name: '国产主播', path: '/category/33' },
    { id: '34', name: '91大神', path: '/category/34' },
    { id: '35', name: '热门事件', path: '/category/35' },
    { id: '36', name: '传媒自拍', path: '/category/36' },
    { id: '38', name: '日本有码', path: '/category/38' },
    { id: '39', name: '日本无码', path: '/category/39' },
    { id: '40', name: '日韩主播', path: '/category/40' },
    { id: '41', name: '动漫肉番', path: '/category/41' },
    { id: '42', name: '女同性恋', path: '/category/42' },
    { id: '43', name: '中文字幕', path: '/category/43' },
    { id: '44', name: '强奸乱伦', path: '/category/44' },
    { id: '45', name: '熟女人妻', path: '/category/45' },
    { id: '46', name: '制服诱惑', path: '/category/46' },
    { id: '47', name: 'AV解说', path: '/category/47' },
    { id: '48', name: '女星换脸', path: '/category/48' },
    { id: '49', name: '百万三区', path: '/category/49' },
    { id: '50', name: '欧美精品', path: '/category/50' }
  ];

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-150 shadow-md px-1 py-2 w-full ${isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isDarkMode ? 'bg-gray-800 shadow-gray-900/20' : 'bg-white shadow-gray-200/50'}`}
    >
      <div className="max-w-full md:px-6 md:pt-3 mx-auto flex flex-col gap-4">
        <div className="w-full flex items-center gap-4 justify-between">
          {/* โลโก้ */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className={`text-red-500 text-2xl mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              <img
                src={Cat}
                alt="Logo-Cat"
                className='rounded-full w-9 h-9 ml-1 hover:scale-110 transition-transform duration-200'
              />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'} hidden sm:block`}>
              我是第一。
            </span>
          </div>

          {/* กล่องค้นหา */}
          <SearchBox
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            isDarkMode={isDarkMode}
            currentCategory={currentCategory}
            onFocusInput={() => {
              if (window.innerWidth <= 768) {
                setShowRightIcons(false);
              }
            }}
            onTyping={() => {
              if (typingTimeout) clearTimeout(typingTimeout);
              const timeout = setTimeout(() => {
                setShowRightIcons(true);
              }, 5000);
              setTypingTimeout(timeout);
            }}
          />

          {/* ปุ่มด้านขวา */}
          {showRightIcons ? (
            <div className="flex items-center gap-x-3 md:gap-x-6">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-200 ${isDarkMode
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600 hover:scale-110'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-110'
                  }`}
                aria-label="เปลี่ยนโหมดสี"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <button
              className="pr-2 mr-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
              onClick={() => setShowRightIcons(true)}
              title="แสดงไอคอนด้านขวา"
            >
              <IoChevronBack className="w-6 h-6 text-gray-500 hover:text-red-500" />
            </button>

          )}
        </div>
        {/* เมนู Navigation */}
        <Navbar
          handleCategoryClick={handleCategoryClick}
          categories={categories}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* โปรไฟล์แนะนำ */}
      <ProfileCarousel isDarkMode={isDarkMode} />
      <Game />
    </header>
  );
};

export default Header;