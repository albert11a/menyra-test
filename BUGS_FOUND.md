Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Bugs Found

## 1. BUG-001 - Order-Preise, Totals und Status waren clientseitig manipulierbar

- Prioritaet: P0, Code-Fix umgesetzt; bleibt Launch-Gate bis Staging/Emulator gruen ist
- Bereich: Orders / Firestore Security / QR Checkout
- Was passt nicht? Vor dem Fix erlaubte `restaurants/{restaurantId}/orders` Create, wenn nur `restaurantId` und optional `buyerUid` passten. Preise, `total`, `items`, `status`, `itemCount`, Kontaktdaten und Timestamps wurden nicht gegen serverseitige Menu-Daten validiert.
- Warum passt es nicht? Ein Gast oder eingeloggter User kann einen manipulierten Order-Payload direkt an Firestore senden.
- Reproduktion vor Fix: statisch in `firestore.rules` und Client-Payload in `apps/menyra-social/core/orders/orders-runtime-controller.js`. Nach Fix ist direkte Rule-Create gesperrt und der Client sendet nur noch Order Intent an `createRestaurantOrder`.
- Erwartet: Order-Erstellung ueber Callable/HTTPS Function oder Rules mit strikt validiertem Schema; Preise/Total nur serverseitig berechnet.
- Tatsaechlich nach Fix: Client ruft Callable `createRestaurantOrder`; Function berechnet Preise/Total aus `restaurants/{restaurantId}/public/menu` und `menuItems`; Rules blockieren direkte Creates. Order-Mirror nutzt den servergeschriebenen Order-Datensatz.
- Betroffene Dateien/Funktionen: `firestore.rules`, `submitShopCheckout()`, `createRestaurantOrder`, `functions/order-security.js`, `syncOrderMirrorsOnRestaurantOrderWrite`.
- Was wurde gefixt? Ja: Server-Contract, Callable Function, Client-Migration, direkte Rule-Sperre und Regressionstest `tests/orders-secure-checkout.test.mjs`.
- Was muss noch gemacht werden? Function/Rules in Staging deployen, QR-Checkout mit Seed-Restaurant senden, `restaurants/{restaurantId}/orders`, `users/{uid}/orders`, `orderLookup` und Waiter-Ansicht verifizieren. Status-Transitions sollten als eigener Rules/Function-Test noch haerter modelliert werden.

## 2. BUG-002 - Social/Follower-Counter koennen beliebig manipuliert werden

- Prioritaet: P0
- Bereich: Social / Firestore Security / Datenintegritaet
- Was passt nicht? `socialCounterUpdateAllowed()` und `followerCounterUpdateAllowed()` pruefen nur betroffene Felder, nicht Werte, Ownership, Like-/Follow-Dokumente oder Increment-Richtung.
- Warum passt es nicht? Jeder eingeloggte User kann Counter wie `likesCount`, `commentsCount`, `followersCount`, `followingCount` direkt auf beliebige Werte setzen, sofern die betroffenen Match-Regeln greifen.
- Reproduktion: `firestore.rules` Zeilen 339-347 und Verwendungen bei User Posts, Restaurant Posts, Menu Social, Restaurants und SocialFeed.
- Erwartet: Counter werden serverseitig aus Like/Comment/Follow-Dokumenten abgeleitet oder per validierten Cloud Functions gepflegt.
- Tatsaechlich: Rules erlauben counter-only Updates fuer signierte Nutzer.
- Betroffene Dateien/Funktionen: `firestore.rules`, Social Engagement Runtime, Chat Follow Runtime.
- Was wurde gefixt? Noch nicht; Fix braucht Counter-Contract und Migration.
- Was muss noch gemacht werden? Direkte Counter-Updates sperren, Aggregation per Function/transaction, Emulator-Tests fuer Fake Counter Writes.

## 3. BUG-003 - Lokaler Guest-Runner nutzte falsche QR-URL

