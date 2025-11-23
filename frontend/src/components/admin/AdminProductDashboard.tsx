'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { adminApi } from '@/lib/api/admin';
import { DashboardCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface AdminProductDashboardProps {
  productId: string;
}

export default function AdminProductDashboard({ productId }: AdminProductDashboardProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getProduct(productId);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;

    const reason = prompt(`"${product.title}" 상품을 삭제하시겠습니까?\n삭제 사유를 입력하세요:`);
    if (!reason) return;

    try {
      await adminApi.deleteProduct(productId, { reason });
      toast.success('삭제되었습니다.');
      router.push('/admin/products');
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <Skeleton className="h-8 w-40 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);

  const getStatusBadge = (status: string) => {
    const styles = {
      FOR_SALE: 'bg-green-100 text-green-800',
      SOLD: 'bg-blue-100 text-blue-800',
      DELETED: 'bg-red-100 text-red-800',
    };

    const labels = {
      FOR_SALE: '판매중',
      SOLD: '판매완료',
      DELETED: '삭제됨',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/products"
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← 상품 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">상품 대시보드</h1>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          상품 삭제
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">조회수</p>
          <p className="text-3xl font-bold text-gray-900">{product.view_count.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">채팅 문의</p>
          <p className="text-3xl font-bold text-gray-900">{product.chat_count.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-1">등록일</p>
          <p className="text-xl font-bold text-gray-900">
            {new Date(product.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">상품 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {primaryImage ? (
              <div className="aspect-square relative bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={primaryImage.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">이미지 없음</span>
              </div>
            )}

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img) => (
                  <div key={img.id} className="aspect-square relative bg-gray-200 rounded overflow-hidden">
                    <Image
                      src={img.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">상태</label>
              <div className="mt-1">{getStatusBadge(product.status)}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">제목</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{product.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">가격</label>
              <p className="mt-1 text-2xl font-bold text-blue-600">{formatPrice(product.price)}원</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">카테고리</label>
              <p className="mt-1 text-gray-900">{product.category}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">설명</label>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">판매자 정보</h2>
        {product.seller ? (
          <div className="space-y-2">
            <div>
              <span className="text-gray-600 font-medium">닉네임:</span>{' '}
              <span className="text-gray-900">{product.seller.nickname}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">이메일:</span>{' '}
              <span className="text-gray-900">{product.seller.email}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">판매자 ID:</span>{' '}
              <span className="text-gray-900 font-mono text-sm">{product.seller_id}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">판매자 정보를 불러올 수 없습니다.</p>
        )}
      </div>
    </div>
  );
}
