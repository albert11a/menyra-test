Status: CURRENT
Last updated: 2026-06-14

# Schritt 57 - Marketplace UI Spacing Cleanup

## Ziel

Die drei Marketplace-Bereiche `Restaurants`, `Travel` und `Shopping` sollen
ruhiger wirken:

- Die kleine Ueberschrift `Entdecken` soll nicht mehr sichtbar sein.
- Die Zeile `Beste Auswahl` soll nicht mehr sichtbar sein.
- Die erste horizontale Swipe-Karte soll links mit den Karten darunter
  ausgerichtet sein.
- Der horizontale Scrollbalken unter den Swipe-Karten soll verschwinden.
- Der Abstand zwischen Swipe-Karten und darunterliegenden Karten soll deutlich
  groesser werden.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`
  - Der Lazy-Loading-Zustand rendert keine `Entdecken`-Eyebrow mehr.
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Die `Entdecken`-Eyebrow wurde aus den echten Marketplace-Views entfernt.
  - Die sichtbare `Beste Auswahl`-Zeile inklusive Zaehler wurde entfernt.
  - Der Swipe-Track nutzt keine negativen Aussenraender mehr, damit die erste
    Swipe-Karte mit den darunterliegenden Feed-Karten links ausgerichtet ist.
  - Der Swipe-Track nutzt die vorhandene `hide-scrollbar`-Klasse und zusaetzlich
    `scrollbar-width:none`, damit beim horizontalen Swipen kein Balken sichtbar
    wird.
  - Der Abstand zwischen Swipe-Karten und den darunterliegenden Karten wurde von
    `mb-7` auf `mb-28` vergroessert.
- Social-Bundle wurde neu gebaut, damit der aktualisierte Lazy-Renderer
  ausgeliefert wird.

## Bewusst Nicht Geaendert

- Keine Aenderung an Datenquellen, Lead-Typ-Zuordnung oder Sortierung.
- Keine Aenderung am Profil-Open-Flow oder Browser-Back-Fix.
- Keine Aenderung an `social-app.js`.
- Keine neuen Firebase-Reads, Listener, Collections, Rules oder Functions.
- Keine Aenderung an QR, Cart, Order, Menu oder Public-Business-Routen.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt bleibt auf die freigegebene sichtbare Marketplace-Oberflaeche
begrenzt. Der Renderer liegt weiter in einem Lazy-Chunk; `social-app.js` wird
nicht weiter belastet. Rest-Risiko liegt in der manuellen Sichtpruefung auf
unterschiedlichen Viewport-Breiten.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- Direkter Node-Render-Check:
  keine `Entdecken`-/`Beste Auswahl`-Ausgabe, `hide-scrollbar` vorhanden,
  `mb-28` vorhanden, alte `-mx-6`-Carousel-Ausrichtung entfernt.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- `Restaurants` oeffnen und pruefen, dass `Entdecken` und `Beste Auswahl` nicht
  mehr sichtbar sind.
- Horizontale Swipe-Karten in `Restaurants` swipen und pruefen, dass kein
  Scrollbalken unter den Karten erscheint.
- Pruefen, dass die erste Swipe-Karte links mit den darunterliegenden Karten
  ausgerichtet ist.
- Pruefen, dass der Abstand zwischen Swipe-Karten und darunterliegenden Karten
  deutlich groesser ist.
- Dieselben Punkte in `Travel` und `Shopping` kurz gegenpruefen.
- Eine Karte antippen und sicherstellen, dass das Business-Profil weiter oeffnet.
