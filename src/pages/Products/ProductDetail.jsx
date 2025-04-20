import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import ProductHero from "./ProductHero";
import { Toaster, toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

  useEffect(() => {
    // 상품 수정 성공 메시지 표시
    const productUpdated = sessionStorage.getItem("productUpdated");
    if (productUpdated === "true") {
      toast.success("Sản phẩm đã được cập nhật thành công.", {
        duration: 3000,
        position: "bottom-right",
        style: {
          fontSize: "1.1rem",
          padding: "16px",
          fontWeight: "500",
        },
        className: "custom-toast",
      });

      // 표시 후 상태 제거
      sessionStorage.removeItem("productUpdated");
    }
  }, []);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-xl text-gray-500 font-medium">
          Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  // 오류 발생 시 표시
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        <div className="text-xl font-medium">
          Đã xảy ra lỗi khi tải sản phẩm.
        </div>
        <p className="mt-2">Vui lòng thử lại sau.</p>
        <pre className="mt-4 text-sm opacity-70 text-red-400">
          {error.message}
        </pre>
      </div>
    );
  }

  // 상품이 없는 경우
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-xl text-gray-500 font-medium">
          Không tìm thấy sản phẩm.
        </div>
        <p className="mt-2 text-gray-400">
          Sản phẩm này có thể đã bị xóa hoặc không tồn tại.
        </p>
      </div>
    );
  }

  return (
    <>
      <ProductHero product={product} />
      <Toaster richColors />
    </>
  );
};

export default ProductDetail;
