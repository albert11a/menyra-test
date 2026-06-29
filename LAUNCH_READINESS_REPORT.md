Status: CURRENT
Branch: main
Stand: 2026-06-29

# Launch Readiness Report

## Entscheidung

- Grosslaunch bereit: Nein
- Score: 58/100
- Grund: Es gibt gruene Runtime-Tests, einen erfolgreichen Build, erfolgreiche Vercel-Deployments fuer `main`, eine live deployte Order-Callable-Function und live deployte Firestore-Rules. Grosslaunch bleibt blockiert durch offenen Counter-P0, fehlende echte Rollen-/Staging-E2E-Verifikation fuer QR/Waiter und nicht bestandene QR/Menu/Cart-Verifikation.

## Was bereits gefixt wurde

- Node-Testbruch durch absolute i18n Imports.
- Public-Business-Posts Dedupe/Deadline Timing.
- Lokale Guest-Runner QR-URL.
- Order-Erstellung auf Callable `createRestaurantOrder` migriert; direkte Firestore-Order-Creates gesperrt; Preise/Totals werden serverseitig aus Menu-Daten berechnet.
- Production-Rollout am 2026-06-29: Function `createRestaurantOrder` deployed, `main` auf GitHub gepusht, zwei Vercel-Deployments fuer Commit `575bd7b6` erfolgreich, danach Firestore-Rules deployed.

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
2. Order-Security braucht noch echte QR-Checkout-, Mirror- und Waiter-Verifikation mit Testdaten; Code, Function und Rules sind live, aber keine produktiven Schreibtests wurden ausgefuehrt.

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

1. Staging/Emulator mit Seed-Restaurant, Menu, QR-Tischen und Rollen anlegen.
2. QR-Checkout gegen Testdaten senden und Restaurant-Order, User/Guest-Mirror, OrderLookup und Waiter-Ansicht pruefen.
3. Firestore Rules Emulator-Tests fuer direkte Order-Creates und Manipulationsversuche ergaenzen.
4. Counter Rules/Functions haerten.
5. Rules/Function Emulator Tests ergaenzen.
6. QR/Menu/Cart Guest-Pack gegen Staging gruen bekommen.
7. Account-Wechsel A/B/Business/Staff/Waiter/Owner/CEO automatisiert testen.
8. Bundle Budget nach gruenem QR/Menu gezielt senken.
9. SEO/robots/sitemap/favicon/OG/canonical finalisieren.
10. Launch-Rehearsal mit Staging-Daten und manueller Abnahme.
