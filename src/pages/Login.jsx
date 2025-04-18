import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      setMessage({
        type: "success",
        text: "✅ Đăng ký thành công! Vui lòng đăng nhập.",
      });
    } else if (error) {
      const errorMessages = {
        "invalid-token": "❌ 유효하지 않은 인증 링크입니다.",
        "expired-token": "❌ 만료된 인증 링크입니다.",
        "server-error": "❌ 서버 오류가 발생했습니다. 다시 시도해주세요.",
      };
      setMessage({
        type: "error",
        text: errorMessages[error] || "❌ Đã xảy ra lỗi.",
      });
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    // 로그인 로직 구현
  };

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

          {message.text && (
            <div
              className={`mb-4 text-sm text-center ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@gachon.ac.kr"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <Button className="w-full btn-primary" onClick={handleSubmit}>
              Đăng nhập
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
