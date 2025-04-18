import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const Login = () => {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({ email: "", password: "" });
    setSuccessMessage("");

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
      navigate(`/main?${token}`, { replace: true });
      setSuccessMessage("로그인 성공!");
    } catch (error) {
      console.error("로그인 중 오류:", error);
      setFormErrors({
        email: error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        password: "",
      });
    }
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

          {successMessage && (
            <div className="mb-4 text-sm text-center text-green-600">
              {successMessage}
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
              className="w-full btn-primary"
              onClick={handleSubmit}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
