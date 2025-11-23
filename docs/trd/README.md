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

##### 공통 컴포넌트
- [x] Navbar (로그인 상태별 메뉴)
- [x] ProductCard, ProductList
- [x] ProductForm (등록/수정)

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

### 🎯 다음 단계

- [ ] Cloudflare R2 설정 (이미지 업로드 테스트)
- [ ] 프론트엔드-백엔드 통합 테스트
- [ ] 배포 준비 (Vercel + Railway)
- [ ] Phase 2 기능 (채팅, 소셜 로그인 등)

### 🔗 관련 링크

- GitHub: https://github.com/trump360-gif/sparkmarket
- 로컬 백엔드: http://localhost:3001
- 로컬 프론트엔드: http://localhost:3000
