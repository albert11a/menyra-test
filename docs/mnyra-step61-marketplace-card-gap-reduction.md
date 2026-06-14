Status: CURRENT
Last updated: 2026-06-14

# Schritt 61 - Marketplace Card Gap Reduction

## Ziel

Der Abstand zwischen der oberen horizontal swipebaren Card-Reihe und den
darunterliegenden Karten in `Restaurants`, `Travel` und `Shopping` soll 80%
kleiner sein als im vorherigen Schritt.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Der direkte Abstand nach dem Swipe-Track wurde von
    `margin-bottom:10rem` auf `margin-bottom:2rem` reduziert.
- Social-Bundle wurde neu gebaut, damit der aktualisierte Marketplace-Lazy-Chunk
  ausgeliefert wird.

## Bewusst Nicht Geaendert

- Keine Aenderung an Card-Inhalten, Datenquellen, Sortierung oder Profil-Oeffnung.
- Keine Aenderung an `social-app.js`.
- Keine Aenderung an QR, Cart, Order, Firebase Rules oder Functions.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist ein einzelner Abstandswert im bestehenden Lazy-Renderer. Rest-
Risiko liegt nur in der manuellen Sichtpruefung, ob `2rem` visuell passt.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- Direkter Node-Render-Check:
  `style="margin-bottom:2rem;"` ist vorhanden, `10rem`, `mb-40` und `mb-28`
  werden nicht mehr gerendert.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- `Restaurants`, `Travel` und `Shopping` oeffnen.
- Pruefen, dass der Abstand zwischen oberer swipebarer Card-Reihe und den
  darunterliegenden Karten deutlich kleiner ist, aber noch sichtbar bleibt.
- Eine Karte antippen und sicherstellen, dass das Profil weiter oeffnet.
