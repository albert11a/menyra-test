Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 6: Public-Profile Delayed Content Analyse

## Scope dieses Dokuments

- Kein Produktumbau.
- Keine UI-/Design-Aenderung.
- Keine Routing-/Firebase-/Functions-/Rules-Aenderung.
- Nur stabiler Ist-Stand plus technische Analyse fuer `/:slug`, `/:slug/posts`, `/:slug/menu`.

## A. Stabiler Ist-Stand jetzt

- Aktueller stabiler Stand auf `finale-mnyra`: `80dbbb7` (HEAD zum Analysezeitpunkt).
- Der stabile Stand ist der Ruecksetzungszustand vor dem problematischen Cold-Load-Bereich, technisch auf Basis von Schritt 4 (`036be99`) plus Ruecknahmen.
- Zurueckgenommene problematische Commits:
  - `37af8ae` (cold-load bootstrap suppression) zurueckgenommen durch `bb29d7f` (Code-Rollback) und `2f4f695` (Doku-Rollback).
  - `97ea709` zurueckgenommen durch `8b1459a`.
  - `2923be8` zurueckgenommen durch `80dbbb7`.
- Ergebnis im aktuellen Ruecksetzungsstand: der Request-/Listener-Sturm ist verschwunden.
- Weiter offen: Posts/Menu sind bei Refresh/Cold-Start oft spaeter sichtbar als der Header.
- Entscheidung: Der fruehere Cold-Load-Ansatz mit Unterdrueckung von Public-Web-Direct-Bootstrap-Fetches wird in dieser Form nicht weiterverwendet.

## B. Oeffentlicher Profil-Ladepfad heute

### Route-Einstieg (gemeinsam)

1. `index.html` erkennt Route und Startup-Surface (`parseSiteRoutePathCore`, Bootstrap-URL-Build mit `r/top/src/table`).
2. `core/auth/initial-route-state.js` erzeugt Pending-Route-State (`pendingProfileRestaurantId`, `pendingProfileTopTab`, `pendingProfileAccessSource`).
3. `social-app.js -> applyPendingInitialRouteState()` seeded den ersten Web-Direct-Eintrag ueber `public-profile-direct-entry-controller`.
4. Danach oeffnet der Deep-Link/Open-Flow den Zielzustand ueber `openProfileViewFromBusiness`.

### `/:slug`

- Wird als Business-Route aufgeloest mit `topTab=profile`, `contentTab=posts`.
- Header/Kern-Identitaet wird frueh aus Route-Seed/Preview gesetzt (Route-Payload, Bootstrap-Preview, vorhandene Profile-Infos).
- Posts werden danach ueber Ensure-Kette nachgeladen:
  `profile-menu-focus-render-controller -> ensurePostsDataForProfile -> profile-business-menu-runtime-cluster -> loadBusinessPostsForRestaurant`.

### `/:slug/posts`

- Technisch derselbe Surface wie `/:slug` (`profile/posts`), nur mit expliziter Pfadform.
- Beim posts-first Web-Direct-Pfad wird ein frueher Posts-Load versucht (`earlyPostsPromise`), aber nur wenn die Ziel-ID schon direkt verwendbar ist.
- Falls nicht, folgt spaeter der regulaere Ensure-Load.

### `/:slug/menu`

- Wird als `topTab=menu`, `contentTab=menu` geoeffnet.
- Menu/Fokus werden ueber Ensure-Kette nachgeladen:
  `renderProfileMenuView -> ensureMenuDataForProfile/ensureFocusDataForProfile -> loadMenuForRestaurant/loadFocusForRestaurant`.
- Posts sind hier nicht die erste sichtbare Surface und werden im Open-Flow bewusst nachrangig behandelt.

### Was zuerst sichtbar wird

- Der Header wird zuerst sichtbar, weil `resolveHeaderStatus` bereits bei Identity-Seed als `ready` bewertet.
- Posts/Menu/Fokus haben eigene Truth-/Status-Pfade und koennen gleichzeitig noch `loading/unknown` sein.

