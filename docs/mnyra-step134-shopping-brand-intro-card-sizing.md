Status: CURRENT
Last updated: 2026-06-27

# Schritt 134 - Shopping Brand Intro Card Groesse

## Schritt

Auf Nutzerwunsch wurde die in Schritt 133 ergaenzte Shopping-Brand-Intro-Card
visuell nachjustiert.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  setzt die Intro-Card jetzt auf volle Spaltenbreite wie die anderen Shopping-
  Cards.
- Die rechte Spalte startet fuer diese Intro-Card ohne oberen Versatz, sodass
  sie oben mit der ersten linken Shopping-Card beginnt.
- Die Hintergrundfarbe wurde von leuchtendem Mint auf ein ruhigeres Teal
  geaendert.
- Die Headline-Schrift wurde naeher an die Feed-/Restaurant-Gate-Headline
  angepasst: sehr fett, grosse Headline-Groesse und ruhige Zeilenhoehe.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-06-27-shopping-brand-intro-card-02`.
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
  (`1.119.997` raw / `303.679` gzip Bytes gegen `1.052.000` raw /
  `285.000` gzip Bytes).

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Mit `?debug-build=1` pruefen, dass
   `2026-06-27-shopping-brand-intro-card-02` aktiv ist.
3. Den Tab `Shopping` oeffnen.
4. Rechts oben soll die Brand-Intro-Card dieselbe Spaltenbreite wie die anderen
   Shopping-Cards haben.
5. Die Intro-Card soll oben auf gleicher Hoehe wie die erste linke Card starten.
6. Farbe und Schrift sollen ruhiger und naeher am Feed-/Restaurant-Gate wirken.
7. Eine Shopping-Card, eine Produktkachel und die Shopping-Suche kurz
   gegenpruefen.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Die Aenderung ist eine reine sichtbare
Feinjustierung der bereits freigegebenen Shopping-Intro-Card.
