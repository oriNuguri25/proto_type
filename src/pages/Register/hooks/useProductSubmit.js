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
    if (!token) {
      console.error("토큰이 없습니다");
      throw new Error("로그인이 필요합니다");
    }

    // 로그인 제출 방식과 동일하게 환경에 따라 기본 URL 설정
    const apiUrl = import.meta.env.DEV
      ? "http://localhost:5173"
      : "https://jeogi.vercel.app";

    console.log(`상품 등록 요청 URL: ${apiUrl}/api/register-product`);

    // 서버가 기대하는 형식으로 데이터 가공
    const requestData = {
      product_name: formData.product_name,
      description: formData.description,
      price: parseInt(formData.price.replace(/,/g, ""), 10), // 쉼표 제거 후 숫자로 변환
      purchase_link: formData.purchase_link,
      image_urls: imageUrls,
    };
    console.log("상품 등록 요청 데이터:", requestData);

    try {
      const response = await fetch(`${apiUrl}/api/register-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        credentials: "include",
      });

      // 응답 텍스트 먼저 가져오기
      const responseText = await response.text();
      console.log("상품 등록 서버 응답:", responseText);

      if (!response.ok) {
        let errorMessage = "상품 등록 중 오류가 발생했습니다";

        // 500번대 에러 체크
        if (response.status >= 500) {
          errorMessage = "Vui lòng thử lại một lần nữa."; // 베트남어로 "한번 더 시도하세요"
          console.error(
            `서버 오류 (${response.status}): 사용자에게 재시도 요청`
          );
        } else {
          try {
            // 응답이 JSON인 경우에만 파싱 시도
            if (
              responseText.trim().startsWith("{") &&
              responseText.trim().endsWith("}")
            ) {
              const errorData = JSON.parse(responseText);
              errorMessage =
                errorData.error || errorData.message || errorMessage;
              console.error("서버 오류 상세 정보:", errorData);
            }
          } catch (e) {
            console.error("응답 파싱 오류:", e);
          }
        }

        throw new Error(errorMessage);
      }

      let result;
      try {
        // 응답이 JSON인 경우에만 파싱 시도
        if (
          responseText.trim().startsWith("{") &&
          responseText.trim().endsWith("}")
        ) {
          result = JSON.parse(responseText);
        } else {
          throw new Error("서버 응답이 유효한 JSON 형식이 아닙니다");
        }
      } catch (error) {
        console.error("응답 파싱 오류:", error);
        throw new Error("서버 응답을 처리하는 중 오류가 발생했습니다");
      }

      return result;
    } catch (error) {
      console.error("상품 등록 API 호출 오류:", error);
      throw error;
    }
  };

  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    setFormSubmitted(true);

    // 이미지 유효성 검사
    if (!validateImages()) {
      setError("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
      return false;
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

      // 성공 시 true 반환
      return true;
    } catch (error) {
      console.error("상품 등록 오류:", error);

      // 에러 메시지가 베트남어로 되어 있으면 그대로 표시
      if (error.message.includes("Vui lòng")) {
        setError(error.message);
      } else {
        // 504 등 네트워크 타임아웃 에러나 500번대 에러 처리
        if (
          error.message.includes("504") ||
          error.message.includes("500") ||
          error.message.includes("timeout") ||
          error.message.includes("네트워크")
        ) {
          setError("Vui lòng thử lại một lần nữa."); // 베트남어로 "한번 더 시도하세요"
        } else {
          setError(error.message || "상품 등록 중 오류가 발생했습니다.");
        }
      }

      return false;
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
