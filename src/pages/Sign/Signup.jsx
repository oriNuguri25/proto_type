import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useValidation } from "@/hooks/useValidation";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const { checkEmailExists, checkNicknameExists } = useValidation();

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
  };

  const handleSubmit = async () => {
    // 전체 폼 에러 초기화
    setError("");
    setEmailError("");
    setNicknameError("");

    console.log("회원가입 시도:", formData);

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

    if (formData.password !== formData.passwordConfirm) {
      setError("Mật khẩu không khớp.");
      return;
    }

    try {
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
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md space-y-8">
        {/* title and subtitle */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">
            Jeogi
          </h1>
          <p className="text-sm text-muted-foreground">
            Nền tảng mua bán dành cho du học sinh Việt Nam
          </p>
        </div>

        {/* signup form */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-center text-xl font-semibold">Đăng ký</h2>
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email trường học</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@gachon.ac.kr"
                className={`flex-1 ${emailError ? "border-red-500" : ""}`}
                value={formData.email}
                onChange={handleChange}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            {/* 이름 입력 */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nhập tên"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Mật khẩu phải có ít nhất 6 ký tự.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Xác nhận mật khẩu</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="Vui lòng nhập lại mật khẩu"
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
            </div>

            {/* 닉네임 입력 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">Biệt danh</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Vui lòng nhập biệt danh"
                className={`flex-1 ${nicknameError ? "border-red-500" : ""}`}
                value={formData.nickname}
                onChange={handleChange}
              />
              {nicknameError && (
                <p className="text-sm text-red-500 mt-1">{nicknameError}</p>
              )}
            </div>

            <Button className="w-full btn-primary" onClick={handleSubmit}>
              Hoàn thành đăng ký
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Bạn đã có tài khoản chưa?
              </span>
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:underline ml-2"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
