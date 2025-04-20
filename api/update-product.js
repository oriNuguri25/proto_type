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

// 두 이미지 배열을 비교하여 삭제된 이미지 URL을 찾는 함수
const findRemovedImages = (originalUrls, newUrls) => {
  if (!originalUrls || !Array.isArray(originalUrls)) return [];
  if (!newUrls || !Array.isArray(newUrls)) return [...originalUrls];

  console.log("원본 이미지 URL:", originalUrls);
  console.log("새 이미지 URL:", newUrls);

  // 원본 배열에는 있지만 새 배열에는 없는 URL 찾기
  const removedUrls = originalUrls.filter((url) => !newUrls.includes(url));
  console.log("삭제된 이미지 URL:", removedUrls);

  return removedUrls;
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

      // 필수 필드 확인
      const requiredFields = [
        "product_name",
        "description",
        "price",
        "purchase_link",
      ];
      const missingFields = requiredFields.filter(
        (field) =>
          !productData[field] || productData[field].toString().trim() === ""
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `다음 필드가 누락되었습니다: ${missingFields.join(", ")}`,
        });
      }

      // 이미지 존재 확인
      if (
        !productData.image_urls ||
        !Array.isArray(productData.image_urls) ||
        productData.image_urls.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "최소 한 개 이상의 이미지가 필요합니다",
        });
      }

      // 상품 정보 확인 (본인 상품인지 검증)
      const { data: existingProduct, error: productError } = await supabase
        .from("products")
        .select("id, user_id, image_urls")
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

      // 삭제된 이미지 확인
      const originalImageUrls = existingProduct.image_urls || [];
      const newImageUrls = productData.image_urls || [];

      console.log("기존 이미지 개수:", originalImageUrls.length);
      console.log("새 이미지 개수:", newImageUrls.length);

      const removedImageUrls = findRemovedImages(
        originalImageUrls,
        newImageUrls
      );

      // 삭제된 이미지가 있다면 스토리지에서 제거
      let imageDeleteResult = { deletedCount: 0 };
      if (removedImageUrls.length > 0) {
        console.log(
          `${removedImageUrls.length}개의 이미지가 삭제되었습니다. 스토리지에서 제거 시도...`
        );

        // 이미지 삭제 시도
        imageDeleteResult = await deleteImagesFromStorage(removedImageUrls);
        console.log("이미지 삭제 결과:", imageDeleteResult);
      } else {
        console.log("삭제된 이미지가 없습니다. 스토리지 작업 건너뜀.");
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
          price: Number(productData.price.toString().replace(/,/g, "")),
        }),
        ...(productData.status && { status: productData.status }),
        ...(productData.purchase_link && {
          purchase_link: productData.purchase_link,
        }),
        // 이미지 URL 배열 명시적으로 세팅
        image_urls: productData.image_urls,
        // 한국 시간(KST, UTC+9)으로 업데이트 시간 설정
        updated_at: new Date(
          new Date().getTime() + 9 * 60 * 60 * 1000
        ).toISOString(),
      };

      console.log("업데이트할 데이터:", updateData);
      console.log("업데이트할 이미지 배열:", updateData.image_urls);

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

      // 업데이트 결과 확인
      console.log("상품 정보가 성공적으로 업데이트되었습니다:");
      console.log("업데이트된 이미지 URL:", updatedProduct[0].image_urls);

      // 업데이트 확인을 위해 다시 상품 정보 조회
      const { data: verifyProduct } = await supabase
        .from("products")
        .select("image_urls")
        .eq("id", productId)
        .single();

      console.log("DB 업데이트 확인 - 이미지 URL:", verifyProduct?.image_urls);

      return res.status(200).json({
        success: true,
        message: "상품 정보가 성공적으로 업데이트되었습니다",
        product: {
          ...updatedProduct[0],
          imageDeleteInfo: {
            removedImages: removedImageUrls.length,
            deletedFromStorage: imageDeleteResult.deletedCount,
          },
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

  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: "허용되지 않는 메서드입니다",
  });
}
