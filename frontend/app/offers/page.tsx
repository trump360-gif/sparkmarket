'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { priceOffersApi } from '@/lib/api/priceOffers';
import OfferCard from '@/components/offer/OfferCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PriceOffer } from '@/types';

type TabType = 'sent' | 'received';

export default function OffersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('sent');
  const [sentOffers, setSentOffers] = useState<PriceOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<PriceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sentPage, setSentPage] = useState(1);
  const [receivedPage, setReceivedPage] = useState(1);
  const [sentTotal, setSentTotal] = useState(0);
  const [receivedTotal, setReceivedTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOffers();
      // 초기 로드 시 양쪽 카운트 모두 가져오기
      fetchAllCounts();
    }
  }, [isAuthenticated, activeTab, sentPage, receivedPage]);

  const fetchAllCounts = async () => {
    try {
      const [sent, received] = await Promise.all([
        priceOffersApi.getSentOffers({ limit: 1 }),
        priceOffersApi.getReceivedOffers({ limit: 1 }),
      ]);
      setSentTotal(sent.total || 0);
      setReceivedTotal(received.total || 0);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch counts:', error);
      }
    }
  };

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'sent') {
        const response = await priceOffersApi.getSentOffers({
          page: sentPage,
          limit: 20,
        });
        setSentOffers(response.data);
        setSentTotal(response.total);
      } else {
        const response = await priceOffersApi.getReceivedOffers({
          page: receivedPage,
          limit: 20,
        });
        setReceivedOffers(response.data);
        setReceivedTotal(response.total);
      }
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch offers:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const currentOffers = activeTab === 'sent' ? sentOffers : receivedOffers;
  const currentTotal = activeTab === 'sent' ? sentTotal : receivedTotal;
  const currentPage = activeTab === 'sent' ? sentPage : receivedPage;
  const setCurrentPage = activeTab === 'sent' ? setSentPage : setReceivedPage;
  const totalPages = Math.ceil(currentTotal / 20);

  return (
    <main className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">가격 제안 관리</h1>

        {/* 탭 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'sent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              보낸 제안 ({sentTotal})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'received'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              받은 제안 ({receivedTotal})
            </button>
          </div>
        </div>

        {/* 제안 목록 */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : currentOffers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">
              {activeTab === 'sent'
                ? '보낸 가격 제안이 없습니다.'
                : '받은 가격 제안이 없습니다.'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {activeTab === 'sent'
                ? '관심있는 상품에 가격을 제안해보세요!'
                : '판매중인 상품에 제안이 들어오면 여기에 표시됩니다.'}
            </p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              상품 둘러보기
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {currentOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  type={activeTab}
                  onUpdate={fetchOffers}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  이전
                </button>
                <span className="text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
