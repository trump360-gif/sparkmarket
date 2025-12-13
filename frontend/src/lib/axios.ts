import axios from 'axios';
import { useAuthStore } from '@/stores';

const baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Flag to prevent multiple redirects and stop all requests during redirect
let isRedirecting = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  if (typeof window !== 'undefined' && !isRedirecting) {
    isRedirecting = true;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage'); // Clear Zustand persist storage
    // Clear Zustand store state
    useAuthStore.getState().clearAuth();
    window.location.href = '/login';
  }
};

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Block all requests if we're redirecting to login
    if (isRedirecting) {
      return Promise.reject(new Error('Session expired, redirecting to login'));
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If already redirecting, just reject silently
    if (isRedirecting) {
      return Promise.reject(new Error('Session expired'));
    }

    const originalRequest = error.config;

    // Check for 401 status - also check error.status for network errors
    const is401 = error.response?.status === 401 ||
                  error.response?.data?.statusCode === 401;

    // If 401 and no token exists, just reject without trying to refresh
    if (is401 && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // 토큰이 없으면 조용히 에러 반환 (로그인 안된 상태)
        return Promise.reject(error);
      }
    }

    // If error is 401 and we haven't tried to refresh yet
    if (is401 && !originalRequest?._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Attempt to refresh token
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        processQueue(null, access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed - clear tokens and redirect to login
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
