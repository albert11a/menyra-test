Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 13: Public Profile Simplification Analyse

## Scope dieses Dokuments

- Kein Produktumbau.
- Keine UI-/Design-Aenderung.
- Keine QR-Logik-, QR-URL- oder Tisch-/Bestellkontext-Aenderung.
- Keine Aenderung an `/login`.
- Keine Firebase-/Functions-/Rules-Aenderung.
- Keine Smoke-Tests, kein Playwright.
- Nur Analyse fuer den oeffentlichen Web-Profilpfad:
  `/:slug`, `/:slug/posts`, `/:slug/menu`.

## Verbindliche Grundlage

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step11-public-profile-core-architecture.md`
- `docs/mnyra-step12-public-profile-core-implementation.md`

## Analysierte Hauptbereiche

- `apps/menyra-social/index.html`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/auth/initial-route-state.js`
- `apps/menyra-social/core/router/public-business-route-utils.js`
- `apps/menyra-social/core/router/deeplink-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js`
- `apps/menyra-social/core/menu/focus-runtime-controller.js`
- `functions/index.js`

## A. Kurzbefund nach Schritt 12

Schritt 12 hat den groessten alten Kernfehler verbessert:
`canonicalRestaurantId` wird jetzt deutlich frueher und konsistenter durch Direct-Entry,
Open-Flow, Public-State und Ensure-Pfade getragen.

Der oeffentliche Web-Profilpfad ist dadurch ruhiger geworden, aber noch nicht leicht.
Das Restproblem ist jetzt weniger ein endloser Request-Sturm, sondern ein zu schwerer
und mehrstufiger First-Pass.

Die verbleibende Schwere entsteht vor allem durch:

1. Direct-Route-Bootstrap laedt weiterhin mehrere Surfaces gleichzeitig.
2. Menu und Fokus sind im sichtbaren `/:slug/menu`-Pfad getrennte Loader und getrennte Truth-States.
3. Es gibt weiterhin Reentry zwischen Slug-/Lookup-Zustand, kanonischer ID, Route-Payload und Render-Ensures.

## B. Welche Requests / Loader / Ensures noch unnoetig oder blockierend sind

### 1. Direct-Route-Bootstrap ist noch zu breit

`functions/index.js -> buildPublicRouteBootstrapPayload(...)` laedt fuer direkte Public-Routen weiterhin in einem Request:

- Restaurant-/Identity-Preview
- Posts-Seed
- Menu-Seed
- Menu-Meta
- Focus-Seed

Auf `/:slug` und `/:slug/posts` sind Menu und Fokus nicht Teil des ersten sichtbaren Hauptzustands.
Auf `/:slug/menu` sind Posts nicht Teil des ersten sichtbaren Hauptzustands.

Damit ist der Bootstrap weiterhin ein schwerer Sammel-Request statt ein schlanker Main-Surface-Bootstrap.
Er ist nicht falsch, aber fuer den ersten stabilen Web-Zustand noch zu breit.

### 2. Server-seitige Meta-Arbeit ist doppelt nah beieinander

Auf Menu-Routen liest der Bootstrap Menu-Meta und Focus-Seed getrennt.
Beide greifen auf `restaurants/{id}/public/meta` zu:

- `queryPublicMenuMetaForRestaurant(...)` fuer Menu-Badge
- `queryPublicFocusSeedForRestaurant(...)` fuer `offersEnabled`

Client-seitig passiert spaeter dasselbe Muster noch einmal:

- `loadMenuMeta(...)` liest `restaurants/{id}/public/meta`
- `loadFocusMeta(...)` liest ebenfalls `restaurants/{id}/public/meta`

Das ist fuer einen robusten ersten Zustand nicht ideal, weil Menu und Fokus denselben Meta-Doc getrennt behandeln.

### 3. Menu und Fokus haben getrennte Ensures

Im sichtbaren `/:slug/menu`-Pfad werden Menu und Fokus separat nachgeladen:

- `ensureMenuDataForProfile(...)`
- `ensureFocusDataForProfile(...)`

Beide laufen ueber `resolveProfileRestaurantId(...)` und koennen je nach Startzustand erst den Zielkontext klaeren.
Die beiden Loader sind fachlich verwandt, aber technisch eigenstaendig.
Das macht den sichtbaren Zustand mehrstufig: Fokus kann schon verschwinden oder fertig sein, waehrend Menu noch laedt.

### 4. Menu-Load ist bewusst streng und dadurch blockierend

`session-data-runtime-controller.js -> loadMenuForRestaurant(...)` priorisiert auf dem sichtbaren Web-Direct-Menu-Pfad frische Wahrheit.
Das ist sicherheitsorientiert, aber schwer:

