'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">⚡</div>
              <span className="text-2xl font-bold text-white">스파크마켓</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
                >
                  홈
                </Link>
                <Link
                  href="/products"
                  className="px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
                >
                  상품 목록
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center px-3 py-1.5 bg-white/10 rounded-full">
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-medium text-sm mr-2">
                    {user?.nickname?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user?.nickname}
                  </span>
                </div>
                <Link
                  href="/products/new"
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm hover:shadow"
                >
                  + 판매하기
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium shadow-sm"
                  >
                    ⚙️ 관리자
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
