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

## Phase 6: UI/UX 개선 및 추가 기능 (Week 5-6)

### Phase 6.1: UI/UX 기본 개선 ✅ 완료
- [x] Toast 알림 시스템 (sonner 라이브러리)
- [x] 로딩 스켈레톤 (주요 페이지)
- [x] Next.js Image 최적화
- [ ] 에러 바운더리

### Phase 6.2: 핵심 거래 기능
- [x] 6.2-A: 찜하기 (좋아요) 기능 ✅ 완료
  - [x] Backend: Favorite 모델 및 API
  - [x] Frontend: 하트 버튼, 찜 목록 페이지
- [x] 6.2-B: 가격 제안 (네고) 기능 ✅ 완료
  - [x] Backend: PriceOffer 모델 및 API (72시간 만료)
  - [x] Frontend: 가격 제안 모달, 제안 관리 페이지
  - [x] 제안 수락 시 상품 가격 자동 변경
  - [x] 보낸/받은 제안 탭 구현
- [x] 6.2-C: 마이페이지 ✅ 완료
  - [x] 프로필 헤더 (아바타 + 닉네임 + 이메일)
  - [x] 탭 UI (내 상품 / 찜 목록 / 가격 제안)
  - [x] 내가 등록한 상품 목록
  - [x] 찜한 상품 목록
  - [x] 가격 제안 요약 (보낸/받은 제안 수)
  - [x] Navbar 프로필 클릭 시 마이페이지 이동

### Phase 6.3: 검색 개선 ✅ 완료
- [x] 검색바 UI 개선 (Navbar 통합)
  - [x] Navbar 중앙에 검색바 추가
  - [x] 검색어 입력 및 초기화 기능
  - [x] URL 쿼리 파라미터 기반 검색
- [x] 검색 필터 강화
  - [x] SearchFilters 컴포넌트 생성
  - [x] 카테고리 필터 (6개 카테고리)
  - [x] 가격 범위 필터 (최소/최대)
  - [x] 상태 필터 (전체/판매중/판매완료)
  - [x] 필터 적용/초기화 기능
  - [x] 메인 페이지에 필터 통합

### Phase 6.4: 추가 개선 ✅ 완료
- [x] 확인 모달 컴포넌트
  - [x] ConfirmModal 컴포넌트 생성
  - [x] 커스터마이징 가능한 제목/메시지/버튼
  - [x] Backdrop 클릭 닫기 지원
- [x] 빈 상태 UI (Empty State)
  - [x] EmptyState 컴포넌트 생성
  - [x] 아이콘 프리셋 제공 (Box, Heart, Currency, Search, Inbox)
  - [x] 액션 버튼 지원
- [x] 반응형 디자인 (모바일 최적화)
  - [x] Navbar 모바일 메뉴 추가
  - [x] 모바일 검색바 구현
  - [x] 햄버거 메뉴 토글
  - [x] Grid 레이아웃 자동 반응형 (기존 완료)

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

## Phase 5.8: 수수료 관리 시스템 ✅ 완료

### Backend ✅
- [x] CommissionSettings 모델 추가 (수수료율 설정)
- [x] Transaction 모델 추가 (거래 내역 기록)
- [x] Commission 모듈 생성
  - [x] 현재 수수료율 조회 API
  - [x] 수수료율 업데이트 API
  - [x] 수수료 통계 API (전체/월별)
  - [x] 거래 내역 조회 API (페이지네이션)
- [x] 구매 API에 수수료 계산 로직 통합
- [x] 판매 완료 상품 거래 내역 마이그레이션 스크립트

### Frontend ✅
- [x] 수수료 관리 타입 정의
- [x] 수수료 API 클라이언트
- [x] 관리자 수수료 관리 페이지 (/admin/commission)
  - [x] 수수료율 설정 폼
  - [x] 전체/월별 통계 대시보드
  - [x] 최근 거래 내역 테이블
