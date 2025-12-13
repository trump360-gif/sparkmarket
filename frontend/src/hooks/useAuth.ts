import { useAuthStore } from '@/stores';
import { authApi } from '@/lib/api/auth';
import { usersApi } from '@/lib/api/users';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { LoginRequest, RegisterRequest, User } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const { user, accessToken, refreshToken, isAuthenticated, isAdmin, setAuth, clearAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // zustand persist hydration 완료 대기
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      setAuth(response.user, response.access_token, response.refresh_token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      setAuth(response.user, response.access_token, response.refresh_token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    logout();
    router.push('/login');
  };

  // 프로필 업데이트 후 사용자 정보 새로고침
  const refreshUser = async () => {
    if (!accessToken || !refreshToken) return;
    try {
      const profile = await usersApi.getMyProfile();
      const updatedUser: User = {
        id: profile.id,
        email: profile.email,
        nickname: profile.nickname,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
        updated_at: profile.updated_at || profile.created_at,
      };
      setAuth(updatedUser, accessToken, refreshToken);
    } catch (error: any) {
      // 401 에러는 조용히 무시
      if (error?.response?.status !== 401 && error?.response?.data?.statusCode !== 401) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    register,
    logout: signOut,
    clearAuth,
    refreshUser,
  };
};
