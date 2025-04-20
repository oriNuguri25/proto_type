import { useState, useCallback } from "react";
import { formatNumber } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

/**
 * 제품 수정 폼에서 사용되는 이벤트 핸들러를 제공하는 훅
 */
export const useFormHandlers = (
  productId,
  formData,
  setFormData,
  initialImageUrls,
  imageFiles,
  updateProduct,
  handleFileSelect,
  setError,
  imagePreviewUrls // 미리보기 URL 추가
) => {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);

  // 가격 입력 처리 함수
  const handlePriceChange = useCallback(
    (e) => {
      // 숫자와 쉼표만 허용
      const value = e.target.value.replace(/[^\d]/g, "");

      // 숫자가 없는 경우 빈 문자열 설정
      if (!value) {
        setFormData({ ...formData, price: "" });
        return;
      }

      // utils의 formatNumber 함수 사용
      setFormData({ ...formData, price: formatNumber(Number(value)) });
    },
    [formData, setFormData]
  );

  // 일반 입력 필드 변경 처리
  const handleInputChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setFormData({ ...formData, [id]: value });
    },
    [formData, setFormData]
  );

  // 상태 변경 처리
  const handleStatusChange = useCallback(
    (value) => {
      setFormData({ ...formData, status: value });
    },
    [formData, setFormData]
  );

  // 파일 선택 이벤트 처리 래퍼
  const onFileSelect = useCallback(
    (e) => {
      setFormSubmitted(true);
      handleFileSelect(e, true, setError);
    },
    [handleFileSelect, setError]
  );

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    // 모든 필수 필드를 검사하는 객체
    const requiredFields = {
      product_name: {
        value: formData.product_name,
        message: "Vui lòng nhập tên sản phẩm (상품명을 입력해주세요).",
      },
      description: {
        value: formData.description,
        message: "Vui lòng nhập mô tả sản phẩm (상품 설명을 입력해주세요).",
      },
      price: {
        value: formData.price,
        message: "Vui lòng nhập giá sản phẩm (가격을 입력해주세요).",
      },
      purchase_link: {
        value: formData.purchase_link,
        message: "Vui lòng nhập liên kết mua hàng (구매 링크를 입력해주세요).",
      },
    };

    // 필수 필드 검증
    for (const [field, data] of Object.entries(requiredFields)) {
      if (!data.value || data.value.toString().trim() === "") {
        setError(data.message);
        return false;
      }
    }

    // 이미지 삭제 여부 확인
    const wasImageRemoved = window.imageRemoved === true;

    // 이미지 검증 (최소 1개 이상의 이미지 필요)
    const hasNewImages = imageFiles.length > 0;
    const hasExistingImages = initialImageUrls.length > 0 && !wasImageRemoved;
    const hasPreviewImages = imagePreviewUrls.length > 0;

    if (!hasNewImages && !hasExistingImages && !hasPreviewImages) {
      setError(
        "Vui lòng tải lên ít nhất một hình ảnh (최소 한 개 이상의 이미지를 업로드해주세요)."
      );
      return false;
    }

    return true;
  }, [formData, imageFiles, initialImageUrls, imagePreviewUrls, setError]);

  // 폼 제출 이벤트 처리
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormSubmitted(true);

      // 폼 유효성 검사
      if (!validateForm()) {
        return false;
      }

      // 이미지 처리 로직
      let imageUrls = null;

      // 이미지 삭제 여부 확인
      const wasImageRemoved = window.imageRemoved === true;

      // 1. 이미지가 삭제되었고 새 이미지가 있는 경우
      if (wasImageRemoved && imageFiles.length > 0) {
        console.log("이미지 삭제 후 새 이미지 업로드");
        imageUrls = null; // uploadImages 함수를 통해 업로드
      }
      // 2. 이미지가 삭제되었고 새 이미지가 없는 경우 (미리보기 URL만 사용)
      else if (wasImageRemoved) {
        console.log("이미지 삭제됨, 현재 미리보기 URL 사용:", imagePreviewUrls);
        imageUrls = imagePreviewUrls; // 현재 미리보기 URL 사용
      }
      // 3. 이미지가 삭제되지 않았지만 새 이미지가 있는 경우
      else if (imageFiles.length > 0) {
        console.log("새로 업로드된 이미지 파일 사용:", imageFiles.length, "개");
        imageUrls = null; // uploadImages 함수를 통해 업로드
      }
      // 4. 이미지 변경이 없는 경우: 기존 이미지 URL 유지
      else if (initialImageUrls.length > 0) {
        console.log("기존 이미지 URL 유지:", initialImageUrls);
        imageUrls = initialImageUrls;
      }

      const success = await updateProduct(e, formData, imageUrls);

      if (success) {
        // 전역 이미지 삭제 플래그 초기화
        window.imageRemoved = false;

        // 수정 성공 시 메인 페이지로 이동하고 뒤로가기 방지
        sessionStorage.setItem("productUpdated", "true");
        navigate("/", { replace: true }); // replace: true로 설정하여 히스토리를 대체함으로써 뒤로가기 방지
      }
    },
    [
      formData,
      imageFiles,
      initialImageUrls,
      imagePreviewUrls,
      updateProduct,
      navigate,
      validateForm,
    ]
  );

  // 취소 버튼 처리
  const handleCancel = useCallback(() => {
    navigate(`/products/${productId}`);
  }, [navigate, productId]);

  return {
    handlePriceChange,
    handleInputChange,
    handleStatusChange,
    onFileSelect,
    onSubmit,
    handleCancel,
    formSubmitted,
  };
};
