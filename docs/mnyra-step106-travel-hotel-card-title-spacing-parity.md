Status: CURRENT
Last updated: 2026-06-21

# Schritt 106 - Travel Hotel Card Title Spacing Parity

## Ziel

Die normale Hotel-/Motel-Card im Travel-Tab `Hotels` soll bei der Textgruppe
denselben vertikalen Abstand wie die Premium-Oferta-Card haben:
Bewertungszeile, Hotelname und darunter der Hotel-/Motel-Text sollen gleich
ruhig voneinander getrennt sein.

## Geaendert

- In `renderTravelHotelCard()` wurde nur der vertikale Abstand in der oberen
  Textgruppe angepasst.
- Die Bewertungszeile hat jetzt denselben Abstand zum Hotelnamen wie in
  `renderTravelOfertaPremiumCard()`.
- Der Hotel-/Motel-Kategorietext hat jetzt denselben Abstand zum Hotelnamen wie
  die Destination-Zeile der Premium-Oferta-Card.
- Die Abstandswerte wurden zusaetzlich inline gesetzt, damit der sichtbare
  Abstand unabhaengig von Tailwind-Utilities stabil bleibt.
- Das Menyra-Social-Bundle wurde neu gebaut, damit die ausgelieferte
  gebuendelte Marketplace-Datei denselben Stand enthaelt.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-ejCLlTOl.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CNkpUw8t.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step106-travel-hotel-card-title-spacing-parity.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Bildslider, Logo, Like/Share, Distanzzeilen, Feature-
  Chips, Preis oder Buttons.
- Keine Aenderung an der Premium-Oferta-Card selbst.
- Keine Aenderung an Restaurants-, Feed-, Shopping-, Profil- oder Editor-
  Oberflaechen.
- Keine Aenderung an Datenlogik, Routing, QR, Cart, Order, Firebase Rules,
  Functions oder Collections.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `npm run build:menyra-social:bundle`

## Manuelle Testliste

- Travel oeffnen und den Tab `Hotels` ansehen.
- Bei einer normalen Hotel-/Motel-Card pruefen, dass der Abstand zwischen
  Bewertungszeile und Hotelname wie bei der Premium-Oferta-Card wirkt.
- Pruefen, dass der Abstand zwischen Hotelname und `Hotel`/`Motel`-Text
  ebenfalls wie bei der Premium-Oferta-Card wirkt.
- Kurz `Ofertat` gegenpruefen, dass die Premium-Oferta-Card selbst unveraendert
  bleibt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale visuelle Wirkung muss manuell im Browser
gegengesehen werden.
