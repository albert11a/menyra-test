Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 8: Public Cold-Start / Refresh Request Analyse

## Scope dieses Dokuments

- Kein Produktumbau.
- Keine UI-/Design-Aenderung.
- Keine Routing-, Firebase-, Functions- oder Rules-Aenderung.
- Keine Smoke-Tests, kein Playwright.
- Nur Ist-Analyse fuer `/:slug`, `/:slug/posts`, `/:slug/menu` im aktuellen Branch-Stand.

## Verwendete Grundlage

- `AGENTS.md`
- `docs/mnyra-current-phase.md`
- Historischer `CURRENT`-Stand von `docs/mnyra-launch-masterplan.md` aus Git-Stand `21caa31`, weil die Datei im aktuellen Arbeitsbaum fehlt.
- Historischer `CURRENT`-Stand von `docs/mnyra-step2-route-data-matrix.md` aus Git-Stand `21caa31`, weil die Datei im aktuellen Arbeitsbaum fehlt.

## A. Aktueller Cold-Start-Pfad heute

### Gemeinsamer Start fuer alle drei Routen

1. `apps/menyra-social/index.html` erkennt ueber den Route-Parser, dass ein direkter oeffentlicher Business-Pfad geoeffnet wird.
2. Noch vor dem App-Start wird ein HTTP-Request auf `socialBootstrapFeed` gebaut und fuer Direkt-Routen sofort gestartet.
3. Parallel dazu uebersetzt `core/auth/initial-route-state.js` den Pfad in einen Pending-Profile-State:
   Restaurant-Ziel, `topTab`, `menuAccessSource`, `tableNumber`.
4. `social-app.js -> applyPendingInitialRouteState()` seedet einen ersten Web-Direct-Surface.
   Wenn das Bootstrap-Payload schon da ist, kann es direkt verwendet werden.
   Wenn es noch nicht da ist, wird trotzdem schon ein minimaler Profilzustand gebaut.
5. Danach oeffnet der Deep-Link-/Open-Flow das Zielprofil ueber `openProfileViewFromBusiness(...)`.

### `/:slug`

- Wird als Business-Profil mit `topTab=profile` und `contentTab=posts` behandelt.
- Der erste sichtbare Zustand ist oft schon ein seeded Header:
  Name, Avatar, Ort und Route-Kontext koennen aus Preview, Route-Payload oder Fallback kommen.
- Posts sind danach ein eigener Live-Schritt.
- Wenn die kanonische `restaurantId` frueh bekannt ist, startet der Open-Flow einen fruehen Posts-Load.
- Wenn nur der Slug bekannt ist, muss zuerst die Business-Doc-Aufloesung laufen, erst danach folgen die Posts.

### `/:slug/posts`

- Technisch derselbe sichtbare Surface wie `/:slug`, nur explizit als Posts-Route.
- Auch hier ist der Header frueh seedbar.
- Ein frueher Posts-Load klappt nur dann sofort, wenn die Ziel-ID schon direkt verwendbar ist.
- Wenn das nicht der Fall ist, kommt wieder zuerst Doc-/ID-Aufloesung, danach der eigentliche Posts-Read.

### `/:slug/menu`

- Wird als `topTab=menu` und `contentTab=menu` geoeffnet.
- Der erste seeded Zustand setzt den Header frueh, Menu und Focus aber oft noch auf `loading/unknown`.
- Beim ersten Render triggern die Ensure-Pfade `ensureMenuDataForProfile()` und `ensureFocusDataForProfile()`, falls noch keine autoritative Menu-/Focus-Wahrheit vorliegt.
- Diese Ensures loesen erst die kanonische `restaurantId` auf und laden danach Menu und Focus live nach.
- Posts sind hier nicht der erste sichtbare Surface und werden im Client spaeter behandelt.

### Welche Daten / Schichten zuerst kommen

1. Route-Wahrheit:
   Pfad, Query, `topTab`, `menuAccessSource`.
2. Bootstrap-/Preview-Schicht:
   `socialBootstrapFeed`, `__publicRouteBootstrap`, Restaurant-Preview, evtl. lokale Preview-Caches.
3. Profil-/Identity-Schicht:
   Business-Doc-Aufloesung und Normalisierung.
4. Surface-Schicht:
   Posts oder Menu/Focus.
5. Realtime-Schicht:
   Profil-Listener; Menu-Meta-Listener nur in bestimmten nicht-Guest-Kontexten.

### Warum der Header frueher sichtbar wird

- `public-profile-direct-entry-controller.js` kann schon ohne fertige Surface-Daten einen seeded Profilkopf bauen.
- `public-profile-surface-controller.js` bewertet den Header als `ready`, sobald genug Identitaets-Seed vorhanden ist.
- Der Header braucht also keine fertigen Posts, kein fertiges Menu und keinen fertigen Focus.

