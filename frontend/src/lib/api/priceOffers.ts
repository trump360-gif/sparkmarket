import { apiClient } from '../axios';
import type {
  CreatePriceOfferRequest,
  PriceOffer,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const priceOffersApi = {
  createOffer: async (productId: string, data: CreatePriceOfferRequest) => {
    const response = await apiClient.post<PriceOffer>(
      `/price-offers/products/${productId}`,
      data,
    );
    return response.data;
  },

  acceptOffer: async (offerId: string) => {
    const response = await apiClient.patch<PriceOffer>(
      `/price-offers/${offerId}/accept`,
    );
    return response.data;
  },

  rejectOffer: async (offerId: string) => {
    const response = await apiClient.patch<PriceOffer>(
      `/price-offers/${offerId}/reject`,
    );
    return response.data;
  },

  getReceivedOffers: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<PriceOffer>>(
      '/price-offers/received',
      { params },
    );
    return response.data;
  },

  getSentOffers: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<PriceOffer>>(
      '/price-offers/sent',
      { params },
    );
    return response.data;
  },

  getProductOffers: async (productId: string) => {
    const response = await apiClient.get<PriceOffer[]>(
      `/price-offers/products/${productId}`,
    );
    return response.data;
  },
};
