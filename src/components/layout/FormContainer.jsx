import React from "react";

const FormContainer = ({ children, error }) => {
  return (
    <div className="mx-auto max-w-2xl">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
          {error}
        </div>
      )}
      <div className="rounded-lg border bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
};

export default FormContainer;
