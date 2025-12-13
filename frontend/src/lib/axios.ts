import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores';
import { ApiErrorResponse } from './errors';

const baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extended Axios request config with retry flag
 */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Queue item for failed requests during token refresh
 */
interface QueueItem {
  resolve: (value: string | null) => void;
  reject: (reason: unknown) => void;
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Flag to prevent multiple redirects and stop all requests during redirect
let isRedirecting = false;
let failedQueue: QueueItem[] = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Clear authentication data and redirect to login
 */
const clearAuthAndRedirect = (): void => {
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

/**
 * Response interceptor - Handle token refresh on 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    // If already redirecting, just reject silently
    if (isRedirecting) {
      return Promise.reject(new Error('Session expired'));
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // Check for 401 status - also check error.status for network errors
    const is401 =
      error.response?.status === 401 || error.response?.data?.statusCode === 401;

    // If 401 and no token exists, just reject without trying to refresh
    if (is401 && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // 토큰이 없으면 조용히 에러 반환 (로그인 안된 상태)
        return Promise.reject(error);
      }
    }

    // If error is 401 and we haven't tried to refresh yet
    if (is401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
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
        interface RefreshResponse {
          access_token: string;
          refresh_token?: string;
        }

        const response = await axios.post<RefreshResponse>(
          `${baseURL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        processQueue(null, access_token);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
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