- [x] 관리자 사이드바에 수수료 관리 메뉴 추가

### Phase 6.5: UI/UX 세부 개선 ✅ 완료

- [x] Navbar 및 레이아웃 개선
  - [x] 헤더 포지셔닝을 sticky에서 fixed로 변경 (스크롤 튕김 방지)
  - [x] 모든 페이지에 pt-16 추가 (fixed 헤더 여백 확보)
  - [x] Navbar에서 중복 "홈" 링크 제거 (로고로 통일)
  - [x] Navbar에서 "판매하기" 버튼 제거
- [x] 메인 페이지 레이아웃 개선
  - [x] "판매하기" 버튼을 메인 페이지로 이동
  - [x] "전체 상품" 제목과 "판매하기" 버튼을 같은 줄에 정렬
- [x] 상품 상세 페이지 개선
  - [x] "목록으로 돌아가기" 버튼을 페이지 레벨로 이동 (헤더와 콘텐츠 사이)
  - [x] 찜하기 버튼을 상품명 오른쪽으로 이동
  - [x] 구매하기/가격제안/문의하기 버튼 크기 통일 (py-2.5)
- [x] 가격 제안 모달 UX 개선
  - [x] 빠른 조정 버튼 추가 (-1,000원, -10,000원, -100,000원)
  - [x] 원가 기준 금액 자동 계산
- [x] 관리자 페이지 레이아웃 개선
  - [x] 사이드바 포지셔닝을 sticky에서 fixed로 변경
  - [x] 사이드바 높이 조정 (h-screen → h-[calc(100vh-4rem)])
  - [x] 사이드바 top 위치를 헤더 아래로 조정 (top-16)
  - [x] 관리자 메인 콘텐츠에 ml-60, pt-16 추가
  - [x] 사이드바 간격 최적화 (스크롤 제거)

### Phase 6.6: 가격 제안 시스템 개선 및 알림 기능 ✅ 완료

- [x] 마이페이지 가격 제안 개선
  - [x] 가격 제안 탭에서 인라인 제안 목록 표시 (리다이렉트 제거)
  - [x] 받은 제안/보낸 제안 서브탭 추가
  - [x] 페이지 로드 시 제안 개수 즉시 표시
  - [x] OfferCard 컴포넌트 재사용
- [x] 알림 시스템
  - [x] Navbar에 새 가격 제안 알림 배지 추가
  - [x] 30초마다 자동으로 새 제안 확인 (폴링)
  - [x] 받은 제안이 있을 때 빨간 점 표시
- [x] 인증 상태 개선
  - [x] useAuth에 isLoading 상태 추가
  - [x] Zustand persist hydration 대기 로직
  - [x] 마이페이지 새로고침 시 로그아웃 방지
  - [x] authStore logout 함수에 localStorage 정리 추가
- [x] 가격 제안 수락 로직 변경
  - [x] Backend: 제안 수락 시 상품 가격 변경 로직 제거
  - [x] Backend: 제안 수락 시 다른 대기중인 제안 자동 거절
  - [x] Frontend: 제안 수락 토스트 메시지 변경
  - [x] Frontend: 상품 상세 페이지에서 수락된 제안 확인
  - [x] Frontend: 수락된 제안이 있을 때 특별 가격 UI 표시
  - [x] 제안한 사용자만 특별 가격으로 구매 가능

## 현재 진행 상황

**Phase**: Phase 6.6 완료, Phase 7 준비
**진행률**: Phase 1-6.6 완료 (100%)
**완료**: 전체 Phase 6 완료 (UI/UX 개선 + 핵심 거래 기능 + 검색 + 추가 개선사항 + 세부 UI/UX 개선 + 가격 제안 시스템 개선)
**다음 작업**: Phase 7 - 배포 및 테스트

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
- ✅ Phase 5.8 완료: 수수료 관리 시스템
  - Database: CommissionSettings, Transaction 모델 추가
  - Backend: Commission 모듈, 수수료율 설정/통계 API, 구매 시 수수료 자동 계산
  - Frontend: 관리자 수수료 관리 페이지, 통계 대시보드, 거래 내역 목록
  - Migration: 기존 판매 완료 상품 거래 내역 백필 스크립트 실행 완료
