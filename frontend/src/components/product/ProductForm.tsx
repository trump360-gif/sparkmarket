'use client';

// ================================
// Types & Interfaces
// ================================

import { z } from 'zod';
import { ProductCategory, type ProductCondition, type TradeMethod, type Brand } from '@/types';
import type { Product } from '@/types';

const productSchema = z.object({
  title: z.string().min(2, '제목은 최소 2자 이상이어야 합니다').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다'),
  price: z.number().min(0, '가격은 0원 이상이어야 합니다').max(2147483647, '가격은 2,147,483,647원 이하여야 합니다'),
  category: z.nativeEnum(ProductCategory),
  condition: z.string().optional(),
  trade_method: z.string().optional(),
  trade_location: z.string().optional(),
  brand_id: z.string().optional(),
  hashtags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

// ================================
// Constants
// ================================

import { Save, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'product_form_draft';

// ================================
// Imports
// ================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi } from '@/lib/api/products';
import { uploadApi } from '@/lib/api/upload';
import { Button } from '@/components/ui/Button';
import ProductFormFields from './ProductFormFields';
import ProductFormImages from './ProductFormImages';

// ================================
// Component
// ================================

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  // ================================
  // State
  // ================================

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialData?.images.map((img) => img.url) || []
  );
  const [brands, setBrands] = useState<Brand[]>([]);

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
      condition: initialData.condition,
      trade_method: initialData.trade_method,
      trade_location: initialData.trade_location,
      brand_id: initialData.brand_id,
      hashtags: initialData.hashtags?.map(h => h.hashtag.name).join(', '),
    } : undefined,
  });

  // ================================
  // Effects
  // ================================

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await apiClient.get('/brands');
        // setBrands(response.data);

        // Mock data
        const mockBrands: Brand[] = [
          { id: '1', name: 'Apple', name_ko: '애플', is_popular: true },
          { id: '2', name: 'Samsung', name_ko: '삼성', is_popular: true },
          { id: '3', name: 'Nike', name_ko: '나이키', is_popular: true },
          { id: '4', name: 'Adidas', name_ko: '아디다스', is_popular: false },
        ];
        setBrands(mockBrands);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    };
    fetchBrands();
  }, []);

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
          if (data.condition) setValue('condition', data.condition);
          if (data.trade_method) setValue('trade_method', data.trade_method);
          if (data.trade_location) setValue('trade_location', data.trade_location);
          if (data.brand_id) setValue('brand_id', data.brand_id);
          if (data.hashtags) setValue('hashtags', data.hashtags);
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

  // ================================
  // Handlers
  // ================================

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

      // Process hashtags
      const hashtagsArray = data.hashtags
        ? data.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : undefined;

      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition as ProductCondition | undefined,
        trade_method: data.trade_method as TradeMethod | undefined,
        trade_location: data.trade_location,
        brand_id: data.brand_id,
        hashtags: hashtagsArray,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      };

      if (isEdit && initialData) {
        await productsApi.updateProduct(initialData.id, productData);
        router.push(`/products/${initialData.id}`);
      } else {
        const newProduct = await productsApi.createProduct({
          ...productData,
          images: uploadedImages,
        } as any);
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

  // ================================
  // Render
  // ================================

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-6"
      data-testid="product-form"
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-500/30">
          {isEdit ? <Save className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEdit ? '상품 수정' : '상품 등록'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            {isEdit ? '상품 정보를 수정하세요' : '새로운 상품을 등록하세요'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <ProductFormFields
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          brands={brands}
        />

        <ProductFormImages
          images={images}
          imagePreviews={imagePreviews}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          isEdit={isEdit}
        />

        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-xs"
            role="alert"
            data-testid="form-error"
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-3">
          <Button
            type="submit"
            disabled={isLoading || uploadingImages}
            className="flex-1"
            size="sm"
            data-testid="submit-button"
          >
            {uploadingImages
              ? '이미지 업로드 중...'
              : isLoading
              ? isEdit ? '수정 중...' : '등록 중...'
              : isEdit ? '상품 수정' : '상품 등록'}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            data-testid="cancel-button"
          >
            취소
          </Button>
        </div>
      </div>
    </form>
  );
}
