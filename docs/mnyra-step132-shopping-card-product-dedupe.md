Status: CURRENT
Last updated: 2026-06-27

# Schritt 132 - Shopping Card Produkt-Dedupe

## Ziel

In der Shopping-Tab-Card darf dasselbe Produkt nicht doppelt erscheinen.

## Umsetzung

- Die Shopping Card liest Produkt-IDs aus `shoppingLandingCard.productIds`,
  `shoppingLandingCardProductIds` und `shoppingLandingProductIds`.
- Diese ID-Liste wird vor dem Rendern dedupliziert.
- Die Reihenfolge der ersten Fundstelle bleibt erhalten.
- Der App-Build-Token wurde auf
  `2026-06-27-shopping-card-image-picker-02` aktualisiert.
- Das Social-Bundle wurde neu gebaut.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step132-shopping-card-product-dedupe.md`

## Bewusst nicht geaendert

- Keine Aenderung am Shop-Editor-Layout.
- Keine Aenderung an Produktbildern, Card-only Uploads oder Produktdetail-Modal.
- Keine Aenderung an Cart, Checkout, Orders, QR, Routing, Firebase Rules oder
  Functions.

## Manuelle Testliste

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Bei `?debug-build=1` muss
   `2026-06-27-shopping-card-image-picker-02` aktiv sein.
3. Shopping-Tab oeffnen.
4. Eine Shopping-Card mit gespeicherten Produkten pruefen.
5. Erwartung: Jedes Produkt erscheint in der Card nur einmal.
6. Produktkachel antippen und pruefen, dass das Produkt-Modal weiter oeffnet.
