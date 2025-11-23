'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { favoritesApi } from '@/lib/api/favorites';

interface FavoriteButtonProps {
  productId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function FavoriteButton({
  productId,
  initialFavorited = false,
  size = 'md',
  showText = false,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 로그인 상태일 때만 찜 여부 확인
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [productId, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      const { isFavorited: favorited } = await favoritesApi.checkFavorite(productId);
      setIsFavorited(favorited);
    } catch (error) {
      // 에러는 무시 (로그인 안 된 상태일 수 있음)
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // 부모 링크 클릭 방지
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const { isFavorited: newStatus } = await favoritesApi.toggleFavorite(productId);
      setIsFavorited(newStatus);
      toast.success(newStatus ? '찜 목록에 추가되었습니다.' : '찜 목록에서 제거되었습니다.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '작업에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 ${
        isFavorited ? 'text-red-500' : 'text-gray-400'
      }`}
      title={isFavorited ? '찜 취소' : '찜하기'}
    >
      {isFavorited ? '❤️' : '🤍'}
      {showText && <span className="ml-2 text-sm">{isFavorited ? '찜 취소' : '찜하기'}</span>}
    </button>
  );
}
