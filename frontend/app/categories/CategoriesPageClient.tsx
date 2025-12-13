'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { ProductCategory } from '@/types';
import {
  Smartphone,
  Shirt,
  Sparkles,
  Dumbbell,
  BookOpen,
  Sofa,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

// ================================
// Types & Interfaces
// ================================

interface CategoryItem {
  name: ProductCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface CategoryWithCount extends CategoryItem {
  count: number;
}

// ================================
// Constants
// ================================

const CATEGORIES: CategoryItem[] = [
  {
    name: ProductCategory.ELECTRONICS,
    label: '디지털/가전',
    icon: <Smartphone className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    name: ProductCategory.FASHION,
    label: '패션의류',
    icon: <Shirt className="w-8 h-8" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
  },
  {
    name: ProductCategory.BEAUTY,
    label: '뷰티/미용',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
  },
  {
    name: ProductCategory.SPORTS,
    label: '스포츠/레저',
    icon: <Dumbbell className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
  {
    name: ProductCategory.HOME,
    label: '가구/인테리어',
    icon: <Sofa className="w-8 h-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    name: ProductCategory.BOOKS,
    label: '도서',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
  },
  {
    name: ProductCategory.OTHER,
    label: '기타',
    icon: <MoreHorizontal className="w-8 h-8" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 hover:bg-slate-100',
  },
];

// ================================
// Component
// ================================

export default function CategoriesPageClient() {
  const router = useRouter();
  const [categoriesWithCount, setCategoriesWithCount] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      setIsLoading(true);
      try {
        // 각 카테고리별 상품 수 조회
        const counts = await Promise.all(
          CATEGORIES.map(async (category) => {
            const response = await productsApi.getProducts({
              category: category.name,
              status: 'FOR_SALE' as any,
              limit: 1,
            });
            return {
              ...category,
              count: response.total,
            };
          })
        );

        setCategoriesWithCount(counts);
        setTotalProducts(counts.reduce((sum, cat) => sum + cat.count, 0));
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
        // 에러 시 카운트 없이 표시
        setCategoriesWithCount(CATEGORIES.map((cat) => ({ ...cat, count: 0 })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const handleCategoryClick = (category: ProductCategory) => {
    router.push(`/?category=${encodeURIComponent(category)}`);
  };

  // 인기 카테고리 (상품 수 기준 상위 3개)
  const popularCategories = [...categoriesWithCount]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-24 pb-12">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">카테고리</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isLoading ? (
              '상품 수를 불러오는 중...'
            ) : (
              <>
                총 <span className="font-semibold text-primary-600">{totalProducts.toLocaleString()}</span>개의 상품이 등록되어 있습니다
              </>
            )}
          </p>
        </div>

        {/* 인기 카테고리 */}
        {!isLoading && popularCategories.length > 0 && popularCategories[0].count > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">인기 카테고리</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {popularCategories.map((category, index) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`relative p-4 rounded-xl ${category.bgColor} transition-all group`}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 bg-white/80 dark:bg-slate-800/80 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    {index + 1}
                  </div>
                  <div className={`${category.color} mb-2 flex justify-center`}>
                    {category.icon}
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white text-center truncate">
                    {category.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                    {category.count.toLocaleString()}개
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 전체 카테고리 그리드 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">전체 카테고리</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {(isLoading ? CATEGORIES.map((cat) => ({ ...cat, count: -1 })) : categoriesWithCount).map(
              (category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`flex flex-col items-center p-4 rounded-xl ${category.bgColor} transition-all group`}
                >
                  <div className={`${category.color} mb-3 transform group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white text-center">
                    {category.label}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {category.count === -1 ? (
                      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" />
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {category.count.toLocaleString()}개
                      </span>
                    )}
                    <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* 전체 상품 보기 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            전체 상품 보기
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
