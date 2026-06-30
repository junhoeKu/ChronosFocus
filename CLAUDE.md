# CLAUDE.md - ChronosFocus

## 프로젝트 개요

> **생체 리듬(크로노타입) 기반 개인 맞춤형 생산성 관리 웹앱**
> 하루를 7개 시간대 슬롯으로 나누고, 시간대별 집중도에 맞춰 `고등 작업`/`단순 작업`을 최적의 시간에 배치 추천한다. Vanilla HTML/CSS/JS SPA + LocalStorage 기반. 현재 데모를 **MVP 수준**으로 끌어올리는 단계이며, 상세 범위는 [MVP_구현_계획.md](docs/MVP_구현_계획.md)를 따른다.

---

## 작업 원칙

### 1. 논의 → 설계 → 계획 → 구현 → 리뷰

코드를 먼저 작성하지 않는다. 반드시 이 순서를 따른다:

1. **논의**: 요구사항을 정확히 이해하고 질문한다
2. **설계**: 2-3개 접근법을 비교하고 추천한다
3. **계획**: 구체적인 파일 목록과 변경 사항을 문서화한다
4. **구현**: 계획대로만 구현한다. 범위를 벗어나지 않는다
5. **리뷰**: 구현 결과를 spec(MVP_구현_계획.md)과 대조하여 검증한다
6. **갱신**: 커밋 및 코드 구현이 완료되면 해당 부분을 꼼꼼하게 단계별로 메모리에 반영 및 갱신하세요.

이 사이클을 충분히 반복한다. 급하다고 건너뛰지 않는다.

### 2. 기존 코드의 일관성을 지킨다

- 새 코드는 기존 패턴을 따른다. 더 나은 패턴이 있어도 혼자 바꾸지 않는다
- 폴더 구조, 네이밍, 모듈 스타일을 기존 코드에서 먼저 확인한다
- "개선"이라는 이름으로 기존 컨벤션을 무시하지 않는다
- 각 JS 파일은 **IIFE로 감싼 단일 전역 네임스페이스**를 노출한다 (`DB`, `ALGO`, `App`, `ThemeManager`, `OnboardingModule`, `TasksModule`, `DashboardModule`, `CheckinModule`, `NotificationManager`, `Toast`). 새 모듈도 이 패턴을 따른다
- 모듈 간 의존은 전역 네임스페이스 호출로만 한다. 빌드 도구/번들러/import 구문을 도입하지 않는다
- 시간 관련 값은 모두 **로컬 시간(브라우저 기준)**으로 통일한다. 날짜 키는 `YYYY-MM-DD`(`_today()`), 타임스탬프는 ISO 문자열(`_now()`)을 쓴다. 슬롯 계산(`ALGO.getCurrentSlot`)과 저장 포맷을 섞지 말고 일관되게 맞춘다

### 3. 현재 기술 스택을 유지한다 (프레임워크 도입 금지)

- MVP 1차는 **Vanilla HTML/CSS/JavaScript + LocalStorage**로만 진행한다. React/Next/Vue/Firebase/Supabase/React Native를 붙이지 않는다 (MVP_구현_계획.md §2.2)
- 외부 라이브러리는 현재 CDN으로 로드되는 것(Chart.js, Font Awesome)만 사용한다. 새 의존성을 임의로 추가하지 않는다
- 빌드 단계 없이 정적 파일을 브라우저가 직접 로드한다. 트랜스파일·번들 과정을 만들지 않는다
- **도메인 로직과 화면을 분리한다**: `algorithm.js`는 DOM을 조작하지 않고, DB를 직접 저장하지 않으며, 입력을 받아 결과만 반환한다 (순수 함수 유지)
- 데이터 저장/조회는 반드시 `DB` 모듈을 통한다. `localStorage`를 직접 호출하지 않는다 (초기화 등 예외는 명시)

### 4. 확인 없이 추측하지 않는다

- 파일을 수정하기 전에 반드시 Read로 읽는다
- 모듈 API를 사용할 때 기억에 의존하지 않고 실제 코드를 확인한다 (`DB.Tasks.add` 시그니처, `ALGO` export 등)
- 브라우저 콘솔 에러, LocalStorage 실제 값, grep 결과 등 실제 증거를 기반으로 판단한다
- 스크린샷 분석 시 보이는 그대로를 말한다. 추측으로 "정상"이라 하지 않는다
- 추천은 rule-based다. "AI 추천"이 아니라 **"리듬 기반 추천"**으로 표현한다 (MVP_구현_계획.md §7.5)

