import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "@/utils/auth";

export const useProductSubmit = (uploadImages, validateImages) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submitProduct = async (formData, imageUrls) => {
    const token = getToken();
    if (!token) throw new Error("로그인이 필요합니다");

    const response = await fetch(
      "https://jeogi.vercel.app/api/register-product",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
        body: JSON.stringify({
          ...formData,
          image_urls: imageUrls,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "상품 등록 중 오류가 발생했습니다");
    }

    return await response.json();
  };

  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    setFormSubmitted(true);

    // 이미지 유효성 검사
    if (!validateImages()) {
      setError("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 1. 이미지 업로드
      const imageUrls = await uploadImages();
      console.log("이미지 업로드 완료:", imageUrls.length, "개 이미지");

      // 2. 상품 등록 API 호출
      const result = await submitProduct(formData, imageUrls);
      console.log("상품 등록 결과:", result);

      // 성공 메시지 표시
      alert("상품이 성공적으로 등록되었습니다!");

      // 상품 목록 페이지로 이동
      navigate("/?status=success", { replace: true });
    } catch (error) {
      console.error("상품 등록 오류:", error);
      setError(error.message || "상품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    formSubmitted,
    error,
    setError,
    handleSubmit,
  };
};
