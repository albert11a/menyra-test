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
    // Notify clients that a new service worker is active (so pages can reload)
    try {
      const all = await self.clients.matchAll({ includeUncontrolled: true });
      all.forEach((client) => {
        try { client.postMessage({ type: 'NEW_SW_ACTIVATED', cache: CACHE_NAME }); } catch (e) {}
      });
    } catch (e) {}
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

// Smarter fetch handling:
// - Images: stale-while-revalidate (fast show, update in background)
// - Navigations & HTML: network-first with timeout, then cache fallback
// - Other GETs: network-first, cache on success
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const acceptHeader = req.headers.get('Accept') || '';
  const isNavigation = acceptHeader.includes('text/html') || req.mode === 'navigate';

  const isImage = req.destination === 'image' || /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(url.pathname) || url.href.includes('/image/fetch');

  if (isImage) {
    // stale-while-revalidate: return cache quickly if available, update cache in background
    event.respondWith((async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        const networkPromise = fetch(req).then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => null);
        // Return cached if present immediately, otherwise wait for network
        return cached || await networkPromise || new Response('', { status: 404 });
      } catch (err) {
        return fetch(req).catch(() => new Response('', { status: 404 }));
      }
    })());
    return;
  }

  // For navigations/HTML do a network-first with short timeout
  if (isNavigation) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const NETWORK_TIMEOUT = 3000; // ms

      const networkPromise = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);

      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT));
      const result = await Promise.race([networkPromise, timeoutPromise]);
      if (result) return result;
      if (cached) return cached;
      const fallback = await cache.match('/offline.html');
      return fallback || new Response('Offline', { status: 503, statusText: 'Offline' });
    })());
    return;
  }

  // Default: network-first, cache on success, fallback to cache
  event.respondWith((async () => {
    try {
      const networkResp = await fetch(req);
      try { const cache = await caches.open(CACHE_NAME); cache.put(req, networkResp.clone()); } catch (e) {}
      return networkResp;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
