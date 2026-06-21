Status: CURRENT
Last updated: 2026-06-21

# Schritt 107 - Discovery Map Marker Pointer

## Ziel

Der kleine Pfeil unter dem ausgewaehlten Entdecker-/Discovery-Map-Marker soll
sauber unter der Marker-Box sitzen. Besonders beim blauen Auswahlrahmen darf der
Pfeil nicht mehr sichtbar in die Umrandung hineinlaufen oder unsauber
ueberlappen.

## Geaendert

- In `makeBizDivIcon()` wurde nur die vertikale Position des Marker-Pfeils
  korrigiert.
- Der negative Top-Margin `-mt-1` am Pfeil wurde entfernt.
- Dadurch sitzt das Dreieck direkt unter der Logo-Box statt in die blaue
  Border hineingezogen zu werden.
- Das Menyra-Social-Bundle wurde neu gebaut, damit der ausgelieferte
  Discovery-Chunk denselben Stand enthaelt.
- Der App-Build-Token wurde aktualisiert, damit Browser den neuen Bundle-Entry
  und den neuen Discovery-Chunk laden.

## Geaenderte Dateien

- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/discovery-runtime-controller-Dplzg-0K.js`
- `apps/menyra-social/bundled/chunks/discovery-runtime-controller-DOgZngp7.js`
- `apps/menyra-social/index.html`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step107-discovery-map-marker-pointer.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Karte, Leaflet-Initialisierung, Marker-Daten,
  Suchlogik oder Standortlogik.
- Keine Aenderung an Marker-Groesse, Logo, Auswahlfarbe, Schatten oder
  Klickverhalten.
- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules, Functions oder
  Collections.
- Keine Aenderung an Travel-, Restaurants-, Feed-, Profil- oder Editor-
  Oberflaechen.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `npm run build:menyra-social:bundle`

Hinweis: Der Build meldet weiterhin die bestehende Vite-Warnung zu grossen
Chunks nach Minifizierung. Das ist kein neuer Fehler dieses Schritts.

## Manuelle Testliste

- Entdecker-/Discovery-Karte oeffnen.
- Einen Business-Marker antippen, sodass der blaue Auswahlrahmen sichtbar ist.
- Pruefen, dass der kleine Pfeil direkt unter der Marker-Box sitzt und nicht
  mehr unsauber in die blaue Umrandung hineinragt.
- Einen nicht ausgewaehlten Marker kurz gegenpruefen, dass der weisse Pfeil
  weiterhin normal sichtbar ist.
- Kurz pruefen, dass Marker-Klick, Bottom-Sheet und Profil-Oeffnen unveraendert
  funktionieren.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale visuelle Wirkung muss manuell im Browser
gegengesehen werden.
