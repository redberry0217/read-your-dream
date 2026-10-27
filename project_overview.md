# 🌙 몽중다로 (Dream Tarot / 사주다로) 프로젝트 한눈에 보기 (`project_overview.md`)

> **목적:** 오랜만에 프로젝트를 다시 열거나 AI 에이전트에게 컨텍스트를 주입할 때, 코드베이스 전체를 다시 읽는 비용을 최소화하기 위한 **핵심 요약 노트**입니다.

---

## 1. 프로젝트 정체성 & 컨셉 (`philosophy.md` 요약)

- **서비스명:** 몽중다로 (구 사주다로, 패키지 네임 `@mjdr/*`)
- **핵심 도메인:** **꿈 해몽 + 78장 타로 카드 + 오욕칠정(五欲七情) 심리 수치화**
- **AI 페르소나:** *"16세기 조선의 신비로운 역술가(도사)이자, 시대를 앞서간 융(Jung) 학파 심리학자"*
  - 말투: `~하오`, `~이로다` 등 고풍스러운 도사 어조 + 날카로운 현실 직시
  - **No Toxic Positivity:** 뻔한 위로 금지, 특히 타로 **역방향**일 경우 유저가 회피하는 문제를 정면으로 지적(팩트 폭격)하고 **동사 중심의 구체적 행동 처방** 제시
- **역할 분담:**
  - **프론트엔드 (`apps/client`):** 여자친구 담당 (UI/UX, 단청 디자인 시스템, 인터랙션 및 API 연동)
  - **백엔드 (`apps/server`):** 본인 담당 (Fastify API, Prisma/Supabase DB, Gemini 프롬프트 엔지니어링, 인증/어드민)

---

## 2. 모노레포 디렉토리 구조 & 기술 스택

`pnpm workspace` 기반 모노레포 구조입니다. (루트 경로: `read-your-dream-develop/read-your-dream-develop`)

```text
read-your-dream-develop/
├── apps/
│   ├── client/              # [FE] React 19 + Vite 8 + Tailwind v4 + TanStack Query + React Router v7
│   └── server/              # [BE] Fastify 5 + Prisma 6 (PostgreSQL/Supabase) + Gemini AI + JWT/Swagger
├── packages/
│   └── shared-types/        # [공통] @mjdr/shared-types (DreamLog, OhYok, ChilJung, User 등 타입 공유)
├── philosophy.md            # AI 페르소나 및 오욕칠정 정의 가이드
├── api_spec.md              # 프론트-백엔드 API 연동 명세서
├── todo_list.md             # 배포(Render/Supabase), 무수면 핑, OAuth 출시 체크리스트
└── project_overview.md      # 현재 문서 (전체 요약본)
```

### 주요 실행 명령어 (루트 기준)
- 전체 동시 실행: `pnpm dev`
- 프론트만 실행: `pnpm dev:client` (`http://localhost:5173` — `/api`, `/docs`가 백엔드 `3000`번 포트로 자동 프록시됨)
- 서버만 실행: `pnpm dev:server` (`http://localhost:3000`, Swagger 문서: `/docs`)

---

## 3. 핵심 비즈니스 로직 & 재화 이코노미 (은자 & 금자 체계)

### 🪙 조선 화폐 이코노미 (은자 / 금자 이원화)
- **은자 (Silver - 활동·출석 화폐)**:
  - 일일 출석 체크: **+20 은자** (`POST /api/user/attendance`)
  - 꿈 / 기분 / 일기 기록: **+10 은자** (`PUT /api/user/status`, `POST /api/dream/interpret`)
  - 친구 소식 공유: **+10 은자** (`POST /api/user/share`)
  - 금자 환전: **100 은자 ➡️ 1 금자** (`POST /api/user/exchange`)
  - 소비처: 타로만 보기(5 은자), 타로+꿈 기본해몽(10 은자)
- **금자 (Gold - 프리미엄·추천 화폐)**:
  - 추천인 코드로 친구 가입 시: **초대한 친구 & 가입자 모두 각각 +3 금자**
  - 은자 100냥으로 1냥 환전
  - 인앱 결제 충전
  - 소비처: **심층 유도 질문 3개 + 최종 대단원 처방전 (2~3단계): 1 금자**
