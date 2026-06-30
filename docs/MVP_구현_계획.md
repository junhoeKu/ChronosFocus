# ChronosFocus MVP 상세 구현 계획서

> 생체 리듬 기반 생산성 관리 앱 `ChronosFocus`를 데모 수준에서 실제 MVP 수준으로 발전시키기 위한 개발 계획서입니다.  
> 이 문서는 개발자가 바로 구현 순서를 잡을 수 있도록 **파일 단위, 기능 단위, 코드 단위, 개발 도구, 구현 이유, 테스트 기준**까지 포함합니다.

---

## 0. MVP 한 줄 정의

ChronosFocus MVP는 사용자가 자신의 집중 리듬을 온보딩으로 설정하고, 하루 중 실제 집중도를 체크인으로 기록하며, 할 일을 `고등 작업`과 `단순 작업`으로 나누어 가장 적절한 시간대에 배치받는 개인 맞춤형 생산성 추천 앱이다.

---

## 1. 현재 상태 요약

### 1.1 현재 구현된 구조

현재 앱은 `Vanilla HTML/CSS/JavaScript` 기반 SPA입니다.

```txt
index.html
├── css/
│   ├── theme.css
│   ├── components.css
│   ├── onboarding.css
│   ├── dashboard.css
│   └── tasks.css
└── js/
    ├── db.js
    ├── algorithm.js
    ├── theme.js
    ├── onboarding.js
    ├── dashboard.js
    ├── tasks.js
    ├── checkin.js
    ├── profile.js
    ├── notifications.js
    └── app.js
```

### 1.2 현재 핵심 기능

| 영역 | 현재 상태 | MVP에서 처리 방향 |
|---|---|---|
| 온보딩 | 6개 질문 기반 크로노타입 분석 | 유지하되 설명/저장 구조 안정화 |
| 대시보드 | 현재 시간대, 집중도, 추천 메시지, 차트 표시 | MVP 메인 화면으로 유지 |
| 할 일 | 고등/단순 작업, 우선순위, 예상 시간 | MVP 핵심 기능으로 강화 |
| 체크인 | 집중도 1~5점 기록 | 개인화 핵심 데이터로 강화 |
| 추천 알고리즘 | rule-based 추천 | MVP에서는 rule-based 유지 |
| 저장소 | LocalStorage | MVP 1차는 유지, 구조만 DB 전환 가능하게 정리 |
| 알림 | Web Notification API | 후순위, 최소 기능만 유지 |
| 테마 | 시간대별 다이나믹 테마 | 유지하되 핵심 개발 우선순위는 낮음 |

---

## 2. MVP 개발 원칙

### 2.1 새 기능보다 흐름 완성 우선

MVP에서 가장 중요한 것은 기능 개수가 아니라 아래 흐름이 끊기지 않는 것입니다.

```txt
온보딩 완료
→ 집중도 기본 프로필 생성
→ 할 일 추가
→ 작업 유형/우선순위 저장
→ 추천 시간대 계산
→ 대시보드 표시
→ 체크인 기록
→ 집중도 점수 보정
→ 다음 추천에 반영
```

### 2.2 기술 스택은 현재 구조 유지

MVP 1차에서는 React, Next.js, Firebase, Supabase, React Native를 바로 붙이지 않습니다.

이유는 다음과 같습니다.

1. 현재 데모가 이미 Vanilla SPA로 동작한다.
2. MVP 핵심은 UI 프레임워크가 아니라 추천 로직과 데이터 흐름이다.
3. 초기에 기술 전환을 하면 기능 검증보다 마이그레이션 비용이 커진다.
4. LocalStorage 기반으로도 개인화 추천 가설을 충분히 검증할 수 있다.

따라서 1차 MVP는 다음 기술로 진행합니다.

| 구분 | 사용 기술 | 이유 |
|---|---|---|
| 화면 | HTML/CSS/Vanilla JS | 현재 코드 재사용 가능 |
| 상태 저장 | LocalStorage Wrapper | 백엔드 없이 빠른 검증 가능 |
| 차트 | Chart.js | 이미 적용됨 |
| 아이콘 | Font Awesome | 이미 적용됨 |
| 알림 | Web Notification API | 브라우저 기본 기능 활용 가능 |
| 배포 | GitHub Pages 또는 Vercel Static Hosting | 정적 웹앱 배포에 적합 |
| 버전 관리 | Git/GitHub | 기능 단위 브랜치 관리 |
| 코드 편집 | VS Code | 현재 개발 환경과 적합 |
| 테스트 | 브라우저 DevTools + 간단한 JS 테스트 파일 | MVP 단계에서 충분 |

---

## 3. MVP 최종 범위

### 3.1 반드시 포함할 기능

```txt
1. 온보딩 기반 초기 집중도 프로필 생성
2. 할 일 추가/조회/완료/삭제
3. 고등 작업 / 단순 작업 분류
4. 우선순위 입력
5. 예상 소요 시간 입력
6. 집중도 기반 추천 시간대 계산
7. 대시보드 현재 추천 표시
8. 집중도 체크인 기록
9. 체크인 기반 집중도 보정
10. 프로필에서 집중도 점수 확인/수정
```

### 3.2 MVP에서 제외할 기능

```txt
1. 로그인
2. 클라우드 동기화
3. Google Calendar 연동
4. 모바일 앱 포팅
5. LLM 기반 AI 코칭
6. 자동 작업 분류 모델
7. Pomodoro 타이머
8. 고급 주간/월간 리포트
9. 공유 카드 고도화
10. 웨어러블 연동
```

### 3.3 제외하는 이유

| 기능 | 제외 이유 |
|---|---|
| 로그인 | MVP 핵심 가설 검증에 필요하지 않음 |
| 클라우드 동기화 | 데이터 구조 안정화 후 붙이는 것이 좋음 |
| 캘린더 연동 | 작업 추천 가설 검증 후 확장해야 함 |
| LLM 코칭 | 추천 로직이 검증된 뒤 붙여야 비용 낭비가 적음 |
| 모바일 앱 | 웹 MVP 사용성 검증 후 포팅하는 것이 효율적 |
| 고급 리포트 | 최소 1~2주 이상 데이터가 쌓여야 의미 있음 |

