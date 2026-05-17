# 🌌 몽중다로 (Dream Tarot) API 연동 가이드 및 명세서

이 문서는 프론트엔드(`client`)와 백엔드(`server`) 간의 매끄러운 API 연동을 위해 작성되었습니다.  
현재 백엔드의 모든 API는 완성되어 있으며, 프론트엔드에서 연동해야 할 화면과 기능을 연계하여 정리해 두었습니다.

> [!TIP]
> **로컬 프록시 설정 적용 완료**  
> 프론트엔드(`localhost:5173`) 환경에 프록시 설정이 되어 있어, API를 호출할 때는 풀 주소(`http://localhost:3000/api/...`) 대신 **`/api/...`**의 상대 경로로 직접 호출하시면 됩니다. (CORS 문제 없음)  
> API 문서는 개발 서버가 켜진 상태에서 **`http://localhost:5173/docs`**로 바로 접속하여 조회 및 실시간 테스트가 가능합니다.

---

## 🔑 1. 인증 (Auth) API

### 1-1. 테스트용 간편 로그인 (Mock Login)
- **메서드 & 경로:** `POST /api/auth/mock-login`
- **인증 필요 여부:** X (비로그인 가능)
- **요청 Body:**
  ```json
  {
    "email": "user@example.com",
    "name": "홍길동"
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "token": "ey...", // JWT 토큰 (이후 API 요청 시 Authorization 헤더에 Bearer 토큰으로 포함)
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "name": "홍길동",
      "jewels": 50 // 신규 유저에게 테스트용 50 쥬얼 지급
    }
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅
  - **프론트엔드 연동 가이드:** 
    - 소셜 로그인 구현 전까지, 메인 화면 진입 시 가상의 아이디로 세션을 생성할 수 있는 간편 로그인 화면을 띄울 때 사용합니다.
    - 받아온 `token`을 브라우저의 `localStorage` 등에 저장하고, 이후 인증이 필요한 API를 부를 때 Request Header에 **`Authorization: Bearer <token>`** 형식으로 넣어주어야 합니다.

---

## 👤 2. 유저 프로필 (User) API

### 2-1. 내 정보 조회 (Profile)
- **메서드 & 경로:** `GET /api/user/me`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **응답 (Response):**
  ```json
  {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "홍길동",
    "jewels": 40
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅
  - **프론트엔드 연동 가이드:**
    - 메인/정원 페이지 로드 시 로그인 상태를 확인하고 우측 상단의 **유저 메뉴(닉네임, 보유 쥬얼 잔액 등)**를 그릴 때 사용합니다.

### 2-2. 유저 상태(고민/기분) 실시간 업데이트
- **메서드 & 경로:** `PUT /api/user/status`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **요청 Body:** (선택적 필드, null 입력 시 초기화 가능)
  ```json
  {
    "recentWorry": "이직 고민과 앞으로의 진로 고민",
    "feeling": "의욕이 넘치나 약간의 긴장감"
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": {
      "recentWorry": "이직 고민과 앞으로의 진로 고민",
      "feeling": "의욕이 넘치나 약간의 긴장감"
    }
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅ (DB 영속 저장 완료)
  - **프론트엔드 연동 가이드:**
    - 마이페이지나 유저 상태 편집 창에서 유저의 최근 상황이나 고민을 설정할 수 있게 해주는 기능입니다.
    - 여기에 저장해 두면 꿈 입력 단계에서 매번 고민과 기분을 적어 보내지 않아도 백엔드 AI가 자동으로 이를 조회해 세션 해몽에 녹여줍니다!

### 2-3. 쥬얼 충전 (Mock Jewel Charge)
- **메서드 & 경로:** `POST /api/user/charge`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **요청 Body:**
  ```json
  {
    "amount": 100 // 충전할 쥬얼 개수
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "jewels": 140, // 충전 후 최종 보유 쥬얼
    "message": "100 jewels charged successfully (Mock)."
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅
  - **프론트엔드 연동 가이드:**
    - 결제 모듈 붙이기 전 단계이므로, 보유 쥬얼 잔액 옆에 `[충전]` 등의 테스트 버튼을 만들어 클릭 시 즉시 쥬얼이 늘어나도록 구성하여 심층 분석(10 쥬얼 차감) 기능을 쉽게 테스트할 수 있게 합니다.

---

## 🔮 3. 꿈 해몽 및 타로 (Dream) API

### 3-1. 1단계: 기본 꿈 해몽 (무료)
- **메서드 & 경로:** `POST /api/dream/interpret`
- **인증 필요 여부:** X (로그인 유저가 토큰을 넣으면 해당 유저 기록으로 저장됨, 비로그인 시도 허용)
- **요청 Body:**
  ```json
  {
    "content": "어젯밤 꿈에 거대한 고래가 하늘을 날아다니는 꿈을 꿨어요.",
    "userStatus": {
      "recentWorry": "이직 고민", // (선택)
      "feeling": "피곤함"          // (선택)
    }
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": {
      "summary": "한 줄 요약",
      "analysis": "무의식 분석 내용",
      "tarotAnalysis": [
        { "card": "The Fool (바보)", "status": "정방향", "meaning": "새로운 시작의 불안함", "advice": "도전해 보아라" },
        { "card": "The Tower (탑)", "status": "역방향", "meaning": "갑작스러운 변화와 경고", "advice": "무모한 변화는 조심하라" },
        { "card": "Death (죽음)", "status": "정방향", "meaning": "구시대의 종말과 새로운 부활", "advice": "과거를 정리하라" }
      ],
      "ohYok": { "food": 10, "wealth": 30, "sex": 5, "fame": 40, "sleep": 15 }, // 오욕 수치
      "chilJung": { "joy": 20, "anger": 5, "sorrow": 10, "fear": 30, "love": 15, "hate": 5, "desire": 15 }, // 칠정 수치
      "savedLog": {
        "id": "log_cuid_123", // 2단계 심층분석 시 반드시 필요한 기록 고유 ID
        "content": "어젯밤 꿈에..."
        // (DB에 저장된 로그 정보 객체)
      }
    }
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅
  - **프론트엔드 연동 가이드 & 중요 설계:**
    - 메인 페이지의 **꿈 입력창(`InputSection`)**에서 결과를 볼 때 사용합니다.
    - **⭐ 지능형 상태 기억 시스템 탑재:**
      *   만약 유저가 꿈 입력 시 기분이나 고민(`userStatus`)을 명시하여 보낸다면, 백엔드가 이를 **DB의 유저 프로필 상태에 즉시 영속 업데이트**하고 해몽에 반영합니다.
      *   만약 유저가 해당 입력칸을 생략하고 오직 꿈 내용만 보낸다면, 백엔드가 **DB에서 유저가 가장 최근에 기록해 둔 고민과 기분을 자동으로 찾아서 AI의 프레임워크 컨텍스트에 주입**해 줍니다. 
      *   덕분에 사용자는 매번 귀찮게 자신의 상황을 다시 적을 필요 없이, 마치 **나를 속속들이 다 알고 있는 나만의 전담 신비로운 역술가(Persona)**에게 주기적으로 상담받는 듯한 초개인화된 감성적 UX를 누릴 수 있습니다!
    - AI가 제안하는 2장의 타로 카드와 1장의 렌덤 타로 카드(총 3장)의 드로우 모션 및 오욕칠정 그래프 시각화를 이 API의 결과값으로 처리해 주시면 됩니다.

### 3-2. 2단계: 심층 분석 시작 (10 쥬얼 차감)
- **메서드 & 경로:** `POST /api/dream/start-deep-analysis`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **요청 Body:**
  ```json
  {
    "logId": "log_cuid_123" // 1단계 응답의 data.savedLog.id 값
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": {
      "id": "log_cuid_123",
      "type": "PREMIUM",
      "followUpQuestions": [
        "1. 꿈속에서 고래를 보았을 때 두려움이 컸소, 아니면 경외감이 컸소?",
        "2. 최근 직장이나 이직을 생각할 때 당신을 가장 억누르고 있는 무거운 짐은 무엇이오?"
      ]
    }
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅ (보유 쥬얼 검증 및 10 쥬얼 자동 차감)
  - **프론트엔드 연동 가이드:**
    - 1단계 기본 해몽 완료 페이지 하단에 **`[10 쥬얼을 소모하여 심층 분석 질문받기]`**와 같은 트리거 버튼을 누를 때 호출합니다.
    - 성공 시 받아온 `followUpQuestions`(배열)를 사용자 화면에 띄우고, 각 질문에 주관식 답변을 적을 수 있는 입력 폼을 표시합니다.

### 3-3. 3단계: 답변 최종 제출 및 완성 (무료)
- **메서드 & 경로:** `POST /api/dream/consolidate`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **요청 Body:**
  ```json
  {
    "logId": "log_cuid_123",
    "answers": {
      "1": "고래를 보며 무서움보다는 신기하고 설레는 감정이 컸습니다.",
      "2": "기존 직장의 틀에 박힌 반복적이고 보수적인 문화가 제일 답답합니다."
    }
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": {
      "id": "log_cuid_123",
      "finalReport": "조선 시대 역도사가 내려주는 기품 있고 날카로운 최종 처방전 리포트 본문... (마크다운 형식)"
    }
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅
  - **프론트엔드 연동 가이드:**
    - 추가 질문에 대해 유저가 작성한 답변을 백엔드로 제출하고 최종 "대단원 심층 해몽서"를 화면에 뿌릴 때 호출합니다.
    - 결과로 넘어오는 `finalReport`는 조선 시대 문체와 예리한 심리학적 분석이 통합된 긴 마크다운 텍스트이므로, 예쁜 마크다운 렌더러로 서서히 보여주는 애니메이션을 적용하면 아주 완성도 높은 몰입감을 제공할 수 있습니다.

---

## 🏡 4. 몽다정원 (Garden) & 도감 API

### 4-1. 내 과거 꿈 리스트 전체 조회 (정원 히스토리)
- **메서드 & 경로:** `GET /api/dream/my-logs`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "log_cuid_123",
        "content": "어젯밤 꿈에 고래가 날아...",
        "type": "PREMIUM",
        "summary": "구속에서 벗어나 날아오르고 싶은 야망",
        "createdAt": "2026-05-17T07:03:50.000Z",
        "tarotAnalysis": [ ... ]
      },
      {
        "id": "log_cuid_098",
        "content": "이빨이 다 빠지는 꿈",
        "type": "FREE",
        "summary": "가족 구성원의 사소한 변화나 걱정거리",
        "createdAt": "2026-05-10T12:00:00.000Z",
        "tarotAnalysis": [ ... ]
      }
    ]
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅ (이전의 취약했던 ID 노출 조회 방식에서 완벽한 본인 인증 조회 방식으로 수정 완료)
  - **프론트엔드 연동 가이드:**
    - **몽다정원 페이지 진입 시 가장 먼저 호출해야 하는 필수 API입니다.**
    - 이 리스트를 바탕으로 밤하늘에 별이나 식물, 구름 오브젝트로 과거 꿈 카드를 생성하여 뿌려주고, 오브젝트를 클릭하면 4-2 상세 조회 API를 호출하여 모달 형태로 상세 분석 보고서를 띄워주시면 됩니다.

### 4-2. 개별 꿈 상세 조회
- **메서드 & 경로:** `GET /api/dream/logs/:logId`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **파라미터:** `logId` (꿈 기록 cuid)
- **응답 (Response):**
  - 3-1, 3-2, 3-3의 모든 정보(초기 꿈, 오욕칠정 수치, 타로 분석 리스트, 추가 질문/답변, 최종 리포트)가 전부 들어있는 단일 객체를 반환합니다.
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅ (소유자 본인 검증 로직 내장)
  - **프론트엔드 연동 가이드:**
    - 몽다정원 리스트에서 오브젝트나 꿈 카드를 클릭했을 때 해당 해몽 결과를 상세 팝업/모달 형태로 다시 렌더링하기 위해 사용합니다.

### 4-3. 꿈 기록 카드 삭제
- **메서드 & 경로:** `DELETE /api/dream/logs/:logId`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **파라미터:** `logId` (꿈 기록 cuid)
- **응답 (Response):**
  ```json
  {
    "success": true,
    "message": "Dream log deleted successfully"
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅
  - **프론트엔드 연동 가이드:**
    - 몽다정원의 꿈 오브젝트 모달/상세창에서 **`[기록 삭제]`** 혹은 휴지통 버튼을 누를 때 호출합니다. 
    - 본인의 기록만 안전하게 삭제 가능하며, 삭제 완료 후 정원 화면의 해당 식물/별 오프젝트를 즉시 제거하고 리스트를 다시 동기화합니다.

### 4-4. 내가 여태까지 수집한 타로 도감 조회 (도감용)
- **메서드 & 경로:** `GET /api/dream/my-tarots`
- **인증 필요 여부:** O (JWT Bearer Token 헤더 필요)
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "The Fool (바보)",
        "drawnCount": 2, // 총 뽑은 횟수
        "lastDrawnAt": "2026-05-17T07:03:50.000Z", // 마지막으로 뽑은 날짜
        "details": {
          "status": "정방향",
          "meaning": "새로운 시작의 설렘",
          "advice": "주저하지 말고 나아가라"
        }
      },
      {
        "name": "The Tower (탑)",
        "drawnCount": 1,
        "lastDrawnAt": "2026-05-10T12:00:00.000Z",
        "details": {
          "status": "역방향",
          "meaning": "구조의 붕괴와 충격",
          "advice": "기초를 튼튼히 하라"
        }
      }
    ]
  }
  ```
- **연동 현황 & 안내:**
  - **백엔드:** 준비 완료 ✅
  - **프론트엔드 연동 가이드:**
    - 몽다정원 내의 **`[내가 뽑은 타로 도감]`** 메뉴나 탭을 제공할 때 사용합니다.
    - 총 78장의 카드 중 유저가 여태까지 수집(해몽에 등장)한 타로 목록을 가시적으로 뿌려주고, 아직 수집하지 못한 카드는 비활성화(어둡게 처리)하는 방식으로 감성적인 게이미피케이션(수집 요소)을 극대화할 수 있습니다!

---

## 👑 5. 관리자 백오피스 (Admin) API

이 API들은 서비스 관리 및 통계 모니터링, 고객 지원(CS), 그리고 타로 프롬프트 해몽 튜닝을 위한 **백오피스/어드민 대시보드 연동용** API 세트입니다.
*   **공통 보안 적용:** 어드민 보안을 위해 요청 헤더(Header)에 **`x-admin-key: <어드민-비밀키>`**를 반드시 포함해야 조회가 가능합니다.
*   **기본 비밀키 (Local 개발 시):** `super-secret-admin-key`

### 5-1. 어드민 대시보드 통계 지표 조회
- **메서드 & 경로:** `GET /api/admin/stats`
- **보안 설정:** Header에 `x-admin-key` 필수 포함
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 12,      // 서비스 가입 총 유저수
      "totalLogs": 24,       // 생성된 총 꿈 해몽 리포트 개수
      "freeLogs": 16,        // 무료 해몽 개수
      "premiumLogs": 8,      // 쥬얼 차감 유료 심층 해몽 개수
      "totalJewels": 840     // 시스템 내에 유통 중인 총 쥬얼량
    }
  }
  ```

