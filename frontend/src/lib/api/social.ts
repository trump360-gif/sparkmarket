import { apiClient } from '../axios';
import type { Block, Follow, User, PaginatedResponse } from '@/types';

interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export const socialApi = {
  // 팔로우 관련
  follow: async (userId: string): Promise<Follow> => {
    const response = await apiClient.post<Follow>(`/social/follow/${userId}`);
    return response.data;
  },

  unfollow: async (userId: string): Promise<void> => {
    await apiClient.delete(`/social/follow/${userId}`);
  },

  isFollowing: async (userId: string): Promise<{ isFollowing: boolean }> => {
    const response = await apiClient.get<{ isFollowing: boolean }>(
      `/social/follow/${userId}/status`
    );
    return response.data;
  },

  getFollowers: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Follow>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Follow>>(
      `/social/followers/${userId}`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },

  getFollowing: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Follow>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Follow>>(
      `/social/following/${userId}`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      totalPages: response.data.meta.totalPages,
    };
  },

  getFollowStats: async (userId: string): Promise<FollowStats> => {
    const response = await apiClient.get<FollowStats>(`/social/stats/${userId}`);
    return response.data;
  },

  // 차단 관련
  blockUser: async (userId: string): Promise<Block> => {
    const response = await apiClient.post<Block>(`/social/block/${userId}`);
    return response.data;
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/social/block/${userId}`);
  },

  isBlocked: async (userId: string): Promise<{ isBlocked: boolean }> => {
    const response = await apiClient.get<{ isBlocked: boolean }>(
      `/social/block/${userId}/status`
    );
    return response.data;
  },

  getBlockedUsers: async (
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Block>> => {
    const response = await apiClient.get<BackendPaginatedResponse<Block>>(
      '/social/blocked',
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
