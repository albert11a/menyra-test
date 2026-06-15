Status: CURRENT
Last updated: 2026-06-15

# Schritt 72 - Restaurants Feed Location Gate

## Ziel

Der Marketplace-Tab `Restaurants` soll das Gate wie das Feed-Location-Gate
verwenden. Wenn im Feed bereits eine Stadt oder der aktuelle Standort gesetzt
wurde, darf das Restaurant-Gate nicht mehr erscheinen. Die Coral-Farbe aus
Schritt 71 bleibt erhalten.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Restaurants prueft jetzt die Feed-Location-Wahrheit
    `mnyra_social_feed_viewer_location_v1`.
  - Wenn dort eine gueltige Location liegt, rendert Restaurants direkt den
    bestehenden Karteninhalt ohne Gate.
  - Ohne Location rendert Restaurants nur das Coral-Gate plus leeren
    `restaurantsBenko`-Bereich.
  - Der Gate-Text nutzt den Feed-aehnlichen Text-Slider mit
    `BEST RESTAURANTS.` / `BEST COFFEES.` und darunter `IN YOUR CITY.`.
  - Die alte Restaurant-Spot-/City-Suche aus Schritt 71 wurde fuer dieses Gate
    entfernt.
- `apps/menyra-social/core/marketplace/restaurant-view-event-bindings.js`
  - Die Restaurant-Gate-Eingabe speichert ausgewaehlte City- oder GPS-
    Locations in denselben Feed-Storage-Key.
  - Nach erfolgreicher Auswahl oder Standortfreigabe rendert Restaurants neu,
    wodurch das Gate verschwindet.
  - Die Eingabe nutzt Feed-aehnliche Vorschlaege, Enter-Verhalten,
    Location-Button und Statusmeldungen.
- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
  - Der bestehende lazy Marketplace-Binder aktiviert die Restaurant-
    Location-Bindung nur noch fuer das neue Restaurant-Location-Input.
- `apps/menyra-social/index.html`
  - Die Restaurant-Gate-CSS wurde von den alten Restaurant-Suchklassen auf
    Feed-aehnliche `loc-*`- und `feed-location-*`-Klassen umgestellt.
  - Text-Slider, Eingabe, Standortbutton, Vorschlagsliste und Reduced-Motion-
    Verhalten sind auf das neue Gate ausgerichtet.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen, inklusive neuer Hashes fuer Marketplace- und
    Travel/Marketplace-Event-Chunks.

## Bewusst Nicht Geaendert

- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules oder Functions.
- Keine Aenderung an Feed-Produktlogik ausser der Wiederverwendung desselben
  gespeicherten Location-Keys.
- Keine neuen Restaurant-/Cafe-Inhalte im leeren `restaurantsBenko`-Bereich,
  solange keine Location gesetzt ist.
- Keine Aenderung an Travel-Suche, Travel-Tabs oder Travel-Filterverhalten.
- Kein Smoke-/Playwright-Lauf durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist auf den sichtbaren Restaurant-Gate-Einstieg und die
Wiederverwendung der Feed-Location-Wahrheit begrenzt. Rest-Risiko liegt in der
manuellen Sichtpruefung auf echten Handybreiten und in der Browser-
Standortfreigabe.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/marketplace/restaurant-view-event-bindings.js`
- `node --check apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,973 Bytes raw / 284,995 Bytes gzip.

## Manuelle Testliste

- Ohne gesetzte Feed-Location zum Tab `Restaurants` wechseln.
- Pruefen, dass das Coral-Gate erscheint, der Text zwischen
  `BEST RESTAURANTS.` und `BEST COFFEES.` wechselt und darunter
  `IN YOUR CITY.` steht.
- Pruefen, dass das Eingabefeld und der Standortbutton wie im Feed-Gate wirken.
- Eine Stadt aus den Vorschlaegen waehlen und pruefen, dass das Gate
  verschwindet und Restaurant-Karten erscheinen.
- Feed-Gate separat mit Stadt oder Standort setzen, danach `Restaurants`
  oeffnen und pruefen, dass das Restaurant-Gate gar nicht erscheint.
- Ohne Location pruefen, dass unter dem Gate nur der leere Benko-Bereich steht.
