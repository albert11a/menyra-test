Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 44 - Public Profile/Menu Split-Kandidatenkarte

## Ziel

Weiterarbeiten, ohne vor deiner manuellen Endpruefung einen riskanten Runtime-
Split zu machen. Dieser Schritt macht den naechsten moeglichen Public/Profile-
Schnitt reproduzierbar sichtbar: welche Module noch statisch im Social-Entry
haengen, welche bereits dynamisch sind und wo das Risiko fuer QR, Cart, Order
und Public Menu sitzt.

## Umsetzung

- Neues Analyse-Skript:
  `scripts/analyze-mnyra-public-profile-split.mjs`
- Neuer NPM-Befehl:
  `npm run analyze:public-profile-split`
- Das Skript liest:
  - `apps/menyra-social/bundled/manifest.json`
  - `apps/menyra-social/social-app.js`
  - den statischen Import-Graph ab `social-app.js`
  - die aktuellen Bundle-Dateien
- Es klassifiziert wichtige Public/Profile/Menu-Module als:
  - `dynamic`
  - `social-entry-static-graph`
  - `not-in-social-static-graph`

## Ergebnis

- Keine Runtime-Aenderung.
- Keine Bundle-Aenderung.
- Aktueller `social-app.js` bleibt:
  1,138,788 Bytes raw / 309,638 Bytes gzip.
- Aktueller `social-public-entry.js` bleibt:
  1,182 Bytes raw / 630 Bytes gzip.
- Der statische Graph ab `social-app.js` umfasst 175 Module.
- Die getrackten Public/Profile/Menu-Split-Kandidaten im statischen Graph
  umfassen zusammen 377,211 Bytes Source raw.

## Wichtigste statische Kandidaten

Diese Dateien sind technisch gross genug fuer spaetere Gewinne, aber aktuell
nicht sicher blind trennbar:

- `public-profile-runtime-controller.js`
  - 77,819 Bytes Source raw / 13,333 Bytes Source gzip.
  - Groesster naechster Kandidat, aber gekoppelt an Public Profile, Public Menu,
    Cart, Order und QR/Tisch-Kontext.
- `public-bootstrap-runtime-controller.js`
  - 69,405 Bytes Source raw / 12,121 Bytes Source gzip.
  - Gekoppelt an Cold-Start, Public Route Truth, Menu/Fokus-Seed.
- `profile-business-menu-runtime-cluster.js`
  - 44,463 Bytes Source raw / 6,547 Bytes Source gzip.
  - Aktueller Orchestrierungs- und Boundary-Besitzer.
- `public-profile-direct-entry-controller.js`
  - 36,437 Bytes Source raw / 6,572 Bytes Source gzip.
  - Gekoppelt an Direct Entry, QR und Tisch-Handoff.

## Bereits dynamisch

- `profile-menu-focus-render-controller.js`
  - 87,678 Bytes Bundle raw / 21,077 Bytes Bundle gzip.
- `profile-open-flow-utils.js`
  - 26,142 Bytes Bundle raw / 7,534 Bytes Bundle gzip.
- `menu-modal-render-utils.js`
  - 45,570 Bytes Bundle raw / 10,328 Bytes Bundle gzip.
- `orders-runtime-controller.js`
  - 12,923 Bytes Bundle raw / 4,548 Bytes Bundle gzip.

## Bewertung

`analysiert, noch nicht umgesetzt`

Der naechste echte Performance-Gewinn liegt wahrscheinlich nicht mehr beim
Renderer selbst, sondern im Public/Profile-Runtime-Block um
`public-profile-runtime-controller.js`. Dieser Bereich darf aber erst nach
manueller Pruefung weiter getrennt werden, weil Public Profile, Public Menu,
Produktdetail, Cart, Order und QR/Tisch-Kontext dort zusammenhaengen.

## Geaenderte Dateien

- `scripts/analyze-mnyra-public-profile-split.mjs`
- `package.json`
- `audit/mnyra-public-profile-split-candidate-map.json`
- `docs/mnyra-step44-public-profile-split-candidate-map.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Route geaendert.
- Keine Firebase-Pfade, Queries oder Payloads geaendert.
- Keine DOM-IDs, Klassen oder CSS geaendert.
- Keine Public/Profile-Runtime neu geschnitten.
- Keine eigene abgespeckte Public-UI gebaut.
- Keine Bundle-Datei geaendert.
- Kein Dev Server.
- Kein Playwright.
- Kein Formatter.
- Kein Install.

## Checks

- `npm run build`
- `npm run check:social-bundle`
- `node --test tests/route-runtime-registry.test.mjs tests/profile-menu-focus-render-preload-utils.test.mjs tests/profile-menu-focus-render-boundary.test.mjs`
- `node --check scripts/analyze-mnyra-public-profile-split.mjs`
- `npm run analyze:public-profile-split`
- Audit JSON validiert.
- `git diff --check`

## Manuelle Testliste

Da keine Runtime geaendert wurde, reicht spaeter dieselbe Endpruefung:

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
