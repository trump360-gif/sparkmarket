'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/lib/api/products';
import type { Product } from '@/types';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedPrice = new Intl.NumberFormat('ko-KR').format(product.price);
  const isOwner = isAuthenticated && user?.id === product.seller_id;

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await productsApi.deleteProduct(product.id);
      alert('상품이 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      alert('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/products/${product.id}/edit`);
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    alert('구매하기 기능은 추후 업데이트 예정입니다.');
  };

  const handleInquiry = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    alert('채팅 기능은 추후 업데이트 예정입니다.');
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* 이미지 섹션 */}
        <div>
          {product.images.length > 0 ? (
            <>
              <div className="aspect-square relative bg-gray-200 rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.status === 'SOLD' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">판매완료</span>
                  </div>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative rounded-md overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-blue-600' : ''
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>

        {/* 정보 섹션 */}
        <div className="flex flex-col">
          <div className="flex-1">
            <div className="mb-4">
              <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-4xl font-bold text-blue-600 mb-6">{formattedPrice}원</p>

            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">판매자</span>
                <span className="font-medium">{product.seller?.nickname || '알 수 없음'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">상태</span>
                <span className={`font-medium ${product.status === 'SOLD' ? 'text-red-600' : 'text-green-600'}`}>
                  {product.status === 'FOR_SALE' ? '판매중' : '판매완료'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">등록일</span>
                <span className="font-medium">
                  {new Date(product.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">상품 설명</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            {isOwner ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handlePurchase}
                  disabled={product.status === 'SOLD'}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {product.status === 'SOLD' ? '판매완료' : '구매하기'}
                </button>
                <button
                  onClick={handleInquiry}
                  disabled={product.status === 'SOLD'}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  문의하기
                </button>
              </>
            )}
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              목록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
