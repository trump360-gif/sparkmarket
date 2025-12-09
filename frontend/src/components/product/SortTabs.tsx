'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SortOption, SORT_OPTION_LABELS } from '@/types';

// ================================
// Types & Interfaces
// ================================

interface SortTabsProps {
  className?: string;
}

// ================================
// Constants
// ================================

const SORT_OPTIONS: SortOption[] = ['latest', 'price_asc', 'price_desc', 'popular'];

// ================================
// Component
// ================================

export default function SortTabs({ className = '' }: SortTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get('sort') as SortOption) || 'latest';

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sort === 'latest') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }

    // 정렬 변경 시 페이지 초기화
    params.delete('page');

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {SORT_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => handleSortChange(option)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            currentSort === option
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-primary-300'
          }`}
        >
          {SORT_OPTION_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
