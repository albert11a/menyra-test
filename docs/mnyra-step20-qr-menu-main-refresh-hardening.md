Status: CURRENT
Last updated: 2026-04-24

# Mnyra Schritt 20: QR Menu-Main + Refresh Hardening

## Ziel

QR-Caltstart sollte stabil und schnell Menu-Content liefern, und Refresh im
QR-Kontext sollte wieder verlaesslich auf `menu` landen.

## Root Cause

- QR-Kontext (`src/source=qr`) war in der URL-Sync-/Path-Kanonisierung nicht
  mehr stark genug an `menu` gebunden.
- Dadurch konnten QR-Pfade als `/:slug` oder `/:slug/posts` persistieren und
  beim Refresh als `profile/posts` rekonstruiert werden.
- Zusaetzlich lief die Slug->Restaurant-Aufloesung fuer Public-Business-Profile
  sequentiell ueber mehrere Feldqueries, was Cold-Scans sichtbar verlangsamt.

## Umgesetzte Aenderungen

1. `apps/menyra-social/core/auth/initial-route-state.js`
- Fuer Business-Pending-Route erzwingt QR-Kontext jetzt direkt
  `pendingProfileTopTab = "menu"`.
- Explizite Query-TopTab-Hinweise bleiben fuer Nicht-QR erhalten.

2. `apps/menyra-social/core/router/public-business-route-utils.js`
- `buildCanonicalPublicBusinessPathCore(...)` mappt bei QR-Zugriff wieder
  auf `/:slug/menu` (menu-first fuer QR).

3. `apps/menyra-social/social-app.js`
- Route-Sync setzt bei `profileAccessSource === "qr"` die Surface-Wahrheit
  auf `profileTopTab = "menu"` und `profileContentTab = "menu"`.
- Damit bleiben URL und Refresh-Verhalten im QR-Kontext menu-first.

4. `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- Slug-Aufloesung (`publicSlug`, `landingSlug`, `handle`) wurde auf parallele
  Queries umgestellt, um Cold-Start-Latenz zu reduzieren.

5. `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- QR-Guest-Menue-Load-Backoff wurde reduziert (`baseDelayMs` fuer QR), um
  schnellere First-Content-Reaktion beim Scan zu erreichen.

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderungen.
- Keine Firebase Rules/Functions.
- Keine grossen Refactors.
- Keine Playwright-/Smoke-Tests.

## Validierung

- `node --check apps/menyra-social/core/auth/initial-route-state.js`
- `node --check apps/menyra-social/core/router/public-business-route-utils.js`
- `node --check apps/menyra-social/social-app.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- Zusaetzlicher Route-Check via Node-Snippet:
  - `/alpha?src=qr&table=7` => `pendingProfileTopTab: menu`
  - `/alpha/posts?src=qr&table=7` => `pendingProfileTopTab: menu`
  - QR-Kanonisierung => `/:slug/menu`

## Restrisiko

- QR bleibt auf menu-first forciert; wenn spaeter eine explizite Produktregel
  fuer persistente QR-Posts-URLs gewuenscht ist, muss der Route-Vertrag
  erneut bewusst entschieden werden.
- Die parallele Slug-Query nutzt mehr gleichzeitige Reads im Resolver, ist
  aber auf einen engen Coldstart-Pfad begrenzt.

## Bewertung

`bestanden mit Rest-Risiko`
