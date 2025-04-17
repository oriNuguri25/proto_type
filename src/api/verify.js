import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
s;

export default async function handler(req, res) {
  const { token } = req.query;
  const now = new Date().toISOString();

  const { data: user, error } = await supabase
    .from("pending_users")
    .select("*")
    .eq("token", token)
    .lte("expires_at", now)
    .single();

  if (!user || error) {
    return res
      .status(400)
      .json({ error: "인증 실패 또는 링크가 만료되었습니다." });
  }

  await supabase.from("user").insert({
    email: user.email,
    name: user.name,
    password: user.password,
    nickname: user.nickname,
  });

  await supabase.from("pending_users").delete().eq("email", user.email);

  return res
    .status(200)
    .send("✅ 회원가입이 완료되었습니다! 이제 로그인해주세요.");
}
