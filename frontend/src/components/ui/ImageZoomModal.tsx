'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// ================================
// Types & Interfaces
// ================================

interface ImageZoomModalProps {
  images: { id: string; url: string }[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

// ================================
// Component
// ================================

export default function ImageZoomModal({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImageZoomModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // 인덱스 초기화
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  // ESC 키 닫기 및 좌우 화살표 네비게이션
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          setScale(1);
          setIsLoading(true);
          break;
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          setScale(1);
          setIsLoading(true);
          break;
      }
    },
    [isOpen, images.length, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
    setIsLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
    setIsLoading(true);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        aria-label="닫기"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* 줌 컨트롤 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          aria-label="축소"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <span className="text-white text-sm font-medium min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className="p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          aria-label="확대"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 이미지 카운터 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 rounded-full px-4 py-2">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}

      {/* 이전 버튼 */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="이전 이미지"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}

      {/* 다음 버튼 */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="다음 이미지"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      {/* 이미지 */}
      <div
        className="relative w-full h-full flex items-center justify-center p-8 overflow-auto"
        onClick={handleBackdropClick}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${scale})`,
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        >
          <Image
            src={currentImage.url}
            alt={`이미지 ${currentIndex + 1}`}
            width={1200}
            height={1200}
            className="object-contain max-w-full max-h-[90vh]"
            onLoad={() => setIsLoading(false)}
            priority
          />
        </div>
      </div>

      {/* 썸네일 네비게이션 */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/50 rounded-lg p-2 max-w-[90vw] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentIndex(index);
                setScale(1);
                setIsLoading(true);
              }}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                currentIndex === index
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image.url}
                alt={`썸네일 ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
