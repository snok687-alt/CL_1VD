import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // ✅ ตรวจสอบว่า login แล้วไหม
  const token = localStorage.getItem("token");

  if (!token) {
    // ❌ ถ้ายังไม่ได้ login → กลับหน้า Login
    return <Navigate to="/Login" replace />;
  }

  // ✅ ถ้า login แล้ว → เข้าหน้า Admin ได้
  return children;
}
