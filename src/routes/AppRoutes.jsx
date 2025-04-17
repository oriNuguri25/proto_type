import { Route, Routes, Navigate } from "react-router-dom";
import Signup from "@/pages/Signup";
import SignUpWait from "@/pages/SignUpWait";
import Login from "@/pages/Login";
import Main from "@/pages/Main";
import SignUpFail from "@/pages/SignUpFail";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/main" element={<Main />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/wait" element={<SignUpWait />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/fail" element={<SignUpFail />} />
    </Routes>
  );
};

export default AppRoutes;
