import { Route, Routes, Navigate } from "react-router-dom";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import Main from "@/pages/Main";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/main" element={<Main />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
