Status: CURRENT
Last updated: 2026-05-30

# Schritt 52 - Launch-Surface Read- und Deploy-Cleanup

## Ziel

Breitere Launch-Pruefung ueber die echte Runtime-Flaeche, nicht nur Menu/Orders:
Auth, Firebase-Initialisierung, Public Profile, Feed, Posts, Stories, Upload/Media,
Push/Notifications, CRM/Heart, Waiter, Functions, Rules, Service Worker, Static-Deploy.

## Befund

- Firebase wird zentral ueber `shared/firebase-config.js` geladen. Weitere benannte Apps
  sind bewusst: `menyra-secondary` fuer CRM-Auth-User-Erstellung und `menyra-waiter`
  fuer die Waiter-PWA.
- Feed-Bootstrap, Stories, Notifications und Waiter-Orders haben Limits, blockieren aber
  keine neuen Writes. Neue Orders werden nach `restaurants/{restaurantId}/orders/{orderId}`
  geschrieben und per Listener/Function gespiegelt.
- Der externe User-Profil-Post-Read las bisher die komplette `users/{uid}/posts`-Subcollection.
  Dieser Pfad ist jetzt im normalen geordneten Read ueber `FAST_LIMITS.userPosts` gedeckelt.
- Der Build kopierte lokale Demo-/Standalone-HTML-Dateien in `dist`, obwohl sie nicht ueber
  die Launch-Routen gebraucht werden.

## Geaendert

- `apps/menyra-social/core/feed/feed-visibility-runtime-cluster.js`
  - Externe User-Profil-Post-Reads nutzen im normalen geordneten Firestore-Read jetzt
    `limit(FAST_LIMITS.userPosts)`.
- `scripts/build-vercel-static-output.mjs`
  - `apps/testfirst/`,
    `apps/menyra-social/menu-detail-food-drink-standalone.html` und
    `apps/menyra-social/profile/external/current-profile.html` werden nicht mehr in
    den Vercel-Static-Output kopiert.
- `tests/feed-visibility-runtime-cluster.test.mjs`
  - Neuer Test fuer den gedeckelten externen User-Profil-Post-Read.
- Social-Bundle wurde neu gebaut.

## Bewusst Nicht Geaendert

- Keine UI-, Layout-, Farb-, Typografie- oder UX-Aenderung.
- Keine Firestore Rules oder Functions-Aenderung.
- Keine Route-, QR-, Cart-, Order-, Menu- oder CRM-Produktlogik-Aenderung.
- Keine Begrenzung des vollen Business-Post-Loads, weil das ohne Pagination sichtbare
  Vollstaendigkeits-Logik aendern wuerde.
- Keine Erhoehung des Bundle-Budgets.

## Bewertung

`bestanden mit Rest-Risiko`

Die Launch-Flaeche ist sauberer: weniger deployed Demo-Oberflaeche und ein riskanter
externer User-Post-Full-Read ist begrenzt. Rest-Risiko bleibt bei sehr grossen einzelnen
Business-Profilen, weil volle Business-Post-Loads bewusst nicht ohne Produktentscheidung
gedeckelt wurden.

## Verifikation

- `node --test tests/*.test.mjs`
- `npm run build`
- `npm run check:social-bundle`
- `git diff --check`
- Breiter `node --check` ueber JS/MJS/CJS ohne `node_modules`, `dist`, bundled und vendor.
- Dist-Gegenpruefung: die ausgeschlossenen Demo-/Standalone-Dateien fehlen in `dist`.

## Manuelle Testliste

- Oeffentliche Business-Seite `/:slug`, `/:slug/posts`, `/:slug/menu` oeffnen.
- Oeffentliches User-Profil `/user/:id` mit Posts oeffnen.
- Als Gast eine Bestellung absenden und in Waiter pruefen.
- Waiter `/waiter` oeffnen und neue Bestellung/Push-Hinweis beobachten.
- Heart/CRM `/leads`, `/customers`, `/admin/staff` kurz oeffnen.
