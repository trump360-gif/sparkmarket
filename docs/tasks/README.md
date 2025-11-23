# 개발 태스크 관리

## Phase 1: 프로젝트 초기 세팅 (Week 1) ✅ 완료

- [x] GitHub 레포지토리 생성
- [x] 프로젝트 폴더 구조 생성
- [x] PRD/TRD 문서 작성
- [x] Next.js 14 프로젝트 생성
- [x] NestJS 프로젝트 생성
- [x] Prisma 설정 및 schema.prisma 작성
  - [x] User 모델 (role, status)
  - [x] Product 모델
  - [x] ProductImage 모델 (정규화)
  - [x] 채팅 관련 모델 제외
- [x] 환경변수 파일 템플릿 생성
- [x] PostgreSQL (Podman) 설정
  - [x] 컨테이너 생성 (포트 5433)
  - [x] sparkmarket 데이터베이스 생성
- [x] Prisma 마이그레이션 실행
- [x] 시드 데이터 생성 (관리자 + 테스트 유저)
- [x] GitHub 커밋 및 푸시

## Phase 2: 인증 시스템 (Week 1-2) ✅ Backend 완료

### Backend ✅
- [x] JWT 인증 모듈 구현 (NestJS)
- [x] 회원가입 API
- [x] 로그인 API
- [x] 토큰 갱신 API
- [x] AuthGuard 구현
- [x] AdminGuard 구현

### Frontend ✅
- [x] 회원가입 페이지 (Next.js)
- [x] 로그인 페이지 (Next.js)
- [x] 인증 상태 관리 (Zustand)

## Phase 3: 상품 CRUD (Week 2-3) ✅ Backend 완료

### Backend ✅
- [x] 상품 등록 API
- [x] 상품 목록 조회 API (페이지네이션)
- [x] 상품 상세 조회 API
- [x] 상품 수정 API
- [x] 상품 삭제 API
- [x] 이미지 Presigned URL 발급 API

### Frontend ✅
- [x] 상품 등록 페이지
  - [x] 폼 UI (제목, 가격, 카테고리, 설명)
  - [x] 이미지 업로드
  - [x] Presigned URL로 R2 업로드
- [x] 상품 목록 페이지
  - [x] 그리드 레이아웃 (3열)
  - [x] 무한 스크롤
- [x] 상품 상세 페이지
  - [x] Dynamic Routes 구현
  - [x] 이미지 표시
- [x] 상품 수정 페이지
- [ ] 내 상품 관리 페이지

## Phase 4: 검색 및 필터 (Week 3-4) ✅ Backend 완료

### Backend ✅ (Phase 3에 포함 완료)
- [x] PostgreSQL Full-text Search 설정 (ILIKE 사용)
- [x] 검색 API (제목 기반)
- [x] 필터링 API (카테고리, 가격 범위)

### Frontend
- [ ] 검색 바 UI
- [ ] 카테고리 필터
- [ ] 가격 범위 필터
- [ ] 검색 결과 페이지

## Phase 5: 관리자 페이지 (Week 4-5) ✅ Backend 완료

### Backend ✅
- [x] 대시보드 통계 API
- [x] 상품 관리 API (목록, 삭제)
- [x] 유저 관리 API (목록, 상태 변경)

### Frontend ✅
- [x] 관리자 로그인
- [x] 관리자 레이아웃 (사이드바)
- [x] 대시보드 페이지
  - [x] 통계 카드
  - [x] 요약 정보
- [x] 상품 관리 페이지
  - [x] 상품 테이블
  - [x] 검색/필터
  - [x] 삭제 기능
- [x] 유저 관리 페이지
  - [x] 유저 테이블
  - [x] 검색/필터
  - [x] 차단/해제 기능

## Phase 6: UI/UX 개선 (Week 5-6)

- [ ] 로딩 스켈레톤
- [ ] 에러 바운더리
- [ ] Toast 알림
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 반응형 디자인 (모바일)
- [ ] 다크 모드 (선택사항)

## Phase 7: 배포 및 테스트 (Week 6-7)

### 배포
- [ ] Vercel 배포 (Frontend)
- [ ] Railway 배포 (Backend)
- [ ] Supabase/Railway PostgreSQL 설정
- [ ] Cloudflare R2 설정
- [ ] 환경변수 설정
- [ ] 도메인 연결 (선택사항)

### 테스트
- [ ] 회원가입/로그인 테스트
- [ ] 상품 CRUD 테스트
- [ ] 이미지 업로드 테스트
- [ ] 검색/필터 테스트
- [ ] 관리자 기능 테스트
- [ ] 성능 테스트 (Lighthouse)

## Phase 8: 문서화 및 최종 점검 (Week 7)

- [ ] README 업데이트
- [ ] API 문서 작성 (Swagger)
- [ ] 배포 가이드 작성
- [ ] 코드 정리 및 주석
- [ ] 최종 버그 수정

---

## Phase 5.5: 프론트엔드 재구성 ✅ 완료

### Frontend 설정 재구성 ✅
- [x] autoprefixer 설치
- [x] postcss 설정 수정 (tailwindcss + autoprefixer)
- [x] Tailwind CSS 설정 완전 재작성
  - [x] content 경로 최적화 (./app, ./src)
  - [x] primary 컬러 팔레트 추가
  - [x] maxWidth 확장
