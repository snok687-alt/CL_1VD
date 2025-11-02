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

// ฟังชันหลักในการเอิ้น API
const apiCall = async (params) => {
  const url = `/api/?ac=list&${params}`;
  return retry(() => axios.get(url));
};

// ฟังชันดึงยอดวิวจากเซิร์บเวอร์
const fetchViewsFromServer = async (videoIds) => {
  try {
    const response = await fetch('/backend-api/views/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_ids: videoIds }),
    });

    const viewsData = await response.json();
    return viewsData;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงยอดวิว:', error);
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
  // หาข้อมูลนักแสดงจากฐานข้อมูล
  const actorInfo = actorsDatabase.find(actor => actor.vod_id === (item.vod_id || item.id));

  // รวมข้อมูลนักแสดงจากหลายแหล่ง
  let allActors = [];

  // จากฐานข้อมูล actorsDatabase
  if (actorInfo?.actors) {
    allActors = allActors.concat(actorInfo.actors);
  }

  // จาก API response
  if (item.vod_actor) {
    const apiActors = item.vod_actor.split(',').map(actor => actor.trim());
    allActors = allActors.concat(apiActors);
  }

  // จัดระเบียบนักแสดง - ลบซ้ำและใช้ primary name
  const normalizedActors = normalizeActors(allActors);

  return {
    id: item.vod_id || item.id,
    title: item.vod_name || item.title || actorInfo?.title || 'ບໍ່ມີຊື່',
    channelName: item.vod_director || item.director || item.type_name || 'ບໍ່ລະບຸ',
    actors: normalizedActors,
    views: serverViews[item.vod_id || item.id] || parseInt(item.vod_hits || item.hits || 0),
    duration: parseInt(item.vod_duration || item.duration || 0),
    uploadDate: item.vod_year || item.year || item.vod_time || 'ບໍ່ລະບຸ',
    thumbnail: item.vod_pic || item.pic || '',
    videoUrl: item.vod_play_url || item.url || '',
    description: item.vod_content || item.content || 'ບໍ່ມີຄຳອະທິບາຍ',
    category: item.type_name || item.type || item.vod_class || 'ທົ່ວໄປ',
    type_id: item.type_id || item.tid || '0',
    rawData: item,
    // เพิ่มข้อมูลว่านักแสดงมี profile หรือไม่
    actorsWithProfile: normalizedActors.filter(actor => hasActorProfile(actor)),
    actorsWithoutProfile: normalizedActors.filter(actor => !hasActorProfile(actor))
  };
};

