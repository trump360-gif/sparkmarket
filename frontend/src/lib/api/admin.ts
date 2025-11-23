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
};