- **주간 밸런스**:
  - 매일 방문해 출석(20) + 기록(10)만 해도 하루 30은자 (주간 210은자).
  - 매일 기본 해몽(10)을 보더라도 140은자가 남아, 100은자를 1금자로 환전하여 **일주일에 1회는 무조건 무료로 심층 처방전을 획득**할 수 있도록 설계됨.

### 🎴 3단계 해몽 플로우
1. **사전 컨텍스트 & 감정 구름 태그 (관심사 분리 & 원클릭 선택 설계)**
   - 유저가 메인 화면에서 구름 감정 칩(예: `진로·시험`, `불안·초조`, `탈진·무기력` 등)을 최대 3개까지 가볍게 탭하면 `worryTags`로 함께 전송됩니다.
   - 마이페이지/상태창(`PUT /api/user/status`)에 저장된 **최근 고민(`recentWorry`)**과 **현재 기분(`feeling`)**이 있다면 해몽 프롬프트에 자동 주입되어 소름 돋는 통찰을 제공합니다.
2. **Step 1: 기본 꿈 해몽 (`POST /api/dream/interpret`) — 10 은자 (비로그인 무료 체험)**
   - 비로그인도 호출 가능(로그인 시 DB 자동 저장 및 꿈 기록 보상 +10 은자 적립).
   - 서버에서 DB의 78장 타로(`TarotCard`) 중 **랜덤 3장 + 정/역방향(50% 확률)** 추첨.
   - **(타로 78장 조선 로컬라이징 완성)** 영문/외래어 완전 배제:
     - Kings ➡️ `왕`, Queens ➡️ `왕비`, Knights ➡️ `장군`, Pages ➡️ `동자`, Pentacles ➡️ `엽전`.
     - Major: `3. 왕비`, `4. 왕` 등.
   - 3장에 **스프레드 시간축/심리축(제 1패: 과거/원인 ➡️ 제 2패: 현재/장애물 ➡️ 제 3패: 미래/처방)** 역할 부여.
   - **반환 데이터:** 한 줄 요약(`summary`), 무의식 분석(`analysis`), 타로 3장 해석(`tarotAnalysis`), 오욕칠정 수치(`ohYok`, `chilJung`), 감정 산출 이유(`emotionReasons`), 저장된 로그(`savedLog.id`).
3. **Step 2: 심층 분석 시작 (`POST /api/dream/start-deep-analysis`) — 1 금자 (테스트 기간 무료)**
   - 1차 꿈 내용과 분석을 바탕으로 무의식의 허점을 찌르는 **심층 유도 질문 3개(`followUpQuestions`)** 생성.
4. **Step 3: 최종 대단원 리포트 (`POST /api/dream/consolidate`) — 무료 (Step 2 완료자)**
   - 3개 질문에 대한 유저의 답변을 종합해 마크다운 형식의 **최종 처방전(`finalReport`)** 생성 및 저장.

---

## 4. 데이터베이스 모델 (`apps/server/prisma/schema.prisma`)

- **`User`**: `id (cuid)`, `email`, `name`, `nickname`, `silver` (은자, 기본 50), `gold` (금자, 기본 1), `jewels` (하위 호환용), `referralCode` (추천 코드), `referredBy`, `lastAttendance`, `lastRecordedAt`, `provider` (`GOOGLE` / `KAKAO` / `MOCK`), `providerId`
- **`UserStatus`**: `userId (1:1)`, `recentWorry`, `feeling`
- **`DreamLog`**: `id`, `userId`, `content`, `type` (`FREE`/`PREMIUM`), `ohYok (Json)`, `chilJung (Json)`, `tarotAnalysis (Json)`, `summary`, `analysis`, `followUpQuestions (Json)`, `followUpAnswers (Json)`, `finalReport`
- **`TarotCard`**: `id (0~77 / 78장 시드 데이터)`, `name`, `category`, `keywords`, `keywordsRev`, `meaningUpright`, `meaningReversed`, `practicalAdvice`, `orientalVibe`

---

## 5. 현재 개발 진행 현황 (백엔드 vs 프론트엔드)

