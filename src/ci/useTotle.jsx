import { useEffect, useState } from "react";

const MAX_VIEW = 3;
const STORAGE_COUNT_KEY = "totle_view_count_global";
const STORAGE_LOCK_KEY = "totle_locked_global";

export default function useTotle(videoId = "any") { 
  const [viewCount, setViewCount] = useState(0);
  const [locked, setLocked] = useState(false);

  // ✅ เพิ่มฟังก์ชันรีเฟรชจาก localStorage
  const refreshFromStorage = () => {
    const savedCount = localStorage.getItem(STORAGE_COUNT_KEY);
    const savedLocked = localStorage.getItem(STORAGE_LOCK_KEY);
    if (savedCount) setViewCount(Number(savedCount));
    if (savedLocked === "true") setLocked(true);
  };

  // โหลดค่าจาก localStorage ตอนเริ่ม
  useEffect(() => {
    refreshFromStorage();
  }, []);

  // บันทึกค่าลง localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_COUNT_KEY, viewCount);
    localStorage.setItem(STORAGE_LOCK_KEY, locked);
  }, [viewCount, locked]);

  // ✅ เพิ่ม event listener สำหรับการเปลี่ยนแปลงใน localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_COUNT_KEY || e.key === STORAGE_LOCK_KEY) {
        refreshFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // เพิ่มการดูวิดีโอ
  const increment = () => {
    if (locked) return false;

    const currentCount = Number(localStorage.getItem(STORAGE_COUNT_KEY) || 0);
    const newCount = currentCount + 1;
    setViewCount(newCount);

    if (newCount >= MAX_VIEW) {
      setLocked(true);
      return true; // เพิ่งถูกล็อก
    }
    return false;
  };

  // รีเซ็ต global counter
  const reset = () => {
    setViewCount(0);
    setLocked(false);
    localStorage.setItem(STORAGE_COUNT_KEY, "0");
    localStorage.setItem(STORAGE_LOCK_KEY, "false");
  };

  return { viewCount, locked, increment, reset, refreshFromStorage };
}