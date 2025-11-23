# TRD (Technical Requirements Document)

## 1. 기술 스택

### 1.1 Frontend

```json
{
  "framework": "next@14.2.0",
  "language": "typescript@5.3.0",
  "styling": "tailwindcss@3.4.0",
  "ui": "@radix-ui/react@1.0.0",
  "state": "zustand@4.4.0"
}
```

### 1.2 Backend

```json
{
  "framework": "nestjs@10.0.0",
  "orm": "prisma@5.7.0",
  "database": "postgresql@16.0",
  "auth": "jsonwebtoken@9.0.0",
  "validation": "class-validator@0.14.0"
}
```

### 1.3 Infrastructure

- **Frontend 배포**: Vercel
- **Backend 배포**: Railway
- **Database**: Supabase (무료) 또는 Railway
- **이미지 스토리지**: Cloudflare R2 (무료)

## 2. 시스템 아키텍처

```
┌─────────────────────┐
│   Next.js 14        │ (Frontend + Admin)
│   (Vercel)          │
│   /admin/...        │ ← 관리자 페이지
└──────────┬──────────┘
           │ HTTP/REST
┌──────────▼──────────┐
│      NestJS         │ (Backend API)
│    (Railway)        │
│   /api/admin/...    │ ← 관리자 API
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   PostgreSQL        │ (Supabase/Railway)
│   + Prisma ORM      │
└─────────────────────┘

┌─────────────────────┐
│  Cloudflare R2      │ (Image Storage)
└─────────────────────┘
```

## 3. 데이터베이스 스키마

상세 스키마는 `backend/prisma/schema.prisma` 참고

### 주요 테이블

- **users**: 사용자 정보 (role, status)
- **products**: 상품 정보
  - **view_count**: 조회수 (자동 증가)
  - **chat_count**: 채팅 문의 수
- **product_images**: 상품 이미지 (정규화)
- **commission_settings**: 수수료율 설정 (is_active로 이력 관리)
- **transactions**: 거래 내역 (수수료 자동 계산 및 기록)
- **favorites**: 찜하기 정보 (user_id + product_id 복합 유니크)
- **price_offers**: 가격 제안 내역
  - **buyer_id**: 제안한 구매자
  - **seller_id**: 판매자
  - **offered_price**: 제안 가격
  - **status**: PENDING/ACCEPTED/REJECTED/EXPIRED
  - **expires_at**: 72시간 자동 만료

## 4. API 명세

### 4.1 인증 API

#### 회원가입
```
POST /api/auth/register
Body: { email, password, nickname }
Response: { access_token, refresh_token, user }
```

#### 로그인
```
POST /api/auth/login
Body: { email, password }
Response: { access_token, refresh_token, user }
```

#### 토큰 갱신
```
POST /api/auth/refresh
Body: { refresh_token }
Response: { access_token }
```

### 4.2 상품 API

#### 상품 목록 조회
```
GET /api/products?page=1&limit=20&category=디지털/가전&search=아이폰&minPrice=0&maxPrice=1000000
Response: { products, total, page, totalPages }
```

#### 상품 상세 조회
```
GET /api/products/:id
Response: { product }
```

#### 상품 등록
```
POST /api/products
Headers: { Authorization: Bearer <token> }
Body: { title, description, price, category, images }
Response: { product }
```

#### 상품 수정
```
PATCH /api/products/:id
Headers: { Authorization: Bearer <token> }
Body: { title?, description?, price?, category?, images? }
Response: { product }
```

#### 상품 삭제
```
DELETE /api/products/:id
Headers: { Authorization: Bearer <token> }
Response: { success: true }
```

### 4.3 이미지 업로드 API

#### Presigned URL 발급
```
POST /api/upload/presigned-url
Headers: { Authorization: Bearer <token> }
Body: {
  filename: "image.jpg",
  contentType: "image/jpeg",
  size: 1024000
}
Response: {
  uploadUrl: "https://...",
  imageUrl: "https://...",
  key: "products/..."
}
```

### 4.4 관리자 API

#### 대시보드 통계
```
GET /api/admin/dashboard
Headers: { Authorization: Bearer <admin_token> }
Response: {
  total_users,
  total_products,
  active_products,
  sold_products,
  new_users_today,
  new_products_today,
  today_sales,
  sales_chart: [
    { date: "2025-11-23", sales: 1500000, count: 5 },
    ...
  ]
}
```

