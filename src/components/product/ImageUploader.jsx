import React from "react";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

const ImageUploader = ({
  fileInputRef,
  imagePreviewUrls,
  handleRemoveImage,
  onFileSelect,
  formSubmitted,
  imageError,
}) => {
  return (
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
        Bạn có thể tải lên tối đa 5 ảnh. Ảnh đầu tiên sẽ được dùng làm ảnh đại
        diện.
      </p>
      {formSubmitted && imageError && (
        <p className="mt-1 text-xs text-red-500">{imageError}</p>
      )}
    </div>
  );
};

export default ImageUploader;
