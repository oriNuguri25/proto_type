import React from "react";
import { useMyProducts } from "@/hooks/useMyProducts";
import { useProductManagement } from "@/hooks/useProductManagement";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { Toaster } from "sonner";
import ProductCard from "@/components/product/ProductCard";
import LoadingView from "@/components/layout/LoadingView";
import ErrorView from "@/components/layout/ErrorView";
import EmptyStateView from "@/components/layout/EmptyStateView";

const MyProductHero = () => {
  // 상품 정보 가져오기
  const { products, loading, error, deleteProduct } = useMyProducts();

  // 상품 관리 기능
  const { deleteModal, handleDeleteClick, confirmDelete, closeModal } =
    useProductManagement(deleteProduct);

  // 로딩 상태 처리
  if (loading) {
    return <LoadingView message="Đang tải sản phẩm..." />;
  }

  // 에러 상태 처리
  if (error) {
    return (
      <ErrorView error={error} message="Đã xảy ra lỗi khi tải sản phẩm." />
    );
  }

  // 데이터가 없는 경우
  if (products.length === 0) {
    return (
      <EmptyStateView
        title="Quản lý sản phẩm"
        description="Bạn có thể quản lý trạng thái của sản phẩm đã đăng."
        emptyMessage="Bạn chưa đăng sản phẩm nào."
        buttonText="Đăng sản phẩm mới"
        buttonLink="/products/register"
      />
    );
  }

  // 상품 목록 표시
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
          <ProductCard
            key={product.id}
            product={product}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        productName={deleteModal.productName}
      />

      <Toaster />
    </main>
  );
};

export default MyProductHero;