- Prioritaet: P1
- Bereich: Test Harness / QR / Public Menu
- Was passt nicht? `tests/mnyra-heart-runner/config/local-guest-config.json` nutzte `/apps/menyra-social/?...`. Die App interpretierte `menyra-social` als Slug/Restaurant-Kontext und normalisierte auf `/menu?r=menyra-social...`.
- Warum passt es nicht? Lokale QR-Tests testeten nicht den beabsichtigten Restaurant-Kontext.
- Reproduktion: Guest-Pack Artifact `guest-pack-20260629052936`, final URL `http://127.0.0.1:4173/menu?r=menyra-social&src=qr&table=1`.
- Erwartet: lokaler Runner oeffnet App-Einstieg und behalt `r=10Z8UNFsx4ha5wnZIloy`.
- Tatsaechlich: falscher Restaurant-Kontext, 0 Produkte.
- Betroffene Datei: `tests/mnyra-heart-runner/config/local-guest-config.json`.
- Was wurde gefixt? Ja, URL auf `/apps/menyra-social/index.html?...` geaendert.
- Was muss noch gemacht werden? Lokalen Harness spaeter mit echtem Rewrite-Server oder Vercel-Dev validieren.

## 4. BUG-004 - Lokaler QR/Menu Guest-Pack erkennt nur 2/27 Produkte und Cart scheitert

- Prioritaet: P1, P0-nahe fuer Launch falls in Staging reproduzierbar
- Bereich: Public QR/Menu/Cart
- Was passt nicht? Nach Harness-Fix ist das Menue sichtbar, aber der Runner erkennt nur 2 statt 27 erwarteter Produkte; Cart-Vorbereitung scheitert.
- Warum passt es nicht? Moegliche Ursachen: Testrestaurant/Testdaten unvollstaendig, Selector passt nicht mehr, Menu-Daten laden nur partiell, lokale Static/Rewrites unterscheiden sich von Staging, oder Product/Card-Interaktion ist instabil.
- Reproduktion: `npm run guest-pack` mit `config/local-guest-config.json` gegen lokalen `dist` Static Server. Artifact `tests/mnyra-heart-runner/artifacts/guest-pack-20260629053303`.
- Erwartet: QR/Menu zeigt komplette Produktliste, Produktdetail laesst sich oeffnen, Cart ist vorbereitbar.
- Tatsaechlich: Menu sichtbar, 2/27 Produkte, Cart failed.
- Betroffene Dateien/Funktionen: vermutlich Public Menu Runtime, Menu Renderer, Guest Runner Selectors/Testdaten; genaue Ursache nicht ohne Staging isoliert.
- Was wurde gefixt? Nur Harness-URL; Produkt-/Cart-Ursache nicht gefixt.
- Was muss noch gemacht werden? Auf Staging/Emulator mit Seed-Restaurant reproduzieren, Selector und Menu-Datenquelle pruefen, Cart-Interaktion reparieren.

## 5. BUG-005 - Node-Tests konnten Browser-absoluten i18n-Import nicht aufloesen

- Prioritaet: P1
- Bereich: Tests / Runtime Portability
- Was passt nicht? `/shared/i18n/i18n.js` wurde im Node-Testprozess als absoluter Windows-Pfad gesucht.
- Warum passt es nicht? Browser-absolute Imports sind im gebuendelten Browser ok, aber nicht direkt in Node-Tests.
- Reproduktion: initial `node --test tests\\*.test.mjs`, 2 Modulauflosungsfehler.
- Erwartet: gleiche Module sind im Browser und Node-Test importierbar.
- Tatsaechlich: `ERR_MODULE_NOT_FOUND`.
- Betroffene Dateien: `app-shell-runtime-controller.js`, `shell-dom-runtime-controller.js`.
- Was wurde gefixt? Ja, relative Imports zu `../../../../shared/i18n/i18n.js`.
- Was muss noch gemacht werden? Bei neuen Core-Modulen keine Browser-absolute Imports verwenden, wenn Node-Tests sie direkt laden.

## 6. BUG-006 - Public Business Posts Dedupe-Test startete Read zu spaet

