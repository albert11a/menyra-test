Status: CURRENT
Last updated: 2026-06-21

# Schritt 112 - Restaurant Ads Card Fit

## Ziel

Die Premium-Ad-Card im Restaurant-Tab soll zum freigegebenen Tailwind-/Lucide-
Aufbau passen und in der kleinen horizontalen Swipe-Zeile stabile Breiten,
Hoehen, Icons und Abstaende haben.

## Geaendert

- Die Restaurant-Ad-Card bekommt fuer kritische Masse und Abstaende Inline-
  Fallbacks, damit sie auch mit der statisch ausgelieferten Tailwind-CSS sauber
  gerendert wird.
- Bildbereich, Badge-Stack, WOLT-Badge, Info-Leiste und Profil-Button wurden
  auf feste Hoehen, Breiten und Padding-Werte abgesichert.
- Fuer fehlende Ad-/Cover-Bilder gibt es einen ruhigen Logo-/Icon-Fallback.
- `star` und `user` haben lokale SVG-Fallbacks im Marketplace-Icon-Helper.
- Die Restaurant-Ads-Swipe-Zeile hat feste max-width-, Gap-, Padding- und
  Scroll-Fallbacks.
- Der Social-App-Bundle-Build wurde neu erzeugt, damit der produktive
  Marketplace-Chunk denselben Stand enthaelt.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BJf80lXS.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BzXlu_wd.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step112-restaurant-ads-card-fit.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Ads-Speicherpfad, Freigabelogik, Statuslogik oder Heart.
- Keine Aenderung an grossen Restaurant-/Cafe-Cards.
- Keine Aenderung an QR, Public Menu, Warenkorb, Orders, Routing, Firebase
  Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`

Hinweis: Der Bundle-Build meldet weiterhin die bestehende Vite-Warnung zu
grossen Chunks nach Minifizierung. Das ist kein neuer Fehler dieses Schritts.

## Manuelle Testliste

- Restaurant-Tab mit freigegebener Ad oeffnen und pruefen, dass die horizontale
  Highlight-Zeile sauber sitzt.
- Auf Mobile pruefen, dass die Ad-Card nicht zu breit ist und seitlich
  sauber geswiped werden kann.
- Pruefen, dass Bild, `Best Choice`, `For Delivery`, `WOLT`, Rating,
  Preisspanne und `Profil ansehen` nicht ueberlappen.
- Eine Ad ohne Bild oder mit fehlerhaftem Bild gegenpruefen; der Logo-/Icon-
  Fallback soll sauber erscheinen.
- Die grossen Restaurant-/Cafe-Cards kurz gegenpruefen; sie sollen
  unveraendert wirken.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale Sichtpruefung muss manuell im Restaurant-Tab erfolgen.
