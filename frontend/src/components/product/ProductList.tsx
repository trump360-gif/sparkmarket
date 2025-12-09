'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import type { Product, ProductQueryParams, ProductCategory, ProductStatus, SortOption } from '@/types';
import ProductCard from './ProductCard';

interface ProductListProps {
  initialProducts?: Product[];
  initialTotal?: number;
  initialPage?: number;
}

export default function ProductList({
  initialProducts = [],
  initialTotal = 0,
  initialPage = 1,
}: ProductListProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotal > initialProducts.length);

  // URL 파라미터가 변경되면 상태 초기화
  useEffect(() => {
    setProducts(initialProducts);
    setPage(initialPage);
    setTotal(initialTotal);
    setHasMore(initialTotal > initialProducts.length);
  }, [initialProducts, initialPage, initialTotal]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      // 현재 URL의 검색 파라미터를 모두 포함
      const params: ProductQueryParams = {
        page: page + 1,
        limit: 20,
      };

      const search = searchParams.get('search');
      const category = searchParams.get('category');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const status = searchParams.get('status');
      const sort = searchParams.get('sort') as SortOption | null;

      if (search) params.search = search;
      if (category) params.category = category as ProductCategory;
      if (minPrice) params.minPrice = parseInt(minPrice);
      if (maxPrice) params.maxPrice = parseInt(maxPrice);
      if (status) params.status = status as ProductStatus;
      if (sort) params.sort = sort;

      const response = await productsApi.getProducts(params);
      setProducts((prev) => [...prev, ...response.data]);
      setPage(response.page);
      setTotal(response.total);
      setHasMore(response.page < response.totalPages);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to load products:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 8} />
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">모든 상품을 불러왔습니다.</p>
        </div>
      )}
    </div>
  );
}
