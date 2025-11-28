import { apiClient } from '../axios';
import type { Product } from '@/types';

interface RecentViewsResponse {
  data: Product[];
  total: number;
}

export const recentViewsApi = {
  getRecentViews: async (limit: number = 20): Promise<RecentViewsResponse> => {
    const response = await apiClient.get<RecentViewsResponse>('/recent-views', {
      params: { limit },
    });
    return response.data;
  },

  clearRecentViews: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>('/recent-views');
    return response.data;
  },

  deleteRecentView: async (productId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/recent-views/${productId}`);
    return response.data;
  },
};
