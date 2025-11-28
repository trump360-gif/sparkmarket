import { apiClient } from '../axios';
import type { Block, Follow, User, PaginatedResponse } from '@/types';

interface BackendFollowResponse {
  data: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export const socialApi = {
  // 팔로우 관련
  follow: async (userId: string): Promise<{ message: string; isFollowing: boolean }> => {
    const response = await apiClient.post<{ message: string; isFollowing: boolean }>(`/follows/${userId}`);
    return response.data;
  },

  unfollow: async (userId: string): Promise<{ message: string; isFollowing: boolean }> => {
    const response = await apiClient.delete<{ message: string; isFollowing: boolean }>(`/follows/${userId}`);
    return response.data;
  },

  isFollowing: async (userId: string): Promise<{ isFollowing: boolean }> => {
    const response = await apiClient.get<{ isFollowing: boolean }>(
      `/follows/check/${userId}`
    );
    return response.data;
  },

  // 내 팔로워 목록 (JWT에서 userId 추출)
  getMyFollowers: async (
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Follow>> => {
    const response = await apiClient.get<BackendFollowResponse>(
      `/follows/followers`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  // 내가 팔로우하는 목록 (JWT에서 userId 추출)
  getMyFollowing: async (
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Follow>> => {
    const response = await apiClient.get<BackendFollowResponse>(
      `/follows/following`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  // 특정 유저의 팔로워 목록
  getUserFollowers: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Follow>> => {
    const response = await apiClient.get<BackendFollowResponse>(
      `/users/${userId}/followers`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  // 특정 유저가 팔로우하는 목록
  getUserFollowing: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Follow>> => {
    const response = await apiClient.get<BackendFollowResponse>(
      `/users/${userId}/following`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  // 팔로잉 피드
  getFollowingFeed: async (
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<BackendFollowResponse>(
      `/follows/feed`,
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  // 차단 관련
  blockUser: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/blocks/${userId}`);
    return response.data;
  },

  unblockUser: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/blocks/${userId}`);
    return response.data;
  },

  isBlocked: async (userId: string): Promise<{ isBlocked: boolean }> => {
    const response = await apiClient.get<{ isBlocked: boolean }>(
      `/blocks/check/${userId}`
    );
    return response.data;
  },

  getBlockedUsers: async (
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Block>> => {
    const response = await apiClient.get<BackendFollowResponse>(
      '/blocks',
      { params }
    );
    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },
};
