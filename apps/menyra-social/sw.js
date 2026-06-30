const CACHE_PREFIX = "mnyra-social-cache-";
const CACHE_SCHEMA_TOKEN = "web-fresh-v1";
const APP_SCOPE = "/apps/menyra-social/";
const APP_SHELL_URL = "/apps/menyra-social/index.html";
const BUNDLED_SCOPE = `${APP_SCOPE}bundled/`;
const BUNDLED_MANIFEST_URL = `${BUNDLED_SCOPE}manifest.json`;
const BETA_UPDATE_CHANNEL_BASE = "beta-auto-update-v2";
const EXTERNAL_STATIC_HOSTS = new Set([
  "www.gstatic.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.jsdelivr.net",
  "unpkg.com"
]);
const MAP_TILE_HOST_SUFFIXES = [
  "basemaps.cartocdn.com",
  "tile.openstreetmap.org"
];
const LEAFLET_VENDOR_HOST_SUFFIXES = [
  "cdn.jsdelivr.net",
  "unpkg.com"
];
const NAVIGATION_FETCH_TIMEOUT_MS = 6500;
const STRICT_PUBLIC_NAVIGATION_FETCH_TIMEOUT_MS = 4500;
const RUNTIME_FETCH_TIMEOUT_MS = 5200;
const IMAGE_FALLBACK_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='#f1f5f9'/></svg>";
const RESERVED_PUBLIC_ROUTE_SEGMENTS = new Set([
  "ceo",
  "owner",
  "staff",
  "waiter",
  "kitchen",
  "social",
  "heart",
  "hub",
  "apps",
  "api",
  "login",
  "register",
  "profile",
  "post",
  "story",
  "menyra-restaurants",
  "lp",
  "index.html",
  "assets",
  "_shared",
  "core",
  "lead-landing"
]);
const PUBLIC_QUERY_RESTAURANT_KEYS = ["r", "restaurant", "restaurantId", "rid", "businessId"];
const PUBLIC_QUERY_TOP_TAB_KEYS = ["top", "surface", "screen", "tab", "view"];
const PUBLIC_QUERY_SOURCE_KEYS = ["src", "source", "menuSource", "menuAccessSource", "access"];

