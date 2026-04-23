Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 11: Public Profile Core Architecture

## Scope dieses Dokuments

- Kein Produktumbau.
- Keine UI-/Design-Aenderung.
- Keine Routing-, Firebase-, Functions- oder Rules-Aenderung.
- Keine Smoke-Tests, kein Playwright.
- Nur Core-Analyse fuer den gesamten oeffentlichen Profilpfad:
  `/:slug`, `/:slug/posts`, `/:slug/menu`, QR -> Profil mit offenem Menu.

## Verbindliche Grundlage

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step2-route-data-matrix.md`
- `docs/mnyra-step8-public-cold-start-request-analysis.md`
- `docs/mnyra-step9-mainline-public-delayed-content-analysis.md`
- `docs/mnyra-step10-mainline-public-guest-read-path-stability-fix.md`

## Analysierte Hauptdateien

- `apps/menyra-social/core/router/public-business-route-utils.js`
- `apps/menyra-social/core/auth/initial-route-state.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `functions/index.js`

## A. Zielbild

### Gemeinsamer Kern fuer alle vier Einstiege

Der oeffentliche Profilpfad sollte technisch wie eine einzige Public-Profile-Welt funktionieren:

1. URL lesen.
2. Ziel-Surface bestimmen.
3. `slug` genau einmal zur kanonischen `restaurantId` aufloesen.
4. Einen einzigen stabilen Public-Profile-State aufbauen.
5. Nur den sichtbaren Haupt-Surface laden.
6. Erst danach optional Geschwister-Surfaces leicht vorladen.

Wichtig:

- Die URL ist nur Vertrag und Einstieg, nicht die Datenwahrheit.
- Die Datenwahrheit fuer ein Restaurant ist nach der Aufloesung die kanonische `restaurantId`.
- Der Public-Gast-Pfad ist read-only und read-once-orientiert.
- Header, Posts, Menu und Fokus haengen an einem gemeinsamen Zielkontext, nicht an getrennten Resolver-Ketten.

### `/:slug`

`/:slug` ist die kanonische oeffentliche Profil-Startseite.

- Ziel-Surface: Profilkopf plus Posts.
- Der Header darf frueh aus Route-/Bootstrap-Seed erscheinen.
- Danach kommt genau ein ruhiger Posts-Pfad fuer dieselbe kanonische `restaurantId`.
- Menu/Fokus sind auf diesem Pfad nicht Teil des kritischen First Paint.

### `/:slug/posts`

`/:slug/posts` ist die explizite Posts-URL, aber technisch dieselbe Profilwelt.

- Ziel-Surface: derselbe Profilkopf, explizit Posts-first.
- Kein anderer Resolver als bei `/:slug`.
- Nur die Sichtbarkeit ist anders: Posts werden als Haupt-Surface priorisiert.

### `/:slug/menu`

`/:slug/menu` ist die kanonische Menu-URL derselben Profilwelt.

- Ziel-Surface: derselbe Profilkopf, Menu-first.
- Menu und Fokus bilden hier den Haupt-Surface.
- Posts sind hier nicht kritisch fuer den ersten stabilen Zustand.
- Der Menu-Pfad darf eigene Daten lesen, aber nicht erst eine zweite Identitaetswelt aufbauen.

### QR -> Profil mit offenem Menu

Der echte QR-Link soll kein anderer Produktpfad sein, sondern dieselbe Public-Profile-Welt mit Menu offen.

- Kanonische Zielwelt: `/:slug/menu`
- Zusatzkontext: `menuAccessSource=qr`, `tableNumber` falls vorhanden
- Legacy-QR-Links bleiben kompatible Aliase.
- QR darf die Surface-Auswahl beeinflussen, aber nicht eine zweite Route-Wahrheit oder zweite Restaurant-Aufloesung starten.

## B. Ist-Zustand heute

### 1. Route

Die Route-Wahrheit ist heute fachlich schon relativ klar:

