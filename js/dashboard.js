/**
 * ChronosFocus — Dashboard Page
 * 타임라인 대시보드 (Chart.js 집중도 곡선 + 슬롯 타임라인)
 */

const DashboardModule = (() => {

  let _chart = null;
  let _clockInterval = null;
  let _recommendationRefreshInterval = null;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  function render() {
    const page = document.getElementById('page-dashboard');
    const user = DB.User.get();
    const scores = DB.Patterns.getAverageScores();

    page.innerHTML = `
      <!-- Dynamic Header -->
      <header class="page-header" style="padding-top:16px">
        <div class="page-header-left">
          <div class="page-subtitle" id="dash-greeting"></div>
          <h1 class="page-title">
            ${user?.focus_type ? `<span style="color:var(--accent-secondary)">${_getTypeEmoji(user.focus_type)}</span> ` : ''}오늘의 리듬
          </h1>
        </div>
        <button class="btn btn-icon btn-ghost" onclick="DashboardModule.refresh()" title="새로고침">
          <i class="fa-solid fa-rotate"></i>
        </button>
      </header>

      <!-- Now Banner -->
      <section class="now-banner" style="margin-top:16px">
        <div class="now-banner-top">
          <div class="now-time">
            <div class="now-clock" id="dash-clock">--:--</div>
            <div class="now-date" id="dash-date"></div>
          </div>
          <div class="now-slot-badge" id="dash-slot-badge">-- 시간대</div>
        </div>
        <div class="focus-level-bar" id="dash-focus-bar"></div>
        <div class="now-recommendation" id="dash-recommendation">
          <div class="now-rec-label">🤖 AI 추천</div>
          <div class="now-rec-text">분석 중...</div>
        </div>
      </section>

      <!-- Slot Timeline -->
      <section class="dash-section">
        <div class="dash-section-header">
          <span class="dash-section-title"><i class="fa-solid fa-timeline" style="margin-right:6px"></i>하루 집중도 흐름</span>
          <button class="dash-section-link" onclick="DashboardModule.editScores()">수정</button>
        </div>
        <div class="slot-timeline" id="slot-timeline"></div>
      </section>

      <!-- Focus Curve Chart -->
      <section class="dash-section">
        <div class="timeline-chart-wrap">
          <div class="timeline-chart-header">
            <span class="timeline-chart-title">📈 나의 집중도 곡선</span>
            <div class="timeline-legend">
              <div class="legend-item"><div class="legend-dot" style="background:var(--accent-primary)"></div>집중도</div>
              <div class="legend-item"><div class="legend-dot" style="background:rgba(255,255,255,0.2)"></div>적정선</div>
            </div>
          </div>
          <div class="chart-container" style="height:200px">
            <canvas id="focus-chart"></canvas>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="dash-section">
        <div class="dash-section-header">
          <span class="dash-section-title">오늘의 현황</span>
        </div>
        <div class="stats-row" id="dash-stats"></div>
      </section>

      <!-- Today's Tasks -->
      <section class="dash-section">
        <div class="dash-section-header">
          <span class="dash-section-title">오늘 할 일</span>
          <button class="dash-section-link" onclick="App.navigate('tasks')">전체보기</button>
        </div>
        <div id="dash-task-list"></div>
      </section>

      <!-- Feedback Nudge (end of day) -->
      <div id="dash-feedback-nudge" style="padding:0 16px 20px"></div>
    `;

    // Initialize components
    _startClock();
    _renderSlotTimeline(scores);
    _renderChart(scores);
    _renderStats();
    _renderTaskList();
    _updateRecommendation();
    _renderFeedbackNudge();
  }

  /* ── Clock ── */
  function _startClock() {
    if (_clockInterval) clearInterval(_clockInterval);
    _updateClock();
    _clockInterval = setInterval(_updateClock, 1000);
  }

  function _updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('dash-clock');
    const dateEl  = document.getElementById('dash-date');
    if (!clockEl) { clearInterval(_clockInterval); return; }

    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    clockEl.textContent = `${h}:${m}`;

    const days = ['일','월','화','수','목','금','토'];
    dateEl.textContent = `${now.getFullYear()}. ${now.getMonth()+1}. ${now.getDate()} (${days[now.getDay()]})`;
  }

  /* ── Slot Timeline ── */
  function _renderSlotTimeline(scores) {
    const container = document.getElementById('slot-timeline');
    if (!container) return;

    const currentSlot = ALGO.getCurrentSlot();

    container.innerHTML = ALGO.SLOTS.map(slot => {
      const score     = scores[slot.id] || 2;
      const focusInfo = ALGO.getFocusLabel(score);
      const isCurrent = slot.id === currentSlot;

      return `
        <div class="slot-item ${isCurrent ? 'current' : ''}" 
             onclick="DashboardModule.showSlotDetail('${slot.id}')">
          <div class="slot-icon-wrap" style="background:${isCurrent ? 'var(--accent-glow)' : 'var(--bg-input)'}">
            ${slot.emoji}
          </div>
          <span class="slot-level-pill slot-level-${focusInfo.level === 'peak' || focusInfo.level === 'high' ? 'high' : focusInfo.level === 'medium' ? 'medium' : 'low'}">
            ${focusInfo.short}
          </span>
          <span class="slot-name">${slot.label}</span>
        </div>`;
    }).join('');
  }

  /* ── Chart.js Focus Curve ── */
  function _renderChart(scores) {
    const canvas = document.getElementById('focus-chart');
    if (!canvas) return;
    if (_chart) { _chart.destroy(); _chart = null; }

    const SLOT_LABELS = ['새벽','아침','오전','점심','오후','저녁','밤'];
    const SLOT_IDS    = ['dawn','morning','forenoon','lunch','afternoon','evening','night'];

    const dataPoints = SLOT_IDS.map(id => scores[id] || 2);

    // Interpolate to smoother curve (3 points per slot)
    const smoothLabels = [];
    const smoothData   = [];
    SLOT_IDS.forEach((id, i) => {
      const curr = dataPoints[i];
      const next = dataPoints[(i + 1) % SLOT_IDS.length];
      const label = SLOT_LABELS[i];
      smoothLabels.push(label, '', '');
      smoothData.push(curr, curr * 0.6 + next * 0.4, curr * 0.35 + next * 0.65);
    });

    const currentSlotIdx = SLOT_IDS.indexOf(ALGO.getCurrentSlot());
    const currentX       = currentSlotIdx * 3;

    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#38bdf8';
    const accentGlow  = getComputedStyle(document.body).getPropertyValue('--accent-glow').trim() || 'rgba(56,189,248,0.3)';

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0,   accentGlow.replace('0.3','0.4'));
    gradient.addColorStop(0.6, accentGlow.replace('0.3','0.1'));
    gradient.addColorStop(1,   'transparent');

    _chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: smoothLabels,
        datasets: [
          {
            label: '집중도',
            data: smoothData,
            fill: true,
            backgroundColor: gradient,
            borderColor: accentColor,
            borderWidth: 2.5,
            tension: 0.45,
            pointRadius: smoothData.map((_, i) => i % 3 === 0 ? 5 : 0),
            pointHoverRadius: 8,
            pointBackgroundColor: smoothData.map((_, i) => i % 3 === 0 ? accentColor : 'transparent'),
            pointBorderColor: 'transparent',
            pointBorderWidth: 0,
          },
          {
            label: '적정선',
            data: new Array(smoothData.length).fill(3),
            fill: false,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            borderDash: [4, 4],
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,20,35,0.95)',
            borderColor: accentColor,
            borderWidth: 1,
            titleColor: accentColor,
            bodyColor: '#e0e7ff',
            padding: 12,
            callbacks: {
              title(items) {
                const idx   = items[0].dataIndex;
                const sIdx  = Math.floor(idx / 3);
                return ALGO.SLOTS[sIdx]?.emoji + ' ' + (SLOT_LABELS[sIdx] || '');
              },
              label(item) {
                if (item.datasetIndex !== 0) return null;
                const score = item.raw;
                const info  = ALGO.getFocusLabel(score);
                return ` 집중도: ${score.toFixed(1)} / 5.0  (${info.label})`;
              }
            }
          },
          // Current time line annotation
          annotation: null,
        },
        scales: {
          x: {
            grid:  { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: 'rgba(255,255,255,0.35)',
              font: { size: 11, family: 'Pretendard, sans-serif' },
              maxRotation: 0,
              callback(val, idx) {
                return idx % 3 === 0 ? this.getLabelForValue(val) : '';
              }
            },
            border: { color: 'rgba(255,255,255,0.06)' }
          },
          y: {
            min: 0, max: 5,
            grid:  { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: 'rgba(255,255,255,0.35)',
              font: { size: 11 },
              stepSize: 1,
              callback: v => ['휴','하','중','상','상+','최고'][v] || v,
            },
            border: { color: 'rgba(255,255,255,0.06)' }
          }
        },
        animation: { duration: 800, easing: 'easeInOutQuart' }
      }
    });

    // Draw current time indicator after chart renders
    setTimeout(() => _drawCurrentTimeIndicator(currentX, smoothData.length), 900);
  }

  function _drawCurrentTimeIndicator(xIdx, total) {
    if (!_chart) return;
    try {
      const meta = _chart.getDatasetMeta(0);
      if (!meta.data[xIdx]) return;
      const x   = meta.data[xIdx].x;
      const ctx = _chart.ctx;
      const chartArea = _chart.chartArea;

      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();

      // "NOW" label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font      = 'bold 10px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NOW', x, chartArea.top - 4);
      ctx.restore();
    } catch(e) {}
  }

  /* ── Recommendation ── */
  function _updateRecommendation() {
    const recEl = document.getElementById('dash-recommendation');
    const badgeEl = document.getElementById('dash-slot-badge');
    const barEl   = document.getElementById('dash-focus-bar');
    if (!recEl) return;

    const tasks  = DB.Tasks.getToday();
    const scores = DB.Patterns.getAverageScores();
    const rec    = ALGO.getRecommendation(tasks, scores);

    // Slot badge
    if (badgeEl) badgeEl.innerHTML = `${rec.slotInfo.emoji} ${rec.slotInfo.label}`;

    // Focus level bar
    if (barEl) {
      const pct = (rec.currentScore / 5 * 100).toFixed(0);
      barEl.innerHTML = `
        <span class="focus-level-label">집중도</span>
        <div class="focus-level-track">
          <div class="focus-level-fill" style="width:0%;background:${rec.focusInfo.color}"></div>
        </div>
        <span class="focus-level-value">${rec.currentScore.toFixed(1)}</span>`;
      setTimeout(() => {
        const fill = barEl.querySelector('.focus-level-fill');
        if (fill) { fill.style.transition = 'width 0.8s ease'; fill.style.width = pct + '%'; }
      }, 100);
    }

    // Recommendation text (bold markdown simple parse)
    const msgHtml = rec.message.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--accent-secondary)">$1</strong>');
    recEl.innerHTML = `
      <div class="now-rec-label">🤖 AI 추천 · ${rec.slotInfo.emoji} ${rec.slotInfo.label}</div>
      <div class="now-rec-text">${msgHtml}</div>
      ${rec.topTasks.length ? `
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
          ${rec.topTasks.map(t => `
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-secondary)">
              <i class="fa-solid ${t.category === 'high' ? 'fa-brain' : 'fa-check'}" style="color:${t.category === 'high' ? '#38bdf8' : '#c084fc'};font-size:11px"></i>
              <span>${t.title}</span>
            </div>`).join('')}
        </div>` : ''}`;
  }

  /* ── Stats ── */
  function _renderStats() {
    const container = document.getElementById('dash-stats');
    if (!container) return;

    const stats  = DB.Tasks.getTodayStats();
    const scores = DB.Patterns.getAverageScores();
    const currentScore = scores[ALGO.getCurrentSlot()] || 3;
    const focusInfo    = ALGO.getFocusLabel(currentScore);

    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${stats.done}</div>
        <div class="stat-label">완료</div>
        <div class="stat-sub">${stats.total}개 중</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${stats.rate}%</div>
        <div class="stat-label">달성률</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">${focusInfo.level === 'peak' || focusInfo.level === 'high' ? '🧠' : focusInfo.level === 'low' || focusInfo.level === 'rest' ? '😴' : '⚡'}</div>
        <div class="stat-value">${currentScore.toFixed(1)}</div>
        <div class="stat-label">현재 집중도</div>
        <div class="stat-sub">${focusInfo.label}</div>
      </div>`;
  }

  /* ── Task Mini List ── */
  function _renderTaskList() {
    const container = document.getElementById('dash-task-list');
    if (!container) return;

    const tasks = DB.Tasks.getToday();
    const scores = DB.Patterns.getAverageScores();
    const scheduled = ALGO.smartSchedule(
      tasks.filter(t => t.status !== 'done'),
      scores
    );

    // Merge scheduled back into all tasks
    const allDisplay = tasks.slice(0, 5);

    if (!allDisplay.length) {
      container.innerHTML = `
        <div class="empty-state" style="padding:32px 24px">
          <div class="empty-icon">📋</div>
          <div class="empty-title">오늘 할 일이 없어요</div>
          <div class="empty-desc">+ 버튼을 눌러 오늘의 할 일을 추가해보세요.</div>
        </div>`;
      return;
    }

    const currentSlot = ALGO.getCurrentSlot();
    const currentScore = scores[currentSlot] || 3;
    const focusInfo    = ALGO.getFocusLabel(currentScore);

    container.innerHTML = `
      <div class="task-mini-list">
        ${allDisplay.map(task => {
          const isDone   = task.status === 'done';
          const recSlot  = scheduled.find(s => s.id === task.id)?.recommended_slot || task.recommended_slot || currentSlot;
          const slotInfo = ALGO.getSlotInfo(recSlot);
          const isNow    = recSlot === currentSlot;
          const isMatch  = isNow && !isDone && (
            (task.category === 'high' && (focusInfo.recommend === 'high' || focusInfo.recommend === 'any')) ||
            (task.category === 'low'  && (focusInfo.recommend === 'low'  || focusInfo.recommend === 'any'))
          );

          return `
            <div class="task-mini" onclick="TasksModule.showDetail('${task.id}')">
              <button class="task-mini-check ${isDone ? 'done' : ''}"
                      onclick="event.stopPropagation();DashboardModule.toggleTask('${task.id}')"></button>
              <div class="task-mini-content">
                <div class="task-mini-title ${isDone ? 'done' : ''}">${task.title}</div>
                <div class="task-mini-meta">
                  <span class="task-mini-type ${task.category === 'high' ? 'type-high' : 'type-low'}">
                    ${task.category === 'high' ? '🧠 고등' : '📋 단순'}
                  </span>
                  <span class="task-mini-slot">${slotInfo.emoji} ${slotInfo.label} 추천</span>
                  ${isMatch ? '<span style="font-size:11px;color:#34d399;font-weight:700">⚡ 지금 최적!</span>' : ''}
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  /* ── Feedback Nudge ── */
  function _renderFeedbackNudge() {
    const container = document.getElementById('dash-feedback-nudge');
    if (!container) return;

    const hour = new Date().getHours();
    if (hour < 20) return; // 저녁 8시 이후만 표시

    if (DB.Feedback.hasTodayEntry()) return;

    container.innerHTML = `
      <div class="feedback-nudge" onclick="CheckinModule.showDailyFeedback()">
        <span class="emoji">🌙</span>
        <div class="feedback-nudge-text">
          <div class="feedback-nudge-title">오늘 하루 어떠셨나요?</div>
          <div class="feedback-nudge-sub">1분 피드백으로 내일 더 스마트한 추천을 받아보세요.</div>
        </div>
        <i class="fa-solid fa-chevron-right" style="color:var(--text-muted)"></i>
      </div>`;
  }

  /* ── Slot Detail ── */
  function showSlotDetail(slotId) {
    const scores   = DB.Patterns.getAverageScores();
    const slot     = ALGO.getSlotInfo(slotId);
    const score    = scores[slotId] || 2;
    const info     = ALGO.getFocusLabel(score);
    const tasks    = DB.Tasks.getToday().filter(t => t.recommended_slot === slotId || !t.recommended_slot);

    ModalManager.show(`
      <div class="modal-handle"></div>
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:8px">${slot.emoji}</div>
        <div style="font-size:20px;font-weight:800;color:var(--text-primary)">${slot.label}</div>
        <div style="font-size:13px;color:var(--text-muted)">${_slotHourRange(slotId)}</div>
      </div>
      <div style="background:var(--bg-input);border-radius:14px;padding:16px;margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:14px;font-weight:700;color:var(--text-secondary)">집중도</span>
          <span style="font-size:20px;font-weight:800;color:${info.color}">${score.toFixed(1)}</span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden">
          <div style="width:${score/5*100}%;height:100%;background:${info.color};border-radius:4px;transition:width 0.8s ease"></div>
        </div>
        <div style="margin-top:8px;font-size:13px;color:var(--text-muted)">추천 작업: <strong style="color:${info.color}">${info.recommend === 'high' ? '🧠 고등 작업' : info.recommend === 'low' ? '📋 단순 작업' : '자유롭게'}</strong></div>
      </div>
      ${tasks.length ? `
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:10px">이 시간대 할 일</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${tasks.slice(0,5).map(t => `
            <div style="display:flex;align-items:center;gap:10px;background:var(--bg-card);border-radius:10px;padding:10px 12px;border:1px solid var(--border-color)">
              <span style="font-size:14px">${t.category === 'high' ? '🧠' : '📋'}</span>
              <span style="font-size:14px;color:var(--text-primary);${t.status === 'done' ? 'text-decoration:line-through;opacity:0.5' : ''}">${t.title}</span>
            </div>`).join('')}
        </div>` : `<div class="empty-state" style="padding:24px"><div class="empty-icon" style="font-size:32px">📭</div><div class="empty-title">이 시간대 할 일 없음</div></div>`}
    `);
  }

  function _slotHourRange(slotId) {
    const ranges = { dawn:'오전 0~5시', morning:'오전 5~9시', forenoon:'오전 9~12시', lunch:'낮 12~14시', afternoon:'오후 14~18시', evening:'저녁 18~21시', night:'밤 21~24시' };
    return ranges[slotId] || '';
  }

  /* ── Edit Scores ── */
  function editScores() {
    const scores = DB.Patterns.getAverageScores();

    ModalManager.show(`
      <div class="modal-handle"></div>
      <div class="modal-title">집중도 직접 설정</div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">각 시간대의 평소 집중도를 설정해주세요. 실제 데이터가 쌓이면 자동으로 보정됩니다.</p>
      ${ALGO.SLOTS.map(s => {
        const v = scores[s.id] || 2;
        return `
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-size:14px;font-weight:600;color:var(--text-secondary)">${s.emoji} ${s.label}</span>
              <span style="font-size:14px;font-weight:700;color:var(--accent-secondary)" id="score-val-${s.id}">${v.toFixed(1)}</span>
            </div>
            <input type="range" class="ob-slider" min="1" max="5" step="0.5" value="${v}"
                   oninput="document.getElementById('score-val-${s.id}').textContent=parseFloat(this.value).toFixed(1)"
                   data-slot="${s.id}" id="score-slider-${s.id}" />
          </div>`;
      }).join('')}
      <button class="btn btn-primary btn-full" onclick="DashboardModule.saveEditedScores()" style="margin-top:8px">
        저장 <i class="fa-solid fa-check"></i>
      </button>
    `);
  }

  function saveEditedScores() {
    const scores = {};
    ALGO.SLOTS.forEach(s => {
      const el = document.getElementById(`score-slider-${s.id}`);
      if (el) scores[s.id] = parseFloat(el.value);
    });
    DB.User.setFocusScores(scores);
    // Also save as onboarding patterns
    ALGO.SLOTS.forEach(s => {
      DB.Patterns.add({ slot: s.id, focus_level: scores[s.id], source: 'manual' });
    });
    ModalManager.hide();
    Toast.show('success', '저장 완료', '집중도가 업데이트되었습니다!');
    render();
  }

  /* ── Toggle Task ── */
  function toggleTask(taskId) {
    const task = DB.Tasks.complete(taskId);   // 완료↔미완료 토글은 DB가 담당
    if (task && task.status === 'done') {
      Toast.show('success', '완료!', `'${task.title.slice(0,20)}' 완료했습니다 🎉`);
    }
    _renderStats();
    _renderTaskList();
  }

  function refresh() {
    render();
    Toast.show('info', '새로고침', '대시보드가 업데이트되었습니다.');
  }

  function _getTypeEmoji(typeId) {
    return ALGO.CHRONOTYPES[typeId]?.emoji || '⏱';
  }

  return { render, toggleTask, showSlotDetail, editScores, saveEditedScores, refresh };
})();
