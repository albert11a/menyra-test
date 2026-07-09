// MENYRA root service worker (scope "/"): fast + resilient caching
// - Vite-hashed bundled assets: cache-first (immutable, instant repeat loads)
// - Non-hashed scripts/styles: network-first with HTTP revalidation (304)
//   instead of full re-download, cache fallback on flaky network
// - Images: stale-while-revalidate with timeout + neutral fallback
// - Map tiles / Leaflet vendor: cache-first (per-coordinate immutable)
// - Navigations: network-first with timeout + cached app-shell fallback
const CACHE_PREFIX = 'menyra-cache-';
const CACHE_NAME = 'menyra-cache-v9';
const HEART_ROUTE_PATHS = new Set(['/leads', '/customers', '/admin/staff']);
const HEART_APP_SHELL_URL = '/apps/mnyra-heart/index.html';
const SOCIAL_APP_SHELL_URL = '/apps/menyra-social/index.html';
const SOCIAL_BUNDLED_SCOPE = '/apps/menyra-social/bundled/';
const SOCIAL_BUNDLED_MANIFEST_PATH = '/apps/menyra-social/bundled/manifest.json';
const NAVIGATION_FETCH_TIMEOUT_MS = 6500;
const RUNTIME_FETCH_TIMEOUT_MS = 5200;
const IMAGE_FALLBACK_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='#f1f5f9'/></svg>";
// Same-origin navigations NOT served by the social app shell.
const NON_SOCIAL_NAVIGATION_PREFIXES = [
  '/hub',
  '/heart',
  '/waiter',
  '/wr',
  '/api',
  '/apps/mnyra-heart',
  '/apps/waiter'
];
// Fixed routes that are guaranteed to be served with the social app shell;
// only these refresh the cached shell copy (slug routes serve the same file
// but are kept read-only to stay conservative).
const SOCIAL_SHELL_ROUTE_PATHS = new Set([
  '/feed', '/search', '/map', '/location', '/profile', '/menu', '/orders',
  '/notifications', '/settings', '/upload', '/ceo', '/admin', '/owner',
  '/staff', '/kitchen', '/business-accounts', '/businessaccounts', '/chat',
  '/login', '/register', '/social'
]);
const MAP_TILE_HOST_SUFFIXES = [
  'basemaps.cartocdn.com',
  'tile.openstreetmap.org'
];
const LEAFLET_VENDOR_HOST_SUFFIXES = [
  'cdn.jsdelivr.net',
  'unpkg.com'
];

async function fetchWithTimeout(request, timeoutMs = RUNTIME_FETCH_TIMEOUT_MS) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), Math.max(1, Number(timeoutMs) || RUNTIME_FETCH_TIMEOUT_MS))
    : null;
  try {
    return await fetch(request, controller ? { signal: controller.signal } : undefined);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function precacheSocialAppShell() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const shellRequest = new Request(SOCIAL_APP_SHELL_URL, { cache: 'no-cache', credentials: 'same-origin' });
    const shellResponse = await fetchWithTimeout(shellRequest, NAVIGATION_FETCH_TIMEOUT_MS);
    if (!shellResponse || (!shellResponse.ok && shellResponse.type !== 'opaque')) return;
    await cache.put(SOCIAL_APP_SHELL_URL, shellResponse.clone());
  } catch (err) {}
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    self.skipWaiting();
    await precacheSocialAppShell();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Claim clients so the SW starts controlling pages immediately
    await self.clients.claim();
    // Cleanup only OWN old caches. Other service workers on this origin
    // (social scope, heart scope) manage their own prefixes - deleting
    // foreign caches wipes their offline shells and image caches.
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
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

function normalizeOwnedRoutePath(pathname) {
  const rawPath = String(pathname || '').trim();
  if (!rawPath || rawPath === '/') return '/';
  return rawPath.replace(/\/+$/g, '') || '/';
}

function isHeartOwnedNavigationPath(url) {
  if (!url || url.origin !== self.location.origin) return false;
  return HEART_ROUTE_PATHS.has(normalizeOwnedRoutePath(url.pathname));
}

