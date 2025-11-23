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

  const statCards = [
    {
      label: '전체 유저',
      value: stats.total_users,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      label: '전체 상품',
      value: stats.total_products,
      icon: '📦',
      color: 'bg-green-500',
    },
    {
      label: '판매중 상품',
      value: stats.active_products,
      icon: '🛒',
      color: 'bg-yellow-500',
    },
    {
      label: '판매완료',
      value: stats.sold_products,
      icon: '✅',
      color: 'bg-purple-500',
    },
    {
      label: '오늘 가입',
      value: stats.new_users_today,
      icon: '🆕',
      color: 'bg-pink-500',
    },
    {
      label: '오늘 등록',
      value: stats.new_products_today,
      icon: '📝',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow-md p-6 border-l-4"
            style={{ borderColor: card.color.replace('bg-', '') }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
              <div className={`${card.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
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
        </div>
      </div>
    </div>
  );
}
