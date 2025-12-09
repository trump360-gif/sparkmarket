'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Loader2, Menu } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
    } else if (!isAdmin) {
      toast.error('관리자 권한이 필요합니다.');
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>권한을 확인하는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* 배경 장식 */}
      <div className="fixed top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
      >
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>

      {/* 모바일 사이드바 오버레이 */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 animate-slide-in-left">
            <AdminSidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex relative z-10">
        {/* 데스크톱 사이드바 */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        <main className="flex-1 lg:ml-64 pt-20 min-h-screen overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