---

## 4. 전체 개발 순서

```txt
Phase 1. 프로젝트 정리
Phase 2. 데이터 계층 안정화
Phase 3. 추천 알고리즘 정리
Phase 4. 온보딩 플로우 정리
Phase 5. 할 일 플로우 완성
Phase 6. 체크인/피드백 플로우 강화
Phase 7. 대시보드 연결
Phase 8. 프로필/설정 정리
Phase 9. 알림/UX 마감
Phase 10. QA/배포
```

---

# Phase 1. 프로젝트 정리

## 1.1 목표

현재 데모 프로젝트를 MVP 개발 가능한 상태로 정리합니다.

핵심은 다음입니다.

```txt
- 파일 구조 명확화
- 데모용 코드 제거
- 기능별 책임 분리
- 개발/배포 실행 방식 정리
```

## 1.2 프로그램 / 도구

| 도구 | 용도 |
|---|---|
| VS Code | 코드 편집 |
| Chrome DevTools | LocalStorage, Console, UI 디버깅 |
| Git | 변경사항 관리 |
| GitHub | 원격 저장소 / 배포 후보 |
| Live Server Extension | 로컬 정적 서버 실행 |
| Prettier | 코드 포맷팅 |

## 1.3 폴더 구조 정리

현재 구조를 다음처럼 명확히 유지합니다.

```txt
chronosfocus/
├── index.html
├── css/
│   ├── theme.css
│   ├── components.css
│   ├── onboarding.css
│   ├── dashboard.css
│   └── tasks.css
├── js/
│   ├── app.js
│   ├── db.js
│   ├── algorithm.js
│   ├── onboarding.js
│   ├── tasks.js
│   ├── dashboard.js
│   ├── checkin.js
│   ├── profile.js
│   ├── notifications.js
│   └── theme.js
├── docs/
│   ├── MVP_구현_계획.md
│   ├── 기능_분석.md
│   └── 테스트_체크리스트.md
└── README.md
```

## 1.4 index.html 정리

### 현재 역할

`index.html`은 모든 CSS와 JS를 불러오고, SPA의 페이지 컨테이너를 제공합니다.

### 유지할 구조

```html
<main class="pages-container" id="pages-container">
  <div id="page-dashboard" class="page active"></div>
  <div id="page-tasks" class="page"></div>
  <div id="page-add-task" class="page"></div>
  <div id="page-checkin" class="page"></div>
  <div id="page-profile" class="page"></div>
</main>
```

### 왜 이렇게 하는가

React 없이도 페이지 단위 렌더링이 가능하고, 현재 구조를 거의 그대로 재사용할 수 있기 때문입니다.

## 1.5 데모 작업 자동 생성 제거

### 현재 문제

`app.js`에는 첫 실행 시 샘플 작업을 생성하는 `_addDemoTasks()`가 있습니다.

```js
function _addDemoTasks() {
  const existing = DB.Tasks.getToday();
  if (existing.length > 0) return;

  const demoTasks = [
    { title: '분기 보고서 초안 작성', category: 'high', priority: 'urgent' },
    { title: '이메일 답장 처리', category: 'low', priority: 'normal' },
  ];

  demoTasks.forEach(t => DB.Tasks.add(t));
}
```

### MVP 처리

삭제하거나 개발 모드에서만 실행되게 만듭니다.

```js
const CONFIG = {
  seedDemoTasks: false,
};

function maybeSeedDemoTasks() {
  if (!CONFIG.seedDemoTasks) return;
  const existing = DB.Tasks.getToday();
  if (existing.length > 0) return;
  DEMO_TASKS.forEach(task => DB.Tasks.add(task));
}
```

### 이유

실제 사용자가 앱을 처음 켰는데 본인이 입력하지 않은 작업이 있으면 신뢰가 떨어집니다.

## 1.6 완료 기준

```txt
- index.html에서 모든 페이지가 정상 표시됨
- 샘플 작업이 자동 생성되지 않음
- 콘솔 에러 없음
- LocalStorage 초기화 후 온보딩부터 정상 시작됨
```

---

# Phase 2. 데이터 계층 안정화

## 2.1 목표

MVP의 가장 중요한 뼈대는 `db.js`입니다.  
사용자, 할 일, 집중도 패턴, 체크인, 피드백이 안정적으로 저장되어야 합니다.

## 2.2 왜 db.js부터 하는가

모든 기능이 데이터를 중심으로 연결되기 때문입니다.

```txt
온보딩 → User, Patterns 저장
할 일 → Tasks 저장
체크인 → Checkins, Patterns 저장
피드백 → Feedback, Patterns 보정
대시보드 → User, Tasks, Patterns, Checkins 읽기
```

DB 계층이 흔들리면 화면과 알고리즘을 잘 만들어도 앱이 불안정해집니다.

## 2.3 MVP 데이터 모델

### User

```js
{
  id: 'cf-...',
  onboarding_done: true,
  focus_type: 'eagle',
  focus_type_name: '오전 폭주족',
  wake_time: 7,
  sleep_time: 23,
  focus_scores: '{"dawn":2,"morning":4.5,...}',
  created_at: '2026-06-30T...Z',
  updated_at: '2026-06-30T...Z'
}
```

### Task

```js
{
  id: 'cf-...',
  title: '논문 요약하기',
  category: 'high',
  priority: 'urgent',
  status: 'todo',
  estimated_min: 90,
  recommended_slot: 'forenoon',
  actual_slot: null,
  scheduled_date: '2026-06-30',
  completed_at: null,
  created_at: '2026-06-30T...Z',
  updated_at: '2026-06-30T...Z'
}
```

### FocusPattern

```js
{
  id: 'cf-...',
  date: '2026-06-30',
  slot: 'forenoon',
  focus_level: 4,
  source: 'checkin',
  created_at: '2026-06-30T...Z'
}
```

