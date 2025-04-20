import React from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import ProductHero from "./ProductHero";

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

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

  return <ProductHero product={product} />;
};

export default ProductDetail;