- `public-business-route-utils.js` erkennt `/:slug`, `/:slug/posts`, `/:slug/menu` und Legacy-Varianten.
- `initial-route-state.js` baut daraus `pendingProfileRestaurantId`, `pendingProfileTopTab`, `pendingProfileAccessSource`, `pendingProfileTableNumber`.
- `index.html` parst denselben Kontext zusaetzlich noch einmal, um frueh zu entscheiden, ob `socialBootstrapFeed` gestartet wird.
- `functions/index.js` parst den Route-Kontext auf dem Server erneut fuer den Direct-Bootstrap.

Der Vertrag ist also da, aber die Interpretation liegt heute auf mehreren Ebenen gleichzeitig.

### 2. Slug-Aufloesung und `restaurantId`

Heute gibt es mehrere Aufloesungsstufen:

1. `index.html` schickt `r`, `top`, `src`, `table`, `pathname` an `socialBootstrapFeed`.
2. `functions/index.js -> parseSocialBootstrapRouteContext(...)` bildet daraus `restaurantLookupId`.
3. `buildPublicRouteBootstrapPayload(...)` loest dieses Lookup serverseitig zur echten Restaurant-Doc-ID auf:
   zuerst direkter Doc-Zugriff, danach `publicSlug`, `landingSlug`, `handle`.
4. Der Server liefert bereits eine kanonische `publicRoute.restaurantId`.
5. Im Client wird spaeter trotzdem noch einmal ueber `fetchBusinessProfileDoc(...)` bzw. `resolveRestaurantDocByRouteId(...)` aufgeloest.
6. In den Ensure-Pfaden kann die Aufloesung nochmals stattfinden, falls `profile.canonicalRestaurantId` nicht sauber vorhanden ist.

Heute ist die kanonische ID also mehrfach bekannt, aber nicht als ruhiger erstklassiger Handoff bis zum Ende durchgezogen.

### 3. Header

Der Header kommt frueh, weil er nur einen Seed braucht:

- `public-profile-direct-entry-controller.js` seedet Name, Handle, Avatar, Ort und Truth-Hints.
- `public-profile-surface-controller.js -> resolveHeaderStatus(...)` bewertet den Header schon als `ready`, wenn Identitaets-Seed vorhanden ist.
- Deshalb erscheint der Profilkopf oft stabil, bevor Posts/Menu/Fokus fertig sind.

Das ist an sich richtig und gewollt.

### 4. Beitraege

Posts laufen heute ueber mehrere moegliche Pfade:

- Im Bootstrap werden fuer Direct-Public-Routen bereits Posts-Seed-Daten geladen.
- `profile-open-flow-utils.js` versucht auf Posts-first-Pfaden ein `earlyPostsPromise`, aber nur wenn eine direkte Restaurant-ID schon frueh greifbar ist.
- Nach `fetchBusinessProfile(...)` wird oft noch einmal live aufgeloest.
- `ensurePostsDataForProfile()` prueft danach mehrere Kandidaten:
  angeforderte ID, kanonische ID, `publicSlug`, `landingSlug`, `handle`.
- `loadBusinessPostsForRestaurant(...)` kann dabei erneut `fetchBusinessProfileDoc(...)` anstossen, wenn `skipProfileResolve` nicht gesetzt ist.

Posts haben damit heute die groesste Resolver-Kette.

### 5. Menu

Menu hat heute einen separaten, schwereren Surface-Pfad:

- Im Bootstrap werden auch fuer Direct-Public-Routen Menu-Seed-Daten erzeugt.
- `seedPendingDirectEntry(...)` kann Menu schon als `seeded`, `knownEmpty` oder `unknown` in `state.menu` hinterlegen.
- Wenn das sichtbare Menu nicht schon settled ist, rufen Render-/Event-Pfade `ensureMenuDataForProfile()` auf.
- `ensureMenuDataForProfile()` geht zuerst ueber `resolveProfileRestaurantId()`.
- Danach liest `loadMenuForRestaurant(...)` die Public-Menu-Daten, inklusive eigener Cache-, Retry- und Freshness-Logik.

Auf `/:slug/menu` ist das der Haupt-Surface, aber er startet haeufig spaeter als der Header.

### 6. Fokus

Fokus ist heute technisch ein eigener Surface-Strang:

