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
  try {
    // CORS 미들웨어 실행
    await runMiddleware(req, res, corsMiddleware);

    if (req.method === "OPTIONS") {
      return res.status(200).json({ message: "OK" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ message: "허용되지 않는 메서드입니다." });
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

      // JWT 토큰에 id와 email 포함
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET
      );

      return res.status(200).json({ token });
    } catch (error) {
      console.error("JWT 생성 오류:", error);
      return res.status(500).json({ message: "토큰 생성 실패" });
    }
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}
