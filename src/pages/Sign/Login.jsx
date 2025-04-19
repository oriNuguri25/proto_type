import React from "react";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLoginSubmit } from "./hooks/useLoginSubmit";

const Login = () => {
  const {
    formData,
    isLoading,
    successMessage,
    formErrors,
    handleChange,
    handleSubmit,
  } = useLoginSubmit();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-bg p-4">
      {/* title and subtitle */}
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">
            Jeogi
          </h1>
          <p className="text-sm text-muted-foreground">
            Nền tảng mua bán dành cho du học sinh Việt Nam
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-center text-xl font-semibold">Đăng nhập</h2>

          {successMessage && (
            <div className="mb-4 text-sm text-center text-green-600">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@gachon.ac.kr"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Bạn chưa có tài khoản?
              </span>
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:underline ml-2"
              >
                Đăng ký
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
