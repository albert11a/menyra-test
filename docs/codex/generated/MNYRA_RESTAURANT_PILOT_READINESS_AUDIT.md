# MNYRA Restaurant Pilot Readiness Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Scope

This is the Restaurant Pilot extension to the Clean Web pass. It focuses on the
restaurant slice: guest public profile/menu, QR table order, waiter board and
owner `/menu`. It does not deploy, touch production data, loosen Firestore
Rules, rename routes or collections, redesign UI, activate ads/analytics or
start runtime extraction.

All new automated data uses local emulator fixtures only.

## Data Loading Map

| Area                                   | Data loaded                                                                | Source path / projection                                                                                                   | Load trigger                                | Loading owner                                                                                 | Error owner                        | Empty result                                                                               | Refresh / stale result handling                                                                                         | Restaurant binding                                                             |
| -------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Public Profile `/:slug`                | route identity, public profile/meta, posts header context, optional offers | `publicRoutes/{slug}`, `restaurants/{id}`, `restaurants/{id}/public/profile`, `public/meta`, `public/offers`, social posts | direct route/open profile flow              | `state.profileView`, startup surface status                                                   | profile open/runtime cluster       | profile may render public header fallback; missing route is not accepted as business truth | route payload/canonical id guard prevents stale profile/menu handoff                                                    | slug resolves to canonical `restaurantId`; stale public context rejected       |
| Public Menu `/:slug/menu`              | profile identity, public menu items, menu meta, optional focus/offers      | `publicRoutes/{slug}`, `restaurants/{id}/public/menu`, `public/meta`, `public/offers`                                      | direct menu route, tab switch, refresh      | `session-data-runtime-controller.loadMenuForRestaurant` and `public-menu-surface-state-utils` | menu truth `error` only            | `knownEmpty` on canonical restaurant shows `Keine Produkte`                                | transient `unknown`/missing projection does not show false error or foreign menu; old wrong-business items are rejected | canonical `restaurantId` and target-id list required before confirmed empty    |
| QR Menu `/:slug/menu?src=qr&table=...` | same public menu plus QR table context                                     | same as Public Menu; table context from URL/profile view/cart context                                                      | QR route direct load/refresh                | route/query sync plus shop-cart context                                                       | route/menu/order controllers       | invalid table is sanitized; valid table remains in query                                   | valid `src=qr&table=2` survived refresh in mobile E2E; invalid `table=abc` drops table instead of showing `NaN`         | order request carries `restaurantId`, `tableNumber`, `source: qr`              |
| Cart / Order Submit                    | cart items and untrusted order intent                                      | client state -> callable `createRestaurantOrder`; server reads canonical menu                                              | checkout submit                             | `orders-runtime-controller.submitShopCheckout`                                                | checkout catch sets visible status | empty cart submit is ignored; no spinner                                                   | in-flight guard blocks double submit; after error loading releases                                                      | callable request includes `restaurantId`; server pricing stays source of truth |
| Waiter Board                           | staff access, restaurant meta, orders                                      | `users/{uid}`, `restaurants/{id}`, `restaurants/{id}/staff/{uid}`, `restaurants/{id}/orders`                               | login/auth change and order listener        | `state.sessionLoading`, `state.ordersLoaded`                                                  | waiter listener/session error      | after first load, empty board shows `Alles erledigt`, not error                            | snapshot refresh replaces order rows only after listener returns; status refresh keeps board visible                    | staff/owner access resolves one `restaurantId`; foreign order read denied      |
| Owner `/menu`                          | owner profile, restaurant meta, editor menu, public menu, QR config        | `users/{uid}`, `restaurants/{id}`, `restaurants/{id}/menuItems`, `public/menu`, restaurant QR fields                       | protected `/menu` after login and owner tab | menu/admin render and session data runtime                                                    | menu save/load controllers         | owner with no items shows editor empty state; not a public error                           | save/publish uses public retention; wrong public business context is cleared on return                                  | owner profile and restaurant ownership map to signed-in restaurant             |
| Owner Menu Editor                      | editable items, media fields, public projection                            | `restaurants/{id}/menuItems`, `restaurants/{id}/public/menu`                                                               | create/edit/delete/publish                  | menu modal/save utils                                                                         | save/delete/publish catch          | item/category absence remains editor empty state                                           | mutation E2E confirms public projection eventually sees numeric price                                                   | item writes use owner `restaurantId` only                                      |
| Owner QR Tables                        | table count/enabled fields and generated links                             | `restaurants/{id}` QR/table fields                                                                                         | owner `/menu` render and save               | table QR runtime/controller                                                                   | table QR status/error              | zero/disabled tables should show no QR table list                                          | current seed shows tables 1-12 stable                                                                                   | QR links use owner restaurant slug and table number                            |
| Owner Order Dashboard                  | owner order visibility                                                     | `restaurants/{id}/orders` through orders runtime when active                                                               | owner Orders tab, if used                   | orders runtime                                                                                | orders runtime error               | owner without orders should show empty orders state                                        | not fully browser-proven in this task                                                                                   | must remain owner restaurant scoped                                            |

