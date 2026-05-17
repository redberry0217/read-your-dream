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

## 🛠️ 2. 향후 추가 및 연동해야 할 기능 목록

성공적인 서비스 출시를 위해 점진적으로 구현하면 좋을 추가 기능들입니다.

### [ ] 꿈 기록 삭제 기능 (`DELETE /api/dream/logs/:logId`)
*   **내용:** 유저가 몽다정원에서 자신의 특정 해몽 기록 카드를 삭제하고 싶을 때 삭제 요청을 처리해 주는 API 구현 및 프론트 UI 버튼 연계.

### [ ] 실제 소셜 로그인 (OAuth) 검증 API 연동
*   **내용:** 프론트엔드가 Google/Kakao SDK를 붙였을 때 받아온 인증 코드(또는 ID 토큰)를 백엔드 `/api/auth/social-login`으로 넘겨 안전하게 회원가입/로그인 처리하도록 전환.

### [ ] 백오피스 / 어드민 페이지용 모니터링 API
*   **내용:** 유저들이 어떤 꿈을 많이 꾸고 어떤 타로 카드가 많이 나오는지 통계를 내주는 어드민용 `/api/admin/stats` API와 고객 서비스(CS) 대응을 위한 쥬얼 수동 지급 API 설계.
