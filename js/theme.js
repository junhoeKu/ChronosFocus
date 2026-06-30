/**
 * ChronosFocus — Dynamic Theme Manager
 * 시간대에 따라 앱 테마 자동 전환
 */

const ThemeManager = (() => {
  let _currentTheme = null;
  let _interval     = null;

  function applyTheme(slotId) {
    if (_currentTheme === slotId) return;
    _currentTheme = slotId;
    document.body.setAttribute('data-time-theme', slotId);

    // Smooth transition via CSS custom properties
    // (CSS transitions handle the actual animation)
  }

  function updateFromCurrentTime() {
    const slot  = ALGO.getCurrentSlot();
    const sInfo = ALGO.getSlotInfo(slot);
    applyTheme(sInfo.theme || slot);
  }

  function start() {
    updateFromCurrentTime();
    // Check every minute
    _interval = setInterval(updateFromCurrentTime, 60 * 1000);
  }

  function stop() {
    if (_interval) clearInterval(_interval);
  }

  function getCurrentTheme() { return _currentTheme; }

  return { start, stop, applyTheme, updateFromCurrentTime, getCurrentTheme };
})();
