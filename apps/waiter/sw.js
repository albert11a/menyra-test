const CACHE_NAME = "mnyra-waiter-cache-v2";
const CACHE_PREFIX = "mnyra-waiter-cache-";
const APP_SCOPE = "/waiter/";
const APP_ASSET_SCOPE = "/apps/waiter/";
const APP_SHELL_URL = "/waiter/";
const EXTERNAL_STATIC_HOSTS = new Set([
  "www.gstatic.com",
  "unpkg.com"
]);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
  })());
});

self.addEventListener("message", (event) => {
  if (String(event?.data?.type || "") === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function buildNotificationTargetUrl(rawUrl) {
  const fallback = APP_SCOPE;
  try {
    return new URL(rawUrl || fallback, self.location.origin).href;
  } catch {
    return fallback;
  }
}

self.addEventListener("push", (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener("notificationclick", (event) => {
  event.notification?.close();
  const targetUrl = buildNotificationTargetUrl(event.notification?.data?.url || APP_SCOPE);
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const waiterClient = clientsList.find((client) => {
      try {
        const parsed = new URL(client.url);
        return parsed.origin === self.location.origin && parsed.pathname.startsWith(APP_SCOPE);
      } catch {
        return false;
      }
    });
    if (waiterClient && "focus" in waiterClient) {
      try {
        await waiterClient.focus();
      } catch {}
      if ("navigate" in waiterClient) {
        try {
          await waiterClient.navigate(targetUrl);
          return;
        } catch {}
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});

function isInWaiterScope(url) {
  return url.origin === self.location.origin && (
    url.pathname.startsWith(APP_SCOPE)
    || url.pathname.startsWith(APP_ASSET_SCOPE)
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

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(new Request(request, { cache: "no-cache" }));
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone()).catch(() => null);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  const inScope = isInWaiterScope(url);
  const isNavigation = req.mode === "navigate";
  const isImage = req.destination === "image" || /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(url.pathname);
  const isCodeAsset = req.destination === "script"
    || req.destination === "style"
    || /\.(mjs|js|css)$/i.test(url.pathname);
  const isExternalStatic = isExternalStaticRequest(url, req);

  if (!inScope && !isImage && !isExternalStatic) return;

  if (isNavigation && inScope) {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(req, { cache: "no-cache" }));
        const cache = await caches.open(CACHE_NAME);
        cache.put(APP_SHELL_URL, response.clone()).catch(() => null);
        return response;
      } catch {
        const cachedShell = await caches.match(APP_SHELL_URL);
        return cachedShell || new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })());
    return;
  }

  if ((inScope && isCodeAsset) || isImage || isExternalStatic) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  if (inScope) {
    event.respondWith(networkFirst(req));
  }
});
