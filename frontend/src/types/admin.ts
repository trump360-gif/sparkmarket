import { Product, ProductStatus } from './product';
import { User, UserStatus } from './user';

// ================================
// Enums
// ================================

export enum BannedWordCategory {
  ILLEGAL = 'ILLEGAL',
  ADULT = 'ADULT',
  WEAPON = 'WEAPON',
  PERSONAL_INFO = 'PERSONAL_INFO',
  ILLEGAL_SERVICE = 'ILLEGAL_SERVICE',
  MEDICINE = 'MEDICINE',
}

export enum SuspiciousWordCategory {
  URGENT_SALE = 'URGENT_SALE',
  PAYMENT = 'PAYMENT',
  CONTACT = 'CONTACT',
  CLAIM = 'CLAIM',
}

// ================================
// Constants
// ================================

export const BANNED_WORD_CATEGORY_LABELS: Record<BannedWordCategory, string> = {
  [BannedWordCategory.ILLEGAL]: '불법 물품',
  [BannedWordCategory.ADULT]: '성인/음란물',
  [BannedWordCategory.WEAPON]: '무기류',
  [BannedWordCategory.PERSONAL_INFO]: '개인정보/사기',
  [BannedWordCategory.ILLEGAL_SERVICE]: '불법 서비스',
  [BannedWordCategory.MEDICINE]: '의약품',
};

export const SUSPICIOUS_WORD_CATEGORY_LABELS: Record<SuspiciousWordCategory, string> = {
  [SuspiciousWordCategory.URGENT_SALE]: '급매/급처',
  [SuspiciousWordCategory.PAYMENT]: '결제 관련',
  [SuspiciousWordCategory.CONTACT]: '연락처 유도',
  [SuspiciousWordCategory.CLAIM]: '과장 주장',
};

// ================================
// Interfaces
// ================================

export interface AdminDashboardStats {
  total_users: number;
  total_products: number;
  active_products: number;
  sold_products: number;
  new_users_today: number;
  new_products_today: number;
  today_sales: number;
  sales_chart: {
    date: string;
    sales: number;
    count: number;
  }[];
  user_registration_chart: {
    date: string;
    count: number;
  }[];
  category_stats: {
    name: string;
    value: number;
  }[];
  status_stats: {
    name: string;
    value: number;
  }[];
}

export interface BannedWord {
  id: string;
  word: string;
  category: BannedWordCategory;
  created_at: string;
  created_by?: string;
}

export interface SuspiciousWord {
  id: string;
  word: string;
  category: SuspiciousWordCategory;
  created_at: string;
  created_by?: string;
}

export interface ModerationCategories {
  bannedWordCategories: Record<string, string>;
  suspiciousWordCategories: Record<string, string>;
}

// ================================
// Query Params
// ================================

export interface AdminProductQueryParams {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  search?: string;
}

export interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  search?: string;
}

// ================================
// Request Types
// ================================

export interface UpdateUserStatusRequest {
  status: UserStatus;
  reason?: string;
}

export interface DeleteProductRequest {
  reason?: string;
}

export interface AddWordRequest {
  word: string;
  category: string;
}
