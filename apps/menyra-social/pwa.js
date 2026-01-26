const SW_URL = '/sw.js';
const SW_SCOPE = '/apps/menyra-social/';

if ('serviceWorker' in navigator) {
  // Register service worker and auto-apply updates when available
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });

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
    } catch (err) {
      console.warn('MENYRA Social PWA SW register failed:', err);
    }
  });
}
