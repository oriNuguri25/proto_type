import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SignUpFail = () => {
  const navigate = useNavigate();

  // 뒤로가기 방지
  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, []);

  const preventBack = () => {
    window.history.pushState(null, "", window.location.pathname);
  };

  const handleLoginClick = () => {
    navigate("/login?verification=false", { replace: true }); // replace: true로 설정하여 뒤로가기 방지
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-lg border bg-white p-8 shadow-sm text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Liên kết đã hết hạn.
          </h2>
          <Button
            className="w-full btn-primary text-lg py-6"
            onClick={handleLoginClick}
          >
            Quay lại màn hình đăng nhập
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignUpFail;
