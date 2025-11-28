import { apiClient } from '../axios';
import type { Review, CreateReviewRequest, PaginatedResponse } from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CanWriteReviewResponse {
  canWrite: boolean;
  reason?: string;
  existingReview?: Review;
}

export const reviewsApi = {
  // 리뷰 작성
  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },

  // 내 리뷰 목록
  getMyReviews: async (
    type: 'written' | 'received',
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Review>>('/reviews/my', {
      params: { type, ...params },
    });
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },

  // 리뷰 작성 가능 여부 확인
  canWriteReview: async (
    transactionId: string,
    reviewType: string
  ): Promise<CanWriteReviewResponse> => {
    const response = await apiClient.get<CanWriteReviewResponse>('/reviews/can-write', {
      params: { transactionId, reviewType },
    });
    return response.data;
  },

  // 특정 거래의 리뷰 조회
  getTransactionReviews: async (transactionId: string): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/reviews/transaction/${transactionId}`);
    return response.data;
  },
};
