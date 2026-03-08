// MNYRA Social – PWA bootstrap
// Registers an app-scoped service worker for social routes.

// Note: Service workers only work on HTTPS (or localhost).

function log(...args) {
  // keep silent in prod – uncomment if needed
  // console.log("[PWA]", ...args);
}

const BETA_UPDATE_CHANNEL = "beta-auto-update-v1";
const SOCIAL_SW_URL = "/apps/menyra-social/sw.js";
const SOCIAL_SW_SCOPE = "/apps/menyra-social/";
const SW_UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

let swUpdateTimer = null;

function showBetaUpdateInfo(text) {
  if (!document?.body) return;
  const existing = document.getElementById("pwaBetaUpdateInfo");
  if (existing) existing.remove();
  const node = document.createElement("div");
  node.id = "pwaBetaUpdateInfo";
  node.textContent = text;
  node.style.cssText = [
    "position:fixed",
    "right:12px",
    "bottom:12px",
    "z-index:2147483647",
    "max-width:300px",
    "padding:10px 12px",
    "border-radius:12px",
    "background:#0f172a",
    "color:#e2e8f0",
    "font:600 12px/1.35 'Plus Jakarta Sans', Arial, sans-serif",
    "box-shadow:0 10px 30px rgba(15,23,42,.35)"
  ].join(";");
  document.body.appendChild(node);
  window.setTimeout(() => {
    if (node.isConnected) node.remove();
  }, 6500);
}

function scheduleSwUpdateChecks(reg) {
  const runUpdate = () => reg.update().catch(() => null);
  runUpdate();
  if (swUpdateTimer) clearInterval(swUpdateTimer);
  swUpdateTimer = window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    runUpdate();
  }, SW_UPDATE_CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") runUpdate();
  });
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register(SOCIAL_SW_URL, { scope: SOCIAL_SW_SCOPE });
    document.documentElement.dataset.pwaUpdateChannel = BETA_UPDATE_CHANNEL;
    log('registered', reg);
    scheduleSwUpdateChecks(reg);

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
      showBetaUpdateInfo("Beta-Update aktiv: Neue Version bereit. Erstes Laden kann kurz minimal laenger dauern.");
      log('controller changed');
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event?.data?.type === "PWA_BETA_CHANNEL_ACTIVE") {
        showBetaUpdateInfo("Beta-Update-Kanal aktiv: schnelle Auto-Updates eingeschaltet.");
      }
    });
  } catch (err) {
    console.warn('[PWA] SW registration failed', err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    registerSW();
  }, { once: true });
} else {
  registerSW();
}


