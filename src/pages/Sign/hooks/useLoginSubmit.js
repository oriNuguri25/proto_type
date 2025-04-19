import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { setToken } from "@/utils/auth";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * 로그인 로직을 처리하는 커스텀 훅
 * @returns {Object} 로그인 관련 상태와 함수들
 */
export const useLoginSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 이전 위치 정보 가져오기
  const from = location.state?.from || "/";

  // URL 파라미터에서 성공/에러 메시지 확인
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      setSuccessMessage("✅ Đăng ký thành công! Vui lòng đăng nhập.");
    } else if (error) {
      const errorMessages = {
        "invalid-token": "❌ 유효하지 않은 인증 링크입니다.",
        "expired-token": "❌ 만료된 인증 링크입니다.",
        "server-error": "❌ 서버 오류가 발생했습니다. 다시 시도해주세요.",
      };
      setFormErrors({
        email: errorMessages[error] || "❌ Đã xảy ra lỗi.",
        password: "",
      });
    }
  }, [searchParams]);

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // 입력이 변경될 때 에러 메시지 초기화
    setFormErrors((prev) => ({
      ...prev,
      [id]: "",
    }));
    setSuccessMessage("");
  };

  // 로그인 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({ email: "", password: "" });
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // 이메일 형식 검증
      if (!formData.email.endsWith("@gachon.ac.kr")) {
        setFormErrors((prev) => ({
          ...prev,
          email: "가천대학교 이메일(@gachon.ac.kr)로만 로그인이 가능합니다.",
        }));
        return;
      }

      // 프로필 조회
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", formData.email)
        .single();

      if (profileError || !profile) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        }));
        return;
      }

      // 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(
        formData.password,
        profile.password
      );
      if (!isPasswordValid) {
        setFormErrors((prev) => ({
          ...prev,
          password: "Mật khẩu không chính xác.",
        }));
        return;
      }

      // JWT 토큰 요청
      const apiUrl = import.meta.env.DEV
        ? "http://localhost:5173"
        : "https://jeogi.vercel.app";

      const response = await fetch(`${apiUrl}/api/login-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "로그인 처리 중 오류가 발생했습니다."
        );
      }

      const { token } = await response.json();

      // 토큰 저장 및 리다이렉트
      setToken(token);

      // 이전 페이지로 리다이렉트 (없으면 메인 페이지로)
      // replace: true 옵션으로 브라우저 히스토리를 대체하여 뒤로가기 방지
      navigate(from, { replace: true });
      setSuccessMessage("로그인 성공!");
    } catch (error) {
      console.error("로그인 중 오류:", error);
      setFormErrors({
        email: error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        password: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    successMessage,
    formErrors,
    handleChange,
    handleSubmit,
  };
};
