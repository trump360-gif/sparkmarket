import { apiClient } from '../axios';
import type { RecentView } from '@/types';

export const recentViewsApi = {
  getRecentViews: async (limit: number = 20): Promise<RecentView[]> => {
    const response = await apiClient.get<RecentView[]>('/recent-views', {
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
