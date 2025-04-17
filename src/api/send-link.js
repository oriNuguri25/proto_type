import sgMail from "@sendgrid/mail";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import cors from "cors";

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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  try {
    // CORS 미들웨어 실행
    await runMiddleware(req, res, corsMiddleware);

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ message: "허용되지 않는 메서드입니다." });
    }

    const { email, name, password, nickname } = req.body;

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 유효시간 30분

    const hashedPassword = await bcrypt.hash(password, 10);

    await supabase.from("pending_users").upsert({
      email,
      name,
      password: hashedPassword,
      nickname,
      token,
      expires_at: expiresAt.toISOString(),
    });

    // 절대 URL 생성
    const verificationUrl = new URL("/api/verify", process.env.BASE_URL);
    verificationUrl.searchParams.append("token", token);
    const link = verificationUrl.toString();

    const emailTemplate = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">이메일 인증</h2>
        <p style="color: #666;">안녕하세요 ${name}님,</p>
        <p style="color: #666;">아래 링크를 클릭하여 회원가입을 완료해주세요:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">이메일 인증하기</a>
        </div>
        <p style="color: #666; font-size: 14px;">링크는 30분 동안 유효합니다.</p>
        <p style="color: #666; font-size: 14px;">버튼이 작동하지 않는 경우 아래 링크를 복사하여 브라우저에 붙여넣어주세요:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${link}</p>
      </div>
    `;

    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Jeogi - 이메일 인증",
      html: emailTemplate,
    });

    return res.status(200).json({ message: "메일을 보냈어요!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "회원가입 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}
