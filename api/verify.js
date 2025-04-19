import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req, res) {
  const { token } = req.query;
  console.log("[VERIFY] Received token:", token);

  try {
    // 1. pending_users에서 사용자 조회
    const { data: pendingUser, error: fetchError } = await supabase
      .from("pending_users")
      .select("*")
      .eq("token", token)
      .single();

    if (!pendingUser || fetchError) {
      console.error("[VERIFY] Invalid or expired token:", fetchError);
      if (token) {
        await supabase.from("pending_users").delete().eq("token", token);
      }
      return res.redirect(`${process.env.BASE_URL}/login?error=invalid-token`);
    }

    console.log("[VERIFY] Found pending user:", pendingUser);

    // 2. 토큰 만료 확인
    if (new Date(pendingUser.expires_at) < new Date()) {
      await supabase
        .from("pending_users")
        .delete()
        .eq("email", pendingUser.email);
      return res.redirect(`${process.env.BASE_URL}/login?error=expired-token`);
    }

    // 3. 기존 유저 및 프로필 삭제
    try {
      const { data: existingUsers, error: listError } =
        await supabase.auth.admin.listUsers({ email: pendingUser.email });

      if (listError) throw new Error(`listUsers error: ${listError.message}`);

      if (existingUsers.length > 0) {
        const userId = existingUsers[0].id;
        console.log("[VERIFY] Deleting existing auth user:", userId);
        await supabase.auth.admin.deleteUser(userId);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", pendingUser.email)
          .single();

        if (profile && !profileError) {
          await supabase.from("profiles").delete().eq("id", profile.id);
          console.log("[VERIFY] Deleted existing profile:", profile.id);
        }
      }
    } catch (cleanupError) {
      console.error("[VERIFY] Error during cleanup:", cleanupError);
      return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
    }

    // 4. 인증 유저 생성
    let authUserId = null;

    try {
      // Supabase Admin API로 사용자 생성
      const { data, error: createError } = await supabase.auth.admin.createUser(
        {
          email: pendingUser.email,
          password: pendingUser.password,
          email_confirm: true,
        }
      );

      console.log(
        "[VERIFY] Auth user creation response:",
        JSON.stringify(data, null, 2)
      );

      if (createError) {
        console.error("[VERIFY] Error creating user:", createError);
        return res.redirect(
          `${process.env.BASE_URL}/login?error=auth-create-fail`
        );
      }

      // Supabase 문서에 따라 사용자 ID 추출
      if (data && data.user && data.user.id) {
        authUserId = data.user.id;
        console.log("[VERIFY] Found ID in data.user.id:", authUserId);
      } else if (data && data.id) {
        authUserId = data.id;
        console.log("[VERIFY] Found ID directly in data:", authUserId);
      } else {
        console.error("[VERIFY] User creation succeeded but no ID returned");
        console.log(
          "[VERIFY] Auth response structure:",
          Object.keys(data || {})
        );
        return res.redirect(
          `${process.env.BASE_URL}/login?error=auth-create-fail`
        );
      }
    } catch (authError) {
      console.error("[VERIFY] Auth creation exception:", authError);
      return res.redirect(
        `${process.env.BASE_URL}/login?error=auth-create-fail`
      );
    }

    if (!authUserId) {
      console.error("[VERIFY] Failed to extract user ID");
      return res.redirect(
        `${process.env.BASE_URL}/login?error=auth-create-fail`
      );
    }

    console.log("[VERIFY] Extracted Auth User ID:", authUserId);

    // 5. 프로필 저장
    const profileData = {
      id: authUserId,
      email: pendingUser.email,
      name: pendingUser.name,
      password: pendingUser.password,
      nickname: pendingUser.nickname,
      created_at: new Date().toISOString(),
    };

    console.log("[VERIFY] Inserting profile:", profileData);

    const { error: insertError } = await supabase
      .from("profiles")
      .upsert(profileData);

    if (insertError) {
      console.error("[VERIFY] Profile insert failed:", insertError);

      // 프로필 저장 실패 시 생성된 Auth 사용자 삭제
      try {
        console.log(
          "[VERIFY] Deleting auth user due to profile insert failure:",
          authUserId
        );
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          authUserId
        );
        if (deleteError) {
          console.error(
            "[VERIFY] Failed to delete auth user after profile failure:",
            deleteError
          );
        }
      } catch (deleteError) {
        console.error("[VERIFY] Exception deleting auth user:", deleteError);
      }

      return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
    }

    // 6. 성공 처리 및 pending_users 삭제
    await supabase
      .from("pending_users")
      .delete()
      .eq("email", pendingUser.email);
    console.log("[VERIFY] User successfully verified and registered");

    return res.redirect(`${process.env.BASE_URL}/login?success=true`);
  } catch (error) {
    console.error("[VERIFY] Unexpected error:", error);
    return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
  }
}
