import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";
import { useImageUpload } from "../Register/hooks/useImageUpload";
import { useProductEdit } from "./hooks/useProductEdit";
import { useNavigate } from "react-router-dom";

const EditForm = ({ productId }) => {
  const navigate = useNavigate();
  const [initialImageUrls, setInitialImageUrls] = useState([]);

  // 이미지 업로드 관련 기능 가져오기
  const {
    fileInputRef,
    imageFiles,
    imagePreviewUrls,
    imageError,
    handleFileSelect,
    handleRemoveImage,
    uploadImages,
    validateImages,
    setImagePreviewUrls, // 초기 이미지 설정용
  } = useImageUpload();

  // 상품 수정 관련 기능 가져오기
  const {
    product,
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    formSubmitted,
    error,
    setError,
    updateProduct,
  } = useProductEdit(productId, uploadImages, validateImages);

  // 상품 정보가 로드되면 이미지 미리보기 설정
  useEffect(() => {
    if (product && product.image_urls && product.image_urls.length > 0) {
      setInitialImageUrls(product.image_urls);
      setImagePreviewUrls(product.image_urls);
    }
  }, [product, setImagePreviewUrls]);

  // 가격 입력 처리 함수
  const handlePriceChange = (e) => {
    // 숫자와 쉼표만 허용
    const value = e.target.value.replace(/[^\d]/g, "");

    // 숫자가 없는 경우 빈 문자열 설정
    if (!value) {
      setFormData({ ...formData, price: "" });
      return;
    }

    // utils의 formatNumber 함수 사용
    setFormData({ ...formData, price: formatNumber(Number(value)) });
  };

  // 일반 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // 상태 변경 처리
  const handleStatusChange = (value) => {
    setFormData({ ...formData, status: value });
  };

  // 파일 선택 이벤트 처리 래퍼
  const onFileSelect = (e) => {
    handleFileSelect(e, formSubmitted, setError);
  };

  // 폼 제출 이벤트 처리 래퍼
  const onSubmit = async (e) => {
    // 이미지가 변경되지 않았으면 기존 이미지 URLs 사용
    const useExistingImages =
      imageFiles.length === 0 && initialImageUrls.length > 0;
    const imageUrls = useExistingImages ? initialImageUrls : null;

    const success = await updateProduct(e, formData, imageUrls);

    if (success) {
      // 수정 성공 시 메인 페이지로 이동하고 뒤로가기 방지
      sessionStorage.setItem("productUpdated", "true");
      navigate("/", { replace: true }); // replace: true로 설정하여 히스토리를 대체함으로써 뒤로가기 방지
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="text-sm text-gray-500">
              Đang tải thông tin sản phẩm...
            </p>
          </div>
          <div className="flex justify-center py-8">
            <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !formSubmitted) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="text-sm text-gray-500">
              Đã xảy ra lỗi khi tải thông tin sản phẩm.
            </p>
          </div>
          <div className="rounded-lg border bg-red-50 p-6 shadow-sm">
            <p className="text-red-500">{error}</p>
            <Button className="mt-4" onClick={() => navigate("/products/my")}>
              Quay lại trang quản lý sản phẩm
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Chỉnh sửa sản phẩm
          </h1>
          <p className="text-sm text-gray-500">
            Cập nhật thông tin sản phẩm của bạn.
          </p>
        </div>

        {error && formSubmitted && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
            {error}
          </div>
        )}

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* 상품 사진 업로드 */}
            <div className="space-y-2">
              <Label htmlFor="image_urls">Hình ảnh sản phẩm</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {/* 이미지 미리보기 */}
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`상품 이미지 ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* 이미지 추가 버튼 */}
                {imagePreviewUrls.length < 5 && (
                  <div
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mb-1 h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500">Thêm ảnh</span>
                    <input
                      type="file"
                      id="image_urls"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={onFileSelect}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Bạn có thể tải lên tối đa 5 ảnh. Ảnh đầu tiên sẽ được dùng làm
                ảnh đại diện.
              </p>
              {formSubmitted && imageError && (
                <p className="mt-1 text-xs text-red-500">{imageError}</p>
              )}
            </div>

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
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
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

            {/* 수정 및 취소 버튼 */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý…" : "Cập nhật sản phẩm"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/products/${productId}`)}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditForm;
