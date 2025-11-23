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
- Next.js 14 (App Router)
- TypeScript 5.3
- Tailwind CSS 3.4
- Radix UI
- Zustand

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

## 핵심 기능 (채팅 제외)

- ✅ 회원가입/로그인 (JWT)
- ✅ 상품 CRUD (이미지 업로드)
- ✅ 상품 목록/검색 (Full-text Search)
- ✅ 상품 상세 (모달)
- ✅ 관리자 페이지 (상품/유저 관리, 통계)

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
