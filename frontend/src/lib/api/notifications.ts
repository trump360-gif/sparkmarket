import { apiClient } from '../axios';
import { NotificationsResponse, UnreadCountResponse } from '@/types';

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  getNotifications: async (params: GetNotificationsParams = {}) => {
    const response = await apiClient.get<NotificationsResponse>('/notifications', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        unreadOnly: params.unreadOnly || false,
      },
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await apiClient.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  deleteAllRead: async () => {
    const response = await apiClient.delete('/notifications/read/all');
    return response.data;
  },
};
