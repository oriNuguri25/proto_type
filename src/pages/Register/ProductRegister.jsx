import React from "react";
import RegisterForm from "./RegisterForm";
import MainLayout from "../../components/MainLayout";
import { useNavigate } from "react-router-dom";

const ProductRegister = () => {
  const navigate = useNavigate();

  return (
    <MainLayout navigate={navigate}>
      <RegisterForm />
    </MainLayout>
  );
};

export default ProductRegister;
