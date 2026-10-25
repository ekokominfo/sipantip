/* First-visit demo. Keep the storage key stable across site releases. */
(() => {
  'use strict';
  const dialog = document.getElementById('demoDialog');
  const launch = document.getElementById('demoLaunch');
  if (!dialog || !launch || typeof dialog.showModal !== 'function') return;
  const video = document.getElementById('demoVideo');
  const play = document.getElementById('demoPlay');
  const status = document.getElementById('demoStatus');
  const key = 'sipantip.demo.seen';
  let shown = false, timer, previousFocus;
  const stores = () => {
    const available = [];
    for (const name of ['localStorage', 'sessionStorage']) {
      try { available.push(window[name]); } catch (_) { /* Storage may be blocked. */ }
    }
    return available;
  };
  const seen = () => shown || stores().some(storage => {
    try { return storage.getItem(key) === '1'; } catch (_) { return false; }
  });
  function openDemo() {
    clearTimeout(timer);
    if (dialog.open) return;
    previousFocus = document.activeElement;
    dialog.showModal();
    document.documentElement.classList.add('demo-open');
    shown = true;
    for (const storage of stores()) {
      try { storage.setItem(key, '1'); } catch (_) { /* Session fallback remains available. */ }
    }
  }
  launch.hidden = false;
  launch.addEventListener('click', openDemo);
  dialog.querySelectorAll('[data-demo-close]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('close', () => {
    video.pause();
    document.documentElement.classList.remove('demo-open');
    if (previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus();
    else launch.focus({ preventScroll: true });
  });
  play.addEventListener('click', async () => {
    play.disabled = true;
    status.textContent = 'Memuat video…';
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.hidden = false;
    try {
      await video.play();
      if (!dialog.open) video.pause();
      play.hidden = true;
      status.textContent = '';
    } catch (_) {
      status.textContent = 'Video belum dapat diputar. Periksa koneksi lalu coba lagi.';
    } finally {
      play.disabled = false;
    }
  });
  video.addEventListener('error', () => {
    status.textContent = 'Video belum dapat dimuat. Periksa koneksi lalu coba lagi.';
    play.hidden = false;
    play.disabled = false;
    video.removeAttribute('src');
    video.load();
  });
  function schedule() {
    clearTimeout(timer);
    if (!seen() && document.visibilityState === 'visible') {
      timer = setTimeout(() => {
        if (!seen() && document.visibilityState === 'visible' && !document.querySelector('dialog[open]')) openDemo();
      }, 2000);
    }
  }
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('storage', event => { if (event.key === key && event.newValue === '1') clearTimeout(timer); });
  // DOM is ready: do not wait for third-party maps or environmental APIs.
  schedule();
})();
