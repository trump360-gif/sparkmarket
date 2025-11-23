import { apiClient } from '../axios';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  PaginatedResponse,
} from '@/types';

export const productsApi = {
  getProducts: async (params: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params,
    });
    return response.data;
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
};
