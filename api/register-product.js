import { createClient } from "@supabase/supabase-js";

// bodyParser 활성화 (비활성화 설정 제거)
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// Supabase 클라이언트 초기화
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

// JWT 토큰에서 사용자 ID 추출
const getUserIdFromToken = (token) => {
  try {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    console.log("토큰 파싱 시작");

    // JWT 구조: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("JWT 형식이 아닙니다");
      return null;
    }

    const payload = parts[1];
    const paddedPayload = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );
    const decodedPayload = Buffer.from(paddedPayload, "base64").toString();

    const userData = JSON.parse(decodedPayload);

    // JWT 표준 필드 및 Supabase 필드 확인
    const userId = userData.sub || userData.user_id || userData.id;

    console.log("추출된 사용자 ID:", userId);
    return userId;
  } catch (error) {
    console.error("토큰 파싱 오류:", error);
    return null;
  }
};

export default async function handler(req, res) {
  // CORS 헤더 설정
  const origin = req.headers.origin;
  const allowedOrigins = ["http://localhost:5173", "https://jeogi.vercel.app"];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // OPTIONS 요청(preflight) 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST 요청만 처리
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "허용되지 않는 메서드입니다",
    });
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

    // 토큰에서 사용자 ID 추출
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 인증 토큰입니다",
      });
    }

    // profiles 테이블에서 사용자 확인
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (profileError || !userProfile) {
      console.error(
        "사용자 프로필 조회 오류:",
        profileError || "사용자를 찾을 수 없음"
      );
      return res.status(401).json({
        success: false,
        message: "사용자 프로필을 찾을 수 없습니다",
        detail: "인증은 되었으나 사용자 프로필이 존재하지 않습니다.",
      });
    }

    console.log("사용자 프로필 확인 완료:", userProfile.id);

    const productData = req.body;
    console.log("요청 데이터:", productData);

    // 필드 이름 표준화 (title -> product_name)
    if (productData.title && !productData.product_name) {
      productData.product_name = productData.title;
    }

    // 필수 필드 확인
    const requiredFields = [
      "product_name",
      "description",
      "price",
      "image_urls",
    ];

    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `다음 필드가 누락되었습니다: ${missingFields.join(", ")}`,
      });
    }

    // 이미지 URL 배열 확인
    if (
      !Array.isArray(productData.image_urls) ||
      productData.image_urls.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "최소 한 개 이상의 이미지 URL이 필요합니다",
      });
    }

    // 가격 타입 확인
    if (isNaN(Number(productData.price))) {
      return res.status(400).json({
        success: false,
        message: "가격은 숫자여야 합니다",
      });
    }

    // 상품 데이터 구성
    const newProduct = {
      user_id: userProfile.id, // 확인된 프로필 ID 사용
      product_name: productData.product_name,
      description: productData.description,
      price: Number(productData.price),
      purchase_link: productData.purchase_link || "",
      image_urls: productData.image_urls,
    };

    console.log("저장할 상품 데이터:", newProduct);

    try {
      // Supabase에 데이터 저장
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

      if (!data || data.length === 0) {
        console.error("상품 등록 실패: 데이터가 반환되지 않음");
        return res.status(500).json({
          success: false,
          message: "상품이 등록되었으나 ID를 받지 못했습니다",
        });
      }

      console.log("상품 등록 성공:", data[0].id);

      // 성공 응답
      return res.status(200).json({
        success: true,
        message: "상품이 성공적으로 등록되었습니다",
        data: {
          product_id: data[0].id,
        },
      });
    } catch (dbError) {
      console.error("데이터베이스 예외 발생:", dbError);
      return res.status(500).json({
        success: false,
        message: "데이터베이스 작업 중 예외가 발생했습니다",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
      error: error.message,
    });
  }
}
