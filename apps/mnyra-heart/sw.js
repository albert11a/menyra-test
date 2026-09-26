const HEART_CACHE_PREFIX = "mnyra-heart-shell-";
const HEART_CACHE = "mnyra-heart-shell-v11";
const SHELL_ASSETS = [
  "/heart/",
  "/heart/index.html",
  "/heart/heart.css",
  "/heart/heart.js",
  "/heart/heart-api-client.js",
  "/heart/heart-auth.js",
  "/heart/heart-events.js",
  "/heart/heart-render.js",
  "/heart/heart-morph.js",
  "/heart/heart-state.js",
  "/heart/heart-ui-utils.js",
  "/heart/heart-async-utils.js",
  "/heart/heart-single-flight.js",
  "/heart/heart-landing-adapter.js",
  "/heart/heart-landing-render.js",
  "/heart/heart-start-core.js",
  "/heart/heart-start-render.js",
  "/heart/heart-settings-render.js",
  "/heart/heart-monitoring-adapter.js",
  "/heart/heart-test-report-normalizer.js",
  "/heart/manifest.json",
  "/apps/mnyra-heart/assets/apple-touch-icon.png?v=2026-03-20-heart-icon-normal-2",
  "/apps/mnyra-heart/assets/icon-192.png?v=2026-03-20-heart-icon-normal-2",
  "/apps/mnyra-heart/assets/icon-512.png?v=2026-03-20-heart-icon-normal-2",
  "/apps/mnyra-heart/",
  "/apps/mnyra-heart/index.html",
  "/apps/mnyra-heart/heart.css",
  "/apps/mnyra-heart/heart.js",
  "/apps/mnyra-heart/heart-api-client.js",
  "/apps/mnyra-heart/heart-auth.js",
  "/apps/mnyra-heart/heart-events.js",
  "/apps/mnyra-heart/heart-render.js",
  "/apps/mnyra-heart/heart-morph.js",
  "/apps/mnyra-heart/heart-state.js",
  "/apps/mnyra-heart/heart-ui-utils.js",
  "/apps/mnyra-heart/heart-async-utils.js",
  "/apps/mnyra-heart/heart-single-flight.js",
  "/apps/mnyra-heart/heart-landing-adapter.js",
  "/apps/mnyra-heart/heart-landing-render.js",
  "/apps/mnyra-heart/heart-start-core.js",
  "/apps/mnyra-heart/heart-start-render.js",
  "/apps/mnyra-heart/heart-settings-render.js",
  "/apps/mnyra-heart/heart-monitoring-adapter.js",
  "/apps/mnyra-heart/heart-test-report-normalizer.js",
  "/apps/mnyra-heart/manifest.json",
  "/shared/ceo-access.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(HEART_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Nur EIGENE alte Caches loeschen: der Cache-Storage ist origin-weit geteilt.
    // Fremde Prefixe (menyra-cache-*, mnyra-social-cache-*) gehoeren anderen
    // Service Workern - sie mitzuloeschen wirft deren Offline-Shell und
    // Bild-Caches weg und macht die naechsten Loads unnoetig langsam.
    await Promise.all(
      keys
        .filter((key) => key.startsWith(HEART_CACHE_PREFIX) && key !== HEART_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/heart/")) return;

  const isHeartShellAsset = url.pathname.startsWith("/heart/")
    || url.pathname.startsWith("/apps/mnyra-heart/")
    || url.pathname === "/shared/ceo-access.js";
  const isHeartDocumentOrModule = isHeartShellAsset
    && (
      url.pathname.endsWith("/")
      || url.pathname.endsWith(".html")
      || url.pathname.endsWith(".js")
      || url.pathname.endsWith(".css")
      || url.pathname.endsWith(".json")
    );

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(HEART_CACHE);
        const cacheKey = url.pathname.startsWith("/heart/") ? "/heart/index.html" : "/apps/mnyra-heart/index.html";
        cache.put(cacheKey, networkResponse.clone());
        return networkResponse;
      } catch {
        const cacheKey = url.pathname.startsWith("/heart/") ? "/heart/index.html" : "/apps/mnyra-heart/index.html";
        const cached = await caches.match(cacheKey);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isHeartDocumentOrModule) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(HEART_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        const cached = await caches.match(request);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (isHeartShellAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const networkResponse = await fetch(request);
      const cache = await caches.open(HEART_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })());
  }
});


