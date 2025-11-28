import { apiClient } from '../axios';
import type { Brand, Product, PaginatedResponse } from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const brandsApi = {
  getBrands: async (category?: string): Promise<Brand[]> => {
    const response = await apiClient.get<Brand[]>('/brands', {
      params: category ? { category } : undefined,
    });
    return response.data;
  },

  getPopularBrands: async (): Promise<Brand[]> => {
    const response = await apiClient.get<Brand[]>('/brands/popular');
    return response.data;
  },

  getBrand: async (id: string): Promise<Brand> => {
    const response = await apiClient.get<Brand>(`/brands/${id}`);
    return response.data;
  },

  getBrandProducts: async (
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Product>>(`/brands/${id}/products`, {
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
