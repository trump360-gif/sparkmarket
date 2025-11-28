'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api/admin';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
import Image from 'next/image';
import {
  Search,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ImageIcon,
  Loader2,
  User,
  Calendar,
  Tag,
  DollarSign,
  X,
} from 'lucide-react';

export default function AdminReviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchProducts = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const params: any = { page: pageNum, limit: 20 };
      if (search) params.search = search;

      const response = await adminApi.getPendingReviewProducts(params);
      setProducts(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch pending review products:', error);
        toast.error('검토 대기 상품을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts(1);
    setPage(1);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1);
  };

  const handleViewDetail = async (product: Product) => {
    setIsDetailLoading(true);
    try {
      const detail = await adminApi.getPendingReviewProduct(product.id);
      setSelectedProduct(detail);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
        toast.error('상품 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    setIsActionLoading(true);
    try {
      await adminApi.approveProduct(productId);
      toast.success('상품이 승인되었습니다.');
      setSelectedProduct(null);
      fetchProducts(page);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
        toast.error('승인 처리에 실패했습니다.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct || !deleteReason.trim()) {
      toast.error('삭제 사유를 입력해주세요.');
      return;
    }

    setIsActionLoading(true);
    try {
      await adminApi.rejectProduct(selectedProduct.id, deleteReason);
      toast.success('상품이 삭제되었습니다.');
      setSelectedProduct(null);
      setShowDeleteModal(false);
      setDeleteReason('');
      fetchProducts(page);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
        toast.error('삭제 처리에 실패했습니다.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-4">
      {/* 헤더 + 검색 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">상품 검토</h1>
            <p className="text-slate-500 text-xs">검토 대기 {total}개</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색..."
              className="w-48 pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
          >
            검색
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">검토 대기 상품 없음</h3>
          <p className="text-slate-500 text-sm">모든 상품이 검토 완료되었습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((product) => {
            const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewDetail(product)}
              >
                <div className="relative aspect-square bg-slate-100">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-1.5 right-1.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      대기
                    </span>
                  </div>
                </div>

                <div className="p-2.5">
                  <h3 className="font-medium text-slate-900 text-sm line-clamp-1 mb-0.5">{product.title}</h3>
                  <p className="text-sm font-bold text-primary-600 mb-1.5">
                    {formatPrice(product.price)}원
                  </p>

                  {product.review_reason && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-1 rounded line-clamp-1 mb-1.5">
                      {product.review_reason}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <User className="w-3 h-3" />
                    <span className="truncate">{product.seller?.nickname || '알 수 없음'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => {
              const newPage = page - 1;
              setPage(newPage);
              fetchProducts(newPage);
            }}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
          >
            이전
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => {
              const newPage = page + 1;
              setPage(newPage);
              fetchProducts(newPage);
            }}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
          >
            다음
          </button>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">상품 상세 검토</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="p-6">
                {/* 이미지 갤러리 */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {selectedProduct.images.map((img, idx) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <Image
                        src={img.url}
                        alt={`상품 이미지 ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded">
                          대표
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 상품 정보 */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedProduct.title}</h3>
                    <p className="text-2xl font-bold text-primary-600 mt-1">
                      {formatPrice(selectedProduct.price)}원
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-700">
                      <Tag className="w-4 h-4" />
                      {selectedProduct.category}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">상품 설명</h4>
                    <p className="text-slate-600 whitespace-pre-wrap">{selectedProduct.description}</p>
                  </div>

                  {/* 필터링 사유 */}
                  {selectedProduct.review_reason && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-900">자동 필터링 사유</h4>
                      </div>
                      <p className="text-amber-700">{selectedProduct.review_reason}</p>
                    </div>
                  )}

                  {/* 판매자 정보 */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">판매자 정보</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center">
                        {selectedProduct.seller?.avatar_url ? (
                          <Image
                            src={selectedProduct.seller.avatar_url}
                            alt={selectedProduct.seller.nickname}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{selectedProduct.seller?.nickname}</p>
                        <p className="text-sm text-slate-500">{selectedProduct.seller?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-500">
                    등록일: {formatDate(selectedProduct.created_at)}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedProduct.id)}
                    disabled={isActionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        승인
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isActionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 삭제 사유 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">상품 삭제</h3>
                  <p className="text-sm text-slate-500">삭제 사유를 입력해주세요 (데이터베이스에서 완전 삭제됩니다)</p>
                </div>
              </div>

              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="삭제 사유를 입력하세요..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteReason('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isActionLoading || !deleteReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    '삭제하기'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
