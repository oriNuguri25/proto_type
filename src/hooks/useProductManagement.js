import { useState } from "react";

/**
 * 상품 삭제 관련 로직을 관리하는 커스텀 훅
 */
export const useProductManagement = (deleteProductFn) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // 삭제 다이얼로그를 열기 위한 핸들러
  const handleDeleteClick = (product) => {
    console.log("삭제 시도:", product.id, product.product_name);
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: product.product_name,
    });
  };

  // 삭제 확인 후 처리
  const confirmDelete = async () => {
    console.log(`${deleteModal.productId} 상품 삭제 확인...`);

    const result = await deleteProductFn(deleteModal.productId);

    if (result.success) {
      console.log("삭제 성공:", result.data);
      alert(`Sản phẩm "${deleteModal.productName}" đã được xóa thành công.`);
    } else {
      console.error("삭제 실패:", result.error);
      alert(
        `Đã xảy ra lỗi khi xóa sản phẩm: ${
          result.error?.message || "Lỗi không xác định"
        }`
      );
    }

    closeModal();
  };

  // 모달 닫기
  const closeModal = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: "" });
  };

  return {
    deleteModal,
    handleDeleteClick,
    confirmDelete,
    closeModal,
  };
};
