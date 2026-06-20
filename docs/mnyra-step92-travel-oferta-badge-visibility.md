Status: CURRENT
Last updated: 2026-06-20

# Schritt 92 - Travel Oferta Badge Visibility

## Ziel

Das rote `Ofertë`-Badge oben links auf der Travel-Oferta-Card muss sichtbar
sein, auch wenn einzelne neue Tailwind-Arbitrary-/Spacing-Klassen nicht im
bereits generierten CSS enthalten sind.

## Geaendert

- Die rote Oferta-Badge in der neuen Premium-Oferta-Card hat jetzt feste
  Inline-Fallbacks fuer Position, Farbe, Padding, Radius, Schrift und z-index.
- Der bestehende Tailwind-/Lucide-Aufbau bleibt erhalten.
- Der App-Build-Token wurde aktualisiert.
- Die Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine Aenderung an der Card-Struktur.
- Keine Aenderung am `Hotels`-Tab oder an normalen Hotel-Cards.
- Keine Firebase-, Routing-, QR-, Cart- oder Order-Aenderung.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BAmD1CJH.js`
- `git diff --check`

## Manuelle Testliste

- Travel `Ofertat` oeffnen.
- Pruefen, dass oben links im Titelbild das rote `Ofertë`-/Custom-Badge
  sichtbar ist.
- Pruefen, dass die Badge nicht von Slider-Pfeilen, Bildpunkten oder
  Like/Share-Buttons verdeckt wird.
- `Hotels`-Tab kurz oeffnen und pruefen, dass die normale Hotel-Card
  unveraendert bleibt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die sichtbare Position der Badge muss im lokalen Dev-Setup
manuell gegengeprueft werden.
