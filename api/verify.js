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
  console.log("Received token:", token);

  try {
    // pending_users에서 사용자 정보 조회
    console.log("Fetching user from pending_users...");
    const { data: pendingUser, error: fetchError } = await supabase
      .from("pending_users")
      .select("*")
      .eq("token", token)
      .single();

    if (!pendingUser || fetchError) {
      console.error("Error fetching user from pending_users:", fetchError);
      console.log("User data:", pendingUser);

      // 토큰이 유효하지 않은 경우 해당 토큰의 데이터 삭제
      if (token) {
        console.log("Deleting invalid token data...");
        await supabase.from("pending_users").delete().eq("token", token);
      }

      return res.redirect(`${process.env.BASE_URL}/login?error=invalid-token`);
    }

    console.log("Found pending user:", {
      email: pendingUser.email,
      name: pendingUser.name,
      nickname: pendingUser.nickname,
      expires_at: pendingUser.expires_at,
    });

    // 토큰 만료 확인
    if (new Date(pendingUser.expires_at) < new Date()) {
      console.log("Token expired at:", pendingUser.expires_at);

      // 만료된 토큰의 데이터 삭제
      console.log("Deleting expired token data...");
      await supabase
        .from("pending_users")
        .delete()
        .eq("email", pendingUser.email);

      return res.redirect(`${process.env.BASE_URL}/login?error=expired-token`);
    }

    // 이메일 중복 체크 - 직접 Auth API 호출
    console.log("Checking if email exists in auth.users...");
    try {
      // 직접 Auth API 호출로 이메일 존재 여부 확인
      const authApiUrl = `${
        process.env.SUPABASE_URL
      }/auth/v1/admin/users?email=${encodeURIComponent(pendingUser.email)}`;
      const authResponse = await fetch(authApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });

      console.log("Auth API request URL:", authApiUrl);

      if (!authResponse.ok) {
        throw new Error(
          `Auth API error: ${authResponse.status} ${authResponse.statusText}`
        );
      }

      const authData = await authResponse.json();
      console.log("Auth API response:", authData);

      const existingUser = authData?.users?.find(
        (u) => u.email === pendingUser.email
      );

      if (existingUser) {
        console.log("Email already exists in auth.users:", pendingUser.email);
        return res.redirect(`${process.env.BASE_URL}/login?error=email-exists`);
      }
    } catch (error) {
      console.error("Error during email check:", error);
      return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
    }

    // Auth 사용자 생성 - 직접 REST API 호출
    console.log("Creating auth user...");
    try {
      const createUserUrl = `${process.env.SUPABASE_URL}/auth/v1/admin/users`;
      console.log("Auth API create URL:", createUserUrl);

      const createUserResponse = await fetch(createUserUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: pendingUser.email,
          password: pendingUser.password,
          email_confirm: true,
        }),
      });

      if (!createUserResponse.ok) {
        const errorText = await createUserResponse.text();
        throw new Error(
          `Auth creation error: ${createUserResponse.status} ${createUserResponse.statusText} - ${errorText}`
        );
      }

      const createUserData = await createUserResponse.json();
      console.log(
        "Auth user creation complete. Response data:",
        JSON.stringify(createUserData, null, 2)
      );
      console.log("User object:", createUserData.user);
      console.log("User ID from response:", createUserData.user?.id);

      const authUserId = createUserData.user?.id;
      if (!authUserId) {
        throw new Error("Auth user created but no ID returned");
      }

      // profiles 테이블에 사용자 정보 저장
      console.log("Inserting user into profiles table with ID:", authUserId);

      // 디버깅을 위해 upsert 데이터 출력
      const profileData = {
        id: authUserId,
        email: pendingUser.email,
        name: pendingUser.name,
        password: pendingUser.password,
        nickname: pendingUser.nickname,
        created_at: new Date().toISOString(),
      };
      console.log(
        "Profile data to insert:",
        JSON.stringify(profileData, null, 2)
      );

      const { data: upsertData, error: insertError } = await supabase
        .from("profiles")
        .upsert(profileData)
        .select();

      if (insertError) {
        console.error("Error inserting into profiles:", insertError);
        console.error("Insert error details:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });

        // Auth 사용자 삭제 시도 - 직접 REST API 호출
        try {
          const deleteUserUrl = `${process.env.SUPABASE_URL}/auth/v1/admin/users/${authUserId}`;
          console.log("Attempting to delete auth user at URL:", deleteUserUrl);

          const deleteResponse = await fetch(deleteUserUrl, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          });

          if (deleteResponse.ok) {
            console.log(
              "Successfully deleted auth user after profile insertion failure"
            );
          } else {
            console.error(
              "Failed to delete auth user:",
              deleteResponse.status,
              deleteResponse.statusText
            );
          }
        } catch (deleteError) {
          console.error("Error deleting auth user:", deleteError);
        }
        return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
      }

      console.log("Successfully created profile for user:", pendingUser.email);
      console.log("Upsert result:", upsertData);

      // pending_users에서 데이터 삭제
      console.log("Deleting from pending_users...");
      await supabase
        .from("pending_users")
        .delete()
        .eq("email", pendingUser.email);

      // 성공 리다이렉션
      return res.redirect(`${process.env.BASE_URL}/login?success=true`);
    } catch (error) {
      console.error("Auth creation error:", error);
      return res.redirect(
        `${process.env.BASE_URL}/login?error=auth-create-fail`
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.redirect(`${process.env.BASE_URL}/login?error=server-error`);
  }
}
