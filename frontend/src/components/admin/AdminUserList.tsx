'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api/admin';
import type { User, UserStatus } from '@/types';

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
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
    const action = newStatus === 'BANNED' ? '차단' : '활성화';
    const reason = newStatus === 'BANNED'
      ? prompt(`"${user.nickname}" 유저를 차단하시겠습니까?\n차단 사유를 입력하세요:`)
      : '';

    if (newStatus === 'BANNED' && !reason) return;

    if (!confirm(`정말 ${action}하시겠습니까?`)) return;

    try {
      await adminApi.updateUserStatus(user.id, {
        status: newStatus,
        reason: reason || undefined,
      });
      alert(`${action}되었습니다.`);
      fetchUsers();
    } catch (error) {
      alert(`${action}에 실패했습니다.`);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      BANNED: 'bg-red-100 text-red-800',
    };

    const labels = {
      ACTIVE: '활성',
      BANNED: '차단됨',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const isAdmin = role === 'ADMIN';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isAdmin ? '관리자' : '일반'}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">유저 관리</h1>

        <div className="flex space-x-4 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이메일 또는 닉네임으로 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              검색
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '');
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="BANNED">차단됨</option>
          </select>
        </div>

        <p className="text-gray-600">총 {total}명의 유저</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">닉네임</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role !== 'ADMIN' && (
                        <>
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(user, 'BANNED')}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              차단
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(user, 'ACTIVE')}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
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

          {/* Pagination */}
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
