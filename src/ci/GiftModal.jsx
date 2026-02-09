import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Gift,
  X,
  LogIn,
  UserPlus,
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Coins,
  LogOut,
  AlertCircle,
  Gamepad2
} from 'lucide-react';

const GiftModal = ({
  isOpen,
  onClose,
  isDarkMode,
  onLoginSuccess,
  isLoggedIn: initialIsLoggedIn,
  setIsLoggedIn: setParentIsLoggedIn,
  forceLoginView: initialForceLoginView = false
}) => {
  if (!isOpen) return null;

  // ตัวแปรหลัก
  const [points, setPoints] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [canClaimToday, setCanClaimToday] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  // ข้อมูลผู้ใช้
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // สถานะ UI
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ ใช้ค่า initial จาก parent
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn || false);
  const [showRegister, setShowRegister] = useState(false);
  const [forceLoginView, setForceLoginView] = useState(initialForceLoginView);

  // ✅ เพิ่มสถานะสำหรับตรวจสอบว่าโหลดข้อมูลแล้วหรือยัง
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // ✅ เพิ่มสถานะสำหรับการสร้างเกมแอคเคาท์
  const [creatingGameAccount, setCreatingGameAccount] = useState(false);

  // ✅ เพิ่มสถานะสำหรับ tracking การรับของขวัญ
  const [todayClaimed, setTodayClaimed] = useState(false);

  const API_SN = import.meta.env?.VITE_API_SN || process.env.API_SN;
  const API_SECRET = import.meta.env?.VITE_API_SECRET || process.env.API_SECRET;

  // ✅ เมื่อ isLoggedIn เปลี่ยนแปลงใน GiftModal ให้อัพเดท parent ด้วย
  useEffect(() => {
    if (setParentIsLoggedIn) {
      setParentIsLoggedIn(isLoggedIn);
    }
  }, [isLoggedIn, setParentIsLoggedIn]);

  // ✅ เมื่อได้รับ initialIsLoggedIn จาก parent
  useEffect(() => {
    if (initialIsLoggedIn !== undefined) {
      setIsLoggedIn(initialIsLoggedIn);
    }
  }, [initialIsLoggedIn]);

  // ✅ เมื่อได้รับ forceLoginView จาก parent
  useEffect(() => {
    if (initialForceLoginView) {
      setForceLoginView(true);
      setShowRegister(false);
      setIsLoggedIn(false);
      setMessage("🔒 กรุณาล็อกอินเพื่อปลดล็อกวิดีโอ");
      setHasLoadedData(false);
    }
  }, [initialForceLoginView]);

  // ✅ เพิ่ม event listener สำหรับบังคับให้แสดงหน้า Login
  useEffect(() => {
    const handleForceLoginView = () => {
      console.log('🔒 GiftModal: Received forceLoginView event');
      setForceLoginView(true);
      setShowRegister(false);
      setIsLoggedIn(false);
      setMessage("🔒 กรุณาล็อกอินเพื่อปลดล็อกวิดีโอ");
      setHasLoadedData(false);
    };

    window.addEventListener('forceLoginView', handleForceLoginView);

    return () => {
      window.removeEventListener('forceLoginView', handleForceLoginView);
    };
  }, []);

  // ฟังก์ชันช่วยเหลือ: ดึงข้อมูลจาก API
  const apiFetch = async (url, opts = {}) => {
    try {
      const res = await fetch(url, opts);
      const contentType = res.headers.get('content-type') || '';
      let body;
      if (contentType.includes('application/json')) {
        try {
          body = await res.json();
        } catch (e) {
          body = { __raw: await res.text() };
        }
      } else {
        body = { __raw: await res.text() };
      }
      return { ok: res.ok, status: res.status, body, headers: res.headers };
    } catch (err) {
      return { ok: false, status: 0, body: { __raw: err.message || String(err) } };
    }
  };

  // ============================================================
  // ✅ ฟังก์ชันตรวจสอบวันที่
  // ============================================================
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // ============================================================
  // ✅ ฟังก์ชันตรวจสอบสถานะการรับของขวัญจาก localStorage
  // ============================================================
  const checkClaimStatusFromStorage = () => {
    try {
      const username = localStorage.getItem("gift_username");
      if (!username) return false;

      const claimDataStr = localStorage.getItem(`gift_claim_${username}`);
      if (!claimDataStr) return false;

      const claimData = JSON.parse(claimDataStr);
      const today = getTodayDateString();

      return claimData.lastClaimDate === today;
    } catch (error) {
      console.error('Error checking claim status from storage:', error);
      return false;
    }
  };

  // ============================================================
  // ✅ ฟังก์ชันบันทึกสถานะการรับของขวัญ
  // ============================================================
  const saveClaimStatusToStorage = (username) => {
    try {
      const claimData = {
        lastClaimDate: getTodayDateString(),
        claimedAt: new Date().toISOString()
      };
      localStorage.setItem(`gift_claim_${username}`, JSON.stringify(claimData));
    } catch (error) {
      console.error('Error saving claim status to storage:', error);
    }
  };

  // ============================================================
  // ✅ ฟังก์ชันสร้างเกมแอคเคาท์
  // ============================================================
  const createGameAccount = async (playerId) => {
    try {
      setCreatingGameAccount(true);

      // ตรวจสอบรูปแบบผู้เล่น ID
      const validatePlayerId = (id) => /^[a-z0-9]{5,11}$/.test(id);

      if (!validatePlayerId(playerId)) {
        console.warn(`❌ รูปแบบเกมแอคเคาท์ไม่ถูกต้อง: ${playerId}`);
        return { success: false, message: 'รูปแบบแอคเคาท์ไม่ถูกต้อง' };
      }

      // API ปลายทางสำหรับสร้างเกมแอคเคาท์
      const endpoints = ['/api/server/create', '/api/game/create', '/api/create'];

      let successEndpoint = null;
      let resultData = null;

      // ลองทุก endpoints
      for (const endpoint of endpoints) {
        try {
          const random = Math.random().toString(36).substring(2, 18);
          const sn = API_SN;
          const secret = API_SECRET;
          const signStr = `${random}${sn}${secret}`;

          // สร้าง MD5 signature
          const sign = await import('crypto-js/md5').then(module =>
            module.default(signStr).toString()
          );

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'sn': sn,
              'random': random,
              'sign': sign
            },
            body: JSON.stringify({
              playerId: playerId.trim(),
              platType: 'ag',
              currency: 'CNY'
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.code === 10000) {
              successEndpoint = endpoint;
              resultData = data;
              break;
            }
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed:`, error.message);
          continue;
        }
      }

      if (successEndpoint) {
        console.log(`✅ สร้างเกมแอคเคาท์สำเร็จผ่าน ${successEndpoint}:`, playerId);
        return {
          success: true,
          message: 'สร้างเกมแอคเคาท์สำเร็จ',
          data: resultData
        };
      } else {
        // ลองวิธีที่สอง: ใช้ test API endpoint
        try {
          const testResponse = await apiCall('create', {
            playerId: playerId.trim(),
            platType: 'ag',
            currency: 'CNY'
          });

          if (testResponse.code === 10000) {
            console.log(`✅ สร้างเกมแอคเคาท์สำเร็จผ่าน API:`, playerId);
            return {
              success: true,
              message: 'สร้างเกมแอคเคาท์สำเร็จ',
              data: testResponse
            };
          }
        } catch (error) {
          console.log('API call failed:', error);
        }

        // ถ้าไม่สำเร็จทั้งสองวิธี
        console.warn(`❌ ไม่สามารถสร้างเกมแอคเคาท์สำหรับ: ${playerId}`);
        return {
          success: false,
          message: 'ไม่สามารถสร้างเกมแอคเคาท์ได้'
        };
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการสร้างเกมแอคเคาท์:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้างเกมแอคเคาท์'
      };
    } finally {
      setCreatingGameAccount(false);
    }
  };

  // ============================================================
  // ✅ ฟังก์ชันเรียก API แบบเก่า
  // ============================================================
  const apiCall = async (action, payload, baseUrl = '/api/game') => {
    try {
      const random = Math.random().toString(36).substring(2, 18);
      const sn = API_SN;
      const secret = API_SECRET;
      const signStr = `${random}${sn}${secret}`;

      // สร้าง MD5 signature
      const CryptoJS = await import('crypto-js');
      const sign = CryptoJS.MD5(signStr).toString();

      const res = await fetch(`${baseUrl}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sn': sn,
          'random': random,
          'sign': sign
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      return { code: -1, msg: error.message, data: null };
    }
  };

  // ============================================================
  // รีเซ็ตสถานะเมื่อปิด Modal
  // ============================================================
  const resetStates = () => {
    setPoints(0);
    setLastClaimDate(null);
    setCanClaimToday(true);
    setTimeLeft({ hours: 0, minutes: 0 });
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowRegister(false);
    setForceLoginView(false);
    setHasLoadedData(false);
    setCreatingGameAccount(false);
    // ไม่รีเซ็ต todayClaimed เพราะต้องการจำว่าวันนี้รับแล้วหรือยัง
  };

  // ============================================================
  // ปิด Modal (รีเซ็ต + callback)
  // ============================================================
  const handleClose = () => {
    // ไม่รีเซ็ต all states เมื่อปิด modal
    // รักษาสถานะการรับของขวัญไว้
    onClose();
  };

  // ============================================================
  // ปุ่มปิด: ออกจากระบบถ้าเข้าสู่ระบบอยู่
  // ============================================================
  const handleCloseButton = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isLoggedIn) handleLogout();
    handleClose();
  };

  const handleModalClick = (e) => e.stopPropagation();

  // ============================================================
  // ✅ ดึงสถานะการรับของขวัญ
  // ============================================================
  const loadClaimStatus = async (token = null) => {
    try {
      setLoading(true);
      const headers = {};

      if (token && isLoggedIn) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        setHasLoadedData(true);
        setLoading(false);
        return;
      }

      const { ok, status, body } = await apiFetch("/backend-api/gift/check-status", {
        method: 'GET',
        headers
      });

      if (!ok) {
        console.warn("check-status failed:", status, body);

        if (status === 401 || status === 403) {
          localStorage.removeItem("gift_token");
          localStorage.removeItem("gift_username");
          localStorage.removeItem("gift_token_time");
          setIsLoggedIn(false);
          setHasLoadedData(true);
          setMessage("🔒 การเข้าสู่ระบบหมดอายุ");
          return;
        }

        const msg = body?.message || body?.__raw || `HTTP ${status}`;
        setMessage(`⚠️ ไม่สามารถโหลดสถานะ: ${msg}`);
        setHasLoadedData(true);
        return;
      }

      const data = body;
      console.log("🔍 Status loaded:", data);

      if (data && typeof data === 'object') {
        setPoints(data.amount_gift || 0);
        setLastClaimDate(data.last_claim_date || null);

        // ตรวจสอบจาก localStorage ด้วย
        const claimedFromStorage = checkClaimStatusFromStorage();

        const claimedToday =
          data.claimedRecently === true ||
          data.claimed_today === true ||
          data.already_claimed === true ||
          (data.last_claim_date && isSameDay(new Date(data.last_claim_date), new Date())) ||
          claimedFromStorage;

        setCanClaimToday(!claimedToday);
        setTodayClaimed(claimedToday);

        if (claimedToday && data.time_left) {
          setTimeLeft(data.time_left);
        } else {
          setTimeLeft({ hours: 0, minutes: 0 });
        }
      }

      setHasLoadedData(true);

    } catch (err) {
      console.error("Error loading status:", err);
      setMessage("⚠️ ไม่สามารถโหลดสถานะได้");
      setHasLoadedData(true);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ effect: เมื่อเปิด Modal
  // ============================================================
  useEffect(() => {
    if (!isOpen) return;

    if (forceLoginView || initialForceLoginView) {
      setIsLoggedIn(false);
      setShowRegister(false);
      setHasLoadedData(false);
      setMessage("🔒 กรุณาล็อกอินเพื่อปลดล็อกวิดีโอ");
      return;
    }

    const token = localStorage.getItem("gift_token");
    const savedUsername = localStorage.getItem("gift_username");

    const tokenTime = localStorage.getItem("gift_token_time");
    let isTokenValid = false;

    if (token && tokenTime) {
      const tokenTimestamp = parseInt(tokenTime, 10);
      const currentTime = Date.now();
      const hoursPassed = (currentTime - tokenTimestamp) / (1000 * 60 * 60);
      isTokenValid = hoursPassed < 1;
    }

    if (token && savedUsername && isTokenValid) {
      setIsLoggedIn(true);
      setUsername(savedUsername);

      // ตรวจสอบจาก localStorage ก่อน
      const claimedToday = checkClaimStatusFromStorage();
      setTodayClaimed(claimedToday);
      setCanClaimToday(!claimedToday);

      loadClaimStatus(token);
    } else {
      if (token && !isTokenValid) {
        localStorage.removeItem("gift_token");
        localStorage.removeItem("gift_username");
        localStorage.removeItem("gift_token_time");
        setMessage("🔒 เซสชันหมดอายุ กรุณาล็อกอินอีกครั้ง");
      }
      setIsLoggedIn(false);
      setHasLoadedData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, forceLoginView, initialForceLoginView]);

  // ============================================================
  // ✅ ปุ่มรีเฟรช
  // ============================================================
  const handleRefresh = async () => {
    const token = localStorage.getItem("gift_token");

    if (!isLoggedIn || !token) {
      setMessage("⚠️ กรุณาล็อกอินเพื่อรีเฟรชข้อมูล");
      return;
    }

    setMessage("🔄 กำลังโหลดข้อมูล...");
    await loadClaimStatus(token);
    setMessage("");
  };

  // ============================================================
  // ✅ เข้าสู่ระบบ (ปรับปรุงเวอร์ชันใหม่)
  // ============================================================
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { ok, status, body } = await apiFetch("/backend-api/gift/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password })
      });

      if (!ok) {
        console.warn("login failed:", status, body);
        const msg = body?.message || body?.__raw || `HTTP ${status}`;
        setMessage(msg);
      } else {
        const data = body;
        if (data.token) {
          localStorage.setItem("gift_token", data.token);
          localStorage.setItem("gift_username", data.user.username);
          localStorage.setItem("gift_token_time", Date.now().toString());
          localStorage.setItem(
            "gift_login_type",
            forceLoginView ? "video" : "gift"
          );


          setIsLoggedIn(true);
          setForceLoginView(false);
          setPoints(data.user.amount_gift || 0);
          setMessage("✅ 登录成功!");

          // ✅ ตรวจสอบสถานะการรับของขวัญจาก localStorage
          const claimedToday = checkClaimStatusFromStorage();
          setTodayClaimed(claimedToday);
          setCanClaimToday(!claimedToday);

          // ✅ รีเซ็ต counter การดูวิดีโอ
          if (onLoginSuccess) {
            onLoginSuccess();
          }

          // ✅ แจ้ง event ต่างๆ
          window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: {
              username: data.user.username,
              token: data.token
            }
          }));

          window.dispatchEvent(new CustomEvent('videoUnlocked'));

          // ✅ โหลดข้อมูลใหม่หลังจากล็อกอินสำเร็จ
          setTimeout(() => loadClaimStatus(data.token), 500);

          // ✅ ปิด modal เมื่อล็อกอินสำเร็จสำหรับการปลดล็อกวิดีโอ
          if (forceLoginView) {
            setTimeout(() => {
              handleClose();
            }, 1500);
          }
        } else {
          setMessage(data.message || "❌ 用户名或密码错误");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ 发生错误");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage("");

    if (password.length < 4) {
      setMessage("❌ 密码至少需要4个字符");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("❌ 密码不匹配");
      setLoading(false);
      return;
    }

    try {
      let giftSuccess = false;
      let giftToken = null;
      let giftMessage = "";

      // 1. ตรวจสอบชื่อผู้ใช้ในระบบ Gift
      const { ok: checkOk, body: checkBody } = await apiFetch(
        `/backend-api/gift/check-username?username=${username}`
      );

      if (checkOk && checkBody.exists === false) {
        // สร้างบัญชี Gift ใหม่
        const { ok, body } = await apiFetch("/backend-api/gift/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: username, password })
        });

        if (ok && body.success) {
          giftSuccess = true;
          giftToken = body.token;
          giftMessage = "✅ 注册成功!";
        } else {
          giftMessage = body?.message || "❌ 注册失败";
        }
      } else if (checkOk && checkBody.exists === true) {
        // ล็อกอินแทน
        const loginResult = await handleAutoLogin(username, password);
        if (loginResult.success) {
          giftSuccess = true;
          giftToken = loginResult.token;
          giftMessage = "✅ ล็อกอินสำเร็จ (ชื่อผู้ใช้มีอยู่แล้ว)";
        } else {
          giftMessage = "⚠️ ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาล็อกอินแทน";
        }
      } else {
        giftMessage = "⚠️ ไม่สามารถตรวจสอบชื่อผู้ใช้ได้";
      }

      // 2. ✅ บันทึกลง game_accounts ใน MySQL
      setMessage(`${giftMessage} 正在保存到数据库...`);

      try {
        const saveToDbResult = await apiFetch('/backend-api/game/create-game-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: username.trim(),
            platType: 'ag',
            currency: 'CNY'
          })
        });

        if (saveToDbResult.ok && saveToDbResult.body.success) {
          console.log('✅ บันทึกบัญชีเกมลง MySQL สำเร็จ');
        } else {
          console.warn('⚠️ ไม่สามารถบันทึกลง MySQL ได้:', saveToDbResult.body?.message);
        }
      } catch (dbError) {
        console.error('❌ ข้อผิดพลาดในการบันทึกลง MySQL:', dbError);
      }

      // 3. สร้างเกมแอคเคาท์
      setMessage(`${giftMessage} 正在创建游戏账号...`);

      const gameAccountResult = await createGameAccount(username);

      if (gameAccountResult.success) {
        if (giftSuccess && giftToken) {
          // บันทึกข้อมูล
          localStorage.setItem("gift_token", giftToken);
          localStorage.setItem("gift_username", username);
          localStorage.setItem("gift_token_time", Date.now().toString());
          localStorage.setItem(
            "gift_login_type",
            forceLoginView ? "video" : "gift"
          );

          setIsLoggedIn(true);
          setForceLoginView(false);

          // ตั้งค่าเริ่มต้นว่ายังไม่ได้รับของขวัญวันนี้
          setTodayClaimed(false);
          setCanClaimToday(true);

          window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { username, token: giftToken }
          }));

          setMessage(`✅ ${giftMessage} และสร้างเกมแอคเคาท์ "${username}" สำเร็จ`);
        } else {
          setMessage(`🎮 สร้างเกมแอคเคาท์ "${username}" สำเร็จ! (สามารถล็อกอินในระบบเกมได้)`);
        }
      } else {
        setMessage(`${giftMessage} แต่ไม่สามารถสร้างเกมแอคเคาท์: ${gameAccountResult.message}`);
      }

      setTimeout(() => {
        setShowRegister(false);
        setPassword("");
        setConfirmPassword("");
      }, 3000);

    } catch (err) {
      console.error("Register error:", err);
      setMessage("❌ 发生错误");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ ฟังก์ชันล็อกอินอัตโนมัติ
  // ============================================================
  const handleAutoLogin = async (username, password) => {
    try {
      const { ok, status, body } = await apiFetch("/backend-api/gift/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password })
      });

      if (!ok) {
        return { success: false, message: 'ล็อกอินไม่สำเร็จ' };
      }

      const data = body;
      if (data.token) {
        return { success: true, token: data.token };
      } else {
        return { success: false, message: data.message || 'ล็อกอินไม่สำเร็จ' };
      }
    } catch (err) {
      return { success: false, message: 'เกิดข้อผิดพลาดในการล็อกอิน' };
    }
  };

  // ============================================================
  // ✅ รับของขวัญประจำวัน (ปรับปรุงให้รับได้วันละครั้งเท่านั้น)
  // ============================================================
  const claimDailyGift = async () => {
    if (!isLoggedIn) {
      setMessage("❌ กรุณาล็อกอินก่อนรับของขวัญ");
      return;
    }

    // ✅ ตรวจสอบว่าวันนี้รับไปแล้วหรือยัง
    if (todayClaimed) {
      setMessage("⏳ วันนี้คุณได้รับของขวัญไปแล้ว กรุณามาใหม่พรุ่งนี้");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("gift_token");
      const tokenTime = localStorage.getItem("gift_token_time");

      if (token && tokenTime) {
        const tokenTimestamp = parseInt(tokenTime, 10);
        const currentTime = Date.now();
        const hoursPassed = (currentTime - tokenTimestamp) / (1000 * 60 * 60);

        if (hoursPassed >= 1) {
          localStorage.removeItem("gift_token");
          localStorage.removeItem("gift_token_time");
          setMessage("🔒 เซสชันหมดอายุ กรุณาล็อกอินอีกครั้ง");
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }
      }

      if (!token) {
        setMessage("❌ ไม่พบ token กรุณาล็อกอินอีกครั้ง");
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log("🎁 Claiming gift with token:", token.substring(0, 10) + "...");

      const { ok, status, body } = await apiFetch("/backend-api/gift/daily", {
        method: 'GET',
        headers
      });

      console.log("🎁 Claim response:", { ok, status, body });

      if (!ok) {
        console.error("Claim failed:", status, body);

        if (status === 401 || status === 403) {
          localStorage.removeItem("gift_token");
          localStorage.removeItem("gift_username");
          localStorage.removeItem("gift_token_time");
          setIsLoggedIn(false);
          setMessage("🔒 การเข้าสู่ระบบหมดอายุ กรุณาล็อกอินอีกครั้ง");
          return;
        }

        const msg = body?.message || body?.__raw || `HTTP ${status}`;
        setMessage(`❌ ไม่สามารถรับของขวัญได้: ${msg}`);

        if (body && typeof body === 'object') {
          if (body.claimedRecently !== undefined) {
            setCanClaimToday(!body.claimedRecently);
            setTodayClaimed(body.claimedRecently);
          }
          if (body.time_left) {
            setTimeLeft(body.time_left);
          }
          if (body.amount_gift !== undefined) {
            setPoints(body.amount_gift);
          }
        }
        return;
      }

      const data = body;

      if (data.success) {
        // ✅ บันทึกว่าวันนี้รับแล้ว
        setTodayClaimed(true);
        setCanClaimToday(false);

        setPoints(data.amount_gift || points);
        setLastClaimDate(data.last_claim_date || null);
        setTimeLeft({ hours: 23, minutes: 59 });

        // ✅ บันทึกลง localStorage
        saveClaimStatusToStorage(username);

        setMessage(`✅ รับของขวัญสำเร็จ! ยอดรวม: ${data.amount_gift} 元`);
        setMessage(`🎉 คุณได้รับของขวัญแล้ววันนี้! กลับมาใหม่พรุ่งนี้`);

        setTimeout(() => loadClaimStatus(token), 1000);
      } else {
        // ถ้า backend บอกว่าได้รับแล้ว
        if (data.message?.includes('already claimed') || data.claimedRecently) {
          setTodayClaimed(true);
          setCanClaimToday(false);
          saveClaimStatusToStorage(username);
          setMessage("⏳ วันนี้คุณได้รับของขวัญไปแล้ว กรุณามาใหม่พรุ่งนี้");
        } else {
          setMessage(data.message || "❌ ไม่สามารถรับของขวัญได้");
        }

        if (data.claimedRecently !== undefined) {
          setCanClaimToday(!data.claimedRecently);
          setTodayClaimed(data.claimedRecently);
        }
        if (data.time_left) {
          setTimeLeft(data.time_left);
        }
      }
    } catch (err) {
      console.error('Claim error:', err);
      setMessage("❌ เกิดข้อผิดพลาดในการรับของขวัญ");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ออกจากระบบ
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("gift_token");
    localStorage.removeItem("gift_username");
    localStorage.removeItem("gift_token_time");
    setIsLoggedIn(false);
    setForceLoginView(false);
    setMessage("👋 已退出系统");

    setPoints(0);
    setLastClaimDate(null);
    setCanClaimToday(true);
    setTimeLeft({ hours: 0, minutes: 0 });
    setHasLoadedData(false);
    setTodayClaimed(false);

    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  };

  // ปุ่ม Escape ปิด Modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ===================================================================
  // RENDER
  // ===================================================================
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[9999] animate-fadeIn p-4"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl relative animate-scaleIn overflow-hidden border-2 ${isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-gray-600 text-white"
          : "bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 border-gray-400 text-gray-800"
          }`}
        onClick={handleModalClick}
      >
        {/* ปุ่มปิด */}
        <button
          onClick={handleCloseButton}
          className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center z-50 pointer-events-auto rounded-lg transition ${isDarkMode
            ? "bg-gray-700 hover:bg-red-600 text-gray-300"
            : "bg-gray-300 hover:bg-red-500 text-gray-700"
            }`}
          type="button"
          title="关闭 (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8">
          {/* ✅ Warning Banner ถ้าถูกบังคับให้ล็อกอิน */}
          {forceLoginView && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${isDarkMode
              ? "bg-gradient-to-r from-red-900/40 to-red-800/20 border-red-600"
              : "bg-gradient-to-r from-red-100 to-red-50 border-red-500"
              }`}>
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-6 h-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
                <div>
                  <h3 className={`font-bold ${isDarkMode ? "text-red-300" : "text-red-700"}`}>วิดีโอถูกล็อก!</h3>
                  <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                    คุณดูวิดีโอครบ 3 ครั้งแล้ว กรุณาล็อกอินเพื่อปลดล็อก
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ส่วนหัว */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold mb-2 flex items-center justify-center gap-2 ${isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}>
              {forceLoginView ? (
                <>
                  <Lock className="w-5 h-5 text-red-500" />
                  ปลดล็อกวิดีโอ
                  <Lock className="w-5 h-5 text-red-500" />
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {isLoggedIn ? "每日奖励" : showRegister ? "创建账户" : "用户登录"}
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </>
              )}
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {forceLoginView
                ? "ล็อกอินเพื่อปลดล็อกวิดีโอและดูวิดีโอเพิ่มเติม"
                : isLoggedIn
                  ? "领取每日奖励 (一天一次)"
                  : showRegister
                    ? "创建新账户以解锁所有功能 (จะสร้างเกมแอคเคาท์อัตโนมัติ)"
                    : "登录后您可以解锁所有视频，并领取每日礼物。"}
            </p>

            {/* ✅ แสดงข้อความเกมแอคเคาท์ */}
            {showRegister && (
              <p className={`text-xs mt-2 ${isDarkMode ? "text-yellow-400" : "text-green-600"}`}>
                <Gamepad2 className="inline w-3 h-3 mr-1" />
                จะสร้างเกมแอคเคาท์ชื่อ "{username || '______'}" อัตโนมัติ
              </p>
            )}

            {isLoggedIn && (
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {`欢迎, ${username}`}
                {todayClaimed && " (今日已领取)"}
              </p>
            )}
          </div>

          {/* ✅ แบบฟอร์มเข้าสู่ระบบ */}
          {(!isLoggedIn || forceLoginView) && !showRegister && (
            <div className="space-y-4">
              <div className="relative">
                <User className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-blue-500"
                  }`} />
                <input
                  type="text"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus={forceLoginView}
                />
              </div>

              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-blue-500"
                  }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-4 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-500 hover:text-blue-400"
                    }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-semibold transition disabled:opacity-50 border-2 ${forceLoginView
                  ? isDarkMode
                    ? "bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/30"
                    : "bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-400/30"
                  : isDarkMode
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 shadow-lg shadow-yellow-900/30"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-400/30"
                  }`}
              >
                <LogIn className="inline-block w-5 h-5 mr-2" />
                {loading ? "登录中..." : forceLoginView ? "🔓 ปลดล็อกตอนนี้" : "登录"}
              </button>

              {!forceLoginView && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className={`transition ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-600 hover:text-blue-800"
                      }`}
                  >
                    <UserPlus className="inline w-4 h-4 mr-1" /> 创建账户
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ✅ แบบฟอร์มลงทะเบียน (ปรับปรุงแล้ว) */}
          {!isLoggedIn && showRegister && !forceLoginView && (
            <div className="space-y-4">
              <div className="relative">
                <User className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-green-500"
                  }`} />
                <input
                  type="text"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    }`}
                  placeholder="用户名 (5-11 ตัวอักษร/ตัวเลข)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  autoFocus
                />
              </div>

              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-green-500"
                  }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    }`}
                  placeholder="密码 (>=4)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-4 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-green-500 hover:text-green-400"
                    }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className={`absolute left-4 top-4 w-5 h-5 ${isDarkMode ? "text-yellow-500" : "text-green-500"
                  }`} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-lg border-2 focus:outline-none transition ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    : "bg-gray-200 border-gray-300 text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    }`}
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-4 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-green-500 hover:text-green-400"
                    }`}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading || creatingGameAccount}
                className={`w-full py-3.5 rounded-lg font-semibold transition disabled:opacity-50 border-2 ${isDarkMode
                  ? "bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-900/30"
                  : "bg-gradient-to-r from-green-500 to-green-600 border-green-400 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-400/30"
                  }`}
              >
                {creatingGameAccount ? (
                  <>
                    <RefreshCw className="inline-block w-5 h-5 mr-2 animate-spin" />
                    กำลังสร้างเกมแอคเคาท์...
                  </>
                ) : loading ? (
                  "注册中..."
                ) : (
                  <>
                    <Gamepad2 className="inline-block w-5 h-5 mr-2" />
                    สร้างบัญชี + เกมแอคเคาท์
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className={`transition ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-600 hover:text-blue-800"
                    }`}
                >
                  <LogIn className="inline w-4 h-4 mr-1" /> 已有账户
                </button>
              </div>
            </div>
          )}

          {/* ✅ มุมมองหลังเข้าสู่ระบบ */}
          {isLoggedIn && !forceLoginView && hasLoadedData && (
            <div className="space-y-5">
              {/* ✅ แสดงข้อความเกมแอคเคาท์ */}
              <div className={`p-4 rounded-lg border-2 ${isDarkMode
                ? "bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-600"
                : "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-500"
                }`}>
                <div className="flex items-center gap-2">
                  <Gamepad2 className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                    您的游戏账号:
                  </span>
                </div>
                <p className={`text-lg font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  {username}
                </p>
                <p className={`text-xs ${isDarkMode ? "text-blue-400" : "text-blue-600"} mt-1`}>
                  可在 AG 游戏平台上使用 ✅
                </p>
              </div>

              {/* ✅ สถานะการรับของขวัญ */}
              <div className={`p-4 rounded-lg border-2 ${todayClaimed
                ? isDarkMode
                  ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700"
                  : "bg-gradient-to-r from-gray-300 to-gray-400 border-gray-500"
                : isDarkMode
                  ? "bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-600"
                  : "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-500"
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  {todayClaimed ? (
                    <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                  ) : (
                    <Gift className={`w-5 h-5 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                  )}
                  <span className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {todayClaimed ? "✅ วันนี้ได้รับแล้ว" : "🎁 รอรับของขวัญ"}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {todayClaimed
                    ? "คุณได้รับของขวัญวันนี้แล้ว กรุณามาใหม่พรุ่งนี้"
                    : "คุณสามารถรับของขวัญได้วันละ 1 ครั้ง"}
                </p>
              </div>

              <div className={`p-6 rounded-2xl border-2 ${isDarkMode
                ? "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600"
                : "bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500"
                }`}>
                <div className={`flex items-center gap-2 text-sm mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span>累计金额</span>
                </div>
                <div className={`text-4xl font-extrabold ${isDarkMode ? "text-gray-100" : "text-gray-800"
                  }`}>
                  <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                    {points} 元
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border-2 ${isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-300 border-gray-400"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {canClaimToday ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Calendar className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className={`font-semibold text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                      {canClaimToday ? "✅ 可领取奖励" : "⏳ 已领取"}
                    </span>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className={`transition p-1 ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-blue-600 hover:text-blue-800"
                      }`}
                    title="刷新"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {!canClaimToday && timeLeft.hours >= 0 && (
                  <div className={`mt-3 flex items-center gap-2 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      可再次领取: <span className="font-bold text-yellow-600">{timeLeft.hours}</span> 小时 <span className="font-bold text-yellow-600">{timeLeft.minutes}</span> 分钟
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={claimDailyGift}
                disabled={!canClaimToday || loading || todayClaimed}
                className={`w-full py-4 rounded-lg font-bold transition flex items-center justify-center gap-2 border-2 ${canClaimToday && !loading && !todayClaimed
                  ? isDarkMode
                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500 text-white hover:from-yellow-500 hover:to-orange-500 cursor-pointer shadow-lg shadow-yellow-900/30"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-white hover:from-yellow-600 hover:to-orange-600 cursor-pointer shadow-lg shadow-yellow-400/30"
                  : isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gray-400 border-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <Gift className="w-6 h-6" />
                {todayClaimed ? "✅ 今日已领取" : canClaimToday ? "🎁 领取奖励" : "✅ 已领取"}
              </button>

              <button
                onClick={handleLogout}
                className={`w-full py-3 rounded-lg font-semibold transition border-2 ${isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-red-700 hover:border-red-600"
                  : "bg-gray-400 border-gray-300 text-gray-700 hover:bg-red-500 hover:text-white hover:border-red-400"
                  }`}
              >
                <LogOut className="inline-block w-4 h-4 mr-2" />
                退出登录
              </button>
            </div>
          )}

          {/* ✅ แสดงข้อความเมื่อล็อกอินแล้วแต่ยังไม่ได้โหลดข้อมูล */}
          {isLoggedIn && !forceLoginView && !hasLoadedData && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-yellow-500" />
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                กำลังโหลดข้อมูลของขวัญ...
              </p>
            </div>
          )}

          {/* ข้อความ */}
          {message && (
            <div className={`mt-6 p-3.5 rounded-lg border-2 text-center text-sm ${message.includes('✅') || message.includes('👋') || message.includes('成功')
              ? isDarkMode
                ? 'bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-600 text-green-300'
                : 'bg-gradient-to-r from-green-100 to-green-50 border-green-500 text-green-700'
              : message.includes('❌')
                ? isDarkMode
                  ? 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-600 text-red-300'
                  : 'bg-gradient-to-r from-red-100 to-red-50 border-red-500 text-red-700'
                : isDarkMode
                  ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-600 text-yellow-300'
                  : 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-500 text-yellow-700'
              }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftModal;