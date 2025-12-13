// ================================
// Enums
// ================================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

// ================================
// Interfaces
// ================================

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
  followersCount?: number;
  followingCount?: number;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface UserProfile extends User {
  stats: UserStats;
}

export interface UserDetail extends User {
  product_stats: {
    total_products: number;
    active_products: number;
    sold_products: number;
  };
  recent_products: any[]; // Import Product from product.ts if needed
}

// ================================
// Request Types
// ================================

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  avatar_url?: string;
}

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
