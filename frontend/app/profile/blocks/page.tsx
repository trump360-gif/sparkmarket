'use client';

import { useEffect, useState } from 'react';
import { Ban, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { socialApi } from '@/lib/api/social';
import type { Block } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

export default function BlocksPage() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadBlocks();
    }
  }, [user, page]);

  const loadBlocks = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await socialApi.getBlockedUsers({ page, limit: 20 });
      if (page === 1) {
        setBlocks(response.data);
      } else {
        setBlocks([...blocks, ...response.data]);
      }
      setHasMore(page < response.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '차단 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const handleUnblock = async (userId: string) => {
    try {
      await socialApi.unblockUser(userId);
      setBlocks(blocks.filter((b) => b.blocked_id !== userId));
      toast.success('차단이 해제되었습니다.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '차단 해제에 실패했습니다.');
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
            <Ban className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">차단 관리</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">차단한 사용자 목록입니다. 차단된 사용자의 상품과 프로필이 숨겨집니다.</p>
        </div>

        {/* Blocks List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <UserX className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                차단한 사용자가 없습니다
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                불쾌한 사용자를 차단하면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {blocks.map((block) => {
                  const blockedUser = block.blocked;
                  if (!blockedUser) return null;

                  return (
                    <div
                      key={block.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {blockedUser.avatar_url ? (
                              <Image
                                src={blockedUser.avatar_url}
                                alt={blockedUser.nickname}
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-300 text-lg font-medium">
                                  {blockedUser.nickname.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {blockedUser.nickname}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(block.created_at).toLocaleDateString('ko-KR')}에 차단됨
                            </p>
                          </div>
                        </div>

                        {/* Unblock Button */}
                        <div className="flex-shrink-0 ml-4">
                          <button
                            onClick={() => handleUnblock(blockedUser.id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          >
                            차단 해제
                          </button>
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
