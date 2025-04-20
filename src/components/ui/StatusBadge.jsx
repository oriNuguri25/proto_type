import React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * 상품 상태를 표시하는 뱃지 컴포넌트
 * @param {string} status - 상품 상태 (available, sold, reserved)
 */
const StatusBadge = ({ status }) => {
  switch (status) {
    case "available":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          Đang bán
        </Badge>
      );
    case "reserved":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        >
          Đang đặt trước
        </Badge>
      );
    case "sold":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 hover:bg-gray-100"
        >
          Đã bán
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          Đang bán
        </Badge>
      );
  }
};

export default StatusBadge;
