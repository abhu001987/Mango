/* ============================================================
   TERRA PREP — SHARED THEME SCRIPT
   Load this in <head>, NOT deferred/async, so theme applies
   before paint — no flash of the wrong theme on any page.
   ============================================================ */

(function () {
  var STORAGE_KEY = 'terra-site-theme';
  var root = document.documentElement;

  // Apply saved theme immediately
  var stored = localStorage.getItem(STORAGE_KEY);
  root.setAttribute('data-theme', stored === 'dark' ? 'dark' : 'light');

  // Sync across tabs if toggled elsewhere
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      root.setAttribute('data-theme', e.newValue === 'dark' ? 'dark' : 'light');
    }
  });

  // Wire up a toggle button if the page has one
  function initToggle() {
    var btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    btn.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
      btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      // Lets a page redraw canvases/maps on theme change if it needs to
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();