# Mnyra Schritt 39 - Profile/Open und Chat Boundary Bundle Cut

Status: umgesetzt
Branch: `refactorapp`

## Ziel

Den Social-Main-Entry messbar verkleinern, ohne sichtbare UI, Routing,
Firebase-Pfade, Public Menu, Warenkorb, Orders, Heart, `/staff`,
businessAccounts oder Waiter/Kitchen zu veraendern.

## Umsetzung

- `profile-open-flow-utils.js` wird nicht mehr statisch ueber
  `app-controller-bridge.js` in den Main Entry gezogen.
- Der bestehende Profile-Open-Flow bleibt Source of Truth und wird ueber einen
  gecachten Dynamic Import geladen, sobald ein Profil-/Business-Open-Flow
  wirklich benutzt wird.
- Die Chat-V1-Lazy-Fassade wird nicht mehr statisch aus `social-app.js`
  importiert.
- Eine kleine Chat-Runtime-Boundary haelt das bestehende Disabled-Verhalten fuer
  Chat V1 und laedt die bestehende Fassade erst bei echten Chat-/Notification-/
  Follow-Interaktionen.

## Ergebnis

- Vorheriger Entry `social-app.js`: 1,270,944 Bytes raw / 341,603 Bytes gzip.
- Neuer Entry `social-app.js`: 1,226,239 Bytes raw / 330,087 Bytes gzip.
- Reduktion: 44,705 Bytes raw / 11,516 Bytes gzip.

Neue Lazy Chunks:

- `profile-open-flow-utils-DcmS7U2T.js`: 26,142 Bytes raw / 7,535 Bytes gzip.
- `chat-app-runtime-lazy-facade-CNA8_AY7.js`: 26,741 Bytes raw / 7,848 Bytes gzip.

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine Route geaendert.
- Keine Firebase-Pfade, Queries oder Payloads geaendert.
- Keine DOM-IDs oder CSS-Klassen geaendert.
- Feed-First-Paint bleibt unveraendert.
- Public Menu, Produktdetail, Cart und Order bleiben unveraendert.
- Heart, `/leads`, `/customers`, `/admin/staff` bleiben unveraendert.
- `/staff`, businessAccounts und Waiter/Kitchen bleiben unveraendert.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Das Restrisiko liegt in der bewusst eingefuehrten ersten Lazy-Ladung beim
ersten Profil-Open-Flow bzw. bei Chat-/Notification-/Follow-Interaktionen.
Die fachliche Runtime-Logik bleibt in den bestehenden Modulen.

## Manuelle Testliste

- `/feed` oeffnet wie vorher.
- Feed-Karten und Interaktionen funktionieren.
- Profil/Business aus Feed oeffnen.
- Profil/Business aus Search oeffnen.
- Profil/Business aus Map oeffnen.
- Public Profile oeffnet wie vorher.
- `/casarita` funktioniert.
- `/casarita/menu` funktioniert.
- Produktdetail oeffnet/schliesst.
- Cart funktioniert.
- Order Send funktioniert.
- `/leads`, `/customers`, `/admin/staff` oeffnen Heart.
- `/staff`, businessAccounts und Waiter/Kitchen unveraendert.
- Keine roten Console-Errors.
