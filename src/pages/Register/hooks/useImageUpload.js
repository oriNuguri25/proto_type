import { useState, useRef } from "react";
import { getToken } from "@/utils/auth";

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
      const token = getToken();
      if (!token) throw new Error("로그인이 필요합니다");

      // 개발 환경인지 확인
      const isDev =
        import.meta.env?.MODE === "development" ||
        process.env.NODE_ENV === "development";

      // FormData 생성
      const formData = new FormData();
      imageFiles.forEach((file, index) => {
        // API 서버에서 예상하는 형식으로 파일 추가
        // formidable은 다중 파일을 같은 이름으로 처리할 수 있음
        formData.append("images", file);
      });

      // API 서버 URL 설정 (개발/프로덕션 환경에 따라 다름)
      const apiUrl = isDev
        ? "/api/upload-product-images" // 개발 환경
        : "/api/upload-product-images"; // 프로덕션 환경 (필요시 변경)

      console.log(`이미지 업로드 요청: ${apiUrl}`);

      // 서버 API 호출
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "이미지 업로드 중 오류가 발생했습니다";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("응답 파싱 오류:", e);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

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
      console.error("이미지 업로드 오류:", error);
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
