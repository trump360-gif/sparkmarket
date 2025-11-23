'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api/products';
import ProductList from '@/components/product/ProductList';
import SearchFilters from '@/components/product/SearchFilters';
import { ProductListSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types';

export default function Home() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [initialPage, setInitialPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = { page: 1, limit: 20 };

        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const status = searchParams.get('status');

        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice) params.minPrice = parseInt(minPrice);
        if (maxPrice) params.maxPrice = parseInt(maxPrice);
        if (status) params.status = status;

        const response = await productsApi.getProducts(params);
        setInitialProducts(response.data);
        setInitialTotal(response.total);
        setInitialPage(response.page);
      } catch (error) {
        console.error('Failed to fetch initial products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 상품</h1>
            <p className="text-gray-600">로딩 중...</p>
          </div>
          <ProductListSkeleton count={6} />
        </div>
      </main>
    );
  }

  const searchQuery = searchParams.get('search');
  const hasActiveFilters =
    searchParams.get('category') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('status');

  return (
    <main className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {searchQuery ? `"${searchQuery}" 검색 결과` : '전체 상품'}
            </h1>
            <p className="text-gray-600">
              총 {initialTotal}개의 상품
              {hasActiveFilters && ' (필터 적용됨)'}
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/products/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg whitespace-nowrap"
            >
              + 판매하기
            </Link>
          )}
        </div>

        <SearchFilters />

        <ProductList
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          initialPage={initialPage}
        />
      </div>
    </main>
  );
}
