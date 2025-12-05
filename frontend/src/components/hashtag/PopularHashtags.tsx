'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hash, TrendingUp } from 'lucide-react';
import type { Hashtag } from '@/types';

import { hashtagsApi } from '@/lib/api/hashtags';

interface PopularHashtagsProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export default function PopularHashtags({
  limit = 10,
  showTitle = true,
  className = ''
}: PopularHashtagsProps) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPopularHashtags();
  }, [limit]);

  const fetchPopularHashtags = async () => {
    try {
      setIsLoading(true);
      const data = await hashtagsApi.getPopularHashtags();
      setHashtags(data.slice(0, limit));
    } catch (error) {
      console.error('Failed to fetch popular hashtags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900">인기 해시태그</h3>
          </div>
        )}
        <div className="flex flex-wrap gap-2 animate-pulse">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-slate-200 rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (hashtags.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-slate-900">인기 해시태그</h3>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {hashtags.map((hashtag, index) => (
          <Link
            key={hashtag.id}
            href={`/?hashtag=${encodeURIComponent(hashtag.name)}`}
            className="group relative px-4 py-2 bg-white border border-slate-200 rounded-full hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 transition-colors" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors">
                {hashtag.name}
              </span>
              <span className="text-xs text-slate-400 group-hover:text-primary-500 transition-colors">
                {hashtag.use_count}
              </span>
            </div>

            {/* Top 3 badge */}
            {index < 3 && (
              <div
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md ${index === 0
                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' // Gold
                    : index === 1
                      ? 'bg-gradient-to-br from-slate-300 to-slate-400' // Silver
                      : 'bg-gradient-to-br from-orange-300 to-orange-400' // Bronze
                  }`}
              >
                <span className="text-white text-[10px] font-bold text-shadow-sm">{index + 1}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
