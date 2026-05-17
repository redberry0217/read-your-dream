# 📝 몽중다로 (Dream Tarot) 출시 & 운영 TODO 리스트

이 문서는 추후 서버 배포 및 운영 단계에서 놓치지 않고 챙겨야 할 필수 작업들과 향후 추가할 유용한 기능들을 모아둔 메모 패드입니다.

---

## 🚀 1. 배포 및 영구 무수면(No-Sleep) 세팅 가이드 (최우선)

백엔드 서버를 Render, Railway 등으로 무료 배포하고 수파베이스 무료 데이터베이스가 잠드는 것을 영구적으로 막기 위해 다음 과정을 완료해야 합니다.

### [ ] Step 1: 백엔드 서버 호스팅 배포
*   추천 플랫폼: **Render.com** (무료 웹 서비스) 또는 **Railway.app** (매월 5달러 크레딧 무료 제공)
*   배포 시 아래의 환경 변수(Environment Variables)들을 플랫폼 대시보드에 등록합니다:
    *   `DATABASE_URL`: 수파베이스 풀러 주소 (`postgresql://...:5432/...`)
    *   `GEMINI_API_KEY`: 구글 제미나이 API 키
    *   `JWT_SECRET`: 안전하고 랜덤한 임의의 비밀 키 문자열 (예: `super-secret-key-12345!`)

### [ ] Step 2: 데이터베이스 스키마 및 타로 데이터 주입
*   배포된 환경 또는 로컬에서 수파베이스 실서버를 바라보게 한 상태로 아래 명령어를 실행하여 테이블과 카드를 주입합니다:
    ```bash
    # 1. 수파베이스 DB에 테이블 구조 생성
    pnpm --filter server exec prisma db push

    # 2. 78장 타로 메타데이터 DB 시딩
    pnpm --filter server exec tsx prisma/seed.ts
    ```

### [ ] Step 3: 무료 핑(Ping) 서비스를 활용한 무수면 세팅
*   **배포된 서버의 헬스체크 주소 확인:**
    *   `https://[배포한-백엔드-주소].onrender.com/health` 경로가 정상 작동하는지 브라우저에서 확인합니다. (성공 시 `{ "status": "ok", "db": "healthy" }` 출력됨)
