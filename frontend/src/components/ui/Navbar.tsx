'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Menu, X, Zap, User, Plus } from 'lucide-react';
import NotificationDropdown from '@/components/notification/NotificationDropdown';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity rounded-full"></div>
                <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Spark<span className="text-primary-600 dark:text-primary-400">Market</span>
              </span>
            </Link>
          </div>

          {/* 검색바 */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg opacity-20 group-hover:opacity-40 transition duration-300 blur"></div>
                <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                  <Search className="absolute left-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="어떤 상품을 찾으시나요?"
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        router.push('/');
                      }}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 다크 모드 토글 */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* 판매하기 버튼 - 항상 표시 */}
            <Link
              href={isAuthenticated ? '/products/new' : `/login?returnUrl=${encodeURIComponent('/products/new')}`}
              className="hidden sm:block"
            >
              <Button className="gap-1.5 shadow-lg shadow-primary-500/20">
                <Plus className="w-4 h-4" />
                <span>판매하기</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {/* 알림 드롭다운 */}
                <NotificationDropdown className="hidden sm:block" />

                <Link href="/mypage">
                  <Button variant="ghost" size="sm" className="relative hidden sm:flex items-center gap-2">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.nickname || '프로필'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
                        {user?.nickname?.charAt(0) || <User className="w-4 h-4" />}
                      </div>
                    )}
                    <span className="font-medium text-slate-700">마이페이지</span>
                  </Button>
                </Link>

                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="secondary" size="sm" className="hidden sm:flex">
                      관리자
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex text-slate-600"
                >
                  로그아웃
                </Button>

                {/* 모바일: 알림 + 메뉴 버튼 */}
                <div className="flex items-center gap-1 sm:hidden">
                  <NotificationDropdown />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-600 hover:text-primary-600">
                    로그인
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="shadow-lg shadow-primary-500/20">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg absolute left-0 right-0 shadow-lg animate-slide-up">
            <div className="px-4 py-3 space-y-3">
              {/* 모바일 검색바 */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="상품 검색..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </form>

              {/* 모바일 테마 토글 */}
              <div className="flex items-center justify-between px-2 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">테마</span>
                <ThemeToggle />
              </div>

              {/* 모바일 판매하기 버튼 */}
              <Link
                href={isAuthenticated ? '/products/new' : `/login?returnUrl=${encodeURIComponent('/products/new')}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <Button className="w-full gap-1.5 mb-3">
                  <Plus className="w-4 h-4" />
                  <span>판매하기</span>
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center px-2 py-2 mb-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.nickname || '프로필'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center font-bold text-sm mr-3">
                        {user?.nickname?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{user?.nickname}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/mypage"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    마이페이지
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg font-medium"
                    >
                      관리자 페이지
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">로그인</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">회원가입</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