- Seed kann aus dem Bootstrap kommen.
- Ohne settled Seed laeuft `ensureFocusDataForProfile()`.
- `loadFocusForRestaurant(...)` liest Fokus-Items und Fokus-Meta parallel.

Fokus ist damit eng am Menu, aber nicht wirklich derselbe Read-Pfad.

### 7. Ensure-, Bootstrap-, Fallback- und Listener-Pfade

Heute greifen diese Schichten nacheinander ineinander:

1. `index.html` startet den Direct-Bootstrap.
2. `public-bootstrap-runtime-controller.js` speichert `publicRoute` als `state.__publicRouteBootstrap`.
3. `social-app.js -> applyPendingInitialRouteState()` seedet via `public-profile-direct-entry-controller.js` einen ersten sichtbaren Zustand.
4. `profile-open-flow-utils.js` oeffnet anschliessend dieselbe Profilwelt, baut Loading-/Interim-/Ready-Zustaende und versucht fruehe Posts.
5. `public-profile-runtime-controller.js` haengt im Public-Gast-Kontext keinen Dauerlistener mehr an, sondern einen einmaligen Profil-Read.
6. `profile-menu-focus-render-controller.js` und Event-Bindings triggern spaeter die drei Ensure-Pfade.
7. Das Ensure-Cluster laedt Posts, Menu und Fokus nach, wenn der sichtbare Surface noch nicht settled ist.

### 8. Was zuerst kommt und was spaeter kommt

Heute ist die Reihenfolge im Kern:

1. Route parsen
2. Bootstrap-Request starten
3. Pending-Route-State setzen
4. Seeded Header / seeded Surface-Wahrheit aufbauen
5. Open-Flow starten
6. Profil-Doc einmal live lesen
7. Visible Surface nachziehen
8. Ensure-Pfade fuer Posts/Menu/Fokus nachschieben

Der Header settled deshalb frueh, waehrend Posts/Menu/Fokus oft erst spaeter ankommen.

## C. Delta

### Was heute schon richtig ist

- Der oeffentliche Route-Vertrag fuer `/:slug`, `/:slug/posts`, `/:slug/menu` ist zentral lesbar.
- QR wird bereits als Menu-First-Kontext erkannt und mit `tableNumber` weitergereicht.
- Der Public-Gast-Pfad nutzt seit Schritt 10 keinen dauerhaften Profil-Realtime-Listener mehr.
- Direct-Route-Bootstrap, Direct-Entry-Seed und Open-Flow bilden schon eine route-first Public-Welt statt eines blanken App-Fallbacks.
- Menu und Fokus haben bereits eigene Truth-States (`seeded`, `knownEmpty`, `unknown`), was fuer spaetere klare Vertrage nuetzlich ist.
- Das Ensure-Cluster hat bereits einen Slot fuer `profile.canonicalRestaurantId`.

### Was heute zu kompliziert ist

- Route-Kontext wird in `public-business-route-utils.js`, `initial-route-state.js`, `index.html` und `functions/index.js` parallel interpretiert.
- Dieselbe Public-Route baut mehrmals Snapshot-/Truth-Metadaten:
  im Bootstrap, im Direct-Entry-Seed, im Open-Flow und spaeter im sichtbaren Profile-State.
- `targetRestaurantLookupId`, `targetMenuRestaurantId`, `routeSnapshotRestaurantId`, `resolvedProfileRestaurantId`
  leben zeitweise nebeneinander und muessen spaeter wieder zusammengefuehrt werden.
- Menu und Fokus haengen am selben sichtbaren Surface, werden aber als getrennte Runtime-Ketten behandelt.

### Was heute noch falsch oder unnoetig ist

- Die bereits serverseitig bekannte kanonische `restaurantId` wird nicht als erstklassiges Feld bis in alle Public-Ensure-Pfade durchgereicht.
- `ensurePostsDataForProfile()` faellt auf eine Kandidatenkette aus ID, Slugs und Handle zurueck, obwohl der Zielkontext fachlich nur ein Restaurant ist.
- `loadBusinessPostsForRestaurant(...)` kann auf dem Public-Pfad erneut die Profil-Doc-Aufloesung anwerfen.
- Der Direct-Bootstrap laedt heute auf jeder Direct-Public-Route Posts, Menu und Fokus gleichzeitig.
  Das ist fuer den Kernvertrag unnoetig schwer.
