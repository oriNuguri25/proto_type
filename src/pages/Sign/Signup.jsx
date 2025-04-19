import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useValidation } from "@/hooks/useValidation";
import { useSignupSubmit } from "./hooks/useSignupSubmit";

const Signup = () => {
  const { checkEmailExists, checkNicknameExists } = useValidation();
  const {
    formData,
    isSubmitting,
    error,
    emailError,
    nicknameError,
    handleChange,
    handleSubmit,
  } = useSignupSubmit(checkEmailExists, checkNicknameExists);

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

            <Button
              className="w-full btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng ký..." : "Hoàn thành đăng ký"}
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
