import React from "react";

const ErrorView = ({
  error,
  message = "데이터를 불러오는 중 오류가 발생했습니다.",
}) => {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="text-center py-12 text-red-500">
        <div className="text-xl font-medium">{message}</div>
        {error && error.message && <p className="mt-2">{error.message}</p>}
      </div>
    </main>
  );
};

export default ErrorView;