#### 상품 관리 - 목록
```
GET /api/admin/products?page=1&limit=20&status=FOR_SALE&search=아이폰
Headers: { Authorization: Bearer <admin_token> }
Response: { products, total, page, totalPages }
```

#### 상품 관리 - 삭제
```
DELETE /api/admin/products/:id
Headers: { Authorization: Bearer <admin_token> }
Body: { reason: "부적절한 상품" }
Response: { success: true }
```

#### 유저 관리 - 목록
```
GET /api/admin/users?page=1&limit=20&status=ACTIVE&search=김민수
Headers: { Authorization: Bearer <admin_token> }
Response: { users, total, page, totalPages }
```

#### 유저 관리 - 상태 변경
```
PATCH /api/admin/users/:id/status
Headers: { Authorization: Bearer <admin_token> }
Body: { status: "BANNED", reason: "악성 유저" }
Response: { success: true, user }
```

#### 수수료 관리 - 현재 수수료율 조회
```
GET /api/admin/commission/rate
Headers: { Authorization: Bearer <admin_token> }
Response: { id, commission_rate, is_active, created_at, updated_at }
```

#### 수수료 관리 - 수수료율 변경
```
PUT /api/admin/commission/rate
Headers: { Authorization: Bearer <admin_token> }
Body: { commission_rate: 5.0 }
Response: { id, commission_rate, is_active, created_at, updated_at }
```

#### 수수료 관리 - 통계 조회
```
GET /api/admin/commission/statistics
Headers: { Authorization: Bearer <admin_token> }
Response: {
  total: { transactions, totalSales, totalCommission, totalSellerAmount },
  monthly: { transactions, totalSales, totalCommission, totalSellerAmount },
  recentTransactions: [...]
}
```

#### 수수료 관리 - 거래 내역 조회
```
GET /api/admin/commission/transactions?page=1&limit=20
Headers: { Authorization: Bearer <admin_token> }
Response: { data: [...], meta: { total, page, limit, totalPages } }
```

### 4.5 찜하기 API (Phase 6.2)

#### 찜하기 추가/취소 (토글)
```
POST /api/favorites/toggle/:productId
Headers: { Authorization: Bearer <token> }
Response: { isFavorited: boolean }
```

#### 찜한 상품 목록
```
GET /api/favorites?page=1&limit=20
Headers: { Authorization: Bearer <token> }
Response: { data: [...], meta: { total, page, limit, totalPages } }
```

#### 상품 찜 여부 확인
```
GET /api/favorites/check/:productId
Headers: { Authorization: Bearer <token> }
Response: { isFavorited: boolean }
```

### 4.6 가격 제안 API (Phase 6.2)

#### 가격 제안 생성
```
POST /api/price-offers/products/:productId
Headers: { Authorization: Bearer <token> }
Body: { offered_price: number, message?: string }
Response: { offer }
Validation:
  - offered_price < product.price (제안 가격은 판매가보다 낮아야 함)
  - 본인 상품에는 제안 불가
  - 판매중(FOR_SALE) 상품만 가능
  - expires_at: 72시간 후 자동 설정
```

#### 받은 가격 제안 목록 (판매자)
```
GET /api/price-offers/received?page=1&limit=20
Headers: { Authorization: Bearer <token> }
Response: { data: [...], meta: { total, page, limit, totalPages } }
Include: buyer 정보, product 정보 (이미지 포함)
```

#### 보낸 가격 제안 목록 (구매자)
```
GET /api/price-offers/sent?page=1&limit=20
Headers: { Authorization: Bearer <token> }
Response: { data: [...], meta: { total, page, limit, totalPages } }
Include: seller 정보, product 정보 (이미지 포함)
```

#### 상품별 가격 제안 목록
```
GET /api/price-offers/products/:productId?page=1&limit=20
Headers: { Authorization: Bearer <token> }
Response: { data: [...], meta: { total, page, limit, totalPages } }
Note: 본인이 판매자인 상품만 조회 가능
```

#### 가격 제안 수락
```
PATCH /api/price-offers/:offerId/accept
Headers: { Authorization: Bearer <token> }
Response: { offer }
Effect:
  - offer.status → ACCEPTED
  - product.price → offer.offered_price (상품 가격 자동 변경)
Validation:
  - 본인이 판매자인 제안만 수락 가능
  - PENDING 상태만 수락 가능
  - 만료되지 않은 제안만 가능
```

