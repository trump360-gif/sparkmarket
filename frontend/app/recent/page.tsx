'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Clock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { RecentView } from '@/types';

export default function RecentViewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // 비로그인 사용자는 localStorage에서 가져오기
      loadFromLocalStorage();
      return;
    }
    fetchRecentViews();
  }, [user]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('recent_views');
      if (stored) {
        const views = JSON.parse(stored);
        setRecentViews(views);
      }
    } catch (error) {
      console.error('Failed to load recent views from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentViews = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/recent-views');
      // setRecentViews(response.data);

      // For now, use localStorage
      loadFromLocalStorage();
    } catch (error) {
      console.error('Failed to fetch recent views:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('모든 최근 본 상품을 삭제하시겠습니까?')) return;

    try {
      if (user) {
        // TODO: Clear from server
        // await apiClient.delete('/recent-views');
      }
      localStorage.removeItem('recent_views');
      setRecentViews([]);
    } catch (error) {
      console.error('Failed to clear recent views:', error);
    }
  };

  const handleRemove = async (viewId: string) => {
    try {
      if (user) {
        // TODO: Delete from server
        // await apiClient.delete(`/recent-views/${viewId}`);
      }

      // Remove from localStorage
      const stored = localStorage.getItem('recent_views');
      if (stored) {
        const views = JSON.parse(stored);
        const filtered = views.filter((v: RecentView) => v.id !== viewId);
        localStorage.setItem('recent_views', JSON.stringify(filtered));
        setRecentViews(filtered);
      }
    } catch (error) {
      console.error('Failed to remove recent view:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary-600" />
            최근 본 상품
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {recentViews.length}개의 상품
          </p>
        </div>
        {recentViews.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            전체 삭제
          </Button>
        )}
      </div>

      {recentViews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            최근 본 상품이 없습니다
          </h3>
          <p className="text-slate-500 mb-6">
            상품을 둘러보면 여기에 기록됩니다
          </p>
          <Button onClick={() => router.push('/')}>
            상품 둘러보기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentViews.map((view) => (
            <div key={view.id} className="relative group">
              {view.product && <ProductCard product={view.product} />}
              <button
                onClick={() => handleRemove(view.id)}
                className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="목록에서 제거"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