- Stale Cache wird im sichtbaren Web-Direct-Menu-Pfad teilweise blockiert.
- Public Menu Items werden mit Retry-/Backoff geladen.
- Menu-Meta wird parallel mit eigenem Retry-/Backoff geladen.
- Danach wird erst `state.menu.truthState` auf `seeded` oder `knownEmpty` gesetzt.

Fuer `/:slug/menu` ist dieser Loader der wichtigste sichtbare Blocker.

### 5. Posts sind auf Menu-Routen noch nicht vollstaendig aus dem First-Pass heraus

Der Open-Flow verschiebt Posts auf Web-Direct-Menu-Pfaden inzwischen weitgehend nach hinten.
Der Bootstrap liefert fuer Menu-Routen aber weiterhin Posts-Seed und `feedPosts` mit.
Das ist kein Hauptfehler fuer die doppelte Menu-Ladefolge, aber es bleibt unnoetige Arbeit im ersten Request.

### 6. Route-Kontext wird weiterhin an mehreren Stellen interpretiert

Die oeffentliche Route wird weiterhin in mehreren Schichten gelesen oder nachgebaut:

- `public-business-route-utils.js`
- `initial-route-state.js`
- `index.html`
- `functions/index.js`
- `public-bootstrap-runtime-controller.js`
- `deeplink-flow-utils.js`

Der Vertrag ist inzwischen klarer, aber die praktische Verantwortung ist noch verteilt.
Das erhoeht die Gefahr, dass Slug, kanonische ID, Surface und Route-Payload kurzzeitig auseinanderlaufen.

## C. Was fuer den ersten stabilen Zustand wirklich noetig ist

### `/:slug`

Fuer den ersten stabilen Zustand noetig:

- Route als Public-Business-Profil erkennen.
- Slug zur kanonischen `restaurantId` bringen.
- Header/Identity seedbar anzeigen.
- Posts fuer dieselbe kanonische `restaurantId` laden oder sicher als leer bewerten.

Nicht noetig fuer den ersten stabilen Zustand:

- Menu-Seed.
- Focus-Seed.
- Menu-Meta.
- Focus-Meta.

### `/:slug/posts`

Noetig:

- Dasselbe wie `/:slug`, explizit Posts-first.
- Ein ruhiger Posts-Read fuer die kanonische `restaurantId`.

Nicht noetig fuer den ersten stabilen Zustand:

- Menu/Fokus im Bootstrap.
- Menu-/Focus-Ensures.

### `/:slug/menu`

Noetig:

- Route als Public-Business-Menu erkennen.
- Slug zur kanonischen `restaurantId` bringen.
- Header/Identity seedbar anzeigen.
- Menu-Produkte fuer dieselbe kanonische `restaurantId` laden oder sicher als leer bewerten.
- Menu-Meta nur soweit, wie sie fuer sichtbare Menu-Truth gebraucht wird.

Optional fuer den ersten stabilen Menu-Zustand:

- Fokus-Items.
- Focus-Meta.

Fokus ist sichtbar oberhalb des Menus, aber fuer die erste stabile Produktliste nicht zwingend blockierend.
Aktuell wird Fokus trotzdem als eigener oberer Ladezustand gezeigt und kann dadurch den Menu-Pfad schwerer wirken lassen.

## D. Konkrete Beobachtung: Fokus zuerst, Menu zweimal Loading

Beobachtung aus manuellem Test:

1. Hard Refresh auf `/:slug/menu`.
2. Zuerst erscheint `Fokus wird geladen...`.
3. Darunter erscheint `Menu wird geladen...`.
4. Diese Ladeanzeige verschwindet wieder.
5. Danach erscheint erneut `Menu wird geladen...`.
6. Erst danach erscheinen die Produkte.

### Warum Fokus vor Menu erscheint

Das ist durch die Render-Reihenfolge erklaerbar.

`profile-menu-focus-render-controller.js -> renderProfileMenuView(...)` rendert im normalen Menu-Profil zuerst:

1. `renderFocusCarousel(profile)`
2. danach den Menu-Block

`renderFocusCarousel(...)` behandelt einen nicht passenden oder noch nicht geladenen Focus-State als Loading:

- Wenn `state.focus.restaurantId` noch nicht zum Profil passt, wird `ensureFocusDataForProfile(profile)` ausgeloest.
- `getFocusStateForRestaurant(...)` bewertet `!same` als `loading`.
- Ohne Items wird deshalb `Fokus wird geladen...` gerendert.

Deshalb steht Fokus visuell vor Menu, obwohl der Nutzer fachlich die Menu-Seite geoeffnet hat.
Das ist keine QR-Ursache.

### Warum Menu danach erneut in Loading fallen kann

