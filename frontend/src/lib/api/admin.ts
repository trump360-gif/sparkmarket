import { apiClient } from '../axios';
import type {
  AdminDashboardStats,
  AdminProductQueryParams,
  AdminUserQueryParams,
  Product,
  User,
  PaginatedResponse,
  UpdateUserStatusRequest,
  DeleteProductRequest,
} from '@/types';

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<AdminDashboardStats>('/api/admin/dashboard');
    return response.data;
  },

  getProducts: async (params: AdminProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/api/admin/products', {
      params,
    });
    return response.data;
  },

  deleteProduct: async (id: string, data?: DeleteProductRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/api/admin/products/${id}`, {
      data,
    });
    return response.data;
  },

  getUsers: async (params: AdminUserQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/api/admin/users', {
      params,
    });
    return response.data;
  },

  updateUserStatus: async (id: string, data: UpdateUserStatusRequest): Promise<{ success: boolean; user: User }> => {
    const response = await apiClient.patch<{ success: boolean; user: User }>(`/api/admin/users/${id}/status`, data);
    return response.data;
  },
};
