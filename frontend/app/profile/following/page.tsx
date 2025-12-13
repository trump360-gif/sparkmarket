'use client';

import { useEffect, useState } from 'react';
import { Users, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { socialApi } from '@/lib/api/social';
import { getErrorMessage } from '@/lib/errors';
import FollowButton from '@/components/ui/FollowButton';
import type { Follow } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

export default function FollowingPage() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<Follow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadFollowing();
    }
  }, [user, page]);

  const loadFollowing = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await socialApi.getMyFollowing({ page, limit: 20 });
      if (page === 1) {
        setFollowing(response.data);
      } else {
        setFollowing([...following, ...response.data]);
      }
      setHasMore(page < response.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, '팔로잉 목록을 불러오는데 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    if (!isFollowing) {
      // 언팔로우 시 목록에서 제거
      setFollowing(following.filter((f) => f.following_id !== userId));
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">팔로잉</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">내가 팔로우하는 사용자 목록입니다.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-t-lg shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="flex">
            <Link
              href="/profile/followers"
              className="flex-1 px-6 py-3 text-center font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent"
            >
              팔로워
            </Link>
            <Link
              href="/profile/following"
              className="flex-1 px-6 py-3 text-center font-medium text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
            >
              팔로잉
            </Link>
          </div>
        </div>

        {/* Following List */}
        <div className="bg-white dark:bg-slate-800 rounded-b-lg shadow-sm">
          {following.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <UserX className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                팔로잉이 없습니다
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                아직 팔로우하는 사용자가 없습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {following.map((follow) => {
                  const followingUser = follow.following;
                  if (!followingUser) return null;

                  return (
                    <div
                      key={follow.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/users/${followingUser.id}`}
                          className="flex items-center space-x-3 flex-1 min-w-0"
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {followingUser.avatar_url ? (
                              <Image
                                src={followingUser.avatar_url}
                                alt={followingUser.nickname}
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-300 text-lg font-medium">
                                  {followingUser.nickname.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {followingUser.nickname}
                            </p>
                            {followingUser.bio && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {followingUser.bio}
                              </p>
                            )}
                          </div>
                        </Link>

                        {/* Follow Button */}
                        <div className="flex-shrink-0 ml-4">
                          <FollowButton
                            userId={followingUser.id}
                            size="sm"
                            onFollowChange={(isFollowing) =>
                              handleFollowChange(followingUser.id, isFollowing)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '로딩 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
