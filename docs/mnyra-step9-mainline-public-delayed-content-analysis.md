Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 9: Mainline Public Delayed Content Analyse

## Scope dieses Dokuments

- Kein Produktumbau.
- Keine UI-/Design-Aenderung.
- Keine Routing-, Firebase-, Functions- oder Rules-Aenderung.
- Keine Smoke-Tests, kein Playwright.
- Nur frische Mainline-Analyse fuer `/:slug`, `/:slug/posts`, `/:slug/menu`.

## Verbindliche Grundlage

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step2-route-data-matrix.md`

## Analysierte Hauptdateien

- `apps/menyra-social/index.html`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/auth/initial-route-state.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js`
- `apps/menyra-social/core/menu/focus-runtime-controller.js`
- `functions/index.js`

## A. Aktueller oeffentlicher Ladepfad heute

### Gemeinsamer Start fuer `/:slug`, `/:slug/posts`, `/:slug/menu`

1. `apps/menyra-social/index.html` erkennt den direkten oeffentlichen Business-Pfad und startet sofort einen `GET` auf `socialBootstrapFeed` mit `cache: "no-store"`.
2. Derselbe Einstieg uebergibt Route-Kontext wie `r`, `top`, `src`, `table`, `pathname` an den Bootstrap-Endpunkt.
3. `apps/menyra-social/core/auth/initial-route-state.js` parst den Pfad und baut daraus einen Pending-Profile-State:
   `pendingProfileRestaurantId`, `pendingProfileTopTab`, `pendingProfileAccessSource`, `pendingProfileTableNumber`.
4. `apps/menyra-social/social-app.js` ruft `applyPendingInitialRouteState()` auf.
   Dort seedet `public-profile-direct-entry-controller.js` bereits einen ersten sichtbaren Public-Profile-State.
5. Danach oeffnet `apps/menyra-social/core/profile/profile-open-flow-utils.js` das Zielprofil ueber `openProfileViewFromBusiness(...)`.
6. Erst im sichtbaren Surface greifen die spaeteren Ensures:
   `ensurePostsDataForProfile()`, `ensureMenuDataForProfile()`, `ensureFocusDataForProfile()`.

### `/:slug`

- Wird als `topTab=profile`, `contentTab=posts` behandelt.
- Der erste sichtbare Zustand ist fast immer schon ein seeded Profilkopf.
- Posts werden anschliessend ueber Open-Flow und spaetere Ensure-Pfade live aufgeloest.
- Menu und Fokus koennen serverseitig schon im Bootstrap mitkommen, sind auf dieser Route aber nicht der erste sichtbare Surface.

### `/:slug/posts`

- Technisch derselbe erste Surface wie `/:slug`.
- Wenn die kanonische `restaurantId` frueh bekannt ist, startet `earlyPostsPromise` frueh.
- Wenn nur der Slug vorliegt, kommt erst spaeter die Profil-/Doc-Aufloesung und danach der echte Posts-Read.

### `/:slug/menu`

- Wird als `topTab=menu`, `contentTab=menu` geoeffnet.
- Der Header wird auch hier frueh seeded.
- Menu und Fokus werden nur dann sofort sichtbar, wenn Route-Bootstrap bereits autoritative Menu-/Focus-Truth mitgebracht hat.
- Sonst setzt der Open-Flow `menu` und `focus` auf `loading/unknown` und triggert spaeter `ensureMenuDataForProfile()` und `ensureFocusDataForProfile()`.
- Posts werden auf diesem Pfad bewusst nachrangig behandelt.

## B. Warum Header frueher sichtbar ist

### Quelle und Pfad des fruehen Headers

Der Header kommt frueh aus zwei sehr fruehen Seed-Schichten:

1. `public-profile-direct-entry-controller.js -> seedPendingDirectEntry(...)`
2. `profile-open-flow-utils.js -> showPublicProfileView(...)` mit einem `loadingProfile`

Wichtig ist dabei:

- `seedPendingDirectEntry(...)` baut einen `seedBusinessName` aus:
  `routeIdentity -> preview -> normalizeSeedBusinessLabel(entry.restaurantId)`.
- Dadurch existiert fast immer sehr frueh schon ein Name/Fallback-Label, selbst wenn nur der Slug bekannt ist.
- Gleichzeitig wird `identityTruthState` dort oft bereits auf `ready` gesetzt.

### Warum dieser Teil schneller settled

`public-profile-surface-controller.js -> resolveHeaderStatus(...)` ist absichtlich locker:

- Sobald irgendein brauchbarer Header-Seed existiert, kann der Header `ready` werden.
- `resolveHeaderStatus(...)` gibt sogar bei `identity/loading` oder `truth/loading` schon `ready` zurueck, wenn Name/Avatar/Handle/Follower-Seed vorhanden ist.
- Anders gesagt:
  der Header wartet nicht auf kanonische `restaurantId`,
  nicht auf fertige Posts,
  nicht auf fertiges Menu,
  nicht auf fertigen Fokus.

