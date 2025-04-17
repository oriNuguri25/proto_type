import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    // 기본적인 유효성 검사
    if (
      !formData.email ||
      !formData.name ||
      !formData.password ||
      !formData.passwordConfirm ||
      !formData.nickname
    ) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    // 이메일 도메인 검사
    if (!formData.email.endsWith("@gachon.ac.kr")) {
      setError("가천대학교 이메일(@gachon.ac.kr)만 사용 가능합니다.");
      return;
    }

    // 비밀번호 길이 검사
    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6글자 이상이어야 합니다.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
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
          data.message || "회원가입 처리 중 오류가 발생했습니다."
        );
      }

      console.log("회원가입 요청 성공:", data);
      // 회원가입 대기 페이지로 이동하고 뒤로가기 방지
      navigate("/signup/wait", { replace: true });
    } catch (err) {
      setError(err.message);
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
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@gachon.ac.kr"
                  className="flex-1"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
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
                비밀번호는 최소 6글자 이상이어야 합니다.
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
                value={formData.nickname}
                onChange={handleChange}
              />
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
