Status: CURRENT
Last updated: 2026-04-24

# Mnyra Public Profile Orchestration Fix

## Ziel

Dieser Schritt behebt die zentralen Orchestrierungs-Root-Causes im oeffentlichen
Profilpfad (`/:slug`, `/:slug/menu`, Legacy `/:slug/posts`) inklusive QR-
Einstieg, Tabwechsel, Refresh und Browser-History.

## Was kaputt war

- Es gab mehrere konkurrierende Wahrheiten fuer denselben Flow:
  URL/Pending-Route, Direct-Entry, Route-Payload, Live-Profile-State und
  getrennte Stores (Posts/Menu/Fokus).
- QR-Kontext (`source/src`, `table`) wurde bei Surface-Wechsel teilweise
  verloren, weil er nur im Menu-Surface robust mitgeschrieben wurde.
- Der Canonical-Path-Builder konnte QR-Kontext implizit auf `/:slug/menu`
  erzwingen statt Surface-intent zu respektieren.
- Browser-History fuer Public-Profile-Surface war zu schwach
  (`replaceState`-only, kein `popstate`-Replay-Pfad).
- Canonical `restaurantId` wurde in Public-Read-Pfaden zu oft spaet und
  redundant aufgeloest.

## Behobene Root Causes

1. Route/Surface-Truth und QR-Kontext wurden entkoppelt:
- QR-Kontext bleibt Query-Kontext (`src`, `table`) und erzwingt nicht mehr
  implizit den Menu-Pfad.
- Datei:
  `apps/menyra-social/core/router/public-business-route-utils.js`

2. Pending-Route-Replays werden nicht mehr durch alte Handled-Flags blockiert:
- `applyInitialRouteState` setzt Pending-Handled-Flags deterministisch zurueck.
- Datei:
  `apps/menyra-social/core/auth/pending-route-startup-state.js`

3. QR-Kontext bleibt bei Profil-/Posts-Surfaces erhalten:
- Pending-Direct-Entry und Deeplink-Open geben `menuAccessSource/tableNumber`
  nicht nur fuer Menu weiter.
- Dateien:
  `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
  `apps/menyra-social/core/router/deeplink-flow-utils.js`

4. `showPublicProfile`/Web-Direct-Entry behandeln QR-/Table-Kontext stabil:
- Kontext wird bei Same-Profile-Updates nicht mehr unnoetig geloescht.
- Web-Direct-Entry fuehrt `menuAccessSource/tableNumber` explizit.
- Datei:
  `apps/menyra-social/core/profile/public-profile-runtime-controller.js`

5. Canonical `restaurantId`-Handoff wurde stabilisiert:
- Route->Restaurant-Doc-Resolve hat jetzt In-Flight-/Result-Cache.
- Posts-Loader nutzt Canonical-ID-Routecache, bevor erneut aufgeloest wird.
- Datei:
  `apps/menyra-social/core/profile/public-profile-runtime-controller.js`

6. QR menu-first laedt Posts frueher:
- QR-menu-first nutzt keinen spaeten "defer posts until visible posts surface"
  Pfad mehr.
- Datei:
  `apps/menyra-social/core/profile/profile-open-flow-utils.js`

7. URL-Sync/History wurde gehaertet:
- Business-Surface-Wechsel koennen gezielt `pushState` benutzen.
- `popstate` replayt Route->Pending->Open-Flow wieder in App-State.
- Datei:
  `apps/menyra-social/social-app.js`
  `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`

## Neue Regeln (Runtime-Vertrag)

1. Path regelt Surface, Query regelt Kontext:
- `/:slug` => Profil/Posts-Surface
- `/:slug/menu` => Menu-Surface
- `src=qr` + `table=<n>` bleiben Kontext und koennen auf beiden Surfaces
  bestehen.

2. QR-Kontext ist nicht mehr Menu-only:
- QR-Menueinstieg kann auf Posts wechseln, ohne Kontextverlust in URL/State.
- Refresh auf `/:slug?src=qr&table=<n>` rekonstruiert denselben QR-Kontext.

3. Canonical-ID-Aufloesung ist cache-gestuetzt:
- Route-ID/Slug -> Restaurant-Dokument -> Canonical-ID wird wiederverwendet,
  um doppelte spaete Resolver-Pfade zu reduzieren.

4. History-Verhalten:
- User-initiierte Business-Tab-Surface-Wechsel markieren Route-Sync als `push`.
- Nicht-user-initiierte Reconciles bleiben `replace`.
- `popstate` replayt Pending-Route und oeffnet den passenden Profilpfad neu.

## Geaenderte Dateien

- `apps/menyra-social/core/router/public-business-route-utils.js`
- `apps/menyra-social/core/auth/pending-route-startup-state.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/router/deeplink-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `apps/menyra-social/social-app.js`

## Kompatibilitaet

- Legacy `/:slug/posts` bleibt kompatibel ueber Path-Normalisierung.
- Alte QR-Links wie
  `index.html?r=<slug|id>&tab=menu&source=qr&table=<n>`
  bleiben kompatibel, weil Query-Aliase und Pending-Route-Import unveraendert
  unterstützt werden.

## Restrisiken

- Der Public-Open-Flow bleibt weiterhin komplex (mehrere Seeds/Phasen).
  Der Schritt reduziert Konflikte, ersetzt aber noch keinen kompletten
  Single-Owner-Refactor.
- Sichtbare Ladephasen (Header frueh, Content spaeter) koennen in
  schwachen Netzbedingungen weiterhin auftreten, auch wenn Reentry-/Kontext-
  Fehler reduziert wurden.

## Manuelle Regression (fuer den Folgeschritt)

1. `/:slug` direkt, Refresh, Tabwechsel Posts <-> Menu.
2. `/:slug/menu` direkt, Refresh, Menu -> Posts -> Refresh -> Menu.
3. Legacy `/:slug/posts` (Normalisierung und Surface-Rueckgewinnung).
4. QR alt:
   `index.html?r=<slug|id>&tab=menu&source=qr&table=7`
   dann Menu -> Posts -> Refresh -> Menu.
5. Browser Back/Forward zwischen `/:slug` und `/:slug/menu`, jeweils mit und
   ohne `src=qr&table`.
