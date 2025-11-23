# 번개장터 클론 - Sparkmarket

P2P 중고거래 플랫폼 MVP

## 프로젝트 구조

```
sparkmarket/
├── frontend/          # Next.js 14 (App Router)
├── backend/           # NestJS + Prisma
└── docs/              # 프로젝트 문서
    ├── prd/           # Product Requirements Document
    ├── trd/           # Technical Requirements Document
    └── tasks/         # 개발 태스크 관리
```

## 기술 스택

### Frontend
- Next.js 14.2.0 (App Router)
- TypeScript 5
- Tailwind CSS 3.4 + Autoprefixer
- React Hook Form + Zod
- Zustand 5.0 (인증 상태 관리)
- Axios 1.13

### Backend
- NestJS 10
- Prisma ORM 5.7
- PostgreSQL 16
- JWT Authentication

### Infrastructure
- Frontend: Vercel
- Backend: Railway
- Database: Supabase / Railway
- Image Storage: Cloudflare R2

## 핵심 기능

### 구현 완료 ✅
- ✅ **인증 시스템**: JWT 기반 회원가입/로그인, 토큰 갱신
- ✅ **상품 관리**: 등록/수정/삭제, 이미지 업로드 (Cloudflare R2)
- ✅ **상품 목록**: 무한 스크롤, 3열 그리드 레이아웃
- ✅ **상품 검색**: 제목/설명 기반 검색, 카테고리/가격 필터
- ✅ **관리자 페이지**: 대시보드 통계, 상품/유저 관리, 차단 기능

### 다음 Phase (Phase 6)
- [ ] 검색바 UI
- [ ] 찜하기 / 관심상품
- [ ] 마이페이지 (내 상품 관리)
- [ ] 판매자 프로필 페이지
- [ ] 토스트 알림
- [ ] 로딩 스켈레톤

## 개발 시작

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (Podman)
- pnpm

### 설치

```bash
# Frontend
cd frontend
pnpm install

# Backend
cd backend
pnpm install
```

### 환경변수 설정

각 프로젝트의 `.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

### 실행

```bash
# Frontend (http://localhost:3000)
cd frontend
pnpm dev

# Backend (http://localhost:3001)
cd backend
pnpm start:dev
```

## 문서

- [PRD](./docs/prd/README.md) - 제품 요구사항 문서
- [TRD](./docs/trd/README.md) - 기술 요구사항 문서
- [Tasks](./docs/tasks/README.md) - 개발 태스크 관리

## 라이선스

MIT