### ✅ 백엔드 (`apps/server`) — **핵심 API 100% 구현 완료**
- **인증 (`/api/auth`):** 테스트용 간편 로그인(`POST /mock-login`), 프론트 테스트용 Mock OAuth(`GET /google`, `GET /kakao`) 구현 완료. (신규 유저 50 쥬얼 자동 지급)
- **유저 (`/api/user`):** 내 정보 조회(`GET /me`), 고민/기분 상태 저장(`PUT /status`), Mock 쥬얼 충전(`POST /charge`) 완료.
- **해몽 & 정원 (`/api/dream`):**
  - 3단계 해몽(`POST /interpret`, `POST /start-deep-analysis`, `POST /consolidate`)
  - 몽다정원 히스토리 목록(`GET /my-logs`), 단건 상세(`GET /logs/:logId`), 삭제(`DELETE /logs/:logId`)
  - 내가 뽑은 타로 도감 집계(`GET /my-tarots` — 뽑은 횟수 `drawnCount`, 최근 뽑은 날짜 등 자동 집계)
- **어드민 (`/api/admin`):** 헤더 `x-admin-key: super-secret-admin-key` 기반 통계(`/stats`), 유저 목록(`/users`), CS용 쥬얼 수동 가감(`/users/:userId/jewels`), 전체 로그 모니터링(`/logs`), 타로 DB 실시간 튜닝(`PUT /tarots/:id`) 완료.
- **인프라 대비:** `/health` 엔드포인트에서 `SELECT 1` 실행 (Supabase 수면 방지용).

### 🎨 프론트엔드 (`apps/client`) — **디자인 시스템 & 기본 골격 완료, 상세 화면 연동 진행 중**
- **디자인 시스템 (`src/index.css` & `src/shared/ui`):**
  - **단청 컬러 팔레트** 구축 완료: `seokganju`(석간주), `guncheong`(군청), `yangrok`(양록), `podo`(포도), `ink`(먹색), `surface`/`stroke`
  - 폰트: `Gowun Dodum` (고운돋움) & `Geist Variable`
  - 공통 UI 컴포넌트(`Button`, `Textarea`, `Card`, `Input`, `Select` 등) 및 레이아웃(`NavBar`, `UserMenu`, `Footer`) 구성 완료.
- **인증 연동 (`src/hooks/auth`, `src/pages/auth`):**
  - `localStorage`의 `auth_token` 기반 `AuthProvider` 구현 완료.
  - `/login` 페이지에서 Google/Kakao 버튼 클릭 시 `/api/auth/google|kakao` 호출 후 토큰 저장 및 메인 이동 작동 중.
- **페이지별 상태:**
  - **메인 페이지 (`src/pages/main`):** `InputSection`(꿈 입력 + `useInterpret` 훅 호출), `StorySection`, `FlowSection` 배치 완료.
    - *주의/할 일:* 현재 `main-input-section.tsx`에서 `useInterpret` 성공 시 `console.log(data)`만 찍고 있어, **결과 페이지(`/result`)로 데이터를 넘기며 이동하거나 결과 모달/화면을 렌더링하는 작업**이 필요함!
  - **결과 페이지 (`src/pages/result/page.tsx`):** 현재 `<div>ResultPage</div>` 스켈레톤 상태 (라우터 등록 및 타로 카드 드로우/오욕칠정 차트/심층 질문 UI 구현 필요).
  - **몽다정원 (`src/pages/garden`):** 밤하늘 배경 + 구름 애니메이션 + 반짝이는 별(`Sparkle`) + 달 캔버스(`GardenCanvas`) UI 구현 완료.
    - *할 일:* `GET /api/dream/my-logs` 및 `GET /api/dream/my-tarots`를 연동해 실제 과거 꿈 오브젝트와 타로 도감을 캔버스 위에 표시하고 클릭 시 상세/삭제 모달 띄우기.
  - **유저 메뉴 (`src/shared/layout/UserMenu.tsx`):** 로그인 상태 표시는 되나, `GET /api/user/me` 연동(실제 보유 쥬얼 표시), `정보수정(고민/기분 설정 모달 — PUT /api/user/status)`, `쥬얼 충전(POST /api/user/charge)` 연결 필요.

---

## 6. 다음에 작업할 때 바로 보는 우선순위 체크리스트

### 👩‍💻 프론트엔드 (여자친구분 작업 포인트)
1. **해몽 결과 화면 (`ResultPage`) 구현 & 라우팅 연결**
   - `App.tsx`에 `/result` (또는 `/result/:logId`) 라우트 추가
   - `main-input-section.tsx`의 `onSuccess`에서 결과 화면으로 이동 연결
   - 타로 3장 정/역방향 표시, 오욕칠정 그래프, `[10 쥬얼로 심층 분석 시작]`(`POST /api/dream/start-deep-analysis`) -> 질문 3개 답변 폼 -> 최종 리포트(`POST /api/dream/consolidate`) UI 연결
