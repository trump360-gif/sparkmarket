'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { DashboardCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import type { UserDetail, UserStatus } from '@/types';
import Link from 'next/link';

interface AdminUserDashboardProps {
  userId: string;
}

export default function AdminUserDashboard({ userId }: AdminUserDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await adminApi.getUserDetail(userId);
        setUser(data);
      } catch (error: any) {
        // 401 에러는 조용히 무시
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch user:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleStatusChange = async () => {
    if (!user) return;

    const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    const action = newStatus === 'BANNED' ? '차단' : '활성화';

    const reason = prompt(`"${user.nickname}" 유저를 ${action}하시겠습니까?\n사유를 입력하세요:`);
    if (!reason) return;

    try {
      await adminApi.updateUserStatus(userId, { status: newStatus as UserStatus, reason });
      toast.success(`${action}되었습니다.`);

      // Refresh user data
      const updatedData = await adminApi.getUserDetail(userId);
      setUser(updatedData);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        toast.error(`${action}에 실패했습니다.`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <Skeleton className="h-8 w-40 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500 dark:text-slate-400">유저를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      BANNED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    };

    const labels = {
      ACTIVE: '활성',
      BANNED: '차단',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      USER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      ADMIN: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    };

    const labels = {
      USER: '일반 사용자',
      ADMIN: '관리자',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getProductStatusBadge = (status: string) => {
    const styles = {
      FOR_SALE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      SOLD: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      DELETED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    };

    const labels = {
      FOR_SALE: '판매중',
      SOLD: '판매완료',
      DELETED: '삭제됨',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            ← 유저 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.nickname}</h1>
        </div>
        <button
          onClick={handleStatusChange}
          className={`px-4 py-2 rounded-md text-white transition-colors ${
            user.status === 'ACTIVE'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          상태 변경 ({user.status === 'ACTIVE' ? 'ACTIVE → BANNED' : 'BANNED → ACTIVE'})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">전체 상품</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{user.product_stats.total_products.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">판매중</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{user.product_stats.active_products.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium mb-1">판매완료</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{user.product_stats.sold_products.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">유저 정보</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-slate-400">닉네임</label>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.nickname}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-slate-400">이메일</label>
            <p className="mt-1 text-gray-900 dark:text-slate-200">{user.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-slate-400">역할</label>
            <div className="mt-1">{getRoleBadge(user.role)}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-slate-400">상태</label>
            <div className="mt-1">{getStatusBadge(user.status)}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-slate-400">가입일</label>
            <p className="mt-1 text-gray-900 dark:text-slate-200">
              {new Date(user.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">최근 상품</h2>

        {user.recent_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    등록일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {user.recent_products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-slate-200">
                      {formatPrice(product.price)}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getProductStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400">
                      {new Date(product.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-slate-400">등록된 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
