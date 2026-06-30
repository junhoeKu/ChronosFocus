/**
 * ChronosFocus — Notifications & Alert System
 * Web Notification API + In-app Toast
 */

const NotificationManager = (() => {
  let _granted   = false;
  let _intervals = [];

  /* ── Request Permission ── */
  async function requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') { _granted = true; return true; }
    if (Notification.permission === 'denied')  return false;

    const result = await Notification.requestPermission();
    _granted = result === 'granted';
    return _granted;
  }

  /* ── Send Web Notification ── */
  function sendNotification(title, body, icon = '⏱') {
    if (_granted && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${icon}</text></svg>`,
        badge: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⏱</text></svg>`,
        tag: 'chronosfocus',
        renotify: true,
      });
    }
    // Always show in-app toast too
    Toast.show('info', title, body);
  }

  /* ── Schedule Slot Notifications ── */
  function scheduleSlotNotifications() {
    // Clear existing
    _intervals.forEach(clearInterval);
    _intervals = [];

    // Check every minute if we entered a new slot
    let _lastSlot = ALGO.getCurrentSlot();

    const interval = setInterval(() => {
      const currentSlot = ALGO.getCurrentSlot();
      if (currentSlot !== _lastSlot) {
        _lastSlot = currentSlot;
        _onSlotChange(currentSlot);
      }

      // Auto checkin popup check
      CheckinModule.maybeShowPopup();

      // End of day feedback (20:00)
      const hour = new Date().getHours();
      if (hour === 20) {
        const date = DB._today ? DB._today() : new Date().toISOString().slice(0,10);
        if (!DB.Feedback.hasTodayEntry()) {
          _onEndOfDay();
        }
      }
    }, 60 * 1000);

    _intervals.push(interval);
  }

  function _onSlotChange(slotId) {
    const tasks  = DB.Tasks.getToday();
    const scores = DB.Patterns.getAverageScores();
    const rec    = ALGO.getRecommendation(tasks, scores);

    const msg = rec.notificationMsg;
    sendNotification(`${rec.slotInfo.emoji} ${rec.slotInfo.label} 시간대 시작`, msg, rec.slotInfo.emoji);

    // Refresh dashboard if visible
    const dashPage = document.getElementById('page-dashboard');
    if (dashPage && dashPage.classList.contains('active')) {
      DashboardModule.refresh();
    }
  }

  function _onEndOfDay() {
    Toast.show('warning', '🌙 하루 마무리', '오늘 하루 어떠셨나요? 피드백을 남겨주세요!', 8000);
    setTimeout(() => {
      const nudge = document.getElementById('dash-feedback-nudge');
      if (nudge && !nudge.innerHTML.trim()) {
        nudge.innerHTML = `
          <div class="feedback-nudge" onclick="CheckinModule.showDailyFeedback()">
            <span class="emoji">🌙</span>
            <div class="feedback-nudge-text">
              <div class="feedback-nudge-title">오늘 하루 어떠셨나요?</div>
              <div class="feedback-nudge-sub">1분 피드백으로 내일 더 스마트한 추천을 받아보세요.</div>
            </div>
            <i class="fa-solid fa-chevron-right" style="color:var(--text-muted)"></i>
          </div>`;
      }
    }, 500);
  }

  return { requestPermission, sendNotification, scheduleSlotNotifications };
})();

/* ══════════════════════════════════════════════
   Toast Manager (global utility)
══════════════════════════════════════════════ */
const Toast = (() => {
  const ICONS = {
    success: 'fa-solid fa-circle-check',
    warning: 'fa-solid fa-triangle-exclamation',
    info:    'fa-solid fa-circle-info',
    error:   'fa-solid fa-circle-xmark',
  };

  function show(type = 'info', title = '', body = '', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="toast-icon ${ICONS[type] || ICONS.info}"></i>
      <div class="toast-text">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${body  ? `<div class="toast-body">${body}</div>`   : ''}
      </div>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:14px;flex-shrink:0;padding:0 0 0 8px">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return { show };
})();

/* ══════════════════════════════════════════════
   Modal Manager (global utility)
══════════════════════════════════════════════ */
const ModalManager = (() => {
  function show(html) {
    const overlay   = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    if (!overlay || !container) return;

    container.innerHTML = html;
    overlay.classList.remove('hidden');
    container.classList.remove('hidden');

    overlay.onclick = hide;
  }

  function hide() {
    const overlay   = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    if (!overlay || !container) return;
    overlay.classList.add('hidden');
    container.classList.add('hidden');
  }

  return { show, hide };
})();
