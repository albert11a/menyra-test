Status: CURRENT
Last updated: 2026-06-27

# Schritt 136 - Shopping Brand Intro Card Fixed Shop

## Schritt

Auf Nutzerwunsch wurde die Shopping-Brand-Intro-Card so korrigiert, dass nur
der obere Kategorie-Text dynamisch wechselt und `SHOP` als feste zweite Zeile
stehen bleibt.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  zeigt die dynamischen Kategorien jetzt oben in Grossbuchstaben.
- `SHOP` ist eine feste zweite Zeile, bleibt sichtbar und ist bold.
- Die Animation rotiert nur noch die obere Kategorie-Zeile:
  `FASHION`, `BEAUTY`, `SNEAKER`, `BABY`, `HOME`, `GROCERY`, `ELECTRONICS`
  und `LOCAL`.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-06-27-shopping-brand-intro-card-04`.
- Das Menyra-Social-Bundle wurde neu gebaut; dadurch wurde der Marketplace-
  Chunk mit neuem Hash erzeugt.

## Bewusst Nicht Geaendert

- Keine Aenderung an Shopping-Produktlogik, Product-Modal, Search-Handling,
  Shop-Editor, Cart, Checkout, Orders, QR oder Routing.
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
   `2026-06-27-shopping-brand-intro-card-04` aktiv ist.
3. Den Tab `Shopping` oeffnen.
4. Die obere Zeile der Brand-Intro-Card soll dynamisch in Grossbuchstaben
   wechseln.
5. `SHOP` soll darunter dauerhaft sichtbar bleiben und bold wirken.
6. Eine Shopping-Card, eine Produktkachel und die Shopping-Suche kurz
   gegenpruefen.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Die Aenderung ist eine reine sichtbare
Feinjustierung der bereits freigegebenen Shopping-Intro-Card.
