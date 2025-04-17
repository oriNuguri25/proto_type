import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { token } = req.query;
  const now = new Date().toISOString();

  const { data: user, error } = await supabase
    .from("pending_users")
    .select("*")
    .eq("token", token)
    .single();

  if (!user || error) {
    return res.redirect(`${process.env.BASE_URL}/login?error=invalid-token`);
  }

  // 토큰 만료 확인
  if (new Date(user.expires_at) < new Date()) {
    return res.redirect(`${process.env.BASE_URL}/signup/fail`);
  }

  try {
    // user 테이블에 데이터 삽입
    await supabase.from("user").insert({
      email: user.email,
      name: user.name,
      password: user.password,
      nickname: user.nickname,
    });

    // pending_users에서 데이터 삭제
    await supabase.from("pending_users").delete().eq("email", user.email);

    // 성공 시 로그인 페이지로 리다이렉션
    return res.redirect(`${process.env.BASE_URL}/login?success=true`);
  } catch (error) {
    console.error("Error during verification:", error);
    return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
  }
}
