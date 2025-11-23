'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productsApi } from '@/lib/api/products';
import { uploadApi } from '@/lib/api/upload';
import { ProductCategory } from '@/types';
import type { Product } from '@/types';

const productSchema = z.object({
  title: z.string().min(2, '제목은 최소 2자 이상이어야 합니다').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다'),
  price: z.number().min(0, '가격은 0원 이상이어야 합니다').max(2147483647, '가격은 2,147,483,647원 이하여야 합니다'),
  category: z.nativeEnum(ProductCategory),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

const STORAGE_KEY = 'product_form_draft';

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialData?.images.map((img) => img.url) || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      price: initialData.price,
      category: initialData.category,
    } : undefined,
  });

  // localStorage에서 임시 저장 데이터 복원 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (!isEdit && !initialData) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.title) setValue('title', data.title);
          if (data.description) setValue('description', data.description);
          if (data.price !== undefined) setValue('price', data.price);
          if (data.category) setValue('category', data.category);
        } catch (e) {
          console.error('Failed to restore draft:', e);
        }
      }
    }
  }, [isEdit, initialData, setValue]);

  // 폼 데이터 자동 저장 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (isEdit || initialData) return;

    const subscription = watch((data) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });

    return () => subscription.unsubscribe();
  }, [watch, isEdit, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 5) {
      setError('이미지는 최대 5개까지 업로드할 수 있습니다.');
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0 && !isEdit) {
      setError('최소 1개의 이미지를 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let uploadedImages: { url: string; key: string; order: number; is_primary: boolean }[] = [];

      if (images.length > 0) {
        setUploadingImages(true);
        uploadedImages = await Promise.all(
          images.map(async (file, index) => {
            const result = await uploadApi.uploadImage(file);
            return {
              url: result.publicUrl,
              key: result.key,
              order: index,
              is_primary: index === 0,
            };
          })
        );
        setUploadingImages(false);
      }

      const productData = {
        ...data,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      };

      if (isEdit && initialData) {
        await productsApi.updateProduct(initialData.id, productData);
        router.push(`/products/${initialData.id}`);
      } else {
        const newProduct = await productsApi.createProduct({
          ...productData,
          images: uploadedImages,
        });
        // 등록 성공 시 임시 저장 데이터 삭제
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/products/${newProduct.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '상품 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">{isEdit ? '상품 수정' : '상품 등록'}</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            제목 *
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="상품 제목을 입력하세요"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 *
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">카테고리 선택</option>
            {Object.values(ProductCategory).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            가격 *
          </label>
          <input
            id="price"
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            설명 *
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="상품 설명을 입력하세요"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이미지 * (최대 5개)
          </label>

          <div className="grid grid-cols-5 gap-4 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-1">
                    대표
                  </span>
                )}
              </div>
            ))}
          </div>

          {images.length < 5 && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading || uploadingImages}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploadingImages
              ? '이미지 업로드 중...'
              : isLoading
              ? isEdit ? '수정 중...' : '등록 중...'
              : isEdit ? '상품 수정' : '상품 등록'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </form>
  );
}
