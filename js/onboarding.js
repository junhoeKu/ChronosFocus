/**
 * ChronosFocus — Onboarding Module
 * 집중 유형 테스트 (6 questions) + 결과 카드
 */

const OnboardingModule = (() => {

  const QUESTIONS = [
    {
      id: 'q1',
      num: '01',
      question: '보통 몇 시에 기상하나요?',
      sub: '자연스럽게 눈이 떠지는 시간을 선택하세요.',
      options: [
        { val: 'a', emoji: '🌅', label: '오전 5~7시',    desc: '해뜨기 전이나 동트자마자 일어나요' },
        { val: 'b', emoji: '☀️', label: '오전 7~9시',    desc: '일반적인 아침 기상, 여유 있게 준비해요' },
        { val: 'c', emoji: '🕙', label: '오전 9~11시',   desc: '조금 늦게 일어나는 편이에요' },
        { val: 'd', emoji: '🌙', label: '오전 11시 이후', desc: '저는 확실히 올빼미형이에요' },
      ]
    },
    {
      id: 'q2',
      num: '02',
      question: '하루 중 언제 두뇌 회전이 가장 잘 되나요?',
      sub: '가장 복잡한 문제를 가장 잘 풀 수 있는 시간대를 선택하세요.',
      options: [
        { val: 'a', emoji: '🌙', label: '새벽 (0~5시)',    desc: '고요한 새벽, 방해 없이 최고의 집중!' },
        { val: 'b', emoji: '🌅', label: '아침 (5~9시)',    desc: '상쾌한 아침 공기와 함께 두뇌 풀가동' },
        { val: 'c', emoji: '☀️', label: '오전 (9~12시)',   desc: '해가 중천에 뜰 무렵, 황금 시간대' },
        { val: 'd', emoji: '🌞', label: '점심 (12~14시)',  desc: '점심 먹고 나서 오히려 더 명석해져요' },
        { val: 'e', emoji: '🌆', label: '저녁 (18~21시)',  desc: '퇴근 후, 저녁 노을이 지면 영감 폭발' },
        { val: 'f', emoji: '🌜', label: '밤 (21시 이후)',  desc: '세상이 잠들 때 나만의 시간이 시작돼요' },
      ]
    },
    {
      id: 'q3',
      num: '03',
      question: '아침에 기상 직후 컨디션은?',
      sub: '알람 끄고 5분 후의 내 상태를 솔직하게 선택하세요.',
      options: [
        { val: 'a', emoji: '⚡️', label: '즉시 풀가동!',     desc: '눈 뜨자마자 뇌가 돌아가요. 바로 일 시작!' },
        { val: 'b', emoji: '☕', label: '커피 한 잔이면 OK', desc: '30분 정도 워밍업하면 정상화돼요' },
        { val: 'c', emoji: '🥱', label: '한 시간은 걸려요', desc: '몸이 좀 풀려야 뇌도 작동하기 시작해요' },
        { val: 'd', emoji: '🧟', label: '좀비 상태 (2시간+)', desc: '오전은 거의 기능 불능 상태예요' },
      ]
    },
    {
      id: 'q4',
      num: '04',
      question: '오후 2~4시 사이에 집중력이 떨어질 때, 어떻게 하나요?',
      sub: '오후 슬럼프에 대처하는 당신의 방식은?',
      options: [
        { val: 'a', emoji: '💪', label: '그냥 억지로 밀어붙여요', desc: '의지력으로 버티는 스타일' },
        { val: 'b', emoji: '🚶', label: '잠깐 산책이나 스트레칭', desc: '몸을 움직이면 다시 집중돼요' },
        { val: 'c', emoji: '💤', label: '15~20분 파워냅(낮잠)', desc: '짧은 낮잠으로 완전히 리셋해요' },
        { val: 'd', emoji: '🌙', label: '포기. 저녁까지 기다려요', desc: '억지로 하면 더 비효율적이에요' },
      ]
    },
    {
      id: 'q5',
      num: '05',
      question: '가장 효율적으로 일하는 환경은?',
      sub: '당신이 몰입 상태(Flow)에 빠지는 환경을 선택하세요.',
      options: [
        { val: 'a', emoji: '☀️', label: '밝은 낮, 카페나 사무실', desc: '활기찬 환경에서 에너지를 받아요' },
        { val: 'b', emoji: '🏠', label: '집에서 혼자, 낮 시간',    desc: '익숙한 공간에서 루틴하게 일해요' },
        { val: 'c', emoji: '🌆', label: '저녁, 조명 어두운 공간',  desc: '석양 무렵부터 영감이 넘쳐요' },
        { val: 'd', emoji: '🌙', label: '새벽, 완전한 고요함',     desc: '세상이 잠든 시간, 나만의 집중 공간' },
      ]
    },
    {
      id: 'q6',
      num: '06',
      question: '보통 몇 시에 잠자리에 드나요?',
      sub: '억지로 잠들지 않고 자연스럽게 졸릴 때를 기준으로 하세요.',
      options: [
        { val: 'a', emoji: '😴', label: '밤 10시 이전',     desc: '일찍 자고 일찍 일어나는 게 체질' },
        { val: 'b', emoji: '🕐', label: '밤 10시~12시',     desc: '적당한 시간에 주무시는 편이에요' },
        { val: 'c', emoji: '🕑', label: '새벽 12시~2시',    desc: '조금 늦게까지 깨어있는 편이에요' },
        { val: 'd', emoji: '🌅', label: '새벽 2시 이후',    desc: '해가 뜰 때까지 깨어있기도 해요' },
      ]
    },
  ];

  let _answers  = {};
  let _currentQ = -1;    // -1 = welcome
  let _analysis = null;  // 분석 결과 (showResult → complete 간 공유)

  function init() {
    const wrapper = document.getElementById('onboarding');
    wrapper.innerHTML = _renderWelcome();
    wrapper.classList.remove('hidden');
  }

  /* ── Render Welcome ── */
  function _renderWelcome() {
    return `
      <div class="ob-welcome">
        <div class="ob-welcome-logo">⏱</div>
        <h1>당신의 <span>생체 리듬</span>을<br>찾아드릴게요</h1>
        <p>단 6개의 질문으로 나만의 집중도 패턴을 발견하고,<br>최적의 생산성 루틴을 만들어보세요.</p>
        <div class="ob-welcome-features">
          <div class="ob-feature-item">
            <span class="icon">🧬</span>
            <span>나만의 집중 유형 DNA 분석</span>
          </div>
          <div class="ob-feature-item">
            <span class="icon">⏰</span>
            <span>시간대별 맞춤 작업 추천</span>
          </div>
          <div class="ob-feature-item">
            <span class="icon">📈</span>
            <span>실시간 집중도 리듬 시각화</span>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" onclick="OnboardingModule.goToQuestion(0)">
          테스트 시작하기 <i class="fa-solid fa-arrow-right"></i>
        </button>
        <p style="font-size:12px;color:var(--text-muted);">약 2분 소요 · 무료 · 언제든 재설정 가능</p>
      </div>`;
  }

  /* ── Render Question ── */
  function _renderQuestion(idx) {
    const q    = QUESTIONS[idx];
    const total = QUESTIONS.length;
    const prog  = Math.round(((idx) / total) * 100);

    return `
      <div class="ob-progress-bar">
        <div class="ob-progress-track"><div class="ob-progress-fill" style="width:${prog}%"></div></div>
        <div class="ob-progress-label">${idx + 1} / ${total}</div>
      </div>
      <div class="ob-slides">
        <div class="ob-slide active">
          <div class="ob-slide-header">
            <div class="ob-question-num">질문 ${q.num}</div>
            <h2 class="ob-question">${q.question}</h2>
            <p class="ob-question-sub">${q.sub}</p>
          </div>
          <div class="ob-options" id="ob-options-${q.id}">
            ${q.options.map(o => `
              <button class="ob-option ${_answers[q.id] === o.val ? 'selected' : ''}"
                      onclick="OnboardingModule.selectOption('${q.id}', '${o.val}', this)"
                      data-val="${o.val}">
                <span class="ob-opt-emoji">${o.emoji}</span>
                <div class="ob-opt-text">
                  <div class="ob-opt-label">${o.label}</div>
                  <div class="ob-opt-desc">${o.desc}</div>
                </div>
                <div class="ob-opt-check"></div>
              </button>`).join('')}
          </div>
          <div class="ob-nav">
            ${idx > 0 ? `<button class="btn btn-outline" onclick="OnboardingModule.goToQuestion(${idx - 1})"><i class="fa-solid fa-arrow-left"></i> 이전</button>` : ''}
            <button class="btn btn-primary ${_answers[q.id] ? '' : 'disabled'}" 
                    id="ob-next-btn"
                    onclick="OnboardingModule.next(${idx})"
                    ${_answers[q.id] ? '' : 'disabled'}>
              ${idx < total - 1 ? '다음 <i class="fa-solid fa-arrow-right"></i>' : '결과 확인하기 🎉'}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Render Result ── */
  function _renderResult(analysis) {
    const type   = analysis.type;
    const scores = analysis.focusScores;
    const SLOTS  = ALGO.SLOTS;

    const scoreColors = ['#94a3b8','#fbbf24','#34d399','#38bdf8','#7c6af5'];

    // 피크 / 낮은 집중 시간대 라벨
    const slotText = ids => (ids || []).map(id => { const s = ALGO.getSlotInfo(id); return `${s.emoji} ${s.label}`; }).join(', ');
    const peakText = slotText(type.peak_slots);
    const lowText  = slotText(type.low_slots);

    return `
      <div class="ob-progress-bar">
        <div class="ob-progress-track"><div class="ob-progress-fill" style="width:100%"></div></div>
        <div class="ob-progress-label">결과 완성! 🎉</div>
      </div>
      <div class="ob-result">
        <div class="result-card-share" id="result-card">
          <div class="result-badge">✨ 나의 집중 유형</div>
          <span class="result-character">${type.emoji}</span>
          <div class="result-type-name">${type.name}</div>
          <div class="result-type-sub">${type.title}</div>
          <p style="font-size:13px;color:#9d93c8;text-align:center;line-height:1.6;margin:12px 0;">${type.desc}</p>
          <div style="display:flex;flex-direction:column;gap:6px;margin:6px 0 14px;">
            <div style="font-size:13px;color:#cbd5e1;">🔥 <strong>피크 시간대</strong> · ${peakText}</div>
            <div style="font-size:13px;color:#cbd5e1;">😴 <strong>낮은 집중 시간대</strong> · ${lowText}</div>
          </div>
          <div class="result-scores">
            ${SLOTS.map(s => {
              const score = scores[s.id] || 2;
              const pct   = (score / 5 * 100).toFixed(0);
              const col   = scoreColors[Math.min(Math.floor(score) - 1, 4)];
              return `
                <div class="result-score-item">
                  <span class="result-score-slot">${s.emoji}</span>
                  <div class="result-score-bar">
                    <div class="result-score-fill" style="width:${pct}%;background:${col}"></div>
                  </div>
                  <span class="result-score-val">${score.toFixed(1)}</span>
                </div>`;
            }).join('')}
          </div>
          <div class="result-traits">
            ${type.traits.map(t => `<span class="result-trait">#${t}</span>`).join('')}
          </div>
          <div class="result-watermark">⏱ ChronosFocus</div>
        </div>

        <button class="btn btn-primary btn-lg btn-full" onclick="OnboardingModule.complete()">
          나의 대시보드 시작하기 <i class="fa-solid fa-rocket"></i>
        </button>
      </div>`;
  }

  /* ── Public Methods ── */

  function goToQuestion(idx) {
    _currentQ = idx;
    const wrapper = document.getElementById('onboarding');
    wrapper.innerHTML = _renderQuestion(idx);
  }

  function selectOption(qId, val, el) {
    _answers[qId] = val;
    // UI update
    el.closest('.ob-options').querySelectorAll('.ob-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    // Enable next button
    const nextBtn = document.getElementById('ob-next-btn');
    if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.remove('disabled'); }
  }

  function next(currentIdx) {
    const q = QUESTIONS[currentIdx];
    if (!_answers[q.id]) { Toast.show('warning', '선택 필요', '항목을 선택해주세요!'); return; }

    if (currentIdx < QUESTIONS.length - 1) {
      goToQuestion(currentIdx + 1);
    } else {
      // All answered → analyze
      showResult();
    }
  }

  function showResult() {
    const analysis = ALGO.analyzeOnboarding(_answers);
    const wrapper  = document.getElementById('onboarding');
    wrapper.innerHTML = _renderResult(analysis);

    // Store for later
    _analysis = analysis;

    // Trigger bar fill animation after render
    setTimeout(() => {
      wrapper.querySelectorAll('.result-score-fill').forEach(el => {
        const w = el.style.width;
        el.style.width = '0%';
        setTimeout(() => { el.style.transition = 'width 0.8s ease'; el.style.width = w; }, 50);
      });
    }, 100);
  }

  function complete() {
    const analysis = _analysis;
    if (!analysis) return;

    // Save user data
    DB.User.save({
      onboarding_done: true,
      focus_type: analysis.typeId,
      focus_type_name: analysis.type.name,
      focus_scores: JSON.stringify(analysis.focusScores),
      wake_time: analysis.wakeTime,   // 나중에 수면↔집중도 분석용
      sleep_time: analysis.sleepTime,
    });

    // Save initial focus patterns
    ALGO.SLOTS.forEach(slot => {
      DB.Patterns.add({
        slot: slot.id,
        focus_level: analysis.focusScores[slot.id] || 3,
        source: 'onboarding'
      });
    });

    // Hide onboarding, show app
    const ob  = document.getElementById('onboarding');
    ob.style.opacity = '0';
    ob.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      ob.classList.add('hidden');
      App.showApp();
    }, 500);
  }

  return { init, goToQuestion, selectOption, next, showResult, complete };
})();
