Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Fixes Applied

## Fix 1: Node-kompatible i18n Imports

- Dateien:
  - `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
  - `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- Problem: Browser-absoluter Import `/shared/i18n/i18n.js` brach Node-Tests auf Windows.
- Aenderung: Import auf relativen Pfad `../../../../shared/i18n/i18n.js` geaendert.
- Risiko: niedrig; Browser-Aufloesung bleibt aequivalent, Node-Tests funktionieren.
- Verifikation: `node --test tests\\*.test.mjs` gruen.

## Fix 2: Deadline-Wrapper startet Public-Profile Tasks sofort

- Datei: `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- Problem: Public Business Posts initial read wurde erst im Microtask gestartet, wodurch concurrent visible reads nicht sofort dedupliziert wurden.
- Aenderung: `runPublicProfileLoadWithDeadline()` ruft die Task synchron auf und wrappt Exceptions in Promise-Rejections.
- Risiko: niedrig/mittel; Timing wird deterministischer, vorhandene Tests decken den betroffenen Flow ab.
- Verifikation: `public business posts initial page dedupes concurrent visible reads` gruen; gesamte Node-Test-Suite gruen.

## Fix 3: Lokale Guest-Runner QR-URL korrigiert

- Datei: `tests/mnyra-heart-runner/config/local-guest-config.json`
- Problem: URL `/apps/menyra-social/?...` wurde vom App-Router als Slug `menyra-social` interpretiert.
- Aenderung: URL auf `/apps/menyra-social/index.html?...` gesetzt.
- Risiko: niedrig; nur lokaler Test-Harness.
- Verifikation: Guest-Pack blieb danach auf korrekter URL und erkannte Menu sichtbar statt falscher Landing/0 Produkte.
- Restfehler: Guest-Pack erkennt nur 2/27 Produkte und Cart scheitert.

## Fix 4: Order-Erstellung serverseitig abgesichert

- Dateien:
  - `functions/order-security.js`
  - `functions/index.js`
  - `firestore.rules`
  - `apps/menyra-social/social-app.js`
  - `apps/menyra-social/core/app-shell/public-route-runtime-cluster.js`
  - `apps/menyra-social/core/orders/orders-runtime-controller.js`
  - `tests/orders-secure-checkout.test.mjs`
- Problem: QR/Checkout konnte Orders direkt aus dem Browser mit eigenen `items[].price`, `total`, `status`, Buyer- und Meta-Feldern in Firestore schreiben.
- Aenderung: Checkout nutzt jetzt Callable `createRestaurantOrder`; die Function liest Restaurant/Menu serverseitig, validiert Item-IDs/Optionen, berechnet `total`/`totalCents`, setzt Initialstatus `Neu` und erzeugt Guest-Lookup-Token serverseitig. Direkte Client-Creates auf `restaurants/{restaurantId}/orders` sind in `firestore.rules` gesperrt.
- Risiko: mittel; erfordert Deploy von Functions und Rules. Lokale Checkout-Mutation ohne Functions Emulator ist danach bewusst nicht mehr moeglich.
- Verifikation:
  - `node --test tests\\orders-secure-checkout.test.mjs` gruen.
  - `node --test tests\\*.test.mjs` gruen: 89/89.
  - `node -c functions\\order-security.js; node -c functions\\index.js` gruen.
  - `npm run build` gruen.
- Restrisiko: echter QR-Checkout, Order-Mirror und Waiter-Status muessen noch gegen Staging/Emulator mit deployter Function und Rules validiert werden.

## Fix 5: Lokaler Checkout-Crash nach Order-Security-Fix

- Dateien:
  - `apps/menyra-social/social-app.js`
  - `apps/menyra-social/core/profile/profile-open-flow-utils.js`
  - `firebase.json`
  - `tests/profile-open-flow-utils.test.mjs`
- Problem 1: Der lokale/bundled Checkout lud Firebase Functions ueber einen Variablen-Dynamic-Import aus `/shared/vendor/...`; dadurch lief Functions in einem anderen Firebase-App-Komponentenkontext und `getFunctions(app)` warf `Service functions is not available`.
- Aenderung 1: Functions wird jetzt per statisch analysierbarem Dynamic Import geladen, sodass Vite es in den bestehenden `vendor-firebase`-Chunk bundelt.
- Problem 2: Im Public-Business-Open-Flow konnte der Catch-Pfad `routeSnapshotRestaurantId` referenzieren, obwohl die Variable nur im `try`-Block deklariert war.
- Aenderung 2: `routeSnapshotRestaurantId` wird im aeusseren Funktionsscope initialisiert und im `try` nur gesetzt.
- Problem 3: Lokaler Checkout von `localhost`/LAN-IP fiel gegen Production-Functions in CORS, statt lokal sicher ueber Emulator/Staging zu laufen.
- Aenderung 3: Lokale Origins verbinden Firebase Functions automatisch mit dem Functions Emulator auf demselben Host, Port `5001`; `firebase.json` enthaelt jetzt Emulator-Ports fuer Functions, Firestore, Auth und UI.
- Verifikation:
  - `node --test tests\\profile-open-flow-utils.test.mjs tests\\orders-secure-checkout.test.mjs` gruen.
  - `node --test tests\\*.test.mjs` gruen: 90/90.
  - `npm run build` gruen.
- Restrisiko: Lokal funktioniert ein echter Order-Submit nur mit laufendem Functions/Firestore Emulator und passenden Seed-Daten. Ohne Emulator kommt ein lokaler Verbindungsfehler; das ist sicherer als ein Production-CORS-Versuch.

## Nicht gefixt in diesem Schritt

- Staging-/Emulator-E2E fuer Order Security.
- P0 Counter Security.
- P1 Bundle Budget.
- P1 SEO/Launch-Dateien.
- P1 Staging/Emulator-Konfiguration.
- P1 QR/Menu Produktvollstaendigkeit und Cart-Runner-Fehler.