- [x] globals.css Tailwind layers로 재작성
- [x] 레이아웃 중앙 정렬 수정
- [x] Navbar 디자인 개선 (파란색 그라데이션)
- [x] ProductList 3열 그리드 레이아웃

## Phase 5.6: 관리자 페이지 고도화 및 상품 상세 기능 추가 ✅ 완료

### Backend ✅
- [x] Product 모델에 view_count, chat_count 필드 추가
- [x] 상품 조회 시 view_count 자동 증가 (비동기 처리)
- [x] 대시보드 통계 API 확장
  - [x] today_sales (오늘 거래 금액)
  - [x] sales_chart (최근 7일 판매 추이)

### Frontend ✅
- [x] 관리자 대시보드 개선
  - [x] 오늘 거래 금액 하이라이트 카드
  - [x] 최근 7일 판매 추이 그래프
  - [x] 요약 섹션 업데이트
- [x] 상품 목록에 조회수/채팅 수 표시
  - [x] ProductCard에 👁️ 조회수, 💬 채팅 수 추가
- [x] 관리자 상품 목록 개선
  - [x] 무한 스크롤 구현
  - [x] 상품 클릭 시 관리자 상품 대시보드로 이동
- [x] 관리자 상품 대시보드 페이지 생성 (/admin/products/[id])
  - [x] 상품 상세 정보 표시
  - [x] 조회수, 채팅 문의 수 통계
  - [x] 판매자 정보
  - [x] 삭제 기능
- [x] 상품 상세 페이지 개선
  - [x] 구매하기 버튼 기능 추가 (로그인 체크 + 추후 업데이트 안내)
  - [x] 문의하기 버튼 추가 (로그인 체크 + 채팅 추후 업데이트 안내)

## Phase 5.7: 구매 기능 및 관리자 유저 대시보드 ✅ 완료

### Backend ✅
- [x] 상품 구매 API 추가 (PATCH /products/:id/purchase)
- [x] Cloudflare R2 이미지 업로드 연동
- [x] 관리자 유저 상세 API (GET /admin/users/:id)

### Frontend ✅
- [x] 구매하기 버튼 실제 작동
- [x] 대시보드 통계 카드 클릭 네비게이션
- [x] 관리자 유저 대시보드 페이지 생성 (/admin/users/[id])
  - [x] 유저 통계 카드
  - [x] 유저 정보 섹션
  - [x] 최근 등록 상품 목록
  - [x] 유저 상태 변경 기능
- [x] 관리자 유저 목록 클릭 가능

## 현재 진행 상황

**Phase**: 5.7 완료, Phase 6 준비
**진행률**: Phase 1-5.7 Backend 완료 (100%), Frontend 기본 구현 (90%)
**다음 작업**: Phase 6 - 검색/필터, 찜하기, 마이페이지, 토스트 등 추가 기능

### 최근 업데이트 (2025-11-23)
- ✅ Phase 1 완료: 프로젝트 초기 세팅
- ✅ 데이터베이스 설정 완료 (PostgreSQL + Prisma)
- ✅ Prisma 버전 5.22.0으로 다운그레이드 (호환성 문제 해결)
- ✅ 관리자 및 테스트 계정 시드 완료
- ✅ Phase 2 완료: JWT 인증 시스템
  - Backend: JWT 인증 모듈, 회원가입/로그인/토큰 갱신 API
  - Frontend: 로그인/회원가입 페이지, Zustand 인증 상태 관리
- ✅ Phase 3 완료: 상품 CRUD 및 이미지 업로드
  - Backend: Product 모듈, 이미지 Presigned URL API
  - Frontend: 상품 등록/목록/상세/수정 페이지, 무한 스크롤, 3열 그리드
- ✅ Phase 4 완료: 검색/필터 (Phase 3에 포함)
- ✅ Phase 5 완료: 관리자 페이지
  - Backend: Admin 모듈, 대시보드 통계/상품 관리/유저 관리 API
  - Frontend: 관리자 레이아웃, 대시보드, 상품/유저 관리 페이지
- ✅ Phase 5.5 완료: 프론트엔드 재구성
  - Tailwind CSS 설정 완전 재작성
  - autoprefixer 추가, postcss 설정 수정
  - globals.css 최적화
  - 레이아웃 중앙 정렬 및 디자인 개선
- ✅ Phase 5.6 완료: 관리자 페이지 고도화 및 상품 상세 기능 추가
  - Database: view_count, chat_count 필드 추가 (Prisma 마이그레이션)
  - Backend: 상품 조회 시 view_count 자동 증가, 오늘 거래금액/최근 7일 판매 통계 API
  - 관리자 대시보드: 오늘 거래 금액 카드, 최근 7일 판매 추이 그래프
  - 상품 목록: 조회수/채팅 수 표시 (👁️ 💬)
  - 관리자 상품 대시보드 페이지: /admin/products/[id] 라우트 생성
  - 상품 상세 페이지: 구매하기/문의하기 버튼 추가 (추후 업데이트 안내)
- ✅ Phase 5.7 완료: 구매 기능 및 관리자 유저 대시보드
  - Backend: 상품 구매 API, R2 이미지 업로드 연동, 관리자 유저 상세 API
  - Frontend: 구매 기능 작동, 대시보드 네비게이션, 관리자 유저 대시보드 페이지
- 🔄 다음: Phase 6 - 검색바, 찜하기, 마이페이지, 토스트 알림, 로딩 스켈레톤
