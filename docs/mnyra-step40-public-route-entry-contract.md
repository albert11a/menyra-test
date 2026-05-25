# Mnyra Schritt 40 - Public Route Entry Contract und Bundle Guard

Status: umgesetzt
Branch: `refactorapp`

## Ziel

Den naechsten website-first Schritt stabil vorbereiten, ohne Public Profile,
Public Menu, QR, Cart, Order oder sichtbare UI zu veraendern.

## Umsetzung

- Der Public-Route-Vertrag fuer `/casarita`, `/casarita/menu` und QR-/Tisch-
  Kontext wurde in `audit/mnyra-public-route-entry-contract.json`
  dokumentiert.
- Der gebuendelte Public Entry laedt die bestehende Social App weiter, wartet
  aber nicht mehr per Top-Level-`await` auf den kompletten App-Import.
- Die Raw- und Bundled-Public-Entry-Strategie sind dadurch angeglichen:
  Der bestehende volle Runtime-Pfad bleibt erhalten, aber die Public-Entry-
  Evaluation wird nicht mehr kuenstlich an `social-app.js` gebunden.
- `scripts/check-mnyra-social-bundle-budget.mjs` schuetzt den Stand aus
  Schritt 39 gegen Rueckfall:
  `social-app.js` darf nicht ueber das aktuelle Budget wachsen und bereits
  ausgelagerte Module duerfen nicht wieder statisch werden.

## Ergebnis

- `entry/social-public-entry.js`: 1,182 Bytes raw / 632 Bytes gzip.
- `entry/social-app.js`: 1,226,239 Bytes raw / 330,087 Bytes gzip.
- `vendor-firebase-DJXW8jPP.js`: 441,937 Bytes raw / 132,592 Bytes gzip.
- Neuer Check: `npm run check:social-bundle`.

## Bewusst nicht geaendert

- Kein eigener neuer Public Renderer.
- Kein Entfernen des bestehenden `social-app.js`-Fallbacks.
- Keine UI-/Design-Aenderung.
- Keine Route geaendert.
- Keine Firebase-Pfade, Queries oder Payloads geaendert.
- Keine DOM-IDs oder CSS-Klassen geaendert.
- Public Menu, Produktdetail, Cart, Checkout/Order und QR/Tisch-Kontext
  bleiben unveraendert.
- Heart, `/staff`, businessAccounts und Waiter/Kitchen bleiben unveraendert.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist bewusst konservativ: Er macht `social-app.js` noch nicht aus
dem Public-Startpfad weg, verhindert aber Rueckfaelle und haelt den naechsten
echten Public-Renderer-Schnitt vertraglich sauber vorbereitet.

## Manuelle Testliste

- `/feed` oeffnet wie vorher.
- `/casarita` funktioniert.
- `/casarita/menu` funktioniert.
- Produktdetail oeffnet/schliesst.
- Cart funktioniert.
- Order Send funktioniert.
- QR-/Tisch-Kontext bleibt erhalten.
- Public Profile Interaktionen funktionieren.
- Keine roten Console-Errors.
