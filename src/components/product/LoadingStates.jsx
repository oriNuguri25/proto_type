import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const LoadingState = () => {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Chỉnh sửa sản phẩm
          </h1>
          <p className="text-sm text-gray-500">
            Đang tải thông tin sản phẩm...
          </p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </main>
  );
};

export const ErrorState = ({ error }) => {
  const navigate = useNavigate();

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Chỉnh sửa sản phẩm
          </h1>
          <p className="text-sm text-gray-500">
            Đã xảy ra lỗi khi tải thông tin sản phẩm.
          </p>
        </div>
        <div className="rounded-lg border bg-red-50 p-6 shadow-sm">
          <p className="text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => navigate("/products/my")}>
            Quay lại trang quản lý sản phẩm
          </Button>
        </div>
      </div>
    </main>
  );
};
