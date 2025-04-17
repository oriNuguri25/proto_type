import sgMail from "@sendgrid/mail";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
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

  await sgMail.send({
    to: email,
    from: process.env.FROM_EMAIL,
    subject: "Xác minh đăng ký tài khoản",
    html: `<p>Xin chào ${name},<br/>Nhấn vào liên kết sau để xác minh tài khoản của bạn:<br/><a href="${link}">${link}</a><br/><br/>Liên kết sẽ hết hạn trong 10 phút.</p>`,
  });

  return res.status(200).json({ message: "메일을 보냈어요!" });
}
