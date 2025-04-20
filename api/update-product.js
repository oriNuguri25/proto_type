import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화 (SERVICE_ROLE_KEY 사용)
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
    console.log("받은 토큰 (일부):", token.substring(0, 10) + "...");

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
    console.log("디코딩된 페이로드:", decodedPayload);

    const userData = JSON.parse(decodedPayload);
    console.log("파싱된 사용자 데이터:", userData);

    // JWT 표준 필드 및 Supabase 필드 확인
    const userId =
      userData.sub || userData.user_id || userData.id || userData.userId;

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

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // OPTIONS 요청(preflight) 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET 요청 처리 (상품 정보 조회)
  if (req.method === "GET") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "상품 ID가 필요합니다",
        });
      }

      // 상품 정보 조회
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("상품 조회 오류:", error);
        return res.status(500).json({
          success: false,
          message: "상품 정보 조회 중 오류가 발생했습니다",
          error: error.message,
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "상품을 찾을 수 없습니다",
        });
      }

      return res.status(200).json({
        success: true,
        product,
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

  // POST 요청 처리 (상품 정보 업데이트)
  if (req.method === "POST") {
    try {
      // 인증 토큰 확인
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "인증 정보가 필요합니다",
        });
      }

      console.log("수신된 인증 헤더:", token.substring(0, 15) + "...");

      // 토큰에서 사용자 ID 추출
      const userId = getUserIdFromToken(token);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "유효하지 않은 인증 토큰입니다",
        });
      }

      console.log("토큰에서 추출한 사용자 ID:", userId);

      // 요청 본문 확인
      const { productId, productData } = req.body;
      if (!productId || !productData) {
        return res.status(400).json({
          success: false,
          message: "상품 ID와 업데이트할 데이터가 필요합니다",
        });
      }

      // 상품 정보 확인 (본인 상품인지 검증)
      const { data: existingProduct, error: productError } = await supabase
        .from("products")
        .select("id, user_id")
        .eq("id", productId)
        .single();

      if (productError) {
        console.error("상품 조회 오류:", productError);
        return res.status(500).json({
          success: false,
          message: "상품 정보 조회 중 오류가 발생했습니다",
          error: productError.message,
        });
      }

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "상품을 찾을 수 없습니다",
        });
      }

      // 본인 상품인지 확인
      if (existingProduct.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "자신의 상품만 수정할 수 있습니다",
        });
      }

      // 업데이트할 필드 구성
      const updateData = {
        ...(productData.product_name && {
          product_name: productData.product_name,
        }),
        ...(productData.description && {
          description: productData.description,
        }),
        ...(productData.price && {
          price: Number(productData.price.replace(/,/g, "")),
        }),
        ...(productData.status && { status: productData.status }),
        ...(productData.purchase_link && {
          purchase_link: productData.purchase_link,
        }),
        ...(productData.image_urls && { image_urls: productData.image_urls }),
        updated_at: new Date().toISOString(), // 수정 시간 업데이트
      };

      console.log("업데이트할 데이터:", updateData);

      // SERVICE_ROLE_KEY를 사용하여 상품 정보 업데이트
      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", productId)
        .select();

      if (updateError) {
        console.error("상품 정보 업데이트 오류:", updateError);
        return res.status(500).json({
          success: false,
          message: "상품 정보 업데이트 중 오류가 발생했습니다",
          error: updateError.message,
        });
      }

      console.log("상품 정보가 성공적으로 업데이트되었습니다:", updatedProduct);

      return res.status(200).json({
        success: true,
        message: "상품 정보가 성공적으로 업데이트되었습니다",
        product: updatedProduct[0],
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

  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: "허용되지 않는 메서드입니다",
  });
}
