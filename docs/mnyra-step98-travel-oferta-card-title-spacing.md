Status: CURRENT
Last updated: 2026-06-20

# Schritt 98 - Travel Oferta Card Title Spacing

## Ziel

Die Premium-Oferta-Card im Travel-Tab `Ofertat` soll zwischen
Rezensionszeile, Hotelname und Stadt/Destination etwas ruhiger wirken.

## Umsetzung

- In `renderTravelOfertaPremiumCard()` wurde nur der vertikale Abstand in der
  Textgruppe der Premium-Oferta-Card erhoeht.
- Die Rezensionszeile hat jetzt mehr Abstand zum Hotelnamen.
- Die Stadt-/Destination-Zeile hat jetzt mehr Abstand zum Hotelnamen.
- Die Werte wurden zusaetzlich inline gesetzt, damit der sichtbare Abstand
  unabhaengig von vorhandenen Tailwind-Utilities stabil ist.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-0tJHFB4g.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CBKWjXhe.js`
- `docs/mnyra-step98-travel-oferta-card-title-spacing.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine Aenderung an normaler Hotel-Card im Tab `Hotels`.
- Keine Aenderung an Bildslider, Badge, Like/Share, Preis, Features oder
  Detailoverlay.
- Keine Aenderung an Datenlogik, Offer-Hydration, Firebase, QR, Cart, Order,
  Routing, Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Manuelle Testliste

- Travel `Ofertat` oeffnen.
- Eine Premium-Oferta-Card ansehen und pruefen, dass zwischen Rezensionen und
  Hotelname sichtbar mehr Luft ist.
- Pruefen, dass zwischen Hotelname und Stadt/Destination ebenfalls mehr Luft
  ist.
- Kurz gegenchecken, dass der Tab `Hotels` unveraendert wirkt.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Der Schritt ist bewusst auf zwei
Abstandswerte in der Premium-Oferta-Card begrenzt.