2. **몽다정원 (`GardenPage`) API 연동**
   - `GET /api/dream/my-logs`로 꿈 기록을 별/구름 오브젝트에 매핑, 클릭 시 상세 조회(`GET /api/dream/logs/:logId`) 및 삭제(`DELETE`)
   - `GET /api/dream/my-tarots`로 78장 타로 수집 도감 탭/모달 구성
3. **유저 상태(고민/기분) & 쥬얼 UI 연결**
   - `UserMenu`에서 고민/기분 입력 모달(`PUT /api/user/status`) 및 보유 쥬얼 표시/테스트 충전(`POST /api/user/charge`)

### 👨‍💻 백엔드 (본인 작업 포인트 — `todo_list.md` 참조)
1. **실제 소셜 로그인(Google / Kakao OAuth) & Refresh Token 적용**
   - 현재 테스트 편의를 위해 Mock OAuth로 되어 있는 `/api/auth/google`, `/api/auth/kakao`를 실제 OAuth 인가 코드 방식으로 전환하거나 Supabase Auth 도입
2. **배포 & 무수면(No-Sleep) 세팅**
   - Render/Railway 배포 + Supabase DB `prisma db push` 및 `prisma/seed.ts`(78장 타로 데이터) 시딩
   - UptimeRobot으로 `/health` 10~15분 주기 핑 설정

---

## 7. 참고 문서 링크
- [철학 및 페르소나 가이드 (`philosophy.md`)](./philosophy.md)
- [API 상세 명세서 (`api_spec.md`)](./api_spec.md)
- [배포 및 출시 TODO (`todo_list.md`)](./todo_list.md)

---

## 8. 해몽 및 타로 퀄리티 고도화 내역 (2026-10-22 업그레이드)

1. **타로 78장 메타데이터 전면 구축 및 DB 시딩 ([tarot-metadata.json](./apps/server/data/tarot-metadata.json))**
   - 76장이 더미 텍스트였던 문제를 해결하고, 78장 전체 카드에 대해 **정/역방향 키워드, 조선 역술가 해설, 동사 중심의 현실 처방전, 음양오행(木火土金水) 비유**를 전면 구축하여 SQLite `dev.db`에 시딩 완료.
2. **3장 카드 스프레드 시간축/심리축(Spread Roles) 부여**
   - 단순 나열식 해석을 배제하고, 3장에 명확한 역할을 부여하여 유기적인 스토리텔링을 전개:
     - **제 1패 (과거/원인)** — 무의식에 잠재된 근원적 결핍과 꿈의 동기
     - **제 2패 (현재/장애물)** — 현실에서 마주하거나 회피 중인 결핍과 징조
     - **제 3패 (미래/처방)** — 앞으로 닥칠 흐름과 오늘 당장 실행해야 할 단호한 행동 수칙
3. **꿈 상징물 분해(Symbolic Decomposition) 파이프라인 도입**
   - 유저의 꿈 일기에서 핵심 상징물 2~3개(동물, 사물, 행동, 배경 등)를 핀포인트로 추출하여 심리학적 원형을 밝히고 타로 패와 결합.
4. **Gemini System Instruction 독립 및 Temperature 0.75 튜닝 ([gemini.ts](./apps/server/src/lib/gemini.ts))**
   - 16세기 조선 역술가 + 융 심리학자 페르소나를 `systemInstruction`으로 분리하여 고풍스러운 문체와 서늘한 톤앤매너 유지력 100% 확보.
5. **오욕칠정 산출 근거(`emotionReasons`) 추가**
   - 12가지 감정 수치와 더불어 가장 지배적인 욕망과 감정이 왜 그 점수가 나왔는지 꿈의 상징을 근거로 밝혀 신뢰도 극대화.
6. **프론트엔드 결과 화면([ResultPage](./apps/client/src/pages/result/page.tsx)) 실시간 반영**
   - 스프레드 포지션 뱃지(`제 1패`, `제 2패`, `제 3패`) 및 도사의 심리 수치 근거 카드 UI 반영 완료.

