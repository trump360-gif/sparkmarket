'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronRight } from 'lucide-react';
import type { RecentView } from '@/types';

interface RecentViewsSidebarProps {
  maxItems?: number;
}

export default function RecentViewsSidebar({ maxItems = 5 }: RecentViewsSidebarProps) {
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentViews();
  }, []);

  const loadRecentViews = async () => {
    try {
      setIsLoading(true);
      // TODO: If user is logged in, fetch from API
      // const response = await apiClient.get(`/recent-views?limit=${maxItems}`);
      // setRecentViews(response.data);

      // For now, use localStorage
      const stored = localStorage.getItem('recent_views');
      if (stored) {
        const views = JSON.parse(stored);
        setRecentViews(views.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to load recent views:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 bg-slate-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentViews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          최근 본 상품
        </h3>
      </div>

      <div className="space-y-3">
        {recentViews.map((view) => {
          if (!view.product) return null;

          const primaryImage = view.product.images.find((img) => img.is_primary) || view.product.images[0];
          const formattedPrice = new Intl.NumberFormat('ko-KR').format(view.product.price);

          return (
            <Link
              key={view.id}
              href={`/products/${view.product.id}`}
              className="flex gap-3 group hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors"
            >
              <div className="relative w-16 h-16 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={view.product.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {view.product.title}
                </h4>
                <p className="text-sm font-semibold text-primary-600 mt-1">
                  {formattedPrice}원
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/recent"
        className="mt-4 flex items-center justify-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50 rounded-lg transition-colors"
      >
        더보기
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
