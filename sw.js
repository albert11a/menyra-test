// MENYRA service worker: network-first with safe caching and auto-activate
const CACHE_NAME = 'menyra-cache-v1';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24h (not strictly enforced here)

self.addEventListener('install', (event) => {
  // Activate new SW immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Claim clients so the SW starts controlling pages immediately
    await self.clients.claim();
    // Optionally cleanup old caches
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
});

// Listen for messages from the page (e.g., to trigger skipWaiting)
self.addEventListener('message', (event) => {
  try {
    const data = event.data || {};
    if (data && data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  } catch (err) {}
});

// Network-first strategy: try network, fall back to cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;

  const acceptHeader = req.headers.get('Accept') || '';
  const isNavigation = acceptHeader.includes('text/html') || req.mode === 'navigate';

  event.respondWith((async () => {
    try {
      const networkResponse = await fetch(req);
      // Save a clone in cache for later fallback
      try {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, networkResponse.clone());
      } catch (err) {}
      return networkResponse;
    } catch (err) {
      // Network failed, try cache
      try {
        const cached = await caches.match(req);
        if (cached) return cached;
      } catch (e) {}
      // If navigation and no cache, return an offline fallback (optional)
      if (isNavigation) {
        const fallback = await caches.match('/offline.html');
        if (fallback) return fallback;
      }
      // Final fallback: return network error
      throw err;
    }
  })());
});
