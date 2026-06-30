# ⏱ ChronosFocus — 생체 리듬 기반 생산성 관리 앱

> **"당신의 황금 시간을 찾아드립니다"**  
> 시간대별 집중도 패턴을 분석하여 최적의 작업을 최적의 시간에 배치해주는 개인 맞춤형 생산성 가이드

---

## 🎯 프로젝트 개요

ChronosFocus는 사용자의 생체 리듬(크로노타입)에 기반하여 하루를 7개 시간대로 나누고,
각 시간대의 집중도에 맞는 작업 유형을 자동 추천해주는 웹 앱입니다.

---

## ✅ 구현 완료 기능

### 1. 온보딩 — 집중 유형 테스트 (바이럴 요소)
- 6개의 심리테스트 스타일 질문 (기상 시간, 집중 피크, 아침 컨디션 등)
- **5가지 크로노타입 캐릭터** 결과:
  - 🦉 올빼미 학자 (야행성 / 새벽·밤 피크)
  - 🦅 오전 폭주족 (얼리버드 / 오전 피크)
  - 🦁 점심의 사자 (균형형 / 점심 피크)
  - 🐻 오후 루틴 로봇 (표준형 / 오후 피크)
  - 🐬 저녁 돌고래 (저녁형 / 저녁·밤 피크)
- **공유 카드** — X(트위터) 공유 / 클립보드 복사
- 결과 기반 시간대별 집중도 자동 설정

### 2. 타임라인 대시보드
- **실시간 디지털 시계** + 날짜 표시
- **현재 시간대 슬롯 표시** (새벽/아침/오전/점심/오후/저녁/밤)
- **AI 추천 메시지** — 현재 집중도에 맞는 작업 타입 안내
- **Chart.js 집중도 곡선** — 부드러운 스플라인 그래프로 하루 집중도 시각화
- **슬롯 타임라인** — 7개 시간대 현재 위치 강조 표시
- 오늘 할 일 미리보기 + 완료 토글

### 3. 투두리스트 이원화 (Task Classification)
- **🧠 고등 작업** (High-Cognitive): 기획서, 의사결정, 코딩, 공부
- **📋 단순 작업** (Low-Cognitive): 이메일, 자료정리, 데이터 입력
- 우선순위 3단계 (긴급/보통/낮음)
- 예상 소요 시간 설정
- **⚡ 지금 최적!** 배지 — 현재 시간대에 맞는 작업 자동 하이라이트
- 스마트 필터 (전체/고등/단순/완료)

### 4. 스마트 스케줄러 알고리즘 (`js/algorithm.js`)
- 집중도 점수 기반 슬롯 배치 (고등 작업 → 집중도 높은 슬롯)
- 우선순위 가중치 반영 (urgent > normal > low)
- 현재 시간대 추천 메시지 5가지 레벨 (peak/high/medium/low/rest)
- Blend 알고리즘: 실측 데이터 70% + 기본값 30%

### 5. 집중도 체크인
- 빠른 체크인 (😩~🔥 5단계 이모지 평가)
- 오늘 체크인 기록 히스토리
- **자동 팝업** — 45분 주기, 30% 확률 무작위 집중도 체크인

### 6. 피드백 루프 (Fine-tuning)
- 저녁 8시 이후 일일 피드백 넛지 자동 표시
- 만족도(1~5점) + 추천 준수 여부 기록
- 피드백 기반 집중도 점수 미세 조정 (+0.1/-0.1 delta)

