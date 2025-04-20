import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductFormFields = ({
  formData,
  handleInputChange,
  handlePriceChange,
  handleStatusChange,
}) => {
  return (
    <>
      {/* 상품명 */}
      <div className="space-y-2">
        <Label htmlFor="product_name">Tên sản phẩm</Label>
        <Input
          id="product_name"
          placeholder="Nhập tên sản phẩm"
          value={formData.product_name}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* 상품 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả sản phẩm</Label>
        <Textarea
          id="description"
          placeholder="Vui lòng nhập thông tin chi tiết như tình trạng sản phẩm, mức độ sử dụng, thời gian mua, v.v."
          rows={5}
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* 상품 가격 */}
      <div className="space-y-2">
        <Label htmlFor="price">Giá</Label>
        <div className="relative">
          <Input
            id="price"
            type="text"
            placeholder="Nhập giá sản phẩm"
            value={formData.price}
            onChange={handlePriceChange}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            VNĐ
          </div>
        </div>
      </div>

      {/* 연락 링크 */}
      <div className="space-y-2">
        <Label htmlFor="purchase_link">Liên hệ</Label>
        <Input
          id="purchase_link"
          placeholder="Vui lòng nhập thông tin liên hệ như ID KakaoTalk, liên kết Facebook Messenger, v.v."
          value={formData.purchase_link}
          onChange={handleInputChange}
          required
        />
        <p className="text-xs text-gray-500">
          Người mua có thể liên hệ với bạn qua liên kết này.
        </p>
      </div>

      {/* 상품 상태 */}
      <div className="space-y-2">
        <Label htmlFor="status">Trạng thái sản phẩm</Label>
        <Select value={formData.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Đang bán</SelectItem>
            <SelectItem value="reserved">Đang đặt trước</SelectItem>
            <SelectItem value="sold">Đã bán</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ProductFormFields;
