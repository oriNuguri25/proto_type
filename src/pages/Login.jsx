import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

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

  const handleSubmit = async () => {
    if (isLoading) return; // 이미 처리 중이면 중복 요청 방지

    try {
      setIsLoading(true); // 로딩 시작
      // 초기화
      setFormErrors({ email: "", password: "" });
      setSuccessMessage("");

      // 이메일 형식 검사
      if (!formData.email.endsWith("@gachon.ac.kr")) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Vui lòng kiểm tra email của bạn.",
        }));
        return;
      }

      // profiles 테이블에서 이메일 확인
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("password")
        .eq("email", formData.email)
        .maybeSingle();

      if (profileError) {
        console.error("프로필 조회 중 오류:", profileError);
        setFormErrors((prev) => ({
          ...prev,
          email: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        }));
        return;
      }

      // 이메일이 존재하지 않는 경우
      if (!profileData) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Email không tồn tại.",
        }));
        return;
      }

      // 비밀번호 확인 (bcrypt compare 사용)
      const isPasswordValid = await bcrypt.compare(
        formData.password,
        profileData.password
      );

      if (!isPasswordValid) {
        setFormErrors((prev) => ({
          ...prev,
          password: "Mật khẩu không chính xác.",
        }));
        return;
      }

      // 로그인 성공 후 토큰 발급 요청
      const API_URL = import.meta.env.DEV
        ? "/api/login-token"
        : `${import.meta.env.VITE_BASE_URL}/api/login-token`;

      const tokenRes = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!tokenRes.ok) {
        throw new Error(`HTTP error! status: ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json();

      if (tokenData.token) {
        localStorage.setItem("token", tokenData.token);
        setSuccessMessage("✅ Đăng nhập thành công!");
        navigate("/main", { replace: true });
      } else {
        throw new Error("토큰 발급 실패");
      }
    } catch (err) {
      console.error("로그인 중 오류:", err);
      setFormErrors({
        email: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        password: "",
      });
    } finally {
      setIsLoading(false); // 로딩 종료
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
