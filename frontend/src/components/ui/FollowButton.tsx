'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { socialApi } from '@/lib/api/social';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useFollowStore } from '@/stores/followStore';

// ================================
// Types & Interfaces
// ================================

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  showText?: boolean;
  className?: string;
}

// ================================
// Component
// ================================

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
  variant = 'default',
  showText = true,
  className,
}: FollowButtonProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Zustand store에서 상태 가져오기
  const cachedFollowStatus = useFollowStore((state) => state.followingMap[userId]);
  const setFollowStatus = useFollowStore((state) => state.setFollowStatus);
  const incrementMyFollowingCount = useFollowStore((state) => state.incrementMyFollowingCount);
  const decrementMyFollowingCount = useFollowStore((state) => state.decrementMyFollowingCount);
  const notifyFollowChange = useFollowStore((state) => state.notifyFollowChange);

  // 로컬 상태 (캐시가 있으면 캐시 사용, 없으면 initialIsFollowing)
  const [isFollowing, setIsFollowing] = useState(
    cachedFollowStatus !== undefined ? cachedFollowStatus : initialIsFollowing
  );

  // 자기 자신인지 확인
  const isSelf = user?.id === userId;

  // ================================
  // Handlers
  // ================================

  const checkFollowStatus = async () => {
    try {
      const { isFollowing: following } = await socialApi.isFollowing(userId);
      setIsFollowing(following);
      setFollowStatus(userId, following); // 전역 캐시에 저장
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to check follow status:', error);
      }
    }
  };

  // ================================
  // Effects
  // ================================

  // 캐시 상태가 변경되면 로컬 상태 동기화
  useEffect(() => {
    if (cachedFollowStatus !== undefined) {
      setIsFollowing(cachedFollowStatus);
    }
  }, [cachedFollowStatus]);

  // 마운트 시 팔로우 상태 확인 (캐시가 없을 때만)
  useEffect(() => {
    if (isAuthenticated && !isSelf && cachedFollowStatus === undefined) {
      checkFollowStatus();
    }
  }, [userId, isAuthenticated, isSelf]);

  // 페이지 포커스 시 팔로우 상태 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && !isSelf) {
        checkFollowStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId, isAuthenticated, isSelf]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (isSelf) {
      toast.error('자기 자신은 팔로우할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await socialApi.unfollow(userId);
        setIsFollowing(false);
        setFollowStatus(userId, false); // 전역 캐시 업데이트
        decrementMyFollowingCount(); // 팔로잉 카운트 감소
        toast.success('팔로우를 취소했습니다.');
        onFollowChange?.(false);
        notifyFollowChange();
      } else {
        await socialApi.follow(userId);
        setIsFollowing(true);
        setFollowStatus(userId, true); // 전역 캐시 업데이트
        incrementMyFollowingCount(); // 팔로잉 카운트 증가
        toast.success('팔로우했습니다.');
        onFollowChange?.(true);
        notifyFollowChange();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '작업에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // Render
  // ================================

  if (isSelf) {
    return null;
  }

  const buttonVariant = isFollowing ? 'outline' : variant;
  const buttonSize = size === 'md' ? 'default' : size;

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={buttonVariant}
      size={buttonSize}
      className={cn('gap-2', className)}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          {showText && '팔로잉'}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {showText && '팔로우'}
        </>
      )}
    </Button>
  );
}
