Status: CURRENT
Branch: main
Stand: 2026-06-29

# Regression Test Plan

## Automatisierte Mindest-Gates pro Schritt

1. `node --test tests\\*.test.mjs`
2. `npm run build`
3. `npm run check:social-bundle`
4. Firestore Emulator Rules Tests, sobald Emulator vorhanden ist.
5. Guest-Pack gegen lokalen/Staging-QR ohne Live-Mutations.
6. Mutation-Pack nur gegen Emulator/Staging mit Isolation Key.

## P0 Regression Tests

### Orders

- Vorhanden: Client-Checkout sendet keine Preise/Totals/Status/Namen/Bilder.
- Vorhanden: Function-Helper berechnet `total` aus Menu-Daten.
- Vorhanden: Function-Helper lehnt versteckte/nicht verfuegbare Items ab.
- Vorhanden: Function-Helper lehnt spoofed `buyerUid` ab.
- Vorhanden: statischer Rules-Test fuer direkte Order-Create-Sperre.
- Offen: Firestore Emulator bestaetigt, dass Guest keine direkte Order mit `total: 0` schreiben kann.
- Offen: Guest kann keinen fremden `restaurantId` schreiben.
- Offen: Client kann `status` nicht auf `Fertig`/`Bezahlt` setzen.
- Waiter darf Status nur in erlaubter Richtung aendern.
- Owner/CEO darf lesen; normaler fremder User darf nicht listen.

### Counters

- User kann `likesCount` nicht direkt setzen.
- User kann `followersCount` nicht direkt setzen.
- Like Create erzeugt genau einen Like pro UID.
- Like Delete reduziert serverseitig genau einmal.
- Comment Count folgt Comment-Dokumenten.

### Account-Wechsel

- User A login, Avatar/Name/Header prüfen.
- Logout, User B login, nie User-A-Daten sichtbar.
- Browser Back nach Logout zeigt keine User-A-Daten.
- Business Login zeigt keine normalen User-Posts/Carts/Headers.
- Staff/Waiter/Owner/CEO danach ohne Reststate.

## Public/QR/Menu Regression Tests

- Public Slug Direktaufruf.
- Public Slug Refresh.
- Public Menu Direktaufruf.
- QR mit Table-Kontext.
- Refresh mit Table-Kontext.
- Produktmodal oeffnen/schliessen.
- Cart Menge aendern.
- Checkout nur Staging/Emulator senden.
- Waiter sieht Staging/Emulator Order.

## Visual Regression

- Screenshot-Serie fuer `/`, `/feed`, `/profile`, `/menu`, `/orders`, `/notifications`, `/settings`, `/upload`, `/owner`, `/staff`, `/kitchen`, `/waiter`, `/heart`, Public Slug, Public Menu, QR Menu, Product Modal, Cart, Login/Register.
- Assertions:
  - keine falschen Account-Daten,
  - keine falschen Restaurant-Daten,
  - keine falschen Bilder vor richtigen Bildern,
  - keine dauerhaften Loading States,
  - keine blank screens.

## Manual Testliste nach jedem Schritt

1. App hart neu laden.
2. Public Restaurant oeffnen.
3. QR/Menu mit Table oeffnen.
4. Produkt oeffnen.
5. Cart pruefen.
6. Login/Logout pruefen.
7. Business/Profile/Menu pruefen.
8. Waiter/Orders pruefen, falls Staging-Daten vorhanden.
