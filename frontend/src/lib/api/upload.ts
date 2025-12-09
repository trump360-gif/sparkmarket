import { apiClient } from '../axios';
import type { PresignedUrlRequest, PresignedUrlResponse } from '@/types';
import axios from 'axios';

export const uploadApi = {
  getPresignedUrl: async (data: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<PresignedUrlResponse>('/images/presigned-url', data);
    return response.data;
  },

  getAvatarPresignedUrl: async (data: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<PresignedUrlResponse>('/images/avatar-presigned-url', data);
    return response.data;
  },

  uploadToR2: async (uploadUrl: string, file: File): Promise<void> => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  uploadImage: async (file: File): Promise<PresignedUrlResponse> => {
    // 1. Get presigned URL
    const presignedData = await uploadApi.getPresignedUrl({
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    });

    // 2. Upload to R2
    await uploadApi.uploadToR2(presignedData.presignedUrl, file);

    // 3. Return image metadata
    return presignedData;
  },

  uploadAvatar: async (file: File): Promise<PresignedUrlResponse> => {
    // 1. Get avatar presigned URL
    const presignedData = await uploadApi.getAvatarPresignedUrl({
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    });

    // 2. Upload to R2/Local storage
    await uploadApi.uploadToR2(presignedData.presignedUrl, file);

    // 3. Return image metadata
    return presignedData;
  },
};
