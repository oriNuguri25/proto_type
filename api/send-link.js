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

    const link = `${process.env.BASE_URL}/api/verify?token=${token}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Xác minh email</h2>
        <p style="color: #666;">Kính chào ${name},</p>
        <p style="color: #666;">Vui lòng nhấp vào nút bên dưới để hoàn tất đăng ký.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Xác minh email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Liên kết này chỉ có hiệu lực trong vòng 30 phút.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">Nếu nút không hoạt động, vui lòng sao chép liên kết bên dưới và dán vào trình duyệt của bạn:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${link}</p>
      </div>
    `;

    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Jeogi - Xác minh email",
      html: emailHtml,
    });

    return res.status(200).json({ message: "인증 메일을 발송했습니다." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "회원가입 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}
