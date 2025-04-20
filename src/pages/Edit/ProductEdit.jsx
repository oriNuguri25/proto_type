import React from "react";
import EditForm from "./EditForm";
import MainLayout from "../../components/MainLayout";
import { useNavigate, useParams } from "react-router-dom";

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <MainLayout navigate={navigate}>
      <EditForm productId={id} />
    </MainLayout>
  );
};

export default ProductEdit;
