# 스파크마켓 TRD (Technical Requirements Document)

## 1. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│                     Next.js 14 (React 18)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (NestJS 11)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Auth   │ │Products │ │ Users   │ │ Follows │ │ Reports │   │
│  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Favorites│ │ Price   │ │ Reviews │ │Keyword  │ │ Recent  │   │
│  │ Module  │ │ Offers  │ │ Module  │ │ Alerts  │ │ Views   │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Brands  │ │Hashtags │ │Category │ │ Blocks  │ │  Admin  │   │
│  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AWS S3 (Images)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 데이터베이스 스키마

### 2.1 핵심 테이블

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| email | String | Unique, 이메일 |
| password_hash | String | 비밀번호 해시 |
| nickname | String | Unique, 닉네임 |
| avatar_url | String? | 프로필 이미지 |
| bio | String(200)? | 자기소개 |
| role | String | USER / ADMIN |
| status | String | ACTIVE / BANNED |
| response_time | Int? | 평균 응답 시간 (분) |
| last_active_at | DateTime? | 마지막 활동 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

#### products
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| seller_id | String | FK → users |
| title | String(100) | 상품명 |
| description | Text | 상품 설명 |
| price | Int | 가격 |
| original_price | Int? | 원래 가격 (가격 인하 시) |
| category | String | 카테고리 |
| status | String | FOR_SALE / SOLD / DELETED / PENDING_REVIEW / REJECTED |
| condition | String | NEW / LIKE_NEW / USED / WELL_USED / FOR_PARTS |
| trade_method | String | DIRECT / DELIVERY / BOTH |
| trade_location | String(100)? | 직거래 희망 지역 |
| brand_id | String? | FK → brands |
| view_count | Int | 조회수 |
| chat_count | Int | 채팅수 |
| favorite_count | Int | 찜수 |
| review_reason | Text? | 검토 대기 사유 |
| reviewed_at | DateTime? | 검토 완료 시간 |
| reviewed_by | String? | 검토 관리자 ID |
| rejection_reason | Text? | 거절 사유 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

#### follows
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| follower_id | String | FK → users (팔로우하는 사람) |
| following_id | String | FK → users (팔로우받는 사람) |
| created_at | DateTime | 생성일 |

#### blocks
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| blocker_id | String | FK → users (차단하는 사람) |
| blocked_id | String | FK → users (차단당하는 사람) |
| created_at | DateTime | 생성일 |

#### reports
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| reporter_id | String | FK → users |
| target_type | String | USER / PRODUCT |
| target_id | String | 신고 대상 ID |
| reason | String | SPAM / FRAUD / INAPPROPRIATE / PROHIBITED_ITEM / FAKE / OTHER |
| description | Text? | 상세 설명 |
| status | String | PENDING / REVIEWED / RESOLVED / DISMISSED |
| admin_note | Text? | 관리자 메모 |
| reviewed_by | String? | 처리 관리자 |
| reviewed_at | DateTime? | 처리 시간 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

#### keyword_alerts
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| user_id | String | FK → users |
| keyword | String(50) | 키워드 |
| category | String? | 카테고리 필터 |
| min_price | Int? | 최소 가격 |
| max_price | Int? | 최대 가격 |
| is_active | Boolean | 활성화 여부 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

#### recent_views
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| user_id | String | FK → users |
| product_id | String | FK → products |
| viewed_at | DateTime | 조회 시간 |

#### brands
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| name | String | Unique, 브랜드명 |
| name_ko | String? | 한글명 |
| logo_url | String? | 로고 |
| description | Text? | 설명 |
| category | String? | 브랜드 카테고리 |
| is_popular | Boolean | 인기 브랜드 여부 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

#### categories
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| name | String | Unique, 카테고리명 |
| name_ko | String | 한글명 |
| slug | String | Unique, URL 슬러그 |
| icon | String? | 아이콘 |
| description | String? | 설명 |
| parent_id | String? | FK → categories (부모 카테고리) |
| sort_order | Int | 정렬 순서 |
| is_active | Boolean | 활성화 여부 |
| created_at | DateTime | 생성일 |
| updated_at | DateTime | 수정일 |

