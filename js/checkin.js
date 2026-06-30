/**
 * ChronosFocus — Check-in Module
 * 집중도 체크인 팝업 + 일일 피드백
 */

const CheckinModule = (() => {

  /* ════════════════════════════════════════
     CHECKIN PAGE
  ════════════════════════════════════════ */
  function render() {
    const page     = document.getElementById('page-checkin');
    const checkins = DB.Checkins.getToday();
    const scores   = DB.Patterns.getAverageScores();

    page.innerHTML = `
      <header class="page-header" style="padding-top:16px">
        <div class="page-header-left">
          <h1 class="page-title">집중도 체크인</h1>
          <div class="page-subtitle">오늘 실제 집중도를 기록하세요</div>
        </div>
      </header>

      <!-- Quick Checkin -->
      <div style="padding:16px">
        <div class="card">
          <div style="font-size:16px;font-weight:800;color:var(--text-primary);margin-bottom:6px">
            지금 집중도가 어느 정도인가요?
          </div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px">
            솔직한 기록이 더 정확한 추천을 만들어요
          </div>
          <div class="star-rating" id="checkin-stars">
            ${[1,2,3,4,5].map(n => `
              <button class="star-btn" data-val="${n}" onclick="CheckinModule.setRating(${n})" title="${n}점">
                ${'⭐'.repeat(n).slice(0,2)['⭐']}${n <= 2 ? '😩' : n === 3 ? '😐' : n === 4 ? '😊' : '🔥'}
              </button>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:8px;padding:0 4px">
            <span>집중 안 됨</span><span>보통</span><span>최고조!</span>
          </div>
          <div style="margin-top:20px;font-size:13px;color:var(--text-muted);text-align:center" id="checkin-hint">
            별을 탭해서 지금 집중도를 선택하세요
          </div>
          <button class="btn btn-primary btn-full" id="checkin-submit-btn"
                  onclick="CheckinModule.submitCheckin()" disabled style="margin-top:14px">
            기록하기
          </button>
        </div>
      </div>

      <!-- Today's Checkin History -->
      ${checkins.length ? `
        <div style="padding:0 16px">
          <div class="dash-section-header">
            <span class="dash-section-title">오늘 기록 (${checkins.length}개)</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${checkins.slice().reverse().map(c => {
              const slot = ALGO.getSlotInfo(c.slot);
              const emojis = ['','😩','😟','😐','😊','🔥'];
              return `
                <div style="display:flex;align-items:center;gap:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:12px">
                  <span style="font-size:24px">${emojis[c.focus_level] || '😐'}</span>
                  <div style="flex:1">
                    <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${slot.emoji} ${slot.label}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${new Date(c.created_at).toLocaleTimeString('ko-KR', {hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                  <div style="font-size:20px;font-weight:800;color:var(--accent-secondary)">${c.focus_level}.0</div>
                </div>`;
            }).join('')}
          </div>
        </div>` : ''}

      <!-- Weekly Trend -->
      <div style="padding:16px">
        <div class="card">
          <div style="font-size:14px;font-weight:700;color:var(--text-secondary);margin-bottom:14px">📊 내 집중도 기준값</div>
          ${ALGO.SLOTS.map(s => {
            const score = scores[s.id] || 2;
            const info  = ALGO.getFocusLabel(score);
            const pct   = score / 5 * 100;
            return `
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <span style="font-size:16px;width:24px;text-align:center">${s.emoji}</span>
                <span style="font-size:12px;color:var(--text-muted);width:36px;flex-shrink:0">${s.label}</span>
                <div style="flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden">
                  <div style="width:${pct}%;height:100%;background:${info.color};border-radius:4px;transition:width 0.8s ease"></div>
                </div>
                <span style="font-size:12px;font-weight:700;color:${info.color};width:28px;text-align:right">${score.toFixed(1)}</span>
              </div>`;
          }).join('')}
          <p style="font-size:11px;color:var(--text-muted);margin-top:8px">체크인을 많이 할수록 더 정확하게 보정돼요</p>
        </div>
      </div>
    `;
  }

  let _currentRating = 0;

  function setRating(n) {
    _currentRating = n;
    const emojis   = ['','😩 집중 안 됨','😟 조금 안 됨','😐 보통','😊 집중 잘 됨','🔥 최고조!'];
    const stars    = document.querySelectorAll('.star-btn');
    stars.forEach((btn, i) => {
      btn.classList.toggle('active', i < n);
    });
    const hint   = document.getElementById('checkin-hint');
    const submit = document.getElementById('checkin-submit-btn');
    if (hint)   hint.textContent = emojis[n] || '';
    if (submit) submit.disabled  = false;
  }

  function submitCheckin() {
    if (!_currentRating) return;
    const slot = ALGO.getCurrentSlot();
    DB.Checkins.add(slot, _currentRating);
    Toast.show('success', '기록 완료!', '집중도가 기록되어 추천이 개선됩니다 📈');
    _currentRating = 0;
    render();
  }

  /* ════════════════════════════════════════
     DAILY FEEDBACK (End of Day)
  ════════════════════════════════════════ */
  function showDailyFeedback() {
    let _satisfaction = 0;
    let _followed = true;

    ModalManager.show(`
      <div class="modal-handle"></div>
      <div class="modal-title">오늘 하루 피드백</div>
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px">
        추천대로 작업을 배치하셨나요? 오늘 하루를 평가해주세요.
      </p>

      <div style="margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:12px">오늘 만족도는?</div>
        <div class="star-rating" id="feedback-stars">
          ${[1,2,3,4,5].map(n => `
            <button class="star-btn" data-val="${n}" onclick="CheckinModule.setFeedbackRating(${n})" title="${n}점">
              ${'⭐'}
            </button>`).join('')}
        </div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:12px">
          추천대로 작업을 진행했나요?
        </div>
        <div class="segmented" id="followed-seg">
          <button class="seg-btn active" data-val="yes" onclick="CheckinModule.setFollowed(true, this)">
            <i class="fa-solid fa-thumbs-up"></i>네, 따랐어요
          </button>
          <button class="seg-btn" data-val="no" onclick="CheckinModule.setFollowed(false, this)">
            <i class="fa-solid fa-thumbs-down"></i>아니요
          </button>
        </div>
      </div>

      <button class="btn btn-primary btn-full" id="feedback-submit"
              onclick="CheckinModule.submitFeedback()" disabled>
        피드백 제출하기
      </button>
    `);
  }

  let _fbRating   = 0;
  let _fbFollowed = true;

  function setFeedbackRating(n) {
    _fbRating = n;
    document.querySelectorAll('#feedback-stars .star-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i < n);
    });
    const submit = document.getElementById('feedback-submit');
    if (submit) submit.disabled = false;
  }

  function setFollowed(val, el) {
    _fbFollowed = val;
    document.querySelectorAll('#followed-seg .seg-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }

  function submitFeedback() {
    if (!_fbRating) return;
    DB.Feedback.add({
      satisfaction: _fbRating,
      followed_recommendation: _fbFollowed,
    });
    ModalManager.hide();
    Toast.show('success', '피드백 감사해요!', '내일 더 맞춤화된 추천을 받을 수 있어요 🎯');
    // Refresh dashboard nudge
    const nudge = document.getElementById('dash-feedback-nudge');
    if (nudge) nudge.innerHTML = '';
  }

  /* ════════════════════════════════════════
     AUTO POPUP (Random Checkin)
  ════════════════════════════════════════ */
  let _popupShown  = false;
  let _lastPopupTime = 0;

  function maybeShowPopup() {
    const now = Date.now();
    if (_popupShown) return;
    if (now - _lastPopupTime < 45 * 60 * 1000) return; // Max once per 45min

    const recent = DB.Checkins.getLastHour();
    if (recent.length > 0) return; // Already checked in recently

    // 30% chance
    if (Math.random() > 0.3) return;

    _showAutoPopup();
  }

  function _showAutoPopup() {
    _popupShown  = true;
    _lastPopupTime = Date.now();

    const popup = document.getElementById('checkin-popup');
    if (!popup) return;

    let _popupRating = 0;

    popup.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:15px;font-weight:800;color:var(--text-primary)">잠깐! 지금 집중도는?</div>
        <button onclick="CheckinModule.hidePopup()" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--text-muted)">✕</button>
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
        1초면 충분해요 — 나만의 리듬 데이터를 쌓아보세요
      </div>
      <div style="display:flex;justify-content:space-between;gap:8px" id="popup-levels">
        ${[
          {n:1,e:'😩',l:'최저'},{n:2,e:'😟',l:'낮음'},{n:3,e:'😐',l:'보통'},{n:4,e:'😊',l:'높음'},{n:5,e:'🔥',l:'최고'}
        ].map(item => `
          <button onclick="CheckinModule.submitPopupRating(${item.n})"
                  style="flex:1;background:var(--bg-input);border:1.5px solid var(--border-color);border-radius:12px;padding:10px 4px;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;gap:4px"
                  onmouseover="this.style.borderColor='var(--accent-primary)'"
                  onmouseout="this.style.borderColor='var(--border-color)'" >
            <span style="font-size:22px">${item.e}</span>
            <span style="font-size:10px;color:var(--text-muted);font-weight:600">${item.l}</span>
          </button>`).join('')}
      </div>`;

    popup.classList.remove('hidden');

    // Auto-hide after 20 seconds
    setTimeout(() => hidePopup(), 20000);
  }

  function submitPopupRating(n) {
    const slot = ALGO.getCurrentSlot();
    DB.Checkins.add(slot, n);
    const emojis = ['','😩','😟','😐','😊','🔥'];
    Toast.show('success', `집중도 ${n}/5 기록!`, `${emojis[n]} 데이터가 쌓이고 있어요.`);
    hidePopup();
  }

  function hidePopup() {
    const popup = document.getElementById('checkin-popup');
    if (popup) popup.classList.add('hidden');
    _popupShown = false;
  }

  return {
    render,
    setRating, submitCheckin,
    showDailyFeedback, setFeedbackRating, setFollowed, submitFeedback,
    maybeShowPopup, submitPopupRating, hidePopup,
  };
})();