- Direct-Public-Web-Routen verwenden absichtlich keinen Bootstrap-Cache.
  Jeder Hard Refresh startet also wieder einen frischen, relativ schweren Bootstrap.
- Menu und Fokus lesen Meta getrennt; in der Laufzeit sind das zwei nahe verwandte Wahrheitsabfragen fuer denselben Surface.

### Wo Hauptlast, Verspaetung und Komplexitaet entstehen

Die Hauptlast sitzt heute in vier Stellen:

1. Schwerer Direct-Bootstrap:
   serverseitig werden bereits mehrere Surfaces geladen, auch wenn nur einer sichtbar ist.
2. Zweite Identitaetsaufloesung im Client:
   `fetchBusinessProfileDoc(...)` loest denselben Zielkontext nach dem Bootstrap oft noch einmal auf.
3. Dritte Aufloesungsstufe in den Ensure-Pfaden:
   `resolveCanonicalRestaurantId()` plus Posts-Kandidatenkette.
4. Schwerer Menu-Surface:
   Menu, Status-Meta und Fokus kommen ueber getrennte Reads plus Cache-/Retry-Logik.

Das Restproblem ist damit heute weniger eine Schleife als ein zu dichter First-Pass mit zu vielen Resolvern.

## D. Zielarchitektur in Kernregeln

1. `restaurantId` genau einmal pro Route-Einstieg aufloesen.
2. Danach immer mit derselben kanonischen `restaurantId` weiterarbeiten.
3. `slug` bleibt URL-Vertrag, aber nicht Arbeits-ID der Runtime.
4. Keine doppelte Resolve-Kette zwischen Bootstrap, Open-Flow und Ensure.
5. Public-Gast standardmaessig read-once, nicht realtime.
6. Eine klare URL pro Surface:
   `/:slug` = Profil/Posts-default,
   `/:slug/posts` = explizit Posts,
   `/:slug/menu` = explizit Menu,
   QR = dieselbe Menu-URL-Welt mit QR-Kontext.
7. Ein ruhiger Header-Pfad:
   Header darf frueh seedbar sein, aber seine Identitaet kommt spaeter aus derselben kanonischen Restaurant-Wahrheit.
8. Ein ruhiger Beitraege-Pfad:
   Posts lesen direkt aus `restaurants/{canonicalRestaurantId}/socialPosts`,
   ohne Slug-/Handle-Fallback-Orchester im Normalfall.
9. Ein ruhiger Menu-Pfad:
   Menu liest nur den fuer Menu noetigen Public-Surface.
10. Ein ruhiger Fokus-Pfad:
    Fokus haengt an derselben `canonicalRestaurantId` und soll keine eigene Identitaetsaufloesung starten.
11. Der Bootstrap fuer Direct-Public-Routen liefert nur Route-/Identity-/Main-Surface-Truth,
    nicht bereits alle Geschwister-Surfaces.
12. Optionales Sibling-Prefetch erst nach stabilem Hauptzustand:
    erst wenn Posts oder Menu sauber stehen, darf der jeweils andere Surface leicht nachgeladen werden.
13. Keine oeffentlichen GET-Pfade mit versteckten Schreibvorgaengen.
14. Bestehende QR-Links und bestehende sichtbare UI muessen unveraendert kompatibel bleiben.

## E. Umbau-Reihenfolge

### 1. Erster Kern

Zuerst muss der kanonische Zielkontext sauber werden:

- eine erstklassige `canonicalRestaurantId`
- ein klarer Handoff vom Bootstrap/Open-Flow in den sichtbaren Public-Profile-State
- dieselbe ID als First-Choice in Posts/Menu/Fokus-Ensure

Ohne diese Basis ist jeder spaetere Performance- oder Bootstrap-Umbau riskant.

### 2. Danach

Danach in kleinen, getrennten Schritten:

1. Posts-Pfad beruhigen:
   Kandidatenkette und zusaetzliche Profil-Aufloesung im Public-Posts-Path reduzieren.
