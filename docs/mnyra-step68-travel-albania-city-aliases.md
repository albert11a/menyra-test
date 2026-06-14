Status: CURRENT
Last updated: 2026-06-15

# Schritt 68 - Travel Albanien-Stadtaliasse nachziehen

## Ziel

Die Travel-Eingabe soll albanische Staedte und Reiseorte sauberer erkennen.
Insbesondere soll `Shengjin` auch dann gefunden werden, wenn Daten oder Nutzer
die Schreibweise `Shëngjin`, `shen gjin` oder eine andere naheliegende Variante
verwenden.

## Geaendert

- Die Travel-Stadtvorschlaege wurden um weitere albanische Staedte und
  Reiseorte erweitert, darunter `Shengjin`, `Ksamil`, `Dhermi`, `Velipoje`,
  `Theth`, `Valbone`, `Golem`, `Orikum`, `Borsh` und weitere Orte.
- Die Such-Aliasgruppen fuer Travel-Ziele wurden mit denselben Orten
  nachgezogen, damit Vorschlag und tatsaechliches Matching dieselbe Wahrheit
  verwenden.
- Wenn die Eingabe zu einem Stadt- oder Reiseort-Vorschlag passt, zeigt das
  Dropdown nur diese Orte und mischt keine Hotelvorschlaege darunter.
- Die Eingabe committed beim Tippen keinen Travel-Zustand; uebernommen wird
  erst per Vorschlagsklick, Enter oder Suchbutton.
- Die lockere Normalisierung behandelt albanische Sonderzeichen explizit:
  `ë` wird wie `e` und `ç` wie `c` behandelt.
- Das gebaute Social-Bundle wurde aktualisiert; die neuen Travel- und
  Marketplace-Lazy-Chunks sind im Manifest verdrahtet.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- gebaute Vite-Chunk-Hash-Aktualisierung fuer
  `apps/menyra-social/bundled/chunks/travel-view-event-bindings-*.js`
- gebaute Vite-Chunk-Hash-Aktualisierung fuer
  `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-*.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step68-travel-albania-city-aliases.md`

## Bewusst Nicht Geaendert

- Keine neue Datenquelle und kein neuer Listener.
- Keine Aenderung am Travel-Layout, an Farben, Spacing oder sichtbaren
  Komponenten.
- Keine Routing-, QR-, Cart-, Order-, Firebase-Rules- oder Functions-Aenderung.
- Keine Aenderung an Feed, Restaurants, Shopping oder Public-Profil-Logik.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Verifikation

- `node --check apps\menyra-social\core\marketplace\travel-view-event-bindings.js`
- `node --check apps\menyra-social\core\marketplace\marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

Finaler Bundle-Guard:

- `apps/menyra-social/bundled/entry/social-app.js`: 1,049,973 Bytes raw /
  284,995 Bytes gzip.
- Budget: 1,052,000 Bytes raw / 285,000 Bytes gzip.

## Ergebnis

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko bleibt die manuelle Sichtpruefung, weil Codex gemaess Repo-Regel
keinen Browser-/Smoke-Test ausgefuehrt hat.

## Manuelle Testliste

- `Travel` oeffnen und in die Eingabe `Shengjin` tippen.
- Danach `Shëngjin` und `shen gjin` gegenpruefen.
- `Durres`/`Durrës`, `Vlora`/`Vlorë`, `Dhermi`/`Dhërmi`,
  `Velipoje`/`Velipojë`, `Ksamil`, `Golem` und `Borsh` testen.
- Bei Stadt-Eingaben pruefen, dass im Dropdown nur Stadt-/Reiseortvorschlaege
  stehen und keine Hotels dazwischen erscheinen.
- Beim reinen Tippen pruefen, dass noch nichts als Suche uebernommen wird.
- Einen vorgeschlagenen Ort antippen und pruefen, dass passende Travel-Hotels
  oder Travel-Profile gesucht werden.
- Einen Hotelnamen direkt eintippen und pruefen, dass Hotelvorschlaege weiter
  stabil offen bleiben.