#### 가격 제안 거절
```
PATCH /api/price-offers/:offerId/reject
Headers: { Authorization: Bearer <token> }
Response: { offer }
Effect: offer.status → REJECTED
Validation:
  - 본인이 판매자인 제안만 거절 가능
  - PENDING 상태만 거절 가능
```

## 5. 보안

### 5.1 인증/인가
- JWT 기반 인증
- Access Token: 1시간
- Refresh Token: 7일
- 관리자 권한: `AdminGuard`로 체크

### 5.2 CORS
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### 5.3 Rate Limiting
```typescript
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100, // 1분에 100번
}),
```

### 5.4 입력 검증
- `class-validator` 사용
- DTO 기반 검증
- 파일 업로드: 타입, 크기 검증 (5MB 제한)

### 5.5 XSS 방지
- 프론트엔드: `DOMPurify` 사용
- 백엔드: `class-validator`로 입력 검증

## 6. 이미지 처리

### 6.1 Presigned URL 방식
1. 클라이언트가 `/api/upload/presigned-url` 요청
2. 서버가 Cloudflare R2 Presigned URL 발급
3. 클라이언트가 직접 R2에 업로드
4. 업로드 완료 후 이미지 URL을 상품 데이터에 포함하여 저장

### 6.2 이미지 메타데이터
```typescript
{
  id: "img_001",
  url: "https://r2.cloudflare.com/.../image.webp",
  key: "products/prod_123/image.webp",
  width: 1200,
  height: 800,
  size: 245678,
  format: "webp",
  order: 0,
  is_primary: true
}
```

## 7. 성능 목표

- ✅ API 응답시간: P95 < 500ms
- ✅ 이미지 로딩: LCP < 3초
- ✅ 관리자 페이지 로딩: < 1초
- ✅ 동시 접속: 10명 이상 지원

## 8. 환경변수

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"

R2_ENDPOINT="https://<account>.r2.cloudflarestorage.com"
R2_ACCESS_KEY="..."
R2_SECRET_KEY="..."
R2_BUCKET_NAME="sparkmarket-images"
R2_PUBLIC_URL="https://..."
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 9. 배포

### 9.1 Frontend (Vercel)
- 자동 배포: `main` 브랜치 푸시 시
- 환경변수: Vercel 대시보드에서 설정

### 9.2 Backend (Railway)
- 자동 배포: `main` 브랜치 푸시 시
- 환경변수: Railway 대시보드에서 설정
- 데이터베이스: Railway PostgreSQL 또는 Supabase

