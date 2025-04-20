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

// 이미지 URL에서 스토리지 파일 경로 추출
const getStoragePathFromUrl = (imageUrl) => {
  try {
    if (!imageUrl) return null;

    // 스토리지 버킷과 경로 추출
    // 예: https://xyz.supabase.co/storage/v1/object/public/product-images/1234567890.jpg
    // -> product-images/1234567890.jpg
    const urlParts = imageUrl.split("/");
    const bucketIndex = urlParts.findIndex((part) => part === "public");

    if (bucketIndex === -1 || bucketIndex >= urlParts.length - 1) {
      console.error("이미지 URL 형식이 예상과 다릅니다:", imageUrl);
      return null;
    }

    // 버킷 이름과 파일 경로 추출
    const bucketName = urlParts[bucketIndex + 1];
    const filePath = urlParts.slice(bucketIndex + 2).join("/");

    console.log(`추출된 정보 - 버킷: ${bucketName}, 파일 경로: ${filePath}`);
    return { bucketName, filePath };
  } catch (error) {
    console.error("이미지 URL 파싱 오류:", error);
    return null;
  }
};

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
    // 가능한 모든 ID 필드를 확인
    const userId =
      userData.sub || userData.user_id || userData.id || userData.userId;

    console.log("추출된 사용자 ID:", userId);
    return userId;
  } catch (error) {
    console.error("토큰 파싱 오류:", error);
    return null;
  }
};

// 스토리지에서 이미지 삭제
const deleteImagesFromStorage = async (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    console.log("삭제할 이미지가 없습니다.");
    return { success: true, deletedCount: 0 };
  }

  console.log(`총 ${imageUrls.length}개 이미지 삭제 시도...`);
  let successCount = 0;
  let errorCount = 0;

  for (const imageUrl of imageUrls) {
    try {
      const storageInfo = getStoragePathFromUrl(imageUrl);

      if (!storageInfo || !storageInfo.bucketName || !storageInfo.filePath) {
        console.warn("스토리지 경로를 추출할 수 없습니다:", imageUrl);
        errorCount++;
        continue;
      }

      console.log(
        `이미지 삭제 시도: ${storageInfo.bucketName}/${storageInfo.filePath}`
      );

      // 스토리지에서 파일 삭제
      const { error } = await supabase.storage
        .from(storageInfo.bucketName)
        .remove([storageInfo.filePath]);

      if (error) {
        console.error(`이미지 삭제 오류 (${imageUrl}):`, error);
        errorCount++;
      } else {
        console.log(`이미지 삭제 성공: ${imageUrl}`);
        successCount++;
      }
    } catch (error) {
      console.error(`이미지 삭제 중 예외 발생 (${imageUrl}):`, error);
      errorCount++;
    }
  }

  console.log(`이미지 삭제 결과: 성공 ${successCount}개, 실패 ${errorCount}개`);
  return {
    success: errorCount === 0,
    deletedCount: successCount,
    errorCount,
  };
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
        message: "Cần thông tin xác thực",
      });
    }

    console.log("수신된 인증 헤더:", token.substring(0, 15) + "...");

    // 토큰에서 사용자 ID 추출
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token xác thực không hợp lệ",
      });
    }

    console.log("토큰에서 추출한 사용자 ID:", userId);

    // 요청 본문 확인
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Cần mã ID sản phẩm",
      });
    }

    // 상품 정보 확인 (본인 상품인지 검증)
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, user_id, image_urls")
      .eq("id", productId)
      .single();

    if (productError) {
      console.error("상품 조회 오류:", productError);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi tải thông tin sản phẩm",
        error: productError.message,
      });
    }

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // 본인 상품인지 확인
    if (productData.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể xóa sản phẩm của mình",
      });
    }

    console.log(`상품 ID ${productId} 삭제 시작...`);

    // 스토리지에서 이미지 삭제
    const imageUrls = productData.image_urls || [];
    console.log(`상품에 연결된 이미지 URL ${imageUrls.length}개 발견`);

    const imageDeleteResult = await deleteImagesFromStorage(imageUrls);
    console.log("이미지 삭제 결과:", imageDeleteResult);

    // SERVICE_ROLE_KEY를 사용하여 상품 삭제
    const { data: deleteData, error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select();

    if (deleteError) {
      console.error("상품 삭제 오류:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Đã xảy ra lỗi khi xóa sản phẩm",
        error: deleteError.message,
      });
    }

    console.log("상품이 성공적으로 삭제되었습니다:", deleteData);

    // 삭제 확인
    const { data: checkData } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId);

    if (checkData && checkData.length > 0) {
      console.warn("상품이 완전히 삭제되지 않았습니다!");
    } else {
      console.log("상품이 완전히 삭제되었음을 확인했습니다.");
    }

    return res.status(200).json({
      success: true,
      message: "Sản phẩm đã được xóa thành công",
      data: {
        ...deleteData[0],
        imageDeleteInfo: {
          totalImages: imageUrls.length,
          deletedImages: imageDeleteResult.deletedCount,
        },
      },
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi máy chủ", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi máy chủ",
      error: error.message,
    });
  }
}
