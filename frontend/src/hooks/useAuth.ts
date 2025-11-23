import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import type { LoginRequest, RegisterRequest } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, setAuth, clearAuth, logout } = useAuthStore();

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

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout: signOut,
    clearAuth,
  };
};
