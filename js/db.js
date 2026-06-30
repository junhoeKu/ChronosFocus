/**
 * ChronosFocus — Local Database (LocalStorage Wrapper)
 * 스키마: User, Task, FocusPattern, DailyFeedback
 */

const DB = (() => {
  const KEY_USER    = 'cf_user';
  const KEY_TASKS   = 'cf_tasks';
  const KEY_PATTERNS= 'cf_patterns';
  const KEY_FEEDBACK= 'cf_feedback';
  const KEY_CHECKINS= 'cf_checkins';

  /* ── Helpers ── */
  function _get(key)       { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } }
  function _set(key, val)  { localStorage.setItem(key, JSON.stringify(val)); }
  function _uuid()         { return 'cf-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }
  function _now()          { return new Date().toISOString(); }
  function _today()        { return new Date().toISOString().slice(0,10); }

  /* ════════════════ USER ════════════════ */
  const User = {
    get() { return _get(KEY_USER); },

    save(data) {
      const existing = this.get() || {};
      const user = { ...existing, ...data, updated_at: _now() };
      if (!user.id) user.id = _uuid();
      if (!user.created_at) user.created_at = _now();
      _set(KEY_USER, user);
      return user;
    },

    isOnboarded() {
      const u = this.get();
      return u && u.onboarding_done === true;
    },

    getFocusScores() {
      const u = this.get();
      if (!u || !u.focus_scores) return ALGO.DEFAULT_FOCUS_SCORES();
      try { return JSON.parse(u.focus_scores); }
      catch { return ALGO.DEFAULT_FOCUS_SCORES(); }
    },

    setFocusScores(scores) {
      this.save({ focus_scores: JSON.stringify(scores) });
    }
  };

  /* ════════════════ TASKS ════════════════ */
  const Tasks = {
    getAll()      { return _get(KEY_TASKS) || []; },
    getToday()    { return this.getAll().filter(t => t.scheduled_date === _today()); },
    getByStatus(s){ return this.getAll().filter(t => t.status === s); },

    add(data) {
      const tasks = this.getAll();
      const task  = {
        id: _uuid(),
        status: 'todo',
        scheduled_date: _today(),
        created_at: _now(),
        ...data
      };
      tasks.unshift(task);
      _set(KEY_TASKS, tasks);
      return task;
    },

    update(id, data) {
      const tasks = this.getAll();
      const idx   = tasks.findIndex(t => t.id === id);
      if (idx === -1) return null;
      tasks[idx] = { ...tasks[idx], ...data, updated_at: _now() };
      _set(KEY_TASKS, tasks);
      return tasks[idx];
    },

    complete(id) {
      return this.update(id, { status: 'done', completed_at: _now() });
    },

    remove(id) {
      const tasks = this.getAll().filter(t => t.id !== id);
      _set(KEY_TASKS, tasks);
    },

    getTodayStats() {
      const today = this.getToday();
      const done  = today.filter(t => t.status === 'done');
      const high  = today.filter(t => t.category === 'high');
      const low   = today.filter(t => t.category === 'low');
      return {
        total: today.length,
        done:  done.length,
        high:  high.length,
        low:   low.length,
        rate:  today.length ? Math.round(done.length / today.length * 100) : 0
      };
    }
  };

  /* ════════════════ FOCUS PATTERNS ════════════════ */
  const Patterns = {
    getAll()     { return _get(KEY_PATTERNS) || []; },
    getByDate(d) { return this.getAll().filter(p => p.date === d); },
    getBySlot(slot) { return this.getAll().filter(p => p.slot === slot); },

    add(data) {
      const patterns = this.getAll();
      const pattern  = { id: _uuid(), date: _today(), created_at: _now(), ...data };
      patterns.push(pattern);
      _set(KEY_PATTERNS, patterns);
      return pattern;
    },

    /**
     * 슬롯별 평균 집중도 계산 (누적 실측 데이터 + 기본값 blend)
     */
    getAverageScores() {
      const all = this.getAll();
      const user = User.get();
      const base = User.getFocusScores();

      const SLOTS = ['dawn','morning','forenoon','lunch','afternoon','evening','night'];
      const result = {};

      SLOTS.forEach(slot => {
        const records = all.filter(p => p.slot === slot);
        if (records.length >= 3) {
          const avg = records.reduce((s,r) => s + r.focus_level, 0) / records.length;
          // Blend: 70% actual + 30% base (damping)
          result[slot] = Math.round((avg * 0.7 + base[slot] * 0.3) * 10) / 10;
        } else {
          result[slot] = base[slot];
        }
      });

      return result;
    }
  };

  /* ════════════════ DAILY FEEDBACK ════════════════ */
  const Feedback = {
    getAll()        { return _get(KEY_FEEDBACK) || []; },
    getByDate(d)    { return this.getAll().find(f => f.date === d) || null; },
    hasTodayEntry() { return !!this.getByDate(_today()); },

    add(data) {
      const list = this.getAll();
      const entry = { id: _uuid(), date: _today(), created_at: _now(), ...data };
      // upsert
      const idx = list.findIndex(f => f.date === entry.date);
      if (idx >= 0) list[idx] = { ...list[idx], ...data, updated_at: _now() };
      else list.push(entry);
      _set(KEY_FEEDBACK, list);
      // Fine-tune patterns based on feedback
      if (data.satisfaction && data.followed_recommendation) {
        _adjustPatterns(data);
      }
      return entry;
    }
  };

  /* ════════════════ CHECKINS ════════════════ */
  const Checkins = {
    getAll()        { return _get(KEY_CHECKINS) || []; },
    getToday()      { return this.getAll().filter(c => c.date === _today()); },
    getLastHour()   {
      const cutoff = Date.now() - 60 * 60 * 1000;
      return this.getAll().filter(c => new Date(c.created_at).getTime() > cutoff);
    },

    add(slot, level) {
      const list = this.getAll();
      const entry = { id: _uuid(), date: _today(), slot, focus_level: level, created_at: _now() };
      list.push(entry);
      _set(KEY_CHECKINS, list);
      // Also save to patterns for learning
      Patterns.add({ slot, focus_level: level, source: 'checkin' });
      return entry;
    }
  };

  /* ── Private: fine-tune pattern scores ── */
  function _adjustPatterns(feedback) {
    const scores = User.getFocusScores();
    const currentSlot = ALGO.getCurrentSlot();
    const delta = feedback.satisfaction >= 4 ? 0.1 : feedback.satisfaction <= 2 ? -0.1 : 0;
    if (delta !== 0) {
      scores[currentSlot] = Math.max(1, Math.min(5, (scores[currentSlot] || 3) + delta));
      User.setFocusScores(scores);
    }
  }

  return { User, Tasks, Patterns, Feedback, Checkins, _uuid, _today };
})();
