import { apiClient } from '../axios';
import type { UserProfile, UpdateProfileRequest, Review, PaginatedResponse, TransactionWithDetails } from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  // 내 프로필 조회
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/me');
    return response.data;
  },

  // 내 프로필 수정
  updateMyProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/users/me', data);
    return response.data;
  },

  // 특정 사용자 프로필 조회
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/${userId}`);
    return response.data;
  },

  // 특정 사용자 리뷰 목록
  getUserReviews: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Review>>(
      `/users/${userId}/reviews`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },

  // 내 거래 내역 조회
  getMyTransactions: async (
    params?: { type?: 'all' | 'sold' | 'bought'; page?: number; limit?: number }
  ): Promise<PaginatedResponse<TransactionWithDetails>> => {
    const response = await apiClient.get<BackendPaginatedResponse<TransactionWithDetails>>(
      '/users/me/transactions',
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },
};
