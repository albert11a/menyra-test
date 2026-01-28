// MENYRA Social – PWA bootstrap
// Registers the root service worker so images and static assets cache aggressively.

// Note: Service workers only work on HTTPS (or localhost).

function log(...args) {
  // keep silent in prod – uncomment if needed
  // console.log("[PWA]", ...args);
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    log('registered', reg);

    // If there's already a waiting worker, activate it.
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // Listen for future updates.
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          // If there's an existing controller, this is an update.
          if (navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });
    });

    // Reload once when a new SW takes control to ensure fresh caches.
    let hasRefreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hasRefreshed) return;
      hasRefreshed = true;
      window.location.reload();
    });
  } catch (err) {
    console.warn('[PWA] SW registration failed', err);
  }
}

window.addEventListener('load', () => {
  registerSW();
});
