import { useState, useRef } from "react";
import { getToken } from "@/utils/auth";

/**
 * 상품 이미지 업로드를 위한 커스텀 훅
 * 파일 선택, 미리보기, 제거 및 업로드 기능 제공
 */
export const useImageUpload = () => {
  const fileInputRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageError, setImageError] = useState("");

  const handleFileSelect = (e, formSubmitted, setError) => {
    const files = Array.from(e.target.files);

    // 최대 5개 파일 제한
    if (imageFiles.length + files.length > 5) {
      setError("최대 5개의 이미지만 업로드 가능합니다.");
      return;
    }

    // 파일 목록에 추가
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // 파일 미리보기 URL 생성
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);

    // 이미지 업로드 후 에러 메시지 초기화
    if (formSubmitted && imageError) {
      setImageError("");
    }

    // 일반 오류 메시지 초기화
    if (setError) {
      setError("");
    }
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviewUrls = [...imagePreviewUrls];

    // 미리보기 URL 해제
    URL.revokeObjectURL(newPreviewUrls[index]);

    // 파일과 미리보기 URL 배열에서 제거
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviewUrls(newPreviewUrls);
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    try {
      console.log("이미지 업로드 시작:", imageFiles.length, "개 파일");

      const token = getToken();
      if (!token) throw new Error("로그인이 필요합니다");

      // FormData 생성
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // 프록시를 통해 요청하도록 상대 경로 사용
      const apiUrl = "/api/upload-product-images";
      console.log(`이미지 업로드 요청 URL: ${apiUrl}`);

      // API 요청 보내기
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include", // 쿠키를 포함시켜 CORS 요청 처리
      });

      console.log("서버 응답 상태:", response.status, response.statusText);

      // 응답 텍스트 먼저 가져오기
      const responseText = await response.text();
      console.log("서버 응답 내용:", responseText);

      if (!response.ok) {
        let errorMessage = `이미지 업로드 중 오류가 발생했습니다. 상태 코드: ${response.status}`;

        try {
          // 응답이 JSON인 경우에만 파싱 시도
          if (
            responseText.trim().startsWith("{") &&
            responseText.trim().endsWith("}")
          ) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {
          console.error("응답 파싱 오류:", e);
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

      // API 서버 응답 구조에 맞게 처리
      if (result.success && result.data && result.data.imageUrls) {
        console.log("업로드 성공:", result.message);
        return result.data.imageUrls;
      } else {
        throw new Error(
          result.message || "이미지 URL을 가져오는데 실패했습니다"
        );
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error.message);
      throw error;
    }
  };

  const validateImages = () => {
    if (imageFiles.length === 0) {
      setImageError("최소 한 개 이상의 이미지를 업로드해주세요.");
      return false;
    }
    return true;
  };

  return {
    fileInputRef,
    imageFiles,
    imagePreviewUrls,
    imageError,
    handleFileSelect,
    handleRemoveImage,
    uploadImages,
    validateImages,
    setImageError,
  };
};
