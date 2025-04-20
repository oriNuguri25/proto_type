import React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";

/**
 * 비밀번호 입력 컴포넌트 (보기/숨기기 토글 포함)
 */
const PasswordInput = ({
  id,
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}) => {
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
        {...props}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={togglePasswordVisibility}
        tabIndex="-1"
        aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export { PasswordInput };
