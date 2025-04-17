import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignUpWait = () => {
  const navigate = useNavigate();

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
        <div className="rounded-lg border bg-white p-8 shadow-sm text-center">
          <h2 className="text-2xl font-semibold mb-4">이메일을 확인해주세요</h2>
          <p className="text-gray-600 mb-6">
            입력하신 이메일 주소로 인증 링크를 발송했습니다.
            <br />
            이메일을 확인하고 링크를 클릭하여 회원가입을 완료해주세요.
          </p>
          <div className="text-sm text-gray-500">
            이메일이 도착하지 않았나요?
            <br />
            스팸 메일함을 확인해주세요.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpWait;
