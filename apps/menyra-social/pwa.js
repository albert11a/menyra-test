// MNYRA Social – PWA bootstrap
// Registers an app-scoped service worker for social routes.

// Note: Service workers only work on HTTPS (or localhost).

function log(...args) {
  // keep silent in prod – uncomment if needed
  // console.log("[PWA]", ...args);
}

const BETA_UPDATE_CHANNEL = "beta-auto-update-v2";
const SOCIAL_SW_URL_BASE = "/apps/menyra-social/sw.js";
const SOCIAL_SW_SCOPE = "/apps/menyra-social/";
// Root-SW (Scope "/"): kontrolliert die echten Nutzer-Routen (/feed, /search,
// /:slug/menu, ...), die per Vercel-Rewrite auf die Social-Shell zeigen. Der
// Social-SW (Scope /apps/menyra-social/) erreicht diese Seiten nie. Ohne
// Root-SW gibt es dort weder Offline-Shell noch Cache-First fuer gehashte
// Chunks und Bilder.
const ROOT_SW_URL_BASE = "/sw.js";
const ROOT_SW_SCOPE = "/";
const SW_UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;
const CACHE_PREFIX = "mnyra-social-cache-";

const swUpdateTimers = new Map();
const setVendorDegraded = (kind, payload = {}) => {
  try {
    if (typeof window.__MENYRA_SOCIAL_SET_DEGRADED__ === "function") {
      window.__MENYRA_SOCIAL_SET_DEGRADED__(kind, payload);
    }
  } catch {}
};

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

function buildSocialSwUrl(versionToken = "") {
  const safeVersionToken = String(versionToken || "").trim();
  if (!safeVersionToken) return "";
  const separator = SOCIAL_SW_URL_BASE.includes("?") ? "&" : "?";
  return `${SOCIAL_SW_URL_BASE}${separator}v=${encodeURIComponent(safeVersionToken)}`;
}

function buildUpdateChannel(versionToken = "") {
  const safeVersionToken = String(versionToken || "").trim();
  if (!safeVersionToken) return `${BETA_UPDATE_CHANNEL}::disabled-no-version`;
  return `${BETA_UPDATE_CHANNEL}::${safeVersionToken}`;
}

function isServiceWorkerDisabledByQuery() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    return params.get("sw-off") === "1";
  } catch {
    return false;
  }
}

async function unregisterSocialServiceWorkers() {
  try {
    const rootScope = new URL(ROOT_SW_SCOPE, window.location.origin).href;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.map(async (reg) => {
        const scope = String(reg?.scope || "");
        if (!scope.includes(SOCIAL_SW_SCOPE) && scope !== rootScope) return false;
        try {
          return await reg.unregister();
        } catch {
          return false;
        }
      })
    );
  } catch {}
}

async function registerRootServiceWorker(versionToken = "") {
  try {
    const safeVersionToken = String(versionToken || "").trim();
    if (!safeVersionToken) return null;
    const swUrl = `${ROOT_SW_URL_BASE}?v=${encodeURIComponent(safeVersionToken)}`;
    const reg = await navigator.serviceWorker.register(swUrl, {
      scope: ROOT_SW_SCOPE,
      updateViaCache: "none"
    });
    if (reg.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          newWorker.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
    return reg;
  } catch (err) {
    log("root SW registration failed", err);
    return null;
  }
}

async function clearSocialCaches() {
  try {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => String(key || "").startsWith(CACHE_PREFIX))
        .map((key) => caches.delete(key).catch(() => false))
    );
  } catch {}
}

function scheduleSwUpdateChecks(reg) {
  const runUpdate = () => reg.update().catch(() => null);
  runUpdate();
  const timerKey = String(reg?.scope || "default");
  if (swUpdateTimers.has(timerKey)) clearInterval(swUpdateTimers.get(timerKey));
  swUpdateTimers.set(timerKey, window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    runUpdate();
  }, SW_UPDATE_CHECK_INTERVAL_MS));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") runUpdate();
  });
  window.addEventListener("online", runUpdate);
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    setVendorDegraded("push", {
      active: true,
      message: "Service Worker wird nicht unterstuetzt. Push bleibt deaktiviert."
    });
    return;
  }

  if (isServiceWorkerDisabledByQuery()) {
    await unregisterSocialServiceWorkers();
    await clearSocialCaches();
    log("service worker disabled by query param sw-off=1");
    setVendorDegraded("push", {
      active: true,
      message: "Service Worker ist per sw-off=1 deaktiviert."
    });
    return;
  }

  const versionToken = readSocialAppVersionToken();
  if (!versionToken) {
    await unregisterSocialServiceWorkers();
    await clearSocialCaches();
    document.documentElement.dataset.pwaUpdateChannel = buildUpdateChannel("");
    setVendorDegraded("push", {
      active: true,
      message: "Service Worker deaktiviert: Build-Version fehlt."
    });
    return;
  }

  try {
    const swUrl = buildSocialSwUrl(versionToken);
    const updateChannel = buildUpdateChannel(versionToken);
    const reg = await navigator.serviceWorker.register(swUrl, {
      scope: SOCIAL_SW_SCOPE,
      updateViaCache: "none"
    });
    setVendorDegraded("push", { active: false, message: "" });
    document.documentElement.dataset.pwaUpdateChannel = updateChannel;
    log('registered', reg);
    scheduleSwUpdateChecks(reg);

    const rootReg = await registerRootServiceWorker(versionToken);
    if (rootReg) scheduleSwUpdateChecks(rootReg);

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
    setVendorDegraded("push", {
      active: true,
      message: "Service Worker Registrierung fehlgeschlagen. Push kann ausfallen."
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    registerSW();
  }, { once: true });
} else {
  registerSW();
}