- Prioritaet: P1
- Bereich: Public Profile / Runtime Dedupe / Tests
- Was passt nicht? Der initiale Public-Business-Posts-Read wurde durch den Deadline-Wrapper erst im Microtask gestartet; parallele sichtbare Reads waren im Test nicht sofort dedupliziert.
- Warum passt es nicht? In-Flight- und Test-Semantik erwarten, dass die Aufgabe beim Aufruf registriert wird.
- Reproduktion: initial `public business posts initial page dedupes concurrent visible reads` mit `getDocsCalls === 0`.
- Erwartet: erster Read startet sofort, zweiter bekommt gleiche Promise.
- Tatsaechlich: Read startete verzögert und lief in Timeout.
- Betroffene Datei/Funktion: `public-profile-runtime-controller.js`, `runPublicProfileLoadWithDeadline()`.
- Was wurde gefixt? Ja, Task startet synchron mit Promise-Wrapping.
- Was muss noch gemacht werden? Keine weitere Aktion; Regression-Test ist gruen.

## 7. BUG-007 - Social Hauptbundle ueberschreitet Budget

- Prioritaet: P1
- Bereich: Performance / Launch
- Was passt nicht? `apps/menyra-social/bundled/entry/social-app.js` ueberschreitet raw und gzip Budget.
- Warum passt es nicht? Public/QR und App-Start tragen weiterhin viel Social-App-Code; Analyse markiert public-profile/menu/QR Abhaengigkeiten als high-risk fuer blindes Splitting.
- Reproduktion: `npm run check:social-bundle`.
- Erwartet: raw <= 1,052,000 Bytes, gzip <= 285,000 Bytes.
- Tatsaechlich nach aktuellem Build: raw 1,121,224, gzip 304,055.
- Betroffene Dateien/Funktionen: `social-app.js` static graph, public profile/menu bootstrap/runtime.
- Was wurde gefixt? Nicht gefixt; Splitting ohne manuelle Public/QR-Regression waere riskant.
- Was muss noch gemacht werden? Nach Staging-QR/Menu gruen gezielte Split-Planung um public-profile-runtime Abhaengigkeiten.

## 8. BUG-008 - Keine getrennte Staging-/Emulator-Konfiguration sichtbar

- Prioritaet: P1
- Bereich: QA / Firebase / Launch Process
- Was passt nicht? `.firebaserc` zeigt nur Default `menyra-c0e68`; `firebase.json` hat keine Emulator-Sektion.
- Warum passt es nicht? Rollen-, Order-, Rules- und Upload-Tests koennen ohne Risiko nicht end-to-end ausgefuehrt werden.
- Reproduktion: `.firebaserc`, `firebase.json`.
- Erwartet: Staging-Projekt oder Emulator-Harness mit Seed-Daten fuer alle Rollen.
- Tatsaechlich: nur Default-Projekt sichtbar, keine Emulator-Konfig.
- Was wurde gefixt? Nicht gefixt.
- Was muss noch gemacht werden? Staging/Emulator einrichten und Seed-Daten definieren.

## 9. BUG-009 - SEO/Launch-Standarddateien fehlen oder sind unvollstaendig

- Prioritaet: P1
- Bereich: SEO / Launch
- Was passt nicht? `robots.txt`, `sitemap.xml`, `favicon.ico` wurden nicht gefunden; OG/Twitter/canonical/meta description sind in den Haupt-HTML-Einstiegen nicht launchfertig sichtbar.
- Warum passt es nicht? Public Restaurant/QR/Website-First Launch braucht kontrollierte Indexierung und Share Previews.
- Reproduktion: `rg --files -g robots.txt -g sitemap.xml -g favicon.ico`.
- Erwartet: Robots, Sitemap, Favicon, OG/Twitter/canonical/meta pro public route.
- Tatsaechlich: Dateien fehlen im Repo-Root.
- Was wurde gefixt? Nicht gefixt, weil SEO/Branding/Product Copy Freigabe braucht.
- Was muss noch gemacht werden? Standarddateien und dynamic public share metadata planen/umsetzen.

