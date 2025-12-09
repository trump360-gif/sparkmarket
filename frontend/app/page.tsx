'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api/products';
import ProductList from '@/components/product/ProductList';
import SearchFilters from '@/components/product/SearchFilters';
import { ProductListSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles, BadgePercent, ShieldCheck, Zap } from 'lucide-react';
import PopularHashtags from '@/components/hashtag/PopularHashtags';
import SortTabs from '@/components/product/SortTabs';
import type { SortOption } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [initialPage, setInitialPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasUsedFilters, setHasUsedFilters] = useState(false);
  const hasFetchedOnce = useRef(false);

  const searchQuery = searchParams.get('search');
  const hasActiveFilters =
    searchParams.get('category') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('status') ||
    searchParams.get('hashtag') ||
    searchParams.get('sort');

  // 필터가 활성화되면 hasUsedFilters를 true로 설정
  useEffect(() => {
    if (hasActiveFilters || searchQuery) {
      setHasUsedFilters(true);
    }
  }, [hasActiveFilters, searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      // 첫 로딩일 때만 스켈레톤 표시
      if (!hasFetchedOnce.current) {
        setIsInitialLoading(true);
      }

      try {
        const params: any = { page: 1, limit: 20 };

        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const status = searchParams.get('status');
        const hashtag = searchParams.get('hashtag');
        const sort = searchParams.get('sort') as SortOption | null;

        if (search) params.search = search;
        if (category) params.category = category;
        if (minPrice) params.minPrice = parseInt(minPrice);
        if (maxPrice) params.maxPrice = parseInt(maxPrice);
        if (status) params.status = status;
        if (hashtag) params.hashtag = hashtag;
        if (sort) params.sort = sort;

        const response = await productsApi.getProducts(params);
        setInitialProducts(response.data);
        setInitialTotal(response.total);
        setInitialPage(response.page);
        hasFetchedOnce.current = true;
      } catch (error: any) {
        // 401 에러는 조용히 무시
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch initial products:', error);
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // 필터를 사용한 적이 있으면 Hero 섹션 숨김
  const showHeroSection = !searchQuery && !hasActiveFilters && !hasUsedFilters;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section - Only show when no search/filters and hasn't used filters yet */}
      {showHeroSection && (
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-secondary-400/25 rounded-full blur-3xl animate-blob-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-40 left-20 w-80 h-80 bg-secondary-300/20 rounded-full blur-3xl animate-blob-slow" style={{ animationDelay: '6s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              새로운 중고거래의 시작, 스파크마켓
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight animate-slide-up">
              당신의 물건에 <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                새로운 가치
              </span>를 더하세요
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              안전하고 빠른 거래, 이웃과 함께하는 따뜻한 나눔.
              <br />지금 바로 스파크마켓에서 시작해보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {isAuthenticated ? (
                <Link href="/products/new">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                    <Sparkles className="w-5 h-5 mr-2" />
                    판매 시작하기
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                    지금 시작하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8"
                onClick={() => {
                  document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                인기 상품 둘러보기
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: ShieldCheck, title: '안전한 거래', desc: '검증된 사용자와의 믿을 수 있는 거래', cardClass: 'feature-card-wiggle' },
                { icon: Zap, title: '빠른 매칭', desc: '원하는 물건을 실시간으로 발견', cardClass: 'feature-card-bounce' },
                { icon: BadgePercent, title: '합리적 가격', desc: '투명한 시세 정보 제공', cardClass: 'feature-card-float' },
              ].map((item, i) => (
                <div key={i} className={`${item.cardClass} flex flex-col items-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="feature-icon w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 인기 해시태그 섹션 */}
      {!searchQuery && !hasActiveFilters && (
        <PopularHashtags
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-200 ${showHeroSection ? '' : 'mt-20'
            }`}
        />
      )}

      <div id="product-list" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${showHeroSection ? '' : 'pt-32'}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              {searchQuery ? (
                <>
                  <span className="text-primary-600">&quot;{searchQuery}&quot;</span> 검색 결과
                </>
              ) : (
                <>
                  🔥 지금 핫한 매물
                </>
              )}
            </h2>
            <p className="text-slate-500">
              총 <span className="font-semibold text-primary-600">{initialTotal}</span>개의 상품이 기다리고 있어요
              {hasActiveFilters && ' (필터 적용됨)'}
            </p>
          </div>

          {isAuthenticated && (
            <Link href="/products/new">
              <Button className="shadow-lg shadow-primary-500/20">
                + 상품 등록하기
              </Button>
            </Link>
          )}
        </div>

        {/* 정렬 옵션 */}
        <div className="mb-8">
          <SortTabs />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SearchFilters />
            </div>
          </div>

          <div className="lg:col-span-3">
            {isInitialLoading ? (
              <ProductListSkeleton count={6} />
            ) : (
              <ProductList
                initialProducts={initialProducts}
                initialTotal={initialTotal}
                initialPage={initialPage}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<ProductListSkeleton count={6} />}>
      <HomeContent />
    </Suspense>
  );
}
