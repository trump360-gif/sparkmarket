import { apiClient } from '../axios';
import type {
  AdminDashboardStats,
  AdminProductQueryParams,
  AdminUserQueryParams,
  Product,
  User,
  UserDetail,
  PaginatedResponse,
  UpdateUserStatusRequest,
  DeleteProductRequest,
  BannedWord,
  SuspiciousWord,
  AddWordRequest,
  ModerationCategories,
} from '@/types';

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats');
    return response.data;
  },

  getProducts: async (params: AdminProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/admin/products', {
      params,
    });
    return response.data;
  },

  deleteProduct: async (id: string, data?: DeleteProductRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/admin/products/${id}`, {
      data,
    });
    return response.data;
  },

  getUsers: async (params: AdminUserQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', {
      params,
    });
    return response.data;
  },

  updateUserStatus: async (id: string, data: UpdateUserStatusRequest): Promise<{ success: boolean; user: User }> => {
    const response = await apiClient.patch<{ success: boolean; user: User }>(`/admin/users/${id}/status`, data);
    return response.data;
  },

  getUserDetail: async (id: string): Promise<UserDetail> => {
    const response = await apiClient.get<UserDetail>(`/admin/users/${id}`);
    return response.data;
  },

  // 검토 관련 API
  getPendingReviewCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/admin/review/count');
    return response.data;
  },

  getPendingReviewProducts: async (params: AdminProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/admin/review/products', {
      params,
    });
    return response.data;
  },

  getPendingReviewProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/admin/review/products/${id}`);
    return response.data;
  },

  approveProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.post<Product>(`/admin/review/products/${id}/approve`);
    return response.data;
  },

  rejectProduct: async (id: string, reason: string): Promise<Product> => {
    const response = await apiClient.post<Product>(`/admin/review/products/${id}/reject`, { reason });
    return response.data;
  },

  // 콘텐츠 검토 설정 API
  getModerationCategories: async (): Promise<ModerationCategories> => {
    const response = await apiClient.get<ModerationCategories>('/admin/moderation/categories');
    return response.data;
  },

  // 금지어 관리 API
  getBannedWords: async (category?: string): Promise<{ words: BannedWord[] }> => {
    const response = await apiClient.get<{ words: BannedWord[] }>('/admin/moderation/banned-words', {
      params: category ? { category } : {},
    });
    return response.data;
  },

  addBannedWord: async (data: AddWordRequest): Promise<{ success: boolean; word: BannedWord }> => {
    const response = await apiClient.post<{ success: boolean; word: BannedWord }>('/admin/moderation/banned-words', data);
    return response.data;
  },

  deleteBannedWord: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/admin/moderation/banned-words/${id}`);
    return response.data;
  },

  // 의심 키워드 관리 API
  getSuspiciousWords: async (category?: string): Promise<{ words: SuspiciousWord[] }> => {
    const response = await apiClient.get<{ words: SuspiciousWord[] }>('/admin/moderation/suspicious-words', {
      params: category ? { category } : {},
    });
    return response.data;
  },

  addSuspiciousWord: async (data: AddWordRequest): Promise<{ success: boolean; word: SuspiciousWord }> => {
    const response = await apiClient.post<{ success: boolean; word: SuspiciousWord }>('/admin/moderation/suspicious-words', data);
    return response.data;
  },

  deleteSuspiciousWord: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/admin/moderation/suspicious-words/${id}`);
    return response.data;
  },
};
