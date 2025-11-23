'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/lib/api/products';
import { favoritesApi } from '@/lib/api/favorites';
import { priceOffersApi } from '@/lib/api/priceOffers';
import ProductCard from '@/components/product/ProductCard';
import OfferCard from '@/components/offer/OfferCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product, PriceOffer } from '@/types';

type TabType = 'myProducts' | 'favorites' | 'offers';
type OfferSubTabType = 'sent' | 'received';

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('myProducts');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [sentOffers, setSentOffers] = useState<PriceOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<PriceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offerCounts, setOfferCounts] = useState({ sent: 0, received: 0 });
  const [offerSubTab, setOfferSubTab] = useState<OfferSubTabType>('received');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchOfferCounts();
    }
  }, [isAuthenticated, activeTab]);

  const fetchOfferCounts = async () => {
    try {
      const [sent, received] = await Promise.all([
        priceOffersApi.getSentOffers({ limit: 1 }),
        priceOffersApi.getReceivedOffers({ limit: 1 }),
      ]);
      setOfferCounts({
        sent: sent.total || 0,
        received: received.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch offer counts:', error);
    }
  };

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
    <main className="min-h-screen bg-gray-50 pt-16">
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
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors relative ${
                activeTab === 'offers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              가격 제안 ({offerCounts.sent + offerCounts.received})
              {offerCounts.received > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
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
              <>
                {/* 보낸/받은 제안 서브탭 */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setOfferSubTab('received')}
                      className={`flex-1 px-6 py-3 font-medium text-center transition-colors ${
                        offerSubTab === 'received'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      받은 제안 ({offerCounts.received})
                    </button>
                    <button
                      onClick={() => setOfferSubTab('sent')}
                      className={`flex-1 px-6 py-3 font-medium text-center transition-colors ${
                        offerSubTab === 'sent'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      보낸 제안 ({offerCounts.sent})
                    </button>
                  </div>
                </div>

                {/* 제안 목록 */}
                {offerSubTab === 'received' ? (
                  receivedOffers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <p className="text-gray-500 text-lg mb-2">
                        받은 가격 제안이 없습니다.
                      </p>
                      <p className="text-gray-400 text-sm">
                        판매중인 상품에 제안이 들어오면 여기에 표시됩니다.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {receivedOffers.map((offer) => (
                        <OfferCard
                          key={offer.id}
                          offer={offer}
                          type="received"
                          onUpdate={fetchData}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  sentOffers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <p className="text-gray-500 text-lg mb-2">
                        보낸 가격 제안이 없습니다.
                      </p>
                      <p className="text-gray-400 text-sm mb-6">
                        관심있는 상품에 가격을 제안해보세요!
                      </p>
                      <button
                        onClick={() => router.push('/products')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        상품 둘러보기
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sentOffers.map((offer) => (
                        <OfferCard
                          key={offer.id}
                          offer={offer}
                          type="sent"
                          onUpdate={fetchData}
                        />
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
