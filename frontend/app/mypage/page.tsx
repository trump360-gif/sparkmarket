'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/lib/api/products';
import { favoritesApi } from '@/lib/api/favorites';
import { priceOffersApi } from '@/lib/api/priceOffers';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product, PriceOffer } from '@/types';

type TabType = 'myProducts' | 'favorites' | 'offers';

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('myProducts');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [sentOffers, setSentOffers] = useState<PriceOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<PriceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'myProducts') {
        // 내가 등록한 상품 가져오기
        const response = await productsApi.getProducts({
          page: 1,
          limit: 20,
        });
        // 내 상품만 필터링
        const filtered = response.data.filter(
          (p) => p.seller_id === user?.id,
        );
        setMyProducts(filtered);
      } else if (activeTab === 'favorites') {
        const response = await favoritesApi.getFavorites({ limit: 20 });
        setFavoriteProducts(response.data);
      } else if (activeTab === 'offers') {
        const [sent, received] = await Promise.all([
          priceOffersApi.getSentOffers({ limit: 10 }),
          priceOffersApi.getReceivedOffers({ limit: 10 }),
        ]);
        setSentOffers(sent.data);
        setReceivedOffers(received.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.nickname?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.nickname}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('myProducts')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'myProducts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              내 상품 ({myProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'favorites'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              찜 목록 ({favoriteProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'offers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              가격 제안 ({sentOffers.length + receivedOffers.length})
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'myProducts' && (
              <>
                {myProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg mb-2">
                      등록한 상품이 없습니다.
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      첫 상품을 등록해보세요!
                    </p>
                    <button
                      onClick={() => router.push('/products/new')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      상품 등록하기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'favorites' && (
              <>
                {favoriteProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg mb-2">
                      찜한 상품이 없습니다.
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      마음에 드는 상품을 찜해보세요!
                    </p>
                    <button
                      onClick={() => router.push('/products')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      상품 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'offers' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    가격 제안 요약
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">보낸 제안</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {sentOffers.length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">받은 제안</p>
                      <p className="text-2xl font-bold text-green-600">
                        {receivedOffers.length}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/offers')}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    전체 제안 보기
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
