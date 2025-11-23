'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { priceOffersApi } from '@/lib/api/priceOffers';
import type { Product } from '@/types';

interface PriceOfferModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PriceOfferModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: PriceOfferModalProps) {
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseInt(offeredPrice);

    if (isNaN(price) || price <= 0) {
      toast.error('올바른 가격을 입력해주세요.');
      return;
    }

    if (price >= product.price) {
      toast.error('제안 가격은 판매 가격보다 낮아야 합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await priceOffersApi.createOffer(product.id, {
        offered_price: price,
        message: message || undefined,
      });

      toast.success('가격 제안이 전송되었습니다.');
      setOfferedPrice('');
      setMessage('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || '가격 제안에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(value)) {
      setOfferedPrice(value);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">가격 제안하기</h2>
          <p className="mt-2 text-sm text-gray-600">
            판매자에게 가격을 제안해보세요. (72시간 유효)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상품명
            </label>
            <p className="text-gray-900 font-medium">{product.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 가격
            </label>
            <p className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat('ko-KR').format(product.price)}원
            </p>
          </div>

          <div>
            <label
              htmlFor="offered-price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제안 가격 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="offered-price"
                value={formatPrice(offeredPrice)}
                onChange={handlePriceChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="제안하실 가격을 입력하세요"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                원
              </span>
            </div>
            {offeredPrice && parseInt(offeredPrice) > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {product.price - parseInt(offeredPrice) > 0
                  ? `${new Intl.NumberFormat('ko-KR').format(product.price - parseInt(offeredPrice))}원 할인`
                  : '가격이 너무 높습니다'}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              메시지 (선택)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="판매자에게 전달할 메시지를 입력하세요"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '전송 중...' : '제안하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
