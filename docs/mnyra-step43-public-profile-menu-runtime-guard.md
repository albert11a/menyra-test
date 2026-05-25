Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 43 - Public Profile/Menu Runtime Guard

## Ziel

Nach Schritt 41/42 keinen weiteren Public/Profile-Split blind machen, sondern
die bestehende Boundary zuerst besser absichern. Der Schritt soll statisch
verhindern, dass die neue Lazy-Grenze, das Preload-Timing oder die Public-
Menu-Runtime-Slots versehentlich wieder aufgeweicht werden.

## Umsetzung

- `npm run check:social-bundle` prueft jetzt zusaetzlich zum Bundle-Budget:
  - `profile-menu-focus-render-controller.js` bleibt hinter Dynamic Import.
  - `social-app.js` behaelt die Step-42-Preload-Entscheidung.
  - `publicBusiness` und `publicMenu` nutzen weiter denselben bestehenden
    Public-Profile-Renderer.
  - beide Public-Runtime-Slots preladen weiter den bestehenden
    Profile/Menu/Fokus-Renderer.
  - QR-Menu-Zugriff bleibt vertraglich im `publicMenu`-Slot.
- `route-runtime-registry.test.mjs` deckt jetzt auch Cart, Favorites und QR als
  Public-Menu-Runtime ab.
- `profile-menu-focus-render-preload-utils.test.mjs` deckt jetzt vorhandene
  `profileView`-State-Preloads und inaktive Web-Direct-Eintraege ab.

## Ergebnis

- Kein neuer Runtime-Split.
- Keine neue Public-UI.
- Keine Aenderung am sichtbaren Rendering.
- Keine Bundle-Groessen-Aenderung gegen Schritt 42:
  - `social-app.js`: 1,138,788 Bytes raw / 309,638 Bytes gzip.
  - `social-public-entry.js`: 1,182 Bytes raw / 630 Bytes gzip.
  - Profile/Menu/Fokus-Chunk: 87,678 Bytes raw / 21,077 Bytes gzip.
- Der naechste echte Split ist dadurch besser vorbereitet, aber weiterhin von
  manueller Pruefung der kritischen Public-Flows abhaengig.

## Geaenderte Dateien

- `scripts/check-mnyra-social-bundle-budget.mjs`
- `tests/route-runtime-registry.test.mjs`
- `tests/profile-menu-focus-render-preload-utils.test.mjs`
- `audit/mnyra-public-profile-menu-runtime-guard.json`
- `docs/mnyra-step43-public-profile-menu-runtime-guard.md`
- `docs/mnyra-current-phase.md`

## Checks

- `npm run build`
- `npm run check:social-bundle`
- `node --test tests/route-runtime-registry.test.mjs tests/profile-menu-focus-render-preload-utils.test.mjs tests/profile-menu-focus-render-boundary.test.mjs`
- `node --check scripts/check-mnyra-social-bundle-budget.mjs`
- `node --check tests/route-runtime-registry.test.mjs`
- `node --check tests/profile-menu-focus-render-preload-utils.test.mjs`
- Audit JSON validiert.
- `git diff --check`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Route geaendert.
- Keine Firebase-Pfade, Queries oder Payloads geaendert.
- Keine DOM-IDs, Klassen oder CSS geaendert.
- Keine Public/Profile-Runtime neu geschnitten.
- Keine eigene abgespeckte Public-UI gebaut.
- Public Profile, Public Menu, Produktdetail, Cart, Order und QR/Tisch-Kontext
  bleiben auf derselben Runtime-Logik.
- Heart, `/staff`, businessAccounts und Waiter/Kitchen bleiben unveraendert.
- Kein Dev Server.
- Kein Playwright.
- Kein Formatter.
- Kein Install.

## Bewertung

`bestanden`

Der Schritt ist absichtlich konservativ. Er liefert keinen neuen Performance-
Gewinn, verhindert aber stille Rueckfaelle an genau der Stelle, an der der
naechste groessere Public/Profile-Split sonst riskant waere.

## Manuelle Testliste

- `/feed` oeffnet wie vorher.
- Profil aus Feed/Search/Map oeffnen.
- `/casarita` oeffnet Public Profile.
- `/casarita/menu` oeffnet Public Menu.
- Produktdetail oeffnet/schliesst.
- Cart funktioniert.
- Favorites/Menu-nahe Public-Flows pruefen, falls sichtbar.
- Order Send funktioniert.
- QR-/Tisch-Kontext bleibt erhalten.
- eigenes Business-Profil und Menu-Admin pruefen.
- Upload-Einstiege `+ Status` und `+ Neuen Beitrag` pruefen.
- `/leads`, `/customers`, `/admin/staff` oeffnen Heart.
- `/staff`, businessAccounts und Waiter/Kitchen unveraendert.
- Keine roten Console-Errors.
