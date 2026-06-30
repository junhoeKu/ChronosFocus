# CLAUDE.md - Rhema-LLM Backend

## 프로젝트 개요

> **예수이름신학 문서를 바탕으로 한 Multi-Agent 기반 QA Chatting 시스템**
> Google ADK + GPT-5.4 기반의 대화형 QA 시스템. 자연어 질의로 답변에 필요한 문서 및 정보를 검색하여 LLM 답변을 도출한다. 

---

## 작업 원칙

### 1. 논의 → 설계 → 계획 → 구현 → 리뷰

코드를 먼저 작성하지 않는다. 반드시 이 순서를 따른다:

1. **논의**: 요구사항을 정확히 이해하고 질문한다
2. **설계**: 2-3개 접근법을 비교하고 추천한다
3. **계획**: 구체적인 파일 목록과 변경 사항을 문서화한다
4. **구현**: 계획대로만 구현한다. 범위를 벗어나지 않는다
5. **리뷰**: 구현 결과를 spec과 대조하여 검증한다
6. **갱신**: 커밋 및 코드 구현이 완료되면 해당 부분을 꼼꼼하게 단계별로 메모리에 반영 및 갱신하세요.

이 사이클을 충분히 반복한다. 급하다고 건너뛰지 않는다.

### 2. 기존 코드의 일관성을 지킨다

- 새 코드는 기존 패턴을 따른다. 더 나은 패턴이 있어도 혼자 바꾸지 않는다
- 폴더 구조, 네이밍, import 스타일을 기존 코드에서 먼저 확인한다
- "개선"이라는 이름으로 기존 컨벤션을 무시하지 않는다
- agent_chat과 knowledge_chat은 독립 운영. 공유 코드 없이 각각 완결된 구조를 유지한다. 둘 다 LoopAgent 패턴 사용
- 시간 관련 값은 모두 KST 기준으로 통일한다. Python 기본값, Pydantic/DTO 응답, DB timestamp 컬럼, 테스트 기대값, 문서 예시를 섞지 말고 일관되게 맞춘다

### 3. Google ADK 공식 패턴을 따른다

- ADK가 제공하는 기능(LlmAgent, ParallelAgent, SequentialAgent, LoopAgent, AgentTool, FunctionTool)으로 해결한다
- Python으로 ADK를 우회하거나 대체하는 코드를 작성하지 않는다
- 프롬프트로 해결하려 하기 전에, 에이전트 구조(계층, 타입, 조합)로 해결할 수 있는지 먼저 검토한다
- **조금이라도 의심되면 바로 ADK 공식문서를 확인한다**: https://google.github.io/adk-docs/

### 4. 확인 없이 추측하지 않는다

- 파일을 수정하기 전에 반드시 읽는다
- ADK API를 사용할 때 기억에 의존하지 않고 문서나 소스를 확인한다
- Docker 로그, grep 결과 등 실제 증거를 기반으로 판단한다
- 스크린샷 분석 시 보이는 그대로를 말한다. 추측으로 "정상"이라 하지 않는다

### 5. git commit 규칙

- 리뷰를 통과한 구현에 대해서 commit할 것인지 사용자에게 물어봐라.
- commit message는 angular convention을 따른다.
- 파일 수정 전 반드시 Read로 현재 내용 확인
- 구조 변경 시 "복사 → 전환 → 삭제" 순서 (기존 기능 유지)

### 6. Issue 생성 규칙

- [Issue Template](.github/ISSUE_TEMPLATE/custom.md)를 따른다.
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

## 에이전트 폴더 규칙

```
에이전트 = 폴더 + agent.py
하위 에이전트 = sub_agents/ 폴더
도구 = tools/ 안에 1파일 = 1함수
instruction 10줄 초과 = instructions/ 폴더로 분리
```

---

### features/agents 구조 (agent_chat/knowledge_chat 공통)

