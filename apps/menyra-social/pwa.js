// MENYRA Social – PWA bootstrap
// Registers the root service worker so images and static assets cache aggressively.

// Note: Service workers only work on HTTPS (or localhost).

function log(...args) {
  // keep silent in prod – uncomment if needed
  // console.log("[PWA]", ...args);
}

let viewportBindingStarted = false;

function bindViewportShell() {
  if (viewportBindingStarted) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  viewportBindingStarted = true;
  const root = document.documentElement;
  let rafId = 0;

  const applyViewport = () => {
    rafId = 0;
    const vv = window.visualViewport;
    const height = Math.round(vv?.height || window.innerHeight || 0);
    const topOffset = Math.max(0, Math.round(vv?.offsetTop || 0));
    if (height > 0) {
      root.style.setProperty('--app-viewport-height', `${height}px`);
    }
    root.style.setProperty('--app-viewport-offset-top', `${topOffset}px`);
  };

  const scheduleApply = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(applyViewport);
  };

  applyViewport();
  window.addEventListener('resize', scheduleApply, { passive: true });
  window.addEventListener('orientationchange', scheduleApply, { passive: true });
  window.addEventListener('pageshow', scheduleApply, { passive: true });
  document.addEventListener('focusin', scheduleApply, { passive: true });
  document.addEventListener('focusout', () => {
    window.setTimeout(scheduleApply, 120);
  }, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleApply, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleApply, { passive: true });
  }
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js?v=2026-03-05-hotfix-3', { scope: '/' });
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

    // Do not force a runtime reload on controller changes.
    // A forced reload can interrupt deep-links opened from push notifications.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      log('controller changed');
    });
  } catch (err) {
    console.warn('[PWA] SW registration failed', err);
  }
}

bindViewportShell();
window.addEventListener('load', () => {
  registerSW();
});
