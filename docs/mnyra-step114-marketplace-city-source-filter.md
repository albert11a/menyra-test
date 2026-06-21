Status: CURRENT
Last updated: 2026-06-21

# Schritt 114 - Marketplace City Source Filter

## Ziel

Feed-/Restaurant-Gate und Travel-Suche sollen bei einer gesetzten Stadt nicht
mehr ueber Nachbarstaedte ausweichen. Beispiel: `Prishtina` darf keine
Ferizaj-Restaurants/-Cafes zeigen. Zusaetzlich soll Travel kosovarische
Staedte wie `Prishtina`, `Ferizaj`, `Prizren`, `Peja`, `Gjakova` und `Gjilan`
als Destination kennen.

## Befund / Datenquelle

- Restaurants, Cafes, Hotels und Motels kommen fuer Marketplace/Travel aus
  `state.restaurants`.
- `state.restaurants` wird in `loadRestaurants()` aus Firestore
  `collection(db, "restaurants")` geladen.
- Vor dem Voll-Load kann `state.bootstrapRestaurantPreview` aus dem Public-
  Bootstrap-/Preview-Cache dieselben Marketplace-Views seed-en.
- Die Gate-Stadt wird lokal unter
  `mnyra_social_feed_viewer_location_v1` gespeichert und danach clientseitig
  auf diese Restaurant-/Preview-Daten angewendet.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Bei gesetzter Stadt wird Restaurant-/Cafe-Filterung jetzt ueber Stadt-,
    Alias-, Location-Text- und aus Koordinaten abgeleitete Stadtwahrheit
    entschieden.
  - Der alte Rueckfall `Viewer-Koordinate innerhalb 35 km` greift nicht mehr,
    wenn eine Stadt wie `Prishtina` gesetzt ist. Dadurch kann Ferizaj nicht
    nur wegen Naehe zu Prishtina durchrutschen.
  - Generische GPS-Labels wie `Current location` werden nicht als Stadtquery
    behandelt, damit echte GPS-Nutzung weiterhin koordinatenbasiert filtern
    kann.
  - Travel-Destination-Aliase wurden um Kosovo-Staedte ergaenzt.
- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
  - Travel-Vorschlaege nutzen jetzt eine allgemeine City-Liste statt einer
    reinen Albanien-Liste.
  - Kosovo-Staedte und Schreibvarianten wurden ergaenzt, inklusive
    `Prishtina/Prishtine`, `Ferizaj`, `Prizren`, `Peja`, `Gjakova`, `Gjilan`,
    `Mitrovica`, `Vushtrria`, `Podujeva`, `Fushe Kosove` und weitere.
  - Kosovo-Vorschlaege zeigen als Meta `Kosovo`; bestehende Albanien-
    Vorschlaege bleiben unveraendert bei `Albanien`.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-Cvah1lxP.js`
- `apps/menyra-social/bundled/chunks/travel-view-event-bindings-DuivYS2p.js`
- geloescht durch Bundle-Hash-Wechsel:
  `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BPvpFBSY.js`
- geloescht durch Bundle-Hash-Wechsel:
  `apps/menyra-social/bundled/chunks/travel-view-event-bindings-BA_w3-GZ.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step114-marketplace-city-source-filter.md`

## Bewusst Nicht Geaendert

- Keine UI-/Design-Aenderung an Feed-Gate, Restaurant-Gate, Travel-Gate,
  Cards, Tabs, Benko oder Map.
- Keine Aenderung an Firebase Rules, Functions oder Firestore-Write-Pfaden.
- Keine Aenderung an QR, Public Menu, Warenkorb, Orders oder Routing.
- Keine neue serverseitige Query/Pagination fuer Marketplace.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- Kleiner Node-Import-/Render-Test:
  - `Prishtina` zeigt `Prishtina Place`.
  - `Prishtina` zeigt einen Koordinaten-only-Treffer nahe Prishtina.
  - `Prishtina` zeigt keinen `Ferizaj Place`.
  - Travel-Query `Prishtine` zeigt `Prishtina Hotel`.
  - Travel-Query `Prishtine` zeigt kein `Tirana Hotel`.
- `npm run build:menyra-social:bundle`

Hinweis: `npm run check:social-bundle` schlaegt weiterhin fehl, weil
`apps/menyra-social/bundled/entry/social-app.js` mit `1,104,997` Bytes raw /
`299,401` Bytes gzip ueber den bestehenden Budgets `1,052,000` raw /
`285,000` gzip liegt. Der Vite-Build selbst war erfolgreich; die Budget-
Ueberschreitung wird hier nicht nebenbei durch einen separaten Bundle-Umbau
angefasst.

## Manuelle Testliste

- Feed-Gate auf `Prishtina` setzen und Restaurant-Tab oeffnen.
- Pruefen, dass keine Ferizaj-Restaurants/-Cafes erscheinen.
- Restaurant-Gate direkt mit `Prishtina` testen und dasselbe gegenpruefen.
- Danach `Ferizaj` setzen und pruefen, dass Ferizaj-Restaurants/-Cafes
  erscheinen.
- Travel oeffnen, `Prishtina` oder `Prishtine` tippen und pruefen, dass ein
  Kosovo-Vorschlag erscheint und passende Hotels/Motels gefunden werden.
- Travel mit `Ferizaj`, `Prizren`, `Peja` oder `Gjilan` kurz gegenpruefen.

## Bewertung

`bestanden mit Rest-Risiko`

Der Schritt bleibt eng auf Marketplace-Location-Matching und Travel-
Destination-Vorschlaege begrenzt. Rest-Risiko liegt in echten Firebase-
Datensaetzen ohne gepflegte Stadt und ohne verwertbare Koordinaten sowie in
der bestehenden Social-Bundle-Budget-Ueberschreitung.
