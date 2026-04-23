Status: DOCUMENTED
Last updated: 2026-04-24

# Mnyra Schritt 15: Public Web Profile Speed & Reliability Overhaul

## Schrittziel

Den oeffentlichen Business-Web-Profilpfad fuer `/:slug`, `/:slug/posts`, `/:slug/menu`
zu vereinfachen, so dass:

- Content frueh und ruhig erscheint,
- URL und aktiver Tab stabil zusammenlaufen,
- Refresh/Cold-Start leicht wirkt,
- keine unnoetigen Mehrfach-Aufloesungen oder sichtbaren Reentry-Phasen entstehen,
- QR unveraendert kompatibel bleibt.

## Scope

Geaendert wurden nur diese Dateien:

- `apps/menyra-social/core/router/public-business-route-utils.js`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step15-public-web-profile-speed-reliability-overhaul.md`

Keine UI-/Design-Aenderung, keine `/login`-/Root-/Functions-/Rules-Aenderung,
kein Smoke-Test, kein Playwright.

## Phase 1: Vollanalyse (A bis Z)

### Route-Kontext, Slug-Aufloesung, kanonische `restaurantId`

Normal:

- Route-Parsen fuer Business (`/:slug`, `/:slug/posts`, `/:slug/menu`) funktioniert.
- Kanonische `restaurantId` ist in Runtime/Route-Payload grundsaetzlich verfuegbar.

Unnoetig schwer:

- Business-Path-Building konservierte weiterhin `/posts` als dauerhafte aktive URL-Variante.
- URL-Sync hatte Sonderpfad fuer `menu -> posts` auf `/posts` statt klarer Basis-Kanonik.

### Bootstrap, Direct-Entry, Open-Flow

Normal:

- Route-first Seed zeigt Header frueh.
- Public-Guest bleibt read-once-orientiert.

Wirklich blockierend:

- Asynchrone Business-Open-Updates konnten spaeter erneut mit dem urspruenglichen
  Request-TopTab (`menu` oder `profile`) in den sichtbaren State schreiben.
- Wenn Nutzer in der Zwischenzeit Tab gewechselt hat, wurde TopTab teils wieder
  auf den alten Request-Wert zurueckgedrueckt.

### Sichtbarer Public-Profile-/Header-/Posts-/Menu-/Fokus-State

Normal:

- Header darf vor Posts/Menu final ready sein.
- Menu/Fokus sind eigene Surface-Reads.

Symptomatisch (nicht Kernursache):

- URL blieb zeitweise auf `.../menu`, obwohl Nutzer auf Posts gewechselt hatte.
- Tab/URL-Verhalten wirkte inkonsistent nach Refresh.

### Ensure-, Reentry-, URL-Sync-Verhalten

Wirklich blockierend:

- URL-Sync hatte einen zusaetzlichen RouteKey-Dedupe-Return, der in Drift-Faellen
  noetige Korrektur-Replaces unterdruecken konnte.
- Business-Erkennung in Event-/Render-Schicht stuetzte sich teils nur auf
  `profile.restaurantId`; bei kanonischer ID im Seed konnte Business-Handling
  kurzfristig ausfallen.

## Einordnung der Befunde

### Was normal ist

- Frueher Header-Seed.
- Read-once Public-Guest-Reads.
- Alias-Parsing fuer Legacy-/Kompatibilitaetspfade.

### Was unnoetig schwer ist

- Dauerhafte Beibehaltung von `/posts` als gleichwertige aktive Business-URL.
- Zusatzlogik fuer `menu -> posts` als eigener URL-Pfad.

### Was wirklich blockiert

1. Stale TopTab-Ueberschreibung aus asynchronen Direct-Open-Updates.
2. Potenziell unterdrueckte URL-Korrektur durch extra RouteKey-Dedupe-Return.
3. Fragile Business-Erkennung bei kanonischer ID im Seed-/Route-Payload-Kontext.

### Was nur Symptom ist

- Haengenbleiben auf `.../menu` in einzelnen Wechseln.
- Inkonsistentes URL-Mitziehen zwischen Menu und Beitraegen.

## Priorisierung der Ursachen

1. Wichtigste Ursache:
   stale asynchrone TopTab-Rewrites im Business-Open-Flow (gleiches Profil, alter Request-Tab).
2. Zweitwichtigste:
   URL-Sync-Dedupe konnte erforderliche Replace-Korrekturen blockieren.
3. Drittwichtigste:
   nicht robuste Business-Erkennung bei kanonischer Restaurant-ID ohne fruehes `restaurantId`-Feld.
4. Weitere relevante Ursache:
   zu breite aktive URL-Kanonik (`/:slug` plus persistentes `/posts`).

## Phase 2: Umsetzung (saubere Vereinfachung)

### 1. Business-URL-Kanonik auf 2 aktive URLs vereinfacht

Datei: `core/router/public-business-route-utils.js`

- `buildCanonicalPublicBusinessPathCore(...)` liefert fuer Business-Posts/Profile
  jetzt immer `/:slug`.
- `/:slug/menu` bleibt aktive Menu-URL.
- `/:slug/posts` bleibt parsebar als Kompatibilitaets-Alias, wird aber bei URL-Sync
  sofort auf `/:slug` normalisiert.

### 2. URL-Sync beruhigt und entkoppelt

Datei: `social-app.js`

- Sonderpfad `forceBusinessPostsPathFromMenuSurface` entfernt.
- Extra-Return `if (lastSyncedTabRouteKey === routeKey) return;` entfernt,
  damit noetige Replace-Korrekturen nicht unterdrueckt werden.

### 3. Pending-Route-Override enger auf Startup begrenzt

Datei: `social-app.js`

- Pending-Business-TopTab wird nur noch bevorzugt, solange keine live erkennbare
  Business-Entitaet vorhanden ist.
- Live-Business-State bekommt frueher Prioritaet gegenueber stale Pending-Werten.

### 4. Business-Erkennung robust gegen kanonische ID-Seeds

Dateien:

- `core/app-events/app-events-shell-bind-utils.js`
- `core/profile/profile-menu-focus-render-controller.js`

- Business-Detection nutzt jetzt auch `canonicalRestaurantId` sowie Route-Payload-
  Restaurant-Hints.
- Dadurch bleiben Menu-/Posts-Tab-Interaktionen stabiler, auch in Seed-/Uebergangsphasen.

### 5. Schutz gegen stale TopTab-Rueckschreiben aus async Updates

Datei: `core/profile/public-profile-runtime-controller.js`

- Bei Updates auf dasselbe sichtbare Business-Profil wird ein expliziter TopTab-
  Override aus altem Route-Request nicht mehr blind angewandt, wenn der Nutzer
  bereits sichtbar auf einen anderen TopTab gewechselt hat.
- Gleichzeitig bleibt absichtlicher Route-Wechsel (z. B. echte Navigation)
  weiterhin moeglich.

## Warum es jetzt leichter und zuverlaessiger laedt

- Ein klarerer URL-Vertrag reduziert Drift (`/:slug` und `/:slug/menu`).
- Der aktive Nutzer-Tab wird nicht mehr spaet von alten async Request-Parametern
  zurueckgesetzt.
- URL-Sync korrigiert konsistenter und haengt weniger von einem zusaetzlichen
  Dedupe-Guard ab.
- Business-Tab-Handling bleibt auch in Seed-/Cold-Start-Uebergaengen konsistent.

## QR-Invariante

Unveraendert belassen:

- QR-URLs
- QR-Logik
- Tisch-/Bestellkontext
- QR -> Profil mit offenem Menu

## Bewusst nicht geaendert

- Keine UI-/Design-Anpassung.
- Kein `/login`-Umbau.
- Kein Root `/`-Umbau.
- Keine Firebase Functions.
- Keine Firestore Rules.
- Keine anderen Produktbereiche ausserhalb Public-Business-Profilpfad.

## Technische Selbstpruefung

- `node --check apps/menyra-social/core/router/public-business-route-utils.js`
- `node --check apps/menyra-social/social-app.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --check apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`

## Manuelle Testliste

1. `/:slug` laden und zwischen Menu/Beitraege wechseln: URL folgt stabil (`/:slug` <-> `/:slug/menu`).
2. `/:slug/posts` direkt laden: URL normalisiert sofort auf `/:slug`, Inhalte bleiben sichtbar.
3. `/:slug/menu` Refresh (Cold Start): Menu-Produkte erscheinen, danach mehrmals Tab-Wechsel ohne URL-Haenger.
4. Mehrfaches Hin-und-her zwischen Menu und Beitraegen ohne Refresh: URL bleibt synchron.
5. QR-Link oeffnen: weiterhin Menu offen mit unveraendertem Tisch-/Bestellkontext.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
