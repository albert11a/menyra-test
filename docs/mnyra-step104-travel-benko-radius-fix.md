Status: CURRENT
Last updated: 2026-06-21

# Schritt 104 - Travel Benko Radius Fix

## Ziel

Nach dem Travel-Suchkopf-UI-Schritt soll die obere Benko-/Bento-Flaeche wieder
sichtbar abgerundete obere Ecken haben. Der Fix bleibt auf den Travel-Benko-
Uebergang begrenzt.

## Geaendert

- `#travelBenko` ueberlappt den Teal-Suchkopf jetzt mit `-2.5rem`, passend zum
  `2.5rem` Top-Radius.
- `#travelBenko` bekommt wie der Restaurants-Benko einen eigenen relativen
  Layer und einen dezenten oberen Schatten.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-ejCLlTOl.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CjzoD_7n.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step104-travel-benko-radius-fix.md`

## Bewusst Nicht Geaendert

- Keine Aenderung am Travel-Suchkopf-Text, Eingabefeld oder Placeholder.
- Keine Aenderung an Travel-Suche, Vorschlaegen, Tabs, Cards oder Map.
- Keine Aenderung an Restaurants, Feed-Gate, Shopping oder Profilansichten.
- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules, Functions oder
  Collections.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `git diff --check`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-ejCLlTOl.js`
- `node --check apps/menyra-social/bundled/entry/social-app.js`

Hinweis: Der Vite-Build war erfolgreich und meldet weiterhin die bestehende
Chunk-Size-Warnung fuer die grosse `social-app.js`-Entry.

## Manuelle Testliste

- Travel oeffnen und den Uebergang vom Teal-Suchkopf zum Benko pruefen.
- Die oberen linken und rechten Benko-Ecken muessen wieder sichtbar rund sein.
- Pruefen, dass der Inhalt im Benko nicht nach oben abgeschnitten wirkt.
- Reiseziel eingeben und kurz pruefen, dass Tabs, Cards und Map unveraendert
  funktionieren.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die sichtbare Rundung muss manuell auf dem Zielgeraet geprueft
werden.
