import formidable from "formidable";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import cors from "cors";

// CORS 미들웨어 설정
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "https://jeogi.vercel.app"], // 명시적으로 허용할 출처 지정
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
});

// CORS 미들웨어를 Promise로 래핑
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

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

// formidable로 폼 데이터 파싱
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true, // 다중 파일 업로드 허용
      maxFileSize: 10 * 1024 * 1024, // 최대 파일 크기 10MB로 증가
      keepExtensions: true, // 파일 확장자 유지
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("폼 파싱 오류:", err);
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

// API 요청 핸들러
export default async function handler(req, res) {
  // 클라이언트 요청 출처 확인
  const origin = req.headers.origin;
  const allowedOrigins = ["http://localhost:5173", "https://jeogi.vercel.app"];
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  console.log("[UPLOAD] API 요청 시작:", req.method);
  console.log("[UPLOAD] 요청 헤더:", req.headers);
  console.log("[UPLOAD] 요청 출처:", origin);

  // OPTIONS 요청 처리 (preflight)
  if (req.method === "OPTIONS") {
    // preflight 요청에 대한 CORS 헤더 명시적 설정
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(200).end();
    return;
  }

  try {
    // POST 요청에 대한 CORS 헤더 명시적 설정
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // CORS 미들웨어 실행
    await runMiddleware(req, res, corsMiddleware);

    // POST 요청만 처리
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "허용되지 않는 메서드입니다",
      });
    }

    // 인증 토큰 확인
    const token = req.headers.authorization;
    if (!token) {
      console.log("[UPLOAD] 인증 토큰 없음");
      return res.status(401).json({
        success: false,
        message: "인증 정보가 필요합니다",
      });
    }

    try {
      console.log("[UPLOAD] 폼 데이터 파싱 시작");
      // 폼 데이터 파싱
      const { fields, files } = await parseForm(req);
      console.log(
        "[UPLOAD] 폼 데이터 파싱 완료, 필드:",
        Object.keys(fields || {})
      );
      console.log("[UPLOAD] 파일 수:", Object.keys(files || {}).length);

      // files 객체를 배열로 변환
      const fileArray = Object.values(files || {});
      if (fileArray.length === 0) {
        console.log("[UPLOAD] 업로드할 파일이 없음");
        return res.status(400).json({
          success: false,
          message: "업로드할 이미지가 없습니다",
        });
      }

      // 이미지 파일 확인
      const imageFiles = fileArray.filter(
        (file) => file.mimetype && file.mimetype.startsWith("image/")
      );

      console.log("[UPLOAD] 이미지 파일 수:", imageFiles.length);
      console.log(
        "[UPLOAD] 이미지 유형:",
        imageFiles.map((f) => f.mimetype).join(", ")
      );

      if (imageFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "유효한 이미지 파일이 없습니다",
        });
      }

      // 이미지 업로드 및 URL 수집
      const imageUrls = [];
      for (const file of imageFiles) {
        try {
          // 파일 읽기
          console.log(
            "[UPLOAD] 파일 처리:",
            file.originalFilename,
            file.mimetype,
            file.size,
            "바이트"
          );
          const fileData = fs.readFileSync(file.filepath);

          // 고유한 파일명 생성
          const timestamp = Date.now();
          const originalExtension = path.extname(file.originalFilename || "");
          const fileName = `${timestamp}_${Math.random()
            .toString(36)
            .substring(2, 15)}${originalExtension}`;

          console.log("[UPLOAD] Supabase Storage에 업로드:", fileName);
          // Supabase Storage에 업로드
          const { data, error } = await supabase.storage
            .from("product-images")
            .upload(fileName, fileData, {
              contentType: file.mimetype,
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error("[UPLOAD] Supabase 업로드 오류:", error);
            continue; // 이 파일은 건너뛰고 다음 파일 처리
          }

          console.log("[UPLOAD] 업로드 성공, 공개 URL 생성");
          // 공개 URL 가져오기
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          if (urlData && urlData.publicUrl) {
            console.log("[UPLOAD] 공개 URL 생성 완료:", urlData.publicUrl);
            imageUrls.push(urlData.publicUrl);
          }

          // 임시 파일 삭제
          fs.unlinkSync(file.filepath);
          console.log("[UPLOAD] 임시 파일 삭제 완료");
        } catch (fileError) {
          console.error("[UPLOAD] 파일 처리 오류:", fileError);
          // 개별 파일 오류는 기록하되 계속 진행
        }
      }

      // 성공 응답
      if (imageUrls.length > 0) {
        console.log("[UPLOAD] 이미지 업로드 완료, URL 수:", imageUrls.length);
        return res.status(200).json({
          success: true,
          message: `${imageUrls.length}개의 이미지가 업로드되었습니다`,
          data: {
            imageUrls: imageUrls,
          },
        });
      } else {
        console.log("[UPLOAD] 이미지 업로드 실패");
        return res.status(500).json({
          success: false,
          message: "이미지 업로드에 실패했습니다",
        });
      }
    } catch (innerError) {
      console.error("[UPLOAD] 요청 처리 중 오류:", innerError);
      return res.status(500).json({
        success: false,
        message: "이미지 처리 중 오류가 발생했습니다",
        error: innerError.message,
      });
    }
  } catch (error) {
    console.error("[UPLOAD] 서버 오류:", error);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
      error: error.message,
    });
  }
}

// FormData 요청 본문 파싱을 위한 설정
export const config = {
  api: {
    bodyParser: false, // 빌트인 bodyParser 비활성화
  },
};