### 5. git commit 규칙

- 리뷰를 통과한 구현에 대해서 commit할 것인지 사용자에게 물어봐라.
- commit message는 angular convention을 따른다. (`feat(db): ...`, `fix(checkin): ...`, `chore(app): ...`)
- 파일 수정 전 반드시 Read로 현재 내용 확인
- 구조 변경 시 "복사 → 전환 → 삭제" 순서 (기존 기능 유지)
- 기능 단위 브랜치를 사용한다 (`feat/db-stabilization`, `feat/algorithm-mvp` 등, MVP_구현_계획.md §11)

### 6. Issue 생성 규칙

- 한국어로 작성한다.
- 해결 방법보다 "문제"를 먼저 설명한다
- 하나의 Issue는 하나의 문제만 다룬다

### 7. Pull Request 작성 규칙

- 하나의 Issue는 하나 또는 다수의 PR을 통해 해결한다.
- PR 본문에 해결하고자 하는 Issue를 포함한다.
- 기능 추가와 리팩토링을 함께 하지 않는다.
- PR 제목은 angular convention을 따른다.
- PR 본문에는 아래 항목들을 반드시 포함한다:
  - `## 무엇을 변경했는가`
  - `## 왜 변경했는가`
  - `## 현재 PR에서 고려되지 않은 부분`
  - `## 테스트 방법`
  - `## Follow-ups`

---

## 모듈/파일 규칙

```
1 JS 파일 = 1 IIFE = 1 전역 네임스페이스
도메인 로직(algorithm.js) = 순수 함수, DOM/DB 미접근
데이터 계층(db.js) = LocalStorage 접근 단일 창구
화면 모듈(*.js) = DB·ALGO 호출 + DOM 렌더링
CSS = 역할별 파일 분리 (theme/components/페이지별)
```

---

### 파일 구조 (현재)

```
ChronosFocus/
├── index.html              ← SPA 진입점. 모든 CSS/JS 로드 + 페이지 컨테이너
├── css/
│   ├── theme.css           ← 시간대별 다이나믹 테마 (7개 슬롯)
│   ├── components.css       ← 글로벌 컴포넌트 (카드/버튼/모달/Toast)
│   ├── onboarding.css       ← 온보딩 화면
│   ├── dashboard.css        ← 대시보드 화면
│   └── tasks.css            ← 할 일 관련 화면
└── js/
    ├── db.js                ← ★ LocalStorage 데이터 계층 (User/Tasks/Patterns/Checkins/Feedback)
    ├── algorithm.js         ← ★ 핵심 도메인 로직 (추천/스케줄링/유형분석, 순수 함수)
    ├── theme.js             ← 다이나믹 테마 매니저
    ├── onboarding.js        ← 온보딩 UI + 크로노타입 결과
    ├── dashboard.js         ← 타임라인 대시보드 + Chart.js
    ├── tasks.js             ← 투두 이원화(고등/단순) + 추천 슬롯
    ├── checkin.js           ← 집중도 체크인 + 일일 피드백
    ├── profile.js           ← 프로필/통계/점수 수정/초기화
    ├── notifications.js     ← 알림 + Toast + Modal
    └── app.js               ← 앱 컨트롤러 (스플래시/라우팅/네비게이션)
```

> 문서는 `docs/`에 모은다 (MVP_구현_계획.md §1.3). `README.md`만 관례에 따라 루트에 둔다.

---

## 아키텍처 핵심 규칙

### 데이터 모델 (LocalStorage 키)

| 키 | 모듈 | 내용 |
|------|------|------|
| `cf_user` | `DB.User` | 크로노타입, 기상/취침, `focus_scores`(JSON 문자열) |
| `cf_tasks` | `DB.Tasks` | 할 일 (`category` high/low, `priority`, `recommended_slot`, `actual_slot`) |
| `cf_patterns` | `DB.Patterns` | 시간대별 집중도 학습 데이터 (`source`: onboarding/checkin/feedback/manual) |
| `cf_checkins` | `DB.Checkins` | 집중도 체크인 원본 (1~5점) |
| `cf_feedback` | `DB.Feedback` | 일일 만족도/추천 준수 |

