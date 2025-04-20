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
  setError
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

  // 폼 제출 이벤트 처리
  const onSubmit = useCallback(
    async (e) => {
      setFormSubmitted(true);

      // 이미지가 변경되지 않았으면 기존 이미지 URLs 사용
      const useExistingImages =
        imageFiles.length === 0 && initialImageUrls.length > 0;
      const imageUrls = useExistingImages ? initialImageUrls : null;

      const success = await updateProduct(e, formData, imageUrls);

      if (success) {
        // 수정 성공 시 메인 페이지로 이동하고 뒤로가기 방지
        sessionStorage.setItem("productUpdated", "true");
        navigate("/", { replace: true }); // replace: true로 설정하여 히스토리를 대체함으로써 뒤로가기 방지
      }
    },
    [formData, imageFiles, initialImageUrls, updateProduct, navigate]
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