function sanitizeCacheToken(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function resolveSwVersionToken() {
  try {
    const parsed = new URL(self.location.href);
    const token = sanitizeCacheToken(
      parsed.searchParams.get("v")
      || parsed.searchParams.get("version")
      || parsed.searchParams.get("build")
    );
    if (token) return token;
  } catch {}
  return "buildless";
}

const SW_VERSION_TOKEN = resolveSwVersionToken();
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_SCHEMA_TOKEN}-${SW_VERSION_TOKEN}`;
const BETA_UPDATE_CHANNEL = `${BETA_UPDATE_CHANNEL_BASE}::${CACHE_SCHEMA_TOKEN}-${SW_VERSION_TOKEN}`;

async function broadcastToClients(payload) {
  const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clientsList.forEach((client) => {
    try {
      client.postMessage(payload);
    } catch {}
  });
}

async function getCachedAppShellResponse() {
  const primary = await caches.match(APP_SHELL_URL);
  if (primary) return primary;
  return await caches.match(APP_SCOPE);
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  try {
    const shellRequest = new Request(APP_SHELL_URL, { cache: "reload" });
    const shellResponse = await fetchWithTimeout(shellRequest, NAVIGATION_FETCH_TIMEOUT_MS);
    if (!shellResponse || (!shellResponse.ok && shellResponse.type !== "opaque")) return;
    const cloneForIndex = shellResponse.clone();
    const cloneForScope = shellResponse.clone();
    await cache.put(APP_SHELL_URL, cloneForIndex);
    await cache.put(APP_SCOPE, cloneForScope);
  } catch {}
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    self.skipWaiting();
    await precacheAppShell();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    if (self.registration?.navigationPreload?.enable) {
      try {
        await self.registration.navigationPreload.enable();
      } catch {}
    }
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await broadcastToClients({
      type: "PWA_BETA_CHANNEL_ACTIVE",
      channel: BETA_UPDATE_CHANNEL,
      cacheName: CACHE_NAME
    });
  })());
});

self.addEventListener("message", (event) => {
  const type = String(event?.data?.type || "");
  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function buildNotificationTargetUrl(rawUrl, notificationId) {
  const fallback = APP_SCOPE;
  const safeId = String(notificationId || "").trim();
  try {
    const parsed = new URL(rawUrl || fallback, self.location.origin);
    if (safeId && !parsed.searchParams.get("notif")) {
      parsed.searchParams.set("notif", safeId);
    }
    return parsed.href;
  } catch {
    if (!safeId) return fallback;
    return `${fallback}?notif=${encodeURIComponent(safeId)}`;
  }
}

self.addEventListener("push", (event) => {
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();

  const notif = payload.notification || payload.webpush?.notification || {};
  const title = notif.title || payload.title || "Benachrichtigung";
  const body = notif.body || payload.body || "Neue Nachricht";
  const icon = notif.icon || payload.icon || "/apps/menyra-social/assets/icon-192.png";
  const notificationId = payload.data?.notificationId || payload.data?.notifId || "";
  const link = buildNotificationTargetUrl(
    payload.data?.link || payload.fcmOptions?.link || APP_SCOPE,
    notificationId
  );
  const tag = notif.tag || `mnyra_social_notif_${notificationId || Date.now()}`;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: icon,
      tag,
      data: {
        ...(payload.data || {}),
        notificationId,
        url: link
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification?.close();
  const data = event.notification?.data || {};
  const notificationId = String(data.notificationId || data.notifId || "").trim();
  const targetUrl = buildNotificationTargetUrl(data.url || data.link || APP_SCOPE, notificationId);

  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const socialClient = clientsList.find((client) => {
      try {
        const parsed = new URL(client.url);
        return parsed.origin === self.location.origin && parsed.pathname.startsWith(APP_SCOPE);
      } catch {
        return false;
      }
    });

    if (socialClient && "focus" in socialClient) {
      try {
        await socialClient.focus();
      } catch {}
      try {
        socialClient.postMessage({
          type: "OPEN_NOTIFICATION_TARGET",
          notificationId,
          url: targetUrl
        });
        return;
      } catch {}
      if ("navigate" in socialClient) {
        try {
          await socialClient.navigate(targetUrl);
          return;
        } catch {}
      }
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});

function isInSocialScope(url) {
  return url.origin === self.location.origin && (
    url.pathname.startsWith(APP_SCOPE)
    || url.pathname.startsWith("/shared/")
  );
}

function hasViteContentHash(pathname = "") {
  const fileName = String(pathname || "").split("/").pop() || "";
  return /-[a-zA-Z0-9_-]{8,}\.(?:mjs|js|css|png|jpg|jpeg|webp|svg|gif|woff2?|ttf|otf)$/i.test(fileName);
}

function isViteBuildManifestRequest(url) {
  return url.origin === self.location.origin && url.pathname === BUNDLED_MANIFEST_URL;
}

function isViteBuildEntryRequest(url) {
  return url.origin === self.location.origin
    && url.pathname.startsWith(`${BUNDLED_SCOPE}entry/`)
    && /\.(mjs|js|css)$/i.test(url.pathname);
}

function isViteBuildHashedAssetRequest(url) {
  return url.origin === self.location.origin
    && url.pathname.startsWith(BUNDLED_SCOPE)
    && hasViteContentHash(url.pathname);
}

function normalizePublicRouteTopTab(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  if (key === "menu" || key === "karte" || key === "speisekarte" || key === "shop") return "menu";
  if (key === "qr" || key === "menuqr" || key === "scan-qr" || key === "scanqr") return "menu";
  if (key === "profile" || key === "posts" || key === "home" || key === "overview") return "profile";
  if (key === "landing" || key === "welcome" || key === "onboarding") return "landing";
  if (key === "cart" || key === "basket" || key === "warenkorb") return "cart";
  return "";
}

function normalizePublicRouteSlug(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withoutAt = raw.startsWith("@") ? raw.slice(1) : raw;
  const slug = String(withoutAt || "").trim().toLowerCase();
  if (!slug || slug.includes(".")) return "";
  if (RESERVED_PUBLIC_ROUTE_SEGMENTS.has(slug)) return "";
  return slug;
}

function resolvePathPublicRouteHint(url) {
  const fullPath = String(url?.pathname || "");
  if (!fullPath.startsWith(APP_SCOPE)) {
    return { restaurantId: "", topTab: "", accessSource: "" };
  }
  let path = fullPath.slice(APP_SCOPE.length).replace(/^\/+|\/+$/g, "");
  if (!path || path === "index.html") {
    return { restaurantId: "", topTab: "", accessSource: "" };
  }
  const segments = path.split("/").filter(Boolean);
  if (!segments.length) {
    return { restaurantId: "", topTab: "", accessSource: "" };
  }
  const tail = segments.length > 2 ? segments.slice(-2) : segments.slice();
  const first = String(tail[0] || "").trim();
  const second = String(tail[1] || "").trim();
  const firstTopTab = normalizePublicRouteTopTab(first);
  const secondTopTab = normalizePublicRouteTopTab(second);
  const firstSlug = normalizePublicRouteSlug(first);
  const secondSlug = normalizePublicRouteSlug(second);
  const firstQrHint = firstTopTab === "menu"
    && ["qr", "menuqr", "scan-qr", "scanqr"].includes(String(first || "").trim().toLowerCase());
  const secondQrHint = secondTopTab === "menu"
    && ["qr", "menuqr", "scan-qr", "scanqr"].includes(String(second || "").trim().toLowerCase());

  if (tail.length === 1 && firstSlug) {
    return { restaurantId: firstSlug, topTab: "profile", accessSource: "" };
  }
  if (tail.length >= 2 && firstTopTab && secondSlug) {
    return {
      restaurantId: secondSlug,
      topTab: firstTopTab,
      accessSource: firstQrHint ? "qr" : ""
    };
  }
  if (tail.length >= 2 && secondTopTab && firstSlug) {
    return {
      restaurantId: firstSlug,
      topTab: secondTopTab,
      accessSource: secondQrHint ? "qr" : ""
    };
  }
  return { restaurantId: "", topTab: "", accessSource: "" };
}

function isDirectPublicProfileNavigation(url) {
  const routeRestaurantId = PUBLIC_QUERY_RESTAURANT_KEYS
    .map((key) => String(url?.searchParams?.get(key) || "").trim())
    .find(Boolean) || "";
  const routeTopTabRaw = PUBLIC_QUERY_TOP_TAB_KEYS
    .map((key) => String(url?.searchParams?.get(key) || "").trim())
    .find(Boolean) || "";
  const routeSourceRaw = PUBLIC_QUERY_SOURCE_KEYS
    .map((key) => String(url?.searchParams?.get(key) || "").trim())
    .find(Boolean) || "";
  const qrFlagRaw = String(
    url?.searchParams?.get("qr")
    || url?.searchParams?.get("isQr")
    || url?.searchParams?.get("menuQr")
    || ""
  ).trim().toLowerCase();
  const qrFlagEnabled = qrFlagRaw === "1"
    || qrFlagRaw === "true"
    || qrFlagRaw === "yes"
    || qrFlagRaw === "qr";
  const routeSource = String(routeSourceRaw || "").trim().toLowerCase();
  const routeTopTab = normalizePublicRouteTopTab(routeTopTabRaw);
  if (routeRestaurantId) {
    const resolvedTopTab = routeTopTab || ((routeSource === "qr" || qrFlagEnabled) ? "menu" : "profile");
    return resolvedTopTab === "profile" || resolvedTopTab === "menu";
  }
  const pathHint = resolvePathPublicRouteHint(url);
  if (!pathHint.restaurantId) return false;
  const resolvedPathTopTab = normalizePublicRouteTopTab(pathHint.topTab || "")
    || (pathHint.accessSource === "qr" ? "menu" : "profile");
  return resolvedPathTopTab === "profile" || resolvedPathTopTab === "menu";
}

function isExternalStaticRequest(url, request) {
  if (!EXTERNAL_STATIC_HOSTS.has(url.hostname)) return false;
  return ["script", "style", "font", "image"].includes(request.destination);
}

function isMapTileRequest(url, request) {
  const hostname = String(url?.hostname || "").toLowerCase();
  const isKnownTileHost = MAP_TILE_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
  if (!isKnownTileHost) return false;
  const destination = String(request?.destination || "");
  if (!destination) return true;
  return destination === "image";
}

function isLeafletVendorRequest(url, request) {
  const hostname = String(url?.hostname || "").toLowerCase();
  const isKnownVendorHost = LEAFLET_VENDOR_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
  if (!isKnownVendorHost) return false;
  const path = String(url?.pathname || "").toLowerCase();
  if (!path.includes("leaflet")) return false;
  const destination = String(request?.destination || "");
  if (!destination) return true;
  return destination === "script"
    || destination === "style"
    || destination === "font"
    || destination === "image";
}

async function fetchWithTimeout(request, timeoutMs = RUNTIME_FETCH_TIMEOUT_MS) {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), Math.max(1, Number(timeoutMs) || RUNTIME_FETCH_TIMEOUT_MS))
    : null;
  try {
    return await fetch(request, controller ? { signal: controller.signal } : undefined);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function buildImageFallbackResponse() {
  return new Response(IMAGE_FALLBACK_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function staleWhileRevalidate(request, { imageFallback = false } = {}) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetchWithTimeout(request)
    .then(async (response) => {
      if (response && (response.ok || response.type === "opaque")) {
        try {
          await cache.put(request, response.clone());
        } catch {}
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => null);
    return cached;
  }
  const network = await networkPromise;
  if (network || cached) return network || cached;
  if (imageFallback) return buildImageFallbackResponse();
  return new Response("", { status: 504, statusText: "Fetch failed" });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetchWithTimeout(request);
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone()).catch(() => null);
    }
    return response;
  } catch {
    return cached || new Response("", { status: 504, statusText: "Network failed" });
  }
}

async function cacheVersionedCodeAssetFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const refreshRequest = new Request(request, { cache: "reload" });
  const refreshPromise = fetchWithTimeout(refreshRequest, RUNTIME_FETCH_TIMEOUT_MS)
    .then(async (response) => {
      if (response && (response.ok || response.type === "opaque")) {
        try {
          await cache.put(request, response.clone());
        } catch {}
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    refreshPromise.catch(() => null);
    return cached;
  }

  const network = await refreshPromise;
  return network || cached || new Response("", { status: 504, statusText: "Versioned asset fetch failed" });
}

async function networkFirstBuildMetadata(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const refreshRequest = new Request(request, { cache: "reload" });
    const response = await fetchWithTimeout(refreshRequest, RUNTIME_FETCH_TIMEOUT_MS);
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone()).catch(() => null);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response("", { status: 504, statusText: "Build metadata fetch failed" });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") return;
  if (isLeafletVendorRequest(url, req)) return;
  if (isMapTileRequest(url, req)) return;

  const inScope = isInSocialScope(url);
  const isNavigation = req.mode === "navigate";
  const isImage = req.destination === "image" || /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(url.pathname);
  const isStaticAsset = ["script", "style", "font"].includes(req.destination);
  const isCodeAsset = req.destination === "script"
    || req.destination === "style"
    || /\.(mjs|js|css)$/i.test(url.pathname);
  const hasVersionToken = url.searchParams.has("v") || url.searchParams.has("version");
  const isExternalStatic = isExternalStaticRequest(url, req);

  if (!inScope && !isImage && !isExternalStatic) return;

  if (inScope && isViteBuildManifestRequest(url)) {
    event.respondWith(networkFirstBuildMetadata(req));
    return;
  }

  if (inScope && isViteBuildEntryRequest(url)) {
    event.respondWith(networkFirstBuildMetadata(req));
    return;
  }

  if (inScope && isViteBuildHashedAssetRequest(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (isNavigation && inScope) {
    const strictPublicNavigation = isDirectPublicProfileNavigation(url);
    event.respondWith((async () => {
      const navTimeoutMs = strictPublicNavigation
        ? STRICT_PUBLIC_NAVIGATION_FETCH_TIMEOUT_MS
        : NAVIGATION_FETCH_TIMEOUT_MS;
      try {
        if (!strictPublicNavigation) {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse && (preloadResponse.ok || preloadResponse.type === "opaque")) {
            const cache = await caches.open(CACHE_NAME);
            const cloneForIndex = preloadResponse.clone();
            const cloneForScope = preloadResponse.clone();
            cache.put(APP_SHELL_URL, cloneForIndex).catch(() => null);
            cache.put(APP_SCOPE, cloneForScope).catch(() => null);
            return preloadResponse;
          }
        }
        const navReq = new Request(req, { cache: strictPublicNavigation ? "reload" : "no-cache" });
        const networkResp = await fetchWithTimeout(navReq, navTimeoutMs);
        if (!networkResp || (!networkResp.ok && networkResp.type !== "opaque")) {
          throw new Error(`navigation-response-not-ok:${networkResp?.status || 0}`);
        }
        if (!strictPublicNavigation) {
          const cache = await caches.open(CACHE_NAME);
          const cloneForIndex = networkResp.clone();
          const cloneForScope = networkResp.clone();
          cache.put(APP_SHELL_URL, cloneForIndex).catch(() => null);
          cache.put(APP_SCOPE, cloneForScope).catch(() => null);
        }
        return networkResp;
      } catch {
        const cachedShell = await getCachedAppShellResponse();
        return cachedShell || new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })());
    return;
  }

  if (inScope && isCodeAsset) {
    if (hasVersionToken) {
      event.respondWith(cacheVersionedCodeAssetFirst(req));
      return;
    }
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const networkReq = new Request(req, { cache: hasVersionToken ? "reload" : "no-cache" });
        const networkResp = await fetchWithTimeout(networkReq, RUNTIME_FETCH_TIMEOUT_MS);
        if (networkResp && (networkResp.ok || networkResp.type === "opaque")) {
          cache.put(req, networkResp.clone()).catch(() => null);
        }
        return networkResp;
      } catch {
        const cached = await cache.match(req);
        return cached || new Response("", { status: 504, statusText: "Code asset fetch failed" });
      }
    })());
    return;
  }

  if (isImage || (inScope && isStaticAsset)) {
    event.respondWith(staleWhileRevalidate(req, { imageFallback: isImage }));
    return;
  }

  if (isExternalStatic) {
    event.respondWith(staleWhileRevalidate(req, { imageFallback: req.destination === "image" }));
    return;
  }

  if (inScope) {
    event.respondWith((async () => {
      try {
        const networkResp = await fetchWithTimeout(req);
        if (networkResp && networkResp.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResp.clone()).catch(() => null);
        }
        return networkResp;
      } catch {
        const cached = await caches.match(req);
        return cached || new Response("", { status: 504, statusText: "Network failed" });
      }
    })());
  }
});
