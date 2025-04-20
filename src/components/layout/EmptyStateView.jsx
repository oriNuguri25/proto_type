import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyStateView = ({
  title = "상품 목록",
  description = "상품 정보를 관리할 수 있습니다.",
  emptyMessage = "등록된 상품이 없습니다.",
  buttonText = "상품 등록하기",
  buttonLink = "/products/register",
}) => {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="text-center py-12">
        <div className="text-xl text-gray-500 font-medium">{emptyMessage}</div>
        <div className="mt-4">
          <Link to={buttonLink}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default EmptyStateView;
