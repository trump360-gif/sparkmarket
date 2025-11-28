import { apiClient } from '../axios';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  PaginatedResponse,
} from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productsApi = {
  getProducts: async (params: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Product>>('/products', {
      params,
    });
    // 백엔드 응답 구조를 프론트엔드 기대 구조로 변환
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/products/${id}`);
    return response.data;
  },

  purchaseProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}/purchase`);
    return response.data;
  },
};