### Checkin

```js
{
  id: 'cf-...',
  date: '2026-06-30',
  slot: 'forenoon',
  focus_level: 4,
  memo: '',
  created_at: '2026-06-30T...Z'
}
```

### DailyFeedback

```js
{
  id: 'cf-...',
  date: '2026-06-30',
  satisfaction: 4,
  followed_recommendation: true,
  memo: '',
  created_at: '2026-06-30T...Z'
}
```

## 2.4 db.js 리팩토링 계획

### 2.4.1 공통 Helper 안정화

현재 `_get`, `_set`, `_uuid`, `_now`, `_today` 구조는 유지합니다.

개선 코드:

```js
function _get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[DB] Failed to parse ${key}`, error);
    return fallback;
  }
}

function _set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[DB] Failed to save ${key}`, error);
    Toast?.show?.('error', '저장 실패', '브라우저 저장소 용량 또는 권한을 확인해주세요.');
    return false;
  }
}

function _uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'cf-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function _now() {
  return new Date().toISOString();
}

function _today() {
  return new Date().toISOString().slice(0, 10);
}
```

### 왜 필요한가

LocalStorage는 JSON 파싱 실패, 용량 초과, 사용자의 브라우저 설정 문제로 실패할 수 있습니다. MVP라도 저장 실패 시 앱이 멈추면 안 됩니다.

### 2.4.2 Task 저장 로직 보강

```js
const Tasks = {
  getAll() {
    return _get(KEY_TASKS, []);
  },

  getToday() {
    return this.getAll().filter(task => task.scheduled_date === _today());
  },

  add(data) {
    const tasks = this.getAll();

    const task = {
      id: _uuid(),
      title: data.title,
      category: data.category,
      priority: data.priority || 'normal',
      status: 'todo',
      estimated_min: data.estimated_min || null,
      recommended_slot: data.recommended_slot || null,
      actual_slot: null,
      scheduled_date: data.scheduled_date || _today(),
      created_at: _now(),
      updated_at: _now(),
    };

    tasks.unshift(task);
    _set(KEY_TASKS, tasks);
    return task;
  },

  update(id, patch) {
    const tasks = this.getAll();
    const idx = tasks.findIndex(task => task.id === id);
    if (idx === -1) return null;

    tasks[idx] = {
      ...tasks[idx],
      ...patch,
      updated_at: _now(),
    };

    _set(KEY_TASKS, tasks);
    return tasks[idx];
  },

  complete(id) {
    const task = this.getAll().find(task => task.id === id);
    if (!task) return null;

    return this.update(id, {
      status: task.status === 'done' ? 'todo' : 'done',
      completed_at: task.status === 'done' ? null : _now(),
      actual_slot: task.status === 'done' ? null : ALGO.getCurrentSlot(),
    });
  },
};
```

### 왜 actual_slot이 필요한가

추천 시간대와 실제 완료 시간대를 비교해야 추천 정확도를 평가할 수 있습니다.

예시:

```txt
recommended_slot = forenoon
actual_slot = evening
```

이 경우 사용자는 오전 추천을 받았지만 실제로는 저녁에 완료했습니다. 나중에 추천 개선에 쓸 수 있습니다.

## 2.5 완료 기준

```txt
- User 저장/조회 정상
- Task 추가/완료/삭제 정상
- Checkin 저장 시 Patterns에도 반영됨
- LocalStorage를 직접 확인했을 때 스키마가 깨지지 않음
- JSON parse 실패 시 앱이 멈추지 않음
```

---

# Phase 3. 추천 알고리즘 정리

## 3.1 목표

`algorithm.js`를 MVP의 핵심 도메인 로직으로 고정합니다.

이 파일은 화면과 분리되어야 합니다.

```txt
algorithm.js는 DOM을 직접 조작하지 않는다.
algorithm.js는 DB를 직접 저장하지 않는다.
algorithm.js는 입력을 받고 결과만 반환한다.
```

## 3.2 핵심 함수

MVP에서 필요한 함수는 다음입니다.

```js
ALGO.getCurrentSlot()
ALGO.getSlotInfo(slotId)
ALGO.getFocusLabel(score)
ALGO.getRecommendation(tasks, scores)
ALGO.smartSchedule(tasks, scores)
ALGO.analyzeOnboarding(answers)
ALGO.DEFAULT_FOCUS_SCORES()
```

## 3.3 시간대 슬롯 정의

```js
const SLOTS = [
  { id: 'dawn', label: '새벽', hours: [0, 5] },
  { id: 'morning', label: '아침', hours: [5, 9] },
  { id: 'forenoon', label: '오전', hours: [9, 12] },
  { id: 'lunch', label: '점심', hours: [12, 14] },
  { id: 'afternoon', label: '오후', hours: [14, 18] },
  { id: 'evening', label: '저녁', hours: [18, 21] },
  { id: 'night', label: '밤', hours: [21, 24] },
];
```

### 왜 7개 슬롯인가

너무 세분화하면 체크인 데이터가 부족해지고, 너무 단순하면 추천이 거칠어집니다.  
MVP에서는 7개 슬롯이 사용자가 이해하기 쉽고, 하루 리듬을 표현하기에도 충분합니다.

## 3.4 집중도 라벨 정의

```js
const FOCUS_LEVELS = [
  { min: 4.5, level: 'peak', label: '최고조', recommend: 'high' },
  { min: 3.5, level: 'high', label: '높음', recommend: 'high' },
  { min: 2.5, level: 'medium', label: '보통', recommend: 'any' },
  { min: 1.5, level: 'low', label: '낮음', recommend: 'low' },
  { min: 0, level: 'rest', label: '휴식', recommend: 'rest' },
];
```

## 3.5 추천 규칙

```txt
score >= 3.5
→ 고등 작업 추천

2.5 <= score < 3.5
→ 긴급 작업 우선, 없으면 자유 추천

score < 2.5
→ 단순 작업 추천
```

