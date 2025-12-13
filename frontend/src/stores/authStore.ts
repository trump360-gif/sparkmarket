import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/lib/api/auth';

// ================================
// Types & Interfaces
// ================================

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

// ================================
// Store
// ================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
        });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
        authApi.logout();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
