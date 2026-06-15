Status: CURRENT
Last updated: 2026-06-15

# Schritt 71 - Restaurants Gate Search

## Ziel

Im Marketplace-Tab `Restaurants` soll oberhalb der bestehenden Restaurant-
Karten ein Gate wie beim Feed erscheinen: anderer Hintergrund als Blau, Text
oberhalb des Eingabefeldes, Feed-aehnliches Eingabefeld und animierte Food-/
Coffee-Icons. Der sichtbare Text soll in Richtung `Best coffee and food spots
in your city.` gehen und auf Handybreiten stabil funktionieren.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - `Restaurants` rendert jetzt eine eigene `restaurantsView` mit Coral-
    Gate-Flaeche.
  - Das Gate enthaelt animierte Coffee-/Food-/Location-Icons und die Headline
    `Best coffee and food spots in your city.`
  - Das Eingabefeld nutzt die Feed-Gate-Geometrie: Map-Pin links, pill-
    Eingabe, runder Search-Button rechts.
  - Restaurant-Karten bleiben unterhalb der Gate-Flaeche im bestehenden
    Kartenlayout.
  - Ein eingegebener Ort/Name filtert nur die bereits vorhandenen Restaurant-/
    Cafe-/Food-Marketplace-Records.
- `apps/menyra-social/core/marketplace/restaurant-view-event-bindings.js`
  - Neue DOM-stabile Restaurant-Suchbindung mit Vorschlags-Dropdown.
  - Tippen aktualisiert nur Vorschlaege; gefiltert wird erst per Enter,
    Suchbutton oder Vorschlagsauswahl.
  - Vorschlaege kommen aus vorhandenen Restaurant-/Cafe-/Food-Profilen und
    deren Ortsdaten.
- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
  - Der bestehende lazy Marketplace-Binder aktiviert zusaetzlich die
    Restaurant-Bindung, wenn die Restaurant-Suche sichtbar ist.
- `apps/menyra-social/index.html`
  - CSS fuer Restaurants-Gate, Feed-aehnliches Input, Vorschlaege,
    responsive Handybreiten und `prefers-reduced-motion`.
  - Restaurants nutzt wie Travel keinen zusaetzlichen Smart-Header-Top-Gap.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen, inklusive neuer Hashes fuer Marketplace- und
    Travel/Marketplace-Event-Chunks.

## Bewusst Nicht Geaendert

- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules oder Functions.
- Keine Aenderung an Public-Profil-, Menu-, Fokus- oder Checkout-Logik.
- Keine Aenderung an Travel-Suche, Travel-Tabs oder Travel-Filterverhalten.
- Keine neuen Datenquellen und keine neuen Reads; die Suche arbeitet nur auf
  bereits geladenen Marketplace-Records.
- Kein Smoke-/Playwright-Lauf durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist bewusst auf den Restaurants-Marketplace-Tab begrenzt. Rest-
Risiko liegt in der manuellen Sichtpruefung auf echten Handybreiten, ob Farbe,
Animation, Textumbruch und Abstand exakt wie gewuenscht wirken.

## Verifikation

- `node --check apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/marketplace/restaurant-view-event-bindings.js`
- `node --check apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,973 Bytes raw / 284,995 Bytes gzip.

## Manuelle Testliste

- App oeffnen und zum Tab `Restaurants` wechseln.
- Pruefen, dass oben eine Coral-/nicht-blaue Gate-Flaeche erscheint.
- Pruefen, dass Text und animierte Coffee/Food/Pin-Icons oberhalb des
  Eingabefeldes sichtbar sind.
- In das Eingabefeld eine Stadt oder einen Restaurantnamen tippen und
  Vorschlaege pruefen.
- Per Enter, Suchbutton und Vorschlagsauswahl pruefen, dass die Karten
  gefiltert werden.
- Travel, Shopping, QR-Profil, Menu, Cart und Orders kurz gegenpruefen, dass
  sie unveraendert starten.
