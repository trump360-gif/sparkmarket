import { apiClient } from '../axios';
import type { Hashtag, Product, PaginatedResponse } from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const hashtagsApi = {
  getHashtags: async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Hashtag>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Hashtag>>('/hashtags', {
      params: { page, limit },
    });
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },

  getPopularHashtags: async (): Promise<Hashtag[]> => {
    const response = await apiClient.get<Hashtag[]>('/hashtags/popular');
    return response.data;
  },

  searchHashtags: async (query: string): Promise<Hashtag[]> => {
    const response = await apiClient.get<Hashtag[]>('/hashtags/search', {
      params: { q: query },
    });
    return response.data;
  },

  getHashtagProducts: async (
    name: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Product>>(`/hashtags/${encodeURIComponent(name)}/products`, {
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