## Loading State Matrix

| Flow                        | Expected pilot behavior                                           | Evidence                                              | Status                                             |
| --------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| Public profile first load   | Header renders without private data; image fallback exists        | existing public profile E2E; Clean Web reports        | Passed locally                                     |
| Public menu first load      | Does not flash `Keine Produkte` before canonical menu truth       | `public-menu-surface-state-utils` and public menu E2E | Passed locally                                     |
| QR menu refresh             | Keeps valid `src=qr&table=2`                                      | mobile public menu E2E with reload                    | Passed locally                                     |
| Owner menu editor slow load | Should show editor loading/empty, not public error                | existing owner E2E plus code audit                    | Passed for seed; manual slow device still required |
| Waiter refresh/status       | Board remains visible after status change and reload              | updated mobile waiter E2E                             | Passed locally                                     |
| Order submit                | Button cannot create duplicate orders during double click         | updated QR E2E and order controller unit test         | Passed locally                                     |
| Heart Leads                 | Rows retained during refresh, but real image flicker remains open | existing Heart diagnostic/report                      | P1 open outside restaurant pilot core              |

## Empty State Matrix

| Empty case                           | Expected state                                       | Evidence                                            | Status                             |
| ------------------------------------ | ---------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| Restaurant without menu              | Shows `Keine Produkte`, not error or endless loading | new emulator fixture in public menu E2E             | Passed locally                     |
| Menu category without products       | Should not show false global menu error              | not separately modeled in current public projection | P2 manual/future test              |
| Waiter without open orders           | Shows `Alles erledigt` after `ordersLoaded`          | code audit; waiter E2E covers board after status    | Partially covered                  |
| Owner without orders                 | Should show owner orders empty state                 | not durable browser-proven                          | P1 manual/blocker before pilot ops |
| Public business without focus/offers | Menu must render when focus is empty                 | existing public menu/focus unit coverage            | Passed in unit                     |
| QR table without active order        | Menu/cart can open; no stale order is shown          | QR route/order lookup behavior reviewed             | Manual QR rehearsal required       |

## Error State Matrix

| Error case                          | Expected state                                                                           | Evidence                                                                       | Status                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| Public route not found              | No foreign business fallback; route should not show another menu                         | route resolver/context guards reviewed                                         | P2 manual browser case still needed            |
| Menu load failure                   | Error only when menu truth is real `error`; normal missing projection is not false error | new unit test and missing-projection E2E                                       | Passed locally                                 |
| Order submit failure                | Loading releases, checkout stays open, status says send failed                           | new order controller unit test                                                 | Passed in unit                                 |
| Waiter order load failure           | Listener sets session/order error and loaded state                                       | code audit                                                                     | P1 manual/error-injection gap                  |
| Owner order load failure            | Should show orders error, not stale/foreign orders                                       | not covered                                                                    | P1 blocker before owner order dashboard launch |
| Invalid table ID                    | Sanitized; no `Tisch NaN`; invalid table is dropped                                      | new mobile public menu E2E                                                     | Passed locally                                 |
| Disabled/deleted cart item          | Server callable must reject or reprice from canonical menu                               | order callable/server-pricing tests exist; disabled item UI case not simulated | P1 manual/function test gap                    |
| Permission denied on foreign orders | UI does not show foreign order; direct read/write denied                                 | waiter E2E and rules tests                                                     | Passed locally                                 |

## Slow/Refresh/Race State Matrix

