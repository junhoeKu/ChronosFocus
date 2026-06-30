/**
 * ChronosFocus — Main App Controller
 */

const App = (() => {

  let _currentPage = 'dashboard';
  let _initialized = false;

  /* ════════════════════════════════════════
     CONFIG
     ⚠️ Phase 10(배포 직전): seedDemoTasks 및
        아래 _addDemoTasks() 함수를 통째로 삭제할 것.
        실사용자에게 본인이 만들지 않은 데모 작업이
        보이면 안 됨.
  ════════════════════════════════════════ */
  const CONFIG = {
    seedDemoTasks: false,   // 개발 중 화면 채울 때만 true로 켬 (기본 OFF)
  };

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  async function init() {
    // 1) Theme
    ThemeManager.start();

    // 2) Splash → Check onboarding
    await _waitSplash(2200);

    if (DB.User.isOnboarded()) {
      showApp();
    } else {
      // Show onboarding
      document.getElementById('splash-screen').classList.add('fade-out');
      setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
        OnboardingModule.init();
      }, 600);
    }
  }

  function _waitSplash(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ════════════════════════════════════════
     SHOW APP
  ════════════════════════════════════════ */
  function showApp() {
    _addDemoTasks();   // 개발 모드(CONFIG.seedDemoTasks=true)일 때만 데모 작업 생성
    const splash = document.getElementById('splash-screen');
    const app    = document.getElementById('app');

    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.classList.add('hidden');
      app.classList.remove('hidden');
      _setupNav();
      navigate('dashboard');
      NotificationManager.requestPermission();
      NotificationManager.scheduleSlotNotifications();

      // Schedule periodic checkin popup
      setTimeout(() => CheckinModule.maybeShowPopup(), 5 * 60 * 1000); // 5min after open

      // Welcome toast
      const user = DB.User.get();
      if (user?.focus_type_name) {
        const type = ALGO.CHRONOTYPES[user.focus_type];
        Toast.show('success', `안녕하세요! ${type?.emoji || '⏱'}`, `${user.focus_type_name} 유형으로 오늘도 시작해볼까요?`);
      }

      _initialized = true;
    }, 600);
  }

  /* ════════════════════════════════════════
     NAVIGATION
  ════════════════════════════════════════ */
  function _setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page) navigate(page);
      });
    });
  }

  function navigate(pageId) {
    _currentPage = pageId;

    // Update nav active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target
    const pageEl = document.getElementById(`page-${pageId}`);
    if (pageEl) {
      pageEl.classList.add('active');
      // Render page content
      _renderPage(pageId);
    }
  }

  function _renderPage(pageId) {
    switch(pageId) {
      case 'dashboard': DashboardModule.render();   break;
      case 'tasks':     TasksModule.render();        break;
      case 'add-task':  TasksModule.renderAddTask(); break;
      case 'checkin':   CheckinModule.render();      break;
      case 'profile':   ProfileModule.render();      break;
    }
  }

  /* ════════════════════════════════════════
     ADD DEMO TASKS (if first run)
  ════════════════════════════════════════ */
  function _addDemoTasks() {
    if (!CONFIG.seedDemoTasks) return;   // 스위치가 꺼져 있으면 데모 작업을 만들지 않음
    const existing = DB.Tasks.getToday();
    if (existing.length > 0) return;

    const demoTasks = [
      { title: '분기 보고서 초안 작성', category: 'high', priority: 'urgent', estimated_min: 120, recommended_slot: 'forenoon' },
      { title: '팀 회의 안건 기획',      category: 'high', priority: 'normal', estimated_min: 60,  recommended_slot: 'morning'  },
      { title: '이메일 답장 처리',        category: 'low',  priority: 'normal', estimated_min: 30,  recommended_slot: 'afternoon'},
      { title: '영수증 정리 및 경비처리', category: 'low',  priority: 'low',    estimated_min: 20,  recommended_slot: 'lunch'    },
      { title: '신규 프로젝트 구조 설계', category: 'high', priority: 'urgent', estimated_min: 90,  recommended_slot: 'forenoon' },
      { title: '자료 조사 및 북마크 정리',category: 'low',  priority: 'low',    estimated_min: 45,  recommended_slot: 'evening'  },
    ];

    demoTasks.forEach(t => DB.Tasks.add(t));
  }

  return { init, showApp, navigate };
})();

/* ════════════════════════════════════════
   BOOT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Apply forenoon theme by default before time-based theme kicks in
  document.body.setAttribute('data-time-theme', 'forenoon');
  App.init();
});
