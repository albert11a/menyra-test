// MENYRA service worker: network-first with safe caching
const CACHE_NAME = 'menyra-cache-v4';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24h (not strictly enforced here)

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Claim clients so the SW starts controlling pages immediately
    await self.clients.claim();
    // Optionally cleanup old caches
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
});

// Smarter fetch handling:
// - Images: stale-while-revalidate (fast show, update in background)
// - Navigations & HTML: network-only (no caching)
// - Other GETs: network-first, cache on success
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const scheme = url.protocol;
  const isHttp = scheme === 'http:' || scheme === 'https:';
  if (!isHttp) return;
  const acceptHeader = req.headers.get('Accept') || '';
  const isNavigation = acceptHeader.includes('text/html') || req.mode === 'navigate';

  const isImage = req.destination === 'image' || /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(url.pathname) || url.href.includes('/image/fetch');
  const isScriptOrStyle = req.destination === 'script' || req.destination === 'style' || /\.(mjs|js|css)$/i.test(url.pathname);
  const isSameOrigin = url.origin === self.location.origin;

  // For navigations/HTML do a network-only fetch (no caching)
  if (isNavigation) {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch (err) {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
    return;
  }

  // Images: stale-while-revalidate (fast cached response, update in background)
  if (isImage) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const networkPromise = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (cached) {
        networkPromise.catch(() => null);
        return cached;
      }
      const network = await networkPromise;
      return network || cached || new Response("", { status: 504, statusText: "Image fetch failed" });
    })());
    return;
  }

  // Scripts/styles (same-origin only): bypass HTTP cache to avoid stale PWA bundles
  if (isScriptOrStyle && isSameOrigin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      try {
        const bustReq = new Request(req, { cache: 'reload' });
        const networkResp = await fetch(bustReq);
        if (networkResp) {
          try {
            if (networkResp.ok || networkResp.type === 'opaque') {
              await cache.put(req, networkResp.clone());
            }
          } catch (err) {}
          return networkResp;
        }
      } catch (err) {}
      if (cached) return cached;
      return new Response('', { status: 504, statusText: 'Script fetch failed' });
    })());
    return;
  }

  // Default: network-first, cache on success, fallback to cache
  event.respondWith((async () => {
    try {
      const networkResp = await fetch(req);
      try {
        if (networkResp && networkResp.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResp.clone());
        }
      } catch (e) {}
      return networkResp;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
