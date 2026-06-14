Status: CURRENT
Last updated: 2026-06-14

# Schritt 60 - Marketplace Card Gap Inline Fix

## Ziel

Der Abstand zwischen der oberen horizontal swipebaren Card-Reihe und den
darunterliegenden Karten in `Restaurants`, `Travel` und `Shopping` soll sichtbar
greifen.

## Ursache

Der vorherige Schritt setzte den Abstand ueber die Tailwind-Klasse `mb-40`.
Diese Klasse ist in der statisch generierten Social-CSS nicht vorhanden. Dadurch
stand `mb-40` zwar im Renderer und im Bundle, hatte aber sichtbar keine Wirkung.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Der Abstand nach dem Swipe-Track wird jetzt direkt ueber
    `style="margin-bottom:10rem;"` gesetzt.
- Social-Bundle wurde neu gebaut, damit der aktualisierte Marketplace-Lazy-Chunk
  ausgeliefert wird.

## Bewusst Nicht Geaendert

- Keine Aenderung an Card-Inhalten, Datenquellen, Sortierung oder Profil-Oeffnung.
- Keine Aenderung an `social-app.js`.
- Keine Aenderung an QR, Cart, Order, Firebase Rules oder Functions.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ersetzt eine nicht vorhandene Utility-Klasse durch einen direkten
Margin-Wert an genau dem bestehenden Swipe-Track-Wrapper. Rest-Risiko liegt nur
in der manuellen Sichtpruefung, ob `10rem` visuell passt.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- Direkter Node-Render-Check:
  `style="margin-bottom:10rem;"` ist vorhanden, `mb-40` und `mb-28` werden nicht
  mehr gerendert.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- `Restaurants`, `Travel` und `Shopping` oeffnen.
- Pruefen, dass zwischen der oberen horizontal swipebaren Card-Reihe und den
  darunterliegenden Karten jetzt sichtbar Abstand ist.
- Eine Karte antippen und sicherstellen, dass das Profil weiter oeffnet.
