import { Route, Routes } from "react-router-dom";
import Signup from "@/pages/Sign/Signup";
import SignUpWait from "@/pages/Sign/SignUpWait";
import Login from "@/pages/Sign/Login";
import Main from "@/pages/Main/Main";
import SignUpFail from "@/pages/Sign/SignUpFail";
import ProductRegister from "../pages/Register/ProductRegister";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/products/register" element={<ProductRegister />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/wait" element={<SignUpWait />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/fail" element={<SignUpFail />} />
    </Routes>
  );
};

export default AppRoutes;
