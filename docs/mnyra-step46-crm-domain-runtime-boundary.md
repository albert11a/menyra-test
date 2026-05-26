Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 46 - CRM Domain Runtime Boundary

## Ziel

Nach Schritt 45 den realistischen naechsten Bundle-Schnitt machen und
`social-app.js` unter 300 kB gzip bringen, ohne den riskanten Public/Profile-
Kern um Public Menu, Cart, Order und QR blind zu trennen.

Dieser Schritt verschiebt die CRM-/Heart-Domain-Runtime hinter eine Lazy
Boundary. Heart bleibt dieselbe Runtime-Quelle, wird aber nicht mehr statisch
im Social-Main-Entry gebuendelt.

## Umsetzung

- Neue Boundary:
  `apps/menyra-social/core/crm/crm-domain-runtime-boundary.js`
- `social-app.js` importiert nur noch die Boundary.
- `crm-domain-runtime-cluster.js` wird per Dynamic Import geladen, sobald eine
  CRM-/Heart-Ansicht, CRM-Aktion oder expliziter CRM-Prefetch gebraucht wird.
- CRM-Renderpfade zeigen bis zum Laden die bestehende CRM-Ladeansicht.
- Async-Aktionen wie Lead-/Customer-/Staff-Saves warten auf den geladenen
  Controller.
- Sync-UI-Aktionen wie Staff-/Lead-Editor-Oeffnungen werden nach dem Laden
  nachgezogen.
- Reine Sync-Fallbacks wie Lead-Normalisierung, Status-Fallbacks und
  `getVerifiedMapLocation` laden den CRM-Chunk nicht auf Verdacht.
- `npm run check:social-bundle` schuetzt den neuen Dynamic Import und zieht das
  Social-Entry-Budget auf die neue Unter-300-kB-Grenze.
- `npm run analyze:public-profile-split` markiert CRM/Heart als `dynamic`.

## Ergebnis

- Vor Schritt 46:
  `social-app.js`: 1,116,617 Bytes raw / 302,809 Bytes gzip.
- Nach Schritt 46:
  `social-app.js`: 1,046,899 Bytes raw / 283,365 Bytes gzip.
- Gewinn:
  -69,718 Bytes raw / -19,444 Bytes gzip.
- Unter 300 kB gzip: erreicht.
- Neuer Chunk:
  `crm-domain-runtime-cluster-BF_D1DFk.js`:
  72,697 Bytes raw / 21,019 Bytes gzip.
- `social-public-entry.js` bleibt klein:
  1,182 Bytes raw / 631 Bytes gzip.
- `social-engagement-runtime-controller` bleibt eigener Chunk:
  22,822 Bytes raw / 7,419 Bytes gzip.
- `profile-menu-focus-render-controller` bleibt eigener Chunk:
  87,678 Bytes raw / 21,079 Bytes gzip.
- `vendor-firebase` bleibt:
  441,937 Bytes raw / 132,592 Bytes gzip.
- Der statische Graph ab `social-app.js` sinkt auf 172 Module.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/crm/crm-domain-runtime-boundary.js`
- `tests/crm-domain-runtime-boundary.test.mjs`
- `scripts/check-mnyra-social-bundle-budget.mjs`
- `scripts/analyze-mnyra-public-profile-split.mjs`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/entry/social-public-entry.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/crm-domain-runtime-cluster-BF_D1DFk.js`
- gebaute Vite-Chunk-Hash-Aktualisierungen unter
  `apps/menyra-social/bundled/chunks/`
- `audit/mnyra-crm-domain-runtime-boundary.json`
- `docs/mnyra-step46-crm-domain-runtime-boundary.md`
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
- `/staff`, businessAccounts und Waiter/Kitchen bleiben unveraendert.
- Kein Dev Server.
- Kein Playwright.
- Kein Formatter.
- Kein Install.

## Checks

- `npm run build`
- `npm run check:social-bundle`
- `npm run analyze:public-profile-split`
- `node --test tests/crm-domain-runtime-boundary.test.mjs tests/social-engagement-runtime-boundary.test.mjs tests/profile-menu-focus-render-boundary.test.mjs tests/route-runtime-registry.test.mjs tests/profile-menu-focus-render-preload-utils.test.mjs`
- `node --check apps/menyra-social/core/crm/crm-domain-runtime-boundary.js`
- `node --check apps/menyra-social/social-app.js`
- `node --check scripts/check-mnyra-social-bundle-budget.mjs`
- `node --check scripts/analyze-mnyra-public-profile-split.mjs`
- `node --check tests/crm-domain-runtime-boundary.test.mjs`
- Audit JSON validiert.
- `git diff --check`

## Bewertung

`bestanden mit Rest-Risiko`

Der Schritt bringt den Social-Main-Entry klar unter 300 kB gzip und vermeidet
weiterhin einen blinden Schnitt im Public/Profile/Menu/QR-Kern. Das Restrisiko
liegt beim ersten Oeffnen oder Bedienen von Heart-/CRM-Screens, weil dort der
CRM-Domain-Chunk jetzt erst bei Bedarf geladen wird. Die fachliche Logik bleibt
aber im bestehenden CRM-Controller.

## Manuelle Testliste

- `/feed` oeffnet wie vorher.
- Profil aus Feed/Search/Map oeffnen.
- `/casarita` oeffnet Public Profile.
- `/casarita/menu` oeffnet Public Menu.
- Produktdetail oeffnet/schliesst.
- Cart funktioniert.
- Order Send funktioniert.
- QR-/Tisch-Kontext bleibt erhalten.
- `/leads` oeffnet Heart Leads.
- Lead Creator, Lead Settings und Lead Modal pruefen.
- `/customers` oeffnet Heart Customers.
- Customer Modal und Save pruefen.
- `/admin/staff` oeffnet Heart Staff.
- Staff Editor, Save und Delete pruefen.
- Map/Search mit gespeichertem/gesetztem Standort kurz pruefen.
- Post Detail, Like und Comment pruefen.
- Menu-Item Like/Favorite pruefen.
- `/staff`, businessAccounts und Waiter/Kitchen unveraendert.
- Keine roten Console-Errors.
