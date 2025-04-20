import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMyProducts } from "@/hooks/useMyProducts";
import { getImageUrl, getDaysAgo } from "@/utils/productUtils";

// 삭제 확인 모달 컴포넌트
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center">
          <AlertCircle className="mr-2 h-6 w-6 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">상품 삭제</h3>
        </div>
        <div className="mb-5">
          <p className="text-gray-600">
            정말 <span className="font-semibold">{productName}</span> 상품을
            삭제하시겠습니까?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

const MyProductHero = () => {
  const { products, loading, error, deleteProduct } = useMyProducts();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // 상품 상태별 라벨과 스타일
  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return (
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
            Đang bán
          </span>
        );
      case "reserved":
        return (
          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
            Đang đặt trước
          </span>
        );
      case "sold":
        return (
          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
            Đã bán
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
            Đang bán
          </span>
        );
    }
  };

  // 삭제 핸들러
  const handleDeleteClick = (product) => {
    console.log("삭제 시도:", product.id, product.product_name);
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: product.product_name,
    });
  };

  const confirmDelete = async () => {
    console.log(`${deleteModal.productId} 상품 삭제 확인...`);

    const result = await deleteProduct(deleteModal.productId);

    if (result.success) {
      console.log("삭제 성공:", result.data);
      alert(`"${deleteModal.productName}" 상품이 성공적으로 삭제되었습니다.`);
    } else {
      console.error("삭제 실패:", result.error);
      alert(
        `삭제 중 오류가 발생했습니다: ${
          result.error?.message || "알 수 없는 오류"
        }`
      );
    }

    setDeleteModal({ isOpen: false, productId: null, productName: "" });
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-xl text-gray-500 font-medium">
            Đang tải sản phẩm...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="text-center py-12 text-red-500">
          <div className="text-xl font-medium">
            Đã xảy ra lỗi khi tải sản phẩm.
          </div>
          <p className="mt-2">{error.message}</p>
        </div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500">
            Bạn có thể quản lý trạng thái của sản phẩm đã đăng.
          </p>
        </div>
        <div className="text-center py-12">
          <div className="text-xl text-gray-500 font-medium">
            Bạn chưa đăng sản phẩm nào.
          </div>
          <div className="mt-4">
            <Link to="/products/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Đăng sản phẩm mới
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500">
            Bạn có thể quản lý trạng thái của sản phẩm đã đăng.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
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
                    {getDaysAgo(product.created_at)} ngày trước
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(product.status || "available")}
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
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, productId: null, productName: "" })
        }
        onConfirm={confirmDelete}
        productName={deleteModal.productName}
      />
    </main>
  );
};

export default MyProductHero;
