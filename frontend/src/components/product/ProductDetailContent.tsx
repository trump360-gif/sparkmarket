'use client';

// ================================
// Types & Interfaces
// ================================

import { useRouter } from 'next/navigation';
import { Tag, User, Calendar, Eye, MessageCircle, Sparkles, MapPin, Truck, Hash, Share2, Star, ChevronRight, UserPlus, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import FavoriteButton from '@/components/ui/FavoriteButton';
import type { Product, PriceOffer, UserProfile } from '@/types';
import { ProductStatus, PRODUCT_CONDITION_LABELS, TRADE_METHOD_LABELS } from '@/types';

interface ProductDetailContentProps {
  product: Product;
  acceptedOffer: PriceOffer | null;
  sellerProfile: UserProfile | null;
  formattedPrice: string;
  isOwner: boolean;
  isAuthenticated: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onShareClick: () => void;
  onPriceEdit?: () => void;
}

// ================================
// Component
// ================================

export default function ProductDetailContent({
  product,
  acceptedOffer,
  sellerProfile,
  formattedPrice,
  isOwner,
  isAuthenticated,
  isFollowing,
  onFollow,
  onShareClick,
  onPriceEdit,
}: ProductDetailContentProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        {/* 카테고리 배지 */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
            <Tag className="w-3 h-3" />
            {product.category}
          </span>
        </div>

        {/* 제목 + 공유/찜 버튼 */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{product.title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onShareClick}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="공유하기"
            >
              <Share2 className="w-5 h-5 text-slate-500" />
            </button>
            {!isOwner && (
              <FavoriteButton productId={product.id} size="md" />
            )}
          </div>
        </div>

        {/* 가격 표시 - 수락된 제안이 있으면 특별 가격 표시 */}
        {acceptedOffer ? (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-5 h-5 text-green-600 fill-current" />
                <span className="text-green-800 font-bold text-base">특별 가격 제안 수락!</span>
              </div>
              <div className="flex items-baseline flex-wrap gap-2">
                <span className="text-slate-400 line-through text-base">{formattedPrice}원</span>
                <span className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('ko-KR').format(acceptedOffer.offered_price)}원
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  {new Intl.NumberFormat('ko-KR').format(product.price - acceptedOffer.offered_price)}원 할인
                </span>
              </div>
              <p className="text-xs text-green-700 mt-2">
                이 특별 가격으로 구매하실 수 있습니다!
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            {product.original_price && product.original_price > product.price ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-slate-400 line-through">
                    {new Intl.NumberFormat('ko-KR').format(product.original_price)}원
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% 할인
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                    {formattedPrice}원
                  </p>
                  {isOwner && product.status === ProductStatus.FOR_SALE && onPriceEdit && (
                    <button
                      onClick={onPriceEdit}
                      className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                      title="가격 수정"
                    >
                      <Pencil className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                  {formattedPrice}원
                </p>
                {isOwner && product.status === ProductStatus.FOR_SALE && onPriceEdit && (
                  <button
                    onClick={onPriceEdit}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                    title="가격 수정"
                  >
                    <Pencil className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 상품 정보 테이블 */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
          {/* 판매자 */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              판매자
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/users/${product.seller_id}`)}
                className="font-semibold text-slate-900 hover:text-primary-600 transition-colors"
              >
                {product.seller?.nickname || '알 수 없음'}
              </button>
              {sellerProfile?.stats && (
                <button
                  onClick={() => router.push(`/users/${product.seller_id}/reviews`)}
                  className="flex items-center gap-1 text-amber-500 hover:text-amber-600 transition-colors group"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-medium">{sellerProfile.stats.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-500">({sellerProfile.stats.reviewCount})</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-amber-500" />
                </button>
              )}
              {!isOwner && isAuthenticated && (
                <Button
                  onClick={onFollow}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className="ml-2"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  {isFollowing ? '팔로잉' : '팔로우'}
                </Button>
              )}
            </div>
          </div>

          {/* 판매 상태 */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">판매 상태</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
              product.status === ProductStatus.SOLD
                ? 'bg-red-100 text-red-700'
                : product.status === ProductStatus.PENDING_REVIEW
                ? 'bg-amber-100 text-amber-700'
                : product.status === ProductStatus.REJECTED
                ? 'bg-slate-100 text-slate-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {product.status === ProductStatus.FOR_SALE && '판매중'}
              {product.status === ProductStatus.SOLD && '판매완료'}
              {product.status === ProductStatus.PENDING_REVIEW && '검토 대기'}
              {product.status === ProductStatus.REJECTED && '거절됨'}
            </span>
          </div>

          {/* 상품 상태 */}
          {product.condition && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                상품 상태
              </span>
              <span className="font-medium text-slate-700">
                {PRODUCT_CONDITION_LABELS[product.condition]}
              </span>
            </div>
          )}

          {/* 거래 방법 */}
          {product.trade_method && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                {product.trade_method === 'DIRECT' ? (
                  <MapPin className="w-3.5 h-3.5" />
                ) : product.trade_method === 'DELIVERY' ? (
                  <Truck className="w-3.5 h-3.5" />
                ) : (
                  <Truck className="w-3.5 h-3.5" />
                )}
                거래 방법
              </span>
              <span className="font-medium text-slate-700">
                {TRADE_METHOD_LABELS[product.trade_method]}
              </span>
            </div>
          )}

          {/* 직거래 지역 */}
          {product.trade_location && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                직거래 지역
              </span>
              <span className="font-medium text-slate-700">
                {product.trade_location}
              </span>
            </div>
          )}

          {/* 브랜드 */}
          {product.brand && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">브랜드</span>
              <button
                onClick={() => router.push(`/?brand=${product.brand_id}`)}
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                {product.brand.name_ko || product.brand.name}
              </button>
            </div>
          )}

          {/* 등록일 */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              등록일
            </span>
            <span className="font-medium text-slate-700">
              {new Date(product.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>

          {/* 조회수 */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              조회수
            </span>
            <span className="font-medium text-slate-700">
              {product.view_count?.toLocaleString() || 0}회
            </span>
          </div>

          {/* 문의 */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              문의
            </span>
            <span className="font-medium text-slate-700">
              {product.chat_count?.toLocaleString() || 0}회
            </span>
          </div>
        </div>

        {/* 상품 설명 */}
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">상품 설명</h2>
          <div className="bg-white rounded-lg border border-slate-100 p-3">
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* 해시태그 */}
        {product.hashtags && product.hashtags.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Hash className="w-4 h-4" />
              태그
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.hashtags.map((item) => (
                <button
                  key={item.hashtag.id}
                  onClick={() => router.push(`/?hashtag=${item.hashtag.name}`)}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium hover:bg-primary-100 transition-colors"
                >
                  #{item.hashtag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
