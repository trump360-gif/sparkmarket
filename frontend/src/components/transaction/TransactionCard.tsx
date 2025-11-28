'use client';

import { ArrowRight, Check, Pencil, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { TransactionWithDetails } from '@/types';

interface TransactionCardProps {
  transaction: TransactionWithDetails;
  onWriteReview: (transaction: TransactionWithDetails) => void;
}

export default function TransactionCard({ transaction, onWriteReview }: TransactionCardProps) {
  const isSeller = transaction.myRole === 'seller';
  const otherUser = isSeller ? transaction.buyer : transaction.seller;
  const roleLabel = isSeller ? '판매' : '구매';
  const roleColor = isSeller ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* 거래 상대 아바타 */}
        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold overflow-hidden flex-shrink-0">
          {otherUser.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>

        {/* 거래 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor}`}>
              {roleLabel}
            </span>
            <span className="text-sm font-medium text-slate-900 truncate">
              {otherUser.nickname}
            </span>
          </div>

          <div className="flex items-center text-sm text-slate-600 gap-2">
            <span className="font-semibold text-slate-900">
              {transaction.product_price.toLocaleString()}원
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              {formatDate(transaction.created_at)}
            </span>
          </div>

          {/* 수수료 정보 (판매자인 경우) */}
          {isSeller && (
            <div className="text-xs text-slate-500 mt-1">
              정산금액: {transaction.seller_amount.toLocaleString()}원
              <span className="text-slate-400 ml-1">
                (수수료 {transaction.commission_rate}%)
              </span>
            </div>
          )}
        </div>

        {/* 리뷰 작성 버튼 */}
        <div className="flex-shrink-0">
          {transaction.canWriteReview ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWriteReview(transaction)}
              className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              리뷰 작성
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" />
              리뷰 완료
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
