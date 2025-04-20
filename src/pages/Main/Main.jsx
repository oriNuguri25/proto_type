import React, { useEffect } from "react";
import MainLayout from "../../components/MainLayout";
import HeroSection from "./HeroSection";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

// 토스트 스타일 정의
const toastStyle = {
  "--toast-font-size": "1rem",
  "--toast-padding": "16px",
  "--toast-width": "400px",
  "--toast-border-radius": "8px",
};

const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 파라미터 체크 (이전 방식)
    const params = new URLSearchParams(location.search);

    // 1. sessionStorage에서 상품 등록 상태 확인
    const productRegistered = sessionStorage.getItem("productRegistered");

    // 2. 상태가 있다면 토스트 표시 후 상태 제거
    if (productRegistered === "true") {
      toast.success("Sản phẩm đã được đăng thành công.", {
        duration: 3000,
        position: "bottom-right",
        style: {
          fontSize: "1.1rem",
          padding: "16px",
          fontWeight: "500",
        },
        className: "custom-toast",
      });

      // 표시 후 상태 제거
      sessionStorage.removeItem("productRegistered");
    }

    // 3. URL 파라미터로 접근한 경우(이전 코드 호환성) URL 클리닝
    if (params.get("status") === "success") {
      // URL 파라미터 제거하여 clean URL로 변경
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return (
    <MainLayout>
      <HeroSection />

      {/* Sonner Toaster - 커스텀 스타일 적용 */}
      <Toaster richColors className="toaster-large" style={toastStyle} />

      {/* 토스트 스타일 정의 */}
      <style jsx global>{`
        .custom-toast {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        /* 토스트 컨테이너에 대한 스타일 */
        [data-sonner-toaster] {
          --offset: 1.5rem;
          --width: 400px;
          --height: auto;
        }

        /* 토스트 아이콘 크기 조정 */
        [data-sonner-toast] [data-icon] {
          transform: scale(1.2);
        }
      `}</style>
    </MainLayout>
  );
};

export default Main;
