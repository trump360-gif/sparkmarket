'use client';

// ================================
// Types & Interfaces
// ================================

import Image from 'next/image';
import { Clock, XCircle, ZoomIn } from 'lucide-react';
import type { Product } from '@/types';
import { ProductStatus } from '@/types';

interface ProductDetailHeaderProps {
  product: Product;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
  onImageClick: (index: number) => void;
  isOwner: boolean;
}

// ================================
// Component
// ================================

export default function ProductDetailHeader({
  product,
  selectedImage,
  setSelectedImage,
  onImageClick,
  isOwner,
}: ProductDetailHeaderProps) {
  return (
    <>
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

      {/* 이미지 갤러리 */}
      <div>
        {product.images.length > 0 ? (
          <>
            <div
              className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden mb-3 shadow-md cursor-zoom-in group"
              onClick={() => onImageClick(selectedImage)}
            >
              <Image
                src={product.images[selectedImage].url}
                alt={product.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* 확대 아이콘 */}
              <div className="absolute bottom-3 right-3 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
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
    </>
  );
}