Der Header settled also frueh, weil er auf Route-/Preview-/Fallback-Identitaet basiert, nicht auf vollstaendige Surface-Truth.

## C. Warum Beitraege und Menue spaeter nachziehen

### Posts

Hauptpfad:

- `profile-open-flow-utils.js`
- `profile-menu-focus-render-controller.js`
- `profile-business-menu-runtime-cluster.js`
- `public-profile-runtime-controller.js`

Konkreter Ablauf:

1. Der Header wird gezeigt, waehrend Posts oft noch `loading` sind.
2. `earlyPostsPromise` startet nur dann sofort, wenn schon frueh eine echte `restaurantId` verfuegbar ist.
3. Wenn das noch nicht der Fall ist, wartet der Pfad erst auf `fetchBusinessProfile(...)`.
4. Danach koennen die Render-Ensures `ensurePostsDataForProfile(profile)` feuern.
5. `ensurePostsDataForProfile()` macht dann noch einmal eigene Aufloesung:
   - `requestedRestaurantId`
   - `canonicalRestaurantId`
   - `publicSlug`
   - `landingSlug`
   - `handle`
6. Fuer diese Kandidaten wird `loadBusinessPostsForRestaurant(candidateId)` probiert.
7. `loadBusinessPostsForRestaurant(...)` kann wiederum selbst erneut `fetchBusinessProfileDoc(...)` ausloesen, solange nicht explizit `skipProfileResolve: true` gesetzt ist.

Ergebnis:
Posts haengen im Cold Start oft an spaeteren Resolvern und teils an mehrfacher ID-/Doc-Aufloesung, waehrend der Header laengst sichtbar ist.

### Menu und Fokus

Hauptpfad:

- `profile-open-flow-utils.js`
- `profile-business-menu-runtime-cluster.js`
- `session-data-runtime-controller.js`
- `menu-public-runtime-controller.js`
- `focus-runtime-controller.js`

Konkreter Ablauf:

1. Auf `/:slug/menu` wird zwar frueh der Header gezeigt, aber `menu` und `focus` sind oft noch `unknown/loading`.
2. Danach laufen `ensureMenuDataForProfile()` und `ensureFocusDataForProfile()`.
3. Beide gehen zuerst durch `resolveProfileRestaurantId()`.
4. `resolveProfileRestaurantId()` ruft `resolveCanonicalRestaurantId()` auf.
5. `resolveCanonicalRestaurantId()` nutzt dafuer wieder `fetchBusinessProfileDoc(...)`.
6. Erst danach starten die eigentlichen Content-Reads:
   - `loadMenuForRestaurant(...)`
   - `loadFocusForRestaurant(...)`
7. `loadMenuForRestaurant(...)` ist auf dem sichtbaren Web-Direct-Menu-Pfad bewusst vorsichtig:
   stale Cache wird in bestimmten Faellen blockiert, frische Truth wird priorisiert, dazu kommen Retry-/Backoff-Pfade.
8. `loadFocusForRestaurant(...)` laedt parallel Focus-Items und Focus-Meta.
9. Zusaetzlich lesen `loadMenuMeta(...)` und `loadFocusMeta(...)` beide `restaurants/{id}/public/meta`.

Ergebnis:
Menu zieht spaeter nach, weil dort nicht nur ein Read, sondern erst Resolver plus Menu-/Meta-/Focus-Schicht settle muessen.

## D. Was davon normal ist und was eher falsch / unnoetig wirkt

### Normal

- Ein `socialBootstrapFeed`-Request pro Hard Refresh auf direkter Public-Route.
- Ein frueh seeded Header vor dem vollstaendigen Surface.
- Ein spaeterer Live-Read fuer den sichtbaren Content-Surface.
- Ein Profil-Listener auf `restaurants/{id}` nach dem Oeffnen des sichtbaren Public-Profils.
- Dass `/:slug/menu` schwerer ist als `/:slug`, weil dort Menu und Fokus getrennt geladen werden.

### Verdaechtig / unnoetig / verzoegernd

- Der Server loest im Bootstrap den Slug bereits zur echten `restaurantId` auf, der Client loest denselben Zielkontext danach oft erneut auf.
- `profile-business-menu-runtime-cluster.js` hat bereits einen `canonicalRestaurantId`-Handoff-Slot, der aktuelle Public-Pfad nutzt ihn aber nicht konsistent.
- `ensurePostsDataForProfile()` probiert mehrere Kandidaten nacheinander und kann dadurch denselben Zielkontext mehrfach anstoessen.
- `loadBusinessPostsForRestaurant(...)` kann innerhalb dieser Kandidaten erneut `fetchBusinessProfileDoc(...)` ausloesen.
- Der Direct-Route-Bootstrap laedt heute auch nicht sichtbare Surfaces:
  auf Profile-Routen trotzdem Menu und Fokus,
  auf Menu-Routen trotzdem Posts.
