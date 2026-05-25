Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 41 - Profile/Menu/Fokus Render Boundary

## Ziel

Den grossen Profile/Menu/Fokus-Renderer aus dem Social-Main-Entry schneiden,
ohne sichtbare UI, Routing, Firebase-Pfade, Public Menu, Produktdetail,
Warenkorb, Orders, QR-/Tisch-Kontext, Heart, `/staff`, businessAccounts oder
Waiter/Kitchen zu veraendern.

## Umsetzung

- `profile-menu-focus-render-controller.js` bleibt die einzige Source of Truth
  fuer Public Profile, Public Menu, eigenes Profil und Menu-Admin-Rendering.
- Eine neue kleine Boundary
  `core/profile/profile-menu-focus-render-boundary.js` laedt diesen bestehenden
  Renderer erst bei Profile/Menu-Nutzung per Dynamic Import.
- `profile-business-menu-runtime-cluster.js` importiert nicht mehr direkt den
  grossen Renderer, sondern nur noch die Boundary.
- Die vorbereiteten `publicBusiness`- und `publicMenu`-Runtime-Slots preladen
  den Renderer vor ihrem Render-Aufruf.
- Nach dem Lazy-Load fordert die Boundary einen normalen Re-Render an, damit der
  bestehende Renderer uebernimmt.
- `npm run check:social-bundle` schuetzt den neuen Stand:
  `profile-menu-focus-render-controller.js` darf nicht wieder statisch in
  `social-app.js` landen, und das Entry-Budget wurde auf den neuen Stand
  heruntergezogen.

## Ergebnis

- Vor Schritt 41 / Stand Schritt 40:
  `social-app.js`: 1,226,239 Bytes raw / 330,087 Bytes gzip.
- Nach Schritt 41:
  `social-app.js`: 1,138,184 Bytes raw / 309,464 Bytes gzip.
- Reduktion:
  88,055 Bytes raw / 20,623 Bytes gzip.
- Neuer Lazy Chunk:
  `profile-menu-focus-render-controller-CjmOZbIa.js`:
  87,678 Bytes raw / 21,079 Bytes gzip.
- `social-public-entry.js` bleibt:
  1,182 Bytes raw / 632 Bytes gzip.
- `vendor-firebase` bleibt:
  441,937 Bytes raw / 132,592 Bytes gzip.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-boundary.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/overlays/overlay-basic-render-utils.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-CjmOZbIa.js`
- `apps/menyra-social/bundled/chunks/profile-open-flow-utils-BVCYwC0C.js`
- `apps/menyra-social/bundled/chunks/overlay-basic-render-utils-DMe72XjF.js`
- `scripts/check-mnyra-social-bundle-budget.mjs`
- `tests/profile-menu-focus-render-boundary.test.mjs`
- `audit/mnyra-profile-menu-focus-render-boundary.json`
- `docs/mnyra-step41-profile-menu-focus-render-boundary.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Route geaendert.
- Keine Firebase-Pfade, Queries oder Payloads geaendert.
- Keine DOM-IDs, Klassen oder CSS geaendert.
- Keine eigene abgespeckte Public-UI gebaut.
- Public Profile, Public Menu, Produktdetail, Cart, Order und QR/Tisch-Kontext
  bleiben auf derselben Runtime-Logik.
- Heart, `/staff`, businessAccounts und Waiter/Kitchen bleiben unveraendert.
- Kein Dev Server.
- Kein Playwright.
- Kein Formatter.
- Kein Install.

## Bewertung

`bestanden mit Rest-Risiko`

Der Bundle-Gewinn ist real und durch das Manifest abgesichert. Das Restrisiko
liegt in der neuen ersten Lazy-Ladung beim ersten Profile/Menu-Render. Der
Renderer selbst wurde nicht fachlich veraendert und bleibt dieselbe Source of
Truth.

## Manuelle Testliste

- `/feed` oeffnet wie vorher.
- Profil aus Feed/Search/Map oeffnen.
- `/casarita` oeffnet Public Profile.
- `/casarita/menu` oeffnet Public Menu.
- Produktdetail oeffnet/schliesst.
- Cart funktioniert.
- Order Send funktioniert.
- QR-/Tisch-Kontext bleibt erhalten.
- eigenes Business-Profil und Menu-Admin pruefen.
- Upload-Einstiege `+ Status` und `+ Neuen Beitrag` pruefen.
- `/leads`, `/customers`, `/admin/staff` oeffnen Heart.
- `/staff`, businessAccounts und Waiter/Kitchen unveraendert.
- Keine roten Console-Errors.
