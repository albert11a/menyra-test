const CACHE_NAME = "menyra-dummy-step4-v1";
const OFFLINE_URL = "./offline.html";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./shared/unified.css",
  "./shared/styles.css",
  "./shared/menyra.css",
  "./shared/guest.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    try {
      const res = await fetch(event.request);
      return res;
    } catch (e) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      return cached || cache.match(OFFLINE_URL);
    }
  })());
});
