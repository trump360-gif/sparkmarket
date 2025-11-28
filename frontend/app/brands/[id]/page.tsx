'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ProductList from '@/components/product/ProductList';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import type { Brand, Product, PaginatedResponse } from '@/types';

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<PaginatedResponse<Product>>({
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc'>('latest');

  useEffect(() => {
    fetchBrandData();
  }, [brandId, sortBy]);

  const fetchBrandData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const [brandRes, productsRes] = await Promise.all([
      //   apiClient.get(`/brands/${brandId}`),
      //   apiClient.get(`/brands/${brandId}/products`, { params: { sort: sortBy } })
      // ]);
      // setBrand(brandRes.data);
      // setProducts(productsRes.data);

      // Mock data
      const mockBrand: Brand = {
        id: brandId,
        name: 'Apple',
        name_ko: '애플',
        description: '혁신적인 기술 제품을 선보이는 글로벌 브랜드',
        is_popular: true,
        _count: { products: 150 },
      };
      setBrand(mockBrand);

      // Products will be loaded by ProductList component
    } catch (error) {
      console.error('Failed to fetch brand data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            브랜드를 찾을 수 없습니다
          </h3>
          <p className="text-slate-500 mb-6">
            존재하지 않거나 삭제된 브랜드입니다
          </p>
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            브랜드 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <Link
        href="/brands"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        브랜드 목록으로
      </Link>

      {/* Brand Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
            {brand.logo_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  fill
                  className="object-contain p-4"
                  sizes="96px"
                />
              </div>
            ) : (
              <span className="text-4xl font-bold text-slate-300">
                {brand.name[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">
                {brand.name_ko || brand.name}
              </h1>
              {brand.is_popular && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  인기 브랜드
                </span>
              )}
            </div>
            {brand.name_ko && (
              <p className="text-slate-500 mb-3">{brand.name}</p>
            )}
            {brand.description && (
              <p className="text-slate-600 mb-4">{brand.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {brand._count?.products.toLocaleString() || 0}
                  </span>
                  개 상품
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {brand.name_ko || brand.name} 상품
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="latest">최신순</option>
          <option value="price_asc">가격 낮은순</option>
          <option value="price_desc">가격 높은순</option>
        </select>
      </div>

      {/* Products List */}
      {/* TODO: Add brand_id filter when ProductList supports queryParams */}
      <ProductList />
    </div>
  );
}
