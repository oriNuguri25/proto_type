const handleUpdateSubmit = async (values) => {
  setIsSubmitting(true);
  setSubmitErrorMsg("");

  try {
    // 이미지 업로드
    let finalImageUrls = [...initialImageUrls];

    // 이미지가 삭제되었는지 확인
    const wasImageRemoved = window.imageRemoved === true;

    // 이미지가 삭제되었거나 새 이미지가 있는 경우에만 처리
    if (wasImageRemoved || imageFiles.length > 0) {
      // 이미지가 삭제된 경우, 현재 미리보기 URL만 사용
      if (wasImageRemoved) {
        finalImageUrls = [...imagePreviewUrls];
        console.log("이미지 삭제 감지됨, 새 이미지 배열:", finalImageUrls);
      }

      // 새 이미지가 있는 경우 업로드
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages(imageFiles);
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }
    }

    // 제품 업데이트
    await editProduct({
      productId: productId,
      name: values.productName,
      price: values.price,
      description: values.desc,
      brandName: values.brand,
      category: values.category,
      imageUrls: finalImageUrls,
    });

    // 전역 플래그 초기화
    window.imageRemoved = false;

    navigate(`/product/${productId}`);
  } catch (error) {
    console.error("상품 업데이트 실패:", error);
    setSubmitErrorMsg("상품 업데이트 중 오류가 발생했습니다.");
  } finally {
    setIsSubmitting(false);
  }
};
