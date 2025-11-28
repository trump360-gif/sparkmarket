'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import ProductDetail from '@/components/product/ProductDetail';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Home, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types';
import { ProductStatus } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 상품 소유자인지 확인
  const isOwner = isAuthenticated && user?.id === product?.seller_id;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getProduct(params.id as string);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center pt-16">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">상품을 찾을 수 없습니다</h2>
          <p className="text-slate-500 mb-8">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => router.push('/')} size="lg">
            <Home className="w-5 h-5 mr-2" />
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 검토 중이거나 거절된 상품은 소유자만 볼 수 있음
  if ((product.status === ProductStatus.PENDING_REVIEW || product.status === ProductStatus.REJECTED) && !isOwner) {
    const isPending = product.status === ProductStatus.PENDING_REVIEW;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center pt-16">
        <div className="text-center animate-fade-in max-w-md mx-auto px-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPending ? 'bg-amber-50' : 'bg-slate-100'
          }`}>
            {isPending ? (
              <Clock className="w-10 h-10 text-amber-500" />
            ) : (
              <XCircle className="w-10 h-10 text-slate-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isPending ? '검토 대기 중인 상품입니다' : '비공개 상품입니다'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isPending
              ? '이 상품은 현재 관리자 검토 중입니다. 검토가 완료되면 게시됩니다.'
              : '이 상품은 게시 기준에 맞지 않아 비공개 처리되었습니다.'
            }
          </p>
          <Button onClick={() => router.push('/')} size="lg">
            <Home className="w-5 h-5 mr-2" />
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-12">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center text-slate-600 hover:text-primary-600 transition-colors group animate-fade-in"
        >
          <span className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mr-2 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </span>
          <span className="font-medium">목록으로 돌아가기</span>
        </button>

        <div className="animate-slide-up">
          <ProductDetail product={product} />
        </div>
      </div>
    </div>
  );
}
