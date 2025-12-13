'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { commissionApi } from '@/lib/api/commission';
import { DashboardCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import type { CommissionStatistics, CommissionSettings } from '@/types';
import {
  Percent,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Wallet,
  Clock,
  Loader2,
  AlertCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

export default function AdminCommissionPage() {
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [statistics, setStatistics] = useState<CommissionStatistics | null>(null);
  const [newRate, setNewRate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsData, statsData] = await Promise.all([
        commissionApi.getCurrentRate(),
        commissionApi.getStatistics(),
      ]);
      setSettings(settingsData);
      setStatistics(statsData);
      setNewRate(settingsData.commission_rate.toString());
    } catch (err) {
      setError(getErrorMessage(err, '데이터를 불러오는데 실패했습니다.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(newRate);

    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('수수료율은 0~100 사이의 숫자여야 합니다.');
      return;
    }

    if (!confirm(`수수료율을 ${rate}%로 변경하시겠습니까?`)) {
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await commissionApi.updateRate({ commission_rate: rate });
      setSettings(updated);
      toast.success('수수료율이 성공적으로 변경되었습니다.');
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, '수수료율 변경에 실패했습니다.'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="bg-white/80 rounded-xl border border-slate-200/50 p-6 mb-8">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Percent className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">수수료 관리</h1>
            <p className="text-slate-500 text-sm">수수료율 설정 및 통계</p>
          </div>
        </div>
      </div>

      {/* 수수료율 설정 카드 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 p-6 lg:p-8 text-white relative overflow-hidden mb-8">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5" />
            수수료율 설정
          </h2>
          <form onSubmit={handleUpdateRate} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <label htmlFor="commission_rate" className="block text-sm font-medium text-white/80 mb-2">
                현재 수수료율
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="commission_rate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-32 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg font-semibold"
                />
                <span className="text-2xl font-bold">%</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-3 bg-white text-primary-600 rounded-xl hover:bg-white/90 disabled:bg-white/50 disabled:cursor-not-allowed font-semibold shadow-lg flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                '수수료율 변경'
              )}
            </button>
          </form>
          <p className="mt-4 text-sm text-white/70 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            마지막 업데이트: {settings ? new Date(settings.updated_at).toLocaleString('ko-KR') : '-'}
          </p>
        </div>
      </div>

      {/* 통계 대시보드 */}
      {statistics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 전체 통계 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-slate-900">전체 통계</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShoppingBag className="w-4 h-4" />
                    <span>총 거래 수</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">{statistics.total.transactions.toLocaleString()}건</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>총 거래액</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-600">
                    {statistics.total.totalSales.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span>총 수수료</span>
                  </div>
                  <span className="text-lg font-semibold text-emerald-600">
                    {statistics.total.totalCommission.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Wallet className="w-4 h-4" />
                    <span>판매자 정산액</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {statistics.total.totalSellerAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 이번 달 통계 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-slate-900">이번 달 통계</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShoppingBag className="w-4 h-4" />
                    <span>거래 수</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">{statistics.monthly.transactions.toLocaleString()}건</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>거래액</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-600">
                    {statistics.monthly.totalSales.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span>수수료</span>
                  </div>
                  <span className="text-lg font-semibold text-emerald-600">
                    {statistics.monthly.totalCommission.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Wallet className="w-4 h-4" />
                    <span>판매자 정산액</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    {statistics.monthly.totalSellerAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 거래 내역 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                최근 거래 내역
              </h3>
            </div>
            {statistics.recentTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">거래 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        거래 일시
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        상품 가격
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        수수료율
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        수수료
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        판매자 정산액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statistics.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {new Date(transaction.created_at).toLocaleString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {transaction.product_price.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {transaction.commission_rate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                          {transaction.commission_amount.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {transaction.seller_amount.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
