import React from "react";
import { Button } from "@/components/ui/button";

const FormActionButtons = ({
  isSubmitting,
  cancelUrl,
  onCancel,
  submitLabel = "저장",
  loadingLabel = "처리 중...",
}) => {
  return (
    <div className="flex gap-3">
      <Button
        type="submit"
        className="flex-1 btn-primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? loadingLabel : submitLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={onCancel}
      >
        Hủy
      </Button>
    </div>
  );
};

export default FormActionButtons;
