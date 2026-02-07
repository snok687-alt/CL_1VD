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
import UserVideoHistory from '../pages/UserVideoHistory';
import AG from '../game/App'
import AdminDashboard from '../game/AdminReportDashboard';
// import A from '../game/A';

const categories = [
  { id: '32', name: '国产视频' },
  { id: '33', name: '国产主播' },
  { id: '34', name: '91大神' },
  { id: '35', name: '热门事件' },
  { id: '36', name: '传媒自拍' },
  { id: '38', name: '日本有码' },
  { id: '39', name: '日本无码' },
  { id: '40', name: '日韩主播' },
  { id: '41', name: '动漫肉番' },
  { id: '42', name: '女同性恋' },
  { id: '43', name: '中文字幕' },
  { id: '44', name: '强奸乱伦' },
  { id: '45', name: '熟女人妻' },
  { id: '46', name: '制服诱惑' },
  { id: '47', name: 'AV解说' },
  { id: '48', name: '女星换脸' },
  { id: '49', name: '百万三区' },
  { id: '50', name: '欧美精品' }
];

export const getCategoryName = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : `หมวดหมู่ ${categoryId}`;
};

const ProfilePageWrapper = () => {
  return <ProfilePage />;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Navigate to="/category/32" replace />} />
          <Route path="category/:categoryId" element={<VideoGrid />} />
          <Route path="watch/:videoId" element={<VideoPlayer />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="profile" element={<ProfilePageWrapper />} />
          <Route path="profile/:profileName" element={<ProfilePageWrapper />} />
          <Route path="video-management" element={<VideoManagement />} />
          <Route path="video/:videoId/pricing" element={<EnhancedPriceSetting />} />
          <Route path="/enhanced-price-setting/:videoId?" element={<EnhancedPriceSetting />} />
        </Route>

        {/* ✅ Admin Routes - Nested Layout */}
        <Route
          path="/CL_____________________________________________________________________________________******_/Admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        >
          {/* Admin Dashboard (default) */}
          <Route index element={<div>Dashboard Content Here</div>} />
          
          {/* IP Management */}
          <Route path="ip" element={<Ip />} />
          
          {/* Video Management */}
          <Route path="video-management" element={<VideoManagement />} />
          
          {/* Add Links */}
          <Route path="links" element={<Addlinks />} />
          
          {/* Gift Accounts */}
          <Route path="accounts" element={<Account />} />
          
          {/* Game Admin */}
          <Route path="games" element={<AdminDashboard />} />
          {/* <Route path="A" element={<A />} /> */}
        </Route>

        {/* ✅ Other Routes */}
        <Route path="/upload" element={<ImagesUploadForm />} />
        <Route path="/Gift_List" element={<Gift_List />} />
        <Route path="/UserVideoHistory" element={<UserVideoHistory />} />
        <Route path="/Form_user/ussdfrefsdfebwrfsdFEWI*RfhdsairueASDHFIOS" element={<Form_user />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/AG" element={<AG/>} />
        <Route path="/P" element={<P/>} />

        {/* ✅ 404 */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;