function isNonSocialNavigationPath(url) {
  const path = normalizeOwnedRoutePath(url.pathname);
  return NON_SOCIAL_NAVIGATION_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

async function fetchHeartAppShellForNavigation() {
  const heartShellRequest = new Request(HEART_APP_SHELL_URL, {
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: { Accept: 'text/html' }
  });
  const response = await fetchWithTimeout(heartShellRequest, NAVIGATION_FETCH_TIMEOUT_MS);
  if (!response || (!response.ok && response.type !== 'opaque')) {
    throw new Error(`heart-shell-response-not-ok:${response?.status || 0}`);
  }
  try {
    const cache = await caches.open(CACHE_NAME);
    cache.put(HEART_APP_SHELL_URL, response.clone()).catch(() => null);
  } catch (err) {}
  return response;
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

function hasViteContentHash(pathname = '') {
  const fileName = String(pathname || '').split('/').pop() || '';
  return /-[a-zA-Z0-9_-]{8,}\.(?:mjs|js|css|png|jpg|jpeg|webp|avif|svg|gif|woff2?|ttf|otf)$/i.test(fileName);
}

function isImmutableBundledAsset(url) {
  return url.origin === self.location.origin
    && url.pathname.startsWith(SOCIAL_BUNDLED_SCOPE)
    && hasViteContentHash(url.pathname);
}

function isMapTileRequest(url, request) {
  const hostname = String(url?.hostname || '').toLowerCase();
  const isKnownTileHost = MAP_TILE_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
  if (!isKnownTileHost) return false;
  const destination = String(request?.destination || '');
  if (!destination) return true;
  return destination === 'image';
}

function isLeafletVendorRequest(url, request) {
  const hostname = String(url?.hostname || '').toLowerCase();
  const isKnownVendorHost = LEAFLET_VENDOR_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
  if (!isKnownVendorHost) return false;
  const path = String(url?.pathname || '').toLowerCase();
  if (!path.includes('leaflet')) return false;
  const destination = String(request?.destination || '');
  if (!destination) return true;
  return destination === 'script'
    || destination === 'style'
    || destination === 'font'
    || destination === 'image';
}

function buildImageFallbackResponse() {
  return new Response(IMAGE_FALLBACK_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetchWithTimeout(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(() => null);
    }
    return response;
  } catch (err) {
    return new Response('', { status: 504, statusText: 'Network failed' });
  }
}

async function staleWhileRevalidateImage(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetchWithTimeout(request)
    .then(async (res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        try {
          await cache.put(request, res.clone());
        } catch (err) {}
      }
      return res;
    })
    .catch(() => null);
  if (cached) {
    networkPromise.catch(() => null);
    return cached;
  }
  const network = await networkPromise;
  return network || buildImageFallbackResponse();
}

// Non-hashed code assets: hit the network first but allow conditional
// revalidation (ETag/304) instead of forcing a full re-download; fall back
// to the last cached copy when the network is flaky or offline.
async function networkFirstRevalidatedCodeAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const revalidateReq = new Request(request, { cache: 'no-cache' });
    const networkResp = await fetchWithTimeout(revalidateReq, RUNTIME_FETCH_TIMEOUT_MS);
    if (networkResp && (networkResp.ok || networkResp.type === 'opaque')) {
      cache.put(request, networkResp.clone()).catch(() => null);
      return networkResp;
    }
    if (networkResp) return networkResp;
  } catch (err) {}
  const cached = await cache.match(request);
  return cached || new Response('', { status: 504, statusText: 'Code asset fetch failed' });
}

// Versioned code assets (?v=<build-token>): the URL changes on deploy, so a
// cached copy is always the right copy. Serve it instantly and refresh in
// the background.
async function versionedCodeAssetCacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const refreshPromise = fetchWithTimeout(new Request(request, { cache: 'no-cache' }), RUNTIME_FETCH_TIMEOUT_MS)
    .then(async (response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        try {
          await cache.put(request, response.clone());
        } catch (err) {}
      }
      return response;
    })
    .catch(() => null);
  if (cached) {
    refreshPromise.catch(() => null);
    return cached;
  }
  const network = await refreshPromise;
  return network || new Response('', { status: 504, statusText: 'Versioned asset fetch failed' });
}

