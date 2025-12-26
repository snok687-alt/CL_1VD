// [file name]: videoData.js
// [file content begin]
import axios from 'axios';
// นำเข้าฟังก์ชันเกี่ยวกับนักแสดงจากไฟล์แยก (ปรับปรุงใหม่)
import {
  getActorVideos,
  actorsDatabase,
  getPrimaryName,
  hasActorProfile
} from './actorData';


// ตั้งค่า axios
axios.defaults.timeout = 10000;

// API endpoint ใหม่
const API_BASE_URL = '/api';

// ใน videoData.js - เพิ่มฟังก์ชันดึงยอดวิว real-time
export const fetchRealTimeViews = async (videoIds) => {
  try {
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return {};
    }

    const validVideoIds = videoIds.filter(id => id != null && id !== '');
    
    if (validVideoIds.length === 0) {
      return {};
    }

    const response = await fetch('/backend-api/views/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_ids: validVideoIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const viewsData = await response.json();
    console.log('📊 ยอดวิว real-time ที่ดึงได้:', viewsData);
    return viewsData;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงยอดวิว real-time:', error);
    return {};
  }
};

// ฟังชันช่วยในการลองใหม่
const retry = async (fn, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Cache ง่ายๆ เพื่อเก็บข้อมูลไว้ชั่วคราว
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 นาที

// ดึงข้อมูลจาก cache
const getFromCache = (key) => {
  const item = cache.get(key);
  if (!item || Date.now() - item.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

// เก็บข้อมูลใน cache
const setToCache = (key, data) => {
  if (cache.size > 50) cache.clear(); // ล้าง cache เมื่อหลายเกินไป
  cache.set(key, { data, time: Date.now() });
};

// ฟังชันหลักในการเรียก API ใหม่
const apiCall = async (params) => {
  return retry(() =>
    axios.get('/api/api.php/provide/vod/', { 
      params: params
    })
  );
};

// ฟังก์ชันดึงยอดวิวจากเซิร์ฟเวอร์
const fetchViewsFromServer = async (videoIds) => {
  try {
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return {};
    }

    const validVideoIds = videoIds.filter(id => id != null && id !== '');
    
    if (validVideoIds.length === 0) {
      return {};
    }

    const response = await fetch('/backend-api/views/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_ids: validVideoIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const viewsData = await response.json();
    console.log('📊 ยอดวิวที่ดึงได้:', viewsData);
    return viewsData;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงยอดวิว:', error);
    return {};
  }
};

// ฟังก์ชันจัดระเบียบชื่อนักแสดง - ใช้ primary name และลบซ้ำ
const normalizeActors = (actors) => {
  if (!actors || !Array.isArray(actors)) return [];

  const uniqueActors = new Set();

  actors.forEach(actor => {
    if (actor && actor.trim()) {
      const primaryName = getPrimaryName(actor.trim());
      uniqueActors.add(primaryName);
    }
  });

  return Array.from(uniqueActors);
};

// ปรับปรุงฟังชัน formatVideo - จัดรูปแบบข้อมูลวิดีโอพร้อมจัดระเบียบนักแสดง
const formatVideo = (item, serverViews = {}) => {
  console.log('📝 Formatting video item:', item);
  
  // หาข้อมูลนักแสดงจากฐานข้อมูล
  const actorInfo = actorsDatabase.find(actor => 
    actor.vod_id === (item.vod_id || item.id || item.vodid)
  );

  // รวมข้อมูลนักแสดงจากหลายแหล่ง
  let allActors = [];

  // จากฐานข้อมูล actorsDatabase
  if (actorInfo?.actors) {
    allActors = allActors.concat(actorInfo.actors);
  }

  // จาก API response
  if (item.vod_actor || item.actor) {
    const actorString = item.vod_actor || item.actor || '';
    const apiActors = actorString.split(',').map(actor => actor.trim()).filter(a => a);
    allActors = allActors.concat(apiActors);
  }

  // จัดระเบียบนักแสดง - ลบซ้ำและใช้ primary name
  const normalizedActors = normalizeActors(allActors);

  const formatted = {
    id: item.vod_id || item.id || item.vodid || 'unknown',
    title: item.vod_name || item.title || item.name || actorInfo?.title || 'No title',
    channelName: item.vod_director || item.director || item.type_name || 'Unknown',
    actors: normalizedActors,
    views: parseInt(item.vod_hits || item.hits || item.vod_views || 0),
    duration: parseInt(item.vod_duration || item.duration || 0),
    uploadDate: item.vod_year || item.year || item.vod_time || item.time || 'Unknown',
    thumbnail: item.vod_pic || item.pic || item.cover || '',
    videoUrl: item.vod_play_url || item.url || item.play_url || '',
    description: item.vod_content || item.content || item.description || 'No description',
    category: item.type_name || item.type || item.vod_class || 'General',
    type_id: item.type_id || item.tid || item.typeid || '0',
    rawData: item,
    // เพิ่มข้อมูลว่านักแสดงมี profile หรือไม่
    actorsWithProfile: normalizedActors.filter(actor => hasActorProfile(actor)),
    actorsWithoutProfile: normalizedActors.filter(actor => !hasActorProfile(actor))
  };

  console.log('✅ Formatted video:', formatted.id, formatted.title);
  return formatted;
};
// ດຶງວິດີໂອພ້ອມລາຍລະອຽດ
export const getVideosWithDetails = async (ids) => {
  if (!ids.length) return [];

  const BATCH_SIZE = 20;
  const batches = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    batches.push(
      retry(() => axios.get(`${API_BASE_URL}/api.php/provide/vod/?ac=detail&ids=${batchIds.join(',')}`))
    );
  }

  try {
    const results = await Promise.all(batches);
    
    const allItems = results.flatMap(res => {
      // รองรับโครงสร้างข้อมูลหลายรูปแบบ
      return res.data?.list || 
             res.data?.data || 
             res.data?.vod || 
             res.data?.videos || 
             [];
    });

    console.log('🔍 getVideosWithDetails - items found:', allItems.length);
    
    if (allItems.length === 0) {
      console.warn('⚠️ No items returned from detail API');
      console.log('Detail API responses:', results.map(r => r.data));
    }

    return allItems.map(item => {
      const formatted = formatVideo(item, {});
      console.log('📝 Formatted video:', formatted.id, formatted.title);
      return formatted;
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดรายละเอียดวิดีโอ:', error);
    console.error('Error URL:', error.config?.url);
    return [];
  }
};


// ========== ฟังชันหลักสำหรับวิดีโอ ==========

// ฟังชันหลัก - ดึงวิดีโอจาก API
export const fetchVideosFromAPI_S = async (type_id = '', searchQuery = '', limit = 0) => {
  const cacheKey = `videos:${type_id}:${searchQuery}:${limit}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const allVideos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && (limit === 0 || allVideos.length < limit)) {
    try {
      const params = new URLSearchParams();
      params.set('ac', 'list');
      if (type_id && type_id !== 'all') params.set('t', type_id);
      if (searchQuery) params.set('wd', searchQuery);
      params.set('pg', page);
      params.set('pgsize', 50);

      const response = await apiCall(params.toString());
      const videoList = response.data?.list || response.data?.data || [];
      if (!videoList.length) break;

      const ids = videoList.map(item => item.vod_id || item.id).filter(Boolean);
      const [serverViews, detailedVideos] = await Promise.all([
        fetchViewsFromServer(ids),
        getVideosWithDetails(ids)
      ]);

      const videosWithServerViews = detailedVideos.map(video => ({
        ...video,
        views: serverViews[video.id] || video.views
      }));

      allVideos.push(...videosWithServerViews);

      hasMore = videoList.length > 0;
      page++;
    } catch (error) {
      console.error('API fetch error:', error);
      break;
    }
  }

  const result = limit > 0 ? allVideos.slice(0, limit) : allVideos;
  setToCache(cacheKey, result);
  return result;
};

// ฟังชันดึงวิดีโอจาก API ใหม่
export const fetchVideosFromAPI = async (type_id = '', searchQuery = '', limit = 18, page = 1) => {
  const cacheKey = `videos:${type_id}:${searchQuery}:${limit}:${page}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('📦 Using cached data:', cached.length, 'videos');
    return cached;
  }

  try {
    console.log('🌐 Fetching videos from API:', { type_id, searchQuery, limit, page });
    
    // พารามิเตอร์พื้นฐาน
    const params = {
      ac: 'list',
      pg: page,
    };
    
    // ใช้ limit แทน pgsize ตามที่เห็นใน API response
    params.limit = limit;
    
    if (type_id && type_id !== 'all') params.t = type_id;
    if (searchQuery) params.wd = searchQuery;
    
    console.log('📡 API params:', params);
    
    const response = await apiCall(params);
    console.log('✅ API response code:', response.data?.code);
    console.log('📊 Response message:', response.data?.msg);
    console.log('🔢 Page count:', response.data?.pagecount);
    console.log('🔢 Total videos:', response.data?.total);
    
    const videoList = response.data?.list || [];
    console.log('🎬 Video list from API:', videoList.length, 'items');
    
    // ถ้าไม่มีวิดีโอในหมวดหมู่นี้ ให้ลองดึงจากหมวดหมู่ทั่วไป
    if (!videoList.length && type_id && type_id !== 'all') {
      console.log('⚠️ No videos in category', type_id, ', trying all categories...');
      
      // ลองเรียกหมวดหมู่ทั่วไป (ไม่ระบุ t)
      const generalParams = { ...params };
      delete generalParams.t; // ลบพารามิเตอร์หมวดหมู่
      
      const generalResponse = await apiCall(generalParams);
      const generalVideoList = generalResponse.data?.list || [];
      console.log('🌐 General category videos:', generalVideoList.length, 'items');
      
      if (generalVideoList.length > 0) {
        const ids = generalVideoList.map(item => item.vod_id || item.id).filter(Boolean);
        const detailedVideos = await getVideosWithDetails(ids);
        
        const videos = limit > 0
          ? detailedVideos.slice(0, limit)
          : detailedVideos;
        
        setToCache(cacheKey, videos);
        return videos;
      }
    }
    
    if (!videoList.length) {
      console.warn('⚠️ No videos found in API response');
      return [];
    }

    const ids = videoList.map(item => item.vod_id || item.id).filter(Boolean);
    console.log('🆔 Video IDs to fetch details:', ids);
    
    const detailedVideos = await getVideosWithDetails(ids);
    console.log('🎬 Detailed videos:', detailedVideos.length);
    
    const videos = limit > 0
      ? detailedVideos.slice(0, limit)
      : detailedVideos;
    
    setToCache(cacheKey, videos);
    return videos;

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงวิดีโอ:', error);
    console.error('Error details:', error.response?.data || error.message);
    return [];
  }
};

// ดึงวิดีโอตาม ID
export const getVideoById = async (id) => {
  const cacheKey = `video:${id}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await retry(() =>
      axios.get(`${API_BASE_URL}/api.php/provide/vod/at/json?ac=detail&ids=${id}`)
    );

    const videoData = response.data?.list?.[0] || response.data?.data?.[0];
    if (!videoData) return null;

    const video = formatVideo(videoData);
    setToCache(cacheKey, video);
    return video;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงวิดีโอตาม ID:', error);
    return null;
  }
};

// ค้นหาวิดีโอ
export const searchVideos = async (query, limit = 0) => {
  if (!query || !query.trim()) return [];

  const trimmedQuery = query.trim();

  const idList = trimmedQuery
    .split(/[,\s]+/)
    .map(id => id.trim())
    .filter(id => /^\d+$/.test(id));

  if (idList.length > 0) {
    if (idList.length === 1) {
      const video = await getVideoById(idList[0]);
      return video ? [video] : [];
    } else {
      const videos = await getVideosWithDetails(idList);
      const serverViews = await fetchViewsFromServer(idList);

      const videosWithServerViews = videos.map(video => ({
        ...video,
        views: serverViews[video.id] || video.views
      }));

      return videosWithServerViews;
    }
  }

  return fetchVideosFromAPI_S('', trimmedQuery, limit);
};

// ดึงวิดีโอตามหมวดหมู่
export const getVideosByCategory = async (type_id, limit = 18) => {
  if (!type_id || type_id === 'all') {
    return fetchVideosFromAPI('', '', limit);
  }
  return fetchVideosFromAPI(type_id, '', limit);
};

// ดึงวิดีโอที่เกี่ยวข้อง
export const getRelatedVideos = async (currentVideoId, currentVideoTypeId, currentVideoTitle, limit = 18) => {
  if (!currentVideoTypeId) return [];

  try {
    const categoryVideos = await fetchVideosFromAPI(currentVideoTypeId, '', limit);

    const related = categoryVideos
      .filter(video => video.id !== currentVideoId)
      .slice(0, limit);

    return related;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงวิดีโอที่เกี่ยวข้อง:', error);
    return [];
  }
};

// ดึงวิดีโอเพิ่มเติมในหมวดหมู่
export const getMoreVideosInCategory = async (type_id, excludeIds = [], page = 1, limit = 18) => {
  try {
    const videos = await fetchVideosFromAPI(type_id, '', limit, page);

    const filtered = videos.filter(video => !excludeIds.includes(video.id));
    const sortedByViews = filtered.sort((a, b) => b.views - a.views);

    return {
      videos: sortedByViews,
      hasMore: videos.length === limit
    };
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงวิดีโอเพิ่มเติม:', error);
    return { videos: [], hasMore: false };
  }
};

// ดึงรายการหมวดหมู่จาก API ใหม่
export const getCategories = async () => {
  const cacheKey = 'categories';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiCall('ac=list&limit=100');
    
    // ใช้ข้อมูลหมวดหมู่จาก response โดยตรง
    const categoriesData = response.data?.class || [];
    
    if (categoriesData.length > 0) {
      // เก็บ ID ที่ต้องการกรอง (กลุ่มหลักที่ต้องการซ่อน)
      const excludedMainIds = ['1', '2', '26']; // 视频一区, 视频二区, 视频三区
      
      // เก็บกลุ่มหมวดหมู่ที่ซ้ำกันเพื่อตรวจสอบ
      const categoryNameMap = new Map();
      
      // กรองหมวดหมู่ที่ไม่ต้องการและตรวจสอบซ้ำ
      const uniqueCategories = categoriesData
        .filter(category => {
          // กรองหมวดหมู่หลักที่ต้องการซ่อน
          if (excludedMainIds.includes(String(category.type_id))) {
            return false;
          }
          
          // ตรวจสอบชื่อซ้ำ
          const categoryName = category.type_name.trim();
          if (categoryNameMap.has(categoryName)) {
            // ถ้าชื่อซ้ำ ให้ตรวจสอบว่า ID ไหนควรอยู่
            const existingId = categoryNameMap.get(categoryName);
            // เลือก ID ที่ใหญ่กว่า (มักจะเป็นหมวดหมู่ย่อยที่ใหม่กว่า)
            return String(category.type_id) > existingId;
          }
          
          categoryNameMap.set(categoryName, String(category.type_id));
          return true;
        })
        .map(category => {
          const categoryName = category.type_name;
          let colorGroup = 'default';
          
          // กำหนดกลุ่มสีตามหมวดหมู่ (เหมือนเดิม)
          const categoryGroups = {
            '区域分类': ['视频一区', '视频二区', '视频三区'],
            '品质分类': ['高清无码', '高清有码', '无码流出', '中文字幕'],
            '来源分类': ['国产大制作', '国产推荐', '国产直播', '日本素人', '欧美精品', '韩国直播', 'FC2', '东京热', '一本道'],
            '内容分类': ['偷拍自拍', '乱伦毁三观', '淫乱学生妹', '淫妻绿帽', '探花约炮', '重口猎奇', '制服诱惑', '会所技师', '主播女网红', '黑料网曝', '动漫精选'],
          };
          
          for (const [group, items] of Object.entries(categoryGroups)) {
            if (items.includes(categoryName)) {
              colorGroup = group;
              break;
            }
          }
          
          return {
            id: String(category.type_id),
            name: categoryName,
            path: `/category/${category.type_id}`,
            colorGroup: colorGroup,
            isPrimary: categoryName === '视频一区' || categoryName === '视频二区' || categoryName === '视频三区'
          };
        })
        .sort((a, b) => {
          // เรียงลำดับตามกลุ่ม
          const order = {
            '品质分类': 1,
            '来源分类': 2,
            '内容分类': 3,
            'default': 4
          };
          return order[a.colorGroup] - order[b.colorGroup] || a.name.localeCompare(b.name);
        });
      
      setToCache(cacheKey, uniqueCategories);
      return uniqueCategories;
    }

    // ถ้าไม่มีข้อมูลจาก API ให้ใช้หมวดหมู่ที่ปรับปรุงใหม่ (กรองซ้ำด้วย)
    const optimizedCategories = [
      // เอาเฉพาะหมวดหมู่ที่ไม่ซ้ำ
      // กลุ่ม: 品质分类
      { id: '13', name: '高清无码', path: '/category/13', colorGroup: '品质分类', isPrimary: false },
      { id: '14', name: '中文字幕', path: '/category/14', colorGroup: '品质分类', isPrimary: false },
      { id: '24', name: '高清有码', path: '/category/24', colorGroup: '品质分类', isPrimary: false },
      { id: '27', name: '无码流出', path: '/category/27', colorGroup: '品质分类', isPrimary: false },
      
      // กลุ่ม: 来源分类
      { id: '7', name: '国产大制作', path: '/category/7', colorGroup: '来源分类', isPrimary: false },
      { id: '25', name: '日本素人', path: '/category/25', colorGroup: '来源分类', isPrimary: false },
      { id: '28', name: 'FC2', path: '/category/28', colorGroup: '来源分类', isPrimary: false },
      { id: '30', name: '国产推荐', path: '/category/30', colorGroup: '来源分类', isPrimary: false },
      { id: '33', name: '国产直播', path: '/category/33', colorGroup: '来源分类', isPrimary: false },
      { id: '32', name: '韩国直播', path: '/category/32', colorGroup: '来源分类', isPrimary: false },
      { id: '3', name: '欧美精品', path: '/category/3', colorGroup: '来源分类', isPrimary: false },
      { id: '37', name: '东京热', path: '/category/37', colorGroup: '来源分类', isPrimary: false },
      { id: '38', name: '一本道', path: '/category/38', colorGroup: '来源分类', isPrimary: false },
      
      // กลุ่ม: 内容分类
      { id: '6', name: '偷拍自拍', path: '/category/6', colorGroup: '内容分类', isPrimary: false },
      { id: '8', name: '乱伦毁三观', path: '/category/8', colorGroup: '内容分类', isPrimary: false },
      { id: '21', name: '淫乱学生妹', path: '/category/21', colorGroup: '内容分类', isPrimary: false },
      { id: '9', name: '主播女网红', path: '/category/9', colorGroup: '内容分类', isPrimary: false },
      { id: '10', name: '黑料网曝', path: '/category/10', colorGroup: '内容分类', isPrimary: false },
      { id: '29', name: '会所技师', path: '/category/29', colorGroup: '内容分类', isPrimary: false },
      { id: '35', name: '制服诱惑', path: '/category/35', colorGroup: '内容分类', isPrimary: false },
      { id: '31', name: '探花约炮', path: '/category/31', colorGroup: '内容分类', isPrimary: false },
      { id: '34', name: '淫妻绿帽', path: '/category/34', colorGroup: '内容分类', isPrimary: false },
      { id: '36', name: '重口猎奇', path: '/category/36', colorGroup: '内容分类', isPrimary: false },
      { id: '22', name: '动漫精选', path: '/category/22', colorGroup: '内容分类', isPrimary: false },
    ];
    
    setToCache(cacheKey, optimizedCategories);
    return optimizedCategories;

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงหมวดหมู่:', error);
    // คืนค่าหมวดหมู่ที่กรองแล้ว
    return [...optimizedCategories];
  }
};
// ดึงวิดีโอทั้งหมดในหมวดหมู่
export const getAllVideosByCategory = async (type_id, limit = 0) => {
  if (limit > 0) return getVideosByCategory(type_id, limit);

  const allVideos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && allVideos.length < 500) {
    const result = await getMoreVideosInCategory(
      type_id,
      allVideos.map(v => v.id),
      page,
      50
    );

    if (result.videos.length === 0) break;

    allVideos.push(...result.videos);
    hasMore = result.hasMore;
    page++;

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return allVideos;
};

// ดึงวิดีโอทั้งหมด
export const getAllVideos = async (limit = 18) => {
  return fetchVideosFromAPI('', '', limit);
};

// ตรวจสอบสถานะ API
export const checkAPIStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api.php/provide/vod/at/json?ac=list&limit=1`, { timeout: 5000 });
    return { status: 'ok', data: response.data };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

// ========== ฟังก์ชันสำหรับนักแสดง (ใช้จาก actorData.js ที่ปรับปรุงแล้ว) ==========

// ดึงวิดีโอตามนักแสดง
export const getVideosByActor = async (actorName, limit = 50) => {
  const primaryName = getPrimaryName(actorName);
  const cacheKey = `videosByActor:${primaryName}:${limit}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const actorVideos = getActorVideos(primaryName);
    if (actorVideos.length === 0) return [];

    const videoIds = actorVideos.map(v => v.vod_id).slice(0, limit);
    const detailedVideos = await getVideosWithDetails(videoIds);

    setToCache(cacheKey, detailedVideos);
    return detailedVideos;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงวิดีโอของนักแสดง:', error);
    return [];
  }
};

// ค้นหาวิดีโอตามนักแสดง
export const searchVideosByActor = async (actorQuery, limit = 50) => {
  if (!actorQuery.trim()) return [];

  try {
    const primaryName = getPrimaryName(actorQuery.trim());
    return await getVideosByActor(primaryName, limit);
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการค้นหาวิดีโอตามนักแสดง:', error);
    return [];
  }
};

// ดึงวิดีโอที่มีนักแสดงหลายคน
export const getVideosByMultipleActors = async (actorNames, limit = 18) => {
  if (!actorNames || !actorNames.length) return [];

  try {
    const primaryNames = actorNames.map(name => getPrimaryName(name.trim()));
    const videoSets = [];

    for (const primaryName of primaryNames) {
      const actorVideos = getActorVideos(primaryName);
      if (actorVideos.length > 0) {
        videoSets.push(new Set(actorVideos.map(v => v.vod_id)));
      }
    }

    if (videoSets.length === 0) return [];

    let commonVideoIds = videoSets[0];
    for (let i = 1; i < videoSets.length; i++) {
      commonVideoIds = new Set([...commonVideoIds].filter(id => videoSets[i].has(id)));
    }

    if (commonVideoIds.size === 0) return [];

    const videoIds = Array.from(commonVideoIds).slice(0, limit);
    const detailedVideos = await getVideosWithDetails(videoIds);
    const serverViews = await fetchViewsFromServer(videoIds);

    const videosWithServerViews = detailedVideos.map(video => ({
      ...video,
      views: serverViews[video.id] || video.views
    }));

    return videosWithServerViews;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงวิดีโอของนักแสดงหลายคน:', error);
    return [];
  }
};

// ========== ฟังก์ชันเพิ่มเติมสำหรับจัดการข้อมูล ==========

// ฟังก์ชันอัปเดตยอดวิว
export const updateVideoViews = async (videoId) => {
  try {
    const response = await fetch('/backend-api/views/increment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_id: videoId }),
    });

    if (response.ok) {
      cache.delete(`video:${videoId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการอัปเดตยอดวิว:', error);
    return false;
  }
};

// ฟังก์ชันเพิ่มวิดีโอในรายการโปรด
export const addToFavorites = async (videoId, userId) => {
  try {
    const response = await fetch('/api/favorites/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_id: videoId, user_id: userId }),
    });

    return response.ok;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการเพิ่มรายการโปรด:', error);
    return false;
  }
};

// ฟังก์ชันลบวิดีโอจากรายการโปรด
export const removeFromFavorites = async (videoId, userId) => {
  try {
    const response = await fetch('/api/favorites/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_id: videoId, user_id: userId }),
    });

    return response.ok;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการลบรายการโปรด:', error);
    return false;
  }
};

// ใน videoData.js - เพิ่มฟังก์ชันนี้
const filterDuplicateVideos = (videos) => {
  const seenIds = new Set();
  const uniqueVideos = [];
  
  for (const video of videos) {
    if (!seenIds.has(video.id)) {
      seenIds.add(video.id);
      uniqueVideos.push(video);
    }
  }
  
  return uniqueVideos;
};

// หรือแบบที่คงลำดับจาก API แต่กรองซ้ำ
const filterDuplicatesPreserveOrder = (videos) => {
  const uniqueVideos = [];
  const idMap = new Map();
  
  for (const video of videos) {
    if (!idMap.has(video.id)) {
      idMap.set(video.id, video);
      uniqueVideos.push(video);
    }
  }
  
  return uniqueVideos;
};

// ฟังก์ชันดึงรายการโปรด
export const getFavoriteVideos = async (userId, limit = 20) => {
  const cacheKey = `favorites:${userId}:${limit}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`/api/favorites/get?user_id=${userId}&limit=${limit}`);
    const favoriteData = await response.json();

    if (favoriteData.video_ids && favoriteData.video_ids.length > 0) {
      const videos = await getVideosWithDetails(favoriteData.video_ids);
      const serverViews = await fetchViewsFromServer(favoriteData.video_ids);

      const videosWithServerViews = videos.map(video => ({
        ...video,
        views: serverViews[video.id] || video.views
      }));

      setToCache(cacheKey, videosWithServerViews);
      return videosWithServerViews;
    }

    return [];
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงรายการโปรด:', error);
    return [];
  }
};

// ฟังก์ชันบันทึกประวัติการชม
export const addToWatchHistory = async (videoId, userId, watchTime = 0) => {
  try {
    const response = await fetch('/api/history/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_id: videoId,
        user_id: userId,
        watch_time: watchTime,
        timestamp: Date.now()
      }),
    });

    if (response.ok) {
      const historyKeys = Array.from(cache.keys()).filter(key =>
        key.startsWith(`history:${userId}`)
      );
      historyKeys.forEach(key => cache.delete(key));
    }

    return response.ok;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการบันทึกประวัติ:', error);
    return false;
  }
};

// ฟังก์ชันดึงประวัติการชม
export const getWatchHistory = async (userId, limit = 20) => {
  const cacheKey = `history:${userId}:${limit}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`/api/history/get?user_id=${userId}&limit=${limit}`);
    const historyData = await response.json();

    if (historyData.videos && historyData.videos.length > 0) {
      const videoIds = historyData.videos.map(item => item.video_id);
      const videos = await getVideosWithDetails(videoIds);
      const serverViews = await fetchViewsFromServer(videoIds);

      const videosWithHistory = videos.map(video => {
        const historyItem = historyData.videos.find(item => item.video_id === video.id);
        return {
          ...video,
          views: serverViews[video.id] || video.views,
          watchTime: historyItem?.watch_time || 0,
          watchedAt: historyItem?.timestamp || Date.now()
        };
      });

      setToCache(cacheKey, videosWithHistory);
      return videosWithHistory;
    }

    return [];
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงประวัติการชม:', error);
    return [];
  }
};

