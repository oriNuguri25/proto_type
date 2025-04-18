import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=minimal",
      },
    },
  }
);

export const useValidation = () => {
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  const checkEmailExists = async (email) => {
    console.log("이메일 중복 체크 시작:", email);
    try {
      // profiles 테이블 확인
      const { data: profileUser, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      console.log("profiles 조회 결과:", { profileUser, profileError });

      if (profileError) {
        console.error("profiles 체크 중 오류:", profileError);
        return false;
      }

      if (profileUser) {
        console.log("profiles에서 중복된 이메일 발견");
        setEmailError("Email này đã được đăng ký.");
        return true;
      }

      console.log("사용 가능한 이메일");
      setEmailError("");
      return false;
    } catch (err) {
      console.error("이메일 체크 중 예외 발생:", err);
      return false;
    }
  };

  const checkNicknameExists = async (nickname) => {
    console.log("닉네임 중복 체크 시작:", nickname);
    try {
      // profiles 테이블 확인
      const { data: profileUser, error: profileError } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("nickname", nickname)
        .maybeSingle();

      console.log("profiles 닉네임 조회 결과:", { profileUser, profileError });

      if (profileError) {
        console.error("profiles 닉네임 체크 중 오류:", profileError);
        return false;
      }

      if (profileUser) {
        console.log("profiles에서 중복된 닉네임 발견");
        setNicknameError("Biệt danh này đã được sử dụng.");
        return true;
      }

      console.log("사용 가능한 닉네임");
      setNicknameError("");
      return false;
    } catch (err) {
      console.error("닉네임 체크 중 예외 발생:", err);
      return false;
    }
  };

  const clearEmailError = () => setEmailError("");
  const clearNicknameError = () => setNicknameError("");

  return {
    emailError,
    nicknameError,
    checkEmailExists,
    checkNicknameExists,
    clearEmailError,
    clearNicknameError,
    setEmailError,
  };
};
