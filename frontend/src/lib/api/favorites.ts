import { apiClient } from '../axios';

export const favoritesApi = {
  // 찜하기 토글 (추가/취소)
  toggleFavorite: async (productId: string) => {
    const { data } = await apiClient.post(`/favorites/toggle/${productId}`);
    return data;
  },

  // 찜 여부 확인
  checkFavorite: async (productId: string) => {
    const { data } = await apiClient.get(`/favorites/check/${productId}`);
    return data;
  },

  // 찜 목록 조회
  getFavorites: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get('/favorites', { params });
    return data;
  },
};
