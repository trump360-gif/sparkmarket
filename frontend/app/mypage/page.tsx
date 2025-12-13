'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/lib/api/products';
import { favoritesApi } from '@/lib/api/favorites';
import { priceOffersApi } from '@/lib/api/priceOffers';
import { usersApi } from '@/lib/api/users';
import { reviewsApi } from '@/lib/api/reviews';
import { socialApi } from '@/lib/api/social';
import { keywordAlertsApi } from '@/lib/api/keywordAlerts';
import { recentViewsApi } from '@/lib/api/recentViews';
import { ProductCard, OfferCard, ReviewCard } from '@/components/shared';
import TransactionCard from '@/components/transaction/TransactionCard';
import WriteReviewModal from '@/components/review/WriteReviewModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Package, Heart, Plus, ShoppingBag, Inbox, Send, Settings, Star, MessageSquare, X, ChevronRight, Receipt, Bell, Ban, Users, Clock } from 'lucide-react';
import type { Product, PriceOffer, Review, UserProfile, TransactionWithDetails, Follow, KeywordAlert, Block } from '@/types';
import { useFollowStore } from '@/stores/followStore';
import { isApiError, getErrorStatus } from '@/lib/errors';

type TabType = 'myProducts' | 'favorites' | 'transactions' | 'receivedOffers' | 'sentOffers' | 'follows' | 'keywordAlerts' | 'recentViews' | 'blocks';
type FollowSubTab = 'followers' | 'following';

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
  const [isCountsLoading, setIsCountsLoading] = useState(true);
  const [offerCounts, setOfferCounts] = useState({ sent: 0, received: 0 });
  const [transactionCount, setTransactionCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [myProductCount, setMyProductCount] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);

  // 추가 메뉴용 state
  const [followingList, setFollowingList] = useState<Follow[]>([]);
  const [followersList, setFollowersList] = useState<Follow[]>([]);
  const [keywordAlerts, setKeywordAlerts] = useState<KeywordAlert[]>([]);
  const [recentViewProducts, setRecentViewProducts] = useState<Product[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [keywordAlertCount, setKeywordAlertCount] = useState(0);
  const [recentViewCount, setRecentViewCount] = useState(0);
  const [blockCount, setBlockCount] = useState(0);
  const [followSubTab, setFollowSubTab] = useState<FollowSubTab>('followers');
  const mountedRef = useRef(false);

  // Zustand 전역 상태에서 팔로우 카운트 가져오기
  const followChangeCounter = useFollowStore((state) => state.followChangeCounter);
  const myFollowingCount = useFollowStore((state) => state.myFollowingCount);
  const myFollowersCount = useFollowStore((state) => state.myFollowersCount);
  const setMyFollowingCount = useFollowStore((state) => state.setMyFollowingCount);
  const setMyFollowersCount = useFollowStore((state) => state.setMyFollowersCount);

  // 메인 메뉴 아이템 배열
  const mainMenuItems = [
    { id: 'myProducts' as TabType, icon: Package, label: '내 상품', count: myProductCount },
    { id: 'favorites' as TabType, icon: Heart, label: '찜 목록', count: favoriteCount },
    { id: 'transactions' as TabType, icon: Receipt, label: '거래 내역', count: transactionCount },
    { id: 'receivedOffers' as TabType, icon: Inbox, label: '받은 제안', count: offerCounts.received, highlight: offerCounts.received > 0 },
    { id: 'sentOffers' as TabType, icon: Send, label: '보낸 제안', count: offerCounts.sent },
  ];

  // 추가 메뉴 아이템 (사이드바 하단) - 인라인 탭으로 변경
  const extraMenuItems = [
    { id: 'keywordAlerts' as TabType, icon: Bell, label: '키워드 알림', count: keywordAlertCount },
    { id: 'recentViews' as TabType, icon: Clock, label: '최근 본 상품', count: recentViewCount },
    { id: 'blocks' as TabType, icon: Ban, label: '차단 관리', count: blockCount },
  ];


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // 컴포넌트 마운트 시 데이터 로드 (네비게이션 시에도 항상 새로고침)
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchData();
      fetchAllCounts();
      mountedRef.current = true;
    }
  }, [isAuthenticated, activeTab]);

  // 팔로우 상태 변경 시 카운트 새로고침 (전역 상태 구독)
  useEffect(() => {
    if (followChangeCounter > 0 && isAuthenticated) {
      fetchAllCounts();
      if (activeTab === 'follows') {
        fetchData();
      }
    }
  }, [followChangeCounter]);

  // 페이지 포커스 또는 visibility 변경 시 데이터 새로고침 (다른 페이지에서 팔로우/언팔로우 후 돌아왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchAllCounts();
        // 현재 탭이 follows일 경우 데이터도 다시 가져오기
        if (activeTab === 'follows') {
          fetchData();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        fetchAllCounts();
        if (activeTab === 'follows') {
          fetchData();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, activeTab]);

  const fetchProfile = async () => {
    try {
      const data = await usersApi.getMyProfile();
      setProfile(data);
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
        console.error('Failed to fetch profile:', error);
      }
    }
  };

  const fetchAllCounts = async () => {
    setIsCountsLoading(true);
    try {
      const [sent, received, txs, favorites, products, following, followers, keywords, recent, blockedUsers] = await Promise.all([
        priceOffersApi.getSentOffers({ limit: 1 }),
        priceOffersApi.getReceivedOffers({ limit: 1 }),
        usersApi.getMyTransactions({ limit: 1 }),
        favoritesApi.getFavorites({ limit: 1 }),
        productsApi.getProducts({ page: 1, limit: 100 }),
        socialApi.getMyFollowing({ limit: 1 }),
        socialApi.getMyFollowers({ limit: 1 }),
        keywordAlertsApi.getMyKeywordAlerts(),
        recentViewsApi.getRecentViews(100),
        socialApi.getBlockedUsers({ limit: 1 }),
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
      // 추가 메뉴 카운트 - Zustand 전역 상태에 저장
      setMyFollowingCount(following.total || 0);
      setMyFollowersCount(followers.total || 0);
      setKeywordAlertCount(keywords.length);
      setRecentViewCount(recent.total || 0);
      setBlockCount(blockedUsers.total || 0);
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
        console.error('Failed to fetch counts:', error);
      }
    } finally {
      setIsCountsLoading(false);
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
      } else if (activeTab === 'follows') {
        // 팔로워/팔로잉 둘 다 로드
        const [followingRes, followersRes] = await Promise.all([
          socialApi.getMyFollowing({ limit: 20 }),
          socialApi.getMyFollowers({ limit: 20 }),
        ]);
        setFollowingList(followingRes.data);
        setFollowersList(followersRes.data);
      } else if (activeTab === 'keywordAlerts') {
        const alerts = await keywordAlertsApi.getMyKeywordAlerts();
        setKeywordAlerts(alerts);
      } else if (activeTab === 'recentViews') {
        const views = await recentViewsApi.getRecentViews(20);
        setRecentViewProducts(views.data || []);
      } else if (activeTab === 'blocks') {
        const response = await socialApi.getBlockedUsers({ limit: 20 });
        setBlocks(response.data);
      }
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
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
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 right-0 h-60 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-1/4 w-48 h-48 bg-primary-400/10 dark:bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary-400/10 dark:bg-secondary-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {/* 프로필 헤더 */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-5 mb-5 animate-fade-in">
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.nickname}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
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
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    판매 {profile?.stats?.salesCount ?? 0} · 구매 {profile?.stats?.purchaseCount ?? 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                      onClick={() => router.push('/profile/followers')}
                      className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {isCountsLoading ? (
                        <span className="inline-flex items-center gap-1">
                          팔로워 <Skeleton className="w-4 h-3 inline-block" /> · 팔로잉 <Skeleton className="w-4 h-3 inline-block" />
                        </span>
                      ) : (
                        `팔로워 ${myFollowersCount} · 팔로잉 ${myFollowingCount}`
                      )}
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
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              {profile.bio}
            </p>
          )}

        </div>

        {/* 모바일 탭 메뉴 */}
        <div className="lg:hidden mb-4 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                  {isActive && (
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {isCountsLoading ? '-' : item.count}
                    </span>
                  )}
                </button>
              );
            })}
            {/* 팔로워/팔로잉 토글 버튼 (모바일) */}
            <button
              onClick={() => {
                if (activeTab === 'follows') {
                  setFollowSubTab(followSubTab === 'followers' ? 'following' : 'followers');
                } else {
                  setActiveTab('follows');
                }
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'follows'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
              }`}>
              <Users className={`w-4 h-4 ${activeTab === 'follows' ? 'text-white' : 'text-slate-400'}`} />
              <span className={`transition-all ${
                activeTab === 'follows' && followSubTab === 'followers'
                  ? 'text-white font-semibold'
                  : activeTab === 'follows'
                    ? 'text-white/60'
                    : 'text-slate-500 dark:text-slate-400'
              }`}>
                팔로워
              </span>
              <span className={activeTab === 'follows' ? 'text-white/50' : 'text-slate-300 dark:text-slate-600'}>/</span>
              <span className={`transition-all ${
                activeTab === 'follows' && followSubTab === 'following'
                  ? 'text-white font-semibold'
                  : activeTab === 'follows'
                    ? 'text-white/60'
                    : 'text-slate-500 dark:text-slate-400'
              }`}>
                팔로잉
              </span>
            </button>
            {/* 추가 메뉴 (모바일) */}
            {extraMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {isCountsLoading ? '-' : item.count}
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
            <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-2 sticky top-24 animate-slide-up">
              <div className="space-y-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-l-2 border-primary-500'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                      }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.highlight
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : isActive
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isCountsLoading ? '-' : item.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 추가 메뉴 (데스크톱) */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="px-3 mb-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">더보기</p>
                <div className="space-y-1">
                  {/* 팔로워/팔로잉 토글 버튼 */}
                  <button
                    onClick={() => {
                      if (activeTab === 'follows') {
                        setFollowSubTab(followSubTab === 'followers' ? 'following' : 'followers');
                      } else {
                        setActiveTab('follows');
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'follows'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-l-2 border-primary-500'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                    }`}>
                    <Users className={`w-4 h-4 ${activeTab === 'follows' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left flex items-center gap-1">
                      <span className={`transition-all ${
                        activeTab === 'follows' && followSubTab === 'followers'
                          ? 'text-primary-700 dark:text-primary-400 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        팔로워
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">/</span>
                      <span className={`transition-all ${
                        activeTab === 'follows' && followSubTab === 'following'
                          ? 'text-primary-700 dark:text-primary-400 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        팔로잉
                      </span>
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === 'follows'
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isCountsLoading ? '-' : (followSubTab === 'followers' ? myFollowersCount : myFollowingCount)}
                    </span>
                  </button>
                  {extraMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-l-2 border-primary-500'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                        }`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {isCountsLoading ? '-' : item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="w-7 h-7 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          등록한 상품이 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
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
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          찜한 상품이 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
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
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Receipt className="w-7 h-7 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          완료된 거래가 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
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
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Inbox className="w-7 h-7 text-primary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          받은 가격 제안이 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
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
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-secondary-50 dark:bg-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="w-7 h-7 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          보낸 가격 제안이 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
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

                {/* 팔로워/팔로잉 통합 탭 */}
                {activeTab === 'follows' && (
                  <div className="animate-fade-in">
                    {/* 팔로워 목록 */}
                    {followSubTab === 'followers' && (
                      <>
                        {followersList.length === 0 ? (
                          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                              팔로워가 없습니다
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                              상품을 등록하면 팔로워가 생길 거예요!
                            </p>
                            <Button onClick={() => router.push('/products/new')} size="sm">
                              <Plus className="w-4 h-4 mr-1.5" />
                              상품 등록하기
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                            {followersList.map((follow) => {
                              // follower 속성이 있는지 확인하여 타입 좁히기
                              if (!follow.follower) return null;
                              const followerUser = follow.follower;
                              if (!followerUser.id) return null;
                              return (
                                <Link
                                  key={follow.id}
                                  href={`/users/${followerUser.id}`}
                                  className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium overflow-hidden relative">
                                    {followerUser.avatar_url ? (
                                      <Image
                                        src={followerUser.avatar_url}
                                        alt={followerUser.nickname}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      followerUser.nickname?.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white truncate">{followerUser.nickname}</p>
                                    {followerUser.bio && (
                                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{followerUser.bio}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {/* 팔로잉 목록 */}
                    {followSubTab === 'following' && (
                      <>
                        {followingList.length === 0 ? (
                          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                              팔로우 중인 사용자가 없습니다
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                              관심있는 판매자를 팔로우해보세요!
                            </p>
                            <Button onClick={() => router.push('/')} size="sm">
                              <ShoppingBag className="w-4 h-4 mr-1.5" />
                              상품 둘러보기
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                            {followingList.map((follow) => {
                              // following 속성이 있는지 확인하여 타입 좁히기
                              if (!follow.following) return null;
                              const followingUser = follow.following;
                              if (!followingUser.id) return null;
                              return (
                                <Link
                                  key={follow.id}
                                  href={`/users/${followingUser.id}`}
                                  className="flex items-center gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium overflow-hidden relative">
                                    {followingUser.avatar_url ? (
                                      <Image
                                        src={followingUser.avatar_url}
                                        alt={followingUser.nickname}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      followingUser.nickname?.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white truncate">{followingUser.nickname}</p>
                                    {followingUser.bio && (
                                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{followingUser.bio}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 키워드 알림 탭 */}
                {activeTab === 'keywordAlerts' && (
                  <>
                    {keywordAlerts.length === 0 ? (
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-7 h-7 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          등록된 키워드가 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                          원하는 키워드를 등록하면 새 상품이 올라올 때 알려드려요!
                        </p>
                        <Button onClick={() => router.push('/profile/keyword-alerts')} size="sm">
                          <Plus className="w-4 h-4 mr-1.5" />
                          키워드 등록하기
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-fade-in">
                        {keywordAlerts.map((alert) => (
                          <div key={alert.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.is_active ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                  <Bell className={`w-5 h-5 ${alert.is_active ? 'text-amber-500' : 'text-slate-400'}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{alert.keyword}</p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    {alert.category && <span>{alert.category}</span>}
                                    {alert.min_price !== undefined && alert.max_price !== undefined && (
                                      <span>{alert.min_price.toLocaleString()}원 ~ {alert.max_price.toLocaleString()}원</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${alert.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                {alert.is_active ? '활성' : '비활성'}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Button onClick={() => router.push('/profile/keyword-alerts')} variant="outline" size="sm" className="w-full">
                          <Plus className="w-4 h-4 mr-1.5" />
                          키워드 관리
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* 최근 본 상품 탭 */}
                {activeTab === 'recentViews' && (
                  <>
                    {recentViewProducts.length === 0 ? (
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-7 h-7 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          최근 본 상품이 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                          상품을 둘러보시면 여기에 기록됩니다!
                        </p>
                        <Button onClick={() => router.push('/')} size="sm">
                          <ShoppingBag className="w-4 h-4 mr-1.5" />
                          상품 둘러보기
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentViewProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 차단 관리 탭 */}
                {activeTab === 'blocks' && (
                  <>
                    {blocks.length === 0 ? (
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-10 text-center animate-fade-in">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Ban className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                          차단한 사용자가 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          불쾌한 사용자를 차단하면 여기에 표시됩니다.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 animate-fade-in">
                        {blocks.map((block) => {
                          const blockedUser = block.blocked;
                          if (!blockedUser) return null;
                          return (
                            <div key={block.id} className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-medium overflow-hidden relative">
                                  {blockedUser.avatar_url ? (
                                    <Image
                                      src={blockedUser.avatar_url}
                                      alt={blockedUser.nickname}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    blockedUser.nickname?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{blockedUser.nickname}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(block.created_at).toLocaleDateString('ko-KR')}에 차단됨
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await socialApi.unblockUser(blockedUser.id);
                                    setBlocks(blocks.filter(b => b.blocked_id !== blockedUser.id));
                                    setBlockCount(prev => prev - 1);
                                  } catch (error) {
                                    console.error('Failed to unblock user:', error);
                                  }
                                }}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                차단 해제
                              </Button>
                            </div>
                          );
                        })}
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
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-fade-in">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">받은 리뷰</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">({profile?.stats?.reviewCount || 0})</span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
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
                  <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                    받은 리뷰가 없습니다
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
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
