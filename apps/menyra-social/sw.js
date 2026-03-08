const CACHE_NAME = "mnyra-social-cache-v5-beta-update";
const CACHE_PREFIX = "mnyra-social-cache-";
const APP_SCOPE = "/apps/menyra-social/";
const APP_SHELL_URL = "/apps/menyra-social/index.html";
const BETA_UPDATE_CHANNEL = "beta-auto-update-v1";
const CODE_ASSET_NETWORK_TIMEOUT_MS = 1100;
const EXTERNAL_STATIC_HOSTS = new Set([
  "www.gstatic.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "unpkg.com"
]);

async function broadcastToClients(payload) {
  const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clientsList.forEach((client) => {
    try {
      client.postMessage(payload);
    } catch {}
  });
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
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

function isExternalStaticRequest(url, request) {
  if (!EXTERNAL_STATIC_HOSTS.has(url.hostname)) return false;
  return ["script", "style", "font", "image"].includes(request.destination);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
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
  return network || cached || new Response("", { status: 504, statusText: "Fetch failed" });
}

async function networkFirstWithTimeout(request, { timeoutMs = CODE_ASSET_NETWORK_TIMEOUT_MS } = {}) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = (async () => {
    try {
      const cacheBypassReq = new Request(request, { cache: "no-cache" });
      const response = await fetch(cacheBypassReq);
      if (response && (response.ok || response.type === "opaque")) {
        cache.put(request, response.clone()).catch(() => null);
      }
      return response;
    } catch {
      return null;
    }
  })();
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(null), timeoutMs);
  });
  const raceResponse = await Promise.race([networkPromise, timeoutPromise]);
  if (raceResponse) return raceResponse;
  if (cached) return cached;
  const eventualResponse = await networkPromise;
  return eventualResponse || new Response("", { status: 504, statusText: "Network failed" });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  const inScope = isInSocialScope(url);
  const isNavigation = req.mode === "navigate";
  const isImage = req.destination === "image" || /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(url.pathname);
  const isStaticAsset = ["script", "style", "font"].includes(req.destination);
  const isCodeAsset = req.destination === "script"
    || req.destination === "style"
    || /\.(mjs|js|css)$/i.test(url.pathname);
  const isExternalStatic = isExternalStaticRequest(url, req);

  if (!inScope && !isImage && !isExternalStatic) return;

  if (isNavigation && inScope) {
    event.respondWith((async () => {
      try {
        const navReq = new Request(req, { cache: "no-cache" });
        const networkResp = await fetch(navReq);
        const cache = await caches.open(CACHE_NAME);
        cache.put(APP_SHELL_URL, networkResp.clone()).catch(() => null);
        return networkResp;
      } catch {
        const cachedShell = await caches.match(APP_SHELL_URL);
        return cachedShell || new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })());
    return;
  }

  if (inScope && isCodeAsset) {
    event.respondWith(networkFirstWithTimeout(req));
    return;
  }

  if (isImage || (inScope && isStaticAsset)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  if (isExternalStatic) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  if (inScope) {
    event.respondWith((async () => {
      try {
        const networkResp = await fetch(req);
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
