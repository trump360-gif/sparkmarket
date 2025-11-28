'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/lib/api/products';
import { priceOffersApi } from '@/lib/api/priceOffers';
import { usersApi } from '@/lib/api/users';
import FavoriteButton from '@/components/ui/FavoriteButton';
import PriceOfferModal from '@/components/product/PriceOfferModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit3, Trash2, ShoppingCart, MessageCircle, Tag, User, Calendar, CheckCircle2, Eye, Star, ChevronRight, Clock, XCircle, Truck, MapPin, UserPlus, AlertTriangle, Sparkles, Hash } from 'lucide-react';
import type { Product, PriceOffer, UserProfile, ProductCondition, TradeMethod } from '@/types';
import { ProductStatus } from '@/types';

const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: '새상품',
  LIKE_NEW: '거의 새것',
  USED: '사용감 있음',
  WELL_USED: '많이 사용함',
  FOR_PARTS: '부품용',
};

const TRADE_METHOD_LABELS: Record<TradeMethod, string> = {
  DIRECT: '직거래',
  DELIVERY: '택배',
  BOTH: '직거래/택배',
};

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState<PriceOffer | null>(null);
  const [sellerProfile, setSellerProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const formattedPrice = new Intl.NumberFormat('ko-KR').format(product.price);
  const isOwner = isAuthenticated && user?.id === product.seller_id;

  // 판매자 프로필 가져오기
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!product.seller_id) return;
      try {
        const profile = await usersApi.getUserProfile(product.seller_id);
        setSellerProfile(profile);
      } catch (error: any) {
        // 401 에러는 조용히 무시
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch seller profile:', error);
        }
      }
    };
    fetchSellerProfile();
  }, [product.seller_id]);

  // 수락된 제안 확인
  useEffect(() => {
    const checkAcceptedOffer = async () => {
      if (!isAuthenticated || isOwner) return;

      try {
        const offers = await priceOffersApi.getSentOffers({ limit: 100 });
        const accepted = offers.data.find(
          (offer) => offer.product_id === product.id && offer.status === 'ACCEPTED'
        );
        if (accepted) {
          setAcceptedOffer(accepted);
        }
      } catch (error: any) {
        // 401 에러는 조용히 무시 (로그인 안된 상태)
        if (error?.response?.status !== 401) {
          console.error('Failed to check accepted offers:', error);
        }
      }
    };

    checkAcceptedOffer();
  }, [isAuthenticated, isOwner, product.id]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await productsApi.deleteProduct(product.id);
      toast.success('상품이 삭제되었습니다.');
      router.push('/');
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        toast.error('삭제에 실패했습니다.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/products/${product.id}/edit`);
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!confirm('정말 구매하시겠습니까?')) return;

    try {
      await productsApi.purchaseProduct(product.id);
      toast.success('구매가 완료되었습니다!');
      router.refresh();
    } catch (error: any) {
      const message = error.response?.data?.message || '구매에 실패했습니다.';
      toast.error(message);
    }
  };

  const handleInquiry = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    toast.info('채팅 기능은 추후 업데이트 예정입니다.');
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    // TODO: API 연동 후 구현
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? '팔로우를 취소했습니다.' : '팔로우했습니다.');
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    // TODO: 신고 모달 구현
    toast.info('신고 기능은 추후 업데이트 예정입니다.');
    setShowMoreMenu(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 검토 대기/거절 상태 안내 배너 (소유자에게만 표시) */}
      {isOwner && product.status === ProductStatus.PENDING_REVIEW && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">검토 대기 중</h3>
              <p className="text-sm text-amber-700 mt-1">
                이 상품은 현재 관리자 검토 대기 중입니다. 검토가 완료되면 게시됩니다.
              </p>
              {product.review_reason && (
                <div className="mt-2 p-2 bg-amber-100 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <span className="font-medium">검토 사유:</span> {product.review_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isOwner && product.status === ProductStatus.REJECTED && (
        <div className="mb-4 p-4 bg-slate-100 border border-slate-200 rounded-xl">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-800">게시 거절됨</h3>
              <p className="text-sm text-slate-600 mt-1">
                이 상품은 게시 기준에 맞지 않아 비공개 처리되었습니다.
              </p>
              {product.rejection_reason && (
                <div className="mt-2 p-2 bg-slate-200 rounded-lg">
                  <p className="text-xs text-slate-700">
                    <span className="font-medium">거절 사유:</span> {product.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* 이미지 섹션 */}
          <div>
            {product.images.length > 0 ? (
              <>
                <div className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden mb-3 shadow-md">
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {product.status === ProductStatus.SOLD && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
                        <span className="text-white text-2xl font-bold">판매완료</span>
                      </div>
                    </div>
                  )}
                  {product.status === ProductStatus.PENDING_REVIEW && (
                    <div className="absolute inset-0 bg-amber-900/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-white" />
                        <span className="text-white text-2xl font-bold">검토 대기</span>
                      </div>
                    </div>
                  )}
                  {product.status === ProductStatus.REJECTED && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30 flex items-center gap-2">
                        <XCircle className="w-6 h-6 text-white" />
                        <span className="text-white text-2xl font-bold">비공개</span>
                      </div>
                    </div>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square relative rounded-lg overflow-hidden transition-all ${
                          selectedImage === index
                            ? 'ring-2 ring-primary-500 ring-offset-1 shadow-md scale-105'
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`${product.title} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                <span className="text-slate-400 text-sm">이미지 없음</span>
              </div>
            )}
          </div>

          {/* 정보 섹션 */}
          <div className="flex flex-col">
            <div className="flex-1">
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Tag className="w-3 h-3" />
                  {product.category}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{product.title}</h1>
                {!isOwner && (
                  <FavoriteButton productId={product.id} size="md" />
                )}
              </div>

              {/* 가격 표시 - 수락된 제안이 있으면 특별 가격 표시 */}
              {acceptedOffer ? (
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
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
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                        {formattedPrice}원
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                      {formattedPrice}원
                    </p>
                  )}
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
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
                        onClick={handleFollow}
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
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    등록일
                  </span>
                  <span className="font-medium text-slate-700">
                    {new Date(product.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    조회수
                  </span>
                  <span className="font-medium text-slate-700">
                    {product.view_count?.toLocaleString() || 0}회
                  </span>
                </div>
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

            {/* 액션 버튼 */}
            <div className="space-y-2">
              {isOwner ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleEdit}
                    className="flex-1"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-1.5" />
                    수정
                  </Button>
                  <Button
                    onClick={handleDelete}
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
                    onClick={handlePurchase}
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
                    onClick={() => setIsOfferModalOpen(true)}
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
                      onClick={handleInquiry}
                      disabled={product.status !== ProductStatus.FOR_SALE}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      문의하기
                    </Button>
                    <Button
                      onClick={handleReport}
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
          </div>
        </div>
      </div>

      {/* 가격 제안 모달 */}
      <PriceOfferModal
        product={product}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />
    </div>
  );
}
