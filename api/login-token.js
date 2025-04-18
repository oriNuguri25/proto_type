import jwt from "jsonwebtoken";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// CORS 미들웨어 설정
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "https://jeogi.vercel.app"],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
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

export default async function handler(req, res) {
  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // CORS 미들웨어 실행
  try {
    await runMiddleware(req, res, corsMiddleware);
  } catch (error) {
    console.error("CORS 에러:", error);
    return res.status(500).json({ message: "CORS 에러가 발생했습니다." });
  }

  // POST 메소드 체크
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "허용되지 않는 메서드입니다.",
      allowedMethods: ["POST", "OPTIONS"],
    });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "이메일이 필요합니다." });
  }

  try {
    // profiles 테이블에서 사용자 정보 조회
    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (error || !user) {
      console.error("사용자 정보 조회 오류:", error);
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}
