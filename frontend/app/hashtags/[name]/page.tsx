'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductList from '@/components/product/ProductList';
import { ArrowLeft, Hash, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Hashtag } from '@/types';

export default function HashtagProductsPage() {
  const params = useParams();
  const hashtagName = decodeURIComponent(params.name as string);

  const [hashtag, setHashtag] = useState<Hashtag | null>(null);
  const [relatedHashtags, setRelatedHashtags] = useState<Hashtag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHashtagData();
  }, [hashtagName]);

  const fetchHashtagData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const [hashtagRes, relatedRes] = await Promise.all([
      //   apiClient.get(`/hashtags/${hashtagName}`),
      //   apiClient.get(`/hashtags/${hashtagName}/related`)
      // ]);
      // setHashtag(hashtagRes.data);
      // setRelatedHashtags(relatedRes.data);

      // Mock data
      const mockHashtag: Hashtag = {
        id: '1',
        name: hashtagName,
        use_count: 42,
      };
      setHashtag(mockHashtag);

      const mockRelated: Hashtag[] = [
        { id: '2', name: '중고거래', use_count: 156 },
        { id: '3', name: '깨끗해요', use_count: 89 },
        { id: '4', name: '거의새것', use_count: 123 },
      ];
      setRelatedHashtags(mockRelated);
    } catch (error) {
      console.error('Failed to fetch hashtag data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hashtag) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <Hash className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            해시태그를 찾을 수 없습니다
          </h3>
          <p className="text-slate-500 mb-6">
            존재하지 않거나 삭제된 해시태그입니다
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        홈으로
      </Link>

      {/* Hashtag Header */}
      <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Hash className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">#{hashtag.name}</h1>
          </div>
        </div>
        <p className="text-white/90">
          <span className="font-semibold">{hashtag.use_count.toLocaleString()}</span>개의 상품
        </p>
      </div>

      {/* Related Hashtags */}
      {relatedHashtags.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">연관 해시태그</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedHashtags.map((related) => (
              <Link
                key={related.id}
                href={`/hashtags/${encodeURIComponent(related.name)}`}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all text-sm font-medium text-slate-700"
              >
                #{related.name}
                <span className="ml-1.5 text-slate-500">
                  {related.use_count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          #{hashtag.name} 상품
        </h2>
{/* TODO: Add hashtag filter when ProductList supports queryParams */}
        <ProductList />
      </div>
    </div>
  );
}
