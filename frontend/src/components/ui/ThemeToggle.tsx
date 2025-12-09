'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, Theme, getSystemTheme, applyTheme } from '@/stores/themeStore';

// ================================
// Component
// ================================

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // 클라이언트 사이드 마운트 확인 (hydration 이슈 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    handleThemeChange(nextTheme);
  };

  // SSR 시 기본 아이콘 표시
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="테마 변경"
      >
        <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>
    );
  }

  const currentTheme = theme === 'system' ? getSystemTheme() : theme;

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={`현재 테마: ${theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '시스템'}`}
      title={`현재 테마: ${theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '시스템'} (클릭하여 변경)`}
    >
      {theme === 'light' && (
        <Sun className="w-5 h-5 text-amber-500" />
      )}
      {theme === 'dark' && (
        <Moon className="w-5 h-5 text-indigo-400" />
      )}
      {theme === 'system' && (
        <Monitor className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  );
}

// ================================
// Dropdown Version (선택사항)
// ================================

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  if (!mounted) {
    return null;
  }

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: '라이트', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: '다크', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: '시스템', icon: <Monitor className="w-4 h-4" /> },
  ];

  const currentOption = options.find((o) => o.value === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
      >
        {currentOption?.icon}
        <span className="text-slate-700 dark:text-slate-300">{currentOption?.label}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  theme === option.value
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {option.icon}
                {option.label}
                {theme === option.value && (
                  <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
