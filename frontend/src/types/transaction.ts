import { User } from './user';
import { ReviewType } from './review';

// ================================
// Interfaces
// ================================

export interface CommissionSettings {
  id: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  product_price: number;
  commission_rate: number;
  commission_amount: number;
  seller_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionStatistics {
  total: {
    transactions: number;
    totalSales: number;
    totalCommission: number;
    totalSellerAmount: number;
  };
  monthly: {
    transactions: number;
    totalSales: number;
    totalCommission: number;
    totalSellerAmount: number;
  };
  recentTransactions: Transaction[];
}

export interface TransactionWithDetails extends Transaction {
  seller: Pick<User, 'id' | 'nickname' | 'avatar_url'>;
  buyer: Pick<User, 'id' | 'nickname' | 'avatar_url'>;
  reviews: { id: string; review_type: string; reviewer_id: string }[];
  canWriteReview: boolean;
  myRole: 'seller' | 'buyer';
  reviewType: ReviewType;
}

// ================================
// Request Types
// ================================

export interface UpdateCommissionRateRequest {
  commission_rate: number;
}
