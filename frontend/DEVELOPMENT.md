# Frontend Development Guide

## 프로젝트 구조

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # 루트 레이아웃 (Navbar 포함)
│   ├── page.tsx               # 메인 페이지 (상품 목록)
│   ├── login/                 # 로그인
│   ├── register/              # 회원가입
│   ├── products/
│   │   ├── new/              # 상품 등록
│   │   └── [id]/
│   │       ├── page.tsx      # 상품 상세
│   │       └── edit/         # 상품 수정
│   └── admin/                # 관리자 페이지
│       ├── layout.tsx        # 관리자 레이아웃
│       ├── page.tsx          # 대시보드
│       ├── products/         # 상품 관리
│       └── users/            # 유저 관리
│
├── src/
│   ├── types/
│   │   └── index.ts          # 전체 타입 정의
│   │
│   ├── lib/
│   │   ├── axios.ts          # API 클라이언트 (JWT 인터셉터)
│   │   └── api/              # API 함수들
│   │       ├── auth.ts       # 인증 API
│   │       ├── products.ts   # 상품 API
│   │       ├── upload.ts     # 이미지 업로드 API
│   │       └── admin.ts      # 관리자 API
│   │
│   ├── store/
│   │   └── authStore.ts      # Zustand 인증 상태 관리
│   │
│   ├── hooks/
│   │   └── useAuth.ts        # 인증 훅
│   │
│   └── components/
│       ├── auth/             # 로그인/회원가입 폼
│       │   ├── LoginForm.tsx
│       │   └── RegisterForm.tsx
│       │
│       ├── product/          # 상품 관련 컴포넌트
│       │   ├── ProductCard.tsx
│       │   ├── ProductList.tsx
│       │   ├── ProductForm.tsx
│       │   └── ProductDetail.tsx
│       │
│       ├── admin/            # 관리자 컴포넌트
│       │   ├── AdminSidebar.tsx
│       │   ├── Dashboard.tsx
│       │   ├── AdminProductList.tsx
│       │   └── AdminUserList.tsx
│       │
│       └── ui/
│           └── Navbar.tsx    # 상단 네비게이션 바
│
├── next.config.mjs           # Next.js 설정 (이미지 최적화)
├── tsconfig.json             # TypeScript 설정 (@/* 경로 별칭)
└── tailwind.config.ts        # Tailwind CSS 설정
```

## 기술 스택

- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: Zustand 5.0.8
- **HTTP Client**: Axios 1.13.2
- **Form Validation**: React Hook Form 7.66.1 + Zod 4.1.12

## 주요 기능

### 1. 인증 시스템

#### 로그인/회원가입
- React Hook Form + Zod 스키마 검증
- JWT Access Token (1시간) + Refresh Token (7일)
- Zustand로 인증 상태 관리

#### 자동 토큰 갱신
```typescript
// src/lib/axios.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 자동으로 refresh token으로 새 access token 발급
      const { access_token } = await refresh(refreshToken);
      // 원래 요청 재시도
      return apiClient(originalRequest);
    }
  }
);
```

### 2. 상품 기능

#### 메인 페이지 (무한 스크롤)
- 20개씩 상품 로드
- 스크롤 이벤트로 자동 로드
- Server-side initial data fetching

#### 상품 등록
- 이미지 업로드 (최대 5개)
- Cloudflare R2 Presigned URL 방식
- 첫 번째 이미지가 대표 이미지

#### 상품 상세
- 이미지 갤러리 (썸네일 선택)
- 판매자 정보 표시
- 본인 상품만 수정/삭제 가능

### 3. 관리자 페이지

#### 권한 체크
```typescript
// app/admin/layout.tsx
useEffect(() => {
  if (!isAuthenticated) {
    alert('로그인이 필요합니다.');
    router.push('/login');
  } else if (!isAdmin) {
    alert('관리자 권한이 필요합니다.');
    router.push('/');
  }
}, [isAuthenticated, isAdmin, router]);
```

#### 대시보드
- 6가지 통계 카드 (총 유저, 상품, 판매완료 등)
- 실시간 데이터 fetch

#### 상품/유저 관리
- 검색, 필터, 페이지네이션
- 상품 삭제 (사유 입력)
- 유저 차단/활성화 (사유 입력)

## 환경 변수

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

## 주요 컴포넌트 설명

### Navbar
- 로그인 상태에 따라 메뉴 변경
- 관리자만 "관리자" 버튼 표시
- useAuth 훅으로 상태 관리

### ProductForm
- 등록/수정 모드 지원
- 이미지 미리보기 + 삭제
- 첫 번째 이미지에 "대표" 배지

### ProductList
- 무한 스크롤 구현
- 판매완료 상품 오버레이 표시
- Next.js Image 컴포넌트로 최적화

### AdminSidebar
- 현재 경로 하이라이트
- 대시보드, 상품 관리, 유저 관리 메뉴

## API 연동 예시

```typescript
// 상품 목록 조회
const response = await productsApi.getProducts({
  page: 1,
  limit: 20,
  category: '디지털/가전',
  search: '아이폰',
});

// 상품 등록
const product = await productsApi.createProduct({
  title: '아이폰 15',
  price: 1000000,
  category: '디지털/가전',
  description: '새 제품입니다',
  images: [
    { url: 'https://...', key: 'products/...', order: 0, is_primary: true },
  ],
});

// 관리자 대시보드 통계
const stats = await adminApi.getDashboardStats();
```

## 타입 정의

모든 타입은 `src/types/index.ts`에 정의되어 있습니다:

- `User`, `Product`, `ProductImage`
- `LoginRequest`, `RegisterRequest`, `AuthResponse`
- `ProductQueryParams`, `PaginatedResponse`
- `AdminDashboardStats`

## 배포

### Vercel 배포
1. Vercel 프로젝트 생성
2. GitHub 연동
3. 환경변수 설정 (`NEXT_PUBLIC_API_URL`)
4. 자동 배포

## 트러블슈팅

### 1. 이미지가 표시되지 않음
- `next.config.mjs`에서 `remotePatterns` 확인
- Cloudflare R2 URL이 허용되어 있는지 확인

### 2. 401 에러 반복
- Refresh Token 만료 시 자동 로그아웃
- localStorage의 토큰 확인

### 3. 무한 스크롤 작동 안함
- `window.innerHeight + scrollTop >= offsetHeight` 조건 확인
- `hasMore` 상태 확인
