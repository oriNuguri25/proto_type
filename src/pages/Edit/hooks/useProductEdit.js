import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "@/utils/auth";

export const useProductEdit = (productId, uploadImages, validateImages) => {
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    price: "",
    purchase_link: "",
    status: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 상품 정보 로드
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // 환경에 따라 기본 URL 설정
        const apiUrl = import.meta.env.DEV
          ? "http://localhost:5173"
          : "https://jeogi.vercel.app";

        console.log(
          `상품 정보 요청 URL: ${apiUrl}/api/update-product?id=${productId}`
        );

        const response = await fetch(
          `${apiUrl}/api/update-product?id=${productId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // 응답 텍스트 먼저 확인 (디버깅 용도)
        const responseText = await response.text();
        console.log("서버 응답:", responseText.substring(0, 100) + "..."); // 응답 내용 앞부분만 로그

        // 응답이 JSON인지 확인
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (err) {
          console.error("응답이 유효한 JSON이 아닙니다:", err);
          throw new Error("서버에서 유효하지 않은 응답을 받았습니다");
        }

        if (!response.ok) {
          throw new Error(
            data.message || "상품 정보를 불러오는데 실패했습니다."
          );
        }

        setProduct(data.product);

        // 상품 정보로 폼 초기화
        setFormData({
          product_name: data.product.product_name || "",
          description: data.product.description || "",
          price: data.product.price ? data.product.price.toLocaleString() : "",
          purchase_link: data.product.purchase_link || "",
          status: data.product.status || "available",
        });
      } catch (err) {
        console.error("상품 정보 로드 오류:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // 상품 정보 업데이트 함수
  const updateProduct = async (e, formData, imageUrls = null) => {
    e.preventDefault();
    setFormSubmitted(true);
    setIsSubmitting(true);
    setError(null);

    try {
      // 이미지 유효성 검사
      if (validateImages && !imageUrls) {
        const imagesValid = validateImages();
        if (!imagesValid) {
          setIsSubmitting(false);
          return false;
        }
      }

      // 이미지 업로드 (필요한 경우)
      let uploadedImageUrls = imageUrls;
      if (uploadImages && !imageUrls) {
        uploadedImageUrls = await uploadImages();
        if (!uploadedImageUrls) {
          setIsSubmitting(false);
          return false;
        }
      }

      // JWT 토큰 가져오기
      const token = getToken();
      if (!token) {
        setError("로그인이 필요합니다.");
        setIsSubmitting(false);
        return false;
      }

      // 업데이트할 데이터 준비
      const productData = { ...formData };
      if (uploadedImageUrls) {
        productData.image_urls = uploadedImageUrls;
      }

      // API 요청 보내기
      const response = await fetch(
        `${
          import.meta.env.DEV
            ? "http://localhost:5173"
            : "https://jeogi.vercel.app"
        }/api/update-product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            productData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "상품 업데이트에 실패했습니다");
      }

      console.log("상품 업데이트 성공:", data);
      return true;
    } catch (err) {
      console.error("상품 업데이트 오류:", err);
      setError(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    product,
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    formSubmitted,
    error,
    setError,
    updateProduct,
  };
};
