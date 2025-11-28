// User Types
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  rating: number;
  reviewCount: number;
  salesCount: number;
  purchaseCount: number;
  activeProductsCount: number;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface UserProfile extends User {
  stats: UserStats;
}

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  avatar_url?: string;
}

// Product Types
export enum ProductStatus {
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD',
  DELETED = 'DELETED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
}

export enum ProductCategory {
  DIGITAL = '디지털/가전',
  FASHION_CLOTHES = '패션의류',
  FASHION_ACCESSORIES = '패션잡화',
  BEAUTY = '뷰티/미용',
  SPORTS = '스포츠/레저',
  FOOD = '생활/가공식품',
  BOOKS = '도서',
  FURNITURE = '가구/인테리어',
  PET = '반려동물용품',
  ETC = '기타',
}

export interface ProductImage {
  id: string;
  url: string;
  key: string;
  order: number;
  is_primary: boolean;
  created_at: string;
}

export type ProductCondition = 'NEW' | 'LIKE_NEW' | 'USED' | 'WELL_USED' | 'FOR_PARTS';
export type TradeMethod = 'DIRECT' | 'DELIVERY' | 'BOTH';

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

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Product Request Types
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

// Pagination Types
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

// Product Query Types
export interface ProductQueryParams extends PaginationParams {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  seller_id?: string;
}

// Upload Types
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

// Admin Types
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
}

export interface AdminProductQueryParams extends PaginationParams {
  status?: ProductStatus;
  search?: string;
}

export interface AdminUserQueryParams extends PaginationParams {
  status?: UserStatus;
  search?: string;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
  reason?: string;
}

export interface DeleteProductRequest {
  reason?: string;
}

export interface UserDetail extends User {
  product_stats: {
    total_products: number;
    active_products: number;
    sold_products: number;
  };
  recent_products: Product[];
}

// Commission Types
export interface CommissionSettings {
  id: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateCommissionRateRequest {
  commission_rate: number;
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

// Price Offer Types
export enum PriceOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
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

export interface CreatePriceOfferRequest {
  offered_price: number;
  message?: string;
}

// Review Types
export enum ReviewType {
  BUYER_TO_SELLER = 'BUYER_TO_SELLER',
  SELLER_TO_BUYER = 'SELLER_TO_BUYER',
}

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

export interface CreateReviewRequest {
  transaction_id: string;
  rating: number;
  content?: string;
  review_type: ReviewType;
}

// Transaction with Details (for user's transaction history)
export interface TransactionWithDetails extends Transaction {
  seller: Pick<User, 'id' | 'nickname' | 'avatar_url'>;
  buyer: Pick<User, 'id' | 'nickname' | 'avatar_url'>;
  reviews: { id: string; review_type: string; reviewer_id: string }[];
  canWriteReview: boolean;
  myRole: 'seller' | 'buyer';
  reviewType: ReviewType;
}

// Moderation Types
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

export interface AddWordRequest {
  word: string;
  category: string;
}

export interface ModerationCategories {
  bannedWordCategories: Record<string, string>;
  suspiciousWordCategories: Record<string, string>;
}

// Notification Types
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

// Report Types
export type ReportReason = 'SPAM' | 'FRAUD' | 'INAPPROPRIATE' | 'PROHIBITED_ITEM' | 'FAKE' | 'OTHER';
export type ReportTargetType = 'USER' | 'PRODUCT';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

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

// Block Types
export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocked?: User;
  created_at: string;
}

// Follow Types
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  follower?: User;
  following?: User;
  created_at: string;
}

// Keyword Alert Types
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

// Recent View Types
export interface RecentView {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  viewed_at: string;
}

// Category Types
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