// ດຶງວิດີໂອພ້ອມລາຍລະອຽດ
export const getVideosWithDetails = async (ids) => {
  if (!ids.length) return [];

  const BATCH_SIZE = 20;
  const batches = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    batches.push(
      retry(() => axios.get(`/api/?ac=detail&ids=${batchIds.join(',')}`))
    );
  }

  try {
    const results = await Promise.all(batches);

    const allItems = results.flatMap(res =>
      res.data?.list || res.data?.data || []
    );

    // ใช้ map เพื่อความเร็ว
    const serverViews = {}; // ยังไม่มีในฟังก์ชันนี้ (โหลดจาก fetchViewsFromServer ภายนอก)
    return allItems.map(item => formatVideo(item, serverViews));

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดรายละเอียดวิดีโอ:', error);
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
      if (type_id && type_id !== 'all') params.set('t', type_id);
      if (searchQuery) params.set('wd', searchQuery);
      params.set('pg', page);

      const response = await apiCall(`${params.toString()}&pgsize=50`);
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

export const fetchVideosFromAPI = async (type_id = '', searchQuery = '', limit = 18, page = 1) => {
  const cacheKey = `videos:${type_id}:${searchQuery}:${limit}:${page}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    if (type_id && type_id !== 'all') params.set('t', type_id);
    if (searchQuery) params.set('wd', searchQuery);
    params.set('pg', page);

    const response = await apiCall(params.toString());
    const videoList = response.data?.list || response.data?.data || [];
    if (!videoList.length) return [];

    const ids = videoList.map(item => item.vod_id || item.id).filter(Boolean);

    // ✅ โหลดพร้อมกัน (เร็วขึ้น)
    const [serverViews, detailedVideos] = await Promise.all([
      fetchViewsFromServer(ids),
      getVideosWithDetails(ids) // ใช้เวอร์ชันใหม่ข้างล่าง
    ]);

    // ✅ รวมยอดวิวจาก server
    const videosWithServerViews = detailedVideos.map(video => ({
      ...video,
      views: serverViews[video.id] || video.views
    }));

    const videos = limit > 0
      ? videosWithServerViews.slice(0, limit)
      : videosWithServerViews; // ถ้า limit=0 แสดงทั้งหมด
    setToCache(cacheKey, videos);
    return videos;


  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงวิดีโอ:', error);
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
      axios.get(`/api/?ac=detail&ids=${id}`)
    );

    // ปรับตามโครงสร้าง response ใหม่
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
// 🔍 ค้นหาวิดีโอ (รองรับการค้นหาด้วยชื่อ, id เดี่ยว, และ id หลายตัว)
export const searchVideos = async (query, limit = 0) => {
  if (!query || !query.trim()) return [];

  const trimmedQuery = query.trim();

  // ✅ ตรวจสอบว่าผู้ใช้ป้อน id เดียวหรือหลาย id
  const idList = trimmedQuery
    .split(/[,\s]+/) // แยกด้วย comma หรือช่องว่าง
    .map(id => id.trim())
    .filter(id => /^\d+$/.test(id)); // เอาเฉพาะตัวเลข

  if (idList.length > 0) {
    // ✅ ถ้ามี id มากกว่า 1 — ดึงทั้งหมดในคราวเดียว
    if (idList.length === 1) {
      const video = await getVideoById(idList[0]);
      return video ? [video] : [];
    } else {
      // ดึงข้อมูลหลายวิดีโอพร้อมกัน
      const videos = await getVideosWithDetails(idList);

      // ดึงยอดวิวจากเซิร์ฟเวอร์
      const serverViews = await fetchViewsFromServer(idList);

      // รวมยอดวิว
      const videosWithServerViews = videos.map(video => ({
        ...video,
        views: serverViews[video.id] || video.views
      }));

      return videosWithServerViews;
    }
  }

  // ✅ ถ้าไม่ใช่ตัวเลข — ค้นหาตามชื่อหรือคำค้นตามปกติ
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
    // ใช้ type_id ในการค้นหาวิดีโอในหมวดหมู่เดียวกัน
    const categoryVideos = await fetchVideosFromAPI(currentVideoTypeId, '', limit);

    // กองวิดีโอปัจจุบันออกและจำกัดจำนวน
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

    // กองวิดีโอที่ไม่ได้อยู่ใน excludeIds
    const filtered = videos.filter(video => !excludeIds.includes(video.id));

    // เรียงลำดับตามยอดวิวจากสูงไปต่ำ
    const sortedByViews = filtered.sort((a, b) => b.views - a.views);

    return {
      videos: sortedByViews,
      hasMore: videos.length === limit // ตรวจสอบว่ายังมีวิดีโอเหลือหรือไม่
    };
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงวิดีโอเพิ่มเติม:', error);
    return { videos: [], hasMore: false };
  }
};

// ดึงรายการหมวดหมู่
export const getCategories = async () => {
  const cacheKey = 'categories';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiCall('limit=100');
    const videos = response.data?.list || response.data?.data || [];

    // สร้าง array ของหมวดหมู่จาก type_id และ type_name
    const categoryMap = new Map();

    videos.forEach(item => {
      const typeId = item.type_id || item.tid;
      const typeName = item.type_name || item.type;

      if (typeId && typeName) {
        categoryMap.set(typeId, typeName);
      }
    });

    // แปลง Map เป็น array ของ object
    const categories = Array.from(categoryMap, ([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.id - b.id);

    setToCache(cacheKey, categories);
    return categories;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงหมวดหมู่:', error);
    // หมวดหมู่เริ่มต้น
    return [
      { id: '1', name: '伦理片' },
      { id: '2', name: '悬疑片' },
      { id: '3', name: '战争片' },
      { id: '4', name: '犯罪片' },
      { id: '5', name: '剧情片' },
      { id: '6', name: '恐怖片' },
      { id: '7', name: '科幻片' },
      { id: '8', name: '爱情片' },
      { id: '9', name: '喜剧片' },
      { id: '10', name: '动作片' },
      { id: '11', name: '奇幻片' },
      { id: '12', name: '冒险片' },
      { id: '13', name: '惊悚片' },
      { id: '14', name: '动画片' },
      { id: '15', name: '记录片' }
    ];
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
    const response = await axios.get('/api/?ac=list&limit=1', { timeout: 5000 });
    return { status: 'ok', data: response.data };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

// ========== ฟังก์ชันสำหรับนักแสดง (ใช้จาก actorData.js ที่ปรับปรุงแล้ว) ==========

// ดึงวิดีโอตามนักแสดง - ปรับปรุงให้ใช้ primary name


export const getVideosByActor = async (actorName, limit = 50) => {
  const primaryName = getPrimaryName(actorName);
  const cacheKey = `videosByActor:${primaryName}:${limit}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    // ใช้ฟังก์ชันจาก actorData.js ด้วย primary name
    const actorVideos = getActorVideos(primaryName);

    if (actorVideos.length === 0) {
      return [];
    }

    // ดึงรายละเอียดวิดีโอจาก API
    const videoIds = actorVideos.map(v => v.vod_id).slice(0, limit);
    const detailedVideos = await getVideosWithDetails(videoIds);

    // ดึงยอดวิวจากเซิร์บเวอร์
    const serverViews = await fetchViewsFromServer(videoIds);

    // รวมยอดวิวจากเซิร์บเวอร์
    const videosWithServerViews = detailedVideos.map(video => ({
      ...video,
      views: serverViews[video.id] || video.views
    }));

    setToCache(cacheKey, videosWithServerViews);
    return videosWithServerViews;
  } catch (error) {
    console.error('เกิดข้อผิดพาดในการดึงวิดีโอของนักแสดง:', error);
    return [];
  }
};

