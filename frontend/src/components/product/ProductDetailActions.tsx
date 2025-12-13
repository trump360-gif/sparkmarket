'use client';

// ================================
// Types & Interfaces
// ================================

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Edit3, Trash2, ShoppingCart, MessageCircle, Tag, User, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';
import { ProductStatus } from '@/types';

interface ProductDetailActionsProps {
  product: Product;
  isOwner: boolean;
  isDeleting: boolean;
  handlers: {
    handleEdit: () => void;
    handleDelete: () => Promise<void>;
    handlePurchase: () => Promise<void>;
    handleInquiry: () => void;
    handleReport: () => void;
    setIsOfferModalOpen: (open: boolean) => void;
  };
  sellerProducts: Product[];
}

// ================================
// Component
// ================================

export default function ProductDetailActions({
  product,
  isOwner,
  isDeleting,
  handlers,
  sellerProducts,
}: ProductDetailActionsProps) {
  const router = useRouter();

  return (
    <>
      {/* 액션 버튼 */}
      <div className="space-y-2">
        {isOwner ? (
          <div className="flex gap-2">
            <Button
              onClick={handlers.handleEdit}
              className="flex-1"
              size="sm"
            >
              <Edit3 className="w-4 h-4 mr-1.5" />
              수정
            </Button>
            <Button
              onClick={handlers.handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={handlers.handlePurchase}
              disabled={product.status !== ProductStatus.FOR_SALE}
              className="w-full"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              {product.status === ProductStatus.SOLD && '판매완료'}
              {product.status === ProductStatus.FOR_SALE && '구매하기'}
              {product.status === ProductStatus.PENDING_REVIEW && '검토 대기 중'}
              {product.status === ProductStatus.REJECTED && '구매 불가'}
            </Button>
            <Button
              onClick={() => handlers.setIsOfferModalOpen(true)}
              disabled={product.status !== ProductStatus.FOR_SALE}
              variant="secondary"
              className="w-full"
              size="sm"
            >
              <Tag className="w-4 h-4 mr-1.5" />
              가격 제안하기
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handlers.handleInquiry}
                disabled={product.status !== ProductStatus.FOR_SALE}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                문의하기
              </Button>
              <Button
                onClick={handlers.handleReport}
                variant="outline"
                className="flex-shrink-0"
                size="sm"
              >
                <AlertTriangle className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* 판매자 다른 상품 섹션 */}
      {sellerProducts.length > 0 && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              {product.seller?.nickname || '판매자'}님의 다른 상품
            </h2>
            <button
              onClick={() => router.push(`/users/${product.seller_id}`)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
            >
              더보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sellerProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/products/${item.id}`)}
                className="group text-left"
              >
                <div className="aspect-square relative bg-slate-100 rounded-lg overflow-hidden mb-2">
                  {item.images[0]?.url ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Tag className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm font-bold text-primary-600">
                  {new Intl.NumberFormat('ko-KR').format(item.price)}원
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