### Warum Posts / Menu spaeter nachziehen

- Posts, Menu und Focus haben eigene Status-Pfade.
- Diese Bereiche starten oft als `unknown` oder `loading`.
- Auf Posts-Routen haengt der echte Posts-Read haeufig noch an einer extra Restaurant-Aufloesung.
- Auf Menu-Routen haengen Menu und Focus an mehreren separaten Reads:
  `public/menu`, `public/offers`, `public/meta` und internen Retry-/Backoff-Pfaden.

## B. Request-Karte

### Browser-seitig normal und noetig

- Statische Assets fuer `index.html`, JS, CSS, Fonts, Bilder.
- Genau ein direkter Bootstrap-HTTP-Request auf `socialBootstrapFeed` pro Hard Refresh.
- Ein sichtbarer Live-Content-Pfad:
  - `socialPosts` fuer `/:slug` oder `/:slug/posts`
  - `public/menu` plus `public/offers` fuer `/:slug/menu`
- Ein Profil-Listener auf `restaurants/{id}` nach dem Oeffnen des sichtbaren Profils.

### Unter der Haube heute ebenfalls aktiv

- Server-seitige Slug-Aufloesung im Bootstrap:
  erst `restaurants/{slug}` direkt, dann bei Bedarf Query auf `publicSlug`, `landingSlug`, `handle`.
- Server-seitiger Direct-Route-Bootstrap laedt nicht nur den sichtbaren Surface:
  - `/:slug` und `/:slug/posts` laden im Bootstrap trotzdem Posts, Menu und Focus.
  - `/:slug/menu` laedt im Bootstrap trotzdem Posts, Menu, Menu-Meta und Focus.
- Client-seitige Slug-/Doc-Aufloesung passiert danach noch einmal in `fetchBusinessProfileDoc(...)`.
- Client-seitige Surface-Loads laufen danach zusaetzlich noch einmal ueber die Ensure-Pfade.

### Doppelt, unnoetig oder verdaechtig

- Dieselbe Slug-zu-ID-Aufloesung laeuft server-seitig im Bootstrap und client-seitig noch einmal.
- `ensurePostsDataForProfile()` probiert mehrere Kandidaten:
  angeforderte ID, kanonische ID, `publicSlug`, `landingSlug`, `handle`.
  Das kann mehrere Posts-Loads fuer denselben Zielkontext ausloesen.
- Auf `/:slug/menu` wird `restaurants/{id}/public/meta` client-seitig zweimal gelesen:
  einmal fuer Menu-Badge, einmal fuer Focus-Enabled.
- Der Direct-Route-Bootstrap ueberlaedt nicht sichtbare Surfaces:
  Menu/Focus auf Posts-Routen, Posts auf Menu-Routen.
- Direkte Public-Web-Routen nutzen absichtlich keinen Bootstrap-Cache.
  Jeder Hard Refresh startet den HTTP-Bootstrap also erneut live.

### Woher die Requests typischerweise kommen

- Bootstrap:
  `apps/menyra-social/index.html`, `functions/index.js`, `public-bootstrap-runtime-controller.js`
- Fallback / Doc-Resolve:
  `public-profile-runtime-controller.js`, `profile-open-flow-utils.js`
- Ensure:
  `profile-business-menu-runtime-cluster.js`, `profile-menu-focus-render-controller.js`
- Listener / Realtime:
  `public-profile-runtime-controller.js`, optional `session-data-runtime-controller.js`
- Re-resolve / Reentry:
  vor allem `ensurePostsDataForProfile()` und `resolveProfileRestaurantId()`

### Welche Requests den ersten vollstaendigen Zustand wahrscheinlich verzoegern

- Der Bootstrap selbst, weil er heute auch nicht sichtbare Surfaces mitlaedt.
- Die zweite Slug-/Doc-Aufloesung im Client nach einem bereits gelaufenen Bootstrap.
- Der spaete Posts-Read, wenn `earlyPostsPromise` mangels kanonischer ID nicht sofort starten kann.
- Der Menu-Pfad mit:
  `public/menu` plus `public/offers` plus `public/meta` zweimal plus Retry-/Backoff.

## C. Die 3 wahrscheinlichsten Ursachen

1. Fehlender kanonischer Restaurant-ID-Handoff im Cold-Start-Pfad.
   Der Server loest den Slug schon auf, der Client gibt diese kanonische ID aber nicht sauber bis in alle Ensure-Pfade weiter und loest deshalb denselben Zielkontext erneut auf.

2. Doppelarbeit zwischen Direct-Route-Bootstrap und Client-Live-Load.
   Der Hard Refresh startet zuerst einen schweren Bootstrap-Request und danach trotzdem noch die Live-Reads fuer denselben sichtbaren Surface.

