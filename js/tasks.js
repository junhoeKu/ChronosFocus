/**
 * ChronosFocus — Tasks Module
 * 투두리스트 이원화 (고등 작업 / 단순 작업)
 */

const TasksModule = (() => {

  let _filter = 'all';
  let _selectedCategory = null;
  let _selectedPriority = 'normal';

  /* ════════════════════════════════════════
     TASKS LIST PAGE
  ════════════════════════════════════════ */
  function render() {
    const page  = document.getElementById('page-tasks');
    const tasks = DB.Tasks.getToday();

    const counts = {
      all: tasks.length,
      high: tasks.filter(t => t.category === 'high').length,
      low:  tasks.filter(t => t.category === 'low').length,
      done: tasks.filter(t => t.status === 'done').length,
    };

    page.innerHTML = `
      <header class="page-header" style="padding-top:16px">
        <div class="page-header-left">
          <div class="page-subtitle">${_todayLabel()}</div>
          <h1 class="page-title">할 일 목록</h1>
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('add-task')">
          <i class="fa-solid fa-plus"></i> 추가
        </button>
      </header>

      <!-- Filter Tabs -->
      <div class="tasks-filter">
        <button class="filter-tab ${_filter==='all'?'active':''}" onclick="TasksModule.setFilter('all')">
          전체 <span class="filter-count">${counts.all}</span>
        </button>
        <button class="filter-tab ${_filter==='high'?'active':''}" onclick="TasksModule.setFilter('high')">
          🧠 고등 작업 <span class="filter-count">${counts.high}</span>
        </button>
        <button class="filter-tab ${_filter==='low'?'active':''}" onclick="TasksModule.setFilter('low')">
          📋 단순 작업 <span class="filter-count">${counts.low}</span>
        </button>
        <button class="filter-tab ${_filter==='done'?'active':''}" onclick="TasksModule.setFilter('done')">
          ✅ 완료 <span class="filter-count">${counts.done}</span>
        </button>
      </div>

      <!-- Smart Schedule Banner -->
      ${_renderSmartBanner(tasks)}

      <!-- Task Sections -->
      <div class="task-sections" id="task-sections"></div>
    `;

    _renderSections(tasks);
  }

  function _renderSmartBanner(tasks) {
    const scores    = DB.Patterns.getAverageScores();
    const rec       = ALGO.getRecommendation(tasks, scores);
    const focusInfo = rec.focusInfo;

    return `
      <div style="padding:12px 16px 0">
        <div class="smart-rec-box">
          <span class="smart-rec-icon">${rec.slotInfo.emoji}</span>
          <div class="smart-rec-text">
            <div class="smart-rec-title">지금 추천</div>
            <div class="smart-rec-body" style="color:${focusInfo.color}">
              ${focusInfo.recommend === 'high' ? '🧠 <strong>고등 작업</strong>에 집중할 시간!' : focusInfo.recommend === 'low' ? '📋 <strong>단순 작업</strong>을 처리하기 좋아요' : '자유롭게 작업을 선택하세요'}
              <span style="font-size:11px;color:var(--text-muted);margin-left:6px">(집중도 ${rec.currentScore.toFixed(1)})</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function _renderSections(allTasks) {
    const container = document.getElementById('task-sections');
    if (!container) return;

    const filtered = _filter === 'all'  ? allTasks :
                     _filter === 'high' ? allTasks.filter(t => t.category === 'high') :
                     _filter === 'low'  ? allTasks.filter(t => t.category === 'low')  :
                     allTasks.filter(t => t.status === 'done');

    const scores    = DB.Patterns.getAverageScores();
    const scheduled = ALGO.smartSchedule(filtered.filter(t => t.status !== 'done'), scores);
    const currentSlot  = ALGO.getCurrentSlot();
    const currentScore = scores[currentSlot] || 3;
    const focusInfo    = ALGO.getFocusLabel(currentScore);

    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎉</div>
          <div class="empty-title">모두 완료했어요!</div>
          <div class="empty-desc">오늘 할 일을 모두 처리했습니다.<br>내일의 할 일을 미리 추가해보세요.</div>
          <button class="btn btn-primary" onclick="App.navigate('add-task')" style="margin-top:16px">
            <i class="fa-solid fa-plus"></i> 새 할 일 추가
          </button>
        </div>`;
      return;
    }

    // Separate sections
    const highTasks = filtered.filter(t => t.category === 'high' && t.status !== 'done');
    const lowTasks  = filtered.filter(t => t.category === 'low'  && t.status !== 'done');
    const doneTasks = filtered.filter(t => t.status === 'done');

    let html = '';

    if (_filter !== 'done') {
      if (_filter === 'all' || _filter === 'high') {
        html += _renderSection('🧠 고등 작업', 'cognitive', highTasks, scheduled, currentSlot, focusInfo, 'high');
      }
      if (_filter === 'all' || _filter === 'low') {
        html += _renderSection('📋 단순 작업', 'simple', lowTasks, scheduled, currentSlot, focusInfo, 'low');
      }
      if (doneTasks.length && _filter === 'all') {
        html += _renderSection('✅ 완료됨', 'done', doneTasks, [], currentSlot, focusInfo, null);
      }
    } else {
      html += _renderSection('✅ 완료된 항목', 'done', filtered, [], currentSlot, focusInfo, null);
    }

    container.innerHTML = html;
  }

  function _renderSection(title, type, tasks, scheduled, currentSlot, focusInfo, category) {
    if (!tasks.length) return '';
    const isRecommended = (category === 'high' && focusInfo.recommend === 'high') ||
                          (category === 'low'  && focusInfo.recommend === 'low');

    return `
      <div>
        <div class="task-section-head">
          <div class="task-section-title" style="${isRecommended ? 'color:var(--accent-secondary)' : ''}">
            <span class="icon">${type === 'cognitive' ? '🧠' : type === 'simple' ? '📋' : '✅'}</span>
            ${title}
            ${isRecommended ? '<span class="glass-pill" style="font-size:10px">지금 추천</span>' : ''}
          </div>
          <span class="task-section-count">${tasks.length}개</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${tasks.map(task => _renderTaskCard(task, scheduled, currentSlot, focusInfo)).join('')}
        </div>
      </div>`;
  }

  function _renderTaskCard(task, scheduled, currentSlot, focusInfo) {
    const isDone    = task.status === 'done';
    const recSlot   = scheduled.find(s => s.id === task.id)?.recommended_slot || task.recommended_slot || currentSlot;
    const slotInfo  = ALGO.getSlotInfo(recSlot);
    const isNow     = recSlot === currentSlot;
    const priInfo   = { urgent: { label: '긴급', cls: 'badge-high' }, normal: { label: '보통', cls: 'badge-medium' }, low: { label: '낮음', cls: 'badge-low' } };
    const pri       = priInfo[task.priority] || priInfo.normal;

    return `
      <div class="task-card ${task.category === 'high' ? 'high-cognitive' : 'low-cognitive'} ${isDone ? 'done' : ''}"
           onclick="TasksModule.showDetail('${task.id}')">
        ${isNow && !isDone ? '<div class="task-now-indicator">⚡ 지금!</div>' : ''}
        <button class="task-check-btn ${isDone ? 'done' : ''}"
                onclick="event.stopPropagation();TasksModule.toggleTask('${task.id}')"></button>
        <div class="task-card-body">
          <div class="task-card-title">${task.title}</div>
          <div class="task-card-meta">
            <span class="badge ${pri.cls}">${pri.label}</span>
            <span class="badge ${task.category === 'high' ? 'badge-cognitive' : 'badge-simple'}">
              ${task.category === 'high' ? '고등' : '단순'}
            </span>
            ${task.estimated_min ? `<span class="glass-pill" style="font-size:10px"><i class="fa-regular fa-clock"></i>${task.estimated_min}분</span>` : ''}
          </div>
          <div class="task-slot-rec">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span>${slotInfo.emoji} ${slotInfo.label} 추천</span>
            ${isNow && !isDone ? '<span class="task-slot-match">✓ 지금 최적 시간!</span>' : ''}
          </div>
        </div>
      </div>`;
  }

  /* ════════════════════════════════════════
     ADD TASK PAGE
  ════════════════════════════════════════ */
  function renderAddTask() {
    const page = document.getElementById('page-add-task');
    const scores = DB.Patterns.getAverageScores();
    const currentSlot = ALGO.getCurrentSlot();
    const currentScore = scores[currentSlot] || 3;
    const focusInfo = ALGO.getFocusLabel(currentScore);

    page.innerHTML = `
      <header class="page-header" style="padding-top:16px">
        <div class="page-header-left">
          <h1 class="page-title">할 일 추가</h1>
          <div class="page-subtitle">작업 유형을 먼저 선택하세요</div>
        </div>
      </header>

      <div class="add-task-form">

        <!-- Category Cards -->
        <div class="form-group">
          <label class="form-label">📌 작업 유형 선택</label>
          <div class="category-cards">
            <div class="category-card ${_selectedCategory === 'high' ? 'selected-high' : ''}"
                 onclick="TasksModule.selectCategory('high', this)">
              <div class="cat-icon">🧠</div>
              <div class="cat-name">고등 작업</div>
              <div class="cat-desc">깊은 사고와 집중이 필요한 업무</div>
              <div class="cat-examples">
                <span class="cat-example-tag">기획서</span>
                <span class="cat-example-tag">의사결정</span>
                <span class="cat-example-tag">코딩</span>
                <span class="cat-example-tag">공부</span>
              </div>
            </div>
            <div class="category-card ${_selectedCategory === 'low' ? 'selected-low' : ''}"
                 onclick="TasksModule.selectCategory('low', this)">
              <div class="cat-icon">📋</div>
              <div class="cat-name">단순 작업</div>
              <div class="cat-desc">루틴하고 기계적으로 처리 가능한 업무</div>
              <div class="cat-examples">
                <span class="cat-example-tag">이메일</span>
                <span class="cat-example-tag">자료정리</span>
                <span class="cat-example-tag">입력작업</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Title -->
        <div class="form-group">
          <label class="form-label">✏️ 할 일</label>
          <input type="text" class="form-input" id="task-title-input"
                 placeholder="무엇을 해야 하나요?" maxlength="80"
                 oninput="TasksModule.updateSmartRec()" />
        </div>

        <!-- Priority -->
        <div class="form-group">
          <label class="form-label">🔥 우선순위</label>
          <div class="priority-selector" id="priority-selector">
            <button class="pri-btn" data-val="urgent" onclick="TasksModule.selectPriority('urgent', this)">
              🔴 긴급
            </button>
            <button class="pri-btn sel-normal" data-val="normal" onclick="TasksModule.selectPriority('normal', this)">
              🟡 보통
            </button>
            <button class="pri-btn" data-val="low" onclick="TasksModule.selectPriority('low', this)">
              🟢 낮음
            </button>
          </div>
        </div>

        <!-- Estimated Time -->
        <div class="form-group">
          <label class="form-label">⏱ 예상 소요 시간</label>
          <select class="form-select" id="task-time-input">
            <option value="">선택 안 함</option>
            <option value="15">15분</option>
            <option value="30">30분</option>
            <option value="60">1시간</option>
            <option value="90">1시간 30분</option>
            <option value="120">2시간</option>
            <option value="180">3시간+</option>
          </select>
        </div>

        <!-- Smart Recommendation Box -->
        <div class="smart-rec-box" id="smart-rec-preview">
          <span class="smart-rec-icon">🤖</span>
          <div class="smart-rec-text">
            <div class="smart-rec-title">AI 추천 시간대</div>
            <div class="smart-rec-body" id="smart-rec-content">
              작업 유형을 선택하면 최적 시간대를 추천해드려요.
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button class="btn btn-primary btn-lg btn-full" onclick="TasksModule.submitTask()">
          <i class="fa-solid fa-plus"></i> 할 일 추가하기
        </button>
      </div>`;
  }

  /* ── Category / Priority Selectors ── */
  function selectCategory(cat, el) {
    _selectedCategory = cat;
    document.querySelectorAll('.category-card').forEach(c => {
      c.classList.remove('selected-high', 'selected-low');
    });
    el.classList.add(cat === 'high' ? 'selected-high' : 'selected-low');
    updateSmartRec();
  }

  function selectPriority(val, el) {
    _selectedPriority = val;
    document.querySelectorAll('.pri-btn').forEach(b => {
      b.classList.remove('sel-urgent','sel-normal','sel-low');
    });
    el.classList.add(`sel-${val}`);
  }

  function updateSmartRec() {
    const recEl = document.getElementById('smart-rec-content');
    if (!recEl || !_selectedCategory) return;

    const scores    = DB.Patterns.getAverageScores();
    const slotsList = ALGO.SLOTS;

    // Find best slot for this category
    const sorted = [...slotsList].sort((a, b) => {
      const sa = scores[a.id] || 2;
      const sb = scores[b.id] || 2;
      return _selectedCategory === 'high' ? sb - sa : sa - sb;
    });

    const best = sorted[0];
    const bestScore = scores[best.id] || 2;
    const info = ALGO.getFocusLabel(bestScore);

    recEl.innerHTML = `<strong style="color:${info.color}">${best.emoji} ${best.label}</strong> 시간대가 최적입니다 (집중도 ${bestScore.toFixed(1)}).<br>
      <span style="font-size:11px;color:var(--text-muted)">${_selectedCategory === 'high' ? '고등 작업은 집중도가 가장 높은 시간에!' : '단순 작업은 집중도가 낮은 시간을 활용하세요.'}</span>`;
  }

  /* ── Submit Task ── */
  function submitTask() {
    const titleEl = document.getElementById('task-title-input');
    const timeEl  = document.getElementById('task-time-input');

    if (!titleEl) return;
    const title = titleEl.value.trim();

    if (!title) { Toast.show('warning', '입력 필요', '할 일 제목을 입력해주세요.'); return; }
    if (!_selectedCategory) { Toast.show('warning', '선택 필요', '작업 유형을 선택해주세요.'); return; }

    // Compute recommended slot
    const scores  = DB.Patterns.getAverageScores();
    const tmpTask = { category: _selectedCategory, priority: _selectedPriority };
    const sched   = ALGO.smartSchedule([tmpTask], scores);
    const recSlot = sched[0]?.recommended_slot || ALGO.getCurrentSlot();

    const task = DB.Tasks.add({
      title,
      category: _selectedCategory,
      priority: _selectedPriority,
      estimated_min: timeEl ? parseInt(timeEl.value) || null : null,
      recommended_slot: recSlot,
    });

    Toast.show('success', '추가 완료!', `'${title}' 할 일이 추가됐습니다.`);

    // Reset form
    _selectedCategory = null;
    titleEl.value = '';
    App.navigate('tasks');
  }

  /* ── Task Detail Modal ── */
  function showDetail(taskId) {
    const task = DB.Tasks.getAll().find(t => t.id === taskId);
    if (!task) return;

    const scores   = DB.Patterns.getAverageScores();
    const recSlot  = task.recommended_slot || ALGO.getCurrentSlot();
    const slotInfo = ALGO.getSlotInfo(recSlot);
    const priInfo  = { urgent: '🔴 긴급', normal: '🟡 보통', low: '🟢 낮음' };

    ModalManager.show(`
      <div class="modal-handle"></div>
      <div class="task-detail-header">
        <div class="task-detail-title">${task.title}</div>
        <button class="btn btn-icon btn-danger btn-sm" onclick="TasksModule.deleteTask('${task.id}')" title="삭제">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      <div class="task-detail-badges">
        <span class="badge ${task.category === 'high' ? 'badge-cognitive' : 'badge-simple'}">
          ${task.category === 'high' ? '🧠 고등 작업' : '📋 단순 작업'}
        </span>
        <span class="badge ${task.priority === 'urgent' ? 'badge-high' : task.priority === 'low' ? 'badge-low' : 'badge-medium'}">
          ${priInfo[task.priority] || priInfo.normal}
        </span>
        <span class="badge ${task.status === 'done' ? 'badge-low' : 'badge-medium'}">
          ${task.status === 'done' ? '✅ 완료' : '⏳ 진행 중'}
        </span>
      </div>

      <div class="task-detail-section">
        <div class="task-detail-label">추천 시간대</div>
        <div style="background:var(--bg-input);border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px">
          <span style="font-size:28px">${slotInfo.emoji}</span>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--text-primary)">${slotInfo.label}</div>
            <div style="font-size:12px;color:var(--text-muted)">집중도 ${(scores[recSlot] || 2).toFixed(1)}</div>
          </div>
        </div>
      </div>

      ${task.estimated_min ? `
        <div class="task-detail-section">
          <div class="task-detail-label">예상 소요 시간</div>
          <div style="font-size:15px;color:var(--text-secondary)"><i class="fa-regular fa-clock"></i> ${task.estimated_min >= 60 ? Math.floor(task.estimated_min/60) + '시간 ' + (task.estimated_min%60 ? task.estimated_min%60+'분' : '') : task.estimated_min + '분'}</div>
        </div>` : ''}

      <div class="task-detail-section">
        <div class="task-detail-label">추가 날짜</div>
        <div style="font-size:13px;color:var(--text-muted)">${new Date(task.created_at).toLocaleString('ko-KR')}</div>
      </div>

      <div style="display:flex;gap:10px;margin-top:8px">
        ${task.status !== 'done' ? `
          <button class="btn btn-primary btn-full" onclick="TasksModule.toggleTask('${task.id}');ModalManager.hide()">
            <i class="fa-solid fa-check"></i> 완료로 표시
          </button>` : `
          <button class="btn btn-outline btn-full" onclick="TasksModule.toggleTask('${task.id}');ModalManager.hide()">
            <i class="fa-solid fa-rotate-left"></i> 미완료로 되돌리기
          </button>`}
      </div>
    `);
  }

  /* ── Toggle / Delete ── */
  function toggleTask(taskId) {
    const task = DB.Tasks.getAll().find(t => t.id === taskId);
    if (!task) return;
    if (task.status === 'done') {
      DB.Tasks.update(taskId, { status: 'todo', completed_at: null });
    } else {
      DB.Tasks.complete(taskId);
      Toast.show('success', '완료!', `'${task.title.slice(0,20)}' 완료! 🎉`);
    }
    render();
  }

  function deleteTask(taskId) {
    DB.Tasks.remove(taskId);
    ModalManager.hide();
    Toast.show('info', '삭제', '할 일이 삭제되었습니다.');
    render();
  }

  function setFilter(f) {
    _filter = f;
    render();
  }

  function _todayLabel() {
    const d = new Date();
    const days = ['일','월','화','수','목','금','토'];
    return `${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  }

  return { render, renderAddTask, selectCategory, selectPriority, updateSmartRec, submitTask, showDetail, toggleTask, deleteTask, setFilter };
})();
