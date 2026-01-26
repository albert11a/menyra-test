const SW_URL = '/sw.js';
const SW_SCOPE = '/apps/menyra-social/';

if ('serviceWorker' in navigator) {
  // Register service worker and auto-apply updates when available
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });

      // Ensure we immediately check for updates on load
      try { await reg.update(); } catch (e) {}

      // If there's an active waiting worker, tell it to skip waiting
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Listen for updates found (new installing worker)
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // A new SW is installed and waiting — ask it to activate
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // When the controlling worker changes, reload to apply new SW
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      // Listen for messages from the SW to force refresh when activated
      navigator.serviceWorker.addEventListener('message', (ev) => {
        try {
          const data = ev.data || {};
          if (data && data.type === 'NEW_SW_ACTIVATED') {
            // If a new SW is activated, reload so the app shows latest version
            window.location.reload();
          }
        } catch (e) {}
      });

    } catch (err) {
      console.warn('MENYRA Social PWA SW register failed:', err);
    }
  });
}
