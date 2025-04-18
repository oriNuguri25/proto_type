import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const SignUpWait = () => {
  const location = useLocation();
  const userEmail = location.state?.email || "Email bạn đã nhập";

  useEffect(() => {
    // 뒤로가기 방지
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function (event) {
      window.history.pushState(null, "", window.location.href);
    };

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.onpopstate = null;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">
            Jeogi
          </h1>
          <p className="text-sm text-muted-foreground">
            Nền tảng mua bán dành cho du học sinh Việt Nam
          </p>
        </div>

        <Card className="overflow-hidden py-0">
          <div className="bg-blue-50 p-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-800">
              Vui lòng kiểm tra email trường học của bạn
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <p className="text-center text-gray-700">
                Chúng tôi đã gửi email xác minh đến địa chỉ
                <span className="font-medium text-blue-600">
                  {" "}
                  {userEmail}
                </span>{" "}
                Vui lòng nhấp vào liên kết trong email để hoàn tất xác thực tài
                khoản của bạn.
              </p>

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p>
                  Email xác minh có thể mất đến 5 phút để đến. Vui lòng kiểm tra
                  cả hộp thư rác của bạn nữa nhé.
                </p>
              </div>

              <Link
                to={`/login?verification_sent=${encodeURIComponent(userEmail)}`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Quay lại trang đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUpWait;
