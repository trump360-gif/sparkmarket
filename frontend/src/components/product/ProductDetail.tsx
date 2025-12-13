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

  const formattedPrice = new Intl.NumberFormat('ko-KR').format(product.price);
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
      } catch (error: any) {
        if (error?.response?.status !== 401) {
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
              product={product}
              acceptedOffer={acceptedOffer}
              sellerProfile={sellerProfile}
              formattedPrice={formattedPrice}
              isOwner={isOwner}
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
    </div>
  );
}
