import { User } from './user';
import { Product } from './product';

// ================================
// Types
// ================================

export type ReportReason = 'SPAM' | 'FRAUD' | 'INAPPROPRIATE' | 'PROHIBITED_ITEM' | 'FAKE' | 'OTHER';
export type ReportTargetType = 'USER' | 'PRODUCT';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

// ================================
// Interfaces
// ================================

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  admin_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocked?: User;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  follower?: User;
  following?: User;
  created_at: string;
}

export interface KeywordAlert {
  id: string;
  user_id: string;
  keyword: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  is_active: boolean;
  created_at: string;
}

export interface RecentView {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  viewed_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ko: string;
  slug: string;
  icon?: string;
  description?: string;
  parent_id?: string;
  parent?: Category;
  children?: Category[];
  sort_order: number;
  is_active: boolean;
}
