'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { commissionApi } from '@/lib/api/commission';
import { DashboardCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import type { CommissionStatistics, CommissionSettings } from '@/types';

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
    } catch (err: any) {
      setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || '수수료율 변경에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">수수료 관리</h1>

      {/* 수수료율 설정 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">수수료율 설정</h2>
        <form onSubmit={handleUpdateRate} className="flex items-end space-x-4">
          <div className="flex-1">
            <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">
              현재 수수료율
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="commission_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-lg font-medium">%</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? '변경 중...' : '수수료율 변경'}
          </button>
        </form>
        <p className="mt-2 text-sm text-gray-600">
          마지막 업데이트: {settings ? new Date(settings.updated_at).toLocaleString('ko-KR') : '-'}
        </p>
      </div>

      {/* 통계 대시보드 */}
      {statistics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 전체 통계 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">전체 통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">총 거래 수</span>
                  <span className="text-lg font-medium">{statistics.total.transactions.toLocaleString()}건</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">총 거래액</span>
                  <span className="text-lg font-medium text-blue-600">
                    {statistics.total.totalSales.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">총 수수료</span>
                  <span className="text-lg font-medium text-green-600">
                    {statistics.total.totalCommission.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">판매자 정산액</span>
                  <span className="text-lg font-medium">
                    {statistics.total.totalSellerAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 이번 달 통계 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">이번 달 통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">거래 수</span>
                  <span className="text-lg font-medium">{statistics.monthly.transactions.toLocaleString()}건</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">거래액</span>
                  <span className="text-lg font-medium text-blue-600">
                    {statistics.monthly.totalSales.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">수수료</span>
                  <span className="text-lg font-medium text-green-600">
                    {statistics.monthly.totalCommission.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">판매자 정산액</span>
                  <span className="text-lg font-medium">
                    {statistics.monthly.totalSellerAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 거래 내역 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">최근 거래 내역</h3>
            {statistics.recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">거래 내역이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        거래 일시
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상품 가격
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수수료율
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수수료
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        판매자 정산액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistics.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.created_at).toLocaleString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {transaction.product_price.toLocaleString()}원
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {transaction.commission_rate}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                          {transaction.commission_amount.toLocaleString()}원
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
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
