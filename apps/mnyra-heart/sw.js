const HEART_CACHE_PREFIX = "mnyra-heart-shell-";
const HEART_CACHE = "mnyra-heart-shell-v8";
const SHELL_ASSETS = [
  "/heart/",
  "/heart/index.html",
  "/heart/heart.css",
  "/heart/heart.js",
  "/heart/heart-api-client.js",
  "/heart/heart-auth.js",
  "/heart/heart-events.js",
  "/heart/heart-render.js",
  "/heart/heart-state.js",
  "/heart/heart-ui-utils.js",
  "/heart/heart-dashboard-render.js",
  "/heart/heart-runs-render.js",
  "/heart/heart-incidents-render.js",
  "/heart/heart-modules-render.js",
  "/heart/heart-settings-render.js",
  "/heart/heart-monitoring-adapter.js",
  "/heart/heart-test-runner-adapter.js",
  "/heart/heart-test-report-normalizer.js",
  "/heart/manifest.json",
  "/apps/mnyra-heart/assets/apple-touch-icon.png?v=2026-03-20-heart-icon-normal-2",
  "/apps/mnyra-heart/assets/icon-192.png?v=2026-03-20-heart-icon-normal-2",
  "/apps/mnyra-heart/assets/icon-512.png?v=2026-03-20-heart-icon-normal-2",
  "/apps/mnyra-heart/",
  "/apps/mnyra-heart/index.html",
  "/apps/mnyra-heart/heart.css",
  "/apps/mnyra-heart/heart.js",
  "/apps/mnyra-heart/heart-api-client.js",
  "/apps/mnyra-heart/heart-auth.js",
  "/apps/mnyra-heart/heart-events.js",
  "/apps/mnyra-heart/heart-render.js",
  "/apps/mnyra-heart/heart-state.js",
  "/apps/mnyra-heart/heart-ui-utils.js",
  "/apps/mnyra-heart/heart-dashboard-render.js",
  "/apps/mnyra-heart/heart-runs-render.js",
  "/apps/mnyra-heart/heart-incidents-render.js",
  "/apps/mnyra-heart/heart-modules-render.js",
  "/apps/mnyra-heart/heart-settings-render.js",
  "/apps/mnyra-heart/heart-monitoring-adapter.js",
  "/apps/mnyra-heart/heart-test-runner-adapter.js",
  "/apps/mnyra-heart/heart-test-report-normalizer.js",
  "/apps/mnyra-heart/manifest.json",
  "/shared/ceo-access.js",
  "/shared/github-execution-state.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(HEART_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Nur EIGENE alte Caches loeschen: der Cache-Storage ist origin-weit geteilt.
    // Fremde Prefixe (menyra-cache-*, mnyra-social-cache-*) gehoeren anderen
    // Service Workern - sie mitzuloeschen wirft deren Offline-Shell und
    // Bild-Caches weg und macht die naechsten Loads unnoetig langsam.
    await Promise.all(
      keys
        .filter((key) => key.startsWith(HEART_CACHE_PREFIX) && key !== HEART_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/heart/")) return;

  const isHeartShellAsset = url.pathname.startsWith("/heart/")
    || url.pathname.startsWith("/apps/mnyra-heart/")
    || url.pathname === "/shared/ceo-access.js"
    || url.pathname === "/shared/github-execution-state.js";
  const isHeartDocumentOrModule = isHeartShellAsset
    && (
      url.pathname.endsWith("/")
      || url.pathname.endsWith(".html")
      || url.pathname.endsWith(".js")
      || url.pathname.endsWith(".css")
      || url.pathname.endsWith(".json")
    );

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(HEART_CACHE);
        const cacheKey = url.pathname.startsWith("/heart/") ? "/heart/index.html" : "/apps/mnyra-heart/index.html";
        cache.put(cacheKey, networkResponse.clone());
        return networkResponse;
      } catch {
        const cacheKey = url.pathname.startsWith("/heart/") ? "/heart/index.html" : "/apps/mnyra-heart/index.html";
        const cached = await caches.match(cacheKey);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isHeartDocumentOrModule) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(HEART_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        const cached = await caches.match(request);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isHeartShellAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const networkResponse = await fetch(request);
      const cache = await caches.open(HEART_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })());
  }
});
