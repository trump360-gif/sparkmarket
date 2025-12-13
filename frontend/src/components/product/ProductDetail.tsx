'use client';

// ================================
// Types & Interfaces
// ================================

import type { Product, PriceOffer, UserProfile } from '@/types';
import { ProductStatus } from '@/types';

interface ProductDetailProps {
  product: Product;
}

// ================================
// Imports
// ================================

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/lib/api/products';
import { priceOffersApi } from '@/lib/api/priceOffers';
import { usersApi } from '@/lib/api/users';
import PriceOfferModal from '@/components/product/PriceOfferModal';
import ImageZoomModal from '@/components/ui/ImageZoomModal';
import ProductDetailHeader from './ProductDetailHeader';
import ProductDetailContent from './ProductDetailContent';
import ProductDetailActions from './ProductDetailActions';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { getErrorStatus, getErrorMessage } from '@/lib/errors';

// ================================
// Component
// ================================

export default function ProductDetail({ product }: ProductDetailProps) {
  // ================================
  // State
  // ================================

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState<PriceOffer | null>(null);
  const [sellerProfile, setSellerProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isLoadingSellerProducts, setIsLoadingSellerProducts] = useState(false);

  // 가격 수정 모달 상태
  const [isPriceEditModalOpen, setIsPriceEditModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(product);

  const formattedPrice = new Intl.NumberFormat('ko-KR').format(currentProduct.price);
  const isOwner = isAuthenticated && user?.id === product.seller_id;

  // ================================
  // Effects
  // ================================

  // 판매자 다른 상품 가져오기
  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!product.seller_id) return;

      setIsLoadingSellerProducts(true);
      try {
        const response = await productsApi.getProducts({
          seller_id: product.seller_id,
          exclude: product.id,
          status: ProductStatus.FOR_SALE,
          limit: 4,
        });
        setSellerProducts(response.data);
      } catch (error) {
        if (getErrorStatus(error) !== 401) {
          console.error('Failed to fetch seller products:', error);
        }
      } finally {
        setIsLoadingSellerProducts(false);
      }
    };
    fetchSellerProducts();
  }, [product.seller_id, product.id]);

  // 판매자 프로필 가져오기
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!product.seller_id) return;
      try {
        const profile = await usersApi.getUserProfile(product.seller_id);
        setSellerProfile(profile);
      } catch (error) {
        // 401 에러는 조용히 무시
        if (getErrorStatus(error) !== 401) {
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
      } catch (error) {
        // 401 에러는 조용히 무시 (로그인 안된 상태)
        if (getErrorStatus(error) !== 401) {
          console.error('Failed to check accepted offers:', error);
        }
      }
    };

    checkAcceptedOffer();
  }, [isAuthenticated, isOwner, product.id]);

  // ================================
  // Handlers
  // ================================

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await productsApi.deleteProduct(product.id);
      toast.success('상품이 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
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
    } catch (error) {
      const message = getErrorMessage(error, '구매에 실패했습니다.');
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
  };

  const handleShare = async () => {
    const url = window.location.href;

    // Web Share API 지원 시 네이티브 공유 사용
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `${product.title} - ${formattedPrice}원`,
          url: url,
        });
        return;
      } catch (error) {
        // 사용자가 공유 취소한 경우 무시
        if ((error as Error).name === 'AbortError') return;
      }
    }

    // 클립보드 복사
    try {
      await navigator.clipboard.writeText(url);
      toast.success('링크가 복사되었습니다');
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const handleImageClick = (index: number) => {
    setZoomImageIndex(index);
    setIsImageZoomOpen(true);
  };

  // 가격 수정 핸들러
  const handlePriceEditClick = () => {
    setNewPrice(currentProduct.price.toString());
    setIsPriceEditModalOpen(true);
  };

  const handlePriceUpdate = async () => {
    const priceNum = parseInt(newPrice.replace(/,/g, ''), 10);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('올바른 가격을 입력해주세요.');
      return;
    }

    setIsUpdatingPrice(true);
    try {
      const updated = await productsApi.updatePrice(currentProduct.id, priceNum);
      setCurrentProduct(prev => ({ ...prev, price: updated.price, original_price: updated.original_price }));
      toast.success('가격이 수정되었습니다.');
      setIsPriceEditModalOpen(false);
    } catch (error) {
      toast.error('가격 수정에 실패했습니다.');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const formatPriceInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    return parseInt(num, 10).toLocaleString('ko-KR');
  };

  // ================================
  // Render
  // ================================

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* 이미지 섹션 */}
          <ProductDetailHeader
            product={product}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            onImageClick={handleImageClick}
            isOwner={isOwner}
          />

          {/* 정보 섹션 */}
          <div className="flex flex-col">
            <ProductDetailContent
              product={currentProduct}
              acceptedOffer={acceptedOffer}
              sellerProfile={sellerProfile}
              formattedPrice={formattedPrice}
              isOwner={isOwner}
              onPriceEdit={handlePriceEditClick}
              isAuthenticated={isAuthenticated}
              isFollowing={isFollowing}
              onFollow={handleFollow}
              onShareClick={handleShare}
            />

            {/* 액션 버튼 */}
            <ProductDetailActions
              product={product}
              isOwner={isOwner}
              isDeleting={isDeleting}
              handlers={{
                handleEdit,
                handleDelete,
                handlePurchase,
                handleInquiry,
                handleReport,
                setIsOfferModalOpen,
              }}
              sellerProducts={sellerProducts}
            />
          </div>
        </div>
      </div>

      {/* 가격 제안 모달 */}
      <PriceOfferModal
        product={product}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />

      {/* 이미지 확대 모달 */}
      <ImageZoomModal
        images={product.images}
        initialIndex={zoomImageIndex}
        isOpen={isImageZoomOpen}
        onClose={() => setIsImageZoomOpen(false)}
      />

      {/* 가격 수정 모달 */}
      {isPriceEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">가격 수정</h3>
              <button
                onClick={() => setIsPriceEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
                {currentProduct.title}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  새 가격
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPriceInput(newPrice)}
                    onChange={(e) => setNewPrice(e.target.value.replace(/,/g, ''))}
                    className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="가격을 입력하세요"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                    원
                  </span>
                </div>
                {currentProduct.price > parseInt(newPrice.replace(/,/g, '') || '0', 10) && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    가격을 낮추면 찜한 사용자에게 알림이 전송됩니다
                  </p>
                )}
                {/* 빠른 가격 조정 버튼 */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[1000, 5000, 10000, 50000, 100000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        const current = parseInt(newPrice.replace(/,/g, '') || '0', 10);
                        const newVal = Math.max(0, current - amount);
                        setNewPrice(newVal.toString());
                      }}
                      className="px-3 py-1.5 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
                    >
                      -{amount >= 10000 ? `${amount / 10000}만` : `${amount / 1000}천`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsPriceEditModalOpen(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handlePriceUpdate}
                  disabled={isUpdatingPrice || !newPrice}
                >
                  {isUpdatingPrice ? '수정 중...' : '수정하기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