// ค้นหาวิดีโอตามนักแสดง - รองรับทั้งชื่อจริงและชื่อทางเลือก
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

// ดึงวิดีโอที่มีนักแสดงหลายคน - ปรับปรุงให้ใช้ primary name
export const getVideosByMultipleActors = async (actorNames, limit = 18) => {
  if (!actorNames || !actorNames.length) return [];

  try {
    const primaryNames = actorNames.map(name => getPrimaryName(name.trim()));
    const videoSets = [];

    // ดึงวิดีโอของแต่ละนักแสดง
    for (const primaryName of primaryNames) {
      const actorVideos = getActorVideos(primaryName);
      if (actorVideos.length > 0) {
        videoSets.push(new Set(actorVideos.map(v => v.vod_id)));
      }
    }

    if (videoSets.length === 0) return [];

    // หาวิดีโอที่มีนักแสดงทุกคน (intersection)
    let commonVideoIds = videoSets[0];
    for (let i = 1; i < videoSets.length; i++) {
      commonVideoIds = new Set([...commonVideoIds].filter(id => videoSets[i].has(id)));
    }

    if (commonVideoIds.size === 0) return [];

    // ดึงรายละเอียดวิดีโอ
    const videoIds = Array.from(commonVideoIds).slice(0, limit);
    const detailedVideos = await getVideosWithDetails(videoIds);

    // ดึงยอดวิวจากเซิร์บเวอร์
    const serverViews = await fetchViewsFromServer(videoIds);

    // รวมยอดวิวจากเซิร์บเวอร์
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
      // ล้าง cache ของวิดีโอนี้
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

      // ดึงยอดวิวจากเซิร์บเวอร์
      const serverViews = await fetchViewsFromServer(favoriteData.video_ids);

      // รวมยอดวิวจากเซิร์บเวอร์
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

    // ล้าง cache ประวัติของผู้ใช้
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

      // ดึงยอดวิวจากเซิร์บเวอร์
      const serverViews = await fetchViewsFromServer(videoIds);

      // รวมข้อมูลเวลาที่ชมและยอดวิวด้วย
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

    // เรียงลำดับตามจำนวนวิดีโอ
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

