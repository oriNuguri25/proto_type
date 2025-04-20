import React from "react";
import MainLayout from "../../components/MainLayout";
import HeroSection from "./HeroSection";
import { Toaster } from "sonner";
import { useToastNotifications } from "../../hooks/useToastNotifications";
import "../../App.css";

const Main = () => {
  // 토스트 알림 기능 사용
  useToastNotifications();

  return (
    <MainLayout>
      <HeroSection />

      {/* Sonner Toaster 컴포넌트 */}
      <Toaster richColors className="toaster-large" />
    </MainLayout>
  );
};

export default Main;
