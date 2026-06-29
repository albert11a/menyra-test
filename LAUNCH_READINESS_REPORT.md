Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Launch Readiness Report

## Entscheidung

- Grosslaunch bereit: Nein
- Score: 52/100
- Grund: Es gibt gruene Runtime-Tests, einen erfolgreichen Build und einen code-seitigen Order-Security-Fix. Grosslaunch bleibt blockiert durch offenen Counter-P0, fehlende Staging/Emulator-Verifikation fuer Orders/QR/Waiter und nicht bestandene QR/Menu/Cart-Verifikation.

## Was bereits gefixt wurde

- Node-Testbruch durch absolute i18n Imports.
- Public-Business-Posts Dedupe/Deadline Timing.
- Lokale Guest-Runner QR-URL.
- Order-Erstellung auf Callable `createRestaurantOrder` migriert; direkte Firestore-Order-Creates gesperrt; Preise/Totals werden serverseitig aus Menu-Daten berechnet.

## Tests jetzt gruen

- `node --test tests\\*.test.mjs`: 90/90 bestanden.
- `node --test tests\\orders-secure-checkout.test.mjs`: 5/5 bestanden.
- `node --test tests\\profile-open-flow-utils.test.mjs tests\\orders-secure-checkout.test.mjs`: 8/8 bestanden.
- `node -c functions\\order-security.js; node -c functions\\index.js`: bestanden.
- `npm run build`: bestanden.
- `npm run analyze:public-profile-split`: bestanden.

## Tests fehlgeschlagen

- `npm run check:social-bundle`: fehlgeschlagen, Social Entry ueber Budget.
- Lokaler Guest-Pack nach Harness-Fix: fehlgeschlagen, Menu nur 2/27 Produkte, Cart nicht vorbereitbar.

## Offene P0 Punkte

1. Social/Follower-Counter sind clientseitig manipulierbar.
2. Order-Security braucht noch Staging/Emulator-Deploy-Verifikation fuer QR-Checkout, Mirror und Waiter-Ansicht.

## Offene P1 Punkte

- QR/Menu/Cart lokal nicht gruen.
- Kein Staging/Emulator sichtbar.
- Kein echter Account-Wechsel-Test fuer User A/B/Business/Staff/Waiter/Owner/CEO.
- Bundle Budget ueberschritten.
- SEO/Launch-Dateien fehlen oder sind unvollstaendig.
- Upload-, Waiter-, Staff-, Owner-, CEO-Flows nicht mit Testdaten verifiziert.

## Nur simuliert/statisch getestet

- Auth Startup und Account Reset.
- Public route resolver.
- Public menu no-hang.
- Profile/menu focus runtime.
- Staff/business read loader.
- Order Security.
- Firestore Rules.
- Order Callable Contract.

## Braucht echtes Staging

- QR-Order Submit.
- Waiter sieht Order und aendert Status.
- Business Login und Business Post.
- Upload/Media.
- User A/B Account-Wechsel.
- Staff/Owner/CEO Admin Flows.
- Slow Network / Mobile Visual Stability fuer echte Daten.

## Naechste konkrete Schritte

1. Functions und Firestore Rules in Staging/Emulator deployen.
2. Seed-Restaurant mit Menu, QR-Tischen und Rollen anlegen.
3. QR-Checkout senden und Restaurant-Order, User/Guest-Mirror, OrderLookup und Waiter-Ansicht pruefen.
4. Counter Rules/Functions haerten.
5. Rules/Function Emulator Tests ergaenzen.
6. QR/Menu/Cart Guest-Pack gegen Staging gruen bekommen.
7. Account-Wechsel A/B/Business/Staff/Waiter/Owner/CEO automatisiert testen.
8. Bundle Budget nach gruenem QR/Menu gezielt senken.
9. SEO/robots/sitemap/favicon/OG/canonical finalisieren.
10. Launch-Rehearsal mit Staging-Daten und manueller Abnahme.
