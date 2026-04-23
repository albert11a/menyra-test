# Feed Location Country + Distance Flow (2026-04-10)

## Ziel

- Standort im Header bleibt aktiv.
- Feed zeigt nach Standortauswahl nur Inhalte aus demselben Land.
- Reihenfolge im Feed ist "naeheste zuerst" (Distanz zum Viewer-Standort).
- Länder-Scope ist strikt:
  - Kosovo -> nur Kosovo
  - Albanien -> nur Albanien
  - Serbien -> nur Serbien

## Geaenderte Dateien

- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `apps/menyra-social/core/feed/feed-visibility-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/index.html` (Header-Location-UI aus den vorherigen Schritten)

## Was genau implementiert wurde

### 1) Feed-Posts tragen jetzt Geo-/Country-Meta

Datei: `feed-visibility-runtime-cluster.js`

- Neue Normalizer:
  - `normalizeFeedCountryCode(...)`
  - `readFeedCoords(...)`
- Beim Projizieren eines Feed-Posts werden jetzt zusaetzlich gesetzt:
  - `countryCode`
  - `country`
  - `lat`
  - `lng`

Damit kann der Feed spaeter pro Standort sauber gefiltert und sortiert werden.

### 2) Viewer-Location wird um Country erweitert

Datei: `feed-view-orchestration-controller.js`

- `normalizeViewerLocationRecord(...)` speichert jetzt:
  - `countryCode`
  - `country`
- Country-Ermittlung passiert ueber:
  - explizite Country-Felder
  - City-/Text-Hints
  - Fallback ueber Bounding-Boxes (`FEED_COUNTRY_BOUNDS`)

### 3) Strikte Land-Filterung + Distanzsortierung im Feed

Datei: `feed-view-orchestration-controller.js`

- Neue Kernfunktion: `resolveFeedGeoScopedCollections(...)`
- Logik:
  1. Viewer-Standort und Viewer-Land bestimmen.
  2. Pro Feed-Post/Story Restaurant + Koordinaten + Country aufloesen.
  3. Wenn Viewer-Land bekannt ist: nur Eintraege mit gleichem `countryCode`.
  4. Distanz mit `haversineDistanceKm(...)` berechnen.
  5. Sortierung:
     - zuerst kleinere Distanz
     - dann Fallback nach Zeit/Original-Reihenfolge

- Diese Funktion wird in beiden Renderpfaden verwendet:
  - `updateFeedDom()`
  - `renderFeedView()`

### 4) Header/Feed-Reuse bei Location-Change stabilisiert

Datei: `app-shell-runtime-controller.js`

- `buildFeedLocationRenderKey(...)` enthaelt jetzt auch:
  - `countryCode`
  - `country`
- Wenn sich dieser Key aendert, wird `feedView` nicht reused.
- Ergebnis: bei Standortwechsel kein "alter/leer recycelter Feed".

## Reproduktions-Check (manuell)

1. App oeffnen.
2. Standort `Prishtina` setzen:
   - Feed hat Inhalte.
3. Standort `Tirana` setzen:
   - nur Albanien-Inhalte sichtbar (falls keine vorhanden -> leerer Feed ist korrekt).
4. Standort `Smederevo` setzen:
   - nur Serbien-Inhalte sichtbar (falls keine vorhanden -> leerer Feed ist korrekt).
5. Zurueck auf `Gjakova`:
   - Kosovo-Inhalte wieder sichtbar.
6. Zwischen `Prishtina` und `Gjakova` wechseln:
   - Reihenfolge der ersten Feed-Items sollte sich aendern (Distanz-Priorisierung).

## Wenn etwas kaputt geht: Debug-Checkliste

1. Standort-Datensatz pruefen (LocalStorage):
   - Key: `mnyra_social_feed_viewer_location_v1`
   - Erwartet: `lat`, `lng`, plus idealerweise `countryCode`.

2. Viewer-Country-Aufloesung pruefen:
   - `resolveCountryCodeFromAnyRecord(...)`
   - `resolveCountryCodeFromCoords(...)`
   - Bounding-Box-Reihenfolge muss Kosovo vor Serbien pruefen.

3. Feed-Post-Meta pruefen:
   - In `normalizeFeedPost(...)` muessen `countryCode`, `lat`, `lng` gesetzt sein.

4. Renderpfad pruefen:
   - `resolveFeedGeoScopedCollections(...)` muss in `updateFeedDom()` und `renderFeedView()` verwendet werden.

5. Standortwechsel/Reuse pruefen:
   - `didFeedLocationRenderKeyChange` muss bei Country/Coord-Change `true` werden.

## Typische Ursache fuer "leer"

- Nicht zwingend Bug:
  - Wenn fuer das gewaehlte Land aktuell keine passenden Posts/Stories vorhanden sind, ist "KEINE POSTS VORHANDEN" erwartetes Verhalten.
- Echter Bug:
  - `countryCode` wird weder am Viewer noch an Feed-Posts aufgeloest.

## Rollback (nur dieses Feature)

1. In `feed-view-orchestration-controller.js`:
   - `resolveFeedGeoScopedCollections(...)` und Country/Distance-Helfer entfernen.
   - Feed wieder nur nach alter Kategorie/Zeit rendern.

2. In `feed-visibility-runtime-cluster.js`:
   - `country/countryCode/lat/lng` Projektion rueckgaengig machen.

3. In `app-shell-runtime-controller.js`:
   - `buildFeedLocationRenderKey(...)` auf lat/lng/label/city zuruecksetzen (ohne country-Felder), falls noetig.

## Hinweis fuer spaetere Erweiterung

- Wenn gewuenscht, kann statt hartem Leerzustand bei fehlenden Country-Daten ein Fallback-Modus eingebaut werden:
  - "zeige nur Eintraege mit Distance"
  - oder "zeige letzte globale Eintraege + Warnhinweis"
  - aktuell ist das absichtlich strikt.
