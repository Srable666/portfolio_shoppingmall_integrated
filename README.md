# E-Commerce Platform Portfolio

> 의류 및 패션 전문 풀스택 쇼핑몰 웹 서비스

실무급 전자상거래 플랫폼을 목표로, 현대적인 웹 기술 스택과 아키텍처를 활용하여 구현된 포트폴리오 프로젝트입니다.

## 📺 데모 ⚠️(미완성/검토 요망)

### 라이브 데모
🔗 **[Live Demo]()**  
*AWS Lightsail에서 호스팅 중*

> ⚠️ **현재 상태**: 결제 시스템 연동 및 주문 관리 기능 개발 진행 중 (약 85% 완성)

### 스크린샷
*(스크린샷 이미지들 추가 예정)*

### 📝 이미지 출처
본 포트폴리오 프로젝트의 상품 이미지는 **[무신사(MUSINSA)](https://www.musinsa.com)**에서 제공하는 이미지를 사용했습니다. 
이는 포트폴리오 개발 목적으로만 사용되며, 상업적 이용이 아닌 기술 시연을 위한 것입니다.

## 🎯 주요 특징 및 기술적 하이라이트

### 🔐 보안 중심 설계
- **JWT 이중 토큰 구조 + Redis 블랙리스트**로 Access/Refresh 토큰 분리 관리
- **bcrypt + AES-256-GCM** 다층 암호화로 비밀번호/전화번호 보호
- **환경변수 관리 + 권한 기반 접근 제어**로 시스템 보안 강화

### ⚡ 고성능 동시성 제어
- **낙관적/비관적 락** 조합으로 데이터 일관성 보장
- **3단계 상품 구조** (마스터/품목/재고)로 확장 가능한 재고 관리
- **트랜잭션 격리 수준 REPEATABLE_READ** 적용으로 데이터 정합성 확보

### 💳 실시간 테스트 결제 시스템 *(개발 중)*
- **포트원 API 연동 + 웹훅 처리**로 결제 상태 실시간 동기화
- **데스크톱 팝업 + 모바일 리디렉션** 방식 지원
- **부분 취소/반품/교환** 비즈니스 로직 구현

### 🎨 현대적 풀스택 아키텍처
- **React 18 + Ant Design** 기반 반응형 디자인 (768px 기준)
- **마이크로서비스 지향** 백엔드/프론트엔드 분리로 독립적 개발/배포
- **멀티 프로파일 환경** (dev/prod/staging) + Redis 캐싱 전략

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 2.7.16 (Java 17)
- **Security**: Spring Security + JWT + Redis
- **Database**: MyBatis + MariaDB
- **Infrastructure**: AWS Lightsail + Nginx + Cloudflare
- **External APIs**: PortOne (결제) *(개발 중)*, JavaMail (이메일 발송)
- **Concurrency**: AOP 기반 낙관적 락, 비관적 락

### Frontend
- **Framework**: React 18.2.0
- **UI Library**: Ant Design 5.24.7
- **Styling**: Styled Components 6.1.17
- **Routing**: React Router DOM 7.5.0
- **HTTP Client**: Axios 1.8.4
- **State Management**: React Context API
- **External APIs**: PortOne 결제, 다음 우편번호 API

## 🚀 구현된 주요 기능

### 👥 사용자 시스템
- [x] **완전한 회원 관리**: 가입/로그인부터 탈퇴까지 전체 라이프사이클 지원
- [x] **보안 강화 인증**: JWT 이중 토큰 + 이메일 인증 기반 비밀번호 재설정
- [x] **개인정보 보호**: 비밀번호/전화번호 암호화 + 로그인 이력 추적

### 🛍️ 쇼핑 경험
- [x] **스마트 상품 탐색**: 카테고리별/키워드 검색 + 6가지 정렬 옵션
- [x] **직관적 주문 프로세스**: 장바구니 → 주문 → 결제 → 배송 추적
- [x] **실시간 재고 관리**: 동시 주문 시 재고 충돌 방지 + 재고 수량 초과 주문 방지

### 💳 결제 & 주문 관리
- [ ] **안전한 결제 시스템**: 포트원 테스트 버전 연동 + 웹훅 실시간 동기화 *(개발 중)*
- [ ] **결제 완료 처리**: 결제 성공 후 DB 기록 및 상태 업데이트 *(개발 중)*
- [ ] **주문 상태 관리**: 결제대기→결제완료→배송중→배송완료 흐름 *(개발 중)*
- [ ] **반품/취소/교환**: 관리자 및 회원 요청 처리 시스템 *(개발 중)*

### 📝 리뷰 시스템
- [x] **검증된 리뷰**: 실제 구매 고객만 작성 가능 + 중복 방지
- [x] **편리한 리뷰 관리**: 수정/삭제 + 상품별 리뷰 조회

### 🔧 관리자 대시보드
- [ ] **종합 비즈니스 관리**: 회원/상품/주문/결제 통합 관리 *(개발 중)*
- [x] **실시간 통계**: 매출/주문/회원 현황
- [x] **고급 검색 시스템**: 다양한 조건으로 데이터 필터링 및 검색

### 📱 사용자 경험
- [x] **완전 반응형**: 모바일/태블릿/데스크탑 모든 디바이스 최적화
- [x] **직관적 UI**: Ant Design 기반 일관된 디자인 시스템
- [x] **스마트 네비게이션**: 권한별 메뉴 + 이전 페이지 복원

## 🚧 개발 현황 및 로드맵

### 현재 완성도: 85%

#### ✅ 완료된 주요 기능
- 회원 관리 시스템 (가입, 로그인, 정보 수정, 탈퇴)
- 상품 관리 및 검색 시스템 (카테고리별 조회, 키워드 검색)
- 장바구니 및 주문 생성 프로세스
- 포트원 결제창 연동 (테스트 환경)
- 관리자 대시보드 (회원/상품/리뷰 관리)
- 리뷰 시스템 (작성, 수정, 삭제)
- JWT 이중 토큰 인증 시스템
- 반응형 UI/UX 디자인

#### 🔄 개발 진행 중
- **결제 완료 처리**: 포트원 테스트 결제 성공 후 DB 기록 시스템
- **주문 상태 관리**: 결제대기→결제완료→배송중→배송완료 상태 전환 로직
- **반품/취소/교환**: 관리자 및 회원 요청 처리 워크플로우

#### 📅 향후 개발 계획
- 결제 시스템 완성 및 주문 관리 시스템 구현
- 관리자 주문 처리 기능 고도화
- 성능 최적화 및 사용자 경험 개선

### 📝 알려진 제한사항
- 현재 결제 테스트는 포트원 테스트 환경에서만 가능
- 일부 관리자 주문 처리 기능은 UI만 구현되어 있음
- 결제 성공 후 DB 동기화 로직 개발 중

## 🚦 시작하기

### 필수 요구사항
- **Java 17+** (OpenJDK 권장)
- **Node.js 16+** & **npm 8+**
- **MariaDB 10.6+**
- **Redis 6.0+**
- **Git 2.30+**

### 🔧 로컬 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone https://github.com/Srable666/portfolio_shoppingmall_integrated
cd portfolio_shoppingmall_integrated
```

#### 2. 데이터베이스 설정

##### 방법 1: 스키마 파일 사용 (권장)
```bash
# 프로젝트에서 제공하는 스키마 파일로 데이터베이스 생성
mysql -u root -p < gyp_portfolio_shoppingmall/database/portfolio_shopping_mall_schema.sql
```

##### 방법 2: 수동 생성
```sql
-- MariaDB 접속 후 실행
CREATE DATABASE portfolio_shopping_mall_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON portfolio_shopping_mall_dev.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
```

> 💡 **참고**: 
> - 스키마 파일에는 **13개 테이블**의 완전한 구조가 포함되어 있습니다
> - 테스트 데이터는 별도로 제공되지 않으므로, 애플리케이션 실행 후 회원가입/상품등록을 통해 데이터를 생성하세요

#### 3. Redis 서버 실행
```bash
# macOS (Homebrew)
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Windows
redis-server
```

#### 4. 백엔드 환경 설정
```bash
cd gyp_portfolio_shoppingmall

# .env 파일 생성 (프로젝트 루트에)
touch .env
```

**.env 파일 내용 (필수 환경변수)**:
```env
# 데이터베이스 설정
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:mariadb://localhost:3306/portfolio_shopping_mall_dev
DB_USERNAME=root  # 또는 생성한 사용자
DB_PASSWORD=your_password

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 토큰 설정
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
JWT_ACCESS_TOKEN_EXPIRATION=900000
JWT_REFRESH_TOKEN_EXPIRATION=604800000

# 이메일 설정 (Gmail)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# 포트원 결제 테스트 설정
PORTONE_API_API_SECRET=your_portone_api_secret
PORTONE_API_PG_STORE_ID=your_store_id
PORTONE_API_PG_SECRET_KEY=your_pg_secret_key
PORTONE_API_PG_CLIENT_KEY=your_pg_client_key
PORTONE_API_BASE_URL=https://api.portone.io

# 암호화 설정
PHONE_ENCRYPTION_KEY=your_32_character_encryption_key
PHONE_ENCRYPTION_SALT=your_16_character_salt

# 도메인 설정
APP_DOMAIN=http://localhost:3000
```

#### 5. 백엔드 실행
```bash
# 권한 부여 (macOS/Linux)
chmod +x ./gradlew

# 의존성 설치 및 실행
./gradlew bootRun

# 또는 Windows
gradlew.bat bootRun
```

#### 6. 프론트엔드 설정 및 실행
```bash
cd ../gyp_portfolio_shoppingmall_frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

#### 7. 프론트엔드 환경변수 설정
```bash
# .env 파일 생성 (프론트엔드 루트에)
touch .env
```

**.env 파일 내용**:
```env
# 포트원 클라이언트 키 (결제 테스트용)
REACT_APP_PORTONE_IMP=your_portone_imp_code
```

### 🌐 접속 정보
- **프론트엔드**: http://localhost:3000
- **관리자 로그인**: http://localhost:3000/admin/login
- **백엔드 API**: http://localhost:8080/gyp-shopping-mall

### 🔧 트러블슈팅

<details>
<summary><strong>포트 충돌 오류</strong></summary>

**문제**: `Port 8080 already in use`
**해결**: 
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# 프로세스 종료 후 재실행
```
</details>

<details>
<summary><strong>스키마 파일 실행 오류</strong></summary>

**문제**: `ERROR 1049: Unknown database`
**해결**: 
1. MariaDB 서버가 실행 중인지 확인
2. 파일 경로가 정확한지 확인
3. 권한 문제 시: `mysql -u root -p --default-character-set=utf8mb4 < 파일경로`
</details>

<details>
<summary><strong>데이터베이스 연결 오류</strong></summary>

**문제**: `Connection refused` 또는 `Access denied`
**해결**:
1. MariaDB 서버 실행 확인
2. `.env` 파일의 데이터베이스 정보 확인
3. 방화벽 설정 확인
</details>

<details>
<summary><strong>Redis 연결 오류</strong></summary>

**문제**: `Could not connect to Redis`
**해결**:
```bash
# Redis 서버 상태 확인
redis-cli ping  # PONG 응답 확인

# Redis 서버 재시작
sudo systemctl restart redis-server
```
</details>

<details>
<summary><strong>환경변수 로딩 오류</strong></summary>

**문제**: `Failed to load .env file`
**해결**:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 파일 권한 확인: `chmod 644 .env`
3. 환경변수 형식 확인 (공백, 특수문자 등)
</details>

### 📚 추가 리소스
- **데이터베이스 스키마**: [portfolio_shopping_mall_schema.sql](./gyp_portfolio_shoppingmall/database/portfolio_shopping_mall_schema.sql)
- **포트원 결제 테스트**: [포트원 개발자 문서](https://developers.portone.io/docs)
- **환경 설정 가이드**: 위의 '시작하기' 섹션 참조

### 🔗 관련 기술 문서
- **Spring Boot**: [공식 문서](https://spring.io/projects/spring-boot)
- **React**: [공식 문서](https://react.dev/)
- **Ant Design**: [컴포넌트 라이브러리](https://ant.design/)

### ⚠️ 주의사항
- **실제 결제 방지**: 포트원 테스트 키만 사용하세요
- **환경변수 보안**: `.env` 파일을 Git에 커밋하지 마세요
- **포트 확인**: 8080(백엔드), 3000(프론트엔드) 포트가 사용 가능한지 확인하세요

## 🔧 개발 과정

### 📋 핵심 개발 여정
- **프로젝트 규모**: 13개 테이블, 60여 개 API, 20여 개 프론트엔드 페이지
- **주요 기술적 도전**: 
  - 3단계 상품 구조 설계 (상품 마스터 → 상품 품목 → 재고 관리)
  - 동시성 제어 (낙관적 락 + 비관적 락 조합)
  - 포트원 결제 시스템 연동 (V1 API + 웹훅 처리)
  - 전화번호 AES-256 암호화 (PBKDF2 + AES)
  - JWT 이중 토큰 + Redis 블랙리스트 구현
  - 13개 테이블 트랜잭션 격리 수준 REPEATABLE_READ 적용
  - 모바일/데스크톱 반응형 디자인 구현

### 🛠️ 개발 단계별 하이라이트
1. **인프라 구축** 
   - AWS Lightsail + MariaDB + Redis 환경 구성
   - Cloudflare 도메인 + HTTPS 보안 적용
   - 개발/스테이징/운영 환경 분리

2. **백엔드 핵심 시스템**
   - Spring Security + JWT 이중 토큰 구조
   - 13개 테이블 3단계 상품 구조 설계
   - 60여 개 RESTful API 구현
   - 동시성 제어 (낙관적 락 + 비관적 락)

3. **결제 시스템 연동**
   - 포트원 V1 API 연동 및 웹훅 처리
   - 데스크톱 팝업 + 모바일 리디렉션 방식
   - 결제 상태 실시간 동기화

4. **프론트엔드 개발**
   - React 18 + Ant Design 5 기반
   - 20여 개 페이지 (사용자 + 관리자)
   - Context API 기반 상태 관리
   - 768px 기준 반응형 디자인

5. **보안 및 최적화**
   - 전화번호 AES-256 암호화 (PBKDF2)
   - API 로직 표준화 및 예외 처리
   - 환경변수 기반 보안 설정
   - 깃허브 배포 및 문서화

### 📚 상세 개발 과정
전체 개발 과정의 상세한 기록과 기술적 의사결정 과정은 아래 링크에서 확인하실 수 있습니다.

**👉 [상세 개발 과정 보기 (Notion)](https://mysterious-meteoroid-685.notion.site/23219636adbd8091b0e9c8f29cebba3a?source=copy_link)**

## 📞 연락처 ⚠️(미완성/검토 요망)

- **개발자**: 권용필
- **이메일**: srable6666@gmail.com
- **LinkedIn**: [링크]
- **포트폴리오**: [링크]

---