## 3.6 getRecommendation 구현 계획

```js
function getRecommendation(tasks, scores) {
  const currentSlot = getCurrentSlot();
  const currentScore = scores[currentSlot] || 3;
  const focusInfo = getFocusLabel(currentScore);
  const slotInfo = getSlotInfo(currentSlot);

  const remaining = tasks.filter(task => task.status !== 'done');
  const highTasks = remaining.filter(task => task.category === 'high');
  const lowTasks = remaining.filter(task => task.category === 'low');
  const urgentTasks = remaining.filter(task => task.priority === 'urgent');

  let topTasks = [];

  if (focusInfo.recommend === 'high') {
    topTasks = highTasks.length ? highTasks : urgentTasks.length ? urgentTasks : lowTasks;
  }

  if (focusInfo.recommend === 'low') {
    topTasks = lowTasks.length ? lowTasks : urgentTasks.length ? urgentTasks : highTasks;
  }

  if (focusInfo.recommend === 'any') {
    topTasks = urgentTasks.length ? urgentTasks : remaining;
  }

  if (focusInfo.recommend === 'rest') {
    topTasks = lowTasks.slice(0, 1);
  }

  return {
    currentSlot,
    currentScore,
    slotInfo,
    focusInfo,
    topTasks: topTasks.slice(0, 3),
    recommendedCategory: focusInfo.recommend,
  };
}
```

## 3.7 smartSchedule 개선 계획

### 현재 한계

현재 `estimated_min`이 입력되지만 슬롯 용량 계산에는 거의 사용되지 않습니다.

### MVP 개선 방향

슬롯별 가상 용량을 둡니다.

```js
const SLOT_CAPACITY_MINUTES = {
  dawn: 120,
  morning: 180,
  forenoon: 180,
  lunch: 60,
  afternoon: 240,
  evening: 180,
  night: 180,
};
```

### 개선된 스케줄링 개념

```txt
1. 미완료 작업을 우선순위 순으로 정렬
2. 고등 작업은 집중도 높은 슬롯부터 배치
3. 단순 작업은 집중도 낮은 슬롯부터 배치
4. 슬롯별 남은 시간이 부족하면 다음 슬롯에 배치
5. 그래도 배치 불가하면 fallback 슬롯에 배치
```

### 구현 예시

```js
function smartSchedule(tasks, scores) {
  const slots = SLOTS.map(slot => ({
    ...slot,
    score: scores[slot.id] || 2,
    capacity: SLOT_CAPACITY_MINUTES[slot.id] || 120,
    assigned: 0,
  }));

  const sortedTasks = [...tasks].sort((a, b) => {
    return _priorityWeight(b) - _priorityWeight(a);
  });

  return sortedTasks.map(task => {
    const candidates = _getCandidateSlots(task, slots);
    const estimated = task.estimated_min || 30;

    const selected = candidates.find(slot => slot.assigned + estimated <= slot.capacity) || candidates[0];

    if (selected) selected.assigned += estimated;

    return {
      ...task,
      recommended_slot: selected?.id || 'forenoon',
    };
  });
}

function _getCandidateSlots(task, slots) {
  if (task.category === 'high') {
    return [...slots].sort((a, b) => b.score - a.score);
  }

  return [...slots].sort((a, b) => a.score - b.score);
}
```

## 3.8 완료 기준

```txt
- 시간대 계산이 정확함
- 집중도 점수에 따라 추천 유형이 바뀜
- 고등 작업은 높은 집중도 시간에 추천됨
- 단순 작업은 낮은 집중도 시간에 추천됨
- 우선순위가 추천 순서에 반영됨
- 예상 소요 시간이 긴 작업이 같은 슬롯에 과도하게 몰리지 않음
```

---

# Phase 4. 온보딩 플로우 정리

## 4.1 목표

사용자가 앱에 처음 들어왔을 때 자신의 기본 집중 리듬을 만들게 합니다.

```txt
온보딩 질문 답변
→ 크로노타입 계산
→ 기본 집중도 점수 생성
→ User 저장
→ Patterns 초기 데이터 저장
→ 대시보드 진입
```

## 4.2 유지할 질문

현재 6개 질문은 MVP에서도 유지합니다.

```txt
1. 보통 몇 시에 기상하나요?
2. 하루 중 언제 두뇌 회전이 가장 잘 되나요?
3. 아침에 기상 직후 컨디션은?
4. 오후 2~4시 슬럼프 때 어떻게 하나요?
5. 가장 효율적으로 일하는 환경은?
6. 보통 몇 시에 잠자리에 드나요?
```

## 4.3 온보딩 저장 코드

```js
function complete() {
  const analysis = window._obAnalysis;
  if (!analysis) return;

  DB.User.save({
    onboarding_done: true,
    focus_type: analysis.typeId,
    focus_type_name: analysis.type.name,
    focus_scores: JSON.stringify(analysis.focusScores),
  });

  ALGO.SLOTS.forEach(slot => {
    DB.Patterns.add({
      slot: slot.id,
      focus_level: analysis.focusScores[slot.id] || 3,
      source: 'onboarding',
    });
  });

  App.showApp();
}
```

## 4.4 개선할 부분

### 4.4.1 wake_time, sleep_time 저장

현재 focus_type 위주로 저장합니다. MVP에서는 기상/취침 시간도 저장하는 것이 좋습니다.

```js
DB.User.save({
  onboarding_done: true,
  focus_type: analysis.typeId,
  focus_type_name: analysis.type.name,
  wake_time: analysis.wakeTime,
  sleep_time: analysis.sleepTime,
  focus_scores: JSON.stringify(analysis.focusScores),
});
```

### 왜 필요한가

나중에 수면 시간과 집중도 관계를 분석할 수 있습니다.

### 4.4.2 결과 화면 단순화

현재 공유 버튼은 MVP 핵심이 아닙니다. 결과 화면은 다음만 보여줍니다.

```txt
- 나의 집중 유형
- 피크 시간대
- 낮은 집중 시간대
- 시간대별 집중도 점수
- 대시보드 시작 버튼
```