### 7. 다이나믹 테마
| 시간대 | 테마 | 주요 색상 |
|--------|------|-----------|
| 새벽 0~5시 | Dawn | 보라 (#7c6af5) |
| 아침 5~9시 | Morning | 오렌지 (#ff7043) |
| 오전 9~12시 | Forenoon | 스카이블루 (#38bdf8) |
| 점심 12~14시 | Lunch | 민트 (#34d399) |
| 오후 14~18시 | Afternoon | 황금 (#fbbf24) |
| 저녁 18~21시 | Evening | 핑크 (#e879f9) |
| 밤 21~24시 | Night | 인디고 (#6366f1) |

---

## 📐 데이터베이스 스키마

### `users` 테이블
```json
{
  "id": "UUID",
  "name": "string",
  "focus_type": "owl|eagle|lion|bear|dolphin",
  "focus_type_name": "string",
  "onboarding_done": "boolean",
  "wake_time": "number (hour)",
  "sleep_time": "number (hour)",
  "focus_scores": "JSON string { dawn:2, morning:4.5, ... }",
  "created_at": "ISO datetime"
}
```

### `tasks` 테이블
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "title": "string",
  "category": "high|low",
  "priority": "urgent|normal|low",
  "status": "todo|in_progress|done",
  "estimated_min": "number",
  "recommended_slot": "dawn|morning|forenoon|lunch|afternoon|evening|night",
  "actual_slot": "string",
  "scheduled_date": "YYYY-MM-DD",
  "completed_at": "ISO datetime",
  "created_at": "ISO datetime"
}
```

### `focus_patterns` 테이블
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "date": "YYYY-MM-DD",
  "slot": "dawn|morning|...",
  "hour_start": "number",
  "hour_end": "number",
  "focus_level": "number (1~5)",
  "source": "onboarding|checkin|feedback|manual",
  "created_at": "ISO datetime"
}
```

### `daily_feedback` 테이블
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "date": "YYYY-MM-DD",
  "satisfaction": "number (1~5)",
  "followed_recommendation": "boolean",
  "memo": "string",
  "created_at": "ISO datetime"
}
```

---

## 🧠 핵심 알고리즘 (`js/algorithm.js`)

### `ALGO.getRecommendation(tasks, scores)` — 현재 시간 기반 추천
```
입력: 오늘 할 일 목록 + 슬롯별 집중도 점수
출력: { currentSlot, focusInfo, recommendedCategory, message, topTasks }

로직:
1. getCurrentSlot() → 현재 시간 → 슬롯 ID
2. scores[currentSlot] → focusInfo (peak/high/medium/low/rest)
3. focusInfo.recommend에 따라 고등/단순 작업 필터
4. 우선순위 정렬 → 상위 3개 topTasks 선정
5. 슬롯 진입 메시지 랜덤 선택
```

### `ALGO.smartSchedule(tasks, scores)` — 자동 배치 알고리즘
```
입력: 미완료 할 일 목록 + 집중도 점수
출력: recommended_slot이 할당된 tasks[]

로직:
1. 슬롯을 집중도 내림차순 정렬
2. 고등 작업 → 상위 슬롯(score ≥ 3.5)에 라운드로빈 배치
3. 단순 작업 → 하위 슬롯(score < 3.5)에 배치
4. 우선순위 가중치(urgent=3, normal=2, low=1) 반영
```

### `ALGO.analyzeOnboarding(answers)` — 유형 분석
```
입력: { q1:'b', q2:'c', ... } 온보딩 응답
출력: { typeId, type, focusScores }

로직:
1. 6개 질문의 응답을 5가지 크로노타입 점수로 매핑
2. 최고 점수 유형 선택
3. 기상/취침 패턴으로 기본 집중도 점수 미세 조정 (±0.3)
```

---

## 📁 파일 구조

```
chronosfocus/
├── index.html              # 메인 HTML (SPA)
├── css/
│   ├── theme.css           # 다이나믹 테마 (7가지 시간대)
│   ├── components.css      # 글로벌 컴포넌트 (카드, 버튼, 모달...)
│   ├── onboarding.css      # 온보딩 스타일
│   ├── dashboard.css       # 대시보드 스타일
│   └── tasks.css           # 할 일 관련 스타일
├── js/
│   ├── db.js               # LocalStorage 기반 데이터베이스
│   ├── algorithm.js        # ★ 핵심 알고리즘 (추천/스케줄링/유형분석)
│   ├── theme.js            # 다이나믹 테마 매니저
│   ├── onboarding.js       # 온보딩 UI + 결과 카드
│   ├── dashboard.js        # 타임라인 대시보드 + Chart.js
│   ├── tasks.js            # 투두리스트 이원화
│   ├── checkin.js          # 집중도 체크인 + 피드백
│   ├── profile.js          # 프로필 페이지
│   ├── notifications.js    # 알림 + Toast + Modal
│   └── app.js              # 앱 컨트롤러 (라우팅)
└── README.md
```

---

## 🔧 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Vanilla HTML/CSS/JavaScript (SPA) |
| 데이터 시각화 | Chart.js 4.4 |
| 아이콘 | Font Awesome 6.4 |
| 폰트 | Pretendard, Space Grotesk |
| 저장소 | LocalStorage (클라이언트 퍼시스턴스) |
| 디자인 | Dark Mode + 시간대별 다이나믹 테마 |
| 알림 | Web Notification API |

---

## 🚧 미구현 (개발 예정)

- [ ] **Google Calendar 연동** — 빈 시간 추출 후 자동 일정 배치
- [ ] **React Native / Flutter 포팅** — iOS/Android 앱화
- [ ] **주간/월간 집중도 트렌드** 분석 차트
- [ ] **Pomodoro 타이머** 통합
- [ ] **PWA 지원** — 설치형 앱 (Service Worker)
- [ ] **클라우드 동기화** — 디바이스 간 데이터 공유
- [ ] **AI 메모** — 작업 완료 후 짧은 회고 입력

---

## 📌 주요 진입점 (URI)

| 경로 | 설명 |
|------|------|
| `/` | 앱 메인 (온보딩 완료 시 대시보드) |
| `#dashboard` | 타임라인 대시보드 |
| `#tasks` | 투두리스트 |
| `#add-task` | 할 일 추가 |
| `#checkin` | 집중도 체크인 |
| `#profile` | 프로필 & 통계 |

---

## 🚀 다음 개발 권장 사항

1. **PWA 변환** — `manifest.json` + Service Worker로 오프라인 지원 및 홈화면 설치
2. **WebSocket 또는 SSE** — 실시간 집중도 알림 (현재는 polling 방식)
3. **백엔드 연동** — Express/Node.js + PostgreSQL로 다중 기기 동기화
4. **AI 모델 연동** — 실측 집중도 데이터 학습 기반 개인화 강화
5. **소셜 기능** — 친구와 생산성 비교, 팀 대시보드

---

*Built with ❤️ — ChronosFocus v1.0 | 2026.05*
