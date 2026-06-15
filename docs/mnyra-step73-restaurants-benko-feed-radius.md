Status: CURRENT
Last updated: 2026-06-15

# Schritt 73 - Restaurants Benko Feed Radius

## Ziel

Der leere `restaurantsBenko`-Bereich unter dem Restaurant-Gate soll oben
sichtbar wie der Feed-Gate-Bento abschliessen, inklusive gleicher oberer
Abrundung und Ueberlappung.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - `restaurantsBenko` nutzt jetzt die Feed-Bento-Klassen
    `loc-bento loc-bento--feed-content` statt reinem Inline-Style.
- `apps/menyra-social/index.html`
  - Restaurant-spezifische CSS fuer `#restaurantsBenko` ergaenzt:
    `2.5rem` Top-Radius, `-2.5rem` Ueberlappung, gleicher Layer, Shadow,
    Hintergrund und Padding-Geometrie wie beim Feed-Bento.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen, inklusive neuem Marketplace-Chunk-Hash.

## Bewusst Nicht Geaendert

- Keine Aenderung am Restaurant-Gate-Text, der Location-Logik oder dem
  Feed-Location-Storage.
- Keine neuen Inhalte im leeren `restaurantsBenko`-Bereich.
- Keine Aenderung an Routing, QR, Cart, Order, Travel, Firebase Rules oder
  Functions.
- Kein Smoke-/Playwright-Lauf durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist rein visuell auf die Benko-Oberkante im Restaurant-Gate
begrenzt. Rest-Risiko liegt in der manuellen Sichtpruefung auf echten
Handybreiten.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,973 Bytes raw / 284,995 Bytes gzip.

## Manuelle Testliste

- Feed-Location loeschen und Tab `Restaurants` oeffnen.
- Pruefen, dass der leere `restaurantsBenko` oben wie beim Feed-Gate mit
  runden Ecken in die Coral-Flaeche hineinragt.
- Pruefen, dass Textanimation, Location-Input und Standortbutton unveraendert
  funktionieren.
- Feed-Location setzen und danach `Restaurants` oeffnen: Das Gate soll weiter
  gar nicht erscheinen.
