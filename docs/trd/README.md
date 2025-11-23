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
- **product_images**: 상품 이미지 (정규화)

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
  stats: {
    total_users,
    total_products,
    active_products,
    sold_products,
    new_users_today,
    new_products_today
  }
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

#### 프로젝트 초기 세팅
- [x] GitHub 레포지토리 생성 및 초기 커밋
- [x] Next.js 14.2.0 프로젝트 생성 (App Router)
- [x] NestJS 11.0 프로젝트 생성
- [x] 프로젝트 문서 구조 (PRD/TRD/tasks)

#### 데이터베이스
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

#### 의존성
```json
{
  "prisma": "5.22.0",
  "@prisma/client": "5.22.0",
  "bcrypt": "6.0.0",
  "dotenv": "17.2.3",
  "tsx": "4.20.6"
}
```

### 🔄 진행 중

#### Phase 2: 인증 시스템 (예정)
- [ ] @nestjs/jwt, @nestjs/passport 설치
- [ ] JWT 인증 모듈 구현
- [ ] 회원가입/로그인/토큰갱신 API
- [ ] AuthGuard, AdminGuard 구현

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

### 🔗 관련 링크

- GitHub: https://github.com/trump360-gif/sparkmarket
- 로컬 백엔드: http://localhost:3001 (예정)
- 로컬 프론트엔드: http://localhost:3000 (예정)