## 10. BUG-010 - Lokaler Static-Server simuliert Vercel-Rewrites nicht

- Prioritaet: P2
- Bereich: Test Harness / Routing
- Was passt nicht? `/feed` ist im Python-Static-Server 404, obwohl Vercel `/feed` auf Social Index rewritet.
- Warum passt es nicht? Einfacher Static-Server kann `vercel.json` Rewrite-Regeln nicht nachbilden.
- Reproduktion: `Invoke-WebRequest http://127.0.0.1:4173/feed` nach `python -m http.server ... --directory dist`.
- Erwartet: lokale E2E-Tests koennen alle Launch-Routen direkt aufrufen.
- Tatsaechlich: nur direkte `/apps/menyra-social/index.html`-URLs sind belastbar.
- Was wurde gefixt? Nicht gefixt.
- Was muss noch gemacht werden? Lokalen Rewrite-Testserver oder `vercel dev`/dedizierten static fallback fuer QA nutzen.

## 11. BUG-011 - Public-Business-Open-Flow konnte im Fehlerpfad crashen

- Prioritaet: P1
- Bereich: Public Profile / QR Menu / Runtime Error Handling
- Was passt nicht? Bei einem Fehler im Public-Business-Open-Flow referenzierte der Catch-Pfad `routeSnapshotRestaurantId`, obwohl die Variable nur innerhalb des `try`-Blocks deklariert war.
- Warum passt es nicht? Ein transienter Public-Profile-/Posts-Timeout konnte dadurch zu `ReferenceError: routeSnapshotRestaurantId is not defined` eskalieren.
- Reproduktion: lokaler QR/Menu-Flow mit `public/business-posts` Timeout; Console zeigte `profile-open-flow-utils-*.js ReferenceError`.
- Erwartet: Fehlerpfad behaelt vorhandenen Profilzustand oder markiert Error, aber wirft keinen neuen ReferenceError.
- Tatsaechlich: Promise-Catch war selbst kaputt.
- Betroffene Datei/Funktion: `apps/menyra-social/core/profile/profile-open-flow-utils.js`, `openProfileViewFromBusiness()`.
- Was wurde gefixt? Ja, `routeSnapshotRestaurantId` wird jetzt im aeusseren Scope initialisiert.
- Was muss noch gemacht werden? Staging/Slow-Network-QR erneut pruefen; Timeouts selbst bleiben Performance-/Datenlade-Thema.

## 12. BUG-012 - Lokaler Checkout rief Production-Functions an und lief in CORS

- Prioritaet: P1, P0-nahe falls dadurch echte lokale Tests gegen Production versucht werden
- Bereich: Orders / Local QA / Firebase Functions
- Was passt nicht? Lokaler QR-Checkout von `http://192.168.1.168:5173` rief `https://us-central1-menyra-c0e68.cloudfunctions.net/createRestaurantOrder` direkt auf und wurde vom Browser im CORS-Preflight geblockt.
- Warum passt es nicht? Lokale mutierende Tests duerfen nicht gegen Production laufen; fuer den neuen sicheren Order-Pfad braucht es Functions Emulator oder Staging Deploy.
- Reproduktion: lokaler Checkout, Console `No Access-Control-Allow-Origin` und `POST ... createRestaurantOrder net::ERR_FAILED`.
- Erwartet: Lokal nutzt Emulator/Testumgebung, nicht Production Cloud Functions.
- Tatsaechlich: Lokaler Build versuchte Production-Function.
- Betroffene Dateien/Funktionen: `apps/menyra-social/social-app.js`, `firebase.json`, `createRestaurantOrderViaCallable()`.
- Was wurde gefixt? Ja, lokale Hosts verbinden Functions automatisch mit dem Functions Emulator auf Port `5001`; `firebase.json` enthaelt Emulator-Ports.
- Was muss noch gemacht werden? Emulator starten und Seed-Daten anlegen oder Staging Deploy nutzen; ohne Emulator ist ein lokaler Order-Submit bewusst nicht erfolgreich.
