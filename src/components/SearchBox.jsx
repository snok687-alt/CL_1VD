// SearchBox.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBox = ({ searchTerm, onSearchChange, isDarkMode, currentCategory, onFocusInput, onTyping }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    onSearchChange(e.target.value);
    if (onTyping) onTyping(); // เรียกเมื่อพิมพ์
  };

  const clearSearch = () => {
    onSearchChange('');
    const isCategoryPage = location.pathname.startsWith('/category/');
    const isSearchPage = location.pathname === '/search';

    if (isCategoryPage) return;

    if (isSearchPage) {
      if (currentCategory) {
        navigate(`/category/${currentCategory}`);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-1 md:mr-0">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={onFocusInput}
          placeholder="搜索视频"
          className={`w-full py-1 pl-10 pr-10 rounded-full border focus:outline-none focus:ring-2 focus:ring-red-500 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-black placeholder-gray-500'
          }`}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute text-xs inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
