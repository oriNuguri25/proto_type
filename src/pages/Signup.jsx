import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Signup = () => {
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email trường học</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@gachon.ac.kr"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  className="whitespace-nowrap border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Nhận mã
                  <br /> xác minh
                </Button>
              </div>
            </div>

            {/* 인증번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="verification-code">Mã xác minh</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Nhập mã 6 số"
              />
            </div>

            {/* 이름 입력 */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên</Label>
              <Input id="name" type="text" placeholder="Nhập tên" />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirm">Xác nhận mật khẩu</Label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="Vui lòng nhập lại mật khẩu"
              />
            </div>

            {/* 닉네임 입력 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">Biệt danh</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Vui lòng nhập biệt danh"
              />
            </div>

            <Button className="w-full btn-primary">Hoàn thành đăng ký</Button>

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