async function getCachedSocialAppShellResponse() {
  const cache = await caches.open(CACHE_NAME);
  return await cache.match(SOCIAL_APP_SHELL_URL);
}

async function handleNavigation(event, url) {
  const req = event.request;
  if (isHeartOwnedNavigationPath(url)) {
    try {
      return await fetchHeartAppShellForNavigation();
    } catch (err) {
      const cache = await caches.open(CACHE_NAME);
      const cachedHeartShell = await cache.match(HEART_APP_SHELL_URL);
      return cachedHeartShell || new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  }
  const isSocialCandidate = url.origin === self.location.origin && !isNonSocialNavigationPath(url);
  try {
    const navReq = new Request(req, { cache: 'no-cache' });
    const networkResp = await fetchWithTimeout(navReq, NAVIGATION_FETCH_TIMEOUT_MS);
    if (!networkResp || (!networkResp.ok && networkResp.type !== 'opaque' && networkResp.type !== 'opaqueredirect')) {
      if (networkResp) return networkResp;
      throw new Error('navigation-response-missing');
    }
    if (isSocialCandidate && SOCIAL_SHELL_ROUTE_PATHS.has(normalizeOwnedRoutePath(url.pathname))) {
      try {
        const cache = await caches.open(CACHE_NAME);
        cache.put(SOCIAL_APP_SHELL_URL, networkResp.clone()).catch(() => null);
      } catch (err) {}
    }
    return networkResp;
  } catch (err) {
    if (isSocialCandidate) {
      const cachedShell = await getCachedSocialAppShellResponse();
      if (cachedShell) return cachedShell;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const scheme = url.protocol;
  const isHttp = scheme === 'http:' || scheme === 'https:';
  if (!isHttp) return;

  // Firestore/Functions/Google-APIs NIEMALS durch den SW cachen oder aus dem
  // Cache bedienen: Firestore-Streaming-GETs sonst mit Overhead belegt und bei
  // Netz-Blip stale ausgeliefert. Direkt ans Netzwerk durchreichen.
  const host = url.hostname;
  if (
    host === 'firestore.googleapis.com'
    || host.endsWith('.cloudfunctions.net')
    || host.endsWith('.googleapis.com')
  ) {
    return;
  }

  // Media/video streams: range requests must reach the network untouched.
  if (req.headers.get('range')) return;

  if (isLeafletVendorRequest(url, req)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (isMapTileRequest(url, req)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  const acceptHeader = req.headers.get('Accept') || '';
  const isNavigation = acceptHeader.includes('text/html') || req.mode === 'navigate';
  if (isNavigation) {
    event.respondWith(handleNavigation(event, url));
    return;
  }

  const isImage = req.destination === 'image' || /\.(png|jpg|jpeg|webp|avif|svg|gif)$/i.test(url.pathname) || url.href.includes('/image/fetch');
  if (isImage) {
    event.respondWith(staleWhileRevalidateImage(req));
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;

  // Immutable Vite build output: content hash in filename -> cache-first.
  if (isImmutableBundledAsset(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  const isScriptOrStyle = req.destination === 'script' || req.destination === 'style' || /\.(mjs|js|css)$/i.test(url.pathname);
  if (isScriptOrStyle && isSameOrigin) {
    const hasVersionToken = url.searchParams.has('v') || url.searchParams.has('version');
    if (hasVersionToken && url.pathname !== SOCIAL_BUNDLED_MANIFEST_PATH) {
      event.respondWith(versionedCodeAssetCacheFirst(req));
      return;
    }
    event.respondWith(networkFirstRevalidatedCodeAsset(req));
    return;
  }

  // Default: network-first with timeout, cache on success, fallback to cache
  event.respondWith((async () => {
    try {
      const networkResp = await fetchWithTimeout(req);
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
