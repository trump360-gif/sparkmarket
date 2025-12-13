// ================================
// Types & Interfaces
// ================================

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue
} from 'react-hook-form';
import {
  ProductCategory,
  CATEGORY_LABELS,
  PRODUCT_CONDITION_LABELS,
  TRADE_METHOD_LABELS,
  type Brand
} from '@/types';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition?: string;
  trade_method?: string;
  trade_location?: string;
  brand_id?: string;
  hashtags?: string;
}

interface ProductFormFieldsProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  brands: Brand[];
}

// ================================
// Constants
// ================================

import { Package, Tag, DollarSign, FileText, MapPin, Truck, Hash } from 'lucide-react';

// ================================
// Component
// ================================

export default function ProductFormFields({
  register,
  errors,
  watch,
  setValue,
  brands,
}: ProductFormFieldsProps) {
  return (
    <>
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          <Package className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          제목 *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white transition-all"
          placeholder="상품 제목을 입력하세요"
          data-testid="product-title-input"
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-red-500 text-xs mt-1.5" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          카테고리 *
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="상품 카테고리 선택">
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
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
                data-testid={`category-${category}`}
                aria-pressed={isSelected}
              >
                {CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register('category')} />
        {errors.category && (
          <p className="text-red-500 text-xs mt-1.5" role="alert">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="price"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          가격 *
        </label>
        <div className="relative">
          <input
            id="price"
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white transition-all pr-10"
            placeholder="0"
            data-testid="product-price-input"
            aria-invalid={errors.price ? 'true' : 'false'}
            aria-describedby={errors.price ? 'price-error' : undefined}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
            원
          </span>
        </div>
        {errors.price && (
          <p id="price-error" className="text-red-500 text-xs mt-1.5" role="alert">
            {errors.price.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          설명 *
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white transition-all resize-none"
          placeholder="상품 설명을 입력하세요"
          data-testid="product-description-input"
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-red-500 text-xs mt-1.5" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Product Condition */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <Package className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          상품 상태
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="상품 상태 선택">
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
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
                data-testid={`condition-${value}`}
                aria-pressed={isSelected}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trade Method */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <Truck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          거래 방법
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="거래 방법 선택">
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
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
                data-testid={`trade-method-${value}`}
                aria-pressed={isSelected}
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
          <label
            htmlFor="trade_location"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            직거래 희망 지역
          </label>
          <input
            id="trade_location"
            type="text"
            {...register('trade_location')}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white transition-all"
            placeholder="예: 서울 강남구, 경기 성남시"
            data-testid="trade-location-input"
          />
        </div>
      )}

      {/* Brand Selection */}
      <div>
        <label
          htmlFor="brand_id"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          브랜드 (선택사항)
        </label>
        <div className="relative">
          <select
            id="brand_id"
            {...register('brand_id')}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white transition-all appearance-none"
            data-testid="brand-select"
          >
            <option value="">브랜드 선택</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name_ko ? `${brand.name_ko} (${brand.name})` : brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <label
          htmlFor="hashtags"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          해시태그 (선택사항)
        </label>
        <input
          id="hashtags"
          type="text"
          {...register('hashtags')}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white transition-all"
          placeholder="예: 새것, 깨끗해요, 급처 (쉼표로 구분)"
          data-testid="hashtags-input"
          aria-describedby="hashtags-help"
        />
        <p id="hashtags-help" className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          해시태그를 쉼표(,)로 구분하여 입력하세요
        </p>
      </div>
    </>
  );
}
