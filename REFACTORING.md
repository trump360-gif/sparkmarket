# SparkMarket 모듈화 리팩터링 가이드

## 현재 문제점 요약

| 문제 | 파일 | 상태 |
|------|------|------|
| 500줄 초과 | ProductDetail.tsx (721줄) | 분리 필요 |
| 500줄 초과 | types/index.ts (592줄) | 분리 필요 |
| 500줄 초과 | ProductForm.tsx (502줄) | 분리 필요 |
| 중복 코드 | 레이블 상수 3곳 정의 | 통합 필요 |
| 구조 혼재 | store/ vs stores/ | 통합 필요 |
| 부재 | shared/ 디렉토리 | 생성 필요 |

---

## 개선 작업

### 1. ProductDetail.tsx 분리 (721줄 → 4개 파일)

**현재:** `src/components/product/ProductDetail.tsx`

**분리 후:**
```
src/components/product/
├── ProductDetail.tsx (상위 컨테이너 - ~200줄)
├── ProductDetailHeader.tsx (헤더/이미지 - ~150줄)
├── ProductDetailContent.tsx (상품 정보 - ~150줄)
└── ProductDetailRelated.tsx (관련 상품 - ~100줄)
```

---

### 2. types/index.ts 분리 (592줄 → 5개 파일)

**현재:** `src/types/index.ts`

**분리 후:**
```
src/types/
├── index.ts (re-export만)
├── user.ts (User, UserProfile, UserStats)
├── product.ts (Product, ProductCondition, 레이블 상수)
├── transaction.ts (Transaction, Offer 관련)
├── review.ts (Review 관련)
└── admin.ts (Admin 전용 타입)
```

**index.ts 예시:**
```typescript
export * from './user'
export * from './product'
export * from './transaction'
export * from './review'
export * from './admin'
```

---

### 3. ProductForm.tsx 분리 (502줄 → 3개 파일)

**현재:** `src/components/product/ProductForm.tsx`

**분리 후:**
```
src/components/product/
├── ProductForm.tsx (상위 컨테이너 - ~200줄)
├── ProductFormFields.tsx (기본 필드 - ~150줄)
└── ProductFormImages.tsx (이미지 업로드 - ~150줄)
```

---

### 4. 레이블 상수 중복 제거

**중복 위치:**
- `src/types/index.ts` (원본 - 유지)
- `src/components/product/ProductDetail.tsx` (삭제)
- `src/components/admin/FirebaseAnalyticsCharts.tsx` (삭제)

**작업:**
1. ProductDetail.tsx에서 중복 정의 삭제
2. FirebaseAnalyticsCharts.tsx에서 중복 정의 삭제
3. types에서 import하도록 변경

```typescript
// 변경 전 (ProductDetail.tsx)
const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {...}

// 변경 후
import { PRODUCT_CONDITION_LABELS } from '@/types'
```

---

### 5. 저장소 통합

**현재:**
```
src/store/authStore.ts
src/stores/followStore.ts
src/stores/themeStore.ts
```

**통합 후:**
```
src/stores/
├── index.ts (re-export)
├── authStore.ts
├── followStore.ts
└── themeStore.ts
```

**작업:**
1. `src/store/authStore.ts` → `src/stores/authStore.ts` 이동
2. `src/store/` 디렉토리 삭제
3. import 경로 수정

---

### 6. shared/ 디렉토리 생성

**생성:**
```
src/components/shared/
├── index.ts (re-export)
├── ProductCard.tsx (product/에서 이동)
├── ReviewCard.tsx (review/에서 이동)
└── OfferCard.tsx (offer/에서 이동)
```

**index.ts:**
```typescript
export { ProductCard } from './ProductCard'
export { ReviewCard } from './ReviewCard'
export { OfferCard } from './OfferCard'
```

---

## 작업 순서 (권장)

1. types/index.ts 분리 (다른 파일들이 의존)
2. 레이블 상수 중복 제거
3. stores/ 통합
4. ProductDetail.tsx 분리
5. ProductForm.tsx 분리
6. shared/ 디렉토리 생성

---

## 모듈화 규칙 (작업 시 참고)

- 여러 페이지에서 사용 → shared/
- 한 페이지에서만 사용 → 해당 페이지 파일에 포함
- 동일 코드 2곳 이상 → shared/로 이동
- 파일 500줄 초과 시 분리
- shared/index.ts에서 모든 공통 모듈 re-export
- 수정 전 shared/index.ts 확인
