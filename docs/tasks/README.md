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

### Frontend (대기)
- [ ] 회원가입 페이지 (Next.js)
- [ ] 로그인 페이지 (Next.js)
- [ ] 인증 상태 관리 (Zustand)

## Phase 3: 상품 CRUD (Week 2-3) ✅ Backend 완료

### Backend ✅
- [x] 상품 등록 API
- [x] 상품 목록 조회 API (페이지네이션)
- [x] 상품 상세 조회 API
- [x] 상품 수정 API
- [x] 상품 삭제 API
- [x] 이미지 Presigned URL 발급 API

### Frontend
- [ ] 상품 등록 페이지
  - [ ] 폼 UI (제목, 가격, 카테고리, 설명)
  - [ ] 이미지 업로드 (드래그앤드롭)
  - [ ] Presigned URL로 R2 업로드
- [ ] 상품 목록 페이지
  - [ ] 그리드 레이아웃
  - [ ] 무한 스크롤
- [ ] 상품 상세 모달
  - [ ] Parallel Routes 구현
  - [ ] 이미지 슬라이더
- [ ] 상품 수정 페이지
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

### Frontend
- [ ] 관리자 로그인
- [ ] 관리자 레이아웃 (사이드바)
- [ ] 대시보드 페이지
  - [ ] 통계 카드
  - [ ] 최근 상품 테이블
- [ ] 상품 관리 페이지
  - [ ] 상품 테이블
  - [ ] 검색/필터
  - [ ] 삭제 기능
- [ ] 유저 관리 페이지
  - [ ] 유저 테이블
  - [ ] 검색/필터
  - [ ] 차단/해제 기능

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

## 현재 진행 상황

**Phase**: 6 - 프론트엔드 개발 시작 준비
**진행률**: Phase 1-5 Backend 완료 (100%), Frontend (0%)
**다음 작업**: Next.js 프론트엔드 개발 시작

### 최근 업데이트 (2025-11-23)
- ✅ Phase 1 완료: 프로젝트 초기 세팅
- ✅ 데이터베이스 설정 완료 (PostgreSQL + Prisma)
- ✅ Prisma 버전 5.22.0으로 다운그레이드 (호환성 문제 해결)
- ✅ 관리자 및 테스트 계정 시드 완료
- ✅ Phase 2 Backend 완료: JWT 인증 시스템 구현
  - JWT 인증 모듈 (Passport Strategy)
  - 회원가입/로그인/토큰 갱신 API
  - AuthGuard 및 AdminGuard
  - ValidationPipe, CORS, API prefix 설정
  - API 테스트 완료
- ✅ Phase 3 Backend 완료: 상품 CRUD 및 이미지 업로드
  - Product 모듈 (service, controller, DTOs)
  - 상품 등록/조회/수정/삭제 API
  - 페이지네이션 및 필터링 (카테고리, 상태, 검색)
  - Images 모듈 (Cloudflare R2 Presigned URL)
  - ProductImage 추가/삭제 API
  - API 테스트 완료
- ✅ Phase 4 Backend 완료: 검색/필터 (Phase 3에 포함)
- ✅ Phase 5 Backend 완료: 관리자 페이지 API
  - Admin 모듈 (service, controller, DTOs)
  - 대시보드 통계 API (유저/상품/거래 통계)
  - 상품 관리 API (목록, 검색, 삭제)
  - 유저 관리 API (목록, 검색, 상태 변경)
  - API 테스트 완료
- 🔄 다음: 프론트엔드 개발 (Phase 2-5 Frontend)
