'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ProductStatus } from '@/types';
import type { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Package,
  ShoppingCart,
  CheckCircle,
  Trash2,
  Loader2,
  ImageIcon,
  Clock,
  XCircle
} from 'lucide-react';

interface AdminProductListProps {
  initialStatus?: ProductStatus | '';
}

export default function AdminProductList({ initialStatus = '' }: AdminProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>(initialStatus);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async (pageNum: number, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params: any = {
        page: pageNum,
        limit: 20,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.getProducts(params);

      if (append) {
        setProducts((prev) => [...prev, ...response.data]);
      } else {
        setProducts(response.data);
      }

      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch products:', error);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [search, statusFilter]);

  // Infinite scroll setup
  useEffect(() => {
    const loadMore = () => {
      if (page < totalPages && !isLoadingMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
      }
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [page, totalPages, isLoadingMore, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, false);
  };

  const handleDelete = async (id: string, title: string) => {
    const reason = prompt(`"${title}" 상품을 삭제하시겠습니까?\n삭제 사유를 입력하세요:`);
    if (!reason) return;

    try {
      await adminApi.deleteProduct(id, { reason });
      toast.success('삭제되었습니다.');
      setPage(1);
      fetchProducts(1, false);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
        toast.error('삭제에 실패했습니다.');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusBadge = (status: ProductStatus) => {
    const config = {
      [ProductStatus.FOR_SALE]: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: ShoppingCart,
        label: '판매중'
      },
      [ProductStatus.SOLD]: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: CheckCircle,
        label: '판매완료'
      },
      [ProductStatus.DELETED]: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: Trash2,
        label: '삭제됨'
      },
      [ProductStatus.PENDING_REVIEW]: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock,
        label: '검토대기'
      },
      [ProductStatus.REJECTED]: {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: XCircle,
        label: '거절됨'
      },
    };

    const { bg, text, border, icon: Icon, label } = config[status];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text} border ${border}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const statusButtons = [
    { value: '', label: '전체', activeBg: 'bg-slate-900', inactiveBg: 'bg-slate-100', inactiveText: 'text-slate-700' },
    { value: ProductStatus.FOR_SALE, label: '판매중', activeBg: 'bg-emerald-600', inactiveBg: 'bg-emerald-50', inactiveText: 'text-emerald-700' },
    { value: ProductStatus.SOLD, label: '판매완료', activeBg: 'bg-blue-600', inactiveBg: 'bg-blue-50', inactiveText: 'text-blue-700' },
    { value: ProductStatus.DELETED, label: '삭제됨', activeBg: 'bg-red-600', inactiveBg: 'bg-red-50', inactiveText: 'text-red-700' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">상품 관리</h1>
            <p className="text-slate-500 text-sm">총 {total}개의 상품</p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품 제목으로 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:opacity-90 font-medium"
          >
            검색
          </button>
        </form>

        {/* 상태 필터 버튼 */}
        <div className="flex flex-wrap gap-2">
          {statusButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => {
                setStatusFilter(btn.value as ProductStatus | '');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-medium ${
                statusFilter === btn.value
                  ? `${btn.activeBg} text-white shadow-md`
                  : `${btn.inactiveBg} ${btn.inactiveText} hover:opacity-80`
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden">
          <TableSkeleton rows={10} cols={8} />
        </div>
      ) : (
        <>
          {/* 테이블 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-200 table-fixed">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="w-14 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">이미지</th>
                    <th className="w-40 lg:w-48 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">제목</th>
                    <th className="w-24 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">가격</th>
                    <th className="w-20 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">카테고리</th>
                    <th className="w-20 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">판매자</th>
                    <th className="w-20 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                    <th className="w-24 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">등록일</th>
                    <th className="w-14 px-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-2 py-2 whitespace-nowrap">
                          <div className="w-10 h-10 relative bg-slate-100 rounded-lg overflow-hidden">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-primary-600 hover:text-primary-700 hover:underline block truncate font-medium transition-colors text-sm"
                          >
                            {product.title}
                          </Link>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 text-sm">{formatPrice(product.price)}원</span>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap hidden xl:table-cell">
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg truncate block">{product.category}</span>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-600 hidden lg:table-cell truncate">
                          {product.seller?.nickname || '-'}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                          {new Date(product.created_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">삭제</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Infinite scroll trigger */}
          {page < totalPages && (
            <div ref={loadMoreRef} className="mt-6 flex justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                  <span>더 불러오는 중...</span>
                </div>
              )}
            </div>
          )}

          {page >= totalPages && products.length > 0 && (
            <div className="mt-6 text-center py-8">
              <p className="text-slate-500 bg-slate-100 inline-block px-4 py-2 rounded-full text-sm">
                모든 상품을 불러왔습니다
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