### 5-2. 전체 가입 유저 목록 조회
- **메서드 & 경로:** `GET /api/admin/users`
- **보안 설정:** Header에 `x-admin-key` 필수 포함
- **응답 (Response):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cuid-user-1",
        "email": "jypark@enki.co.kr",
        "name": "박재영",
        "jewels": 50,
        "provider": "MOCK",
        "logCount": 3 // 해당 유저가 기록한 총 꿈 개수
      },
      ...
    ]
  }
  ```

### 5-3. 특정 유저 쥬얼 임의 지급/차감 (CS용)
- **메서드 & 경로:** `POST /api/admin/users/:userId/jewels`
- **보안 설정:** Header에 `x-admin-key` 필수 포함
- **요청 Body:**
  ```json
  {
    "amount": 20 // 더해주고 싶은 쥬얼량 (차감하고 싶을 땐 -20처럼 음수 전송)
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "userId": "cuid-user-1",
    "name": "박재영",
    "jewels": 70, // 반영 완료 후 최종 보유 쥬얼량
    "message": "Successfully adjusted user jewels from 50 to 70."
  }
  ```

### 5-4. 글로벌 꿈 해몽 히스토리 피드 조회 (감시/모니터링용)
- **메서드 & 경로:** `GET /api/admin/logs`
- **보안 설정:** Header에 `x-admin-key` 필수 포함
- **응답 (Response):**
  - 전체 회원의 꿈 해몽 리포트 원본 및 해몽 리스트를 생성 시간 역순(`createdAt: 'desc'`)으로 반환합니다. (어떤 회원이 어떤 해몽을 받았는지 전체 모니터링 가능)

### 5-5. 타로 사전 해석 데이터 튜닝 (프롬프트/해석 사전 수정)
- **메서드 & 경로:** `PUT /api/admin/tarots/:id`
- **파라미터:** `id` (타로 카드 ID, 1~78번 중 튜닝할 카드 번호)
- **보안 설정:** Header에 `x-admin-key` 필수 포함
- **요청 Body:** (수정할 필드만 부분 선택하여 전송 가능)
  ```json
  {
    "name": "The Fool (바보)",
    "keywords": "새로운 시작, 자유, 모험, 무모함",
    "keywordsRev": "불안정, 미련, 충동적, 정체",
    "meaningUpright": "아주 기품 넘치게 수정한 정방향 해석 텍스트...",
    "meaningReversed": "조선 시대 역술가 컨셉을 극대화한 역방향 지적 텍스트...",
    "practicalAdvice": "바보처럼 굴지 말고 현실을 냉엄하게 돌아보시오.",
    "orientalVibe": "동양 사상으로 빗댄 사주학적 비고 내용"
  }
  ```
- **응답 (Response):**
  ```json
  {
    "success": true,
    "message": "Tarot card updated successfully",
    "data": {
      "id": 1,
      "name": "The Fool (바보)",
      "category": "MAJOR",
      "keywords": "새로운 시작...",
      ... // 수정 완료 후 데이터베이스의 전체 타로 카드 행 반환
    }
  }
  ```