// ---------------------------------------------------------------------------
// Die Meldung auf dem Telefon
// ---------------------------------------------------------------------------
//
// WARUM HIER UND NICHT IM SERVICE WORKER DER HAUPTSEITE.
//
// Der Worker unter / hat schon einen push-Handler, aber Heart meldet seinen
// eigenen an ("./sw.js"), und der hat damit einen eigenen Geltungsbereich.
// Ein Push kommt immer bei dem Worker an, der das Abonnement haelt - also
// bei diesem. Ohne die zwei Handler hier zeigte iOS eine leere
// Platzhaltermeldung ("Diese Website wurde im Hintergrund aktualisiert") und
// ein Antippen fuehrte nirgendwohin.
//
// Gebaut wie der Handler der Hauptseite, nur mit Heart als Ziel: Zwei
// verschiedene Fassungen desselben Handlers laufen frueher oder spaeter
// auseinander, und dann liegt der Unterschied an der Stelle, an der es
// niemand nachsieht.

const HEART_START = '/heart/';
const HEART_ICON = '/apps/mnyra-heart/assets/icon-192.png?v=2026-03-20-heart-icon-normal-2';

function heartZielAdresse(rohAdresse) {
  const roh = String(rohAdresse || '').trim() || HEART_START;
  try {
    return new URL(roh, self.location.origin).toString();
  } catch {
    return new URL(HEART_START, self.location.origin).toString();
  }
}

self.addEventListener('push', (event) => {
  const nutzlast = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();

  const meldung = nutzlast.notification || nutzlast.webpush?.notification || {};
  const titel = meldung.title || nutzlast.title || 'MNYRA Heart';
  const text = meldung.body || nutzlast.body || 'Neue Meldung';
  const zeichen = meldung.icon || nutzlast.icon || HEART_ICON;
  const kennung = nutzlast.data?.notificationId || nutzlast.data?.notifId || '';
  const ziel = heartZielAdresse(nutzlast.data?.link || nutzlast.fcmOptions?.link || HEART_START);

  event.waitUntil(
    self.registration.showNotification(titel, {
      body: text,
      icon: zeichen,
      badge: zeichen,
      // EINE MELDUNG JE FALL, nicht je Zustellung. Ohne tag stapeln sich
      // auf dem Sperrbildschirm mehrere Meldungen zu derselben Analyse,
      // falls FCM eine Zustellung wiederholt.
      tag: meldung.tag || `heart_${kennung || Date.now()}`,
      data: { ...(nutzlast.data || {}), notificationId: kennung, url: ziel }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification?.close();
  const daten = event.notification?.data || {};
  const ziel = heartZielAdresse(daten.url || daten.link || HEART_START);

  event.waitUntil((async () => {
    const fenster = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Ein schon offenes Heart wird nach vorne geholt und umgelenkt, statt
    // ein zweites daneben aufzumachen. Wer die Meldung antippt, will seinen
    // Arbeitsplatz sehen und nicht einen zweiten davon.
    const offen = fenster.find((fensterEintrag) => {
      try {
        const zerlegt = new URL(fensterEintrag.url);
        return zerlegt.origin === self.location.origin
          && (zerlegt.pathname.startsWith('/heart') || zerlegt.pathname.startsWith('/apps/mnyra-heart'));
      } catch {
        return false;
      }
    });

    if (offen) {
      try { await offen.focus(); } catch {}
      if ('navigate' in offen) {
        try { await offen.navigate(ziel); } catch {}
      }
      return;
    }

    if (self.clients.openWindow) {
      try { await self.clients.openWindow(ziel); } catch {}
    }
  })());
});
