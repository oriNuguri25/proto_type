import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { formatNumber } from "@/lib/utils";
import { useImageUpload } from "./hooks/useImageUpload";
import { useProductSubmit } from "./hooks/useProductSubmit";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    price: "",
    purchase_link: "",
  });

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
  } = useImageUpload();

  // 상품 등록 관련 기능 가져오기
  const {
    isSubmitting,
    formSubmitted,
    error,
    setError,
    handleSubmit: submitProduct,
  } = useProductSubmit(uploadImages, validateImages);

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

  // 파일 선택 이벤트 처리 래퍼
  const onFileSelect = (e) => {
    handleFileSelect(e, formSubmitted, setError);
  };

  // 폼 제출 이벤트 처리 래퍼
  const onSubmit = async (e) => {
    e.preventDefault();
    const success = await submitProduct(e, formData);

    if (success) {
      // URL 파라미터 대신 sessionStorage 사용
      sessionStorage.setItem("productRegistered", "true");
      navigate("/", { replace: true });
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Đăng sản phẩm</h1>
          <p className="text-sm text-gray-500">
            Vui lòng nhập thông tin sản phẩm bạn muốn bán.
          </p>
        </div>

        {error && (
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

            {/* 등록 버튼 */}
            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý…" : "Đăng sản phẩm"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegisterForm;
