// MNYRA Social – PWA bootstrap
// Registers an app-scoped service worker for social routes.

// Note: Service workers only work on HTTPS (or localhost).

function log(...args) {
  // keep silent in prod – uncomment if needed
  // console.log("[PWA]", ...args);
}

const BETA_UPDATE_CHANNEL = "beta-auto-update-v1";
const SOCIAL_SW_URL_BASE = "/apps/menyra-social/sw.js";
const SOCIAL_SW_SCOPE = "/apps/menyra-social/";
const SW_UPDATE_CHECK_INTERVAL_MS = 3 * 60 * 1000;

let swUpdateTimer = null;

function readSocialAppVersionToken() {
  try {
    const fromWindow = String(window.__MENYRA_SOCIAL_APP_VERSION__ || "").trim();
    if (fromWindow) return fromWindow;
    const moduleScript = document.querySelector('script[type="module"][src*="/apps/menyra-social/social-app.js"]');
    const src = String(moduleScript?.getAttribute?.("src") || "").trim();
    if (!src) return "";
    const parsed = new URL(src, window.location.origin);
    return String(parsed.searchParams.get("v") || "").trim();
  } catch {
    return "";
  }
}

function buildSocialSwUrl() {
  const versionToken = readSocialAppVersionToken();
  if (!versionToken) return SOCIAL_SW_URL_BASE;
  const separator = SOCIAL_SW_URL_BASE.includes("?") ? "&" : "?";
  return `${SOCIAL_SW_URL_BASE}${separator}v=${encodeURIComponent(versionToken)}`;
}

function buildUpdateChannel() {
  const versionToken = readSocialAppVersionToken();
  if (!versionToken) return BETA_UPDATE_CHANNEL;
  return `${BETA_UPDATE_CHANNEL}::${versionToken}`;
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
  window.addEventListener("online", runUpdate);
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const swUrl = buildSocialSwUrl();
    const updateChannel = buildUpdateChannel();
    const reg = await navigator.serviceWorker.register(swUrl, {
      scope: SOCIAL_SW_SCOPE,
      updateViaCache: "none"
    });
    document.documentElement.dataset.pwaUpdateChannel = updateChannel;
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
      log('controller changed');
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


