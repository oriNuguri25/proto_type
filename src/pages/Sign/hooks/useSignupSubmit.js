import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 회원가입 제출 로직을 처리하는 커스텀 훅
 * @param {Function} checkEmailExists 이메일 중복 검사 함수
 * @param {Function} checkNicknameExists 닉네임 중복 검사 함수
 * @returns {Object} 회원가입 관련 상태와 함수들
 */
export const useSignupSubmit = (checkEmailExists, checkNicknameExists) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // 필드 입력 시 관련 에러 메시지 초기화
    if (id === "email") {
      setEmailError("");
    }
    if (id === "nickname") {
      setNicknameError("");
    }
    // 다른 필드 입력 시 일반 에러 초기화
    if (["password", "passwordConfirm", "name"].includes(id)) {
      setError("");
    }
  };

  // 회원가입 제출 핸들러
  const handleSubmit = async () => {
    // 상태 초기화
    setError("");
    setEmailError("");
    setNicknameError("");
    setIsSubmitting(true);

    console.log("회원가입 시도:", formData);

    try {
      // 기본적인 유효성 검사
      if (
        !formData.email ||
        !formData.name ||
        !formData.password ||
        !formData.passwordConfirm ||
        !formData.nickname
      ) {
        setError("Vui lòng điền vào tất cả các trường.");
        return;
      }

      // 이메일 도메인 검사
      if (!formData.email.endsWith("@gachon.ac.kr")) {
        setEmailError(
          "Chỉ có thể sử dụng email của Đại học Gachon (@gachon.ac.kr)."
        );
        // 이메일 필드 초기화
        setFormData((prev) => ({ ...prev, email: "" }));
        return;
      }

      // 비밀번호 길이 검사
      if (formData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }

      // 비밀번호 일치 검사
      if (formData.password !== formData.passwordConfirm) {
        setError("Mật khẩu không khớp.");
        return;
      }

      // 이메일 중복 체크
      console.log("이메일 중복 체크");
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setEmailError(
          "Email này đã được sử dụng. Vui lòng sử dụng email khác."
        );
        // 이메일 필드 초기화
        setFormData((prev) => ({ ...prev, email: "" }));
        return;
      }

      // 닉네임 중복 체크
      console.log("닉네임 중복 체크");
      const nicknameExists = await checkNicknameExists(formData.nickname);
      if (nicknameExists) {
        setNicknameError(
          "Biệt danh này đã được sử dụng. Vui lòng chọn biệt danh khác."
        );
        // 닉네임 필드 초기화
        setFormData((prev) => ({ ...prev, nickname: "" }));
        return;
      }

      // API 호출 로직
      const response = await fetch("https://jeogi.vercel.app/api/send-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          nickname: formData.nickname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Đã xảy ra lỗi trong quá trình đăng ký."
        );
      }

      console.log("회원가입 요청 성공:", data);

      // 회원가입 대기 페이지로 이동 (이메일 정보 포함)
      navigate("/signup/wait", {
        replace: true,
        state: { email: formData.email },
      });
    } catch (err) {
      setError(err.message);
      console.error("회원가입 에러:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error,
    emailError,
    nicknameError,
    handleChange,
    handleSubmit,
    setFormData,
  };
};
