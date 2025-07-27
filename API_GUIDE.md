# API Guide

이 문서는 E-Commerce Platform의 전체 API 엔드포인트와 각 도메인별 주요 설계 원칙을 기술합니다. 모든 API는 RESTful 원칙을 준수하며, 역할 기반 권한 제어를 통해 안전하고 예측 가능한 인터페이스를 제공하는 것을 목표로 합니다.

---

## 사용자 관리 API (`/api/user`)
> 회원 가입부터 정보 수정, 탈퇴까지 사용자의 전체 생명주기를 관리하고, JWT와 Redis를 활용하여 안전하고 확장 가능한 인증 시스템을 제공합니다.

| HTTP Method | Endpoint | 설명 | 권한 |
|-------------|----------|------|------|
| POST | `/signup` | 회원가입 | 공개 |
| POST | `/login` | 로그인 (JWT 토큰 발급) | 공개 |
| POST | `/logout` | 로그아웃 (토큰 무효화) | 공개 |
| GET | `/find` | 사용자 정보 조회 | USER/ADMIN |
| POST | `/update` | 회원정보 수정 | USER |
| POST | `/updatePassword` | 비밀번호 변경 | AUTH |
| POST | `/delete` | 회원 탈퇴 | AUTH |
| POST | `/checkPassword` | 비밀번호 확인 | USER |
| POST | `/sendPasswordResetEmail` | 비밀번호 재설정 이메일 발송 | 공개 |
| POST | `/resetPassword` | 비밀번호 재설정 | 공개 |
| GET | `/count` | 회원 수 조회 | ADMIN |
| GET | `/list` | 회원 목록 조회 | ADMIN |
| POST | `/updateUserDeletedForAdmin` | 회원 활성화/비활성화 | ADMIN |
| GET | `/loginHistory` | 로그인 기록 조회 | ADMIN |

**주요 설계 고려사항:**
- **보안**: 비밀번호는 복구가 불가능한 `bcrypt` 단방향 암호화를, 전화번호는 안전한 복호화가 가능한 `AES-256` 양방향 암호화를 적용했습니다.
- **인증**: Access/Refresh 토큰 이중화 및 Redis 블랙리스트를 통해 탈취된 토큰의 재사용 공격을 원천적으로 차단합니다.
- **권한**: `@PreAuthorize` 어노테이션을 활용한 메서드 레벨 보안을 적용하여, 역할(USER/ADMIN)에 따른 세밀한 접근 제어를 구현했습니다.
- **동시성**: `version` 컬럼 기반의 낙관적 락(Optimistic Lock)을 적용하여 동시 정보 수정 시 데이터의 정합성을 보장합니다.


---

## 상품 관리 API (`/api/product`)
> 3단계 계층형 상품 구조를 기반으로, 카테고리 관리부터 상품 등록, 재고 추적, 이미지 서빙까지 상품과 관련된 모든 생명주기를 책임집니다.

| HTTP Method | Endpoint | 설명 | 권한 |
|-------------|----------|------|------|
| **카테고리 관리** ||||
| POST | `/insertCategory` | 카테고리 등록 | ADMIN |
| POST | `/updateCategory` | 카테고리 수정 | ADMIN |
| POST | `/deleteCategory` | 카테고리 삭제 | ADMIN |
| GET | `/getCategories` | 전체 카테고리 목록 조회 | 공개 |
| GET | `/getTopCategories` | 최상위 카테고리 목록 조회 | 공개 |
| GET | `/getSubCategories/{categoryId}` | 하위 카테고리 목록 조회 | 공개 |
| GET | `/getCategoryPath/{categoryId}` | 카테고리 경로 조회 | 공개 |
| **상품 마스터 관리** ||||
| POST | `/insertProduct` | 상품 등록 | ADMIN |
| POST | `/updateProduct` | 상품 수정 | ADMIN |
| GET | `/getProductList` | 상품 목록 조회 (검색/페이징) | 공개 |
| GET | `/getProduct/{code}` | 단일 상품 조회 | 공개 |
| GET | `/getNewProducts` | 신상품 목록 조회 | 공개 |
| GET | `/getPopularProducts` | 인기상품 목록 조회 | 공개 |
| **상품 품목 관리** ||||
| POST | `/insertProductItem` | 상품 품목 등록 | ADMIN |
| POST | `/updateProductItem` | 상품 품목 수정 | ADMIN |
| GET | `/getProductItemsByProductId/{productId}` | 상품 품목 목록 조회 | 공개 |
| **재고 관리** ||||
| POST | `/insertProductInventory` | 재고 입고 (단일) | ADMIN |
| POST | `/insertBulkProductInventory` | 재고 입고 (대량) | ADMIN |
| GET | `/getProductInventories/{productItemId}` | 재고 목록 조회 | ADMIN |
| GET | `/getInventoryHistories/{productInventoryId}` | 재고 변동 이력 조회 | ADMIN |
| **이미지 관리** ||||
| POST | `/uploadImage` | 이미지 업로드 | ADMIN |
| GET | `/serve-image/{fileName}` | 이미지 조회 | 공개 |