2. Menu-/Fokus-Pfad beruhigen:
   gleiche kanonische ID, moeglichst weniger doppelte Meta-Arbeit.
3. Direct-Bootstrap auf Main-Surface ausrichten:
   Profile-Route laedt primär Profil/Posts,
   Menu-Route primär Profil/Menu/Fokus.
4. Optionales Sibling-Prefetch spaeter und bewusst einfuehren.

### 3. Ausdruecklich noch nicht

Noch nicht in den ersten Umbauten:

- kein URL-/Routing-Umbau
- keine UI-/Design-Aenderung
- keine Firebase-/Functions-/Rules-Aenderung auf Verdacht
- kein Root-/Feed-Umbau
- kein Entfernen des Bootstraps als Ganzes
- kein breiter Performance-Refactor
- kein Public-Redesign

### 4. Regressionen vermeiden

Ohne Regressionen geht das nur so:

- jeder Schritt aendert genau eine Kernannahme
- kein Schritt verschiebt gleichzeitig Route, Bootstrap und Surface-Loader
- QR-Verhalten bleibt in jedem Minischritt unveraendert
- Menu-Produkte auf `/:slug/menu` bleiben der haerteste Guardrail

## F. Der erste konkrete Kernschritt

### Empfohlener erster Minischritt

Die bestehende kanonische `restaurantId` aus dem aktuellen Direct-Route-Bootstrap/Open-Flow
als erstklassiges Feld `canonicalRestaurantId` in den sichtbaren Public-Profile-State einziehen
und die drei Public-Ensure-Pfade strikt darauf first-choice festziehen.

### Warum genau dieser Einstieg richtig ist

- Er setzt am Kernproblem an: identischer Zielkontext, zu oft neu aufgeloest.
- Er nutzt vorhandene Struktur statt neuen Umbau zu erfinden:
  der Bootstrap kennt die kanonische Restaurant-ID bereits,
  das Ensure-Cluster kennt bereits `profile.canonicalRestaurantId` als Konzept.
- Er hat kleinen Blast Radius:
  Route bleibt gleich, sichtbarer Surface bleibt gleich, Datenquellen bleiben gleich.
- Er schafft die Voraussetzung fuer alles Weitere:
  erst danach kann man Posts-/Menu-/Bootstrap-Slimming sauber und ohne Blindflug angehen.

### Was dieser Schritt verbessern wuerde

- weniger zweite und dritte Slug-/Doc-Aufloesung
- ruhigere Ensure-Pfade fuer Posts, Menu und Fokus
- weniger Drift zwischen `targetRestaurantLookupId`, `targetMenuRestaurantId` und spaeterer Live-ID
- klarere technische Trennung zwischen URL-Identitaet und Runtime-Identitaet

### Was dabei nicht angefasst werden darf

- keine sichtbare UI
- keine URL-Struktur
- kein QR-Link-Vertrag
- kein Functions-Endpunkt-Contract
- kein Bootstrap-Slimming
- keine Menu-/Focus-Datenquellen
- keine Cache-Strategie ausserhalb dieses ID-Handoffs
- keine Realtime-/Listener-Strategie ausserhalb des bereits stabilisierten Guest-Pfads

## G. Dokumentation dieses Schritts

- Neu:
  `docs/mnyra-step11-public-profile-core-architecture.md`
- Aktualisiert:
  `docs/mnyra-current-phase.md`

## Geaenderte Dateien

- `docs/mnyra-current-phase.md`
- `docs/mnyra-step11-public-profile-core-architecture.md`

## Bewusst nicht geaendert

- Kein Produktcode.
- Kein Routing.
- Keine Firebase-/Functions-/Rules-Datei.
- Keine UI-/Design-Datei.
- Keine Test- oder E2E-Infrastruktur.

## Manuelle Testliste

1. `docs/mnyra-current-phase.md` auf Konsistenz mit Schritt 11 pruefen.
2. `docs/mnyra-step11-public-profile-core-architecture.md` auf Konsistenz mit Zielbild, Ist-Pfad und Minischritt pruefen.
3. Keine Produktfunktion manuell zu testen, weil in diesem Schritt kein Code geaendert wurde.

## Bewertung

`analysiert, noch nicht umgesetzt`
