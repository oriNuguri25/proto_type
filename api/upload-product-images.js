import formidable from "formidable";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import cors from "cors";

// CORS 미들웨어 설정
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "https://jeogi.vercel.app"],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
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
      maxFileSize: 5 * 1024 * 1024, // 최대 파일 크기 5MB
      keepExtensions: true, // 파일 확장자 유지
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

// API 요청 핸들러
export default async function handler(req, res) {
  try {
    // CORS 헤더 수동 설정 (preflight 요청을 위해)
    res.setHeader(
      "Access-Control-Allow-Origin",
      req.headers.origin || "http://localhost:5173"
    );
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // cors 미들웨어 실행 - 일반 요청의 경우
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
      return res.status(401).json({
        success: false,
        message: "인증 정보가 필요합니다",
      });
    }

    // 폼 데이터 파싱
    const { fields, files } = await parseForm(req);

    // files 객체를 배열로 변환
    const fileArray = Object.values(files);
    if (fileArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "업로드할 이미지가 없습니다",
      });
    }

    // 이미지 파일 확인
    const imageFiles = fileArray.filter(
      (file) => file.mimetype && file.mimetype.startsWith("image/")
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
      // 파일 읽기
      const fileData = fs.readFileSync(file.filepath);

      // 고유한 파일명 생성
      const timestamp = Date.now();
      const originalExtension = path.extname(file.originalFilename);
      const fileName = `${timestamp}_${Math.random()
        .toString(36)
        .substring(2, 15)}${originalExtension}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, fileData, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("이미지 업로드 오류:", error);
        continue; // 이 파일은 건너뛰고 다음 파일 처리
      }

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      if (urlData && urlData.publicUrl) {
        imageUrls.push(urlData.publicUrl);
      }

      // 임시 파일 삭제
      fs.unlinkSync(file.filepath);
    }

    // 성공 응답
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

// FormData 요청 본문 파싱을 위한 설정
export const config = {
  api: {
    bodyParser: false, // 빌트인 bodyParser 비활성화
  },
};