| Race case                                        | Expected result                                    | Evidence                                                         | Status           |
| ------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------- | ---------------- |
| Refresh while menu loads                         | No false empty/error and no foreign menu           | public menu state tests and E2E reload                           | Passed locally   |
| Public business -> Owner `/menu`                 | Own menu/focus restored, no shop data bleed        | existing owner-return E2E                                        | Passed locally   |
| `/pidhimadh/menu` -> `/shopdemo/menu` -> `/menu` | Owner context must not inherit shop menu           | covered by owner-return path; full three-hop manual still useful | Passed partially |
| Order submit and immediate second click          | Exactly one new order                              | updated QR E2E plus unit in-flight guard                         | Passed locally   |
| Waiter status then refresh                       | Order remains visible under next status tab        | updated waiter E2E                                               | Passed locally   |
| Owner publish then public menu open              | Public projection eventually contains numeric item | owner E2E                                                        | Passed locally   |

## Mobile Result

Mobile Chrome targeted Playwright passed 6/6 for the new/affected Restaurant
Pilot checks:

- public menu seeded route, QR reload, empty menu and missing projection;
- invalid QR table sanitizing;
- QR order double-submit protection;
- waiter status update plus refresh visibility.

The MCP browser gutcheck rendered meaningful public menu content on mobile, but
without the E2E fixture it produced many `images.example.local` DNS errors from
local fake seed URLs. The Playwright fixture fulfills those fake image URLs with
a local SVG, so the automated browser assertions are not network-dependent.
Real phone/3G image-decode behavior remains manual.

## Remaining Blockers

| Priority | Blocker                                 | Why it remains                                                                                             |
| -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| P1       | Owner order-dashboard operation         | Restaurant pilot ops need owner visibility/empty/error handling for orders; not fully browser-proven here. |
| P1       | Disabled/deleted menu item in cart      | Server pricing is covered, but UI/cart disabled-item behavior needs a focused server/error simulation.     |
| P1       | Waiter/owner order load error injection | Permission and happy-path are covered; forced listener failure is still manual/unit-only.                  |
| P1       | Real device QR/table rehearsal          | Browser emulation cannot prove phone camera scan, mobile network, GPU image decode or tap feel.            |
| P1       | Heart Leads image/Search flicker        | Open from Clean Web rollback; outside core restaurant order loop but relevant to CEO support readiness.    |
| P2       | Category-without-products UI            | Needs a projection/category fixture if category-level empty UX becomes pilot-critical.                     |
| P2       | Shop/hotel media mutations              | Not part of restaurant pilot, still open in Clean Web vertical coverage.                                   |

## Checks Added In This Task

- `tests/orders-runtime-controller-state.test.mjs`
- `tests/public-menu-surface-state-utils.test.mjs` error-truth regression
- `tests/e2e/public-menu.spec.ts` empty menu, missing projection, QR reload and
  invalid table checks
- `tests/e2e/qr-menu.spec.ts` double-submit order check
- `tests/e2e/waiter.spec.ts` status-refresh visibility check

## Final Verification

- `node --test tests/public-menu-surface-state-utils.test.mjs tests/orders-runtime-controller-state.test.mjs tests/create-restaurant-order-client.test.mjs` passed, 23/23.
- `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/public-menu.spec.ts tests/e2e/qr-menu.spec.ts tests/e2e/waiter.spec.ts --project=mobile-chrome` passed, 6/6.
- `npm run test:functions` passed, 4/4.
- `npm run test:rules` passed, 17/17. Permission-denied console output is from
  expected negative Rules assertions.
- `npm run test:unit` passed, 130/130.
- `npm run lint` passed.
- `npm run format:check` passed.
- `npm run arch:check` passed.
- `npm run build` passed with the existing large `social-app.js` chunk warning.
- Relevant Playwright matrix passed, 25/25 with 1 intentional desktop Heart
  skip: Public Profile/Menu/QR, Owner/Menu, Waiter and mobile Heart diagnostics.

## Bundle Status

`npm run build` changed no tracked bundle files. No files under
`apps/menyra-social/bundled` were modified by this task.

## Mobile Manual Stability Sweep 2026-07-02

The restaurant pilot passed the covered normal-network mobile profile, menu,
QR, Owner Orders and Waiter status/refresh paths. QR kept `src=qr&table=2` over
back, forward and refresh. Emulator startup is now production-isolated, and a
failed responsive menu image settles on a fallback without an unbounded retry
loop.

Pilot readiness remains blocked by the measured blank public startup under
emulated 3G (about 11.1 s Fast / 41.8 s Slow), safe physical-phone LAN emulator
setup, real QR/media decode and forced Owner/Waiter listener-error evidence.
This is not a launch-go.
