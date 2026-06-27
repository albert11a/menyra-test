Status: CURRENT
Last updated: 2026-06-27

# Schritt 137 - Shopping Produktkachel ohne Press-Effekt

## Schritt

Auf Nutzerwunsch wurde bei den kleinen Produktkacheln innerhalb der Shopping-
Cards der sichtbare Press-/Focus-Effekt entfernt.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  entfernt bei Shopping-Produktkacheln `active:scale-95`, den Hover-Border-
  Wechsel und die allgemeine Transition.
- Der Browser-Focus-Outline und Mobile-Tap-Highlight werden fuer diese kleinen
  Produktbuttons unterdrueckt.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-06-27-shopping-product-tile-no-press-01`.
- Das Menyra-Social-Bundle wurde neu gebaut; dadurch wurde der Marketplace-
  Chunk mit neuem Hash erzeugt.

## Bewusst Nicht Geaendert

- Keine Aenderung am Produktdetail-Modal, an Produktdaten, Shop-Oeffnung,
  Shopping-Suche, Cart, Checkout, Orders, QR oder Routing.
- Keine Aenderung an Restaurants, Travel, Feed, Firebase Rules, Functions oder
  Infrastruktur.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex; der Nutzer testet
  manuell.

## Technische Pruefung

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`:
  bestanden.
- `npm run build:menyra-social:bundle`: bestanden.
- `npm run check:social-bundle`: nicht bestanden, weil der bestehende
  `entry/social-app.js` weiter ueber dem gesetzten Budget liegt
  (`1.119.997` raw / `303.682` gzip Bytes gegen `1.052.000` raw /
  `285.000` gzip Bytes).

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Mit `?debug-build=1` pruefen, dass
   `2026-06-27-shopping-product-tile-no-press-01` aktiv ist.
3. Den Tab `Shopping` oeffnen.
4. In einer Shopping-Card den Produktstreifen horizontal sliden.
5. Eine Produktkachel antippen: sie soll nicht mehr kleiner werden und keinen
   sichtbaren Rahmen behalten.
6. Das Produktdetail-Modal soll weiterhin normal oeffnen.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Die Aenderung ist auf die kleinen
Shopping-Produktbuttons begrenzt.
