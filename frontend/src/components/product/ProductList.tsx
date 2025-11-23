'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api/products';
import type { Product, ProductQueryParams } from '@/types';
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const params: ProductQueryParams = {
        page: page + 1,
        limit: 20,
      };

      const response = await productsApi.getProducts(params);
      setProducts((prev) => [...prev, ...response.data]);
      setPage(response.page);
      setTotal(response.total);
      setHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  }, [page, hasMore, isLoading]);

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
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
