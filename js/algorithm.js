/**
 * ChronosFocus — Core Algorithm
 * ─────────────────────────────────────────────────────────────
 * TypeScript-style documented JavaScript
 *
 * KEY EXPORTS:
 *   ALGO.getCurrentSlot()                → string
 *   ALGO.getRecommendation(tasks, scores) → RecommendationResult
 *   ALGO.smartSchedule(tasks, scores)    → ScheduledTask[]
 *   ALGO.getFocusLabel(score)            → { level, label, color }
 *   ALGO.DEFAULT_FOCUS_SCORES()          → SlotScores
 */

const ALGO = (() => {

  /* ══════════════════════════════════════════════
     CONSTANTS & DATA DEFINITIONS
  ══════════════════════════════════════════════ */

  /**
   * @typedef {'dawn'|'morning'|'forenoon'|'lunch'|'afternoon'|'evening'|'night'} Slot
   */

  /** Slot definitions with hour ranges */
  const SLOTS = [
    { id: 'dawn',      label: '새벽',  emoji: '🌙', hours: [0, 5],  theme: 'dawn'      },
    { id: 'morning',   label: '아침',  emoji: '🌅', hours: [5, 9],  theme: 'morning'   },
    { id: 'forenoon',  label: '오전',  emoji: '☀️', hours: [9, 12], theme: 'forenoon'  },
    { id: 'lunch',     label: '점심',  emoji: '🌞', hours: [12, 14],theme: 'lunch'     },
    { id: 'afternoon', label: '오후',  emoji: '🌤', hours: [14, 18],theme: 'afternoon' },
    { id: 'evening',   label: '저녁',  emoji: '🌆', hours: [18, 21],theme: 'evening'   },
    { id: 'night',     label: '밤',    emoji: '🌜', hours: [21, 24],theme: 'night'     },
  ];

  /** Chronotype definitions (5 types) */
  const CHRONOTYPES = {
    owl: {
      id: 'owl',
      name: '올빼미 학자',
      emoji: '🦉',
      title: '새벽을 지배하는 올빼미 학자',
      desc: '밤이 깊어질수록 두뇌가 활성화되는 야행성 천재형. 고요한 새벽과 밤에 집중력이 폭발합니다.',
      traits: ['야행성', '집중력 폭발', '새벽 글쟁이', '밤의 코더'],
      scores: { dawn: 4.5, morning: 1.5, forenoon: 2.5, lunch: 2.0, afternoon: 3.0, evening: 4.0, night: 5.0 },
      color: '#7c6af5',
      peak_slots: ['night', 'dawn'],
      low_slots: ['morning', 'lunch'],
    },
    eagle: {
      id: 'eagle',
      name: '오전 폭주족',
      emoji: '🦅',
      title: '오전 10시의 브레인 폭주족',
      desc: '아침 햇살과 함께 두뇌가 최고 속도로 가동. 오전에 하루 일과의 80%를 끝내버리는 타입.',
      traits: ['얼리버드', '오전 집중', '빠른 실행', '오후엔 충전'],
      scores: { dawn: 2.0, morning: 4.5, forenoon: 5.0, lunch: 3.5, afternoon: 2.5, evening: 2.0, night: 1.5 },
      color: '#38bdf8',
      peak_slots: ['forenoon', 'morning'],
      low_slots: ['night', 'dawn'],
    },
    lion: {
      id: 'lion',
      name: '점심의 사자',
      emoji: '🦁',
      title: '오전 11시~오후 2시를 지배하는 사자',
      desc: '오전 중후반부터 점심 시간대에 최고의 퍼포먼스를 발휘. 균형 잡힌 하루를 선호합니다.',
      traits: ['균형형', '집중 지속', '점심 피크', '안정적'],
      scores: { dawn: 1.5, morning: 3.5, forenoon: 4.5, lunch: 5.0, afternoon: 3.5, evening: 2.5, night: 2.0 },
      color: '#fbbf24',
      peak_slots: ['lunch', 'forenoon'],
      low_slots: ['dawn', 'night'],
    },
    bear: {
      id: 'bear',
      name: '오후엔 단순노동 로봇',
      emoji: '🐻',
      title: '오후엔 단순노동이 체질인 로봇',
      desc: '표준적인 생체리듬을 가진 다수형. 오전에 적당히, 오후엔 루틴 업무에 특화된 실용주의자.',
      traits: ['표준형', '루틴 선호', '오후 실행', '저녁 회복'],
      scores: { dawn: 1.5, morning: 3.0, forenoon: 4.0, lunch: 3.0, afternoon: 4.5, evening: 3.0, night: 2.0 },
      color: '#f97316',
      peak_slots: ['afternoon', 'forenoon'],
      low_slots: ['dawn', 'night'],
    },
    dolphin: {
      id: 'dolphin',
      name: '저녁 돌고래',
      emoji: '🐬',
      title: '저녁 노을에 영감받는 창의 돌고래',
      desc: '오후 늦게서야 두뇌가 워밍업 완료. 저녁 황금 시간대에 창의적 작업이 폭발적으로 쏟아집니다.',
      traits: ['저녁형', '창의적', '영감형', '저녁 피크'],
      scores: { dawn: 2.0, morning: 2.0, forenoon: 3.0, lunch: 2.5, afternoon: 3.5, evening: 5.0, night: 4.5 },
      color: '#e879f9',
      peak_slots: ['evening', 'night'],
      low_slots: ['morning', 'dawn'],
    },
  };

  /** Focus score → level mapping */
  const FOCUS_LEVELS = [
    { min: 4.5, level: 'peak',   label: '최고조',   short: '상', color: '#38bdf8', recommend: 'high' },
    { min: 3.5, level: 'high',   label: '높음',     short: '상', color: '#34d399', recommend: 'high' },
    { min: 2.5, level: 'medium', label: '보통',     short: '중', color: '#fbbf24', recommend: 'any'  },
    { min: 1.5, level: 'low',    label: '낮음',     short: '하', color: '#f97316', recommend: 'low'  },
    { min: 0,   level: 'rest',   label: '휴식',     short: '휴', color: '#94a3b8', recommend: 'rest' },
  ];

  /** Smart recommendation messages */
  const REC_MESSAGES = {
    peak: [
      "🧠 두뇌 회전이 MAX! 지금 이 순간이 당신의 황금 시간입니다. 가장 어렵고 중요한 **고등 작업**에 집중하세요.",
      "⚡️ 집중력 폭발 시간대! 기획, 의사결정, 복잡한 문제 해결에 최적입니다.",
      "🚀 최고 퍼포먼스 구간! 미뤄뒀던 핵심 **고등 작업**을 지금 처리하세요.",
    ],
    high: [
      "✅ 집중력이 충분합니다. **고등 작업**을 처리하기 좋은 시간이에요.",
      "💡 두뇌가 활성화된 상태입니다. 창의적인 작업에 집중해보세요.",
    ],
    medium: [
      "⚖️ 집중력이 적당한 시간대. 중간 난이도의 작업이나 가벼운 **고등 작업**을 처리하세요.",
      "☕ 커피 한 잔과 함께 중요도가 높은 **단순 작업**부터 정리해보는 건 어떨까요?",
    ],
    low: [
      "😌 집중력이 다소 낮은 시간. 이메일 회신, 자료 정리 같은 **단순 작업**을 처리하기 좋습니다.",
      "🔋 에너지 충전 구간! 가벼운 **단순 작업**으로 성취감을 챙겨보세요.",
      "📋 두뇌를 쉬게 하면서 할 수 있는 루틴 업무 시간입니다.",
    ],
    rest: [
      "💤 휴식이 필요한 시간대입니다. 억지로 집중하려 하지 마세요.",
      "🌙 충분한 휴식은 다음 피크 시간을 위한 투자입니다.",
    ],
  };

  /* ══════════════════════════════════════════════
     CORE FUNCTIONS
  ══════════════════════════════════════════════ */

  /**
   * 현재 시각 → Slot ID 반환
   * @returns {string} slot id
   */
  function getCurrentSlot() {
    const hour = new Date().getHours();
    const slot = SLOTS.find(s => hour >= s.hours[0] && hour < s.hours[1]);
    return slot ? slot.id : 'night';
  }

  /**
   * Slot ID → Slot 객체 반환
   * @param {string} slotId
   */
  function getSlotInfo(slotId) {
    return SLOTS.find(s => s.id === slotId) || SLOTS[0];
  }

  /**
   * focus score → level 정보 반환
   * @param {number} score 1~5
   */
  function getFocusLabel(score) {
    return FOCUS_LEVELS.find(l => score >= l.min) || FOCUS_LEVELS[FOCUS_LEVELS.length - 1];
  }

  /**
   * 기본 집중도 점수 (균형형 기본값)
   * @returns {Record<string, number>}
   */
  function DEFAULT_FOCUS_SCORES() {
    return { dawn: 2.0, morning: 3.5, forenoon: 4.5, lunch: 3.0, afternoon: 3.5, evening: 3.0, night: 2.5 };
  }

  /**
   * ★ 핵심 추천 알고리즘 ★
   *
   * 현재 시간대의 집중도 + 남은 할 일 목록을 분석하여
   * "지금 해야 할 일"과 추천 메시지를 반환.
   *
   * @param {Array}  tasks  - DB.Tasks.getToday() 결과
   * @param {Object} scores - 슬롯별 집중도 점수 { dawn: 2, morning: 4, ... }
   * @returns {RecommendationResult}
   */
  function getRecommendation(tasks, scores) {
    const currentSlot  = getCurrentSlot();
    const currentScore = scores[currentSlot] || 3;
    const focusInfo    = getFocusLabel(currentScore);
    const slotInfo     = getSlotInfo(currentSlot);

    // 남은 할 일 분류
    const remaining  = tasks.filter(t => t.status !== 'done');
    const highTasks  = remaining.filter(t => t.category === 'high');
    const lowTasks   = remaining.filter(t => t.category === 'low');

    // 현재 시간에 최적 작업 타입 결정
    let recommendedCategory = focusInfo.recommend;
    let prioritizedTasks    = [];

    if (recommendedCategory === 'high') {
      // 고등 작업이 없으면 단순 작업 추천
      prioritizedTasks = highTasks.length > 0 ? highTasks : lowTasks;
    } else if (recommendedCategory === 'low') {
      prioritizedTasks = lowTasks.length > 0 ? lowTasks : highTasks;
    } else if (recommendedCategory === 'any') {
      // 긴급 우선, 그다음 고등, 그다음 단순
      const urgent = remaining.filter(t => t.priority === 'urgent');
      prioritizedTasks = urgent.length > 0 ? urgent : remaining;
    } else {
      prioritizedTasks = remaining;
    }

    // 상위 3개 추천
    const topTasks = prioritizedTasks.slice(0, 3);

    // 추천 메시지 랜덤 선택
    const msgs    = REC_MESSAGES[focusInfo.level] || REC_MESSAGES.medium;
    const message = msgs[Math.floor(Math.random() * msgs.length)];

    // 알림용 메시지
    const notificationMsg = _buildNotificationMessage(slotInfo, focusInfo, topTasks);

    return {
      currentSlot,
      slotInfo,
      currentScore,
      focusInfo,
      recommendedCategory,
      message,
      notificationMsg,
      topTasks,
      remainingCount: remaining.length,
      highCount: highTasks.length,
      lowCount:  lowTasks.length,
    };
  }

  /**
   * ★ 스마트 스케줄러 알고리즘 ★
   *
   * 할 일 목록 + 집중도 점수를 받아서
   * 각 할 일에 최적 시간대(슬롯)를 자동 배치.
   *
   * @param {Array}  tasks  - 미완료 할 일 목록
   * @param {Object} scores - 슬롯별 집중도
   * @returns {Array} tasks with recommended_slot assigned
   */
  function smartSchedule(tasks, scores) {
    // 슬롯을 집중도 순으로 정렬
    const sortedSlots = SLOTS.map(s => ({
      ...s,
      score: scores[s.id] || 2,
      assignedMinutes: 0,  // 이미 배치된 시간
    })).sort((a, b) => b.score - a.score);

    const highTasks = tasks.filter(t => t.category === 'high').sort((a,b) => _priorityWeight(b) - _priorityWeight(a));
    const lowTasks  = tasks.filter(t => t.category === 'low').sort((a,b) => _priorityWeight(b) - _priorityWeight(a));

    // 고등 작업 → 집중도 높은 슬롯에 배치
    const highSlots = sortedSlots.filter(s => s.score >= 3.5);
    const lowSlots  = sortedSlots.filter(s => s.score < 3.5);

    const scheduled = [];

    highTasks.forEach((task, i) => {
      const slot = highSlots[i % Math.max(highSlots.length, 1)];
      scheduled.push({ ...task, recommended_slot: slot ? slot.id : 'forenoon' });
    });

    lowTasks.forEach((task, i) => {
      const slot = (lowSlots.length > 0 ? lowSlots : sortedSlots.slice(-3))[i % Math.max(lowSlots.length, 1)];
      scheduled.push({ ...task, recommended_slot: slot ? slot.id : 'afternoon' });
    });

    return scheduled;
  }

  /**
   * 온보딩 답변 → 집중 유형 판별
   * @param {Object} answers - { q1: 'a', q2: 'b', ... }
   * @returns {{ typeId, type, scores }}
   */
  function analyzeOnboarding(answers) {
    const scores = { owl: 0, eagle: 0, lion: 0, bear: 0, dolphin: 0 };

    // Q1: 기상 시간
    const q1 = { a: { eagle: 3, lion: 1 }, b: { lion: 2, bear: 2 }, c: { bear: 1, dolphin: 2 }, d: { owl: 3, dolphin: 1 } };
    // Q2: 최고 집중 시간대
    const q2 = { a: { owl: 3 }, b: { eagle: 3 }, c: { eagle: 1, lion: 3 }, d: { lion: 1, bear: 3 }, e: { dolphin: 3 }, f: { owl: 2, dolphin: 2 } };
    // Q3: 아침 기상 후 컨디션
    const q3 = { a: { eagle: 3, lion: 1 }, b: { bear: 2, lion: 1 }, c: { bear: 1, dolphin: 1 }, d: { owl: 2, dolphin: 2 } };
    // Q4: 오후 슬럼프 대처
    const q4 = { a: { bear: 2, eagle: 1 }, b: { lion: 2, bear: 1 }, c: { dolphin: 2 }, d: { owl: 3, dolphin: 1 } };
    // Q5: 이상적인 작업 환경
    const q5 = { a: { eagle: 2, lion: 1 }, b: { bear: 2 }, c: { owl: 2, dolphin: 1 }, d: { dolphin: 3, owl: 1 } };
    // Q6: 취침 시간
    const q6 = { a: { eagle: 2 }, b: { lion: 2, bear: 1 }, c: { bear: 2, dolphin: 1 }, d: { owl: 3 } };

    const qMaps = { q1, q2, q3, q4, q5, q6 };

    Object.entries(answers).forEach(([q, ans]) => {
      const map = qMaps[q];
      if (!map || !map[ans]) return;
      Object.entries(map[ans]).forEach(([type, pts]) => {
        scores[type] = (scores[type] || 0) + pts;
      });
    });

    // 최고 점수 유형 선택
    const topType = Object.entries(scores).sort((a,b) => b[1] - a[1])[0][0];
    const typeData = CHRONOTYPES[topType];

    return {
      typeId: topType,
      type: typeData,
      allScores: scores,
      focusScores: _blendScores(typeData.scores, answers),
    };
  }

  /**
   * 온보딩에서 wake/sleep 시간 반영하여 focus scores 미세 조정
   */
  function _blendScores(baseScores, answers) {
    const blended = { ...baseScores };
    // 아침형이면 dawn을 조금 낮추고 forenoon 높임
    if (answers.q1 === 'a') {
      blended.forenoon = Math.min(5, blended.forenoon + 0.3);
      blended.dawn     = Math.max(1, blended.dawn - 0.3);
    }
    // 올빼미형이면 night 높임
    if (answers.q1 === 'd') {
      blended.night = Math.min(5, blended.night + 0.3);
      blended.morning = Math.max(1, blended.morning - 0.2);
    }
    return blended;
  }

  /* ── Private Helpers ── */
  function _priorityWeight(task) {
    return { urgent: 3, normal: 2, low: 1 }[task.priority] || 2;
  }

  function _buildNotificationMessage(slotInfo, focusInfo, topTasks) {
    const taskList = topTasks.slice(0,2).map(t => `'${t.title}'`).join(', ');
    const recType  = focusInfo.recommend === 'high' ? '고등 작업' : '단순 작업';

    if (focusInfo.level === 'peak' || focusInfo.level === 'high') {
      return `${slotInfo.emoji} ${slotInfo.label} 황금 시간! 집중력이 최고조입니다. ${taskList ? taskList + ' 등의 ' : ''}${recType}을 지금 처리하세요.`;
    } else if (focusInfo.level === 'low' || focusInfo.level === 'rest') {
      return `${slotInfo.emoji} 집중도가 낮은 시간대네요. ${taskList ? taskList + ' 같은 ' : ''}가벼운 ${recType}으로 부담을 줄여보세요.`;
    } else {
      return `${slotInfo.emoji} ${slotInfo.label}입니다. ${taskList ? taskList + ' 등의 ' : ''}작업을 처리하기 좋은 시간이에요.`;
    }
  }

  /* ══════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════ */
  return {
    SLOTS,
    CHRONOTYPES,
    FOCUS_LEVELS,
    getCurrentSlot,
    getSlotInfo,
    getFocusLabel,
    DEFAULT_FOCUS_SCORES,
    getRecommendation,
    smartSchedule,
    analyzeOnboarding,
  };

})();
