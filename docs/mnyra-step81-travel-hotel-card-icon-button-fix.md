Status: CURRENT
Last updated: 2026-06-18

# Schritt 81 - Travel Hotel Card Icon And Button Fix

## Ziel

Die Travel-Hotel-Card aus Schritt 80 soll zwei direkte Nachziehkorrekturen
bekommen: Das Strand-/See-Icon muss sichtbar sein, und der `Mehr`-Button soll
kompakt bleiben wie in der gelieferten Vorlage.

## Geaendert

- Fuer `navigation` und `waves` gibt es jetzt lokale SVG-Fallbacks im
  Marketplace-Card-Renderer.
- Die Hotel-Card nutzt diese lokalen Fallbacks fuer Zentrum- und Strand-/See-
  Distanz, damit das Strand-Icon nicht von der verzoegert geladenen Icon-Runtime
  abhaengt.
- Der `Mehr`-Button hat zusaetzlich zur Tailwind-Klasse ein lokales
  `max-width:140px`, damit er nicht auf volle Breite waechst, wenn die
  generierte Tailwind-Klasse fehlt.

## Bewusst Nicht Geaendert

- Keine Aenderung an Hotel-Editor-Datenfeldern.
- Keine Aenderung an Profil-Open-Flow: `Mehr` oeffnet weiter direkt das Profil.
- Keine Aenderung an Restaurant-/Cafe-Cards.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\marketplace\marketplace-view-render-utils.js`
- `npm run build`

## Manuelle Testliste

- Travel oeffnen und einen Hotels-Tab mit Hotel-/Motel-Card anzeigen.
- In der Distanzzeile pruefen, dass das Strand-/See-Icon sichtbar ist.
- Pruefen, dass der `Mehr`-Button rechts kompakt bleibt und nicht die ganze
  freie Breite einnimmt.
- `Mehr` anklicken und pruefen, dass weiterhin direkt das Profil geoeffnet
  wird.
- Restaurant-/Cafe-Cards kurz gegenpruefen, weil die lokalen Icon-Fallbacks im
  gemeinsamen Card-Renderer liegen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Die finale Sichtpruefung der exakten Breite und Icon-Darstellung
muss im Browser mit echten Travel-Hotel-Daten erfolgen.
