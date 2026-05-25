Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 42 - Profile/Menu/Fokus Preload Timing

## Ziel

Den Lazy-Schnitt aus Schritt 41 absichern, damit der ausgelagerte
Profile/Menu/Fokus-Renderer auf Profil- und Menu-Pfaden frueher angefordert
wird. Der Schritt soll keinen neuen Split bauen und keine sichtbare UI,
Routing-, Firebase- oder Produktlogik veraendern.

## Umsetzung

- Eine kleine Entscheidungsfunktion
  `profile-menu-focus-render-preload-utils.js` legt fest, wann der
  Profile/Menu/Fokus-Renderer frueh vorgeladen werden darf.
- `social-app.js` ruft diesen Early-Preload direkt nach Aufbau der
  Profile/Menu-Runtime auf.
- Frueh vorgeladen wird nur bei:
  - aktivem `profile`-Tab,
  - aktivem `menu`-Tab,
  - pending Public-Business-Profilroute,
  - pending Public-User-Profilroute,
  - aktivem Web-Direct-Public-Profilkontext.
- Ein normaler `feed`-Start ohne Profil-/Menu-Absicht preloaded den Renderer
  weiterhin nicht.
- Die bestehende Step-41-Boundary und der bestehende Renderer bleiben
  unveraendert Source of Truth.

## Ergebnis

- Nach Schritt 41:
  `social-app.js`: 1,138,184 Bytes raw / 309,464 Bytes gzip.
- Nach Schritt 42:
  `social-app.js`: 1,138,788 Bytes raw / 309,638 Bytes gzip.
- Delta fuer den Early-Preload:
  +604 Bytes raw / +174 Bytes gzip.
- Der Profile/Menu/Fokus-Renderer bleibt eigener Lazy Chunk:
  `profile-menu-focus-render-controller-Cb85Gqbo.js`:
  87,678 Bytes raw / 21,077 Bytes gzip.
- `social-public-entry.js`:
  1,182 Bytes raw / 630 Bytes gzip.
- `vendor-firebase`:
  441,937 Bytes raw / 132,592 Bytes gzip.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-preload-utils.js`
- `tests/profile-menu-focus-render-preload-utils.test.mjs`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/entry/social-public-entry.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/media-upload-runtime-cluster-Csgu8snE.js`
- `apps/menyra-social/bundled/chunks/menu-modal-render-utils-CXNN4fVX.js`
- `apps/menyra-social/bundled/chunks/orders-runtime-controller-KPBQcQYV.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-Cb85Gqbo.js`
- `apps/menyra-social/bundled/chunks/profile-open-flow-utils-BNWjpMKv.js`
- `apps/menyra-social/bundled/chunks/public-route-cache-early-preload-BPoXv1WE.js`
- `apps/menyra-social/bundled/chunks/vendor-firebase-rekF-BVt.js`
- `audit/mnyra-profile-menu-focus-preload-timing.json`
- `docs/mnyra-step42-profile-menu-focus-preload-timing.md`
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

`bestanden mit kleinem Rest-Risiko`

Der Schritt nimmt bewusst eine sehr kleine Main-Entry-Zunahme in Kauf, damit
Profile/Menu-Starts den vorhandenen Lazy Chunk frueher anfordern. Das Restrisiko
liegt weiter in der ersten Lazy-Ladung selbst; der Renderer bleibt aber derselbe
und wird durch `npm run check:social-bundle` weiterhin als Dynamic Import
geschuetzt.

## Manuelle Testliste

- `/feed` oeffnet wie vorher.
- Profil aus Feed/Search/Map oeffnen.
- `/casarita` oeffnet Public Profile.
- `/casarita/menu` oeffnet Public Menu ohne sichtbaren leeren Zwischenzustand.
- Produktdetail oeffnet/schliesst.
- Cart funktioniert.
- Order Send funktioniert.
- QR-/Tisch-Kontext bleibt erhalten.
- eigenes Business-Profil und Menu-Admin pruefen.
- Upload-Einstiege `+ Status` und `+ Neuen Beitrag` pruefen.
- `/leads`, `/customers`, `/admin/staff` oeffnen Heart.
- `/staff`, businessAccounts und Waiter/Kitchen unveraendert.
- Keine roten Console-Errors.