## 4.5 완료 기준

```txt
- 최초 방문 시 온보딩 표시
- 모든 질문에 답해야 결과 확인 가능
- 결과가 User에 저장됨
- 각 슬롯별 초기 Pattern이 저장됨
- 새로고침 후 온보딩이 다시 나오지 않음
- 프로필에서 재테스트 가능
```

---

# Phase 5. 할 일 플로우 완성

## 5.1 목표

일반 투두앱이 아니라 작업의 인지 부하에 따라 추천 시간대를 배치하는 흐름을 완성합니다.

## 5.2 핵심 사용자 흐름

```txt
+ 버튼 클릭
→ 작업 유형 선택
→ 제목 입력
→ 우선순위 선택
→ 예상 소요 시간 선택
→ 추천 시간대 미리보기
→ 저장
→ 할 일 목록 이동
```

## 5.3 작업 유형 정의

| 유형 | 코드 | 의미 | 예시 |
|---|---|---|---|
| 고등 작업 | high | 깊은 사고와 집중이 필요한 일 | 코딩, 논문 읽기, 기획, 의사결정 |
| 단순 작업 | low | 반복적이고 기계적으로 처리 가능한 일 | 이메일, 자료 정리, 입력 작업 |

## 5.4 tasks.js 구현 계획

### 5.4.1 상태 변수

```js
let _filter = 'all';
let _selectedCategory = null;
let _selectedPriority = 'normal';
```

### 5.4.2 작업 추가 폼

필수 DOM 요소:

```html
<input id="task-title-input" />
<select id="task-time-input"></select>
<div id="smart-rec-content"></div>
<button onclick="TasksModule.submitTask()">할 일 추가하기</button>
```

### 5.4.3 카테고리 선택

```js
function selectCategory(category, element) {
  _selectedCategory = category;

  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.remove('selected-high', 'selected-low');
  });

  element.classList.add(category === 'high' ? 'selected-high' : 'selected-low');
  updateSmartRec();
}
```

### 5.4.4 추천 시간대 미리보기

```js
function updateSmartRec() {
  const recEl = document.getElementById('smart-rec-content');
  if (!recEl || !_selectedCategory) return;

  const scores = DB.Patterns.getAverageScores();
  const pseudoTask = {
    category: _selectedCategory,
    priority: _selectedPriority,
    estimated_min: Number(document.getElementById('task-time-input')?.value) || 30,
  };

  const [scheduled] = ALGO.smartSchedule([pseudoTask], scores);
  const slot = ALGO.getSlotInfo(scheduled.recommended_slot);

  recEl.innerHTML = `${slot.emoji} ${slot.label} 시간대 추천`;
}
```

### 5.4.5 작업 저장

```js
function submitTask() {
  const titleEl = document.getElementById('task-title-input');
  const timeEl = document.getElementById('task-time-input');

  const title = titleEl.value.trim();
  const estimatedMin = Number(timeEl.value) || null;

  if (!title) {
    Toast.show('warning', '입력 필요', '할 일 제목을 입력해주세요.');
    return;
  }

  if (!_selectedCategory) {
    Toast.show('warning', '선택 필요', '작업 유형을 선택해주세요.');
    return;
  }

  const scores = DB.Patterns.getAverageScores();
  const [scheduled] = ALGO.smartSchedule([
    {
      title,
      category: _selectedCategory,
      priority: _selectedPriority,
      estimated_min: estimatedMin,
    },
  ], scores);

  DB.Tasks.add({
    title,
    category: _selectedCategory,
    priority: _selectedPriority,
    estimated_min: estimatedMin,
    recommended_slot: scheduled.recommended_slot,
  });

  _selectedCategory = null;
  _selectedPriority = 'normal';
  App.navigate('tasks');
}
```

## 5.5 추천 시간대 수동 변경 기능

MVP에서 가능하면 추가합니다.

### 이유

추천이 틀릴 수 있기 때문입니다. 사용자가 수동 변경할 수 있어야 신뢰가 생깁니다.

### 데이터 필드

```js
recommended_slot: 'forenoon',
user_modified_slot: true,
```

### UI

작업 상세 모달에 셀렉트 박스를 둡니다.

```html
<select id="task-slot-select">
  <option value="morning">아침</option>
  <option value="forenoon">오전</option>
  <option value="afternoon">오후</option>
</select>
```

### 저장 코드

```js
function updateTaskSlot(taskId) {
  const slot = document.getElementById('task-slot-select').value;

  DB.Tasks.update(taskId, {
    recommended_slot: slot,
    user_modified_slot: true,
  });

  Toast.show('success', '변경 완료', '추천 시간대가 수정되었습니다.');
  TasksModule.render();
}
```

## 5.6 완료 기준

```txt
- 작업 유형 미선택 시 저장 불가
- 제목 미입력 시 저장 불가
- 작업 저장 시 recommended_slot 생성
- 할 일 목록에서 추천 시간대 표시
- 완료 토글 정상 작동
- 작업 삭제 정상 작동
- 필터 전체/고등/단순/완료 정상 작동
```

---

# Phase 6. 체크인/피드백 플로우 강화

## 6.1 목표

체크인은 MVP의 핵심 개인화 데이터입니다.

```txt
사용자가 지금 집중도 기록
→ checkins 원본 저장
→ patterns 학습 데이터 저장
→ 시간대 평균 집중도 보정
→ 대시보드 추천에 반영
```

## 6.2 체크인 UI

필수 요소:

```txt
- 현재 시간대 표시
- 집중도 1~5점 선택
- 기록 버튼
- 오늘 체크인 히스토리
- 시간대별 현재 기준 점수
```

## 6.3 체크인 저장 코드

```js
function submitCheckin() {
  if (!_currentRating) return;

  const slot = ALGO.getCurrentSlot();

  DB.Checkins.add(slot, _currentRating);

  Toast.show('success', '기록 완료', '집중도 기록이 추천에 반영됩니다.');

  _currentRating = 0;
  CheckinModule.render();
}
```

