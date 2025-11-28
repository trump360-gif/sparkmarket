'use client';

import { useEffect, useState } from 'react';
import { ShieldBan, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { socialApi } from '@/lib/api/social';
import { Button } from '@/components/ui/Button';
import type { Block } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await socialApi.getBlockedUsers({ limit: 100 });
      setBlockedUsers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '차단 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!confirm('차단을 해제하시겠습니까?')) {
      return;
    }

    setUnblockingId(userId);
    try {
      await socialApi.unblockUser(userId);
      setBlockedUsers(blockedUsers.filter((block) => block.blocked_id !== userId));
      toast.success('차단을 해제했습니다.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '차단 해제에 실패했습니다.');
    } finally {
      setUnblockingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldBan className="h-6 w-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">차단 관리</h1>
          </div>
          <p className="text-gray-600">
            차단한 사용자는 회원님의 게시물과 프로필을 볼 수 없습니다.
          </p>
        </div>

        {/* Blocked Users List */}
        <div className="bg-white rounded-lg shadow-sm">
          {blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <UserX className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                차단한 사용자가 없습니다
              </h3>
              <p className="text-sm text-gray-500 text-center">
                차단한 사용자가 없습니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {blockedUsers.map((block) => (
                <div
                  key={block.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/users/${block.blocked_id}`}
                      className="flex items-center space-x-3 flex-1 min-w-0"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {block.blocked?.avatar_url ? (
                          <Image
                            src={block.blocked.avatar_url}
                            alt={block.blocked.nickname}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-medium">
                              {block.blocked?.nickname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {block.blocked?.nickname}
                        </p>
                        <p className="text-xs text-gray-500">
                          차단일: {new Date(block.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </Link>

                    {/* Unblock Button */}
                    <div className="flex-shrink-0 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblock(block.blocked_id)}
                        disabled={unblockingId === block.blocked_id}
                      >
                        {unblockingId === block.blocked_id ? '해제 중...' : '차단 해제'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
