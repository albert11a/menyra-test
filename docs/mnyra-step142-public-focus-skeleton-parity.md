# Mnyra Step 142 - Public Focus Skeleton Parity

Status: CURRENT
Datum: 2026-07-01
Branch: `lastprofilefix` (kein Branchwechsel auf ausdruecklichen Nutzerwunsch)

## Ziel

Public-Route-Menues wie `mama-mantia/menu` sollen im Ladeverlauf beim Focus
wie Casarita wirken:

- kein kurzer Rueckfall auf einen Produkt-/Standard-Skeleton
- kein sichtbares Verschwinden des reservierten Focus-Bereichs, waehrend das
  Menu noch auf kanonische Daten wartet
- kein falsches `Keine Produkte`
- kein dauerhaftes `Profil wird geladen...`

## Runtime-Befund

Nach Schritt 141 war der Skeleton-Typ bereits Casarita-kompatibel. Im
Zeitverlauf von `mama-mantia/menu` blieb aber ein Restproblem:

- zuerst standen `testfirst-focus-skeleton` und `testfirst-menu-skeleton`
  korrekt zusammen
- kurz vor den echten Produkten konnte der Focus-Skeleton wegfallen, waehrend
  noch ein Menu-Skeleton sichtbar war
- Ursache war ein fruehes `knownEmpty` aus dem Slug-Pfad
  `restaurants/mama-mantia/...`
- dieses slug-basierte `knownEmpty` wurde im Renderer wie bestaetigte
  kanonische Focus-Wahrheit behandelt, obwohl die echte Restaurant-ID
  `RUb9gIPSGoYM2qT3xXxJ` erst danach aufgeloest wurde

## Geaendert

- Public-Menu-Surface-State bestaetigt leeren Focus nur noch, wenn die
  Focus-Wahrheit zur authoritative canonical Restaurant-ID passt.
- Slug-basierte `knownEmpty`-Focus-Wahrheit darf den Focus nicht mehr als
  unavailable markieren.
- Der Renderer betrachtet Focus nur noch als settled-empty, wenn der
  Surface-State diese kanonische Bestaetigung liefert.
- Build-Token:
  `2026-07-01-public-focus-parity-01`.

## Dateien

- `apps/menyra-social/core/profile/public-menu-surface-state-utils.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/index.html`
- `tests/public-menu-surface-state-utils.test.mjs`
- `apps/menyra-social/bundled/**`

## Bewusst nicht geaendert

- Keine Layout-, Farb-, Typografie- oder Design-Aenderung.
- Keine Firebase-Regeln, Functions, Datenstruktur oder Produktlogik.
- Keine QR-, Cart- oder Order-Logik.
- Keine Casarita-Hardcodierung fuer andere Restaurants.
- Kein Branchwechsel.

## Verifikation

Automatisch:

- `node --check apps/menyra-social/core/profile/public-menu-surface-state-utils.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --test tests/public-menu-surface-state-utils.test.mjs tests/public-profile-runtime-controller.test.mjs`
- `npm run build:menyra-social:bundle`

Browser/Runtime:

- `casarita/menu`
- `mama-mantia/menu`
- `in-vino/menu`

jeweils mit:

`?sw-reset=1&debug-build=1&debug-menu-state=1&debug-profile-render=1`

Ergebnis:

- Build-Token: `2026-07-01-public-focus-parity-01`
- `noProductsLogs: 0`
- kein finaler `Profil wird geladen...`-Header
- `standardSkeletonSamples: []`
- `focusMissingWhileMenuSkeleton: []`
- `mama-mantia` wurde zusaetzlich fuenfmal wiederholt; in keinem Lauf erschien
  wieder ein Menu-Skeleton ohne reservierten Focus-Bereich.

## Manuelle Testliste

1. `http://localhost:5183/casarita/menu?sw-reset=1&debug-build=1`
2. `http://localhost:5183/mama-mantia/menu?sw-reset=1&debug-build=1`
3. `http://localhost:5183/in-vino/menu?sw-reset=1&debug-build=1`

Pruefen:

- `debug-build` zeigt `2026-07-01-public-focus-parity-01`.
- Bei `mama-mantia/menu` bleibt der obere Focus-Platzhalter stehen, solange
  darunter noch der Menu-Skeleton steht.
- Es erscheint kein `standard-menu-skeleton`.
- Es erscheint kein kurzes `Keine Produkte`.
- Der Profilkopf bleibt nicht bei `Profil wird geladen...`.
- Wenn Menu-Produkte frueher fertig sind als Focus, duerfen die Produkte
  sichtbar werden; der Focus-Bereich darf dabei nicht kurz leer springen.
