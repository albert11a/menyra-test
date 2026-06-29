Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Launch Readiness Report

## Entscheidung

- Grosslaunch bereit: Nein
- Score: 42/100
- Grund: Es gibt gruene Runtime-Tests und einen erfolgreichen Build, aber offene P0-Security-Risiken bei Orders und Countern sowie nicht bestandene QR/Menu/Cart-Verifikation.

## Was bereits gefixt wurde

- Node-Testbruch durch absolute i18n Imports.
- Public-Business-Posts Dedupe/Deadline Timing.
- Lokale Guest-Runner QR-URL.

## Tests jetzt gruen

- `node --test tests\\*.test.mjs`: 84/84 bestanden.
- `npm run build`: bestanden.
- `npm run analyze:public-profile-split`: bestanden.

## Tests fehlgeschlagen

- `npm run check:social-bundle`: fehlgeschlagen, Social Entry ueber Budget.
- Lokaler Guest-Pack nach Harness-Fix: fehlgeschlagen, Menu nur 2/27 Produkte, Cart nicht vorbereitbar.

## Offene P0 Punkte

1. Order-Erstellung vertraut Client-Preisen, Totals und Status.
2. Social/Follower-Counter sind clientseitig manipulierbar.

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

## Braucht echtes Staging

- QR-Order Submit.
- Waiter sieht Order und aendert Status.
- Business Login und Business Post.
- Upload/Media.
- User A/B Account-Wechsel.
- Staff/Owner/CEO Admin Flows.
- Slow Network / Mobile Visual Stability fuer echte Daten.

## Naechste konkrete Schritte

1. Staging/Emulator mit Seed-Daten einrichten.
2. Order-Create Contract und Cloud Function bauen.
3. Firestore Rules fuer Orders und Counter haerten.
4. Rules/Function Emulator Tests ergaenzen.
5. QR/Menu/Cart Guest-Pack gegen Staging gruen bekommen.
6. Account-Wechsel A/B/Business/Staff/Waiter/Owner/CEO automatisiert testen.
7. Bundle Budget nach gruenem QR/Menu gezielt senken.
8. SEO/robots/sitemap/favicon/OG/canonical finalisieren.
9. Launch-Rehearsal mit Staging-Daten und manueller Abnahme.