// ฟังก์ชันล้าง cache
export const clearCache = () => {
  cache.clear();
};

// ฟังก์ชันล้าง cache เฉพาะของนักแสดง
export const clearActorCache = (actorName) => {
  const primaryName = getPrimaryName(actorName);
  const keysToDelete = Array.from(cache.keys()).filter(key =>
    key.includes(`videosByActor:${primaryName}`)
  );
  keysToDelete.forEach(key => cache.delete(key));
};

// ฟังก์ชันดึงข้อมูลสถิติ
export const getVideoStats = async () => {
  try {
    const response = await fetch('/api/stats/general');
    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงสถิติ:', error);
    return {
      totalVideos: 0,
      totalViews: 0,
      totalUsers: 0,
      popularCategories: []
    };
  }
};

// ฟังก์ชันดึงสถิติของนักแสดงในวิดีโอ
export const getActorVideoStats = async () => {
  try {
    const allVideos = await getAllVideos(100);
    const actorStats = new Map();

    allVideos.forEach(video => {
      video.actors.forEach(actor => {
        const primaryName = getPrimaryName(actor);
        if (!actorStats.has(primaryName)) {
          actorStats.set(primaryName, {
            name: primaryName,
            videoCount: 0,
            totalViews: 0,
            hasProfile: hasActorProfile(primaryName)
          });
        }

        const stats = actorStats.get(primaryName);
        stats.videoCount++;
        stats.totalViews += video.views || 0;
      });
    });

    const sortedStats = Array.from(actorStats.values())
      .sort((a, b) => b.videoCount - a.videoCount)

    return {
      topActors: sortedStats,
      totalActorsInVideos: actorStats.size,
      actorsWithProfile: Array.from(actorStats.values()).filter(actor => actor.hasProfile).length
    };
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงสถิตินักแสดง:', error);
    return {
      topActors: [],
      totalActorsInVideos: 0,
      actorsWithProfile: 0
    };
  }
};
// [file content end]