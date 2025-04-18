import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
  }
);

export default async function handler(req, res) {
  const { token } = req.query;
  console.log("Received token:", token);

  try {
    // pending_users에서 사용자 정보 조회
    console.log("Fetching user from pending_users...");
    const { data: user, error: fetchError } = await supabase
      .from("pending_users")
      .select("*")
      .eq("token", token)
      .single();

    if (!user || fetchError) {
      console.error("Error fetching user from pending_users:", fetchError);
      console.log("User data:", user);

      // 토큰이 유효하지 않은 경우 해당 토큰의 데이터 삭제
      if (token) {
        console.log("Deleting invalid token data...");
        await supabase.from("pending_users").delete().eq("token", token);
      }

      return res.redirect(`${process.env.BASE_URL}/login?error=invalid-token`);
    }

    console.log("Found pending user:", {
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      expires_at: user.expires_at,
    });

    // 토큰 만료 확인
    if (new Date(user.expires_at) < new Date()) {
      console.log("Token expired at:", user.expires_at);

      // 만료된 토큰의 데이터 삭제
      console.log("Deleting expired token data...");
      await supabase.from("pending_users").delete().eq("email", user.email);

      return res.redirect(`${process.env.BASE_URL}/login?error=expired-token`);
    }

    // users 테이블에 데이터 삽입 전에 이메일 중복 체크
    console.log("Checking if email already exists...");
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", user.email)
      .single();

    if (existingUser) {
      console.log("Email already exists:", user.email);
      return res.redirect(`${process.env.BASE_URL}/login?error=email-exists`);
    }

    // users 테이블에 데이터 upsert
    console.log("Attempting to upsert user into users table...");
    const { data: insertData, error: insertError } = await supabase
      .from("profiles")
      .upsert([
        {
          email: user.email,
          name: user.name,
          password: user.password,
          nickname: user.nickname,
        },
      ])
      .select();

    if (insertError) {
      console.error("Error inserting user into users table:", insertError);
      console.error("Insert error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
    }

    console.log("Successfully inserted user:", insertData);

    // pending_users에서 데이터 삭제
    console.log("Attempting to delete user from pending_users...");
    const { error: deleteError } = await supabase
      .from("pending_users")
      .delete()
      .eq("email", user.email);

    if (deleteError) {
      console.error("Error deleting pending user:", deleteError);
    } else {
      console.log("Successfully deleted user from pending_users");
    }

    // 성공 시 로그인 페이지로 리다이렉션
    console.log("Redirecting to login page with success message");
    return res.redirect(`${process.env.BASE_URL}/login?success=true`);
  } catch (error) {
    console.error("Unexpected error during verification:", error);
    console.error("Error stack:", error.stack);
    return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
  }
}
