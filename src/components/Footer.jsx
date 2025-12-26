import { useLocation, useNavigate } from 'react-router-dom'
import '../style/Footer.css'

function Footer({ isDarkMode, isVisible }) {
  const location = useLocation()
  const navigate = useNavigate()

  const menus = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/VideoHistory', icon: '🎬', label: '视频' },
    { path: '/Gift_List', icon: '👤', label: '我的' }
  ]

  return (
    <div
      className={`
        footer
        ${isDarkMode ? 'footer-dark' : ''}
        ${isVisible ? 'footer-show' : 'footer-hide'}
      `}
    >
      {menus.map((menu) => (
        <div
          key={menu.path}
          className={`footer-item ${
            location.pathname === menu.path ? 'active' : ''
          }`}
          onClick={() => navigate(menu.path)}
        >
          <span className="icon">{menu.icon}</span>
          <span className="text">{menu.label}</span>
        </div>
      ))}
    </div>
  )
}

export default Footer
