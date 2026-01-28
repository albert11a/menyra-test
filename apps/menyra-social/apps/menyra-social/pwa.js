// =========================================================
// MENYRA Social - PWA / Service Worker registration
// Enables fast, cache-backed loading for images + assets.
// =========================================================

(function () {
  if (!('serviceWorker' in navigator)) return;

  const SW_URL = '/sw.js';

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: '/' });

      // If a new SW is waiting, activate it immediately
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Keep SW fresh
      reg.update?.();

      // Optional: reload once when a new SW takes control (prevents mixed-cache issues)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (e) {
      // Silent fail: app must still work without SW
      console.debug('[PWA] SW registration failed', e);
    }
  });
})();