## 6.4 Patterns 평균 계산 개선

### 현재 방식

```txt
기록 3개 이상이면 실제 평균 70% + 기본값 30%
기록 3개 미만이면 기본값 사용
```

### MVP 유지 이유

초기 데이터가 적을 때 체크인 1개만으로 추천이 크게 흔들리는 문제를 막을 수 있습니다.

### 개선 코드

```js
getAverageScores() {
  const all = this.getAll();
  const base = User.getFocusScores();
  const result = {};

  SLOTS.forEach(slot => {
    const records = all.filter(record => record.slot === slot);

    if (records.length >= 3) {
      const avg = records.reduce((sum, record) => sum + record.focus_level, 0) / records.length;
      result[slot] = Math.round((avg * 0.7 + base[slot] * 0.3) * 10) / 10;
    } else {
      result[slot] = base[slot];
    }
  });

  return result;
}
```

## 6.5 체크인 팝업 개선

### 현재 문제

현재는 45분 제한 + 30% 확률 랜덤 팝업입니다.

### MVP 개선 방향

랜덤이 아니라 명확한 조건으로 바꿉니다.

```txt
조건 1. 앱 실행 후 5분 뒤
조건 2. 최근 1시간 체크인 없음
조건 3. 현재 슬롯에서 오늘 체크인 없음
조건 4. 사용자가 알림/팝업 허용 상태
```

### 구현 예시

```js
function shouldShowCheckinPopup() {
  const currentSlot = ALGO.getCurrentSlot();
  const todayCheckins = DB.Checkins.getToday();
  const recentCheckins = DB.Checkins.getLastHour();

  const hasCurrentSlotCheckin = todayCheckins.some(checkin => checkin.slot === currentSlot);

  if (recentCheckins.length > 0) return false;
  if (hasCurrentSlotCheckin) return false;

  return true;
}
```

## 6.6 일일 피드백

### MVP에서는 간단히 유지

```txt
- 오늘 추천이 도움 됐는가?
- 오늘 만족도는 몇 점인가?
- 추천대로 했는가?
```

### 피드백 저장 코드

```js
DB.Feedback.add({
  satisfaction: _fbRating,
  followed_recommendation: _fbFollowed,
  memo: memoEl?.value || '',
});
```

## 6.7 완료 기준

```txt
- 체크인 저장 시 checkins와 patterns에 모두 기록됨
- 오늘 체크인 히스토리 표시
- 체크인 3회 이상 누적 시 평균 점수 변경
- 대시보드의 현재 집중도 점수에 반영됨
- 피드백 제출은 하루 1회만 가능
```

---

# Phase 7. 대시보드 연결

## 7.1 목표

대시보드는 MVP의 메인 화면입니다. 사용자가 앱을 켰을 때 바로 다음 질문에 답해야 합니다.

```txt
지금 내 집중도는 어느 정도인가?
지금 어떤 작업을 하면 좋은가?
오늘 할 일은 얼마나 남았는가?
내 하루 집중도 흐름은 어떤가?
```

## 7.2 대시보드 필수 컴포넌트

```txt
1. 현재 시간/날짜
2. 현재 시간대 슬롯
3. 현재 집중도 점수
4. 추천 작업 유형
5. 추천 작업 Top 3
6. 오늘 완료율
7. 시간대별 집중도 그래프
8. 오늘 할 일 미리보기
```

## 7.3 데이터 읽기 흐름

```js
const user = DB.User.get();
const tasks = DB.Tasks.getToday();
const scores = DB.Patterns.getAverageScores();
const recommendation = ALGO.getRecommendation(tasks, scores);
const stats = DB.Tasks.getTodayStats();
```

## 7.4 추천 표시 코드

```js
function _updateRecommendation() {
  const tasks = DB.Tasks.getToday();
  const scores = DB.Patterns.getAverageScores();
  const rec = ALGO.getRecommendation(tasks, scores);

  const recEl = document.getElementById('dash-recommendation');

  recEl.innerHTML = `
    <div class="now-rec-label">
      ${rec.slotInfo.emoji} ${rec.slotInfo.label} 추천
    </div>
    <div class="now-rec-text">
      현재 집중도 ${rec.currentScore.toFixed(1)}점입니다.
      ${_getRecommendationText(rec)}
    </div>
    ${_renderTopTasks(rec.topTasks)}
  `;
}
```

## 7.5 추천 문구 정리

MVP에서는 “AI 추천”이라는 표현을 줄이는 것이 좋습니다.

### 기존

```txt
AI 추천
```

### 변경

```txt
리듬 기반 추천
```

### 이유

실제 LLM/ML 모델이 아니라 rule-based 추천이므로, 사용자의 기대치를 정확히 맞춰야 합니다.

## 7.6 Chart.js 그래프

### 유지 이유

시간대별 집중도 곡선은 이 앱의 차별점을 시각적으로 보여줍니다.

### 그래프 데이터

```js
const labels = ['새벽', '아침', '오전', '점심', '오후', '저녁', '밤'];
const data = ['dawn', 'morning', 'forenoon', 'lunch', 'afternoon', 'evening', 'night']
  .map(slot => scores[slot] || 2);
```

## 7.7 완료 기준

```txt
- 앱 진입 시 대시보드 표시
- 현재 시간대가 정확함
- 집중도 점수가 Patterns 평균과 일치함
- 추천 작업 Top 3 표시
- 할 일 완료 시 통계가 즉시 갱신됨
- 체크인 후 대시보드 점수가 갱신됨
```

---

# Phase 8. 프로필/설정 정리

## 8.1 목표

프로필은 사용자의 집중 유형과 누적 데이터를 확인하고 수정하는 화면입니다.

## 8.2 MVP 필수 기능

```txt
- 크로노타입 표시
- 피크 시간대 표시
- 시간대별 집중도 점수 표시
- 집중도 점수 수동 수정
- 온보딩 재테스트
- 전체 데이터 초기화
```

## 8.3 집중도 수동 수정

