'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import type { AdminDashboardStats } from '@/types';
import {
  Users,
  Package,
  ShoppingCart,
  CheckCircle,
  UserPlus,
  FileText,
  TrendingUp,
  Loader2,
  ArrowRight,
  Coins
} from 'lucide-react';
import FirebaseAnalyticsCharts from './FirebaseAnalyticsCharts';

export default function Dashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (error: any) {
        // 401 에러는 조용히 무시 (로그인 안된 상태 또는 권한 없음)
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch dashboard stats:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">데이터를 불러올 수 없습니다.</p>
        </div>
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
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/admin/users',
    },
    {
      label: '전체 상품',
      value: stats.total_products.toLocaleString(),
      icon: Package,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      href: '/admin/products',
    },
    {
      label: '판매중 상품',
      value: stats.active_products.toLocaleString(),
      icon: ShoppingCart,
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      href: '/admin/products?status=FOR_SALE',
    },
    {
      label: '판매완료',
      value: stats.sold_products.toLocaleString(),
      icon: CheckCircle,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/admin/products?status=SOLD',
    },
    {
      label: '오늘 가입',
      value: stats.new_users_today.toLocaleString(),
      icon: UserPlus,
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      href: '/admin/users',
    },
    {
      label: '오늘 등록',
      value: stats.new_products_today.toLocaleString(),
      icon: FileText,
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      href: '/admin/products',
    },
  ];

  const salesChart = stats.sales_chart || [];
  const maxSales = salesChart.length > 0 ? Math.max(...salesChart.map((d) => d.sales), 1) : 1;

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">대시보드</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">실시간 통계 및 현황을 확인하세요</p>
      </div>

      {/* 오늘 거래 금액 - 하이라이트 */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 p-6 lg:p-8 text-white relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-2 text-white/80">오늘 거래 금액</p>
              <p className="text-3xl lg:text-4xl font-bold">{formatPrice(stats.today_sales || 0)}원</p>
              <p className="text-sm mt-3 text-white/70 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                총 {salesChart[salesChart.length - 1]?.count || 0}건의 거래
              </p>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Coins className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{card.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                </div>
                <div className={`${card.bgColor} dark:bg-opacity-20 w-14 h-14 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${card.textColor}`} />
                </div>
              </div>
              <div className="flex items-center justify-end mt-3 text-xs text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400">
                <span>자세히 보기</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Firebase Analytics Style Charts */}
      <div className="mb-8">
        <FirebaseAnalyticsCharts
          salesData={salesChart}
          userData={stats.user_registration_chart || []}
          categoryStats={stats.category_stats || []}
          statusStats={stats.status_stats || []}
        />
      </div>

      {/* 요약 섹션 */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
            <Users className="w-5 h-5 text-blue-500" />
            <p className="text-slate-700 dark:text-slate-300">
              총 <span className="font-bold text-blue-600 dark:text-blue-400">{stats.total_users}명</span>의 유저가 가입했습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20">
            <Package className="w-5 h-5 text-emerald-500" />
            <p className="text-slate-700 dark:text-slate-300">
              총 <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.total_products}개</span>의 상품이 등록되었습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/20">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            <p className="text-slate-700 dark:text-slate-300">
              현재 <span className="font-bold text-amber-600 dark:text-amber-400">{stats.active_products}개</span>의 상품이 판매중입니다.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
            <CheckCircle className="w-5 h-5 text-purple-500" />
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-bold text-purple-600 dark:text-purple-400">{stats.sold_products}개</span>의 상품이 판매 완료되었습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50/50 dark:bg-primary-900/20 md:col-span-2">
            <Coins className="w-5 h-5 text-primary-500" />
            <p className="text-slate-700 dark:text-slate-300">
              오늘 <span className="font-bold text-primary-600 dark:text-primary-400">{formatPrice(stats.today_sales || 0)}원</span>의 거래가 발생했습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
