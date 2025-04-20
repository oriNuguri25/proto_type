import { useState } from "react";

/**
 * 비밀번호 표시/숨김 상태를 관리하는 커스텀 훅
 * @returns {Object} showPassword, togglePasswordVisibility 반환
 */
export const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    showPassword,
    togglePasswordVisibility,
  };
};