**주요 설계 고려사항:**
- **데이터 모델링**: **`상품 마스터 → 상품 품목 → 재고`** 의 3단계 정규화된 구조를 통해 데이터 중복을 최소화하고 확장성을 극대화했습니다.
- **계층형 데이터 처리**: 재귀 쿼리(Recursive Query)를 활용하여 3단계 이상의 깊이를 가진 카테고리 구조를 효율적으로 조회하고 관리합니다.
- **성능을 고려한 API 분리**: 전체 상품을 조회하는 API와 별개로, 트래픽이 집중되는 `신상품` 및 `인기상품` 조회를 위한 전용 API를 설계했습니다. 이러한 구조는 향후 트래픽 증가 시, **조회 결과 자체를 캐싱(Caching)하여 데이터베이스 부하를 최소화**하고 응답 속도를 극적으로 향상시킬 수 있는 확장성의 기반이 됩니다.
- **파일 처리**: 상품 이미지는 서버의 특정 디렉토리에 저장 및 관리되며, Nginx를 통해 정적 파일로 서빙되어 백엔드 서버의 부하를 줄입니다.


---

## 주문 관리 API (`/api/order`)
> 16가지 이상의 세분화된 상태 모델을 기반으로, 사용자의 주문 접수부터 관리자의 배송 처리, 그리고 복잡한 취소/반품/교환 워크플로우까지의 전 과정을 관리합니다.

| HTTP Method | Endpoint | 설명 | 권한 |
|-------------|----------|------|------|
| **주문 생성 및 조회** ||||
| POST | `/insertOrder` | 주문 접수 | USER |
| GET | `/orderList` | 회원 주문 내역 목록 조회 | USER |
| GET | `/orderDetail` | 단일 주문 상세 조회 | USER/ADMIN |
| GET | `/orderListForAdmin` | 관리자용 전체 주문 목록 조회 | ADMIN |
| GET | `/count` | 주문 수 조회 | ADMIN |
| **주문 상태 관리 (관리자)** ||||
| POST | `/updateOrderProductStatusToPaymentCompleted` | 결제 대기 → 결제 완료 | ADMIN |
| POST | `/manuallyUpdateOrderProductStatusToPreparing` | 결제 완료 → 준비중 | ADMIN |
| POST | `/updateOrderProductStatusToDelivering` | 준비중 → 배송중 | ADMIN |
| POST | `/updateOrderStatusToDelivered` | 배송중 → 배송완료 / 교환 배송중 → 교환 배송완료 | ADMIN |
| POST | `/updateOrderStatusToDeliveryConfirmed` | 배송완료 → 구매확정 | USER/ADMIN |
| **취소/반품/교환 요청 (회원)** ||||
| POST | `/updateOrderProductRequest` | 취소/반품/교환 요청 | USER |
| **취소/반품/교환 처리 (관리자)** ||||
| POST | `/updateOrderProductCancelApproval` | 주문 취소 요청 승인 | ADMIN |
| POST | `/updateOrderProductReturnApproval` | 반품 요청 승인 (반품 요청 → 반품 중) | ADMIN |
| POST | `/updateOrderProductReturnComplete` | 반품 완료 처리 (반품 중 → 반품 완료) | ADMIN |
| POST | `/updateOrderProductExchangeApproval` | 교환 요청 승인 (교환 요청 → 교환 반품 중) | ADMIN |
| POST | `/updateOrderProductExchangePrepare` | 교환 준비 처리 (교환 반품중 → 교환 준비중) | ADMIN |
| POST | `/updateOrderProductExchangeDelivering` | 교환 배송 처리 (교환 준비중 → 교환 배송중) | ADMIN |
| **배송 관리** ||||
| GET | `/deliveryHistories` | 배송 이력 조회 | ADMIN |