3. Asymmetrischer Surface-Aufbau.
   Der Header darf frueh `ready` werden, waehrend Posts/Menu/Focus an spaeteren Multi-Read-Pfaden haengen.
   Auf Menu-Routen ist das besonders sichtbar, weil Menu und Focus getrennt geladen werden.

## D. Heute hauptverantwortliche Dateien / Bereiche

### Open-Flow

- `apps/menyra-social/core/profile/profile-open-flow-utils.js`

### Direct-Entry

- `apps/menyra-social/core/auth/initial-route-state.js`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/router/deeplink-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`

### Bootstrap

- `apps/menyra-social/index.html`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `functions/index.js`

### Ensure-Pfade

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`

### Listener / Realtime

- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`

### Public-Profile- / Surface-Controller

- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`

### Andere relevante Stellen

- `apps/menyra-social/core/menu/menu-public-runtime-controller.js`
- `apps/menyra-social/core/menu/focus-runtime-controller.js`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js`

## E. Was davon normal ist und was nicht

### Normal beim Cold Start

- Ein direkter Bootstrap-HTTP-Request fuer die Public-Route.
- Ein frueher, teilweise seeded Header.
- Ein spaeterer sichtbarer Surface-Load fuer Posts oder Menu/Focus.
- Ein Profil-Listener nach dem Oeffnen des sichtbaren Public-Profils.

### Wahrscheinlich noch falsch oder unnoetig

- Server und Client loesen denselben Slug beide separat zur echten `restaurantId` auf.
- Der Bootstrap laedt heute schon Daten fuer nicht sichtbare Surfaces.
- `ensurePostsDataForProfile()` kann denselben Zielkontext ueber mehrere Kandidaten erneut abfragen.
- Auf Menu-Routen wird `public/meta` doppelt gelesen.
- Direkte Public-Refreshes sind aktuell kein schlanker Route-first Pfad, sondern ein gemischter Bootstrap-plus-Live-Load-Pfad.

### Was aktuell eher nicht mehr der Hauptfehler ist

- Der grosse Ensure-/Fetch-Reentry-Sturm aus dem frueheren Problemstand.
- Dieser wurde in Schritt 7 bereits sichtbar reduziert.
- Das Restproblem ist heute eher Heavy-First-Pass als Endlosschleife.

## F. Der kleinste sichere naechste Fix

### Empfohlener Minischritt

Nur die bereits bekannte kanonische `restaurantId` aus dem Bootstrap-/Open-Flow sauber an die Public-Ensure-Pfade durchreichen und dort als autoritative First-Choice verwenden.

### Warum genau dieser Schritt der sicherste ist

- Er aendert keinen sichtbaren Surface.
- Er aendert keinen Route-Vertrag.
- Er aendert keine Firebase-Rules, keine Functions und keine Public-/App-Grenze.
- Er reduziert den wahrscheinlich groessten doppelten Client-Pfad:
  erneute Slug-Aufloesung vor Posts/Menu/Focus.
- Er hat kleinen Blast Radius:
  nur Open-Flow, Direct-Entry-Handoff und Ensure-Kern.

### Was dabei ausdruecklich noch nicht angefasst werden soll

- Kein Umbau des Bootstrap-Endpunkts.
- Keine neue Bootstrap-Unterdrueckung.
- Kein Entfernen oder Redesign von `socialBootstrapFeed`.
- Keine Aenderung der Public-Route-Payload-Struktur.
- Kein Refactor der Listener-Strategie.
- Keine Menu-/Focus-Contract-Aenderung.
- Keine Performance-Arbeit ausserhalb dieses ID-Handoff-Minikerns.

## G. Dokumentation dieses Schritts

- Dieses Analysedokument ist neu: `docs/mnyra-step8-public-cold-start-request-analysis.md`
- `docs/mnyra-current-phase.md` wurde auf den Analyse-Stand aktualisiert.

## Geaenderte Dateien

- `docs/mnyra-current-phase.md`
- `docs/mnyra-step8-public-cold-start-request-analysis.md`

## Bewusst nicht geaendert

- Kein Produktcode.
- Kein Routing.
- Keine Firebase-/Functions-/Rules-Datei.
- Keine UI-/Design-Datei.
- Keine Test- oder E2E-Infrastruktur.

## Manuelle Testliste

1. Doku auf Konsistenz pruefen:
   `docs/mnyra-current-phase.md` und dieses Schritt-8-Dokument.
2. Keine Produktfunktion manuell zu testen, weil in diesem Schritt kein Code geaendert wurde.

## Bewertung

`analysiert, noch nicht umgesetzt`
