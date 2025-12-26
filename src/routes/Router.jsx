// [file name]: Router.jsx
// [file content begin]
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import VideoPlayer from '../pages/VideoPlayer';
import VideoGrid from '../pages/VideoGrid';
import SearchResults from '../pages/SearchResults';
import ProfilePage from '../helpers/ProfilePage';
import ImagesUploadForm from '../uploads/ImageUploadForm';
import Admin from '../Admin/Admin';
import Ip from '../Admin/Ip';
import Form_user from '../Admin/Form_user';
import Login from '../Admin/Login';
import ProtectedRoute from './ProtectedRoute'; 
import Addlinks from '../Admin/Addlinks'
import Account from '../Admin/Account'
import VideoManagement from '../pages/VideoManagement';
import EnhancedPriceSetting from '../pages/EnhancedPriceSetting';
import P from '../mod/Payment_modal';
import Notfound from '../Notfound';
import Gift_List from '../ci/Gift_List'
import VideoHistory from '../pages/VideoHistory';

// ✅ หมวดหมู่ใหม่จาก API ใหม่
const categories = [
  { id: '1', name: '视频一区' },
  { id: '2', name: '视频二区' },
  { id: '3', name: '欧美精品' },
  { id: '6', name: '偷拍自拍' },
  { id: '7', name: '国产大制作' },
  { id: '8', name: '乱伦毁三观' },
  { id: '9', name: '主播女网红' },
  { id: '10', name: '黑料网曝' },
  { id: '13', name: '高清无码' },
  { id: '14', name: '中文字幕' },
  { id: '20', name: '欧美精品' },
  { id: '21', name: '淫乱学生妹' },
  { id: '22', name: '动漫精选' },
  { id: '23', name: '动漫精选' },
  { id: '24', name: '高清有码' },
  { id: '25', name: '日本素人' },
  { id: '26', name: '视频三区' },
  { id: '27', name: '无码流出' },
  { id: '28', name: 'FC2' },
  { id: '29', name: '会所技师' },
  { id: '30', name: '国产推荐' },
  { id: '31', name: '探花约炮' },
  { id: '32', name: '韩国直播' },
  { id: '33', name: '国产直播' },
  { id: '34', name: '淫妻绿帽' },
  { id: '35', name: '制服诱惑' },
  { id: '36', name: '重口猎奇' },
  { id: '37', name: '东京热' },
  { id: '38', name: '一本道' }
];

export const getCategoryName = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : `หมวดหมู่ ${categoryId}`;
};

// ✅ ใช้ component แยกสำหรับ ProfilePage เพื่อหลีกเลี่ยงปัญหา hook
const ProfilePageWrapper = () => {
  return <ProfilePage />;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Navigate to="/category/1" replace />} />
          <Route path="category/:categoryId" element={<VideoGrid />} />
          <Route path="watch/:videoId" element={<VideoPlayer />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="profile" element={<ProfilePageWrapper />} />
          <Route path="profile/:profileName" element={<ProfilePageWrapper />} />
          
          {/* ✅ เพิ่ม Route สำหรับระบบจัดการวิดีโอ */}
          <Route path="video-management" element={<VideoManagement />} />
          {/* ✅ กำหนด route สำหรับการตั้งค่าราคา */}
          <Route path="video/:videoId/pricing" element={<EnhancedPriceSetting />} />
          <Route path="/enhanced-price-setting/:videoId?" element={<EnhancedPriceSetting />} />
        </Route>

        <Route path="/upload" element={<ImagesUploadForm />} />
        <Route path="/Ip" element={<Ip />} />
        <Route path="/Gift_List" element={<Gift_List />} />
        <Route path="/VideoHistory" element={<VideoHistory />} />
        <Route path="/Form_user/ussdfrefsdfebwrfsdFEWI*RfhdsairueASDHFIOS" element={<Form_user />} />
        <Route path="/Login" element={<Login />} />

        {/* ✅ ป้องกัน Admin Route */}
        <Route
          path="/CL_____________________________________________________________________________________******_/Admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="/Addlinks" element={<Addlinks/>} />
        <Route path="/Account" element={<Account/>} />
        <Route path="/P" element={<P/>} />

        {/* ✅ ถ้า URL ไม่ตรงเลย → 404 */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
// [file content end]