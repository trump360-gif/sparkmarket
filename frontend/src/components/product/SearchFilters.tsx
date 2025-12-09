'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProductCategory, CATEGORY_LABELS } from '@/types';
import { RotateCcw } from 'lucide-react';

const CATEGORIES = Object.values(ProductCategory) as ProductCategory[];

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'FOR_SALE', label: '판매중' },
  { value: 'SOLD', label: '판매완료' },
];

const CONDITION_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'NEW', label: '새상품' },
  { value: 'LIKE_NEW', label: '거의 새것' },
  { value: 'USED', label: '사용감 있음' },
  { value: 'WELL_USED', label: '많이 사용함' },
];

const TRADE_METHOD_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'DIRECT', label: '직거래' },
  { value: 'DELIVERY', label: '택배' },
  { value: 'BOTH', label: '직거래/택배' },
];

const PRICE_RANGES = [
  { value: '', label: '전체', min: '', max: '' },
  { value: '0-10000', label: '~1만원', min: '0', max: '10000' },
  { value: '10000-50000', label: '1~5만원', min: '10000', max: '50000' },
  { value: '50000-100000', label: '5~10만원', min: '50000', max: '100000' },
  { value: '100000-500000', label: '10~50만원', min: '100000', max: '500000' },
  { value: '500000-', label: '50만원~', min: '500000', max: '' },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState('');
  const [condition, setCondition] = useState('');
  const [tradeMethod, setTradeMethod] = useState('');

  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setStatus(searchParams.get('status') || '');
    setCondition(searchParams.get('condition') || '');
    setTradeMethod(searchParams.get('tradeMethod') || '');
  }, [searchParams]);

  const applyFilter = (key: string, value: string, extraParams?: { minPrice?: string; maxPrice?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === 'category') {
      if (value) {
        params.set('category', value);
      } else {
        params.delete('category');
      }
    } else if (key === 'status') {
      if (value) {
        params.set('status', value);
      } else {
        params.delete('status');
      }
    } else if (key === 'condition') {
      if (value) {
        params.set('condition', value);
      } else {
        params.delete('condition');
      }
    } else if (key === 'tradeMethod') {
      if (value) {
        params.set('tradeMethod', value);
      } else {
        params.delete('tradeMethod');
      }
    } else if (key === 'price') {
      if (extraParams?.minPrice) {
        params.set('minPrice', extraParams.minPrice);
      } else {
        params.delete('minPrice');
      }
      if (extraParams?.maxPrice) {
        params.set('maxPrice', extraParams.maxPrice);
      } else {
        params.delete('maxPrice');
      }
    }

    params.delete('page');
    router.push(`/?${params.toString()}`, { scroll: false });

    // 필터 변경 후 상품 목록 섹션으로 스크롤 유지
    setTimeout(() => {
      document.getElementById('product-list')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 100);
  };

  const resetFilters = () => {
    const search = searchParams.get('search');
    if (search) {
      router.push(`/?search=${search}`, { scroll: false });
    } else {
      router.push('/', { scroll: false });
    }

    // 필터 초기화 후 상품 목록 섹션으로 스크롤 유지
    setTimeout(() => {
      document.getElementById('product-list')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 100);
  };

  const hasActiveFilters = category || minPrice || maxPrice || status || condition || tradeMethod;

  const getCurrentPriceRange = () => {
    if (!minPrice && !maxPrice) return '';
    return `${minPrice}-${maxPrice}`;
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-4 space-y-4">
      {/* 상태 필터 */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">상태</h3>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyFilter('status', opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                status === opt.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">카테고리</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => applyFilter('category', '')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !category
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => applyFilter('category', cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* 가격대 필터 */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">가격대</h3>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => applyFilter('price', range.value, { minPrice: range.min, maxPrice: range.max })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                getCurrentPriceRange() === range.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 상품 상태 필터 */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">상품 상태</h3>
        <div className="flex flex-wrap gap-1.5">
          {CONDITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyFilter('condition', opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                condition === opt.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 거래 방법 필터 */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">거래 방법</h3>
        <div className="flex flex-wrap gap-1.5">
          {TRADE_METHOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyFilter('tradeMethod', opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                tradeMethod === opt.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 초기화 버튼 */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          필터 초기화
        </button>
      )}
    </div>
  );
}
