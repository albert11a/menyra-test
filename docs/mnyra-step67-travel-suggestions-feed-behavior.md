Status: CURRENT
Last updated: 2026-06-15

# Schritt 67 - Travel Vorschlaege wie Feed stabilisieren

## Ziel

Die Travel-Vorschlaege sollen beim Tippen stabil offen bleiben und sich wie die
Feed-Ortsvorschlaege anfuehlen. Das Dropdown darf nicht durch einen sofortigen
Travel-Re-Render verschwinden.

## Geaendert

- Der Travel-Input rendert beim `input`-Event nicht mehr die gesamte Travel-
  View neu.
- Beim Tippen wird nur noch das Vorschlags-Dropdown direkt im DOM aktualisiert.
- Die Travel-Suche wird erst bei Enter, Suchbutton oder Auswahl eines
  Vorschlags committed.
- Pointerdown auf einem Vorschlag verhindert, dass ein Blur-Hide den Vorschlag
  vor dem Klick schliesst.
- Ein alter Pflicht-Hinweis wird beim Tippen direkt aus dem DOM entfernt, ohne
  dafuer die gesamte View neu zu rendern.
- Das gebaute Social-Bundle wurde aktualisiert; der neue Travel-Lazy-Chunk ist
  im Manifest verdrahtet.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- gebaute Vite-Chunk-Hash-Aktualisierung fuer
  `apps/menyra-social/bundled/chunks/travel-view-event-bindings-*.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step67-travel-suggestions-feed-behavior.md`

## Bewusst Nicht Geaendert

- Keine neue Datenquelle und kein neuer Listener.
- Keine Routing-, QR-, Cart-, Order-, Firebase-Rules- oder Functions-Aenderung.
- Keine Aenderung an Feed, Restaurants, Shopping oder Public-Profil-Logik.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

Finaler Bundle-Guard:

- `apps/menyra-social/bundled/entry/social-app.js`: 1,049,973 Bytes raw /
  284,994 Bytes gzip.
- Budget: 1,052,000 Bytes raw / 285,000 Bytes gzip.

## Ergebnis

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko bleibt die manuelle Sichtpruefung auf echten Touch-Geraeten, weil
Codex gemaess Repo-Regel keinen Browser-/Smoke-Test ausgefuehrt hat.

## Manuelle Testliste

- `Travel` oeffnen und in die Eingabe tippen.
- `Ti`, `Vl`, `Sa` oder `Du` eingeben und pruefen, dass die Stadtvorschlaege
  offen bleiben.
- Weiter tippen und pruefen, dass das Dropdown nicht sofort verschwindet.
- Einen Stadtvorschlag antippen und pruefen, dass `Hotels` fuer diese Stadt
  oeffnet.
- Einen Hotelnamen eintippen und pruefen, dass Hotelvorschlaege offen bleiben.
- Enter oder Suchbutton nutzen und pruefen, dass die Hotelsuche committed wird.
