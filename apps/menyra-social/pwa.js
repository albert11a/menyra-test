// MNYRA Social – website-first bootstrap
// PWA registration is intentionally off during the website stabilization phase.
// This prevents old service-worker caches from serving stale UI on first open.

const SOCIAL_SW_SCOPE = "/apps/menyra-social/";
const CACHE_PREFIX = "mnyra-social-cache-";

const setVendorDegraded = (kind, payload = {}) => {
  try {
    if (typeof window.__MENYRA_SOCIAL_SET_DEGRADED__ === "function") {
      window.__MENYRA_SOCIAL_SET_DEGRADED__(kind, payload);
    }
  } catch {}
};

async function unregisterSocialServiceWorkers() {
  try {
    if (!("serviceWorker" in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(async (reg) => {
      const scope = String(reg?.scope || "");
      if (!scope.includes(SOCIAL_SW_SCOPE)) return false;
      try {
        return await reg.unregister();
      } catch {
        return false;
      }
    }));
  } catch {}
}

async function clearSocialCaches() {
  try {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => String(key || "").startsWith(CACHE_PREFIX))
      .map((key) => caches.delete(key).catch(() => false)));
  } catch {}
}

async function runWebsiteFirstPwaCleanup() {
  await unregisterSocialServiceWorkers();
  await clearSocialCaches();
  try {
    document.documentElement.dataset.pwaUpdateChannel = "website-first";
  } catch {}
  setVendorDegraded("push", {
    active: true,
    message: "PWA ist waehrend der Website-Stabilisierung deaktiviert."
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void runWebsiteFirstPwaCleanup();
  }, { once: true });
} else {
  void runWebsiteFirstPwaCleanup();
}
