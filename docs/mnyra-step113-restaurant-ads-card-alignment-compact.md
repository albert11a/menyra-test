Status: CURRENT
Last updated: 2026-06-21

# Schritt 113 - Restaurant Ads Card Alignment Compact

## Ziel

Die Premium-Ad-Card im Restaurant-Tab soll links dieselbe Kante wie die
Restaurant-/Cafe-Cards darunter haben. Die Bewertung- und Preisspanne-Badges
sollen kleiner werden, damit die Ad-Card insgesamt weniger Hoehe braucht.

## Geaendert

- Der Restaurant-Ads-Wrapper nutzt keine eigene `max-w-5xl`-/Center-
  Einrueckung mehr, sondern folgt der normalen Content-Breite der Cards
  darunter.
- Header und horizontaler Ads-Track haben links kein zusaetzliches `px-3`
  Padding mehr.
- Die Premium-Ad-Card wurde von `26rem` auf `24rem` Hoehe reduziert.
- Die Bewertung- und Preisspanne-Pills wurden von `100px x 28px` auf
  `88px x 24px` reduziert.
- Icons und Text in diesen Pills wurden passend verkleinert.
- Der untere Button-Abstand und die Info-Leisten-Abstaende wurden kompakter
  gesetzt.
- Der Social-App-Bundle-Build wurde neu erzeugt, damit der produktive
  Marketplace-Chunk denselben Stand enthaelt.

## Geaenderte Dateien

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BJf80lXS.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BPvpFBSY.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step113-restaurant-ads-card-alignment-compact.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Ads-Speicherpfad, Freigabelogik, Statuslogik oder Heart.
- Keine Aenderung an den grossen Restaurant-/Cafe-Cards selbst.
- Keine Aenderung an QR, Public Menu, Warenkorb, Orders, Routing, Firebase
  Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`

Hinweis: Der Bundle-Build meldet weiterhin die bestehende Vite-Warnung zu
grossen Chunks nach Minifizierung. Das ist kein neuer Fehler dieses Schritts.

## Manuelle Testliste

- Restaurant-Tab mit freigegebener Ad oeffnen und pruefen, dass die erste
  Ad-Card links exakt mit den Restaurant-/Cafe-Cards darunter fluchtet.
- Auf Mobile horizontal swipen und pruefen, dass die erste Card nicht mehr
  zusaetzlich eingerueckt startet.
- Pruefen, dass Bewertung und Preisspanne kleiner wirken und nicht ueberlaufen.
- Pruefen, dass die kompaktere Ad-Card weiterhin Bild, Badges, WOLT, Titel,
  Rating, Preisspanne und `Profil ansehen` sauber zeigt.
- Die grossen Restaurant-/Cafe-Cards kurz gegenpruefen; sie sollen
  unveraendert wirken.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale Sichtpruefung muss manuell im Restaurant-Tab erfolgen.
