# PWA Gate/Location Notes - 2026-04-07

## Problem

Browser Safari and the installed iPhone PWA do not paint the same way.
The installed PWA runs inside iOS standalone/WKWebView, and that changes how safe-area, bounce overscroll, fixed layers, and sticky headers are composited.

## Stable Setup

- Scope every gate/location fix to `html.is-standalone.feed-location-gate-active` or `html.is-standalone:has(#feedLocationGate)`.
- Leave browser and non-standalone rendering untouched.
- Use a fixed smart header only for standalone gate/location. Do not change the browser header mode.
- Keep `main.feed-location-gate-main` at `padding-top: 0`.
- Put the visual header offset into `#feedLocationGate .loc-shell`, so the area under the fixed header stays blue instead of exposing the white page background.
- Keep the standalone gate underlay flat: white viewport base via `body::before`, blue top cap via `body::after`.
- Avoid gradient underlays for the standalone gate. They can create subtle seams during iOS pull-down overscroll.
- Do not attach safe-area filler to the header shell itself. That was one cause of header jitter.
- After every standalone gate CSS/runtime change, bump the version token in `apps/menyra-social/index.html` so the installed PWA does not stay on stale cached assets.

## Map Search Rule

Selecting a city in the location gate must center the map and place the user marker, but it must not write that city into `#mapSearchInput`.
`#mapSearchInput` is the live marker filter. Auto-filling it hides pins and makes the map look incomplete.
Manual typing in the map search must continue to filter markers as before.

## Files

- `apps/menyra-social/index.html`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`

## Test Checklist

- Close the PWA completely and reopen it after deploy.
- Gate/location top overscroll stays blue.
- Gate/location bottom overscroll stays white.
- No white gap between header and hero.
- No visible seam between header and hero during top pull-down.
- Header stays stable while scrolling in standalone gate/location.
- After selecting a city, the map centers correctly, the user marker is shown, the map search input stays empty, and all pins remain visible until the user types a manual filter.
