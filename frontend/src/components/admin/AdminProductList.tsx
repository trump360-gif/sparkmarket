'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { Product, ProductStatus } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

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
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusBadge = (status: ProductStatus) => {
    const styles = {
      FOR_SALE: 'bg-green-100 text-green-800',
      SOLD: 'bg-blue-100 text-blue-800',
      DELETED: 'bg-red-100 text-red-800',
    };

    const labels = {
      FOR_SALE: '판매중',
      SOLD: '판매완료',
      DELETED: '삭제됨',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">상품 관리</h1>

        <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상품 제목으로 검색..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
        </form>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체 상태
          </button>
          <button
            onClick={() => {
              setStatusFilter('FOR_SALE');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === 'FOR_SALE'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            판매중
          </button>
          <button
            onClick={() => {
              setStatusFilter('SOLD');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === 'SOLD'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            판매완료
          </button>
          <button
            onClick={() => {
              setStatusFilter('DELETED');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === 'DELETED'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            삭제됨
          </button>
        </div>

        <p className="text-gray-600">총 {total}개의 상품</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} cols={8} />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이미지</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 relative bg-gray-200 rounded">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={product.title}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:underline max-w-xs block truncate"
                        >
                          {product.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatPrice(product.price)}원</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.seller?.nickname || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Infinite scroll trigger */}
          {page < totalPages && (
            <div ref={loadMoreRef} className="mt-6 flex justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>더 불러오는 중...</span>
                </div>
              )}
            </div>
          )}

          {page >= totalPages && products.length > 0 && (
            <div className="mt-6 text-center py-8 text-gray-500">
              모든 상품을 불러왔습니다.
            </div>
          )}
        </>
      )}
    </div>
  );
}
