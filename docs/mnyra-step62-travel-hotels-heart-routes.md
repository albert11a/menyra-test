Status: CURRENT
Last updated: 2026-06-15

# Schritt 62 - Travel Hotels und Heart Routes

## Ziel

Travel soll wie eine eigene schnelle Hotel-Suche funktionieren: oben ein
blauer Feed-aehnlicher Einstieg, darunter eine Benko/Bento-Flaeche mit
`Ofertat`, `Hotels` und `Karte`. Gleichzeitig duerfen `Leads`, `Staff` und
`Klients/Kunden` aus Social nicht mehr in Feed zurueckfallen.

## Geaendert

- Travel rendert jetzt eine eigene blaue Startflaeche mit Reiseziel-Eingabe.
- Ohne Reiseziel ist nur `Ofertat` aktiv.
- Bei Eingabe wird automatisch auf `Hotels` gewechselt und zur Benko/Bento-
  Flaeche gescrollt.
- Klick auf `Hotels` oder `Karte` ohne Reiseziel scrollt zur Eingabe und zeigt:
  `Ju lutem shkruani destinacionin e udhëtimit.`
- Travel-Hotels werden nach Hotel-/Motel-/Hostel-/Resort-/Accommodation-Typen
  und nach Zieltext gefiltert.
- Die Travel-Karte nutzt die bestehende Leaflet-Map-Runtime, filtert dort aber
  auf Hotels im eingegebenen Reiseziel statt Restaurants.
- Die Travel-Eventbindung wurde in
  `apps/menyra-social/core/marketplace/travel-view-event-bindings.js` ausgelagert
  und wird nur bei sichtbarer Travel-Oberflaeche lazy geladen.
- Hotel-/Motel-Profile verwenden weiter das bestehende Business-Profil mit
  `Beitraege`; der zweite Tab heisst fuer Hotels jetzt `Details` und rendert
  Standort-, Ausstattung-, Strand- und Bewertungs-Karten statt Restaurant-Menue.
- Social-Drawer-Links fuer `Leads`, `Staff` und `Kunden` sowie der CEO-
  Rollenwechsel gehen direkt auf die Heart-Shell mit expliziter CRM-View:
  `crmLeads`, `crmStaff`, `crmCustomers`.

## Bereits Vorhanden

- Lead-Typen `hotel` und `motel` waren in
  `apps/menyra-social/core/app-shell/social-app-domain-config.js` bereits
  vorhanden.
- `apps/menyra-social/core/leads/lead-type-utils.js` normalisiert bereits
  `hotels`, `hostel`, `resort`, `accommodation`, `unterkunft` auf `hotel` und
  `motels` auf `motel`.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- `apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- gebaute Vite-Chunk-Hash-Aktualisierungen unter
  `apps/menyra-social/bundled/chunks/`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step62-travel-hotels-heart-routes.md`

## Bewusst Nicht Geaendert

- Keine Firebase Rules oder Functions.
- Keine QR-, Cart-, Order- oder Public-Menu-Logik.
- Keine neue Map-Library und keine zweite Hotel-Karte.
- Keine neue Hotel-Owner-Verwaltung fuer Zimmer, Fotos oder Hotel-Tools.
- Kein breiter CRM-/Lead-Umbau, weil Hotel/Motel als Lead-Typen bereits
  vorhanden sind.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`
- `node --check apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `node --check apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- `node --check apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/social-app.js`
- `node --check apps/mnyra-heart/heart-route-view-resolver.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Ergebnis

`bestanden mit kleinem Rest-Risiko`

Der Social-Entry bleibt trotz neuer Travel- und Hotel-Profil-Flaechen unter dem
aktuellen Bundle-Budget:

- `apps/menyra-social/bundled/entry/social-app.js`: 1,049,973 Bytes raw /
  284,996 Bytes gzip.
- Neuer lazy Chunk:
  `travel-view-event-bindings-3y5ES9SM.js`: 2,470 Bytes raw / 950 Bytes gzip.

Rest-Risiko bleibt die manuelle Sichtpruefung, besonders weil Codex gemaess
Repo-Regel keinen Browser-/Smoke-Test ausgefuehrt hat.

## Manuelle Testliste

- `Travel` oeffnen und pruefen, dass oben die blaue Feed-Farbe sichtbar ist.
- Ohne Reiseziel pruefen, dass nur `Ofertat` aktiv ist.
- `Hotels` ohne Reiseziel antippen und pruefen, dass zur Eingabe gescrollt wird
  und der albanische Hinweis erscheint.
- Reiseziel eingeben und pruefen, dass automatisch zu `Hotels` gescrollt wird.
- `Karte` in Travel oeffnen und pruefen, dass Hotels statt Restaurants gezeigt
  werden.
- Ein Hotel oeffnen und pruefen, dass im Profil `Beitraege` und `Details`
  sichtbar sind.
- Hotel-Details pruefen: Standortkarte, Adresse, Strand, Bewertungen und
  Inbegriffen-Cards.
- CEO-Drawer: `Leads`, `Staff`, `Kunden/Klients` antippen und pruefen, dass
  Heart statt Feed oeffnet.
- Bestehende Restaurant-Profile mit `Beitraege` und `Menue` pruefen.
- `/staff`, Waiter/Kitchen, QR, Cart und Order kurz gegenpruefen.