### 이유

초기 추천이 틀릴 수 있기 때문에 사용자가 직접 고칠 수 있어야 합니다.

### 구현 방식

대시보드의 `editScores()` 또는 프로필에서 같은 모달을 사용합니다.

```js
function saveManualScores() {
  const scores = {};

  ALGO.SLOTS.forEach(slot => {
    const value = Number(document.getElementById(`score-${slot.id}`).value);
    scores[slot.id] = Math.max(1, Math.min(5, value));

    DB.Patterns.add({
      slot: slot.id,
      focus_level: scores[slot.id],
      source: 'manual',
    });
  });

  DB.User.setFocusScores(scores);
  ModalManager.hide();
  DashboardModule.refresh();
}
```

## 8.4 데이터 초기화

```js
function clearData() {
  const ok = confirm('모든 데이터를 초기화할까요? 되돌릴 수 없습니다.');
  if (!ok) return;

  ['cf_user', 'cf_tasks', 'cf_patterns', 'cf_feedback', 'cf_checkins']
    .forEach(key => localStorage.removeItem(key));

  location.reload();
}
```

## 8.5 완료 기준

```txt
- 프로필에서 크로노타입 확인 가능
- 시간대별 집중도 점수 확인 가능
- 수동 수정 후 대시보드에 반영됨
- 재테스트 후 새 유형으로 업데이트됨
- 데이터 초기화 후 온보딩부터 다시 시작됨
```

---

# Phase 9. 알림/UX 마감

## 9.1 목표

MVP 사용 흐름을 방해하지 않는 수준에서 알림과 UX를 정리합니다.

## 9.2 알림 정책

### 유지할 알림

```txt
- 슬롯 변경 시 가벼운 알림
- 체크인 유도 알림
- 저녁 피드백 알림
```

### 줄일 알림

```txt
- 너무 잦은 랜덤 팝업
- 매번 권한 요청
- 사용자가 닫은 뒤 반복 표시되는 팝업
```

## 9.3 Notification 권한 요청 개선

현재는 앱 진입 시 바로 권한을 요청합니다. MVP에서는 사용자가 알림 기능을 켤 때 요청하는 것이 좋습니다.

```js
async function enableNotifications() {
  const granted = await NotificationManager.requestPermission();

  if (granted) {
    DB.User.save({ notifications_enabled: true });
    Toast.show('success', '알림 설정 완료', '시간대 변경 알림을 받을 수 있습니다.');
  }
}
```

## 9.4 Toast 정책

| 상황 | Toast 타입 |
|---|---|
| 저장 성공 | success |
| 입력 누락 | warning |
| 저장 실패 | error |
| 추천/안내 | info |

## 9.5 완료 기준

```txt
- 알림 권한을 강제로 요청하지 않음
- 체크인 팝업이 과도하게 뜨지 않음
- 저장/삭제/수정 시 Toast 표시
- 모바일 화면에서 모달이 잘림 없이 표시됨
```

---

# Phase 10. QA / 테스트 / 배포

## 10.1 테스트 환경

| 환경 | 테스트 내용 |
|---|---|
| Chrome Desktop | 기본 기능 전체 테스트 |
| Chrome Mobile View | 모바일 UI 확인 |
| Safari | LocalStorage/Notification 호환성 확인 |
| iPhone Safari | 모바일 실제 사용성 확인 |
| Android Chrome | 모바일 실제 사용성 확인 |

## 10.2 기능 테스트 체크리스트

### 온보딩

```txt
[ ] 최초 진입 시 온보딩 표시
[ ] 6개 질문 모두 선택 가능
[ ] 선택하지 않으면 다음으로 이동 불가
[ ] 결과 화면 표시
[ ] 대시보드 시작 시 User 저장
[ ] Patterns 초기 데이터 생성
[ ] 새로고침 후 대시보드로 이동
```

### 할 일

```txt
[ ] 작업 제목 입력 가능
[ ] 고등/단순 작업 선택 가능
[ ] 우선순위 선택 가능
[ ] 예상 시간 선택 가능
[ ] 추천 시간대 미리보기 표시
[ ] 저장 후 목록에 표시
[ ] 완료 토글 가능
[ ] 삭제 가능
[ ] 필터 작동
```

### 추천

```txt
[ ] 집중도 높은 시간대에는 고등 작업 추천
[ ] 집중도 낮은 시간대에는 단순 작업 추천
[ ] 긴급 작업은 보통 시간대에서 우선 표시
[ ] 완료된 작업은 추천에서 제외
[ ] 추천 시간대가 작업 카드에 표시
```

### 체크인

```txt
[ ] 1~5점 선택 가능
[ ] 기록 버튼 작동
[ ] Checkins 저장
[ ] Patterns 저장
[ ] 오늘 기록 표시
[ ] 평균 점수 갱신
[ ] 대시보드 반영
```

### 프로필

```txt
[ ] 크로노타입 표시
[ ] 피크 시간대 표시
[ ] 전체 할 일 수 표시
[ ] 완료 수 표시
[ ] 체크인 수 표시
[ ] 집중도 점수 수정 가능
[ ] 재테스트 가능
[ ] 데이터 초기화 가능
```

## 10.3 콘솔 테스트 코드

브라우저 DevTools Console에서 다음을 확인합니다.

```js
DB.User.get();
DB.Tasks.getToday();
DB.Patterns.getAverageScores();
DB.Checkins.getToday();
ALGO.getCurrentSlot();
ALGO.getRecommendation(DB.Tasks.getToday(), DB.Patterns.getAverageScores());
```

## 10.4 배포 방법

### 방법 1. GitHub Pages

정적 웹앱이므로 가장 간단합니다.

```txt
1. GitHub repository 생성
2. main 브랜치에 코드 push
3. Settings → Pages
4. Deploy from branch 선택
5. main / root 선택
```

### 방법 2. Vercel

```txt
1. Vercel 접속
2. GitHub repository import
3. Framework Preset: Other
4. Build Command 비움
5. Output Directory: ./
6. Deploy
```

