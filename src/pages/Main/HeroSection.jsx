import React from "react";
import ProductGrid from "./ProductGrid";

const HeroSection = () => {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sản phẩm mới đăng</h1>

        <ProductGrid />
      </div>
    </main>
  );
};

export default HeroSection;