**주요 설계 고려사항:**
- **상태 머신(State Machine) 설계**: 16개 이상의 주문 상태와 각 상태 간의 전이 조건을 명확히 정의하여, 복잡한 주문 워크플로우에서 발생할 수 있는 데이터 부정합을 방지합니다.
- **데이터 무결성**: 주문과 관련된 모든 핵심 로직은 `@Transactional(isolation = Isolation.REPEATABLE_READ)`을 통해 트랜잭션으로 묶여 원자성(Atomicity)을 보장하고, 팬텀 리드(Phantom Read) 현상을 방지합니다.
- **동시성**: 재고와 직접적으로 연관된 주문 접수 로직에는 비관적 락(Pessimistic Lock)을, 상태 변경 로직에는 낙관적 락(Optimistic Lock)을 적용하여 성능과 데이터 정합성 사이의 균형을 맞췄습니다.
- **이력 추적**: `order_product_histories` 테이블을 통해 주문 상품의 모든 상태 변경 이력을 기록하여, 문제 발생 시 원인을 추적하고 감사(Audit) 자료로 활용할 수 있도록 설계했습니다.


---

## 리뷰 관리 API (`/api/review`)
> 실제 구매가 검증된 사용자만이 리뷰를 작성할 수 있도록 하여, 신뢰도 높은 사용자 생성 콘텐츠(UGC)를 관리합니다.

| HTTP Method | Endpoint | 설명 | 권한 |
|-------------|----------|------|------|
| POST | `/insertReview` | 리뷰 등록 | USER |
| POST | `/updateReview` | 리뷰 수정 | USER |
| GET | `/list` | 리뷰 리스트 조회 (검색/페이징) | 공개 |
| POST | `/deleteReview` | 리뷰 삭제 | USER/ADMIN |
| GET | `/count` | 리뷰 수 조회 | ADMIN |
| GET | `/listByUserId` | 회원별 리뷰 조회 | USER |

**주요 설계 고려사항:**
- **신뢰성**: 주문 테이블과 연동하여, 주문 상태가 `DELIVERY_CONFIRMED`(구매확정)인 상품에 대해서만 리뷰 작성을 허용합니다.
- **중복 방지**: `order_product_id`를 기준으로, 하나의 주문 상품에 대해 단 한 개의 리뷰만 작성 가능하도록 하여 어뷰징을 방지합니다.
- **권한 제어**: 리뷰 수정은 작성자 본인만 가능하며, 삭제는 작성자와 관리자 모두 가능하도록 역할에 따라 권한을 세분화했습니다.
- **데이터 조회**: 상품 상세 페이지에서의 리뷰 목록 조회와 마이페이지에서의 본인 리뷰 조회를 위해, 상품 품목 ID와 사용자 ID를 각각 기준으로 하는 두 가지 조회 API를 제공합니다.


---

## 결제 관리 API (`/api/payment`)
> 포트원(Portone) 결제 연동을 통해 실제 결제 프로세스를 시뮬레이션하고, 웹훅(Webhook)을 통해 결제 상태를 비동기적으로 처리합니다.

| HTTP Method | Endpoint | 설명 | 권한 |
|-------------|----------|------|------|
| **결제 처리** ||||
| POST | `/prepare` | 결제 정보 생성 (프론트엔드 초기화용) | 공개 |
| POST | `/verify/{paymentId}` | 결제 검증 | 공개 |
| POST | `/cancel/{paymentId}` | 결제 취소 | 공개 |
| POST | `/{paymentId}/virtual-account` | 가상계좌 발급 | 공개 |
| **웹훅 처리** ||||
| POST | `/webhook` | 포트원 웹훅 처리 | 공개 |
| **결제 이력 조회** ||||
| GET | `/history/merchant/{merchantUid}` | 결제 이력 조회 (주문번호) | 공개 |
| GET | `/history/order/{orderId}` | 결제 이력 조회 (주문ID) | 공개 |
| GET | `/history/imp/{impUid}` | 결제 이력 조회 (결제ID) | 공개 |
| GET | `/historyListForAdmin` | 결제 이력 검색 (관리자용) | ADMIN |
| GET | `/totalRevenue` | 총 매출 조회 | ADMIN |
| GET | `/count` | 총 결제 수 조회 | ADMIN |

**주요 설계 고려사항:**
- **사전/사후 검증**: 프론트엔드에서 결제 요청 전, 백엔드의 `/prepare` API를 통해 주문 금액을 DB에 기록하고, 결제 완료 후 `/verify` API를 통해 결제된 금액과 DB에 기록된 금액을 교차 검증하여 결제 위변조를 방지합니다.
- **비동기 처리**: 결제 상태 변경, 재고 차감 등 시간이 소요될 수 있는 웹훅 처리 로직은 `@Async`를 활용하여 비동기적으로 실행함으로써, 웹훅 요청에 대한 응답 시간을 최소화하고 안정성을 높였습니다.
- **보안**: 포트원 API 연동에 필요한 모든 민감 정보(API Key, Secret 등)는 `.env` 파일을 통해 안전하게 관리됩니다.