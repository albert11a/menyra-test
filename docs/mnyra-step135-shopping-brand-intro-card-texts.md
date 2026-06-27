Status: CURRENT
Last updated: 2026-06-27

# Schritt 135 - Shopping Brand Intro Card Texte

## Schritt

Auf Nutzerwunsch wurde die Shopping-Brand-Intro-Card etwas vertikal vergroessert
und die dynamischen Texte wurden auf konkrete Shop-Kategorien umgestellt.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  setzt die Intro-Card jetzt etwas hoeher.
- Die Textanimation zeigt jetzt zweizeilige Kategorie-/Shop-Paare:
  `Fashion / Shop`, `Beauty / Shop`, `Sneaker / Shop`, `Baby / Shop`,
  `Home / Shop`, `Grocery / Shop`, `Electronics / Shop` und `Local / Shop`.
- Die Animation wurde von drei auf acht Slides erweitert.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-06-27-shopping-brand-intro-card-03`.
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
  (`1.119.997` raw / `303.678` gzip Bytes gegen `1.052.000` raw /
  `285.000` gzip Bytes).

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Mit `?debug-build=1` pruefen, dass
   `2026-06-27-shopping-brand-intro-card-03` aktiv ist.
3. Den Tab `Shopping` oeffnen.
4. Die Brand-Intro-Card rechts oben soll etwas hoeher als zuvor wirken.
5. Die Animation soll die Shop-Texte als zwei Zeilen zeigen, jeweils Kategorie
   oben und `Shop` darunter.
6. Eine Shopping-Card, eine Produktkachel und die Shopping-Suche kurz
   gegenpruefen.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Die Aenderung ist eine reine sichtbare
Feinjustierung der bereits freigegebenen Shopping-Intro-Card.
