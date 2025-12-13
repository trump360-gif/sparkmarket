// ================================
// Pagination
// ================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ================================
// Upload
// ================================

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}
