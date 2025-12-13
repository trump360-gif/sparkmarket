'use client';

import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { reviewsApi } from '@/lib/api/reviews';
import type { TransactionWithDetails, ReviewType, CreateReviewRequest } from '@/types';
import { getErrorMessage } from '@/lib/errors';

interface WriteReviewModalProps {
  transaction: TransactionWithDetails;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WriteReviewModal({ transaction, onClose, onSuccess }: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const targetUser = transaction.myRole === 'buyer' ? transaction.seller : transaction.buyer;
  const roleText = transaction.myRole === 'buyer' ? '판매자' : '구매자';

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('별점을 선택해주세요');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reviewData: CreateReviewRequest = {
        transaction_id: transaction.id,
        rating,
        content: content.trim() || undefined,
        review_type: transaction.reviewType as ReviewType,
      };

      await reviewsApi.createReview(reviewData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, '리뷰 작성에 실패했습니다'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">리뷰 작성</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-white/90 mt-1">
            {targetUser.nickname} {roleText}님과의 거래는 어떠셨나요?
          </p>
        </div>

        {/* 내용 */}
        <div className="p-5 space-y-5">
          {/* 거래 정보 */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-600">
              거래 금액: <span className="font-semibold text-slate-900">{transaction.product_price.toLocaleString()}원</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(transaction.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} 거래 완료
            </p>
          </div>

          {/* 별점 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              별점
            </label>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">
              {rating === 1 && '별로예요'}
              {rating === 2 && '그저 그래요'}
              {rating === 3 && '보통이에요'}
              {rating === 4 && '좋아요'}
              {rating === 5 && '최고예요!'}
            </p>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              리뷰 내용 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${targetUser.nickname}님과의 거래 경험을 공유해주세요`}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right mt-1">
              {content.length}/500
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="border-t border-slate-100 p-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            className="flex-1 bg-amber-500 hover:bg-amber-600"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                작성 중...
              </>
            ) : (
              '리뷰 작성'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
