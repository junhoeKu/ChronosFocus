/**
 * ChronosFocus — Profile Module
 */

const ProfileModule = (() => {

  function render() {
    const page = document.getElementById('page-profile');
    const user = DB.User.get();
    const type = user?.focus_type ? ALGO.CHRONOTYPES[user.focus_type] : null;
    const scores = DB.Patterns.getAverageScores();
    const allTasks = DB.Tasks.getAll();
    const doneTasks = allTasks.filter(t => t.status === 'done');
    const checkins  = DB.Checkins.getAll();

    page.innerHTML = `
      <header class="page-header" style="padding-top:16px">
        <div class="page-header-left">
          <h1 class="page-title">나의 프로필</h1>
        </div>
        <button class="btn btn-sm btn-ghost" onclick="ProfileModule.resetOnboarding()">
          <i class="fa-solid fa-rotate"></i> 재테스트
        </button>
      </header>

      <!-- Type Card -->
      ${type ? `
        <div style="padding:16px">
          <div class="card" style="text-align:center">
            <div style="font-size:56px;margin-bottom:8px">${type.emoji}</div>
            <div style="font-size:18px;font-weight:800;color:var(--text-primary);margin-bottom:4px">${type.name}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">${type.title}</div>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:16px">${type.desc}</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
              ${type.traits.map(t => `<span class="glass-pill">#${t}</span>`).join('')}
            </div>
            <div style="margin-top:16px;font-size:12px;color:var(--text-muted)">
              🏆 피크 시간: ${type.peak_slots.map(s => ALGO.getSlotInfo(s).label).join(', ')}
            </div>
          </div>
        </div>` : `
        <div style="padding:16px">
          <div class="card" style="text-align:center">
            <div style="font-size:40px;margin-bottom:8px">❓</div>
            <div style="font-size:16px;font-weight:700;color:var(--text-secondary)">아직 테스트를 완료하지 않았어요</div>
            <button class="btn btn-primary" onclick="ProfileModule.resetOnboarding()" style="margin-top:16px">
              지금 테스트하기
            </button>
          </div>
        </div>`}

      <!-- Stats Overview -->
      <div style="padding:0 16px">
        <div class="dash-section-header">
          <span class="dash-section-title">나의 통계</span>
        </div>
        <div class="stats-row" style="margin-bottom:16px">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-value">${allTasks.length}</div>
            <div class="stat-label">총 할 일</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">${doneTasks.length}</div>
            <div class="stat-label">완료</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💡</div>
            <div class="stat-value">${checkins.length}</div>
            <div class="stat-label">체크인 수</div>
          </div>
        </div>
      </div>

      <!-- Focus Scores -->
      <div style="padding:0 16px">
        <div class="dash-section-header">
          <span class="dash-section-title">나의 집중도 프로필</span>
          <button class="dash-section-link" onclick="DashboardModule.editScores()">수정</button>
        </div>
        <div class="card">
          ${ALGO.SLOTS.map(s => {
            const score = scores[s.id] || 2;
            const info  = ALGO.getFocusLabel(score);
            const pct   = score / 5 * 100;
            return `
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <span style="font-size:20px;width:28px;text-align:center">${s.emoji}</span>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:13px;font-weight:600;color:var(--text-secondary)">${s.label}</span>
                    <span style="font-size:12px;font-weight:700;color:${info.color}">${score.toFixed(1)} · ${info.label}</span>
                  </div>
                  <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">
                    <div style="width:${pct}%;height:100%;background:${info.color};border-radius:3px"></div>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- About -->
      <div style="padding:16px">
        <div class="card" style="text-align:center">
          <div style="font-size:28px;margin-bottom:8px">⏱</div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:4px">ChronosFocus v1.0</div>
          <div style="font-size:12px;color:var(--text-muted);line-height:1.6">
            생체 리듬 기반 생산성 관리 앱<br>
            당신의 황금 시간을 찾아드립니다
          </div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color)">
            <button class="btn btn-danger btn-sm" onclick="ProfileModule.clearData()">
              <i class="fa-solid fa-trash"></i> 데이터 초기화
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function resetOnboarding() {
    if (!confirm('유형 테스트를 다시 시작할까요? 기존 유형 데이터가 초기화됩니다.')) return;
    const user = DB.User.get() || {};
    DB.User.save({ ...user, onboarding_done: false, focus_type: null, focus_type_name: null });
    location.reload();
  }

  function clearData() {
    if (!confirm('모든 데이터를 초기화할까요? 되돌릴 수 없습니다.')) return;
    DB.clearAll();
    location.reload();
  }

  return { render, resetOnboarding, clearData };
})();
