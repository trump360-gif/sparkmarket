'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { socialApi } from '@/lib/api/social';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  showText?: boolean;
  className?: string;
}

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
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // 자기 자신인지 확인
  const isSelf = user?.id === userId;

  useEffect(() => {
    // 로그인 상태이고 자기 자신이 아닐 때만 팔로우 상태 확인
    if (isAuthenticated && !isSelf) {
      checkFollowStatus();
    }
  }, [userId, isAuthenticated, isSelf]);

  const checkFollowStatus = async () => {
    try {
      const { isFollowing: following } = await socialApi.isFollowing(userId);
      setIsFollowing(following);
    } catch (error: any) {
      // 401 에러는 무시 (로그인 안 된 상태)
      if (error.response?.status !== 401) {
        console.error('Failed to check follow status:', error);
      }
    }
  };

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
        toast.success('팔로우를 취소했습니다.');
        onFollowChange?.(false);
      } else {
        await socialApi.follow(userId);
        setIsFollowing(true);
        toast.success('팔로우했습니다.');
        onFollowChange?.(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '작업에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 자기 자신이면 버튼을 표시하지 않음
  if (isSelf) {
    return null;
  }

  const buttonVariant = isFollowing
    ? 'outline'
    : variant;

  // Map size to Button size (Button doesn't support 'md')
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
