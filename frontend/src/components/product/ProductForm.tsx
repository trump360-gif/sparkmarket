'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productsApi } from '@/lib/api/products';
import { uploadApi } from '@/lib/api/upload';
import { ProductCategory, PRODUCT_CONDITION_LABELS, TRADE_METHOD_LABELS, type ProductCondition, type TradeMethod, type Brand } from '@/types';
import { Button } from '@/components/ui/Button';
import { Package, Tag, DollarSign, FileText, Image as ImageIcon, X, Sparkles, Save, MapPin, Truck, Hash } from 'lucide-react';
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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandSearch, setBrandSearch] = useState('');

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-500/30">
          {isEdit ? <Save className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? '상품 수정' : '상품 등록'}</h2>
          <p className="text-slate-500 text-xs">{isEdit ? '상품 정보를 수정하세요' : '새로운 상품을 등록하세요'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            제목 *
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-all"
            placeholder="상품 제목을 입력하세요"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            카테고리 *
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.values(ProductCategory).map((category) => {
              const isSelected = watch('category') === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setValue('category', category)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register('category')} />
          {errors.category && (
            <p className="text-red-500 text-xs mt-1.5">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            가격 *
          </label>
          <div className="relative">
            <input
              id="price"
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-all pr-10"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">원</span>
          </div>
          {errors.price && (
            <p className="text-red-500 text-xs mt-1.5">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            설명 *
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-all resize-none"
            placeholder="상품 설명을 입력하세요"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>
          )}
        </div>

        {/* Product Condition */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            상품 상태
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRODUCT_CONDITION_LABELS).map(([value, label]) => {
              const isSelected = watch('condition') === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('condition', value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trade Method */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            거래 방법
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TRADE_METHOD_LABELS).map(([value, label]) => {
              const isSelected = watch('trade_method') === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('trade_method', value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trade Location */}
        {(watch('trade_method') === 'DIRECT' || watch('trade_method') === 'BOTH') && (
          <div>
            <label htmlFor="trade_location" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              직거래 희망 지역
            </label>
            <input
              id="trade_location"
              type="text"
              {...register('trade_location')}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-all"
              placeholder="예: 서울 강남구, 경기 성남시"
            />
          </div>
        )}

        {/* Brand Selection */}
        <div>
          <label htmlFor="brand_id" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            브랜드 (선택사항)
          </label>
          <div className="relative">
            <select
              id="brand_id"
              {...register('brand_id')}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-all appearance-none"
            >
              <option value="">브랜드 선택</option>
              {brands
                .filter(brand =>
                  !brandSearch ||
                  brand.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
                  brand.name_ko?.toLowerCase().includes(brandSearch.toLowerCase())
                )
                .map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name_ko ? `${brand.name_ko} (${brand.name})` : brand.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <label htmlFor="hashtags" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            해시태그 (선택사항)
          </label>
          <input
            id="hashtags"
            type="text"
            {...register('hashtags')}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-all"
            placeholder="예: 새것, 깨끗해요, 급처 (쉼표로 구분)"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            해시태그를 쉼표(,)로 구분하여 입력하세요
          </p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            이미지 * (최대 5개)
          </label>

          <div className="grid grid-cols-5 gap-2 mb-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-md transition-all opacity-0 group-hover:opacity-100"
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
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
              <div className="flex flex-col items-center justify-center py-4">
                <ImageIcon className="w-6 h-6 text-slate-400 mb-1.5" />
                <p className="text-xs text-slate-500">클릭하여 이미지 업로드</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, GIF (최대 5개)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-3">
          <Button
            type="submit"
            disabled={isLoading || uploadingImages}
            className="flex-1"
            size="sm"
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
          >
            취소
          </Button>
        </div>
      </div>
    </form>
  );
}