- ✅ Phase 6.1 완료: UI/UX 기본 개선
  - Toast 알림 시스템 (Sonner 라이브러리)
  - 로딩 스켈레톤 (Skeleton 컴포넌트)
  - Next.js Image 최적화
- ✅ Phase 6.2-A 완료: 찜하기 기능
  - Database: Favorite 모델 추가
  - Backend: 찜하기 토글/확인/목록 API
  - Frontend: FavoriteButton 컴포넌트, 찜 목록 페이지 (/favorites)
  - ProductCard/ProductDetail에 찜 버튼 통합
- ✅ Phase 6.2-B 완료: 가격 제안 (네고) 기능
  - Database: PriceOffer 모델 (PENDING/ACCEPTED/REJECTED/EXPIRED)
  - Backend: 가격 제안 생성/수락/거절 API, 72시간 만료 시스템
  - Frontend: PriceOfferModal, OfferCard 컴포넌트
  - 제안 관리 페이지 (/offers) - 보낸/받은 제안 탭
  - 제안 수락 시 상품 가격 자동 변경 로직
- ✅ Phase 6.2-C 완료: 마이페이지
  - Frontend: /mypage 페이지 생성
  - 프로필 헤더 (그라데이션 아바타 + 사용자 정보)
  - 3개 탭: 내 상품 / 찜 목록 / 가격 제안 요약
  - 내 상품 목록 (seller_id 필터링)
  - 찜 목록 (favorites API 연동)
  - 가격 제안 요약 카드 (보낸/받은 제안 수)
  - Navbar 프로필 영역을 마이페이지 링크로 변경
- ✅ Phase 6.3 완료: 검색 개선
  - Frontend: Navbar에 검색바 추가 (중앙 배치)
  - 검색어 입력 및 X 버튼으로 초기화
  - SearchFilters 컴포넌트 (접기/펼치기 가능)
  - 카테고리, 가격 범위, 상태 필터
  - URL 쿼리 파라미터 기반 검색/필터
  - 메인 페이지에서 검색 결과 표시
- ✅ Phase 6.4 완료: 추가 개선사항
  - Frontend: ConfirmModal 컴포넌트 (재사용 가능한 확인 모달)
  - Frontend: EmptyState 컴포넌트 (일관된 빈 상태 UI)
  - Frontend: Navbar 모바일 메뉴 (햄버거 메뉴 + 모바일 검색바)
  - 반응형 디자인 완성
- ✅ Phase 6.5 완료: UI/UX 세부 개선
  - Navbar: sticky → fixed 포지셔닝 (스크롤 튕김 방지), 중복 링크 제거
  - 메인 페이지: 판매하기 버튼 이동 및 정렬
  - 상품 상세: 버튼 위치 조정, 찜하기 버튼 상품명 옆 이동, 버튼 크기 통일
  - 가격 제안 모달: 빠른 조정 버튼 추가 (-1,000/-10,000/-100,000원)
  - 관리자 페이지: 사이드바 fixed 포지셔닝, 레이아웃 여백 조정
- ✅ Phase 6.6 완료: 가격 제안 시스템 개선 및 알림 기능
  - 마이페이지: 가격 제안 인라인 표시, 받은/보낸 제안 서브탭
  - 알림: Navbar 새 제안 알림 배지, 30초 폴링
  - 인증: isLoading 상태 추가, hydration 대기, 새로고침 로그아웃 방지
  - 가격 제안: 수락 시 상품 가격 유지, 제안자에게만 특별 가격 부여
