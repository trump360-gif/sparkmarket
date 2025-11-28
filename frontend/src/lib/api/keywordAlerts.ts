import { apiClient } from '../axios';
import type { KeywordAlert } from '@/types';

export interface CreateKeywordAlertRequest {
  keyword: string;
  category?: string;
  min_price?: number;
  max_price?: number;
}

export interface UpdateKeywordAlertRequest {
  keyword?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
}

export const keywordAlertsApi = {
  createKeywordAlert: async (data: CreateKeywordAlertRequest): Promise<KeywordAlert> => {
    const response = await apiClient.post<KeywordAlert>('/keyword-alerts', data);
    return response.data;
  },

  getMyKeywordAlerts: async (): Promise<KeywordAlert[]> => {
    const response = await apiClient.get<KeywordAlert[]>('/keyword-alerts');
    return response.data;
  },

  updateKeywordAlert: async (id: string, data: UpdateKeywordAlertRequest): Promise<KeywordAlert> => {
    const response = await apiClient.patch<KeywordAlert>(`/keyword-alerts/${id}`, data);
    return response.data;
  },

  deleteKeywordAlert: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/keyword-alerts/${id}`);
    return response.data;
  },

  toggleKeywordAlert: async (id: string): Promise<KeywordAlert> => {
    const response = await apiClient.patch<KeywordAlert>(`/keyword-alerts/${id}/toggle`);
    return response.data;
  },
};
