# Follows API 엔드포인트

## 팔로우 관련 엔드포인트

### 1. 팔로우하기
- **URL**: `POST /follows/:userId`
- **인증**: JWT 필요
- **설명**: 특정 유저를 팔로우합니다.
- **응답**: 
  ```json
  {
    "message": "팔로우했습니다.",
    "isFollowing": true
  }
  ```
- **알림**: 팔로우 대상에게 `NEW_FOLLOWER` 알림 생성

### 2. 언팔로우
- **URL**: `DELETE /follows/:userId`
- **인증**: JWT 필요
- **설명**: 특정 유저를 언팔로우합니다.
- **응답**: 
  ```json
  {
    "message": "언팔로우했습니다.",
    "isFollowing": false
  }
  ```

### 3. 팔로우 여부 확인
- **URL**: `GET /follows/check/:userId`
- **인증**: JWT 필요
- **설명**: 특정 유저를 팔로우하고 있는지 확인합니다.
- **응답**: 
  ```json
  {
    "isFollowing": true
  }
  ```

### 4. 내 팔로워 목록
- **URL**: `GET /follows/followers?page=1&limit=20`
- **인증**: JWT 필요
- **설명**: 나를 팔로우하는 사람들의 목록을 조회합니다.
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 개수 (기본값: 20)
- **응답**: 
  ```json
  {
    "data": [
      {
        "id": "user_id",
        "nickname": "유저닉네임",
        "avatar_url": "https://...",
        "bio": "자기소개",
        "_count": {
          "products": 5,
          "followers": 10,
          "following": 15
        },
        "followedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
  ```

### 5. 내가 팔로우하는 목록
- **URL**: `GET /follows/following?page=1&limit=20`
- **인증**: JWT 필요
- **설명**: 내가 팔로우하는 사람들의 목록을 조회합니다.
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 개수 (기본값: 20)
- **응답**: 
  ```json
  {
    "data": [
      {
        "id": "user_id",
        "nickname": "유저닉네임",
        "avatar_url": "https://...",
        "bio": "자기소개",
        "_count": {
          "products": 5,
          "followers": 10,
          "following": 15
        },
        "followedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
  ```

### 6. 팔로우 피드 (팔로우한 사람들의 최신 상품)
- **URL**: `GET /follows/feed?page=1&limit=20`
- **인증**: JWT 필요
- **설명**: 내가 팔로우하는 사람들이 등록한 최신 상품 목록을 조회합니다.
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 개수 (기본값: 20)
- **응답**: 
  ```json
  {
    "data": [
      {
        "id": "product_id",
        "title": "상품명",
        "price": 50000,
        "images": [...],
        "seller": {
          "id": "seller_id",
          "nickname": "판매자닉네임",
          "avatar_url": "https://..."
        },
        "_count": {
          "favorites": 10
        },
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
  ```

## Users 컨트롤러에 추가된 엔드포인트

### 7. 특정 유저의 팔로워 목록
- **URL**: `GET /users/:userId/followers?page=1&limit=20`
- **인증**: 불필요 (공개)
- **설명**: 특정 유저의 팔로워 목록을 조회합니다.
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 개수 (기본값: 20)

### 8. 특정 유저가 팔로우하는 목록
- **URL**: `GET /users/:userId/following?page=1&limit=20`
- **인증**: 불필요 (공개)
- **설명**: 특정 유저가 팔로우하는 사람들의 목록을 조회합니다.
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 개수 (기본값: 20)

## 알림 타입

### NEW_FOLLOWER
- **생성 시점**: 다른 유저가 나를 팔로우할 때
- **메시지**: "{닉네임}님이 회원님을 팔로우하기 시작했습니다."
- **관련 타입**: USER
- **관련 ID**: 팔로워의 user_id

### FOLLOWED_USER_PRODUCT (추후 구현)
- **생성 시점**: 내가 팔로우하는 유저가 새 상품을 등록할 때
- **메시지**: "{닉네임}님이 새 상품 '{상품명}'을 등록했습니다."
- **관련 타입**: PRODUCT
- **관련 ID**: product_id
- **구현 위치**: `products.service.ts`의 상품 등록 로직

## 에러 처리

- **자기 자신 팔로우 시도**: `400 Bad Request` - "자기 자신을 팔로우할 수 없습니다."
- **존재하지 않는 유저**: `404 Not Found` - "유저를 찾을 수 없습니다."
- **이미 팔로우 중**: `400 Bad Request` - "이미 팔로우 중입니다."
- **팔로우하지 않은 유저 언팔로우**: `404 Not Found` - "팔로우하지 않은 유저입니다."
