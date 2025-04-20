import { createClient } from "@supabase/supabase-js";

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
    const payload = token.split(".")[1];
    const decodedPayload = Buffer.from(payload, "base64").toString();
    const userData = JSON.parse(decodedPayload);
    return userData.sub || userData.id;
  } catch (error) {
    console.error("토큰 파싱 오류:", error);
    return null;
  }
};

// Base64 데이터에서 MIME 타입 추출
const getMimeTypeFromBase64 = (base64String) => {
  try {
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return null;
  } catch (error) {
    console.error("MIME 타입 추출 오류:", error);
    return null;
  }
};

// Base64 이미지 데이터에서 원시 데이터 추출
const decodeBase64Image = (base64String) => {
  try {
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string format");
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");

    return { mimeType, buffer };
  } catch (error) {
    console.error("Base64 디코딩 오류:", error);
    throw error;
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

  // POST 요청만 허용
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

    // 사용자 ID 확인
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 인증 토큰입니다",
      });
    }

    console.log("인증된 사용자 ID:", userId);

    // 요청 본문 확인
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "업로드할 이미지가 없습니다",
      });
    }

    console.log(`업로드할 이미지 수: ${images.length}`);

    // 이미지 업로드 및 URL 수집
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      try {
        const base64Image = images[i];

        // Base64 이미지 유효성 검사
        if (
          !base64Image ||
          typeof base64Image !== "string" ||
          !base64Image.startsWith("data:image/")
        ) {
          console.log(`이미지 ${i + 1}는 유효한 Base64 이미지가 아닙니다`);
          continue;
        }

        // Base64 디코딩
        const { mimeType, buffer } = decodeBase64Image(base64Image);

        // MIME 타입이 이미지인지 확인
        if (!mimeType || !mimeType.startsWith("image/")) {
          console.log(
            `이미지 ${i + 1}는 유효한 이미지 형식이 아닙니다: ${mimeType}`
          );
          continue;
        }

        // 파일 확장자 결정
        let extension = "jpg";
        if (mimeType === "image/png") extension = "png";
        if (mimeType === "image/gif") extension = "gif";
        if (mimeType === "image/webp") extension = "webp";

        // 고유 파일명 생성
        const timestamp = Date.now();
        const fileName = `${timestamp}_${Math.random()
          .toString(36)
          .substring(2, 15)}.${extension}`;

        console.log(`이미지 ${i + 1} 업로드 중... (${buffer.length} bytes)`);

        // Supabase Storage에 업로드
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, buffer, {
            contentType: mimeType,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(`이미지 ${i + 1} 업로드 오류:`, error);
          continue;
        }

        // 공개 URL 가져오기
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        if (urlData && urlData.publicUrl) {
          console.log(`이미지 ${i + 1} URL 생성 완료:`, urlData.publicUrl);
          imageUrls.push(urlData.publicUrl);
        }
      } catch (error) {
        console.error(`이미지 ${i + 1} 처리 중 오류:`, error);
        // 개별 이미지 오류는 무시하고 계속 진행
      }
    }

    // 응답 반환
    if (imageUrls.length > 0) {
      return res.status(200).json({
        success: true,
        message: `${imageUrls.length}개의 이미지가 업로드되었습니다`,
        data: {
          imageUrls: imageUrls,
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "이미지 업로드에 실패했습니다",
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
