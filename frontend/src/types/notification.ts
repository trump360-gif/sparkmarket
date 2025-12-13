// ================================
// Enums
// ================================

export enum NotificationType {
  PRICE_OFFER_RECEIVED = 'PRICE_OFFER_RECEIVED',
  PRICE_OFFER_ACCEPTED = 'PRICE_OFFER_ACCEPTED',
  PRICE_OFFER_REJECTED = 'PRICE_OFFER_REJECTED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  PRODUCT_SOLD = 'PRODUCT_SOLD',
  PRODUCT_APPROVED = 'PRODUCT_APPROVED',
  PRODUCT_REJECTED = 'PRODUCT_REJECTED',
  TRANSACTION_COMPLETED = 'TRANSACTION_COMPLETED',
}

export enum RelatedType {
  PRODUCT = 'PRODUCT',
  PRICE_OFFER = 'PRICE_OFFER',
  REVIEW = 'REVIEW',
  TRANSACTION = 'TRANSACTION',
}

// ================================
// Interfaces
// ================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  related_type?: RelatedType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}
