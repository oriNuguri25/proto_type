import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = ({ children, navigate }) => {
  return (
    <div className="min-h-screen gradient-bg pb-10">
      <Header navigate={navigate} />
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
