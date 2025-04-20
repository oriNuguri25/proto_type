import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getImageUrl } from "@/utils/productUtils";
import StatusBadge from "@/components/ui/StatusBadge";

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

const ProductCard = ({ product, onDeleteClick }) => {
  // 생성일과 수정일이 같은지 확인
  const datesAreEqual = areDatesEqual(product.created_at, product.updated_at);

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
            <img
              src={getImageUrl(product.image_urls)}
              alt={product.product_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.svg";
              }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-800 line-clamp-1">
                {product.product_name}
              </h3>
            </div>
            <p className="text-sm font-bold text-blue-600">
              {parseInt(product.price).toLocaleString()} VNĐ
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(product.created_at)}
            </p>
            {/* 생성일과 수정일이 다를 때만 수정일 표시 */}
            {!datesAreEqual && (
              <p className="text-xs text-gray-500">
                Chỉnh sửa: {formatDate(product.updated_at)}
              </p>
            )}
            <div className="mt-1">
              <StatusBadge status={product.status || "available"} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div></div>
          <div className="flex gap-2">
            <Link to={`/products/${product.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-1 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => onDeleteClick(product)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
