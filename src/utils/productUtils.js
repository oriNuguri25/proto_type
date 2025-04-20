// 날짜 계산 함수
export const getDaysAgo = (dateString) => {
  if (!dateString) return "";
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - createdDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// 이미지 URL 처리 함수
export const getImageUrl = (imageUrls) => {
  if (!imageUrls) return "/placeholder.svg";

  try {
    // 배열인 경우
    if (Array.isArray(imageUrls)) {
      return imageUrls[0] || "/placeholder.svg";
    }

    // 쉼표로 구분된 문자열인 경우
    else if (typeof imageUrls === "string") {
      if (imageUrls.includes(",")) {
        const urls = imageUrls.split(",").map((url) => url.trim());
        return urls[0] || "/placeholder.svg";
      }
      // 단일 URL 문자열
      return imageUrls;
    }

    // 객체인 경우 (첫 번째 속성값 사용)
    else if (typeof imageUrls === "object") {
      const firstKey = Object.keys(imageUrls)[0];
      return imageUrls[firstKey] || "/placeholder.svg";
    }

    // 기본값
    return "/placeholder.svg";
  } catch (error) {
    console.error("이미지 URL 처리 오류:", error);
    return "/placeholder.svg";
  }
};

// 상태에 따른 스타일 설정
export const statusConfig = {
  // 영어 상태값에 대한 베트남어 레이블 매핑
  available: { label: "Đang bán", classname: "bg-green-100 text-green-800" },
  reserved: {
    label: "Đang đặt trước",
    classname: "bg-yellow-100 text-yellow-800",
  },
  sold: { label: "Đã bán", classname: "bg-red-100 text-red-800" },
};

// 이미지 URL을 배열로 변환하는 함수
export const getImageUrlsArray = (imageUrls) => {
  if (!imageUrls) return ["/placeholder.svg"];

  try {
    // 이미 배열인 경우
    if (Array.isArray(imageUrls)) {
      return imageUrls.length > 0 ? imageUrls : ["/placeholder.svg"];
    }

    // 쉼표로 구분된 문자열인 경우
    else if (typeof imageUrls === "string") {
      if (imageUrls.includes(",")) {
        return imageUrls.split(",").map((url) => url.trim());
      }
      // 단일 URL 문자열
      return [imageUrls];
    }

    // 객체인 경우
    else if (typeof imageUrls === "object") {
      const urls = Object.values(imageUrls);
      return urls.length > 0 ? urls : ["/placeholder.svg"];
    }

    // 기본값
    return ["/placeholder.svg"];
  } catch (error) {
    console.error("이미지 URL 배열 변환 오류:", error);
    return ["/placeholder.svg"];
  }
};