### 7개 시간대 슬롯 (`ALGO.SLOTS`)

`dawn(0-5)` · `morning(5-9)` · `forenoon(9-12)` · `lunch(12-14)` · `afternoon(14-18)` · `evening(18-21)` · `night(21-24)`

### 5개 크로노타입 (`ALGO.CHRONOTYPES`)

`owl 🦉` · `eagle 🦅` · `lion 🦁` · `bear 🐻` · `dolphin 🐬` — 각자 슬롯별 기본 `scores`를 가진다

### 핵심 함수 (`algorithm.js` export)

| 함수 | 역할 |
|------|------|
| `ALGO.getCurrentSlot()` | 현재 시간 → 슬롯 ID |
| `ALGO.getFocusLabel(score)` | 점수 → peak/high/medium/low/rest |
| `ALGO.getRecommendation(tasks, scores)` | 현재 슬롯 기준 추천 작업 Top 3 |
| `ALGO.smartSchedule(tasks, scores)` | 작업별 `recommended_slot` 배치 |
| `ALGO.analyzeOnboarding(answers)` | 온보딩 응답 → 크로노타입 + 기본 점수 |
| `ALGO.DEFAULT_FOCUS_SCORES()` | 슬롯별 기본 집중도 |

### 추천 규칙

```
score >= 3.5  → 고등 작업(high) 추천
2.5~3.5       → 긴급 우선, 없으면 자유
score < 2.5   → 단순 작업(low) 추천
```

집중도 평균 = 실측 체크인 70% + 크로노타입 기본값 30% (슬롯별 기록 3개 이상일 때)

### 절대 하지 말 것

- `algorithm.js`에서 DOM 조작이나 `localStorage`/`DB` 직접 저장 — 순수 함수 유지
- `localStorage`를 모듈 밖에서 직접 호출 — 반드시 `DB`를 경유
- MVP 범위 밖 기능 임의 추가 (로그인/캘린더/LLM/모바일 포팅/Pomodoro 등, MVP_구현_계획.md §3.2)
- rule-based 추천을 "AI"로 표기
- 사용자가 입력하지 않은 데모 작업 자동 생성 (production)
- 프레임워크/번들러/빌드 단계 도입

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Vanilla HTML/CSS/JavaScript (SPA, IIFE 모듈) |
| 저장소 | LocalStorage (클라이언트 퍼시스턴스) |
| 데이터 시각화 | Chart.js 4.4 (CDN) |
| 아이콘 | Font Awesome 6.4 (CDN) |
| 알림 | Web Notification API |
| 배포 | GitHub Pages / Vercel Static Hosting |

---

## 테스트 & 검증

수동 검증 중심이다 (테스트 프레임워크 없음, MVP_구현_계획.md §10).

```bash
# 로컬 실행 (택1)
python3 -m http.server 8000        # → http://localhost:8000
# 또는 VS Code Live Server 확장
```

```js
// 브라우저 DevTools Console 검증
DB.User.get();
DB.Tasks.getToday();
DB.Patterns.getAverageScores();
DB.Checkins.getToday();
ALGO.getCurrentSlot();
ALGO.getRecommendation(DB.Tasks.getToday(), DB.Patterns.getAverageScores());
```

배포 전 기준: 콘솔 에러 0개 · 새로고침 후 데이터 유지 · LocalStorage 삭제 후 온보딩 정상 시작 · 모바일 390px 깨짐 없음.

---

## Review guidelines

- Always write in Korean.
- Do not log PII or secrets.
- LocalStorage 스키마 일관성과 저장 실패(파싱 오류/용량 초과) 방어를 확인한다.
- 추천 로직이 DOM/DB에 의존하지 않는지 확인한다.
- Point out unnecessary or redundant code.
- Prefer maintainable code. (나중에 백엔드 DB로 옮길 수 있는 구조 유지)

---

## 참고 링크

- MVP 구현 계획: [docs/MVP_구현_계획.md](docs/MVP_구현_계획.md)
- 앱 개요: [README.md](README.md)
- Chart.js 문서: https://www.chartjs.org/docs/latest/
- MDN Web Storage API: https://developer.mozilla.org/docs/Web/API/Web_Storage_API
