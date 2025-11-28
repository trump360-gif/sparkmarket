import { apiClient } from '../axios';
import type { Category, Product, PaginatedResponse } from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  getCategory: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${slug}`);
    return response.data;
  },

  getCategoryProducts: async (
    slug: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Product>>(`/categories/${slug}/products`, {
      params: { page, limit },
    });
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },
};
