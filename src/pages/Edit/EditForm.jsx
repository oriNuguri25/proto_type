import React, { useState, useEffect } from "react";
import { useImageUpload } from "../Register/hooks/useImageUpload";
import { useProductEdit } from "./hooks/useProductEdit";
import { useFormHandlers } from "./hooks/useFormHandlers";
import ImageUploader from "@/components/product/ImageUploader";
import ProductFormFields from "@/components/product/ProductFormFields";
import { LoadingState, ErrorState } from "@/components/product/LoadingStates";
import FormActionButtons from "@/components/product/FormActionButtons";
import PageHeader from "@/components/layout/PageHeader";
import FormContainer from "@/components/layout/FormContainer";

const EditForm = ({ productId }) => {
  const [initialImageUrls, setInitialImageUrls] = useState([]);

  // 이미지 업로드 관련 기능 가져오기
  const {
    fileInputRef,
    imageFiles,
    imagePreviewUrls,
    imageError,
    handleFileSelect,
    handleRemoveImage,
    uploadImages,
    validateImages,
    setImagePreviewUrls, // 초기 이미지 설정용
  } = useImageUpload();

  // 상품 수정 관련 기능 가져오기
  const {
    product,
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    error,
    setError,
    updateProduct,
  } = useProductEdit(productId, uploadImages, validateImages);

  // 폼 이벤트 처리 관련 기능 가져오기
  const {
    handlePriceChange,
    handleInputChange,
    handleStatusChange,
    onFileSelect,
    onSubmit,
    handleCancel,
    formSubmitted,
  } = useFormHandlers(
    productId,
    formData,
    setFormData,
    initialImageUrls,
    imageFiles,
    updateProduct,
    handleFileSelect,
    setError
  );

  // 상품 정보가 로드되면 이미지 미리보기 설정
  useEffect(() => {
    if (product && product.image_urls && product.image_urls.length > 0) {
      setInitialImageUrls(product.image_urls);
      setImagePreviewUrls(product.image_urls);
    }
  }, [product, setImagePreviewUrls]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error && !formSubmitted) {
    return <ErrorState error={error} />;
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <FormContainer error={error && formSubmitted ? error : null}>
        <PageHeader
          title="Chỉnh sửa sản phẩm"
          description="Cập nhật thông tin sản phẩm của bạn."
        />

        <form className="space-y-6" onSubmit={onSubmit}>
          {/* 상품 사진 업로드 */}
          <ImageUploader
            fileInputRef={fileInputRef}
            imagePreviewUrls={imagePreviewUrls}
            handleRemoveImage={handleRemoveImage}
            onFileSelect={onFileSelect}
            formSubmitted={formSubmitted}
            imageError={imageError}
          />

          {/* 상품 정보 입력 필드 */}
          <ProductFormFields
            formData={formData}
            handleInputChange={handleInputChange}
            handlePriceChange={handlePriceChange}
            handleStatusChange={handleStatusChange}
          />

          {/* 수정 및 취소 버튼 */}
          <FormActionButtons
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            submitLabel="Cập nhật sản phẩm"
            loadingLabel="Đang xử lý…"
          />
        </form>
      </FormContainer>
    </main>
  );
};

export default EditForm;
