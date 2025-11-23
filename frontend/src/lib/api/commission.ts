import { apiClient } from '../axios';
import type {
  CommissionSettings,
  UpdateCommissionRateRequest,
  CommissionStatistics,
  Transaction,
  PaginatedResponse,
} from '@/types';

export const commissionApi = {
  getCurrentRate: async (): Promise<CommissionSettings> => {
    const response = await apiClient.get<CommissionSettings>('/admin/commission/rate');
    return response.data;
  },

  updateRate: async (data: UpdateCommissionRateRequest): Promise<CommissionSettings> => {
    const response = await apiClient.put<CommissionSettings>('/admin/commission/rate', data);
    return response.data;
  },

  getStatistics: async (): Promise<CommissionStatistics> => {
    const response = await apiClient.get<CommissionStatistics>('/admin/commission/statistics');
    return response.data;
  },

  getTransactions: async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/admin/commission/transactions', {
      params: { page, limit },
    });
    return response.data;
  },
};
