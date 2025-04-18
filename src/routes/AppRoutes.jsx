import { Route, Routes, Navigate } from "react-router-dom";
import Signup from "@/pages/Signup";
import SignUpWait from "@/pages/SignUpWait";
import Login from "@/pages/Login";
import Main from "@/pages/Main";
import SignUpFail from "@/pages/SignUpFail";
import { isAuthenticated, getToken } from "@/utils/auth";

const AppRoutes = () => {
  // 토큰 체크 함수
  const checkAuth = () => {
    if (isAuthenticated()) {
      const token = getToken();
      return <Navigate to={`/main?${token}`} replace />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={checkAuth()} />
      <Route path="/main" element={<Main />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/wait" element={<SignUpWait />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/fail" element={<SignUpFail />} />
    </Routes>
  );
};

export default AppRoutes;
