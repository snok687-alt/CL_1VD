import { useEffect, useState } from "react";

const MAX_VIEW = 3;
const STORAGE_COUNT_KEY = "totle_view_count_global";
const STORAGE_LOCK_KEY = "totle_locked_global";
const STORAGE_AUTH_KEY = "totle_authenticated_global";
const STORAGE_SESSION_KEY = "totle_session_active"; // ✅ เพิ่ม session key

export default function useTotle(videoId = "any") { 
  const [viewCount, setViewCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // ✅ ฟังก์ชันเริ่ม session ใหม่เมื่อเปิด browser
  const startNewSession = () => {
    console.log("🔄 เริ่ม session ใหม่ - ลบค่า authenticated");
    localStorage.removeItem(STORAGE_AUTH_KEY);
    setAuthenticated(false);
    
    // รีเซ็ต counter และ locked
    setViewCount(0);
    setLocked(false);
    localStorage.setItem(STORAGE_COUNT_KEY, "0");
    localStorage.setItem(STORAGE_LOCK_KEY, "false");
    
    // บันทึกว่ามี session ทำงานอยู่
    sessionStorage.setItem(STORAGE_SESSION_KEY, "true");
  };

  // ✅ เพิ่มฟังก์ชันรีเฟรชจาก localStorage
  const refreshFromStorage = () => {
    const savedCount = localStorage.getItem(STORAGE_COUNT_KEY);
    const savedLocked = localStorage.getItem(STORAGE_LOCK_KEY);
    const savedAuth = localStorage.getItem(STORAGE_AUTH_KEY);
    
    if (savedCount) setViewCount(Number(savedCount));
    
    // ✅ ตรวจสอบว่ามี session ใหม่หรือไม่
    const hasActiveSession = sessionStorage.getItem(STORAGE_SESSION_KEY);
    
    if (!hasActiveSession) {
      // ✅ ถ้าไม่มี session อยู่ → เริ่ม session ใหม่ (ออกจาก browser แล้วเข้ามาใหม่)
      startNewSession();
      return;
    }
    
    // ✅ ถ้ายังมี session อยู่ → โหลดค่าจาก localStorage
    if (savedAuth === "true") {
      setAuthenticated(true);
      setLocked(false); // ✅ ถ้าล็อกอินแล้ว อย่าล็อก
      localStorage.setItem(STORAGE_LOCK_KEY, "false");
    } else {
      // ✅ ถ้ายังไม่ล็อกอิน ให้ใช้ค่าจาก localStorage
      setLocked(savedLocked === "true");
    }
  };

  // โหลดค่าจาก localStorage ตอนเริ่ม
  useEffect(() => {
    refreshFromStorage();
    
    // ✅ เพิ่ม event listener สำหรับ page unload (ปิด browser/แท็บ)
    const handleBeforeUnload = () => {
      console.log("📴 กำลังปิด browser/แท็บ");
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // บันทึกค่าลง localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_COUNT_KEY, viewCount.toString());
    localStorage.setItem(STORAGE_LOCK_KEY, locked.toString());
    localStorage.setItem(STORAGE_AUTH_KEY, authenticated.toString());
  }, [viewCount, locked, authenticated]);

  // ✅ เพิ่ม event listener สำหรับการเปลี่ยนแปลงใน localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_COUNT_KEY || e.key === STORAGE_LOCK_KEY || e.key === STORAGE_AUTH_KEY) {
        refreshFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // เพิ่มการดูวิดีโอ
  const increment = () => {
    // ✅ ถ้ายังไม่ล็อกอินและถูกล็อก → หยุด
    if (locked && !authenticated) {
      return false;
    }

    const currentCount = Number(localStorage.getItem(STORAGE_COUNT_KEY) || 0);
    const newCount = currentCount + 1;
    setViewCount(newCount);

    // ✅ ถ้ายังไม่ล็อกอินและครบ 3 ครั้ง → ล็อก
    if (!authenticated && newCount >= MAX_VIEW) {
      setLocked(true);
      return true; // เพิ่งถูกล็อก
    }
    
    // ✅ ถ้าล็อกอินแล้ว → รีเซ็ตนับใหม่ทุก 3 ครั้ง (ไม่ล็อก)
    if (authenticated && newCount >= MAX_VIEW) {
      // รีเซ็ต counter แต่อย่าล็อก
      setViewCount(0);
      localStorage.setItem(STORAGE_COUNT_KEY, "0");
      return false; // ไม่ได้ล็อก
    }
    
    return false; // ไม่ได้ล็อก
  };

  // ✅ ฟังก์ชันเมื่อล็อกอินสำเร็จ
  const handleLoginSuccess = () => {
    setViewCount(0);
    setLocked(false); // ✅ ปลดล็อกทันที
    setAuthenticated(true);
    
    localStorage.setItem(STORAGE_COUNT_KEY, "0");
    localStorage.setItem(STORAGE_LOCK_KEY, "false");
    localStorage.setItem(STORAGE_AUTH_KEY, "true");
    
    console.log("✅ ล็อกอินสำเร็จ: ปลดล็อกแล้ว, authenticated=true");
  };

  // ✅ ฟังก์ชันรีเซ็ต
  const reset = () => {
    setViewCount(0);
    setLocked(false);
    setAuthenticated(false);
    localStorage.setItem(STORAGE_COUNT_KEY, "0");
    localStorage.setItem(STORAGE_LOCK_KEY, "false");
    localStorage.setItem(STORAGE_AUTH_KEY, "false");
  };

  // ✅ ฟังก์ชันล็อกเอาท์
  const logout = () => {
    setViewCount(0);
    setLocked(false);
    setAuthenticated(false);
    localStorage.setItem(STORAGE_COUNT_KEY, "0");
    localStorage.setItem(STORAGE_LOCK_KEY, "false");
    localStorage.setItem(STORAGE_AUTH_KEY, "false");
  };

  return { 
    viewCount, 
    locked, 
    authenticated,
    increment, 
    reset, 
    handleLoginSuccess,
    logout,
    refreshFromStorage
  };
}