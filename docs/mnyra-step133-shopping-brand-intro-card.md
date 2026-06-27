Status: CURRENT
Last updated: 2026-06-27

# Schritt 133 - Shopping Brand Intro Card

## Schritt

Auf Nutzerwunsch wurde Branch `shopping2` auf Main-Stand erstellt und im
Shopping-Tab rechts am Anfang der zweiten Spalte eine kleine Brand-Intro-Card
ergaenzt.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  rendert im Shopping-Grid rechts oben eine kompakte, gerundete Intro-Card.
- Die Card nutzt eine frische Mint-Farbe und eine Gate-aehnliche Textanimation.
- Die obere Zeile wechselt dynamisch zwischen `FIND YOUR`, `BUY YOUR` und
  `STYLE YOUR`; darunter bleibt `Brand` fest sichtbar.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-06-27-shopping-brand-intro-card-01`.
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
   `2026-06-27-shopping-brand-intro-card-01` aktiv ist.
3. Den Tab `Shopping` oeffnen.
4. Rechts am Anfang der zweiten Spalte soll die neue mintfarbene Card mit
   gerundeten Ecken sichtbar sein.
5. Pruefen, dass die obere Zeile dynamisch `FIND YOUR`, `BUY YOUR` und
   `STYLE YOUR` zeigt und darunter `Brand` stehen bleibt.
6. Eine Shopping-Card und Produktkachel antippen; das bestehende Shop-/Produkt-
   Verhalten soll unveraendert bleiben.
7. Shopping-Suche kurz oeffnen und schliessen; die bestehenden Shop-Cards sollen
   weiterhin wie bisher filterbar sein.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Die sichtbare Aenderung ist bewusst auf den
Shopping-Tab begrenzt. Rest-Risiko bleibt bei der manuellen Sichtpruefung auf
echten Mobile-Breiten, weil Codex gemaess Repo-Regel keine Smoke-/Playwright-
Laeufe ausfuehrt.
