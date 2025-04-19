import { createClient } from "@supabase/supabase-js";

// 서버 사이드에서 Supabase 클라이언트 생성
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
);

// 토큰에서 사용자 ID 추출
const getUserIdFromToken = (token) => {
  try {
    // Bearer 접두사 제거
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // JWT의 페이로드 부분 추출
    const payload = token.split(".")[1];
    const decodedPayload = Buffer.from(payload, "base64").toString();
    const userData = JSON.parse(decodedPayload);

    return userData.id;
  } catch (error) {
    console.error("토큰 파싱 오류:", error);
    return null;
  }
};

export default async function handler(req, res) {
  // POST 요청만 처리
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "허용되지 않는 메서드입니다" });
  }

  try {
    // 인증 토큰 확인
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "인증 정보가 필요합니다",
      });
    }

    // 사용자 ID 추출
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 인증 토큰입니다",
      });
    }

    // 요청 본문에서 상품 데이터 추출
    const productData = req.body;

    // 필수 필드 확인
    const requiredFields = [
      "title",
      "description",
      "price",
      "category",
      "image_urls",
    ];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `다음 필드가 누락되었습니다: ${missingFields.join(", ")}`,
      });
    }

    // 이미지 URL 검증
    if (
      !Array.isArray(productData.image_urls) ||
      productData.image_urls.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "최소 한 개 이상의 이미지 URL이 필요합니다",
      });
    }

    // 가격이 숫자인지 확인
    if (isNaN(Number(productData.price))) {
      return res.status(400).json({
        success: false,
        message: "가격은 숫자여야 합니다",
      });
    }

    // Supabase에 저장할 데이터 준비
    const newProduct = {
      title: productData.title,
      description: productData.description,
      price: Number(productData.price),
      category: productData.category,
      image_urls: productData.image_urls,
      user_id: userId,
      condition: productData.condition || "중고", // 기본값 설정
      brand: productData.brand || null,
      location: productData.location || null,
    };

    // Supabase에 데이터 삽입
    const { data, error } = await supabase
      .from("products")
      .insert(newProduct)
      .select("id");

    if (error) {
      console.error("데이터베이스 오류:", error);
      return res.status(500).json({
        success: false,
        message: "상품 등록 중 오류가 발생했습니다",
        error: error.message,
      });
    }

    // 성공 응답
    return res.status(200).json({
      success: true,
      message: "상품이 성공적으로 등록되었습니다",
      data: {
        product_id: data[0].id,
      },
    });
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
      error: error.message,
    });
  }
}
