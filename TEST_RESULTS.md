Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Test Results

## Git und Setup

- Startzustand: `main`, sauber.
- Neue Branch erstellt: `launchready2027`.
- `node --version`: `v24.12.0`.
- `npm --version`: `11.6.2`.
- `node_modules`: vorhanden.
- `functions/node_modules`: vorhanden.
- `tests/mnyra-heart-runner/node_modules`: vorhanden.
- `package-lock.json` im Root: nicht vorhanden.

## Ausgefuehrte Checks

| Befehl | Ergebnis | Bewertung |
|---|---:|---|
| `npm ls --depth=0` | ok, `vite@7.3.2` | bestanden |
| `node --test tests\\*.test.mjs` vor Fix | 77 pass / 3 fail | fehlgeschlagen |
| `node --test tests\\*.test.mjs` nach Fix | 84 pass / 0 fail | bestanden |
| `node --test tests\\orders-secure-checkout.test.mjs` nach Order-Security-Fix | 5 pass / 0 fail | bestanden |
| `node -c functions\\order-security.js; node -c functions\\index.js` | ok | bestanden |
| `node --test tests\\*.test.mjs` nach Order-Security-Fix | 89 pass / 0 fail | bestanden |
| `node --test tests\\profile-open-flow-utils.test.mjs tests\\orders-secure-checkout.test.mjs` nach Checkout-Runtime-Fix | 8 pass / 0 fail | bestanden |
| `node --test tests\\*.test.mjs` nach Checkout-Runtime-Fix | 90 pass / 0 fail | bestanden |
| `npm run build` | erfolgreich | bestanden |
| `npm run check:social-bundle` | Exit 1 | fehlgeschlagen |
| `npm run analyze:public-profile-split` | status ok | bestanden |
| Lokaler Static-Server `dist` + Guest-Pack vor Harness-Fix | Exit 1 | fehlgeschlagen, falsche lokale QR-URL |
| Lokaler Static-Server `dist` + Guest-Pack nach Harness-Fix | Exit 1 | fehlgeschlagen, Menu nur 2/27 Produkte, Cart nicht vorbereitbar |

## Urspruengliche Testfehler und Fixes

1. `tests/app-shell-image-reveal.test.mjs` und `tests/auth-shell-chrome-sync.test.mjs`
   - Ursache: Browser-absoluter Import `/shared/i18n/i18n.js` wurde im Node-Testprozess auf Windows als `C:\\shared\\...` aufgeloest.
   - Fix: relative Imports in `app-shell-runtime-controller.js` und `shell-dom-runtime-controller.js`.

2. `tests/public-profile-runtime-controller.test.mjs`
   - Ursache: `runPublicProfileLoadWithDeadline()` startete Tasks erst im naechsten Microtask. Der Dedupe-Test erwartete, dass der erste initiale Read sofort registriert wird.
   - Fix: Deadline-Wrapper startet die Task synchron und faengt sync Exceptions trotzdem als Promise-Rejection.

## Build

- Vite Build: erfolgreich.
- Static Output nach `dist`: erzeugt.
- Wichtige Build-Groessen:
  - `apps/menyra-social/bundled/entry/social-app.js`: 1,121.22 kB raw / 304.06 kB gzip.
  - `vendor-firebase`: 452.94 kB raw / 136.46 kB gzip.
- Vite warnte vor Chunks ueber 500 kB.

## Bundle Budget

`npm run check:social-bundle`:

- `socialEntry.rawBytes` nach lokalem Emulator-Gate: 1,121,224, Budget 1,052,000.
- `socialEntry.gzipBytes`: 304,055, Budget 285,000.
- `publicEntry.gzipBytes`: 656.
- Status: fehlgeschlagen.

## Order-Security Regression

- Client-Checkout sendet nur noch Order Intent: `restaurantId`, Tisch/Kontakt, `itemId`, Menge, Optionen, Kommentar und Guest-Session.
- Client-Checkout sendet keine `price`, `name`, `imageUrl`, `total`, `status`, `buyerUid` oder `guestLookupToken` mehr.
- Server-Helper berechnet `total` aus Menu-Daten und ignoriert manipulierte Client-Preise/Totals.
- Server-Helper lehnt versteckte/nicht verfuegbare Menu-Items ab.
- Server-Helper lehnt spoofed `buyerUid` ab.
- Firestore Rules enthalten fuer `restaurants/{restaurantId}/orders` jetzt `allow create: if false`.

## Lokaler Guest/QR-Runner

Server:

- Python Static Server auf `127.0.0.1:4173` gegen `dist`.
- `/apps/menyra-social/`: HTTP 200.
- `/feed`: HTTP 404 im Python-Static-Server, weil Vercel-Rewrites nicht simuliert werden.

Runner:

- Artifact nach Harness-Fix: `tests/mnyra-heart-runner/artifacts/guest-pack-20260629053303`.
- Status: failed.
- Navigation: HTTP 200, finale URL `http://127.0.0.1:4173/apps/menyra-social/index.html?tab=menu&src=qr&r=10Z8UNFsx4ha5wnZIloy&table=1`.
- Console Errors: 0.
- Console Warnings: 1.
- Menu sichtbar: ja, 2158 ms.
- Menu Deep Scan: 2 Produkte erkannt, erwartet 27.
- Cart: fehlgeschlagen, Runner konnte keinen Artikel fuer Warenkorb vorbereiten.
- Orders: ohne Live-Mutations-Flag nicht gesendet.

## Nicht ausgefuehrt

- Keine destruktiven Production-Tests.
- Keine echten Order-Schreibtests.
- Keine Login-Rollenlaeufe fuer User A/B/Business/Staff/Waiter/Owner/CEO mangels Staging-Credentials.
- Keine Firestore Rules Emulator-Tests; Emulator-Konfig fehlt.
- Keine Upload-Tests mit echten Dateien/Credentials.
