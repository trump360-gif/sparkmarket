'use client';

import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { priceOffersApi } from '@/lib/api/priceOffers';
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
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      PENDING: '대기중',
      ACCEPTED: '수락됨',
      REJECTED: '거절됨',
      EXPIRED: '만료됨',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}
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
      const message = error.response?.data?.message || '수락에 실패했습니다.';
      toast.error(message);
    }
  };

  const handleReject = async () => {
    if (!confirm('이 제안을 거절하시겠습니까?')) return;

    try {
      await priceOffersApi.rejectOffer(offer.id);
      toast.success('제안을 거절했습니다.');
      onUpdate?.();
    } catch (error: any) {
      const message = error.response?.data?.message || '거절에 실패했습니다.';
      toast.error(message);
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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200">
      <div className="flex space-x-4">
        {/* 상품 이미지 */}
        <Link
          href={`/products/${offer.product_id}`}
          className="flex-shrink-0 w-24 h-24 relative bg-gray-200 rounded-md overflow-hidden"
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={offer.product?.title || '상품'}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </Link>

        {/* 제안 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${offer.product_id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 truncate block"
              >
                {offer.product?.title}
              </Link>
              <p className="text-sm text-gray-500">
                {type === 'sent' ? '판매자' : '구매자'}:{' '}
                {type === 'sent'
                  ? offer.seller?.nickname
                  : offer.buyer?.nickname}
              </p>
            </div>
            <div className="ml-4">{getStatusBadge(offer.status)}</div>
          </div>

          <div className="space-y-1 mb-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm text-gray-600">원가:</span>
              <span className="text-gray-900 line-through">
                {formatPrice(offer.product?.price || 0)}원
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-sm text-gray-600">제안가:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(offer.offered_price)}원
              </span>
              <span className="text-sm text-green-600">
                (
                {formatPrice(
                  (offer.product?.price || 0) - offer.offered_price,
                )}
                원 할인)
              </span>
            </div>
          </div>

          {offer.message && (
            <div className="bg-gray-50 rounded p-2 mb-3">
              <p className="text-sm text-gray-700">{offer.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {isExpired || offer.status !== 'PENDING' ? (
                <span>
                  {new Date(offer.created_at).toLocaleString('ko-KR')}
                </span>
              ) : (
                <span className="text-orange-600 font-medium">
                  {hoursLeft}시간 남음
                </span>
              )}
            </div>

            {/* 수락/거절 버튼 (판매자가 받은 제안인 경우) */}
            {type === 'received' && offer.status === 'PENDING' && !isExpired && (
              <div className="flex space-x-2">
                <button
                  onClick={handleAccept}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  수락
                </button>
                <button
                  onClick={handleReject}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  거절
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
