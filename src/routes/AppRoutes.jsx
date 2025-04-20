import { Route, Routes } from "react-router-dom";
import Signup from "@/pages/Sign/Signup";
import SignUpWait from "@/pages/Sign/SignUpWait";
import Login from "@/pages/Sign/Login";
import Main from "@/pages/Main/Main";
import SignUpFail from "@/pages/Sign/SignUpFail";
import ProductRegister from "../pages/Register/ProductRegister";
import ProductDetail from "@/pages/Products/ProductDetail";
import MyProducts from "@/pages/MyProduct/MyProducts";
import MyProductHero from "@/pages/MyProduct/MyProductHero";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/products/register" element={<ProductRegister />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/products/my" element={<MyProductHero />} />
      <Route path="/my-products" element={<MyProducts />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/wait" element={<SignUpWait />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup/fail" element={<SignUpFail />} />
    </Routes>
  );
};

export default AppRoutes;