## 10.5 MVP 배포 전 기준

```txt
- 콘솔 에러 0개
- 새로고침 후 데이터 유지
- LocalStorage 삭제 후 온보딩 정상 시작
- 모바일 390px 너비에서 화면 깨짐 없음
- 최소 10개 작업 등록/완료 시 성능 문제 없음
- 체크인 20개 이상 저장해도 평균 계산 정상
```

---

# 11. 브랜치 전략

## 11.1 추천 브랜치 구조

```txt
main
└── develop
    ├── feat/db-stabilization
    ├── feat/algorithm-mvp
    ├── feat/onboarding-mvp
    ├── feat/tasks-mvp
    ├── feat/checkin-mvp
    ├── feat/dashboard-mvp
    └── chore/qa-deploy
```

## 11.2 커밋 단위

좋은 커밋 예시:

```txt
feat(db): add safe localStorage parser
feat(tasks): add manual slot update
feat(algo): include estimated time in smart schedule
fix(checkin): prevent duplicate popup in same slot
chore(app): remove demo task seed from production
```

나쁜 커밋 예시:

```txt
update
fix
final
작업함
```

---

# 12. 개발 일정

## 12.1 4주 MVP 일정

| 주차 | 목표 | 작업 |
|---|---|---|
| 1주차 | 뼈대 안정화 | db.js, app.js, 데모 제거, 데이터 구조 정리 |
| 2주차 | 핵심 추천 완성 | algorithm.js, tasks.js, 추천 슬롯, 작업 등록 |
| 3주차 | 개인화 강화 | checkin.js, patterns 평균, feedback, profile 수정 |
| 4주차 | QA/배포 | dashboard 정리, 모바일 QA, 배포, README 정리 |

## 12.2 하루 단위 세부 일정

### Day 1

```txt
- 프로젝트 실행 확인
- README 최신화
- 데모 작업 자동 생성 제거
- LocalStorage key 목록 정리
```

### Day 2

```txt
- db.js 안전 파서 적용
- Task/User/Patterns 스키마 정리
- complete toggle 개선
```

### Day 3

```txt
- algorithm.js 추천 규칙 정리
- smartSchedule에 estimated_min 반영
- 콘솔 테스트 작성
```

### Day 4

```txt
- onboarding 저장값 보강
- wake_time/sleep_time 저장
- 결과 화면 단순화
```

### Day 5

```txt
- tasks.js 할 일 추가 플로우 개선
- 추천 시간대 미리보기 개선
- 수동 시간대 변경 기능 추가
```

### Day 6

```txt
- checkin.js 중복 팝업 방지
- Patterns 평균 계산 확인
- 체크인 히스토리 UI 정리
```

### Day 7

```txt
- dashboard.js 추천 표시 정리
- AI 추천 문구를 리듬 기반 추천으로 변경
- 통계/그래프 갱신 확인
```

---

# 13. MVP 성공 기준

## 13.1 기능 기준

```txt
사용자가 온보딩을 완료한다.
사용자가 오늘 할 일을 3개 이상 추가한다.
앱이 각 작업의 추천 시간대를 계산한다.
사용자가 체크인을 기록한다.
체크인 기록이 다음 추천 점수에 반영된다.
사용자가 대시보드에서 지금 할 일을 확인한다.
```

## 13.2 사용자 가치 기준

MVP가 성공하려면 사용자가 다음 말을 할 수 있어야 합니다.

```txt
“오늘 뭘 먼저 해야 할지 정리된다.”
“내가 언제 집중이 잘 되는지 보인다.”
“단순 투두앱보다 시간 배치에 도움이 된다.”
```

## 13.3 개발 기준

```txt
- 핵심 데이터 흐름이 안정적이다.
- 기능이 파일별로 분리되어 있다.
- 알고리즘이 DOM에 의존하지 않는다.
- LocalStorage에서 데이터 스키마가 명확하다.
- 나중에 백엔드 DB로 옮길 수 있는 구조다.
```

---

# 14. 나중에 확장할 때의 방향

## 14.1 서버 DB 전환

LocalStorage 구조를 다음 DB 테이블로 옮깁니다.

```txt
users
user_focus_scores
tasks
focus_checkins
daily_feedbacks
```

## 14.2 자동 작업 분류

작업 제목을 기반으로 `high/low`를 자동 추천합니다.

```txt
“논문 읽고 요약” → high
“이메일 답장” → low
“코드 리팩토링” → high
“파일명 정리” → low
```

## 14.3 Google Calendar 연동

캘린더 빈 시간과 추천 슬롯을 결합합니다.

```txt
추천 슬롯: 오전
캘린더 빈 시간: 10:00~11:30
작업 예상 시간: 90분
→ 10:00~11:30 자동 배치 추천
```

## 14.4 LLM 코칭

LLM은 초기 MVP에 바로 넣지 않고, 데이터가 쌓인 뒤 다음 용도로 붙입니다.

```txt
- 하루 회고 요약
- 집중도 패턴 설명
- 작업 계획 문장화
- 추천 이유 자연어 설명
```

---

# 15. 최종 결론

ChronosFocus MVP에서 가장 먼저 개발해야 하는 것은 예쁜 화면이 아니라 다음 5개 뼈대입니다.

```txt
1. db.js 데이터 저장 구조
2. algorithm.js 추천 로직
3. onboarding.js 초기 집중도 생성
4. tasks.js 작업 입력/추천 시간대 저장
5. checkin.js 실제 집중도 기록/보정
```

이후 `dashboard.js`는 위 데이터 흐름이 제대로 연결됐는지 보여주는 검증 화면으로 개발합니다.

MVP의 핵심은 다음 한 문장입니다.

> 사용자가 “오늘 이 일을 언제 하면 좋은지” 바로 알 수 있게 만드는 것.

따라서 1차 MVP에서는 로그인, 캘린더, LLM, 모바일 앱 포팅보다 **데이터 흐름과 추천 정확도**를 먼저 완성해야 합니다.
