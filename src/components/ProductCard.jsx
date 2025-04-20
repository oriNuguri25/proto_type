import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { getImageUrl, getDaysAgo, statusConfig } from "@/utils/productUtils";

const ProductCard = ({ product, onClick }) => {
  // 이미지 로드 오류 핸들러
  const handleImageError = (e) => {
    console.error("이미지 로드 오류:", product.id);
    e.target.style.display = "none";
    e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100"><span class="text-sm p-2 text-center">${product.product_name}</span></div>`;
  };

  return (
    <Link
      to={`/products/${product.id}`}
      key={product.id}
      onClick={(e) => onClick && onClick(e, product.id)}
    >
      <Card className="card-hover py-0 gap-0 pb-6">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(product.image_urls)}
            alt={product.product_name || "상품 이미지"}
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={handleImageError}
          />

          <div
            className={clsx(
              "absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium",
              product.status && statusConfig[product.status.toLowerCase()]
                ? statusConfig[product.status.toLowerCase()].classname
                : "bg-gray-100 text-gray-800"
            )}
          >
            {product.status && statusConfig[product.status.toLowerCase()]
              ? statusConfig[product.status.toLowerCase()].label
              : product.status || "상태 없음"}
          </div>
        </div>
        <CardContent className="p-3 flex-1 flex flex-col">
          <h3 className="line-clamp-1 text-sm font-medium text-gray-800 overflow-hidden text-ellipsis">
            {product.product_name}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 h-4 overflow-hidden">
            {product.user_nickname || ""}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-base font-bold text-blue-600">
              {product.price?.toLocaleString() || 0} VNĐ
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {getDaysAgo(product.created_at)} ngày trước
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
