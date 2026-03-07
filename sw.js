// MENYRA service worker: network-first with safe caching
const CACHE_NAME = 'menyra-cache-v7';
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

function buildNotificationTargetUrl(rawUrl, notificationId) {
  const fallback = '/apps/menyra-social/';
  const safeId = String(notificationId || '').trim();
  try {
    const parsed = new URL(rawUrl || fallback, self.location.origin);
    if (safeId && !parsed.searchParams.get('notif')) {
      parsed.searchParams.set('notif', safeId);
    }
    return parsed.href;
  } catch (err) {
    if (!safeId) return fallback;
    return `${fallback}?notif=${encodeURIComponent(safeId)}`;
  }
}

self.addEventListener('push', (event) => {
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch (err) {
      return {};
    }
  })();

  const notif = payload.notification || payload.webpush?.notification || {};
  const title = notif.title || payload.title || 'Benachrichtigung';
  const body = notif.body || payload.body || 'Neue Nachricht';
  const icon = notif.icon || payload.icon || '/apps/menyra-social/assets/icon-192.png';
  const notificationId = payload.data?.notificationId || payload.data?.notifId || '';
  const link = buildNotificationTargetUrl(
    payload.data?.link || payload.fcmOptions?.link || '/apps/menyra-social/',
    notificationId
  );
  const tag = notif.tag || `menyra_notif_${payload.data?.notificationId || Date.now()}`;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: icon,
      tag,
      data: {
        ...(payload.data || {}),
        notificationId: notificationId || payload.data?.notificationId || '',
        url: link
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification?.close();
  const data = event.notification?.data || {};
  const notificationId = String(data.notificationId || data.notifId || '').trim();
  const targetUrl = buildNotificationTargetUrl(
    data.url || data.link || '/apps/menyra-social/',
    notificationId
  );
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const socialClient = clientsList.find((client) => {
      try {
        const parsed = new URL(client.url);
        return parsed.origin === self.location.origin && parsed.pathname.startsWith('/apps/menyra-social/');
      } catch (err) {
        return false;
      }
    });
    const fallbackClient = socialClient || clientsList[0];

    if (socialClient && 'focus' in socialClient) {
      try {
        await socialClient.focus();
      } catch (err) {}

      try {
        socialClient.postMessage({
          type: 'OPEN_NOTIFICATION_TARGET',
          notificationId,
          url: targetUrl
        });
        return;
      } catch (err) {}

      if ('navigate' in socialClient && targetUrl) {
        try {
          await socialClient.navigate(targetUrl);
          return;
        } catch (err) {}
      }
    }

    if (fallbackClient && 'focus' in fallbackClient && 'navigate' in fallbackClient && targetUrl) {
      try {
        await fallbackClient.focus();
        await fallbackClient.navigate(targetUrl);
        return;
      } catch (err) {}
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
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
      const networkPromise = fetch(req).then(async (res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          try {
            await cache.put(req, res.clone());
          } catch (err) {}
        }
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
          await cache.put(req, networkResp.clone());
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
