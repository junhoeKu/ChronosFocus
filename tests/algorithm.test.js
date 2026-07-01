/**
 * ChronosFocus — algorithm.js 단위 테스트 (Node 실행용)
 *
 * 실행:  node tests/algorithm.test.js
 *
 * algorithm.js는 순수 함수(DOM/DB 미접근)이므로 브라우저 없이 Node에서
 * 그대로 require 하여 검증할 수 있다. (이 파일이 window/document/localStorage
 * 없이 돌아간다는 사실 자체가 "순수성"의 증거이기도 하다.)
 *
 * 커버리지: Phase 3 완료 기준(계획서 §3.8)
 *   ① 고등 작업 → 집중도 높은 슬롯   ② 단순 작업 → 집중도 낮은 슬롯
 *   ③ 우선순위가 배치 순서에 반영      ④ 긴 작업이 한 슬롯에 몰리지 않음(용량)
 *   ⑤ getRecommendation의 urgent 폴백  ⑥ estimated_min 기본값(30분)
 */

const assert = require('node:assert');
const ALGO   = require('../js/algorithm.js');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`✅ ${name}`); passed++; }
  catch (e) { console.error(`❌ ${name}\n   → ${e.message}`); failed++; }
}

// 모든 슬롯을 같은 점수로 채우는 헬퍼 (getRecommendation는 현재 시각 슬롯을 보므로
// 시각과 무관하게 결과를 고정하려면 전 슬롯을 같은 값으로 둔다)
const allScores = v => ({ dawn:v, morning:v, forenoon:v, lunch:v, afternoon:v, evening:v, night:v });

// smartSchedule 테스트용 점수 (집중도 내림차순: forenoon>afternoon>morning>night>evening>lunch>dawn)
const SCORES = { dawn:1, morning:4, forenoon:5, lunch:1.5, afternoon:4.5, evening:2, night:2.5 };
const CAP    = { dawn:120, morning:180, forenoon:180, lunch:60, afternoon:240, evening:180, night:180 };

/* ── ① 고등 작업 → 집중도 가장 높은 슬롯 ── */
test('고등 작업 1개는 집중도 최고 슬롯(forenoon)에 배치된다', () => {
  const [r] = ALGO.smartSchedule([{ id:'a', category:'high', priority:'normal', estimated_min:60 }], SCORES);
  assert.strictEqual(r.recommended_slot, 'forenoon');
});

/* ── ② 단순 작업 → 집중도 가장 낮은 슬롯 ── */
test('단순 작업 1개는 집중도 최저 슬롯(dawn)에 배치된다', () => {
  const [r] = ALGO.smartSchedule([{ id:'a', category:'low', priority:'normal', estimated_min:60 }], SCORES);
  assert.strictEqual(r.recommended_slot, 'dawn');
});

/* ── ③ 우선순위가 배치 순서에 반영 ── */
test('용량이 하나만 허용될 때 긴급 작업이 최고 슬롯을 차지한다', () => {
  // forenoon(cap180)에 120분짜리는 하나만 들어감 → 긴급이 먼저 차지해야 함
  const res = ALGO.smartSchedule([
    { id:'normal', category:'high', priority:'normal', estimated_min:120 },
    { id:'urgent', category:'high', priority:'urgent', estimated_min:120 },
  ], SCORES);
  const byId = Object.fromEntries(res.map(t => [t.id, t.recommended_slot]));
  assert.strictEqual(byId.urgent, 'forenoon', '긴급이 최고 슬롯을 못 가져감');
  assert.strictEqual(byId.normal, 'afternoon', '보통이 다음 슬롯으로 안 밀림');
});

/* ── ④ 긴 작업이 한 슬롯에 몰리지 않음(용량 초과 방지) ── */
test('120분 고등 작업 5개는 여러 슬롯에 분산되고 어떤 슬롯도 용량을 넘지 않는다', () => {
  const tasks = Array.from({ length:5 }, (_, i) => ({ id:'t'+i, category:'high', priority:'normal', estimated_min:120 }));
  const res   = ALGO.smartSchedule(tasks, SCORES);

  const used = new Set(res.map(t => t.recommended_slot));
  assert.ok(used.size >= 2, `한 슬롯에 몰림 (사용 슬롯: ${[...used]})`);

  const perSlot = {};
  res.forEach(t => { perSlot[t.recommended_slot] = (perSlot[t.recommended_slot] || 0) + 120; });
  for (const [slot, mins] of Object.entries(perSlot)) {
    assert.ok(mins <= CAP[slot], `${slot} 용량 초과: ${mins} > ${CAP[slot]}`);
  }
});