- Menu und Fokus lesen dieselbe `public/meta`-Quelle separat.
- Der sichtbare Web-Direct-Menu-Pfad blockiert in bestimmten Faellen stale Menu-Cache-Reuse und bevorzugt frische Truth.
  Das ist sicherheitsorientiert und nicht per se falsch, aber fuer Hard Refresh spuerbar verzoegernd.

## E. Die 3 wahrscheinlichsten Hauptursachen

1. Fehlender sauberer Handoff der kanonischen `restaurantId` in die Public-Ensure-Pfade.
   Die ID ist serverseitig oder spaeter im Open-Flow oft schon bekannt, wird aber nicht stabil als `canonicalRestaurantId` bis in Posts/Menu/Fokus durchgereicht.
   Dadurch laufen erneute Resolver-Schritte.

2. Doppelarbeit zwischen Direct-Route-Bootstrap und Client-Live-Pfaden.
   Der Hard Refresh laedt zuerst einen schweren Bootstrap und danach haeufig trotzdem noch dieselben Ziel-Daten live nach.
   Zusaetzlich laedt der Bootstrap bereits Surfaces, die auf der gerade sichtbaren Route noch gar nicht gebraucht werden.

3. Asymmetrische Surface-Readiness plus schwererer Menu-Pfad.
   Der Header darf sehr frueh `ready` werden, waehrend Posts/Menu strengere Truth brauchen.
   Auf `/:slug/menu` kommen dazu noch `public/menu`, `public/offers` und doppelte `public/meta`-Reads plus Retry-/Cache-Schutzpfade.

## F. Kleinster sicherer naechster Fix

### Empfohlene eine kleine Massnahme

Die bereits bekannte kanonische `restaurantId` aus Direct-Route-Bootstrap und Open-Flow als `canonicalRestaurantId` sauber in den Public-Profile-State durchreichen und die Ensure-Pfade darauf zuerst festziehen.

Konkreter gemeinter Minikern:

- Direct Entry / Open Flow geben die kanonische ID explizit weiter.
- `ensurePostsDataForProfile()`, `ensureMenuDataForProfile()` und `ensureFocusDataForProfile()` benutzen diese ID als autoritative First-Choice.
- `loadBusinessPostsForRestaurant(...)` muss auf diesem Pfad nicht erst erneut ueber Slug/Doc aufloesen.

### Warum genau dieser Schritt der sicherste ist

- Sehr kleiner Blast Radius.
- Keine UI-/Design-Aenderung.
- Kein Routing-Umbau.
- Keine Firebase-/Functions-/Rules-Aenderung.
- Kein Aendern des sichtbaren Vertrags.
- Der Slot fuer `profile.canonicalRestaurantId` existiert bereits im Runtime-Cluster, der Schritt baut also auf vorhandener Struktur auf.

### Was dabei ausdruecklich noch nicht angefasst werden soll

- Kein Umbau des Bootstrap-Endpunkts.
- Kein Entfernen des Direct-Route-Bootstraps.
- Kein Refactor der Listener-Strategie.
- Kein Aendern der Menu-/Focus-Contracts.
- Kein Entfernen von Menu-/Focus-Reads aus dem Bootstrap in diesem Schritt.
- Keine Cache-Strategie-Aenderung ausserhalb dieses ID-Handoff-Minikerns.

## G. Dokumentation dieses Schritts

- Neues Dokument:
  `docs/mnyra-step9-mainline-public-delayed-content-analysis.md`
- Aktualisiert:
  `docs/mnyra-current-phase.md`

## Geaenderte Dateien

- `docs/mnyra-current-phase.md`
- `docs/mnyra-step9-mainline-public-delayed-content-analysis.md`

## Bewusst nicht geaendert

- Kein Produktcode.
- Kein Routing.
- Keine Firebase-/Functions-/Rules-Datei.
- Keine UI-/Design-Datei.
- Keine Test- oder E2E-Infrastruktur.

## Manuelle Testliste

1. `docs/mnyra-current-phase.md` auf Konsistenz mit Schritt 9 pruefen.
2. `docs/mnyra-step9-mainline-public-delayed-content-analysis.md` auf Konsistenz mit dem beschriebenen Mainline-Ladepfad pruefen.
3. Keine Produktfunktion manuell zu testen, weil in diesem Schritt kein Code geaendert wurde.

## Bewertung

`analysiert, noch nicht umgesetzt`
