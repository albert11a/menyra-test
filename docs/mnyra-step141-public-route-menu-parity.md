# Mnyra Step 141 - Public Route Menu Parity

Status: CURRENT
Datum: 2026-07-01
Branch: `lastprofilefix` (kein Branchwechsel auf ausdruecklichen Nutzerwunsch)

## Ziel

Public-Route-Menues wie `/:slug/menu` sollen sich beim Direktaufruf wie
Casarita verhalten:

- kein falsches `Keine Produkte`
- kein dauerhaftes `Profil wird geladen...` im Profilkopf
- keine wechselnden Menu-Skeleton-Typen vor der kanonischen Menu-Wahrheit
- Produkte und Focus erscheinen, sobald die kanonische Public-Menu-Wahrheit
  bereit ist

## Runtime-Befund

Mit frischem Browser-Kontext, `sw-reset` und Debug-Flags wurde Casarita gegen
`in-vino` und `mama-mantia` verglichen.

Vor dem Fix:

- `in-vino` renderte kurz `Keine Produkte`, weil `in-vino` als
  `profile.canonicalRestaurantId` akzeptiert wurde, obwohl der spaetere
  kanonische Restaurant-Pfad `3brvJQPCPl2NbhqTuD3j` ist.
- `mama-mantia` lud Produkte und Focus, behielt aber im Header dauerhaft
  `Profil wird geladen...`.
- Nicht-Casarita-Pfade zeigten vor der finalen Datenlage erst
  `standard-menu-skeleton` und danach `testfirst-menu-skeleton`.

Nach dem Fix:

- Casarita, Mama Mantia und IN VINO laden den Build
  `2026-07-01-public-route-menu-parity-01`.
- `standard-menu-skeleton` zaehlt fuer alle drei Public-Route-Menues im
  Debug-Lauf `0`.
- Pending-Zustand ist bei allen drei gleich:
  `testfirst-focus-skeleton` plus `testfirst-menu-skeleton`.
- `Keine Produkte` wird nicht mehr gerendert.
- `Profil wird geladen...` bleibt nicht mehr im finalen Header stehen.

## Geaendert

- Debug-Instrumentierung fuer Public-Menu-Renderer:
  `[mnyra:no-products-render]`, `[mnyra:skeleton-render]` und
  `data-debug-*` nur bei Debug-Flags.
- Public-Menu-Surface-Gate:
  Slug-Alias-IDs duerfen erst als authoritative canonical ID gelten, wenn sie
  wirklich aufgeloest/hydriert sind.
- Public-Profile-Header:
  der Lade-Bio-Platzhalter wird nicht mehr als echte Bio in spaetere
  Public-Profile-States uebernommen.
- Menu-Skeleton-Paritaet:
  ein noch unbekannter Business-Typ auf Public-Menu-Routen wird fuer den
  Restaurant-Menue-Pending-Zustand wie ein Restaurant/Cafe behandelt, statt
  vom Standard-Skeleton spaeter auf den Casarita/Testfirst-Skeleton zu wechseln.
- Build-Token:
  `2026-07-01-public-route-menu-parity-01`.

## Dateien

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-boundary.js`
- `apps/menyra-social/core/profile/public-menu-surface-state-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/shop/shop-view-cart-orchestration-controller.js`
- `apps/menyra-social/index.html`
- `tests/public-menu-surface-state-utils.test.mjs`
- `tests/public-profile-runtime-controller.test.mjs`
- `apps/menyra-social/bundled/**`

## Bewusst nicht geaendert

- Keine Layout-, Farb-, Typografie- oder Design-Aenderung.
- Keine Firebase-Regeln, Functions, Datenstruktur oder QR-/Cart-/Order-Logik.
- Keine Casarita-Hardcodierung fuer andere Restaurants.
- Kein Branchwechsel.

## Verifikation

Automatisch:

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --test tests/public-menu-surface-state-utils.test.mjs tests/public-profile-runtime-controller.test.mjs`
- `npm run build:menyra-social:bundle`

Browser/Runtime:

- `casarita/menu`
- `mama-mantia/menu`
- `in-vino/menu`

jeweils mit:

`?sw-reset=1&debug-build=1&debug-menu-state=1&debug-profile-render=1`

Ergebnis:

- Build-Token: `2026-07-01-public-route-menu-parity-01`
- `noProductsLogs: 0`
- `standardSkeletonCount: 0`
- `testfirst-menu-skeleton` im Pending-Zustand sichtbar
- Produkte bei Casarita und Mama Mantia sichtbar
- IN VINO zeigt seine zwei vorhandenen, sehr duennen Produktdatensaetze ohne
  falsches Empty und ohne Header-Ladeplatzhalter

## Manuelle Testliste

1. `http://localhost:5183/casarita/menu?sw-reset=1&debug-build=1`
2. `http://localhost:5183/mama-mantia/menu?sw-reset=1&debug-build=1`
3. `http://localhost:5183/in-vino/menu?sw-reset=1&debug-build=1`

Pruefen:

- `debug-build` zeigt `2026-07-01-public-route-menu-parity-01`.
- Kein kurzer `Keine Produkte`-Zustand.
- Header zeigt nicht dauerhaft `Profil wird geladen...`.
- Pending-Skeletons wirken wie Casarita, ohne Standard-Zwischen-Skeleton.
- Menu und Focus erscheinen stabil, ohne sichtbaren Wechsel von einem
  Skeleton-Design in ein anderes.
