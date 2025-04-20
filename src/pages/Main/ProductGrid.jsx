import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/utils/auth";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";

const ProductGrid = () => {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();

  // 상품 클릭 핸들러
  const handleProductClick = (e, productId) => {
    if (!isLoggedIn) {
      e.preventDefault();
      // 현재 경로를 state로 전달하여 로그인 후 돌아올 수 있게 함
      navigate("/login", { state: { from: location.pathname } });
    }
    // 로그인되어 있으면 Link가 상품 상세 페이지로 이동
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="text-xl text-gray-500 font-medium">
          Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  // 오류 발생 시 표시
  if (error) {
    return (
      <div className="w-full text-center py-12 text-red-500">
        <div className="text-xl font-medium">
          Đã xảy ra lỗi khi tải sản phẩm.
        </div>
        <p className="mt-2">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // 상품이 없는 경우 메시지 표시
  if (!products || products.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <div className="text-xl text-gray-500 font-medium">
          Không có sản phẩm nào.
        </div>
        <p className="mt-2 text-gray-400">
          Sản phẩm mới sẽ được đăng trong thời gian sắp tới.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={handleProductClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
