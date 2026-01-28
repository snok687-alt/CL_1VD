import { useLocation, useNavigate } from 'react-router-dom'
import { AiFillHome, AiFillVideoCamera, AiOutlineUser } from 'react-icons/ai' // ✅ นำเข้าไอคอน
import '../style/Footer.css'

function Footer({ isDarkMode, isVisible }) {
  const location = useLocation()
  const navigate = useNavigate()

  // แทน emoji ด้วย react-icons
  const menus = [
    { path: '/', icon: <AiFillHome />, label: '首页' },
    { path: '/UserVideoHistory', icon: <AiFillVideoCamera />, label: '视频' },
    { path: '/Gift_List', icon: <AiOutlineUser />, label: '我的' }
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
          className={`footer-item ${location.pathname === menu.path ? 'active' : ''}`}
          onClick={() => navigate(menu.path)}
        >
          <span
            className="icon"
            style={{ color: isDarkMode ? 'gold' : 'black' }} // ✅ เปลี่ยนสีตามโหมด
          >
            {menu.icon}
          </span>
          <span className="text">{menu.label}</span>
        </div>
      ))}
    </div>
  )
}

export default Footer
