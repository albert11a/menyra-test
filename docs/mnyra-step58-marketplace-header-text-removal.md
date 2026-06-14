Status: CURRENT
Last updated: 2026-06-14

# Schritt 58 - Marketplace Header Text Removal

## Ziel

In den drei Marketplace-Bereichen `Restaurants`, `Travel` und `Shopping` sollen
die verbleibenden oberen Bereichstexte nicht mehr sichtbar sein:

- `Restaurants` plus `Top Restaurants in deiner Umgebung`
- `Travel` plus `Hotels und Motels`
- `Shopping` plus `E-Commerce und Online-Shops`

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`
  - Der Lazy-Loading-Zustand rendert keinen Bereichstitel mehr.
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Der obere Headerblock der Marketplace-Views wurde entfernt.
  - Die ungenutzten Subtitle-Felder wurden aus der Section-Konfiguration
    entfernt.
  - Swipe-Cards, darunterliegende Karten, Filterlogik und Profil-Oeffnung
    bleiben unveraendert.
- Social-Bundle wurde neu gebaut, damit der aktualisierte Lazy-Renderer
  ausgeliefert wird.

## Bewusst Nicht Geaendert

- Keine Aenderung an Drawer-Labels.
- Keine Aenderung an Card-Inhalten, Lead-Typ-Zuordnung, Sortierung oder Datenquellen.
- Keine Aenderung an `social-app.js`.
- Keine Aenderung am Profil-Open-Flow oder Browser-Back-Fix.
- Keine neuen Firebase-Reads, Listener, Collections, Rules oder Functions.
- Keine Aenderung an QR, Cart, Order, Menu oder Public-Business-Routen.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt bleibt auf die freigegebene Marketplace-Oberflaeche begrenzt und
reduziert nur sichtbaren Headertext im bestehenden Lazy-Renderer. Rest-Risiko
liegt in der manuellen Sichtpruefung, ob der neue Einstieg direkt mit den
Swipe-Karten auf allen Viewports stimmig wirkt.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- Direkter Node-Render-Check:
  keine Ausgabe von `Top Restaurants in deiner Umgebung`, `Hotels und Motels`,
  `E-Commerce und Online-Shops` und kein Marketplace-`h2`-Headerblock.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- `Restaurants` oeffnen und pruefen, dass oben kein `Restaurants`-/Subtitle-
  Header mehr sichtbar ist.
- `Travel` oeffnen und pruefen, dass oben kein `Travel`-/Subtitle-Header mehr
  sichtbar ist.
- `Shopping` oeffnen und pruefen, dass oben kein `Shopping`-/`E-Commerce und
  Online-Shops`-Header mehr sichtbar ist.
- Swipe-Cards und darunterliegende Karten kurz pruefen.
- Eine Karte antippen und sicherstellen, dass das Business-Profil weiter oeffnet.
