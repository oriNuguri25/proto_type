import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

// 삭제 확인 모달 컴포넌트
export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center">
          <AlertCircle className="mr-2 h-6 w-6 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">제품 삭제</h3>
        </div>
        <div className="mb-5">
          <p className="text-gray-600">
            정말로 <span className="font-semibold">{productName}</span> 제품을
            삭제하시겠습니까?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};
