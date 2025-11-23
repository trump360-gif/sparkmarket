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
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// Product Types
export enum ProductStatus {
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD',
  DELETED = 'DELETED',
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
}

// Upload Types
export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  key: string;
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
