Status: CURRENT
Last updated: 2026-06-21

# Schritt 103 - Travel Search Hero UI

## Ziel

Im Travel-Tab soll nur der obere Bereich mit dem Reiseziel-Eingabefeld
visuell an Restaurants und Feed-Gate angeglichen werden. Benko, Travel-Tabs,
Cards, Suche, Vorschlaege und Filterlogik bleiben unveraendert.

## Geaendert

- Der Travel-Suchkopf nutzt jetzt eine Restaurant-/Feed-Gate-aehnliche
  `loc-*`-Struktur mit grosser dynamischer Headline oberhalb des Inputs.
- Die dynamische obere Zeile rotiert zwischen `Find Hotels.`,
  `Find Motels.` und `Best Offers.`.
- Die feste zweite Zeile lautet `For your Travel.`.
- Das Travel-Eingabefeld nutzt den Placeholder `Enter your destination`.
- Der Suchbereich hat einen satten, flachen Tiefsee-Teal-Hintergrund.
- Das Eingabefeld ist als pillenfoermige Suche mit Map-Pin links und
  Search-Button rechts gestaltet.
- Die CSS-Regeln sind auf `#travelSearchTop` begrenzt.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CjzoD_7n.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-HyEa9VPt.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step103-travel-search-hero-ui.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Travel-Suchlogik, Destination-Matching,
  Vorschlagsverhalten oder Event-Bindings.
- Keine Aenderung an `#travelBenko`, Travel-Tabs, Hotel-Cards, Oferta-Cards
  oder Map.
- Keine Aenderung an Restaurants, Feed-Gate, Shopping oder Profilansichten.
- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules, Functions oder
  Collections.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `git diff --check`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CjzoD_7n.js`
- `node --check apps/menyra-social/bundled/entry/social-app.js`

Hinweis: Der Vite-Build war erfolgreich und meldet weiterhin die bestehende
Chunk-Size-Warnung fuer die grosse `social-app.js`-Entry.

## Manuelle Testliste

- Travel oeffnen und pruefen, dass oben ein flacher Tiefsee-Teal-Bereich ohne
  weisse Eingabecard sichtbar ist.
- Pruefen, dass die obere Zeile dynamisch zwischen `Find Hotels.`,
  `Find Motels.` und `Best Offers.` wechselt.
- Pruefen, dass darunter `For your Travel.` sichtbar ist.
- Pruefen, dass das Eingabefeld den Placeholder `Enter your destination`
  zeigt.
- Reiseziel eingeben und vorhandene Vorschlaege/Suche wie bisher bedienen.
- Gegenpruefen, dass Benko, Tabs, Hotel-/Oferta-Cards und Map optisch und
  funktional unveraendert bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die sichtbare Feinwirkung auf echten Handybreiten muss manuell
gegengeprueft werden.
