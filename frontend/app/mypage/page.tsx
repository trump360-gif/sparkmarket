'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/lib/api/products';
import { favoritesApi } from '@/lib/api/favorites';
import { priceOffersApi } from '@/lib/api/priceOffers';
import { usersApi } from '@/lib/api/users';
import { reviewsApi } from '@/lib/api/reviews';
import ProductCard from '@/components/product/ProductCard';
import OfferCard from '@/components/offer/OfferCard';
import ReviewCard from '@/components/review/ReviewCard';
import TransactionCard from '@/components/transaction/TransactionCard';
import WriteReviewModal from '@/components/review/WriteReviewModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Package, Heart, Plus, ShoppingBag, Inbox, Send, Settings, Star, MessageSquare, X, ChevronRight, Receipt, Bell, Ban, Users, Clock } from 'lucide-react';
import type { Product, PriceOffer, Review, UserProfile, TransactionWithDetails } from '@/types';

type TabType = 'myProducts' | 'favorites' | 'transactions' | 'receivedOffers' | 'sentOffers';

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('myProducts');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [sentOffers, setSentOffers] = useState<PriceOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<PriceOffer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offerCounts, setOfferCounts] = useState({ sent: 0, received: 0 });
  const [transactionCount, setTransactionCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [myProductCount, setMyProductCount] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);

  // 메뉴 아이템 배열
  const menuItems = [
    { id: 'myProducts' as TabType, icon: Package, label: '내 상품', count: myProductCount },
    { id: 'favorites' as TabType, icon: Heart, label: '찜 목록', count: favoriteCount },
    { id: 'transactions' as TabType, icon: Receipt, label: '거래 내역', count: transactionCount },
    { id: 'receivedOffers' as TabType, icon: Inbox, label: '받은 제안', count: offerCounts.received, highlight: offerCounts.received > 0 },
    { id: 'sentOffers' as TabType, icon: Send, label: '보낸 제안', count: offerCounts.sent },
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchData();
      fetchAllCounts();
    }
  }, [isAuthenticated, activeTab]);

  const fetchProfile = async () => {
    try {
      const data = await usersApi.getMyProfile();
      setProfile(data);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch profile:', error);
      }
    }
  };

  const fetchAllCounts = async () => {
    try {
      const [sent, received, txs, favorites, products] = await Promise.all([
        priceOffersApi.getSentOffers({ limit: 1 }),
        priceOffersApi.getReceivedOffers({ limit: 1 }),
        usersApi.getMyTransactions({ limit: 1 }),
        favoritesApi.getFavorites({ limit: 1 }),
        productsApi.getProducts({ page: 1, limit: 100 }),
      ]);
      setOfferCounts({
        sent: sent.total || 0,
        received: received.total || 0,
      });
      setTransactionCount(txs.total || 0);
      setFavoriteCount(favorites.total || 0);
      // 내 상품만 필터링해서 카운트
      const myProductsFiltered = products.data.filter((p: Product) => p.seller_id === user?.id);
      setMyProductCount(myProductsFiltered.length);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch counts:', error);
      }
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'myProducts') {
        const response = await productsApi.getProducts({
          page: 1,
          limit: 20,
        });
        const filtered = response.data.filter(
          (p) => p.seller_id === user?.id,
        );
        setMyProducts(filtered);
      } else if (activeTab === 'favorites') {
        const response = await favoritesApi.getFavorites({ limit: 20 });
        setFavoriteProducts(response.data);
      } else if (activeTab === 'transactions') {
        const txResponse = await usersApi.getMyTransactions({ limit: 20 });
        setTransactions(txResponse.data);
      } else if (activeTab === 'receivedOffers') {
        const received = await priceOffersApi.getReceivedOffers({ limit: 20 });
        setReceivedOffers(received.data);
      } else if (activeTab === 'sentOffers') {
        const sent = await priceOffersApi.getSentOffers({ limit: 20 });
        setSentOffers(sent.data);
      }
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openReviewModal = async () => {
    setIsReviewModalOpen(true);
    setIsLoadingReviews(true);
    try {
      const response = await reviewsApi.getMyReviews('received', { limit: 20 });
      setReviews(response.data);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch reviews:', error);
      }
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 right-0 h-60 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-1/4 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {/* 프로필 헤더 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-5 mb-5 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-primary-500/20 overflow-hidden relative">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.nickname}
                  fill
                  className="object-cover"
                />
              ) : (
                user?.nickname?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">
                {user?.nickname}
              </h1>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={openReviewModal}
                    className="flex items-center gap-1 text-amber-500 text-sm hover:text-amber-600 transition-colors group"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {(profile?.stats?.rating ?? 0).toFixed(1)}
                    <span className="text-slate-400 group-hover:text-slate-500">({profile?.stats?.reviewCount ?? 0})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
                  </button>
                  <span className="text-slate-400 text-xs">|</span>
                  <span className="text-slate-500 text-xs">
                    판매 {profile?.stats?.salesCount ?? 0} · 구매 {profile?.stats?.purchaseCount ?? 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button className="flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors">
                    <Users className="w-3.5 h-3.5" />
                    팔로워 0 · 팔로잉 0
                  </button>
                </div>
              </div>
            </div>
            <Link href="/profile/settings">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">설정</span>
              </Button>
            </Link>
          </div>
          {profile?.bio && (
            <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              {profile.bio}
            </p>
          )}

          {/* 추가 메뉴 링크 */}
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => router.push('/profile/keyword-alerts')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 hover:text-primary-600 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              키워드 알림
            </button>
            <button
              onClick={() => router.push('/profile/recent-views')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 hover:text-primary-600 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              최근 본 상품
            </button>
            <button
              onClick={() => router.push('/profile/following')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 hover:text-primary-600 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              팔로잉
            </button>
            <button
              onClick={() => router.push('/profile/blocks')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 hover:text-primary-600 transition-all"
            >
              <Ban className="w-3.5 h-3.5" />
              차단 관리
            </button>
          </div>
        </div>

        {/* 모바일 탭 메뉴 */}
        <div className="lg:hidden mb-4 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'bg-white/80 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                  {isActive && (
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 사이드바 + 콘텐츠 레이아웃 */}
        <div className="flex gap-5">
          {/* 데스크톱 사이드바 */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <nav className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-2 sticky top-24 animate-slide-up">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.highlight
                          ? 'bg-red-100 text-red-600'
                          : isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                {activeTab === 'myProducts' && (
                  <>
                    {myProducts.length === 0 ? (
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="w-7 h-7 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                          등록한 상품이 없습니다
                        </h3>
                        <p className="text-slate-500 text-sm mb-5">
                          첫 상품을 등록하고 판매를 시작해보세요!
                        </p>
                        <Button onClick={() => router.push('/products/new')} size="sm">
                          <Plus className="w-4 h-4 mr-1.5" />
                          상품 등록하기
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                          찜한 상품이 없습니다
                        </h3>
                        <p className="text-slate-500 text-sm mb-5">
                          마음에 드는 상품을 찜해보세요!
                        </p>
                        <Button onClick={() => router.push('/')} size="sm">
                          <ShoppingBag className="w-4 h-4 mr-1.5" />
                          상품 둘러보기
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favoriteProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'transactions' && (
                  <>
                    {transactions.length === 0 ? (
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Receipt className="w-7 h-7 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                          완료된 거래가 없습니다
                        </h3>
                        <p className="text-slate-500 text-sm mb-5">
                          거래가 완료되면 여기에서 확인하고 리뷰를 작성할 수 있어요!
                        </p>
                        <Button onClick={() => router.push('/')} size="sm">
                          <ShoppingBag className="w-4 h-4 mr-1.5" />
                          상품 둘러보기
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx) => (
                          <TransactionCard
                            key={tx.id}
                            transaction={tx}
                            onWriteReview={(transaction) => {
                              setSelectedTransaction(transaction);
                              setIsWriteReviewModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'receivedOffers' && (
                  <>
                    {receivedOffers.length === 0 ? (
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Inbox className="w-7 h-7 text-primary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                          받은 가격 제안이 없습니다
                        </h3>
                        <p className="text-slate-500 text-sm">
                          판매중인 상품에 제안이 들어오면 여기에 표시됩니다.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {receivedOffers.map((offer) => (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            type="received"
                            onUpdate={fetchData}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'sentOffers' && (
                  <>
                    {sentOffers.length === 0 ? (
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="w-7 h-7 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                          보낸 가격 제안이 없습니다
                        </h3>
                        <p className="text-slate-500 text-sm mb-5">
                          관심있는 상품에 가격을 제안해보세요!
                        </p>
                        <Button onClick={() => router.push('/')} size="sm">
                          <ShoppingBag className="w-4 h-4 mr-1.5" />
                          상품 둘러보기
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sentOffers.map((offer) => (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            type="sent"
                            onUpdate={fetchData}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 리뷰 모달 */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsReviewModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-fade-in">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">받은 리뷰</h2>
                <span className="text-sm text-slate-500">({profile?.stats?.reviewCount || 0})</span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {isLoadingReviews ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    받은 리뷰가 없습니다
                  </h3>
                  <p className="text-slate-500 text-sm">
                    거래 완료 후 상대방이 리뷰를 남기면 여기에 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      {isWriteReviewModalOpen && selectedTransaction && (
        <WriteReviewModal
          transaction={selectedTransaction}
          onClose={() => {
            setIsWriteReviewModalOpen(false);
            setSelectedTransaction(null);
          }}
          onSuccess={() => {
            fetchData();
            fetchAllCounts();
          }}
        />
      )}
    </main>
  );
}
