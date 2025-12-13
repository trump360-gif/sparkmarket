// ================================
// Types & Interfaces
// ================================

interface ProductFormImagesProps {
  images: File[];
  imagePreviews: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  isEdit?: boolean;
}

// ================================
// Component
// ================================

import { Image as ImageIcon, X } from 'lucide-react';

export default function ProductFormImages({
  images,
  imagePreviews,
  onImageChange,
  onRemoveImage,
  isEdit = false,
}: ProductFormImagesProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
        <ImageIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        이미지 * (최대 5개)
      </label>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {imagePreviews.map((preview, index) => (
          <div key={index} className="relative aspect-square group">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg shadow-sm"
              data-testid={`product-image-preview-${index}`}
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-md transition-all opacity-0 group-hover:opacity-100"
              data-testid={`remove-image-${index}`}
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <X className="w-3 h-3" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-secondary-500 text-white text-[10px] text-center py-0.5 rounded-b-lg font-medium">
                대표
              </span>
            )}
          </div>
        ))}
      </div>

      {images.length < 5 && (
        <label
          className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
          data-testid="image-upload-area"
        >
          <div className="flex flex-col items-center justify-center py-4">
            <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-1.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400">클릭하여 이미지 업로드</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">PNG, JPG, GIF (최대 5개)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageChange}
            className="hidden"
            data-testid="image-upload-input"
            aria-label="상품 이미지 업로드"
          />
        </label>
      )}
    </div>
  );
}
