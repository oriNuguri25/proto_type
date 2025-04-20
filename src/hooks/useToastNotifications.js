import { useEffect } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * 세션 스토리지에서 상태 메시지를 읽어 토스트 알림을 표시하는 커스텀 훅
 */
export const useToastNotifications = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL 파라미터 체크 (이전 방식)
    const params = new URLSearchParams(location.search);

    // 기본 토스트 스타일
    const toastOptions = {
      duration: 3000,
      position: "bottom-right",
      style: {
        fontSize: "1.1rem",
        padding: "16px",
        fontWeight: "500",
      },
      className: "custom-toast",
    };

    // 1. 상품 등록 성공 메시지 표시
    const productRegistered = sessionStorage.getItem("productRegistered");
    if (productRegistered === "true") {
      toast.success("Sản phẩm đã được đăng thành công.", toastOptions);

      // 표시 후 상태 제거
      sessionStorage.removeItem("productRegistered");
    }

    // 2. 상품 수정 성공 메시지 표시
    const productUpdated = sessionStorage.getItem("productUpdated");
    if (productUpdated === "true") {
      toast.success("Sản phẩm đã được cập nhật thành công.", toastOptions);

      // 표시 후 상태 제거
      sessionStorage.removeItem("productUpdated");
    }

    // 3. URL 파라미터로 접근한 경우(이전 코드 호환성) URL 클리닝
    if (params.get("status") === "success") {
      // URL 파라미터 제거하여 clean URL로 변경
      navigate("/", { replace: true });
    }
  }, [location, navigate]);
};