### Datenquellen heute

- Header/Kern-Identitaet: Route-Payload (`__publicRouteBootstrap`), Bootstrap-Restaurant-Preview, Profil-Dokument/Fallback.
- Posts: Firestore `restaurants/{id}/socialPosts` (`loadBusinessPostsForRestaurant`).
- Menu: Firestore `restaurants/{id}/public/menu` plus `public/meta` (`loadMenuForRestaurant`).
- Fokus: Firestore `restaurants/{id}/public/offers` plus `public/meta` (`loadFocusForRestaurant`).

## C. Warum Posts und Menu verspaetet erscheinen

### Wahrscheinlichster technischer Mechanismus

- Asymmetrische Erstwahrheit:
  Header bekommt frueh Identity-Seed aus Route/Preview, waehrend Posts/Menu oft mit `unknown/loading` starten.
  Dadurch ist die Seite teilweise sichtbar, aber nicht vollstaendig geladen.

### Zustaendige Bereiche

- Route/Seed/Startup:
  - `apps/menyra-social/index.html`
  - `apps/menyra-social/social-app.js`
  - `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
  - `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- Open/Ensure:
  - `apps/menyra-social/core/profile/profile-open-flow-utils.js`
  - `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
  - `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- Daten-Layer:
  - `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
  - `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
  - `apps/menyra-social/core/menu/menu-public-runtime-controller.js`

### Welche Schichten warten/konkurrieren

- Open-Flow loest zuerst sichtbaren Surface und Header.
- Danach starten Ensure-Loader fuer Posts/Menu/Fokus.
- In diesen Ensure-Loadern passiert teilweise zusaetzliche ID-Aufloesung, bevor der eigentliche Content-Query laeuft.
- Menu-Loader nutzt Retry/Backoff und Meta+Items-Kombination; das verlaengert den First-Complete-Zustand bei kaltem Start.

### Was den ersten vollstaendigen Public-Zustand konkret verzoegert

- Doppelte oder serielle Restaurant-ID-Aufloesung vor Content-Reads.
- Menu-first Fresh-Path blockiert in bestimmten Faellen stale Cache-Reuse, um falsche Seeds zu vermeiden.
- Bei `/:slug/menu` wird Posts-Aufloesung bewusst nachrangig behandelt.

## D. Die 3 wahrscheinlichsten Hauptursachen (priorisiert)

1. Asymmetrischer Route-Seed: Identity frueh `ready`, Posts/Menu oft `unknown/loading`.
2. Zusaetzliche Resolver-Schritte vor den eigentlichen Posts/Menu-Queries (canonical ID-Aufloesung mehrfach in Open/Ensure).
3. Menu-first Schutzlogik (stale-cache block + Retry/Backoff + defer Posts) verlaengert den First-Complete-Zeitpunkt.

## E. Kleinster sicherer naechster Schritt (noch kein Code)

- Kleinster sicherer Schritt:
  Einmalig aufgeloeste canonical `restaurantId` aus dem Open-Flow verbindlich an die Ensure-Pfade weiterreichen und dort als First-Choice verwenden, statt erneut Profilauflosung zu triggern.

- Warum das der sicherste Schritt ist:
  - kleiner Blast Radius (nur interner Public-Profile-Ladepfad),
  - keine UI-/Design-/Routing-Aenderung,
  - kein Eingriff in Firebase-Rules/Functions,
  - reduziert direkte Wartezeit vor dem ersten echten Posts/Menu-Read.

- Was dabei ausdruecklich nicht angefasst werden soll:
  - keine erneute Bootstrap-Unterdrueckung auf Public-Web-Direct,
  - keine Route-Vertragsaenderung,
  - keine Listener-Strategie-Umbauten,
  - keine neuen Performance-Refactors ausserhalb dieses ID-Handoff-Minikerns.
