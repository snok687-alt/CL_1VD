import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ profile, isDarkMode = false, rank = 0 }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ตรวจว่าหน้าจอเป็นมือถือหรือไม่ (สำหรับ styling)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // กดครั้งเดียวไปที่หน้า profile
  const handleCardClick = () => {
    navigate(`/profile/${encodeURIComponent(profile.name)}`);
  };

  const hoverBgClass = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const borderClass = isDarkMode ? 'border-gray-600 hover:border-blue-400' : 'border-gray-200 hover:border-blue-400';
  const textClass = isDarkMode ? 'text-gray-200 hover:text-blue-400' : 'text-gray-800 hover:text-blue-600';

  const rankColors = {
    1: {
      primary: 'yellow',
      secondary: 'orange',
      accent: 'red',
      border: 'border-yellow-400',
      shadow: 'shadow-yellow-500/50',
      text: 'text-yellow-300',
      icon: '⭐'
    },
    2: {
      primary: 'gray',
      secondary: 'slate',
      accent: 'blue',
      border: 'border-gray-400',
      shadow: 'shadow-gray-500/50',
      text: 'text-gray-300',
      icon: '✨'
    },
    3: {
      primary: 'orange',
      secondary: 'amber',
      accent: 'yellow',
      border: 'border-orange-400',
      shadow: 'shadow-orange-500/50',
      text: 'text-orange-300',
      icon: '🔥'
    }
  };

  const isTopThree = rank > 0 && rank <= 3;
  const rankStyle = rankColors[rank];

  return (
    <div
      onClick={handleCardClick}
      className={`profile-card cursor-pointer hover:shadow-lg transition-all duration-300 text-center rounded-lg ${hoverBgClass} relative pt-2 ${isTopThree ? 'relative overflow-visible' : ''}`}
    >
      <div className="relative group">
        {/* ป้าย HOT อันดับ 1-3 */}
        {isTopThree && (
          <div className="absolute -top-3 left-0 z-10 p-0 flex justify-center" >
            <div className={`
              w-5 h-5 flex items-center justify-center rounded-full text-md font-bold text-white 
              shadow-lg dark:border-gray-800
              transform transition-all duration-700 ease-in-out
              group-hover:scale-125 group-hover:-translate-y-1
              hover:shadow-xl hover:ring-2 hover:ring-white/50
              animate-bounce-gentle
              ${rank === 1 ? 'animate-pulse-gold' : rank === 2 ? 'animate-pulse-silver' : 'animate-pulse-bronze'}
            `}>
              {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
            </div>
          </div>
        )}

        {/* รูปภาพโปรไฟล์ */}
        <img
          src={profile.image}
          alt={profile.name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '';
            setImageLoaded(true);
          }}
          className={`profile-image w-16 h-16 md:w-18 md:h-18 rounded-full object-cover object-top mx-auto border-2 transition-all duration-300 ${
            isTopThree ? `${rankStyle.border} ${rankStyle.shadow} shadow-lg relative z-10` : borderClass
          } group-hover:scale-105`}
        />
      </div>

      <h3 className={`text-sm md:text-base font-semibold truncate px-1 transition-colors ${textClass} ${
        isTopThree ? 'relative z-10' : ''
      }`}>
        {profile.name}
        {isTopThree && (
          <span className={`inline-block ml-1 animate-pulse font-[Segoe_UI_Emoji,Apple_Color_Emoji,Noto_Color_Emoji,sans-serif] ${
            rank === 1 ? 'text-yellow-500' :
            rank === 2 ? 'text-gray-400' :
            'text-orange-500'
          }`}>
            {rankStyle.icon}
          </span>
        )}
      </h3>
    </div>
  );
};

export default ProfileCard;