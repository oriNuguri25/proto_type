import React from "react";

const LoadingView = ({ message = "데이터를 불러오는 중..." }) => {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="text-center py-12">
        <div className="text-xl text-gray-500 font-medium">{message}</div>
      </div>
    </main>
  );
};

export default LoadingView;
