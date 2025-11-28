import { apiClient } from '../axios';
import type { Report, ReportReason, ReportTargetType, PaginatedResponse } from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateReportRequest {
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  description?: string;
}

export const reportsApi = {
  // 신고 생성
  createReport: async (data: CreateReportRequest): Promise<Report> => {
    const response = await apiClient.post<Report>('/reports', data);
    return response.data;
  },

  // 내 신고 내역 조회 (페이지네이션 지원)
  getMyReports: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Report>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Report>>('/reports/my', {
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
