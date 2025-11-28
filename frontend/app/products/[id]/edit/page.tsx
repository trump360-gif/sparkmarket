'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '@/components/product/ProductForm';
import { productsApi } from '@/lib/api/products';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, AlertCircle, Home } from 'lucide-react';
import type { Product } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getProduct(params.id as string);
        setProduct(data);
      } catch (error: any) {
        // 401 에러는 조용히 무시
        if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
          console.error('Failed to fetch product:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <Skeleton className="h-10 w-40 mb-4 rounded-lg" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center pt-16">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1.5">상품을 찾을 수 없습니다</h2>
          <p className="text-slate-500 text-sm mb-5">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => router.push('/')} size="sm">
            <Home className="w-4 h-4 mr-1.5" />
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-10">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 right-0 h-60 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-1/4 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-slate-600 hover:text-primary-600 transition-colors group animate-fade-in text-sm"
        >
          <span className="w-7 h-7 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mr-1.5 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          <span className="font-medium">돌아가기</span>
        </button>

        <div className="animate-slide-up">
          <ProductForm initialData={product} isEdit />
        </div>
      </div>
    </div>
  );
}
