'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Star,
  Package,
  ShoppingBag,
  MapPin,
  Calendar,
  MoreVertical,
  Flag,
  ShieldBan,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api/users';
import { socialApi } from '@/lib/api/social';
import { productsApi } from '@/lib/api/products';
import FollowButton from '@/components/ui/FollowButton';
import ReportModal from '@/components/report/ReportModal';
import { ProductCard } from '@/components/shared';
import { Button } from '@/components/ui/Button';
import type { UserProfile, Product, FollowStats } from '@/types';
import { ProductStatus } from '@/types';
import Link from 'next/link';
import { useFollowStore } from '@/stores/followStore';
import { getErrorMessage } from '@/lib/errors';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Zustand에서 팔로우 상태 가져오기
  const cachedFollowStatus = useFollowStore((state) => state.followingMap[userId]);

  const isSelf = currentUser?.id === userId;

  useEffect(() => {
    loadUserProfile();
    loadUserProducts();
    checkBlockStatus();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const data = await usersApi.getUserProfile(userId);
      setProfile(data);
      // 프로필에서 팔로우 통계 추출
      if (data.stats) {
        setFollowStats({
          followersCount: data.stats.followersCount || 0,
          followingCount: data.stats.followingCount || 0,
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error, '사용자 정보를 불러오는데 실패했습니다.'));
      router.push('/');
    }
  };

  const loadUserProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productsApi.getProducts({
        seller_id: userId,
        status: ProductStatus.FOR_SALE,
        limit: 12,
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load user products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBlockStatus = async () => {
    if (!currentUser || isSelf) return;

    try {
      const { isBlocked: blocked } = await socialApi.isBlocked(userId);
      setIsBlocked(blocked);
    } catch (error) {
      console.error('Failed to check block status:', error);
    }
  };

  const handleBlockToggle = async () => {
    if (!currentUser) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const confirmMessage = isBlocked
      ? '차단을 해제하시겠습니까?'
      : '이 사용자를 차단하시겠습니까? 차단하면 서로의 게시물과 프로필을 볼 수 없습니다.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      if (isBlocked) {
        await socialApi.unblockUser(userId);
        setIsBlocked(false);
        toast.success('차단을 해제했습니다.');
      } else {
        await socialApi.blockUser(userId);
        setIsBlocked(true);
        toast.success('차단했습니다.');
      }
      setShowMenu(false);
    } catch (error) {
      toast.error(getErrorMessage(error, '작업에 실패했습니다.'));
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-16">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {isBlocked && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center">
                <ShieldBan className="h-4 w-4 mr-2" />
                차단한 사용자입니다. 일부 정보가 제한됩니다.
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.nickname}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-slate-300 text-4xl font-medium">
                    {profile.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {profile.nickname}
                  </h1>
                  {profile.bio && (
                    <p className="text-gray-600 dark:text-slate-400 mb-2">{profile.bio}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {!isSelf && (
                    <>
                      <FollowButton
                        userId={userId}
                        onFollowChange={(isFollowing) => {
                          // 팔로우/언팔로우 시 팔로워 카운트 즉시 업데이트
                          setFollowStats((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              followersCount: prev.followersCount + (isFollowing ? 1 : -1),
                            };
                          });
                        }}
                      />

                      {/* More Menu */}
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowMenu(!showMenu)}
                          className="border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                        </Button>

                        {showMenu && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-20">
                              <button
                                onClick={() => {
                                  setShowMenu(false);
                                  setShowReportModal(true);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center"
                              >
                                <Flag className="h-4 w-4 mr-2" />
                                신고하기
                              </button>
                              <button
                                onClick={handleBlockToggle}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center"
                              >
                                <ShieldBan className="h-4 w-4 mr-2" />
                                {isBlocked ? '차단 해제' : '차단하기'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-medium mr-1">
                    {profile.stats.rating.toFixed(1)}
                  </span>
                  <span>({profile.stats.reviewCount}개 리뷰)</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                  <Package className="h-4 w-4 mr-1" />
                  <span>판매 {profile.stats.salesCount}건</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  <span>구매 {profile.stats.purchaseCount}건</span>
                </div>
              </div>

              {/* Follow Stats */}
              {followStats && (
                <div className="flex gap-4 mb-3">
                  <Link
                    href={isSelf ? '/profile/followers' : '#'}
                    className="text-sm text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <span className="font-medium">{followStats.followersCount}</span>{' '}
                    <span className="text-gray-600 dark:text-slate-400">팔로워</span>
                  </Link>
                  <Link
                    href={isSelf ? '/profile/following' : '#'}
                    className="text-sm text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <span className="font-medium">{followStats.followingCount}</span>{' '}
                    <span className="text-gray-600 dark:text-slate-400">팔로잉</span>
                  </Link>
                </div>
              )}

              <div className="flex items-center text-xs text-gray-500 dark:text-slate-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            판매중인 상품 ({products.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">판매중인 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="USER"
        targetId={userId}
        targetName={profile.nickname}
      />
    </div>
  );
}
