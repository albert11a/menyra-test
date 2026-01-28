// =========================================================
// MENYRA Social - PWA bootstrap
// Service Worker registration (fast cache for images/assets)
// =========================================================

(function registerSW() {
  try {
    if (!('serviceWorker' in navigator)) return;

    const swUrl = '/sw.js';

    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(swUrl, { scope: '/' });

        // If a new worker is already waiting, activate immediately.
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // When updates are found, auto-activate when installed.
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              nw.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      } catch (err) {
        console.warn('[MENYRA] SW registration failed', err);
      }
    });
  } catch (err) {
    // silent
  }
})();
