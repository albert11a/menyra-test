Status: CURRENT
Last updated: 2026-06-21

# Schritt 115 - Feed City Source Filter

## Ziel

Der Feed soll dieselbe Stadtwahrheit wie Restaurants/Marketplace nutzen. Wenn
im Feed-Gate oder Header `Prishtina` gesetzt ist, duerfen Feed-Posts, Stories
und Best-Spot-Eintraege aus Ferizaj nicht nur wegen Kosovo-Land oder Naehe
sichtbar bleiben.

## Befund / Datenquelle

- Feed-Posts kommen aus `state.feedPosts`, geladen ueber den bestehenden
  Feed-Load-Pfad.
- Restaurant-/Business-Metadaten fuer Feed-Posts kommen aus `state.restaurants`,
  also aus Firestore `collection(db, "restaurants")` plus Cache/Hydration.
- Die Feed-Gate-Stadt wird lokal unter
  `mnyra_social_feed_viewer_location_v1` gespeichert.
- Der Feed hatte bisher eine eigene Scope-Logik:
  Land wurde hart gefiltert, danach wurde vor allem nach Distanz sortiert.
  Dadurch konnten Ferizaj-Inhalte bei `Prishtina` im Kosovo-Kandidatenpool
  bleiben.

## Geaendert

- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
  - Feed-Scope prueft bei echter gesetzter Stadt jetzt Stadt-/Alias- und
    Location-Textfelder der Restaurant- und Post-/Story-Daten.
  - Koordinaten werden nur noch als abgeleitete Stadtwahrheit genutzt, wenn
    keine explizite bekannte Stadt im Datensatz widerspricht.
  - `Prishtina/Prishtine/Pristina` und wichtige Kosovo-Aliase wurden fuer den
    Feed-Stadtabgleich nachgezogen.
  - Generische GPS-Labels wie `Current location`, `Vendndodhja aktuale` und
    `Trenutna lokacija` werden nicht als echte Stadt behandelt. GPS ohne Stadt
    bleibt weiter koordinaten-/landbasiert.
  - Dieselbe Stadtpruefung greift fuer:
    - normale Feed-Posts
    - Stories
    - Best-Spot-/Spot-Story-Track oben im Feed
- `apps/menyra-social/bundled/entry/social-app.js`
  - Social-Bundle nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step115-feed-city-source-filter.md`

## Bewusst Nicht Geaendert

- Keine sichtbare UI-/Design-Aenderung am Feed-Gate, Header oder Feed.
- Keine Aenderung an Restaurant-/Marketplace-Cards.
- Keine Aenderung an Travel.
- Keine Aenderung an Firebase Rules, Functions oder Firestore-Write-Pfaden.
- Keine Aenderung an QR, Public Menu, Warenkorb, Orders oder Routing.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- Kleiner Node-Import-/Render-Test:
  - Feed-Location `Prishtina` zeigt `Prishtina Post`.
  - Feed-Location `Prishtina` zeigt einen Koordinaten-only-Prishtina-Post.
  - Feed-Location `Prishtina` zeigt keinen `Ferizaj Post` und keinen
    `Ferizaj Place`.
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`

Hinweis: `npm run check:social-bundle` schlaegt weiterhin fehl, weil
`apps/menyra-social/bundled/entry/social-app.js` mit `1,107,939` Bytes raw /
`300,392` Bytes gzip ueber den bestehenden Budgets `1,052,000` raw /
`285,000` gzip liegt. Der Vite-Build selbst war erfolgreich; ein separater
Bundle-Size-Umbau wurde bewusst nicht in diesen Feed-Fix gemischt.

## Manuelle Testliste

- Feed-Gate auf `Prishtina` setzen.
- Im Feed pruefen, dass keine Ferizaj-Posts, Ferizaj-Stories oder Ferizaj-
  Best-Spots sichtbar sind.
- Danach `Ferizaj` setzen und pruefen, dass Ferizaj-Inhalte erscheinen.
- Header-Location im Feed auf `Prishtina` aendern und dieselbe Gegenpruefung
  wiederholen.
- GPS/Standort-Button kurz gegenpruefen: Ohne echte Stadt im Label soll die
  bisherige GPS-basierte Feed-Nutzung nicht leer werden.

## Bewertung

`bestanden mit Rest-Risiko`

Der Schritt ist eng auf Feed-Stadtfilterung begrenzt. Rest-Risiko liegt in
echten Firebase-Datensaetzen ohne gepflegte Stadt und ohne verwertbare
Koordinaten sowie in der bestehenden Social-Bundle-Budget-Ueberschreitung.
