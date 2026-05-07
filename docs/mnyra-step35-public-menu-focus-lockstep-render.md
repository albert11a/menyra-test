Status: CURRENT
Last updated: 2026-05-07

# Schritt 35: Public-Menu und Fokus im Lockstep rendern

## Ziel

Fokus soll fuer die sichtbare Public-Menu-Flaeche nicht mehr nachtraeglich als
separater Zusatz oberhalb bereits sichtbarer Menu-Produkte erscheinen. Menu und
Fokus sollen aus Nutzersicht als eine gemeinsame Menu-Praesentation sichtbar
werden.

## Befund

Der bisherige Renderer behandelte Fokus ausdruecklich als optional:

- Menu-Items durften sichtbar werden, sobald die Public-Menu-Wahrheit `ready`
  war.
- Fokus wurde separat nachgeladen und konnte danach oberhalb der Produkte
  erscheinen.

Das ist technisch schnell, erzeugt aber genau den sichtbaren Sprung, wenn Fokus
kurz nach dem Menu settled.

## Geaendert

- `resolveVisiblePublicMenuSurfaceState(...)` hat eine neue Option
  `coordinateFocusWithMenu`.
- In diesem koordinierten Modus bleibt `menu.status` die echte Menu-Wahrheit,
  aber `menu.canRenderItems` wird erst `true`, wenn Fokus fuer dieselbe Public-
  Surface settled ist: `ready`, `empty` oder `error`.
- Der Public-Menu-Renderer nutzt diesen Modus fuer Restaurant-/Cafe-Menu-
  Oberflaechen.
- Wenn Menu schon bereit ist, Fokus aber noch laedt, bleibt die sichtbare
  Menu-Flaeche im Loading-Zustand statt Produkte ohne Fokus zu rendern.
- Der Fokus-Prefetch bleibt vor/parallel zum Menu-Read aktiv.
- Social-App- und Public-Entry-Build-Token wurden auf
  `2026-05-07-public-menu-focus-lockstep-01` hochgezogen und das Bundle wurde
  neu gebaut.

## Warum das gegen Springen hilft

Fokus kann nicht mehr nachtraeglich oberhalb bereits sichtbarer Menu-Produkte
eingeschoben werden. Es gibt nur noch diese sichtbaren Faelle:

- Fokus ist bereit: Fokus und Menu erscheinen im selben Render.
- Fokus ist leer/deaktiviert: Menu erscheint ohne Fokus.
- Fokus-Read scheitert: Menu erscheint ohne spaeten Fokus-Sprung, Fehler bleibt
  auf Fokus-/Truth-Ebene statt die Menu-Produkte nachtraeglich zu verschieben.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/public-menu-surface-state-utils.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/social-public-entry.js`
- `apps/menyra-social/social-public-bundled-entry.js`
- `apps/menyra-social/bundled/entry/social-public-entry.js`
- `tests/public-menu-surface-state-utils.test.mjs`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step34-social-app-cache-version-bump.md`
- `docs/mnyra-step35-public-menu-focus-lockstep-render.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine Firebase Rules.
- Keine Functions.
- Keine Datenpfade.
- Keine QR-, Warenkorb-, Tisch- oder Produktlogik.
- Kein Smoke-Test, kein Playwright.

## Validierung

- `node --check apps/menyra-social/core/profile/public-menu-surface-state-utils.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --test tests/public-menu-surface-state-utils.test.mjs`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/entry/social-public-entry.js`
- `git diff --check`

## Manuell testen

- Desktop normal `/:slug/menu?sw-reset=1` einmal laden, danach normale URL.
- Menu mit vorhandenen Fokus-Items kalt laden: Fokus darf nicht spaet oberhalb
  bereits sichtbarer Produkte einspringen.
- Menu ohne Fokus-Items kalt laden: Menu soll erscheinen, sobald Fokus als leer
  erkannt ist.
- QR-Link pruefen: Menu offen, Tisch-/Warenkorb-Kontext korrekt.
- Entdecker-Karte zu anderem Business oeffnen: kein alter Fokus oder altes Menu.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Rest-Risiko: Wenn der Fokus-Read auf einem Netzwerk sehr langsam ist, bleibt das
Menu etwas laenger im Loading-Zustand. Das ist bewusst, weil es den sichtbaren
Sprung verhindert.
