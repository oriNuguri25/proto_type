import React from "react";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
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

          {/* login form */}
          <form className="w-full">
            <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@gachon.ac.kr"
                  required
                />
              </div>

              {/* password input */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" required />
              </div>

              <Button type="submit" variant="default">
                Đăng nhập
              </Button>
            </div>
          </form>

          {/* signup link */}
          <div className="mt-4 text-center text-sm">
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
