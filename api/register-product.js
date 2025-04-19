import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false,
  },
};

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

const getUserIdFromToken = (token) => {
  try {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
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
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "허용되지 않는 메서드입니다" });
  }

  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "인증 정보가 필요합니다" });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "유효하지 않은 인증 토큰입니다" });
    }

    const rawBody = await buffer(req);
    const bodyString = rawBody.toString();
    const productData = JSON.parse(bodyString);

    let product_name = productData.title || productData.product_name;

    const requiredFields = [
      "product_name",
      "description",
      "price",
      "image_urls",
    ];

    if (productData.title && !productData.product_name) {
      productData.product_name = productData.title;
    }

    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `다음 필드가 누락되었습니다: ${missingFields.join(", ")}`,
      });
    }

    if (
      !Array.isArray(productData.image_urls) ||
      productData.image_urls.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "최소 한 개 이상의 이미지 URL이 필요합니다",
      });
    }

    if (isNaN(Number(productData.price))) {
      return res.status(400).json({
        success: false,
        message: "가격은 숫자여야 합니다",
      });
    }

    const newProduct = {
      user_id: userId,
      product_name: productData.product_name,
      description: productData.description,
      price: Number(productData.price),
      image_urls: productData.image_urls,
      purchase_link: productData.purchase_link,
    };

    console.log("등록할 상품 데이터:", newProduct);

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
