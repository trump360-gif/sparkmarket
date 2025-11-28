'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { UserStatus, UserRole } from '@/types';
import type { User } from '@/types';
import {
  Search,
  Users,
  Shield,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Filter
} from 'lucide-react';

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.getUsers(params);
      setUsers(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        console.error('Failed to fetch users:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (user: User, newStatus: UserStatus) => {
    const action = newStatus === UserStatus.BANNED ? '차단' : '활성화';
    const reason = newStatus === UserStatus.BANNED
      ? prompt(`"${user.nickname}" 유저를 차단하시겠습니까?\n차단 사유를 입력하세요:`)
      : '';

    if (newStatus === UserStatus.BANNED && !reason) return;

    if (!confirm(`정말 ${action}하시겠습니까?`)) return;

    try {
      await adminApi.updateUserStatus(user.id, {
        status: newStatus,
        reason: reason || undefined,
      });
      toast.success(`${action}되었습니다.`);
      fetchUsers();
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401) {
        toast.error(`${action}에 실패했습니다.`);
      }
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const config = {
      [UserStatus.ACTIVE]: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle,
        label: '활성'
      },
      [UserStatus.BANNED]: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: Ban,
        label: '차단됨'
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

  const getRoleBadge = (role: string) => {
    const isAdmin = role === UserRole.ADMIN;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isAdmin
          ? 'bg-purple-50 text-purple-700 border border-purple-200'
          : 'bg-slate-50 text-slate-600 border border-slate-200'
      }`}>
        {isAdmin ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
        {isAdmin ? '관리자' : '일반'}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">유저 관리</h1>
            <p className="text-slate-500 text-sm">총 {total}명의 유저</p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이메일 또는 닉네임으로 검색..."
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

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | '');
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="">전체 상태</option>
              <option value={UserStatus.ACTIVE}>활성</option>
              <option value={UserStatus.BANNED}>차단됨</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden">
          <TableSkeleton rows={10} cols={6} />
        </div>
      ) : (
        <>
          {/* 테이블 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">닉네임</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">역할</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">가입일</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                        >
                          {user.nickname}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.role !== UserRole.ADMIN && (
                          <>
                            {user.status === UserStatus.ACTIVE ? (
                              <button
                                onClick={() => handleStatusChange(user, UserStatus.BANNED)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                                차단
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(user, UserStatus.ACTIVE)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                활성화
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <div className="flex items-center gap-1 px-4 py-2 bg-slate-100 rounded-xl">
              <span className="font-medium text-primary-600">{page}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">{totalPages}</span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