#### hashtags
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| name | String | Unique, 해시태그 (# 제외) |
| use_count | Int | 사용 횟수 |
| created_at | DateTime | 생성일 |

#### product_hashtags
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary Key |
| product_id | String | FK → products |
| hashtag_id | String | FK → hashtags |
| created_at | DateTime | 생성일 |

---

## 3. API 엔드포인트

### 3.1 인증 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | 회원가입 |
| POST | /auth/login | 로그인 |
| POST | /auth/refresh | 토큰 갱신 |

### 3.2 사용자 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | 내 프로필 |
| PUT | /users/me | 프로필 수정 |
| GET | /users/:id | 사용자 프로필 |
| GET | /users/:id/reviews | 사용자 리뷰 |
| GET | /users/me/transactions | 내 거래 내역 |

### 3.3 상품 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products | 상품 목록 (검색/필터) |
| GET | /products/my | 내 상품 목록 |
| GET | /products/:id | 상품 상세 |
| POST | /products | 상품 등록 |
| PATCH | /products/:id | 상품 수정 |
| DELETE | /products/:id | 상품 삭제 |
| PATCH | /products/:id/price | 가격만 수정 |
| PATCH | /products/:id/purchase | 상품 구매 |

### 3.4 팔로우 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /follows/:userId | 팔로우 |
| DELETE | /follows/:userId | 언팔로우 |
| GET | /follows/check/:userId | 팔로우 여부 |
| GET | /follows/followers | 내 팔로워 |
| GET | /follows/following | 내 팔로잉 |
| GET | /follows/feed | 팔로잉 피드 |
| GET | /users/:userId/followers | 특정 유저 팔로워 |
| GET | /users/:userId/following | 특정 유저 팔로잉 |

### 3.5 차단 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /blocks/:userId | 사용자 차단 |
| DELETE | /blocks/:userId | 차단 해제 |
| GET | /blocks | 차단 목록 |
| GET | /blocks/check/:userId | 차단 여부 |

### 3.6 신고 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /reports | 신고 생성 |
| GET | /reports/my | 내 신고 목록 |
| DELETE | /reports/:id | 신고 삭제 |
| GET | /admin/reports | 전체 신고 (Admin) |
| PATCH | /admin/reports/:id | 신고 처리 (Admin) |

### 3.7 키워드 알림 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /keyword-alerts | 키워드 알림 등록 |
| GET | /keyword-alerts | 내 키워드 알림 |
| PATCH | /keyword-alerts/:id | 키워드 알림 수정 |
| DELETE | /keyword-alerts/:id | 키워드 알림 삭제 |
| PATCH | /keyword-alerts/:id/toggle | 활성화 토글 |

### 3.8 최근 본 상품 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /recent-views | 최근 본 상품 |
| DELETE | /recent-views | 전체 삭제 |
| DELETE | /recent-views/:productId | 특정 상품 삭제 |

### 3.9 브랜드 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /brands | 브랜드 목록 |
| GET | /brands/popular | 인기 브랜드 |
| GET | /brands/:id | 브랜드 상세 |
| GET | /brands/:id/products | 브랜드별 상품 |
| POST | /admin/brands | 브랜드 생성 (Admin) |
| PATCH | /admin/brands/:id | 브랜드 수정 (Admin) |
| DELETE | /admin/brands/:id | 브랜드 삭제 (Admin) |

### 3.10 카테고리 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /categories | 카테고리 목록 |
| GET | /categories/:slug | 카테고리 상세 |
| GET | /categories/:slug/products | 카테고리별 상품 |
| POST | /admin/categories | 카테고리 생성 (Admin) |
| PATCH | /admin/categories/:id | 카테고리 수정 (Admin) |
| DELETE | /admin/categories/:id | 카테고리 삭제 (Admin) |
| PATCH | /admin/categories/reorder | 순서 변경 (Admin) |

### 3.11 해시태그 API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /hashtags | 해시태그 목록 |
| GET | /hashtags/popular | 인기 해시태그 |
| GET | /hashtags/search | 해시태그 검색 |
| GET | /hashtags/:name/products | 해시태그별 상품 |

---

## 4. 인증 & 보안

### 4.1 JWT 인증
- Access Token: 15분 만료
- Refresh Token: 7일 만료
- Bearer 방식 헤더 전달

### 4.2 가드
- `JwtAuthGuard`: 로그인 필수 엔드포인트
- `OptionalJwtAuthGuard`: 로그인 선택
- `AdminGuard`: 관리자 권한 필요

### 4.3 비밀번호
- bcrypt 해싱 (salt rounds: 10)

---

## 5. 인덱스 설계

### 5.1 주요 인덱스
```sql
-- products
CREATE INDEX idx_products_seller ON products(seller_id, created_at DESC);
CREATE INDEX idx_products_status ON products(status, created_at DESC);
CREATE INDEX idx_products_category ON products(category, created_at DESC);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_condition ON products(condition);
CREATE INDEX idx_products_trade_method ON products(trade_method);

-- follows
CREATE INDEX idx_follows_follower ON follows(follower_id, created_at DESC);
CREATE INDEX idx_follows_following ON follows(following_id, created_at DESC);

-- blocks
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

-- reports
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

-- keyword_alerts
CREATE INDEX idx_keyword_alerts_user ON keyword_alerts(user_id, is_active);
CREATE INDEX idx_keyword_alerts_keyword ON keyword_alerts(keyword);

-- recent_views
CREATE INDEX idx_recent_views_user ON recent_views(user_id, viewed_at DESC);

-- notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

---

## 6. 환경 변수

### 6.1 Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sparkmarket
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket-name
```

### 6.2 Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

---

## 7. 배포 가이드

### 7.1 Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run build
npm run start:prod
```

### 7.2 Frontend
```bash
cd frontend
npm install
npm run build
npm start
```

---

## 8. 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-11-28 | 초기 TRD 작성 |
| 1.1 | 2025-11-28 | Phase 7 완료, API 및 스키마 업데이트 |
| 1.2 | 2025-12-06 | 포트 변경, 로컬 이미지 업로드, Seed 확장, Admin 차트 강화 |
| 1.3 | 2025-12-12 | Phase 8 완료 - 팔로우/팔로잉 상태 동기화 버그 수정 |
| 1.4 | 2025-12-13 | Phase 9 완료 - 코드베이스 리팩터링 및 모듈화 |
| 1.5 | 2025-12-13 | Phase 10 완료 - 가격 빠른 수정 및 판매 알림 기능 |

---

## 9. 구현 완료 모듈

### Backend Modules ✅
- AuthModule - JWT 인증 (Access/Refresh Token)
- UsersModule - 사용자 관리, 프로필
- ProductsModule - 상품 CRUD, 검색/필터
- FavoritesModule - 찜하기
- PriceOffersModule - 가격 제안 시스템
- ReviewsModule - 거래 리뷰
- NotificationsModule - 알림 시스템
- FollowsModule - 팔로우/언팔로우
- BlocksModule - 사용자 차단
- ReportsModule - 신고 시스템
- KeywordAlertsModule - 키워드 알림
- RecentViewsModule - 최근 본 상품
- BrandsModule - 브랜드 관리
- CategoriesModule - 카테고리 관리
- HashtagsModule - 해시태그
- ModerationModule - 콘텐츠 검토
- AdminModule - 관리자 기능

### Frontend Pages ✅
- / - 메인 페이지 (상품 목록)
- /login - 로그인
- /register - 회원가입
- /products/[id] - 상품 상세
- /products/new - 상품 등록
- /products/[id]/edit - 상품 수정
- /mypage - 마이페이지
- /favorites - 찜 목록
- /offers - 가격 제안 관리
- /notifications - 알림
- /users/[id] - 공개 프로필
- /profile/edit - 프로필 수정
- /admin/* - 관리자 페이지

### 주요 수정 사항 (Phase 7)
- UpdateUserStatusDto: @IsEnum → @IsIn 수정
- Admin API: 응답 포맷 통일 (data + meta → PaginatedResponse)
- AdminProductList: 테이블 레이아웃 개선
- AdminUserList: 에러 핸들링 개선

### Phase 8: 버그 수정 ✅
- [x] 팔로우/팔로잉 상태 동기화 버그 수정
  - **문제**: 다른 페이지에서 팔로우 후 마이페이지로 돌아가면 팔로잉 카운트 미갱신
  - **문제**: 프로필 페이지 재방문 시 팔로우 버튼 상태 초기화 (다시 클릭해야 함)
  - **문제**: 팔로잉 목록에서 유저가 표시되지 않음 (백엔드/프론트엔드 데이터 구조 불일치)
  - **해결**: Zustand 전역 상태로 팔로우 상태 캐싱 (`followStore.ts`)
  - **해결**: mypage.tsx에서 백엔드 API 응답 구조 호환성 처리 (`follow.following || follow`)
  - **수정 파일**:
    - `frontend/src/stores/followStore.ts`: 사용자별 팔로우 상태 캐시 + 전역 카운트 관리
    - `frontend/src/components/ui/FollowButton.tsx`: Zustand 캐시 연동
    - `frontend/app/mypage/page.tsx`: Zustand 전역 카운트 사용 + 팔로워/팔로잉 목록 데이터 구조 호환성 수정
    - `frontend/app/users/[id]/page.tsx`: 팔로우 시 팔로워 카운트 즉시 업데이트

### Phase 9: 코드베이스 리팩터링 ✅
- [x] **types/index.ts 분리** (592줄 → 8개 파일)
  - `user.ts`: 사용자 관련 타입
  - `product.ts`: 상품 관련 타입 + 레이블 상수 (중복 제거)
  - `transaction.ts`: 거래 관련 타입
  - `review.ts`: 리뷰 관련 타입
  - `admin.ts`: 관리자 관련 타입
  - `common.ts`: 공통 타입 (Pagination, API 응답 등)
  - `notification.ts`: 알림 관련 타입
  - `social.ts`: 팔로우/차단 관련 타입
  - `index.ts`: Re-export 허브
- [x] **레이블 상수 중복 제거**
  - `ProductDetail.tsx`, `FirebaseAnalyticsCharts.tsx` 내 중복 상수 제거
  - `types/product.ts`로 통합
- [x] **stores/ 디렉토리 통합**
  - `src/store/authStore.ts` → `src/stores/authStore.ts` 이동
  - `stores/index.ts` 생성 (중앙 re-export)
- [x] **ProductDetail.tsx 분리** (708줄 → 4개 파일)
  - `ProductDetailHeader.tsx`: 상품 헤더 (이미지, 제목, 가격)
  - `ProductDetailContent.tsx`: 상품 상세 정보
  - `ProductDetailActions.tsx`: 액션 버튼 (찜, 제안, 구매)
  - `ProductDetail.tsx`: 메인 컴포넌트 (조합)
- [x] **ProductForm.tsx 분리** (502줄 → 3개 파일)
  - `ProductFormFields.tsx`: 폼 필드 (제목, 가격, 카테고리 등)
  - `ProductFormImages.tsx`: 이미지 업로드 섹션
  - `ProductForm.tsx`: 메인 컴포넌트 (조합)
- [x] **shared/ 디렉토리 생성**
  - `ProductCard.tsx`: 상품 카드 컴포넌트
  - `ReviewCard.tsx`: 리뷰 카드 컴포넌트
  - `OfferCard.tsx`: 가격 제안 카드 컴포넌트
  - `index.ts`: Re-export
- [x] **Backend 인증 에러 수정**
  - `JwtAuthGuard`에서 500 → 401 에러 반환 수정
  - `handleRequest` 메서드 오버라이드로 명시적 `UnauthorizedException` 처리

### Phase 10: 가격 빠른 수정 및 판매 알림 ✅
- [x] **가격 빠른 수정 API**
  - `PATCH /products/:id/price` 엔드포인트 추가
  - 가격만 변경하는 전용 API (전체 상품 수정 대비 간편)
  - 가격 인하 시 `original_price` 자동 저장
  - 가격 인하 시 찜한 사용자에게 `PRICE_DROP` 알림 발송
- [x] **가격 빠른 수정 UI**
  - `ProductCard`: `showPriceEdit` prop + 연필 아이콘 버튼
  - `ProductDetailContent`: 판매자 본인에게만 가격 수정 버튼 표시
  - `ProductDetail` / `mypage`: 가격 수정 모달 구현
  - 빠른 가격 인하 버튼: -1천, -5천, -1만, -5만, -10만
- [x] **판매 완료 알림**
  - `purchase()` 메서드에서 판매자에게 `PRODUCT_SOLD` 알림 발송
  - 알림 내용: 상품명, 구매자 닉네임, 판매 금액
- [x] **브랜드 ID 검증 강화**
  - `create()` / `update()` 메서드에서 brand_id 유효성 검증
  - Prisma P2003 외래키 오류 방지
