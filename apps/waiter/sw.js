const CACHE_NAME = "mnyra-waiter-shell-v1";
const APP_SCOPE = "/apps/waiter/";
const APP_SHELL = [
  "/apps/waiter/",
  "/apps/waiter/index.html",
  "/apps/waiter/manifest.webmanifest",
  "/apps/waiter/assets/icon-192.png",
  "/apps/waiter/assets/icon-512.png",
  "/apps/waiter/assets/apple-touch-icon.png",
  "/apps/waiter/assets/logo.png",
  "/apps/waiter/assets/logo-square.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (!requestUrl.pathname.startsWith(APP_SCOPE)) return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.status === 200 && event.request.method === "GET") {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      return caches.match("/apps/waiter/index.html");
    }
  })());
});
