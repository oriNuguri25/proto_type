import { ArrowLeft, Eye, MessageCircle } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getDaysAgo, getImageUrlsArray } from "@/utils/productUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MainLayout from "@/components/MainLayout";

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD 형식
};

// 두 날짜가 같은지 비교하는 함수
const areDatesEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  return formatDate(date1) === formatDate(date2);
};

const ProductHero = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const imageUrls = getImageUrlsArray(product.image_urls);

  // 생성일과 수정일이 같은지 확인
  const datesAreEqual = areDatesEqual(product.created_at, product.updated_at);

  return (
    <MainLayout>
      <main className="container mx-auto px-4 py-6">
        {/* 목록으로 돌아가기 */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>

        {/* 상품 설명 */}
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 상품 이미지 */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                <img
                  src={imageUrls[selectedImage]}
                  alt={product.product_name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* 이미지 목록 */}
              {imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {imageUrls.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border ${
                        selectedImage === index
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : ""
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.product_name}-${index}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {product.product_name}
                </h1>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-3xl font-bold text-blue-600">
                    {parseInt(product.price).toLocaleString()} VNĐ
                  </p>
                  {/* 조회수 아직 필요X */}
                  {/* <div className="flex items-center text-gray-500">
                    <Eye className="mr-1 h-4 w-4" />
                    <span className="text-sm">{product.views || 0}</span>
                  </div> */}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {getDaysAgo(product.created_at)} ngày trước
                </p>
                {/* 수정일 표시 (생성일과 다를 때만) */}
                {!datesAreEqual && (
                  <p className="text-sm text-gray-500">
                    Chỉnh sửa: {formatDate(product.updated_at)}
                  </p>
                )}
              </div>

              {/* 구매 문의 버튼 */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (product.purchase_link) {
                      window.open(product.purchase_link, "_blank");
                    } else {
                      alert("구매 링크가 없습니다.");
                    }
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Liên hệ mua hàng
                </Button>
              </div>

              {/* 판매자 정보 */}
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-medium text-gray-600">
                      {product.user_nickname
                        ? product.user_nickname.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {product.user_nickname || "알 수 없는 판매자"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* 상품 설명 */}
              <div className="rounded-lg border bg-white p-4">
                <h2 className="mb-2 font-semibold">Mô tả sản phẩm</h2>
                <div className="whitespace-pre-line text-gray-700">
                  {product.description || "상품 설명이 없습니다."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default ProductHero;
