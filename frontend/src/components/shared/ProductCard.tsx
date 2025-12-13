'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { Badge } from '@/components/ui/Badge';
import { Truck, MapPin, Flame, Sparkles } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
  const formattedPrice = new Intl.NumberFormat('ko-KR').format(product.price);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // 가격 인하 계산
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountRate = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  // 인기 상품 판단
  const isHot = (product.favorite_count && product.favorite_count >= 10) || (product.view_count && product.view_count >= 100);

  // 새상품 여부
  const isNew = product.condition === 'NEW';

  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="aspect-square relative bg-gray-100 dark:bg-slate-700">
        {primaryImage ? (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-pulse" />
            )}
            <Image
              src={primaryImage.url}
              alt={product.title}
              fill
              className={`object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setIsImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
            No Image
          </div>
        )}
        {product.status === 'SOLD' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">판매완료</span>
          </div>
        )}

        {/* 뱃지들 */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="shadow-sm">
              {discountRate}% 할인
            </Badge>
          )}
          {isHot && (
            <Badge variant="warning" className="shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3" />
              HOT
            </Badge>
          )}
          {isNew && (
            <Badge variant="success" className="shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              새상품
            </Badge>
          )}
        </div>

        {/* 찜하기 버튼 */}
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={product.id} size="sm" />
        </div>

        {/* 거래 방법 아이콘 */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {product.trade_method === 'DELIVERY' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
            </div>
          )}
          {product.trade_method === 'DIRECT' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-green-600" />
            </div>
          )}
          {product.trade_method === 'BOTH' && (
            <>
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.title}
        </h3>

        <div className="mb-2">
          {hasDiscount && (
            <p className="text-xs text-gray-400 dark:text-slate-500 line-through">
              {new Intl.NumberFormat('ko-KR').format(product.original_price!)}원
            </p>
          )}
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formattedPrice}원</p>
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-1 mb-2">{product.category}</p>

        {/* 해시태그 */}
        {product.hashtags && product.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.hashtags.slice(0, 3).map((item) => (
              <span
                key={item.hashtag.id}
                className="text-[10px] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-full"
              >
                #{item.hashtag.name}
              </span>
            ))}
            {product.hashtags.length > 3 && (
              <span className="text-[10px] text-gray-400 dark:text-slate-500">+{product.hashtags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span>👁️</span>
              <span>{product.view_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💬</span>
              <span>{product.chat_count || 0}</span>
            </div>
          </div>
          {product.favorite_count && product.favorite_count > 0 && (
            <div className="flex items-center space-x-1 text-red-500 dark:text-red-400">
              <span>❤️</span>
              <span>{product.favorite_count}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
