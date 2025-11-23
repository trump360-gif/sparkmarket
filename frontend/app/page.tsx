'use client';

import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api/products';
import ProductList from '@/components/product/ProductList';
import type { Product } from '@/types';

export default function Home() {
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [initialPage, setInitialPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getProducts({ page: 1, limit: 20 });
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
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 상품</h1>
          <p className="text-gray-600">총 {initialTotal}개의 상품</p>
        </div>

        <ProductList
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          initialPage={initialPage}
        />
      </div>
    </main>
  );
}
