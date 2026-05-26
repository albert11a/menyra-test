Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 45 - Social Engagement Runtime Boundary

## Ziel

Nach deinem schnellen manuellen Gruen einen kleinen echten Performance-Schnitt
machen, aber weiterhin nicht den riskanten Public/Profile-Kernblock blind
trennen. Dieser Schritt verschiebt die Social-Engagement-Runtime fuer Likes,
Comments, Post-Meta und Menu-Item-Meta aus `social-app.js` hinter eine Lazy
Boundary.

## Umsetzung

- Neue Boundary:
  `apps/menyra-social/core/profile/social-engagement-runtime-boundary.js`
- `social-app.js` importiert nur noch die Boundary.
- `social-engagement-runtime-controller.js` wird per Dynamic Import geladen,
  sobald eine Engagement-Funktion wirklich gebraucht wird.
- Async-Aktionen wie Like/Comment/Menu-Item-Like warten auf den geladenen
  Controller.
- Sync-Listener-Aufrufe fuer Post/Menu-Detail-Meta werden bis nach dem Laden
  des Controllers nachgezogen.
- `npm run check:social-bundle` schuetzt den neuen Dynamic Import und zieht das
  Social-Entry-Budget nach unten.
- `npm run analyze:public-profile-split` markiert Social Engagement jetzt als
  `dynamic`.

## Ergebnis

- Vor Schritt 45:
  `social-app.js`: 1,138,788 Bytes raw / 309,638 Bytes gzip.
- Nach Schritt 45:
  `social-app.js`: 1,116,617 Bytes raw / 302,809 Bytes gzip.
- Gewinn:
  -22,171 Bytes raw / -6,829 Bytes gzip.
- Neuer Chunk:
  `social-engagement-runtime-controller-B_QBB-o7.js`:
  22,822 Bytes raw / 7,419 Bytes gzip.
- `social-public-entry.js` bleibt:
  1,182 Bytes raw / 630 Bytes gzip.
- `profile-menu-focus-render-controller` bleibt eigener Chunk:
  87,678 Bytes raw / 21,077 Bytes gzip.
- `vendor-firebase` bleibt:
  441,937 Bytes raw / 132,592 Bytes gzip.
- Getrackte statische Public/Profile/Menu-Kandidaten sinken in der Analyse von
  377,211 Bytes Source raw auf 323,226 Bytes Source raw.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/profile/social-engagement-runtime-boundary.js`
- `tests/social-engagement-runtime-boundary.test.mjs`
- `scripts/check-mnyra-social-bundle-budget.mjs`
- `scripts/analyze-mnyra-public-profile-split.mjs`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/entry/social-public-entry.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/social-engagement-runtime-controller-B_QBB-o7.js`
- gebaute Vite-Chunk-Hash-Aktualisierungen unter `apps/menyra-social/bundled/chunks/`
- `audit/mnyra-social-engagement-runtime-boundary.json`
- `docs/mnyra-step45-social-engagement-runtime-boundary.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Route geaendert.
- Keine Firebase-Pfade, Queries oder Payloads geaendert.
- Keine DOM-IDs, Klassen oder CSS geaendert.
- Kein Public/Profile-Kernsplit.
- Keine eigene abgespeckte Public-UI gebaut.
- Public Profile, Public Menu, Produktdetail, Cart, Order und QR/Tisch-Kontext
  bleiben auf derselben Runtime-Logik.
- Heart, `/staff`, businessAccounts und Waiter/Kitchen bleiben unveraendert.
- Kein Dev Server.
- Kein Playwright.
- Kein Formatter.
- Kein Install.

## Checks

- `npm run build`
- `npm run check:social-bundle`
- `node --test tests/social-engagement-runtime-boundary.test.mjs tests/profile-menu-focus-render-boundary.test.mjs tests/route-runtime-registry.test.mjs tests/profile-menu-focus-render-preload-utils.test.mjs`
- `node --check apps/menyra-social/core/profile/social-engagement-runtime-boundary.js`
- `node --check apps/menyra-social/social-app.js`
- `node --check scripts/check-mnyra-social-bundle-budget.mjs`
- `npm run analyze:public-profile-split`
- Audit JSON validiert.
- `git diff --check`

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist ein echter Bundle-Gewinn mit kleinem Blast Radius. Das
Restrisiko liegt beim ersten Engagement-Event nach dem Laden, zum Beispiel beim
ersten Like, Kommentar, Produktdetail-Meta oder Menu-Item-Like. Die fachliche
Logik bleibt aber im bestehenden Controller.

## Manuelle Testliste

- `/feed` oeffnet wie vorher.
- Post-Detail aus Feed/Profile oeffnen.
- Post Like toggeln.
- Kommentar senden.
- Kommentar Like toggeln.
- Profil aus Feed/Search/Map oeffnen.
- `/casarita` oeffnet Public Profile.
- `/casarita/menu` oeffnet Public Menu.
- Produktdetail oeffnet/schliesst.
- Menu-Item Like/Favorite toggeln.
- Cart funktioniert.
- Order Send funktioniert.
- QR-/Tisch-Kontext bleibt erhalten.
- eigenes Business-Profil und Menu-Admin pruefen.
- `/leads`, `/customers`, `/admin/staff` oeffnen Heart.
- `/staff`, businessAccounts und Waiter/Kitchen unveraendert.
- Keine roten Console-Errors.
