// 📌 useTotle.jsx — แก้ไขเงื่อนไขการล็อก
import { useEffect, useState } from "react";

const MAX_VIEW = 1; // ✅ ดูได้ 1 ครั้ง

export default function useTotle(videoId = "global") {
  const [viewCount, setViewCount] = useState(0);
  const [locked, setLocked] = useState(false);

  // โหลดค่าจาก localStorage ตอนเริ่ม (แยกตาม videoId)
  useEffect(() => {
    const saved = localStorage.getItem(`totle_view_count_${videoId}`);
    const savedLocked = localStorage.getItem(`totle_locked_${videoId}`);

    if (saved) setViewCount(Number(saved));
    if (savedLocked === "true") setLocked(true);
  }, [videoId]);

  // เซฟค่าลง localStorage ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    localStorage.setItem(`totle_view_count_${videoId}`, viewCount);
  }, [viewCount, videoId]);

  useEffect(() => {
    localStorage.setItem(`totle_locked_${videoId}`, locked);
  }, [locked, videoId]);

  // เพิ่มครั้ง
  const increment = () => {
    if (locked) return false;

    const newCount = viewCount + 1;
    setViewCount(newCount);

    // ✅ เปลี่ยนเงื่อนไข: ล็อกทันทีที่ครบ 1 ครั้ง (ครั้งที่ 2)
    if (newCount > MAX_VIEW) {
      setLocked(true);
      return true; // แจ้งให้รู้ว่า "เพิ่งถูกล็อก"
    }
    return false;
  };

  // ปลดล็อก + รีเซ็ต หลัง Login
  const reset = () => {
    setViewCount(0);
    setLocked(false);
  };

  return {
    viewCount,
    locked,
    increment,
    reset,
  };
}