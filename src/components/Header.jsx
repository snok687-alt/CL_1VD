// [file name]: Header.jsx
// [file content begin]
import React from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { MdSupportAgent } from "react-icons/md";
import { FiGift } from "react-icons/fi";
import { useNavigate, useLocation } from 'react-router-dom';
import Cat from '../../public/you.jpg';
import Navbar from './Navbar';
import SearchBox from './SearchBox';
import ProfileCarousel from '../helpers/ProfileCarousel';
import Game from '../game/Game';

// ✅ ย้ายประกาศ categories มาที่นี่ (นอกฟังก์ชัน Header หรือข้างในแต่ก่อนใช้งาน)
const categories = [
  // กลุ่ม: 品质分类
  { id: '13', name: '高清无码', path: '/category/13' },
  { id: '14', name: '中文字幕', path: '/category/14' },
  { id: '24', name: '高清有码', path: '/category/24' },
  { id: '27', name: '无码流出', path: '/category/27' },
  
  // กลุ่ม: 来源分类
  { id: '7', name: '国产大制作', path: '/category/7' },
  { id: '25', name: '日本素人', path: '/category/25' },
  { id: '28', name: 'FC2', path: '/category/28' },
  { id: '30', name: '国产推荐', path: '/category/30' },
  { id: '33', name: '国产直播', path: '/category/33' },
  { id: '32', name: '韩国直播', path: '/category/32' },
  { id: '3', name: '欧美精品', path: '/category/3' },
  { id: '37', name: '东京热', path: '/category/37' },
  { id: '38', name: '一本道', path: '/category/38' },
  
  // กลุ่ม: 内容分类
  { id: '6', name: '偷拍自拍', path: '/category/6' },
  { id: '8', name: '乱伦毁三观', path: '/category/8' },
  { id: '21', name: '淫乱学生妹', path: '/category/21' },
  { id: '9', name: '主播女网红', path: '/category/9' },
  { id: '10', name: '黑料网曝', path: '/category/10' },
  { id: '29', name: '会所技师', path: '/category/29' },
  { id: '35', name: '制服诱惑', path: '/category/35' },
  { id: '31', name: '探花约炮', path: '/category/31' },
  { id: '34', name: '淫妻绿帽', path: '/category/34' },
  { id: '36', name: '重口猎奇', path: '/category/36' },
  { id: '22', name: '动漫精选', path: '/category/22' },
];

const Header = ({ searchTerm, onSearchChange, isDarkMode, toggleTheme, isVisible, currentCategory, openGiftModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRightIcons, setShowRightIcons] = React.useState(true);
  const [typingTimeout, setTypingTimeout] = React.useState(null);

  // ✅ ฟังก์ชัน handleCategoryClick อยู่ที่นี่ (ไม่มีการเรียกใช้ categories ก่อนประกาศ)
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
                className='rounded-full w-12 h-12 ml-2 hover:scale-110 transition-transform duration-200 lg:w-14 lg:h-14'
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
            <div className="flex items-center gap-x-3 md:gap-x-6 mr-2">
              <button
                onClick={openGiftModal}
                className={`p-2 rounded-full transition-all duration-200 ${isDarkMode
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600 hover:scale-110'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-110'
                  }`}
                aria-label="ของขวัญ"
              >
                <FiGift className="w-7 h-7" />
              </button>
              <button
                onClick={() => {
                  window.location.href = "http://93.xqhgl.cn/chat/index?noCanClose=1&token=a56f40cbf8f70d588389cfe12a6b1ed6";
                }}
                className={`p-2 rounded-full transition-all duration-200 ${isDarkMode
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600 hover:scale-110'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-110'
                  }`}
                aria-label="ติดต่อเรา"
              >
                <MdSupportAgent className="w-7 h-7" />
              </button>

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
          categories={categories}  // ✅ ตอนนี้ categories ถูกประกาศก่อนแล้ว
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
// [file content end]