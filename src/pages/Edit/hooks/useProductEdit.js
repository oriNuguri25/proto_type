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
          throw new Error("Nhận được phản hồi không hợp lệ từ máy chủ");
        }

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải thông tin sản phẩm.");
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
        setError(
          err.message === "서버에서 유효하지 않은 응답을 받았습니다"
            ? "Nhận được phản hồi không hợp lệ từ máy chủ"
            : err.message
        );
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
      // 이미지 URL 배열 저장 변수
      let finalImageUrls = [];

      // 이미지 삭제 여부 확인
      const wasImageRemoved = window.imageRemoved === true;

      // 이미지 URL이 이미 배열로 제공된 경우 (사전 처리된 경우)
      if (imageUrls && Array.isArray(imageUrls)) {
        console.log("미리보기 URL 또는 초기 URL 사용:", imageUrls);
        finalImageUrls = imageUrls;
      }
      // 이미지 업로드가 필요한 경우
      else if (uploadImages) {
        const imagesValid = validateImages ? validateImages() : true;
        if (!imagesValid) {
          setIsSubmitting(false);
          return false;
        }

        try {
          const uploadedUrls = await uploadImages();
          if (!uploadedUrls || !Array.isArray(uploadedUrls)) {
            throw new Error("이미지 업로드에 실패했습니다.");
          }
          finalImageUrls = uploadedUrls;
          console.log("새로 업로드된 이미지 URL:", finalImageUrls);
        } catch (uploadError) {
          console.error("이미지 업로드 오류:", uploadError);
          setError(
            uploadError.message || "이미지 업로드 중 오류가 발생했습니다"
          );
          setIsSubmitting(false);
          return false;
        }
      }
      // 업로드할 이미지도 없고 제공된 URL도 없는 경우, 기존 이미지 URL 사용
      else if (product && product.image_urls && !wasImageRemoved) {
        finalImageUrls = product.image_urls;
        console.log("기존 이미지 URL 사용:", finalImageUrls);
      }

      // 이미지가 없는 경우 오류 처리
      if (!finalImageUrls || finalImageUrls.length === 0) {
        setError(
          "Vui lòng tải lên ít nhất một hình ảnh (최소 한 개 이상의 이미지를 업로드해주세요)."
        );
        setIsSubmitting(false);
        return false;
      }

      // 필수 필드 검사 (추가 검증)
      const requiredFields = [
        { field: "product_name", label: "상품명" },
        { field: "description", label: "상품 설명" },
        { field: "price", label: "가격" },
        { field: "purchase_link", label: "구매 링크" },
      ];

      for (const { field, label } of requiredFields) {
        if (!formData[field] || formData[field].toString().trim() === "") {
          setError(`${label}을(를) 입력해주세요.`);
          setIsSubmitting(false);
          return false;
        }
      }

      // JWT 토큰 가져오기
      const token = getToken();
      if (!token) {
        setError("Vui lòng đăng nhập để tiếp tục.");
        setIsSubmitting(false);
        return false;
      }

      // 업데이트할 데이터 준비
      const productData = { ...formData };

      // 이미지 URL 설정
      productData.image_urls = finalImageUrls;
      console.log("서버로 전송할 이미지 URL:", productData.image_urls);

      // API 요청 보내기
      const apiUrl = import.meta.env.DEV
        ? "http://localhost:5173"
        : "https://jeogi.vercel.app";

      console.log(`API 요청 URL: ${apiUrl}/api/update-product`);
      console.log("요청 데이터:", {
        productId,
        productData: {
          ...productData,
          image_urls: productData.image_urls,
        },
      });

      const response = await fetch(`${apiUrl}/api/update-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          productData,
        }),
      });

      const responseText = await response.text();
      console.log("서버 응답 텍스트:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("응답 파싱 오류:", err);
        throw new Error("서버 응답을 파싱할 수 없습니다");
      }

      if (!response.ok) {
        throw new Error(data.message || "Cập nhật sản phẩm thất bại");
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
