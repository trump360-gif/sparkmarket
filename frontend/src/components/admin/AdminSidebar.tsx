'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  Percent,
  Home,
  X,
  Shield,
  Activity,
  ClipboardCheck,
  ShieldAlert
} from 'lucide-react';

interface AdminSidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, description: '통계 및 현황' },
  { href: '/admin/review', label: '상품 검토', icon: ClipboardCheck, description: '검토 대기 상품', highlight: true },
  { href: '/admin/products', label: '상품 관리', icon: Package, description: '상품 목록 관리' },
  { href: '/admin/users', label: '유저 관리', icon: Users, description: '회원 관리' },
  { href: '/admin/moderation', label: '콘텐츠 필터', icon: ShieldAlert, description: '금지어/의심 키워드' },
  { href: '/admin/commission', label: '수수료 관리', icon: Percent, description: '수수료 설정 및 통계' },
];

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm h-[calc(100vh-4rem)] fixed top-16 left-0 shadow-lg border-r border-slate-200/50 overflow-y-auto">
      <div className="p-5">
        {/* 모바일 닫기 버튼 */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 헤더 */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">관리자 페이지</h2>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            메뉴
          </p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 bg-white/50 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 구분선 */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            바로가기
          </p>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center space-x-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all group"
          >
            <Home className="w-5 h-5 text-slate-500 group-hover:text-primary-500" />
            <div>
              <div className="font-medium text-sm">메인으로 돌아가기</div>
              <div className="text-xs text-slate-400">Back to Home</div>
            </div>
          </Link>
        </div>

        {/* 시스템 상태 */}
        <div className="mt-6 pt-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">System Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">All Systems Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
