import { User } from './user';

// ================================
// Enums
// ================================

export enum ProductStatus {
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD',
  DELETED = 'DELETED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  BEAUTY = 'BEAUTY',
  SPORTS = 'SPORTS',
  HOME = 'HOME',
  BOOKS = 'BOOKS',
  OTHER = 'OTHER',
}

// ================================
// Types
// ================================

export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'USED' | 'WELL_USED' | 'FOR_PARTS';
export type TradeMethod = 'DIRECT' | 'DELIVERY' | 'BOTH';
export type SortOption = 'latest' | 'price_asc' | 'price_desc' | 'popular';

// ================================
// Constants
// ================================

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.ELECTRONICS]: '디지털/가전',
  [ProductCategory.FASHION]: '패션의류',
  [ProductCategory.BEAUTY]: '뷰티/미용',
  [ProductCategory.SPORTS]: '스포츠/레저',
  [ProductCategory.HOME]: '가구/인테리어',
  [ProductCategory.BOOKS]: '도서',
  [ProductCategory.OTHER]: '기타',
};

export const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: '새상품',
  LIKE_NEW: '거의 새것',
  USED: '사용감 있음',
  WELL_USED: '사용감 많음',
  FOR_PARTS: '부품용',
};

export const TRADE_METHOD_LABELS: Record<TradeMethod, string> = {
  DIRECT: '직거래',
  DELIVERY: '택배',
  BOTH: '직거래/택배',
};

export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  latest: '최신순',
  price_asc: '가격 낮은순',
  price_desc: '가격 높은순',
  popular: '인기순',
};

// ================================
// Interfaces
// ================================

export interface ProductImage {
  id: string;
  url: string;
  key: string;
  order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Hashtag {
  id: string;
  name: string;
  use_count: number;
}

export interface Brand {
  id: string;
  name: string;
  name_ko?: string;
  logo_url?: string;
  description?: string;
  category?: string;
  is_popular: boolean;
  _count?: { products: number };
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  seller_id: string;
  seller?: User;
  images: ProductImage[];
  view_count: number;
  chat_count: number;
  review_reason?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  condition?: ProductCondition;
  trade_method?: TradeMethod;
  trade_location?: string;
  brand_id?: string;
  brand?: Brand;
  original_price?: number;
  favorite_count?: number;
  hashtags?: { hashtag: Hashtag }[];
  created_at: string;
  updated_at: string;
}

// ================================
// Request Types
// ================================

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition?: ProductCondition;
  trade_method?: TradeMethod;
  trade_location?: string;
  brand_id?: string;
  hashtags?: string[];
  images: {
    url: string;
    key: string;
    order: number;
    is_primary: boolean;
  }[];
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  status?: ProductStatus;
  images?: {
    url: string;
    key: string;
    order: number;
    is_primary: boolean;
  }[];
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  condition?: ProductCondition;
  trade_method?: TradeMethod;
  seller_id?: string;
  hashtag?: string;
  sort?: SortOption;
  exclude?: string;
}
