'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import type { AdminDashboardStats } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const statCards = [
    {
      label: '전체 유저',
      value: stats.total_users.toLocaleString(),
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      label: '전체 상품',
      value: stats.total_products.toLocaleString(),
      icon: '📦',
      color: 'bg-green-500',
    },
    {
      label: '판매중 상품',
      value: stats.active_products.toLocaleString(),
      icon: '🛒',
      color: 'bg-yellow-500',
    },
    {
      label: '판매완료',
      value: stats.sold_products.toLocaleString(),
      icon: '✅',
      color: 'bg-purple-500',
    },
    {
      label: '오늘 가입',
      value: stats.new_users_today.toLocaleString(),
      icon: '🆕',
      color: 'bg-pink-500',
    },
    {
      label: '오늘 등록',
      value: stats.new_products_today.toLocaleString(),
      icon: '📝',
      color: 'bg-indigo-500',
    },
  ];

  const salesChart = stats.sales_chart || [];
  const maxSales = salesChart.length > 0 ? Math.max(...salesChart.map((d) => d.sales), 1) : 1;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>

      {/* 오늘 거래 금액 - 하이라이트 */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-2 opacity-90">오늘 거래 금액</p>
              <p className="text-4xl font-bold">{formatPrice(stats.today_sales || 0)}원</p>
              <p className="text-sm mt-2 opacity-75">
                총 {salesChart[salesChart.length - 1]?.count || 0}건의 거래
              </p>
            </div>
            <div className="text-6xl">💰</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow-md p-6 border-l-4"
            style={{ borderColor: card.color.replace('bg-', '') }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 7일 판매 그래프 */}
      {salesChart.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">최근 7일 판매 추이</h2>
          <div className="space-y-4">
            {salesChart.map((data, index) => {
              const percentage = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;
              const date = new Date(data.date);
              const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;

              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600 font-medium">{dayLabel}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end px-4"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    >
                      {data.sales > 0 && (
                        <span className="text-white text-sm font-semibold">
                          {formatPrice(data.sales)}원
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-500 text-right">{data.count}건</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">요약</h2>
        <div className="space-y-3">
          <p className="text-gray-700">
            • 총 <span className="font-bold text-blue-600">{stats.total_users}명</span>의 유저가 가입했습니다.
          </p>
          <p className="text-gray-700">
            • 총 <span className="font-bold text-green-600">{stats.total_products}개</span>의 상품이 등록되었습니다.
          </p>
          <p className="text-gray-700">
            • 현재 <span className="font-bold text-yellow-600">{stats.active_products}개</span>의 상품이 판매중입니다.
          </p>
          <p className="text-gray-700">
            • <span className="font-bold text-purple-600">{stats.sold_products}개</span>의 상품이 판매 완료되었습니다.
          </p>
          <p className="text-gray-700">
            • 오늘 <span className="font-bold text-emerald-600">{formatPrice(stats.today_sales || 0)}원</span>의 거래가 발생했습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
