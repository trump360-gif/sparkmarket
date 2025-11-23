'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/admin', label: '대시보드', icon: '📊', description: '통계 및 현황' },
  { href: '/admin/products', label: '상품 관리', icon: '📦', description: '상품 목록 관리' },
  { href: '/admin/users', label: '유저 관리', icon: '👥', description: '회원 관리' },
  { href: '/admin/commission', label: '수수료 관리', icon: '💰', description: '수수료 설정 및 통계' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 h-screen sticky top-0 shadow-xl overflow-y-auto">
      <div className="p-6">
        <div className="mb-8 pb-6 border-b border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-xl shadow-lg">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">관리자 페이지</h2>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="mb-8">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <div className="text-2xl transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 bg-white rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pt-6 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3.5 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-xl transition-all group"
          >
            <span className="text-2xl transition-transform group-hover:scale-110">🏠</span>
            <div>
              <div className="font-semibold">메인으로 돌아가기</div>
              <div className="text-xs opacity-75">Back to Home</div>
            </div>
          </Link>
        </div>

        <div className="mt-auto pt-6">
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">System Status</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300 font-medium">All Systems Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
