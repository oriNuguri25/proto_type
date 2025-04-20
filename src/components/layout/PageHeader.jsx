import React from "react";

const PageHeader = ({ title, description, children }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {children}
    </div>
  );
};

export default PageHeader;
