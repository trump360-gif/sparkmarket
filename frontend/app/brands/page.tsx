'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Star, TrendingUp } from 'lucide-react';
import type { Brand } from '@/types';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [popularBrands, setPopularBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const [allBrandsRes, popularBrandsRes] = await Promise.all([
      //   apiClient.get('/brands'),
      //   apiClient.get('/brands/popular')
      // ]);
      // setBrands(allBrandsRes.data);
      // setPopularBrands(popularBrandsRes.data);

      // Mock data for demonstration
      const mockBrands: Brand[] = [
        {
          id: '1',
          name: 'Apple',
          name_ko: '애플',
          description: '혁신적인 기술 제품',
          is_popular: true,
          _count: { products: 150 },
        },
        {
          id: '2',
          name: 'Samsung',
          name_ko: '삼성',
          description: '글로벌 전자제품',
          is_popular: true,
          _count: { products: 200 },
        },
        {
          id: '3',
          name: 'Nike',
          name_ko: '나이키',
          description: '스포츠 의류 및 신발',
          is_popular: true,
          _count: { products: 120 },
        },
        {
          id: '4',
          name: 'Adidas',
          name_ko: '아디다스',
          description: '스포츠 브랜드',
          is_popular: false,
          _count: { products: 90 },
        },
      ];

      setBrands(mockBrands);
      setPopularBrands(mockBrands.filter(b => b.is_popular));
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBrands = brands.filter(brand => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      brand.name.toLowerCase().includes(query) ||
      brand.name_ko?.toLowerCase().includes(query) ||
      brand.description?.toLowerCase().includes(query)
    );
  });

  // Group brands by first letter
  const groupedBrands = filteredBrands.reduce((acc, brand) => {
    const firstLetter = brand.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(brand);
    return acc;
  }, {} as Record<string, Brand[]>);

  const sortedLetters = Object.keys(groupedBrands).sort();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-1/3"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">브랜드</h1>
        <p className="text-slate-600">좋아하는 브랜드의 상품을 찾아보세요</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="브랜드 검색..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Popular Brands */}
      {popularBrands.length > 0 && !searchQuery && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-slate-900">인기 브랜드</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} isPopular />
            ))}
          </div>
        </div>
      )}

      {/* All Brands (Alphabetically) */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {searchQuery ? '검색 결과' : '전체 브랜드'}
        </h2>

        {filteredBrands.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-slate-500">
              다른 키워드로 검색해보세요
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedLetters.map((letter) => (
              <div key={letter}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-lg">{letter}</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {groupedBrands[letter].map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BrandCardProps {
  brand: Brand;
  isPopular?: boolean;
}

function BrandCard({ brand, isPopular = false }: BrandCardProps) {
  return (
    <Link
      href={`/brands/${brand.id}`}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-all hover:-translate-y-1 group"
    >
      <div className="aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
        {brand.logo_url ? (
          <Image
            src={brand.logo_url}
            alt={brand.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <span className="text-2xl font-bold text-slate-300 group-hover:text-primary-400 transition-colors">
            {brand.name[0]}
          </span>
        )}
        {isPopular && (
          <div className="absolute top-2 right-2 bg-yellow-400 p-1.5 rounded-full shadow-md">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        )}
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 text-center group-hover:text-primary-600 transition-colors">
        {brand.name_ko || brand.name}
      </h3>
      {brand._count && (
        <p className="text-xs text-slate-500 text-center">
          {brand._count.products.toLocaleString()}개 상품
        </p>
      )}
    </Link>
  );
}