/* ── ⑥ estimated_min 없으면 30분으로 계산 ── */
test('예상시간 없는 고등 작업 7개 중 6개(=180/30)가 최고 슬롯을 채운다', () => {
  const tasks = Array.from({ length:7 }, (_, i) => ({ id:'t'+i, category:'high', priority:'normal' }));
  const res   = ALGO.smartSchedule(tasks, SCORES);
  const inForenoon = res.filter(t => t.recommended_slot === 'forenoon').length;
  assert.strictEqual(inForenoon, 6, `forenoon(180분)에 30분짜리 6개가 아니라 ${inForenoon}개`);
});

/* ── getRecommendation: 집중도에 따라 추천 유형이 바뀜 ── */
test('집중도 최고(5.0)이면 고등 작업을 추천한다', () => {
  const rec = ALGO.getRecommendation([{ id:'h', category:'high', status:'todo', priority:'normal' }], allScores(5));
  assert.strictEqual(rec.recommendedCategory, 'high');
  assert.ok(rec.topTasks.some(t => t.id === 'h'));
});

test('집중도 낮음(2.0)이면 단순 작업을 우선한다', () => {
  const rec = ALGO.getRecommendation([
    { id:'l', category:'low',  status:'todo', priority:'normal' },
    { id:'h', category:'high', status:'todo', priority:'normal' },
  ], allScores(2));
  assert.strictEqual(rec.recommendedCategory, 'low');
  assert.strictEqual(rec.topTasks[0].id, 'l');
});

/* ── ⑤ urgent 폴백: 추천 유형 작업이 없으면 긴급 작업을 노출 ── */
test('고집중 시간인데 고등 작업이 없으면 긴급 작업을 폴백으로 노출한다', () => {
  const rec = ALGO.getRecommendation([
    { id:'u', category:'low', status:'todo', priority:'urgent' },
  ], allScores(5)); // recommend=high, 그러나 high 작업 없음 → urgent 폴백
  assert.strictEqual(rec.recommendedCategory, 'high');
  assert.strictEqual(rec.topTasks[0].id, 'u');
});

/* ── 완료된 작업 제외 + Top 3 제한 ── */
test('완료 작업은 제외하고 topTasks는 최대 3개', () => {
  const rec = ALGO.getRecommendation([
    { id:'d', category:'high', status:'done',  priority:'normal' },
    { id:'1', category:'high', status:'todo',  priority:'normal' },
    { id:'2', category:'high', status:'todo',  priority:'normal' },
    { id:'3', category:'high', status:'todo',  priority:'normal' },
    { id:'4', category:'high', status:'todo',  priority:'normal' },
  ], allScores(5));
  assert.ok(rec.topTasks.length <= 3);
  assert.ok(!rec.topTasks.some(t => t.id === 'd'), '완료 작업이 추천에 포함됨');
});

/* ── getFocusLabel 경계값 ── */
test('getFocusLabel 경계값이 올바른 레벨을 반환한다', () => {
  assert.strictEqual(ALGO.getFocusLabel(4.6).level, 'peak');
  assert.strictEqual(ALGO.getFocusLabel(3.6).level, 'high');
  assert.strictEqual(ALGO.getFocusLabel(2.6).level, 'medium');
  assert.strictEqual(ALGO.getFocusLabel(1.6).level, 'low');
  assert.strictEqual(ALGO.getFocusLabel(0.5).level, 'rest');
});

/* ── getCurrentSlot은 항상 유효한 슬롯을 반환한다 ── */
test('getCurrentSlot은 정의된 슬롯 중 하나를 반환한다', () => {
  const ids = ALGO.SLOTS.map(s => s.id);
  assert.ok(ids.includes(ALGO.getCurrentSlot()));
});

/* ── 요약 ── */
console.log(`\n${'─'.repeat(40)}\n결과: ${passed} 통과, ${failed} 실패`);
process.exit(failed ? 1 : 0);
