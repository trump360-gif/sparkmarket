'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">⚡</div>
              <span className="text-2xl font-bold text-white whitespace-nowrap">
                스파크마켓
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all"
                >
                  홈
                </Link>
              </div>
            )}
          </div>

          {/* 검색바 */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="상품을 검색해보세요..."
                  className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      router.push('/');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/mypage"
                  className="hidden sm:flex items-center px-3 py-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-medium text-sm mr-2">
                    {user?.nickname?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user?.nickname}
                  </span>
                </Link>
                <Link
                  href="/products/new"
                  className="hidden sm:block px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm hover:shadow"
                >
                  + 판매하기
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium shadow-sm"
                  >
                    ⚙️ 관리자
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="hidden sm:block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  로그아웃
                </button>
                {/* 모바일 메뉴 버튼 */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isMobileMenuOpen
                          ? 'M6 18L18 6M6 6l12 12'
                          : 'M4 6h16M4 12h16M4 18h16'
                      }
                    />
                  </svg>
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
                  className="hidden sm:block px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="sm:hidden border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              {/* 모바일 검색바 */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="상품을 검색해보세요..."
                    className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </form>

              <Link
                href="/mypage"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all"
              >
                마이페이지
              </Link>
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all"
              >
                홈
              </Link>
              <Link
                href="/products/new"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium text-center"
              >
                + 판매하기
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-center"
                >
                  ⚙️ 관리자
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all text-left"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