```
agents/agent_chat/ (또는 agents/knowledge_chat/)
├── agent.py              ← 루트 에이전트 (LoopAgent: router + verifier)
├── model.py              ← LLM 모델 설정 (env에서 읽음)
├── router.py             ← FastAPI 엔드포인트 + ADK Runner
├── instructions/         ← instruction 텍스트 분리
├── callbacks/            ← ADK 콜백 (8종)
├── tools/                ← 1파일 = 1함수
│   └── qualitative/      ← 질적검색 도구
├── sub_agents/           ← 서브에이전트 트리
│   └── analysis/         ← PLI/사분위/WCA 분석
└── schemas/
```

---

## ADK 핵심 규칙

### Instruction

| 종류 | 용도 | 주의 |
|------|------|------|
| `instruction` | 동적. `{var}`로 state 변수 치환 | `{}`는 state 변수로 파싱됨. 예시 텍스트에 `{}` 쓰지 말 것 |
| `global_instruction` | 전체 sub_agent에 전파 | 현재 placeholder. 의도적으로 사용할 때만 채울 것 |
| `static_instruction` | 고정. 멀티모달 지원 | 현재 placeholder |

### Callback (8종)

`before_agent`, `after_agent`, `before_model`, `after_model`, `before_tool`, `after_tool`, `on_model_error`, `on_tool_error`

### 에이전트 타입

| 타입 | 용도 | 예시 |
|------|------|------|
| `LlmAgent` | LLM이 판단/도구 호출 | 라우터, 개별 조건 에이전트 |
| `ParallelAgent` | 하위 에이전트 병렬 실행 | business_info (5개 필드 동시), condition_setter (9개 조건 동시) |
| `SequentialAgent` | 하위 에이전트 순차 실행 | screening (ensure → condition → search) |
| `LoopAgent` | 하위 에이전트 반복 (escalate로 탈출) | kis_agent (router → verifier → retry) |
| `BaseAgent` | 모든 에이전트의 기반 클래스. LLM 없이 코드로 직접 처리 | DB 검증, API 호출 등 |
| `CustomAgent` | BaseAgent 확장. 조건 분기, 동적 에이전트 선택 등 자유로운 워크플로우 | 복잡한 오케스트레이션 |

### 절대 하지 말 것

- `output_schema`와 `tools` 동시 사용 — **Gemini 3.0만 지원**, GPT 등 다른 모델에서는 안 됨. 필요하면 sub-agent로 출력 포맷팅을 분리할 것
- `mode="ANY"` 사용 (무한 루프 발생)
- instruction 안에 예시 텍스트로 `{한국어}` 사용 (state 변수로 파싱됨 → 에러)
- Python 코드로 ADK 워크플로우를 대체 (keyword matching, hardcoded fallback 등)

---

## LLM 모델

```python
# vendor/kis/model.py, vendor/orbis/model.py
from google.adk.models.lite_llm import LiteLlm
_MODEL_ID = os.environ.get("LLM_MODEL", "openai/gpt-5.4-nano")
LLM_MODEL = LiteLlm(model=_MODEL_ID)
```

- 로컬 테스트: `openai/gpt-5.4-nano` ($0.20/$1.25 per 1M tokens)
- 상용: `openai/gpt-5.4` ($2.50/$15.00 per 1M tokens)
- 산업코드 웹 검색: `gemini-2.5-flash` (GoogleSearchTool 전용, 하드코딩)

---

## 테스트 & 검증

```bash
# 테스트
python3 -m pytest tests/ -v

# Docker 빌드 확인
docker compose up -d --build backend
docker compose logs --tail=20 backend

# 구 경로 잔존 확인 (리팩토링 후)
grep -rn "\.agents\.\|\.agent\.agent" app/ --include="*.py"
```

---

## Review guidelines

- Always write in Korean.
- Do not log PII or secrets.
- Check security, idempotency, and deduplication.
- Point out unnecessary or redundant code.
- Prefer maintainable code.

---

## 참고 링크

- ADK 공식문서: https://google.github.io/adk-docs/
- ADK GitHub: https://github.com/google/adk-python
- LiteLLM 문서: https://docs.litellm.ai/docs/providers