Die wahrscheinlichste Ursache ist ein Reentry zwischen drei Zustandsquellen:

1. Direct-Entry-Seed mit Slug oder noch ungeklaerter Route-Truth.
2. Bootstrap/Open-Flow/Profil-Read mit kanonischer `restaurantId`.
3. Render-Ensure fuer Menu/Fokus, das nach aktuellem Profilzustand erneut entscheidet.

Im ersten sichtbaren Render kann `renderProfileMenuView(...)` schon Loading anzeigen, weil noch keine `hasPublicMenuTruth` fuer `state.menu` existiert.
Parallel oder kurz danach startet `ensureMenuDataForProfile(...)`.

Wenn der Profilzustand dann von Route-Slug/Lookup auf kanonische `restaurantId` einschwenkt, kann derselbe sichtbare Menu-Pfad technisch wie ein neuer Zielkontext aussehen.
Der Ensure-Guard im Runtime-Cluster dedupliziert nach `requestedRestaurantId`.
Wenn zuerst der Slug und danach die kanonische ID als Requested-ID auftauchen, sind das aus Sicht des Guards zwei unterschiedliche Keys.

`loadMenuForRestaurant(...)` hat zwar ein eigenes In-Flight-Dedupe nach Menu-Cache-Key, aber der sichtbare State kann trotzdem erneut auf `loading: true` gesetzt werden, wenn ein neuer Load-Zweig oder eine erneute frische Truth-Anforderung startet.
Dadurch kann die Anzeige nach einem Zwischenzustand erneut `Menu wird geladen...` zeigen.

### Welche Loader-/Ensure-/Surface-Zustaende daran beteiligt sind

Beteiligt sind vor allem:

- `public-profile-direct-entry-controller.js -> seedPendingDirectEntry(...)`
  - setzt Menu/Fokus bei unbekannter Route-Truth auf `unknown` und teilweise `loading`.

- `profile-open-flow-utils.js -> openProfileViewFromBusiness(...)`
  - oeffnet erst einen Loading-/Interim-Profilzustand,
  - startet auf Menu-TopTab die Menu-/Focus-Ensures,
  - liest parallel das Profil und schwenkt spaeter auf die kanonische ID.

- `profile-menu-focus-render-controller.js -> renderProfileMenuView(...)`
  - rendert Fokus vor Menu,
  - triggert Menu-/Focus-Ensures erneut, wenn keine settled Truth da ist,
  - zeigt Menu-Loading, wenn keine Items und keine Public-Menu-Truth vorhanden sind.

- `profile-business-menu-runtime-cluster.js`
  - dedupliziert Menu-/Focus-/Posts-Ensures nach Requested-ID,
  - loest bei Bedarf erst kanonisch auf,
  - kann beim Wechsel von Slug zu kanonischer ID denselben sichtbaren Zielkontext als neuen Ensure-Key sehen.

- `session-data-runtime-controller.js -> loadMenuForRestaurant(...)`
  - setzt `state.menu.loading = true`,
  - blockiert im sichtbaren Web-Direct-Menu-Pfad bestimmte stale Cache-Wege,
  - laedt Menu-Items und Menu-Meta getrennt mit Backoff,
  - setzt erst danach `truthState` auf `seeded` oder `knownEmpty`.

- `focus-runtime-controller.js -> getFocusStateForRestaurant(...)`
  - bewertet nicht passenden Focus-Restaurant-State als Loading,
  - dadurch kann Fokus schon vor dem eigentlichen Focus-Load sichtbar als Loading erscheinen.

### Warum die Ladefolge instabil wirkt

Menu und Fokus sind technisch nicht ein gemeinsamer `menuSurface`.
Sie haben getrennte Truth-States, getrennte Loader, getrennte Meta-Reads und getrennte Renderentscheidungen.
Der Header ist bereits stabil, waehrend Fokus und Menu noch jeweils ihre eigene Wahrheit suchen.

Dadurch kann die sichtbare Reihenfolge so aussehen:

1. Route-Seed: Header steht, Fokus unknown/loading, Menu unknown/loading.
2. Render: Fokus-Loading oben, Menu-Loading darunter.
3. Focus-Load settled schneller oder als leer: Fokus-Loading verschwindet.
4. Profil/Route schwenkt auf kanonische ID: Menu-Ensure wird neu bewertet.
5. Menu-Loader setzt erneut Loading fuer frische Public-Truth.
6. Produkte erscheinen nach Public-Menu-Items plus Meta.

## E. Die 3 wahrscheinlichsten Rest-Blocker

1. Menu/Fokus-Surface ist im sichtbaren `/:slug/menu`-Pfad noch zu stark gesplittet.
   Fokus wird oberhalb des Menus gerendert und separat geladen, obwohl Menu-Produkte der kritische Hauptzustand sind.

