const CACHE_NAME = "mnyra-social-cache-v7-business-menu-main-sync-01";
const CACHE_PREFIX = "mnyra-social-cache-";
const APP_SCOPE = "/apps/menyra-social/";
const APP_SHELL_URL = "/apps/menyra-social/index.html";
const BETA_UPDATE_CHANNEL = "beta-auto-update-v2";
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

function parseTargetUrl(rawUrl) {
  try {
    return new URL(String(rawUrl || "").trim() || APP_SCOPE, self.location.origin);
  } catch {
    return null;
  }
}

function isAppShellTargetUrl(url) {
  const parsed = url instanceof URL ? url : parseTargetUrl(url);
  if (!parsed || parsed.origin !== self.location.origin) return false;
  const path = String(parsed.pathname || "");
  return path === APP_SCOPE || path === APP_SHELL_URL || path === "/apps/menyra-social";
}

function isStoryTargetUrl(url) {
  const parsed = url instanceof URL ? url : parseTargetUrl(url);
  if (!parsed || parsed.origin !== self.location.origin) return false;
  return String(parsed.pathname || "").startsWith("/apps/menyra-social/story/");
}

function isSameTargetUrl(left, right) {
  const leftUrl = left instanceof URL ? left : parseTargetUrl(left);
  const rightUrl = right instanceof URL ? right : parseTargetUrl(right);
  if (!leftUrl || !rightUrl) return false;
  return leftUrl.origin === rightUrl.origin
    && leftUrl.pathname === rightUrl.pathname
    && leftUrl.search === rightUrl.search;
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
  const parsedTargetUrl = parseTargetUrl(targetUrl);
  const shouldRouteThroughAppMessage = isAppShellTargetUrl(parsedTargetUrl) && !isStoryTargetUrl(parsedTargetUrl);

  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const exactTargetClient = clientsList.find((client) => isSameTargetUrl(client.url, parsedTargetUrl));
    const socialClient = clientsList.find((client) => {
      try {
        const parsed = new URL(client.url);
        return parsed.origin === self.location.origin && parsed.pathname.startsWith(APP_SCOPE);
      } catch {
        return false;
      }
    });

    if (exactTargetClient && "focus" in exactTargetClient) {
      try {
        await exactTargetClient.focus();
        return;
      } catch {}
    }

    if (socialClient && "focus" in socialClient) {
      try {
        await socialClient.focus();
      } catch {}
      if ("navigate" in socialClient) {
        if (!shouldRouteThroughAppMessage) {
          try {
            await socialClient.navigate(targetUrl);
            return;
          } catch {}
        }
      }
      if (shouldRouteThroughAppMessage) {
        try {
          socialClient.postMessage({
            type: "OPEN_NOTIFICATION_TARGET",
            notificationId,
            url: targetUrl
          });
          return;
        } catch {}
      }
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

async function networkFirst(request, { bypassHttpCache = false } = {}) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkReq = bypassHttpCache
      ? new Request(request, { cache: "no-cache" })
      : request;
    const response = await fetch(networkReq);
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone()).catch(() => null);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response("", { status: 504, statusText: "Network failed" });
  }
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
  const hasVersionToken = url.searchParams.has("v") || url.searchParams.has("version");
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
    if (hasVersionToken) {
      event.respondWith(staleWhileRevalidate(req));
      return;
    }
    event.respondWith(networkFirst(req, { bypassHttpCache: true }));
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