*   **모니터링 봇 등록:**
    *   **[UptimeRobot](https://uptimerobot.com/)** 또는 **[Cron-job.org](https://cron-job.org/)**에 무료 가입합니다.
    *   `Add New Monitor` 클릭 후 다음 정보를 입력합니다:
        *   **Monitor Type:** HTTP(s)
        *   **Friendly Name:** 몽중다로 헬스체크
        *   **URL:** `https://[배포한-백엔드-주소].onrender.com/health`
        *   **Monitoring Interval:** 10분 또는 15분
    *   **효과:** 이 봇이 10~15분 간격으로 계속 헬스체크 주소를 찔러주어, 무료 호스팅 서버와 수파베이스 데이터베이스가 365일 영구적으로 잠들지 않고 가동됩니다!

---

## 🛠️ 2. 완료된 핵심 기능 및 API (최근 반영)

최근 업데이트를 통해 서비스의 뼈대를 이루는 필수 어드민/CS 기능 및 사용자 제어 기능이 모두 완성되었습니다.

### [x] 꿈 기록 삭제 기능 (`DELETE /api/dream/logs/:logId`)
*   **완료:** 유저가 몽다정원의 꿈 오브젝트나 상세 보기 모달에서 자신의 해몽 기록 카드를 안전하게 삭제할 수 있는 API를 반영했습니다. (소유권 검증 및 DB 안전 연동 완료)

### [x] 백오피스 / 어드민 페이지용 모니터링 API 세트
*   **완료:** 총 유저 수, 무료/유료 해몽 비율, 유통 쥬얼 등 통계를 내주는 어드민 `/api/admin/stats` API와 전체 가입 유저 목록 및 해몽 내역 모니터링, 그리고 CS 대응을 위한 **쥬얼 수동 가감 API** 및 타로 사전 실시간 수정 API를 완성했습니다. (`x-admin-key` 헤더 보안 적용)

---

## 🔑 3. 소셜 로그인 및 토큰 관리 출시 준비 (최종 완성 단계)

실제 프로덕션 런칭을 위해 소셜 로그인(구글/카카오)과 안전한 토큰 만료/갱신(Refresh) 정책을 도입할 때 해결해야 할 단계별 체크리스트입니다.

### [ ] Step 1: 소셜 로그인 아키텍처 의사결정
*   **방안 A: Supabase Auth 내장 기능 활용 (추천)**
    *   장점: 구글/카카오 SDK 연동 시, 수파베이스가 세션/Access/Refresh 토큰 갱신을 100% 대행하므로 백엔드 구현 공수가 거의 0에 수렴함.
*   **방안 B: 자체 JWT 이중화 (Access/Refresh) 직접 구현**
    *   장점: 외부 벤더 종속 없이 완전한 커스텀 백엔드 토큰 제어가 가능함.

### [ ] Step 2: 카카오 개발자 센터 (Kakao Developers) 등록 및 설정
*   **카카오 개발자 계정 생성:** [Kakao Developers](https://developers.kakao.com/) 로그인 후 내 애플리케이션 추가.
*   **플랫폼 등록:** `앱 설정` ➡️ `플랫폼` ➡️ `Web 플랫폼`에 아래의 도메인들을 등록합니다:
    *   로컬 개발 환경: `http://localhost:5173`
    *   실서버 배포 환경: `https://[서비스-배포-도메인]`
*   **카카오 로그인 활성화:** `제품 설정` ➡️ `카카오 로그인`에서 상태를 **`ON`**으로 변경.
*   **Redirect URI 등록:** 인가 코드를 받아올 리디렉션 경로를 등록합니다:
    *   예: `http://localhost:5173/auth/kakao/callback` (프론트 리다이렉트 처리용)
*   **동의항목 설정:** 유저 정보 조회를 위해 `닉네임`, `카카오계정(이메일)` 필수/선택 동의를 활성화합니다.
*   **환경 변수 저장:** 앱 키 중 **`REST API 키`**와 `보안` 탭의 `Client Secret` 문자열을 복사하여 백엔드 `.env` 파일에 기록합니다.

### [ ] Step 3: 구글 클라우드 콘솔 (Google Cloud Console) 등록 및 설정
*   **프로젝트 생성:** [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트를 생성합니다.
*   **OAuth 동의 화면 설정:** `API 및 서비스` ➡️ `OAuth 동의 화면`에서 User Type을 **External(외부)**로 선택하고, 서비스 이름과 이메일을 등록합니다.
*   **OAuth 클라이언트 ID 발급:** `사용자 인증 정보` ➡️ `사용자 인증 정보 만들기` ➡️ `OAuth 클라이언트 ID`를 생성합니다:
    *   **애플리케이션 유형:** 웹 애플리케이션
    *   **승인된 자바스크립트 원본:** `http://localhost:5173` 및 배포 도메인 등록.
    *   **승인된 리디렉션 URI:** 구글 로그인 완료 후 리디렉트될 콜백 경로 주소를 입력합니다 (예: `http://localhost:5173/auth/google/callback`).
*   **환경 변수 저장:** 발급된 **`클라이언트 ID (Client ID)`**와 **`클라이언트 보안 비밀번호 (Client Secret)`**를 복사하여 백엔드 `.env` 파일에 기록합니다.

### [ ] Step 4: JWT 토큰 이중화 및 리프레시(Refresh) 정책 구현
*   **Access Token 만료 기간 적용:** 만료 시간을 약 30분~1시간으로 짧게 설정하여 탈취 위험을 최소화합니다:
    *   `app.jwt.sign({ id, email }, { expiresIn: '1h' })`
*   **Refresh Token 발급 및 쿠키 저장:** 만료 시간이 긴(예: 14일) 리프레시 토큰을 발급하여 브라우저 JS가 접근하지 못하는 **`HttpOnly; Secure; SameSite=Lax` 쿠키**로 전송합니다.
*   **토큰 갱신 API (`POST /api/auth/refresh`) 신설:**
    *   클라이언트가 헤더에 담긴 Access Token 만료(401)를 감지하면, 자동으로 쿠키 속 Refresh Token을 백엔드로 보내어 새 Access Token을 안전하게 재발급받는 흐름(Refresh Flow)을 연동합니다.

