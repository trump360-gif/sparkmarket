'use client';

import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { priceOffersApi } from '@/lib/api/priceOffers';
import { Button } from '@/components/ui/Button';
import { Clock, Check, X, MessageSquare, User, ShoppingCart } from 'lucide-react';
import type { PriceOffer } from '@/types';

interface OfferCardProps {
  offer: PriceOffer;
  type: 'sent' | 'received';
  onUpdate?: () => void;
}

export default function OfferCard({ offer, type, onUpdate }: OfferCardProps) {
  const primaryImage =
    offer.product?.images?.find((img) => img.is_primary) ||
    offer.product?.images?.[0];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price);

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
      ACCEPTED: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700',
      REJECTED: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700',
      EXPIRED: 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600',
    };

    const labels = {
      PENDING: '대기중',
      ACCEPTED: '수락됨',
      REJECTED: '거절됨',
      EXPIRED: '만료됨',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleAccept = async () => {
    if (!confirm('이 제안을 수락하시겠습니까?')) return;

    try {
      await priceOffersApi.acceptOffer(offer.id);
      toast.success('제안을 수락했습니다. 구매자에게 특별 가격으로 구매할 권한이 부여되었습니다.');
      onUpdate?.();
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
        const message = error.response?.data?.message || '수락에 실패했습니다.';
        toast.error(message);
      }
    }
  };

  const handleReject = async () => {
    if (!confirm('이 제안을 거절하시겠습니까?')) return;

    try {
      await priceOffersApi.rejectOffer(offer.id);
      toast.success('제안을 거절했습니다.');
      onUpdate?.();
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
        const message = error.response?.data?.message || '거절에 실패했습니다.';
        toast.error(message);
      }
    }
  };

  const expiresAt = new Date(offer.expires_at);
  const now = new Date();
  const isExpired = now > expiresAt;
  const hoursLeft = Math.max(
    0,
    Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)),
  );

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all p-4 border border-slate-100 dark:border-slate-700">
      <div className="flex gap-4">
        {/* 상품 이미지 */}
        <Link
          href={`/products/${offer.product_id}`}
          className="flex-shrink-0 w-20 h-20 relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={offer.product?.title || '상품'}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
              이미지 없음
            </div>
          )}
        </Link>

        {/* 제안 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${offer.product_id}`}
                className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate block text-base transition-colors"
              >
                {offer.product?.title}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />
                {type === 'sent' ? '판매자' : '구매자'}:{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {type === 'sent'
                    ? offer.seller?.nickname
                    : offer.buyer?.nickname}
                </span>
              </p>
            </div>
            <div className="flex-shrink-0">{getStatusBadge(offer.status)}</div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-slate-400 dark:text-slate-500 line-through text-xs">
              {formatPrice(offer.product?.price || 0)}원
            </span>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
              {formatPrice(offer.offered_price)}원
            </span>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-medium">
              -{formatPrice((offer.product?.price || 0) - offer.offered_price)}원
            </span>
          </div>

          {offer.message && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 mb-2 flex items-start gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{offer.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {isExpired || offer.status !== 'PENDING' ? (
                <span>
                  {new Date(offer.created_at).toLocaleString('ko-KR')}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {hoursLeft}시간 남음
                </span>
              )}
            </div>

            {/* 수락/거절 버튼 (판매자가 받은 제안인 경우) */}
            {type === 'received' && offer.status === 'PENDING' && !isExpired && (
              <div className="flex gap-1.5">
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className="gap-1 text-xs px-2.5 py-1.5 h-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  수락
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  size="sm"
                  className="gap-1 text-xs px-2.5 py-1.5 h-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  거절
                </Button>
              </div>
            )}

            {/* 구매하기 버튼 (보낸 제안이 수락된 경우) */}
            {type === 'sent' && offer.status === 'ACCEPTED' && (
              <Link href={`/products/${offer.product_id}`}>
                <Button
                  size="sm"
                  className="gap-1 text-xs px-2.5 py-1.5 h-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  구매하기
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
