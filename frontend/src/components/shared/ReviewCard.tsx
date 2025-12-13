'use client';

import Image from 'next/image';
import { Star, User } from 'lucide-react';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const reviewTypeLabel = review.review_type === 'BUYER_TO_SELLER'
    ? '구매자 → 판매자'
    : '판매자 → 구매자';

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        {/* 작성자 아바타 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {review.reviewer?.avatar_url ? (
            <Image
              src={review.reviewer.avatar_url}
              alt={review.reviewer.nickname || '사용자'}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-white text-sm font-bold">
              {review.reviewer?.nickname?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>

        {/* 리뷰 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">
                {review.reviewer?.nickname || '익명'}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                {reviewTypeLabel}
              </span>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">
              {formatDate(review.created_at)}
            </span>
          </div>

          {/* 별점 */}
          <div className="mb-2">
            {renderStars(review.rating)}
          </div>

          {/* 리뷰 텍스트 */}
          {review.content && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {review.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