### 9.3 Database Migration
```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## 10. 현재 구현 상태 (2025-11-23)

### ✅ 완료된 작업

#### Backend (Phase 1-5 완료)

##### 프로젝트 초기 세팅
- [x] GitHub 레포지토리 생성 및 초기 커밋
- [x] NestJS 11.0 프로젝트 생성
- [x] 프로젝트 문서 구조 (PRD/TRD/tasks)

##### 데이터베이스
- [x] PostgreSQL 16 컨테이너 (Podman, 포트 5433)
- [x] Prisma ORM 5.22.0 설정
- [x] 데이터베이스 스키마 작성
  - User 모델 (role: USER/ADMIN, status: ACTIVE/BANNED)
  - Product 모델
  - ProductImage 모델 (정규화)
- [x] 초기 마이그레이션 실행
- [x] 시드 데이터 생성
  - 관리자: admin@sparkmarket.com / admin123456
  - 테스트 유저: test@sparkmarket.com / user123456

##### 인증 시스템 (Phase 2)
- [x] JWT 인증 모듈 구현 (@nestjs/jwt, @nestjs/passport)
- [x] 회원가입/로그인/토큰갱신 API
- [x] AuthGuard, AdminGuard 구현
- [x] Access Token (1시간) + Refresh Token (7일)

##### 상품 API (Phase 3)
- [x] 상품 CRUD API (생성, 조회, 수정, 삭제)
- [x] 상품 목록 조회 (페이지네이션, 검색, 필터)
- [x] 이미지 업로드 (Cloudflare R2 Presigned URL)

##### 관리자 API (Phase 4-5)
- [x] 대시보드 통계 API (유저 수, 상품 수 등)
- [x] 관리자 상품 관리 API (목록, 삭제)
- [x] 관리자 유저 관리 API (목록, 상태 변경)

#### Frontend (Phase 6 완료)

##### 프로젝트 세팅
- [x] Next.js 14.2.0 프로젝트 생성 (App Router)
- [x] TypeScript 설정 (@/* 경로 별칭)
- [x] Tailwind CSS 설정
- [x] 필수 패키지 설치
  - axios (API 클라이언트)
  - zustand (상태 관리)
  - react-hook-form + zod (폼 검증)
  - sonner (Toast 알림)

##### 인증 시스템
- [x] 로그인/회원가입 페이지
- [x] Zustand 기반 인증 상태 관리
- [x] JWT 자동 갱신 (Axios Interceptor)
- [x] useAuth 훅

##### 상품 기능
- [x] 메인 페이지 (상품 목록 + 무한 스크롤)
- [x] 상품 등록 페이지 (이미지 업로드 최대 5개)
- [x] 상품 상세 페이지 (이미지 갤러리)
- [x] 상품 수정 페이지
- [x] 상품 삭제 기능

##### 관리자 페이지
- [x] 관리자 레이아웃 (사이드바 + 권한 체크)
- [x] 대시보드 (6가지 통계 카드)
- [x] 상품 관리 (검색, 필터, 삭제)
- [x] 유저 관리 (검색, 차단/활성화)

##### 사용자 기능 (Phase 6.2)
- [x] 찜하기 기능 (하트 아이콘 토글)
- [x] 찜 목록 페이지
- [x] 가격 제안 모달 (실시간 할인액 계산)
- [x] 가격 제안 관리 페이지 (보낸/받은 제안)
- [x] 마이페이지 (내 상품/찜 목록/가격 제안 요약)

##### 공통 컴포넌트
- [x] Navbar (로그인 상태별 메뉴, 찜/제안 링크, 마이페이지)
- [x] ProductCard, ProductList
- [x] ProductForm (등록/수정)
- [x] FavoriteButton (찜하기 토글)
- [x] PriceOfferModal (가격 제안 폼)
- [x] OfferCard (제안 카드 + 수락/거절)
- [x] Skeleton (로딩 UI)
- [x] ConfirmModal (확인 다이얼로그)
- [x] EmptyState (빈 상태 UI)
- [x] SearchFilters (검색 필터 패널)

### 📦 의존성

#### Backend
```json
{
  "prisma": "5.22.0",
  "@prisma/client": "5.22.0",
  "@nestjs/jwt": "11.0.1",
  "@nestjs/passport": "11.0.5",
  "passport-jwt": "4.0.1",
  "class-validator": "0.14.2",
  "class-transformer": "0.5.1"
}
```

#### Frontend
```json
{
  "next": "14.2.0",
  "axios": "1.13.2",
  "zustand": "5.0.8",
  "react-hook-form": "7.66.1",
  "zod": "4.1.12",
  "@hookform/resolvers": "5.2.2"
}
```

### 📝 주요 변경사항

#### Prisma 버전 다운그레이드
- **이유**: Prisma 7.0의 Breaking Changes로 인한 호환성 문제
- **변경**: 7.0.0 → 5.22.0
- **영향**:
  - `prisma.config.ts` 제거
  - `schema.prisma`에 `url = env("DATABASE_URL")` 복원
  - PrismaClient 초기화 방식 변경

#### 데이터베이스 연결
- **호스트**: localhost:5433
- **데이터베이스**: sparkmarket
- **유저**: postgres / postgres

### 📝 주요 변경사항 (Phase 5.6)

#### 상품 조회수/채팅 수 트래킹
- **Database**: Product 모델에 `view_count`, `chat_count` 필드 추가
- **Backend**: 상품 조회 시 view_count 자동 증가 (비동기 처리)
- **Frontend**: ProductCard에 조회수/채팅 수 표시 (👁️ 💬)

#### 관리자 대시보드 고도화
- **Backend**: `today_sales` (오늘 거래 금액), `sales_chart` (최근 7일 판매 통계) API 추가
- **Frontend**: 오늘 거래 금액 카드, 최근 7일 판매 추이 그래프

#### 관리자 상품 대시보드
- **Route**: `/admin/products/[id]` 동적 라우트 추가
- **Features**: 상품 상세 정보, 조회수/채팅 수 통계, 판매자 정보, 삭제 기능

#### 상품 상세 페이지 개선
- **구매하기 버튼**: 로그인 체크 + 추후 업데이트 안내
- **문의하기 버튼**: 로그인 체크 + 채팅 기능 추후 업데이트 안내

### 📝 주요 변경사항 (Phase 5.7)

#### 구매 기능
- **Backend**: PATCH `/products/:id/purchase` API 추가
- **로직**: 로그인 체크 → 본인 상품 체크 → 상태를 FOR_SALE → SOLD로 자동 변경 → Transaction 기록 생성
- **수수료 계산**: 현재 설정된 수수료율에 따라 수수료 금액과 판매자 수령액 자동 계산
- **Frontend**: ProductDetail 구매하기 버튼 실제 작동

#### Cloudflare R2 이미지 업로드 연동
- **Backend**: Community 프로젝트의 R2 설정 적용
- **환경변수**: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
- **상태**: ✅ 설정 완료, 이미지 업로드 기능 활성화

#### 관리자 유저 대시보드
- **Backend**: GET `/admin/users/:id` API 추가
  - 유저 기본 정보 + 상품 통계 (전체/판매중/판매완료)
  - 최근 등록 상품 5개 포함
- **Frontend**: AdminUserDashboard 컴포넌트 생성
  - 유저 통계 카드 (3개)
  - 유저 정보 섹션
  - 최근 등록 상품 목록
  - 유저 상태 변경 기능 (활성화/차단)
- **Route**: `/admin/users/[id]` 동적 라우트 추가

#### 관리자 대시보드 네비게이션
- 대시보드 통계 카드 클릭 시 관련 페이지로 이동
  - 전체 유저 → `/admin/users`
  - 전체 상품 → `/admin/products`
  - 판매중/판매완료 → 필터링된 상품 목록
- AdminUserList에서 유저 클릭 시 상세 페이지 이동

### 📝 주요 변경사항 (Phase 5.8)

#### 수수료 관리 시스템
- **Database**: CommissionSettings, Transaction 모델 추가
  - CommissionSettings: 수수료율 설정 및 변경 이력 관리 (is_active)
  - Transaction: 거래별 수수료 상세 기록 (product_price, commission_rate, commission_amount, seller_amount)
- **Backend**: Commission 모듈 구현
  - GET `/admin/commission/rate` - 현재 수수료율 조회
  - PUT `/admin/commission/rate` - 수수료율 변경
  - GET `/admin/commission/statistics` - 전체/월별 통계
  - GET `/admin/commission/transactions` - 거래 내역 페이지네이션
- **Frontend**: 관리자 수수료 관리 페이지
  - 수수료율 설정 폼
  - 전체/월별 통계 대시보드 (거래 수, 총 매출, 총 수수료, 판매자 수령액)
  - 최근 거래 내역 테이블
- **Migration**: 기존 판매 완료 상품 거래 내역 백필 (4건 처리 완료)

### 📝 주요 변경사항 (Phase 6.2)

#### 찜하기 기능 (Phase 6.2-A)
- **Database**: Favorite 모델 추가
  - user_id, product_id 복합 유니크 제약
  - 인덱스: user_id + created_at (DESC), product_id
- **Backend**: Favorites 모듈 구현
  - POST `/favorites/toggle/:productId` - 찜하기 추가/취소 토글
  - GET `/favorites/check/:productId` - 찜 여부 확인
  - GET `/favorites` - 찜한 상품 목록 (페이지네이션)
- **Frontend**:
  - FavoriteButton 컴포넌트 (하트 아이콘 + 애니메이션)
  - 찜 목록 페이지 (/favorites)
  - ProductDetail에 찜하기 버튼 통합

#### 가격 제안 기능 (Phase 6.2-B)
- **Database**: PriceOffer 모델 추가
  - buyer_id, seller_id, product_id, offered_price, message
  - status: PENDING/ACCEPTED/REJECTED/EXPIRED
  - expires_at: 72시간 자동 만료
  - 인덱스: product_id, buyer_id, seller_id + status
- **Backend**: PriceOffers 모듈 구현
  - POST `/price-offers/products/:productId` - 가격 제안 생성
  - GET `/price-offers/received` - 받은 제안 목록
  - GET `/price-offers/sent` - 보낸 제안 목록
  - GET `/price-offers/products/:productId` - 상품별 제안 목록
  - PATCH `/price-offers/:offerId/accept` - 제안 수락 (상품 가격 자동 변경)
  - PATCH `/price-offers/:offerId/reject` - 제안 거절
- **Frontend**:
  - PriceOfferModal 컴포넌트 (실시간 할인액 표시)
  - OfferCard 컴포넌트 (수락/거절 버튼)
  - 가격 제안 관리 페이지 (/offers)
  - Navbar에 "💰 가격 제안" 링크 추가

#### 마이페이지 (Phase 6.2-C)
- **Frontend**: /mypage 구현
  - 프로필 헤더 (그라데이션 아바타)
  - 3개 탭: 내 상품, 찜 목록, 가격 제안
  - 내 상품: seller_id 필터링
  - 찜 목록: Favorites API 연동
  - 가격 제안: 보낸/받은 제안 요약 + 상세 페이지 링크
  - 빈 상태 UI (Empty State) + CTA 버튼
- **Navbar**: 프로필 영역 클릭 시 마이페이지 이동

### 📝 주요 변경사항 (Phase 6.3)

#### 검색 개선
- **Navbar.tsx 업데이트**:
  - `useSearchParams` 훅으로 URL 쿼리 파라미터 읽기
  - `searchQuery` 상태를 URL과 동기화 (useEffect)
  - 중앙 검색바 추가 (flex-1 max-w-xl)
  - X 버튼으로 검색어 클리어 기능
  - 모바일 반응형 (md:block/hidden)

- **SearchFilters.tsx 생성**:
  - 카테고리 필터: 6개 카테고리 셀렉트박스
  - 가격 범위: minPrice, maxPrice 입력 (숫자 타입)
  - 상태 필터: 전체/판매중/판매완료 셀렉트박스
  - 접을 수 있는 패널 (showFilters 토글)
  - 활성 필터 배지 표시
  - 초기화/적용 버튼
  - URL 쿼리 파라미터로 필터 적용

- **page.tsx 업데이트**:
  - `useSearchParams` 훅으로 쿼리 읽기
  - `search`, `category`, `minPrice`, `maxPrice`, `status` 파라미터 추출
  - API 호출 시 필터 파라미터 전달
  - 동적 타이틀: 검색어 있으면 "검색 결과" 표시
  - 필터 적용 여부 표시

### 📝 주요 변경사항 (Phase 6.4)

#### 추가 개선사항

**1. ConfirmModal.tsx 생성**:
- 재사용 가능한 확인 다이얼로그 컴포넌트
- Props:
  - `isOpen`, `onClose`, `onConfirm` (필수)
  - `title`, `message` (필수)
  - `confirmText`, `cancelText` (선택, 기본값: "확인", "취소")
  - `confirmButtonClass` (선택, 기본값: 빨간색 스타일)
- Features:
  - Fixed 오버레이 + 중앙 모달 (z-50)
  - 백드롭 클릭 시 닫기
  - Body 스크롤 방지 (useEffect로 overflow 제어)
  - 경고 아이콘 (빨간 원 배경)
  - 반응형 버튼 레이아웃 (모바일: 세로, 데스크톱: 가로)
- 사용처: 상품 삭제, 구매 확인, 제안 거절 등

**2. EmptyState.tsx 생성**:
- 재사용 가능한 빈 상태 UI 컴포넌트
- Props:
  - `icon` (선택, ReactNode)
  - `title` (필수)
  - `description` (선택)
  - `action` (선택, {label, onClick})
- EmptyIcons 프리셋 5종:
  - `Box`: 일반 빈 목록 (상품 없음)
  - `Heart`: 찜 목록 비어있음
  - `Currency`: 가격 제안 없음
  - `Search`: 검색 결과 없음
  - `Inbox`: 메시지/알림 없음
- 사용처: 찜 목록, 가격 제안, 내 상품, 검색 결과 등

**3. Navbar.tsx 모바일 반응형**:
- 햄버거 메뉴 버튼 (`sm:hidden` 표시)
- `isMobileMenuOpen` 상태로 메뉴 토글
- 아이콘 전환: 햄버거(☰) ↔ X 아이콘
- 모바일 드롭다운 메뉴:
  - 모바일 검색바 포함
  - 모든 네비게이션 링크 (홈, 찜 목록, 가격 제안)
  - 마이페이지, 판매하기, 관리자(조건부)
  - 로그아웃 버튼
- 링크 클릭 시 자동으로 메뉴 닫기
- Desktop 버튼들은 `hidden sm:block`으로 숨김

### 🎯 다음 단계

- [ ] Cloudflare R2 설정 (이미지 업로드 테스트)
- [ ] 프론트엔드-백엔드 통합 테스트
- [ ] 배포 준비 (Vercel + Railway)
- [ ] Phase 2 기능 (채팅, 소셜 로그인 등)

### 🔗 관련 링크

- GitHub: https://github.com/trump360-gif/sparkmarket
- 로컬 백엔드: http://localhost:3001
- 로컬 프론트엔드: http://localhost:3000
