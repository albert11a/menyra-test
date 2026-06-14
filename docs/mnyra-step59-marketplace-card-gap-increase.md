Status: CURRENT
Last updated: 2026-06-14

# Schritt 59 - Marketplace Card Gap Increase

## Ziel

Der sichtbare Abstand zwischen den horizontalen Swipe-Karten und den darunter-
liegenden Karten in `Restaurants`, `Travel` und `Shopping` soll groesser werden.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Der Abstand nach dem Swipe-Track wurde von `mb-28` auf `mb-40` erhoeht.
- Social-Bundle wurde neu gebaut, damit der aktualisierte Marketplace-Lazy-Chunk
  ausgeliefert wird.

## Bewusst Nicht Geaendert

- Keine Aenderung an Datenquellen, Card-Inhalten, Sortierung oder Profil-Oeffnung.
- Keine Aenderung an `social-app.js`.
- Keine Aenderung an QR, Cart, Order, Firebase Rules oder Functions.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist ein reiner Abstandswert im bestehenden Lazy-Renderer. Rest-Risiko
liegt nur in der manuellen Sichtpruefung auf echten Viewports.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- Direkter Node-Render-Check fuer `mb-40` statt `mb-28`.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- `Restaurants`, `Travel` und `Shopping` oeffnen.
- Pruefen, dass der Abstand zwischen Swipe-Karten und darunterliegenden Karten
  sichtbar groesser ist.
- Eine Karte antippen und sicherstellen, dass das Profil weiter oeffnet.
