import { User } from './user';
import { Product } from './product';

// ================================
// Enums
// ================================

export enum ReviewType {
  BUYER_TO_SELLER = 'BUYER_TO_SELLER',
  SELLER_TO_BUYER = 'SELLER_TO_BUYER',
}

export enum PriceOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// ================================
// Interfaces
// ================================

export interface Review {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewer?: User;
  reviewee_id: string;
  reviewee?: User;
  rating: number;
  content?: string;
  review_type: ReviewType;
  created_at: string;
  updated_at: string;
}

export interface PriceOffer {
  id: string;
  product_id: string;
  product?: Product;
  buyer_id: string;
  buyer?: User;
  seller_id: string;
  seller?: User;
  offered_price: number;
  message?: string;
  status: PriceOfferStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

// ================================
// Request Types
// ================================

export interface CreateReviewRequest {
  transaction_id: string;
  rating: number;
  content?: string;
  review_type: ReviewType;
}

export interface CreatePriceOfferRequest {
  offered_price: number;
  message?: string;
}