2. Menu-Ensure und Menu-Loader koennen beim Wechsel von Slug/Lookup auf kanonische `restaurantId` erneut als neuer Zielkontext laufen.
   Das erklaert die beobachtete zweite `Menu wird geladen...`-Phase am plausibelsten.

3. Direct-Route-Bootstrap ist noch nicht Main-Surface-schmal.
   Er laedt weiterhin Posts/Menu/Fokus zusammen und wiederholt Meta-Arbeit, obwohl fuer den ersten stabilen Zustand je Route nur ein Haupt-Surface noetig ist.

## F. Naechster kleiner Vereinfachungs-Schritt

Der naechste kleine Schritt mit dem besten Nutzen waere nicht sofort ein Functions-/Bootstrap-Umbau.
Der sicherere kleine Schritt ist zuerst:

Den sichtbaren Web-Direct-Menu-Pfad auf genau einen kanonischen Menu-Surface-Zielkontext beruhigen.

Konkret gemeint:

- In den Menu-/Focus-Render- und Ensure-Entscheidungen fuer den Public-Web-Pfad konsequent `canonicalRestaurantId || restaurantId` als Surface-Ziel verwenden.
- Dedupe/Guard fuer Menu-Ensure so betrachten, dass Slug und bereits aufgeloeste kanonische ID nicht zwei sichtbare Menu-Loads fuer denselben Pfad erzeugen.
- Fokus weiter als eigener Inhalt behalten, aber nicht als Ursache fuer einen zweiten Menu-Loading-Zyklus wirken lassen.
- QR-Kontext dabei unveraendert lassen: keine QR-URL, keine QR-Quelle, keine Tisch-/Warenkorblogik anfassen.

Warum dieser Schritt vor Bootstrap-Slimming:

- Er adressiert direkt die beobachtete doppelte Ladefolge.
- Er hat kleineren Blast Radius als Functions-/Bootstrap-Aenderungen.
- Er reduziert sichtbare Instabilitaet, ohne UI/Design neu zu bauen.
- Danach kann der Bootstrap sauberer auf Main-Surface verschlankt werden.

## G. Betroffene Dateien / Bereiche fuer diesen naechsten Schritt

Wahrscheinlich betroffen:

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
  - `renderProfileMenuView(...)`
  - `renderFocusCarousel(...)`
  - Auto-Ensure-Entscheidungen fuer Menu/Fokus

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
  - Ensure-Dedupe fuer Menu/Fokus
  - Umgang mit Requested-ID vs kanonischer ID

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
  - sichtbarer Web-Direct-Menu-Match
  - Menu-Loading-/Freshness-Entscheidung

Moeglicherweise betroffen, aber nur falls noetig:

- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
  - frueher Ensure-Start auf Menu-TopTab

Bewusst nicht betroffen:

- QR-URL-Erzeugung
- QR-Parsing
- Tisch-/Bestellkontext
- `/login`
- Firebase Rules
- Functions
- UI/Design

## H. Danach erst sinnvoll

Wenn die sichtbare Menu-Ladefolge stabiler ist, kann der naechste separate Schritt sein:

Direct-Public-Bootstrap auf Main-Surface ausrichten:

- `/:slug` und `/:slug/posts`: Identity + Posts zuerst, kein Menu/Fokus im kritischen Bootstrap.
- `/:slug/menu`: Identity + Menu zuerst, Posts nicht im kritischen Bootstrap.
- Fokus auf Menu optional nachgelagert oder als klarer separater Sibling-Surface.

Dieser Schritt waere groesser, weil er `functions/index.js` und Bootstrap-Payload-Verbrauch betrifft.
Er sollte deshalb nicht mit dem Menu-Ensure-Beruhigungsschritt vermischt werden.

## I. Geaenderte Dateien in diesem Schritt

- `docs/mnyra-current-phase.md`
- `docs/mnyra-step13-public-profile-simplification-analysis.md`

## J. Bewusst nicht geaendert

- Kein Produktcode.
- Keine UI-/Design-Datei.
- Keine QR-Logik.
- Keine QR-URL.
- Kein Tisch-/Bestellkontext.
- Keine Firebase-/Functions-/Rules-Datei.
- Keine Tests, kein Smoke-Test, kein Playwright.

## K. Manuelle Testliste

1. Doku pruefen:
   `docs/mnyra-current-phase.md` und dieses Schritt-13-Dokument.
2. Keine Produktfunktion manuell zu testen, weil in diesem Schritt kein Produktcode geaendert wurde.

## Bewertung

`analysiert, noch nicht umgesetzt`
