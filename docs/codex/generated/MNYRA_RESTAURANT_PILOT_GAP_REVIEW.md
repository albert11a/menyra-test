# MNYRA Restaurant Pilot Gap Review

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`
Reference commit: `ad8425ae24155fa7fb1f4c3a99c1fbb82bd65f99`
Follow-up scope: Owner Orders list-retention and browser proof added on
2026-07-02 before final verification.

## Scope

This is a hard evidence review after `fix: improve clean web loading stability`.
It does not add product features, deploy, touch production data, loosen
Firestore Rules, rename routes or collections, redesign UI, fix Heart, expand
Shop/Hotel or start runtime extraction.

Verdict: the restaurant pilot is better covered than before, but there is no
clean launch-go from this review. Public profile/menu, QR submit, waiter status,
owner menu editing and basic Owner Orders list/empty/refresh behavior now have
meaningful emulator/browser proof. Forced load errors, disabled/deleted cart
items and real phone/3G QR behavior remain gaps.

## 1. Automated Evidence

| Area                  | Test file                                        | Test name                                                                                                   | Viewport                         | What is proved                                                                                                                                                                                                         | What is not proved                                                                                                        |
| --------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Public Profile        | `tests/e2e/public-profile.spec.ts`               | `opens seeded public profile and posts routes without private field leaks`                                  | Desktop Chrome and mobile Chrome | Seeded restaurant/shop/hotel profile and posts routes open, reload and avoid private markers/dev overlay; loaded images are not broken when present.                                                                   | Real phone/3G, all pilot profile fields, route-not-found behavior, pixel-level image flicker and production image decode. |
| Public Profile        | `tests/e2e/public-profile.spec.ts`               | `does not issue a denied Firestore list during public startup`                                              | Desktop Chrome and mobile Chrome | `/pidhimadh` startup does not emit the targeted denied-list console pattern.                                                                                                                                           | Every possible permission error across all public routes.                                                                 |
| Public Menu           | `tests/e2e/public-menu.spec.ts`                  | `opens seeded public menu and QR routes without private field leaks`                                        | Desktop Chrome and mobile Chrome | `/pidhimadh/menu`, `/pidhimadh/menu?src=qr&table=2`, `/shopdemo/menu` and `/hoteldemo/menu` open and reload; QR params remain; seeded items render without private markers, false empty state or broken loaded images. | Real QR scan, disabled/deleted menu item cart behavior, category-empty UX and full media flicker detection.               |
| Public Menu           | `tests/e2e/public-menu.spec.ts`                  | `shows a clean empty state for a restaurant with no menu items`                                             | Desktop Chrome and mobile Chrome | A local empty restaurant shows `Keine Produkte` without false error or foreign items.                                                                                                                                  | A category with no products inside an otherwise populated menu.                                                           |
| Public Menu           | `tests/e2e/public-menu.spec.ts`                  | `does not show a false menu error while a public menu projection is absent`                                 | Desktop Chrome and mobile Chrome | Missing `public/menu` projection does not become a visible false error.                                                                                                                                                | Forced Firestore/network listener failure.                                                                                |
| QR Menu               | `tests/e2e/public-menu.spec.ts`                  | `keeps QR source stable and avoids invalid table labels`                                                    | Desktop Chrome and mobile Chrome | Valid `src=qr&table=2` survives reload; invalid `table=abc` is sanitized instead of showing `NaN`.                                                                                                                     | Physical QR code scan, camera handoff, real device URL handling.                                                          |
| Cart / Order Submit   | `tests/e2e/qr-menu.spec.ts`                      | `creates a callable table order and exposes it to the waiter`                                               | Desktop Chrome and mobile Chrome | QR cart submit creates exactly one local order even after two submit clicks; order uses canonical restaurant/table/price fields; waiter can see and status-change it.                                                  | Signed-in customer checkout, disabled/deleted item in cart, payment edge cases, real slow-network double taps.            |
| Cart / Order Submit   | `tests/orders-runtime-controller-state.test.mjs` | `order submit keeps one in-flight request for double clicks`                                                | Unit, no viewport                | Submit controller prevents duplicate in-flight order request.                                                                                                                                                          | Browser button visuals or callable server result.                                                                         |
| Cart / Order Submit   | `tests/orders-runtime-controller-state.test.mjs` | `order submit releases loading state after a real submit error`                                             | Unit, no viewport                | Submit loading state releases after a real client error.                                                                                                                                                               | The rendered error path in a browser after server-side menu rejection.                                                    |
| Cart / Order Submit   | `tests/functions/functions-emulator.test.mjs`    | `createRestaurantOrder computes canonical numeric prices and rejects invalid targets`                       | Functions emulator, no viewport  | Callable computes canonical prices and rejects invalid restaurant/menu targets.                                                                                                                                        | A disabled/deleted item already sitting in the browser cart.                                                              |
| Waiter Board          | `tests/e2e/waiter.spec.ts`                       | `limits waiter access and allows only status changes`                                                       | Desktop Chrome and mobile Chrome | Waiter sees only authorized restaurant order, cannot mutate items/total, cannot read a foreign order, can update status and still sees the order after reload/status tab switch.                                       | Waiter with zero open orders, forced order listener error, active-session staff revocation, tablet/manual tap feel.       |
| Waiter Board          | `tests/rules/firestore-security-flows.test.mjs`  | `waiter can read only orders for an authorized restaurant` / `revoked waiter loses restaurant order access` | Rules emulator, no viewport      | Rules deny foreign order access and revoked waiter access.                                                                                                                                                             | Live browser reaction while the session is already open and then revoked.                                                 |
| Owner `/menu`         | `tests/e2e/owner-tool.spec.ts`                   | `restaurant owner creates, edits, publishes and deletes a numeric-price menu item`                          | Desktop Chrome and mobile Chrome | Owner login reaches `/menu`, seeded owner context renders, owner can create/edit/delete/publish a numeric-price menu item and foreign public business view is read-only.                                               | Owner Orders tab, publish/load failure UI, image upload/mutation stability and real mobile manual pass.                   |
| Owner Menu Editor     | `tests/e2e/owner-tool.spec.ts`                   | `restaurant owner creates, edits, publishes and deletes a numeric-price menu item`                          | Desktop Chrome and mobile Chrome | Menu editor CRUD and public projection eventually reflect numeric price/name updates.                                                                                                                                  | Menu image replacement flicker, delete failure, publish failure and button recovery after server errors.                  |
| Owner QR Tables       | `tests/e2e/owner-tool.spec.ts`                   | `restaurant owner creates, edits, publishes and deletes a numeric-price menu item`                          | Desktop Chrome and mobile Chrome | Seeded QR table controls are visible with count `12`, including table 1 and table 12.                                                                                                                                  | Saving QR table settings, generated QR downloads/print, real scan and disabled/no-table state.                            |
| Owner Order Dashboard | `tests/e2e/owner-tool.spec.ts`                   | `restaurant owner orders stay visible and scoped after refresh`                                             | Desktop Chrome and mobile Chrome | Restaurant owner can open `/orders`, see the seeded own order, keep it visible after refresh and not see a foreign shop order.                                                                                         | Forced listener/load error, live revocation, real phone behavior and full order operations.                               |
| Owner Order Dashboard | `tests/e2e/owner-tool.spec.ts`                   | `shop owner orders empty state is stable and not cross-filled`                                              | Desktop Chrome and mobile Chrome | Shop owner can open `/orders` with no shop orders and sees `Noch keine Bestellungen` without cross-filled restaurant orders.                                                                                           | Exact restaurant zero-order case and forced listener/load error.                                                          |
| Owner Order Dashboard | `tests/rules/firestore-security-flows.test.mjs`  | `owner and CEO restaurant order access follows existing admin contract`                                     | Rules emulator, no viewport      | Owner can read/list own restaurant orders and cannot read/list another restaurant's orders; CEO read/list but no update/delete.                                                                                        | UI entry, empty state, loading state, error state and stale/foreign visual behavior.                                      |

## 2. Owner Order Dashboard Hard Check

| Question                      | Evidence                                                                                                                                                                                                                              | Assessment                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Is there an Owner Orders tab? | Generic `orders` tab exists in `apps/menyra-social/core/router/public-business-route-utils.js` and drawer nav includes `data-nav="orders"` in `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`.                    | Yes, code-level entry exists.                                                            |
| Where is it rendered?         | `apps/menyra-social/core/ui/main-shell-render-utils.js` renders `renderOrdersView()` when `state.activeTab === "orders"`; `apps/menyra-social/core/app-shell/shell-ui-runtime-cluster.js` wires this to `renderOrdersViewCore`.       | Generic shell render path exists.                                                        |
| Which route/tab opens it?     | `APP_TAB_PATHS.orders` maps to `/orders`; `normalizeInitialTab` accepts `orders`; drawer button uses `data-nav="orders"`.                                                                                                             | Route and nav path exist in code.                                                        |
| What data does it read?       | `startOrdersListener` reads `restaurants/{restaurantId}/orders` for business profiles and `users/{uid}/orders` for non-business users; guest mode uses local recovered-order lookup.                                                  | Intended split now has owner browser proof for own restaurant list and shop empty state. |
| Loading/empty/error states?   | `renderOrdersViewCore` has loading text, error text and `Noch keine Bestellungen`; listener error sets `Bestellungen konnten nicht geladen werden.`                                                                                   | First-load and empty are covered; forced listener error remains unproven in browser.     |
| Bound to owner restaurantId?  | Listener resolves `restaurantId` from `state.userProfile` through `resolveProfileRestaurantId` and gates restaurant orders with `canAccessRestaurantOrders`.                                                                          | Intended binding exists.                                                                 |
| Can it see foreign orders?    | Code scopes the restaurant query to resolved owner restaurant; Rules test denies owner read/list on `restaurants/other-restaurant/orders`; Owner E2E injects a foreign shop order and confirms it is not visible to restaurant owner. | Rules and browser proof now exist for the covered foreign-order case.                    |
| Browser E2E?                  | `tests/e2e/owner-tool.spec.ts` now opens `/orders` for restaurant owner and shop owner.                                                                                                                                               | Partial yes: list, refresh, empty and foreign non-visibility are covered.                |
| Unit coverage?                | `tests/orders-render-utils.test.mjs` covers row retention during refresh loading/error. `tests/orders-runtime-controller-state.test.mjs` covers submit state.                                                                         | Partial yes; listener failure is not simulated end-to-end.                               |
| Rules coverage?               | `tests/rules/firestore-security-flows.test.mjs` covers owner/CEO own vs foreign order access.                                                                                                                                         | Yes for permissions only.                                                                |

Hard finding update: the existing UI entry now has targeted automated proof for
owner own-order list, refresh retention, owner empty state and foreign-order
non-visibility. Treat Owner Order Dashboard as a remaining P1 gap only for
forced load/error behavior and full operational order management. Do not build a
new dashboard in this gap review.

## 3. Missing Error And Edge Cases

| Case                                                            | Tested? | Where                                                                                                                                              | Risk                                                                                | Priority |
| --------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| Owner without Orders                                            | Partial | Shop owner E2E opens `/orders` with no shop orders and sees `Noch keine Bestellungen`. Restaurant owner zero-order state is not separately forced. | Owner may still need exact restaurant zero-order proof before first pilot shift.    | P2       |
| Owner Orders load error                                         | No      | Code has listener error state; no forced failure test.                                                                                             | Owner ops may show stale or unclear data if orders listener fails.                  | P1       |
| Waiter Orders load error                                        | No      | `apps/waiter/waiter-app.js` sets `sessionError` and `ordersLoaded`; no forced failure E2E/unit.                                                    | Waiter may look stuck or empty on permission/network failure.                       | P1       |
| Public route not found                                          | No      | Route guards/unit coverage reduce stale fallback risk, but no browser `/unknown` not-found spec.                                                   | Unknown slug could look like a broken page or wrong business if regression returns. | P2       |
| Disabled/deleted Menu Item in Cart                              | Partial | Functions emulator rejects invalid targets; no browser cart test for item disabled/deleted after being added.                                      | Guest could get unclear checkout failure or stale price/item state.                 | P1       |
| Category without Products                                       | Partial | Full empty restaurant E2E exists; public-menu state unit filters hidden/empty truth; no category-only empty browser fixture.                       | Category UI could look broken even when menu has other items.                       | P2       |
| Waiter without open Orders                                      | Partial | Code empty state says `Alles erledigt`; waiter E2E has an order and then status tab.                                                               | Empty board could look like loading/error in a live quiet period.                   | P2       |
| Staff revoked during active Session                             | Partial | Rules test proves revoked waiter loses access; no browser session that is revoked after login.                                                     | Open waiter tablet could keep stale UI or fail unclearly after revocation.          | P1       |
| Signed-in customer order                                        | Partial | Rules prove buyer can read own order and client strips unsafe order fields; QR browser order is guest/table.                                       | Logged-in customer checkout path may diverge from guest QR.                         | P2       |
| Full three-hop `/pidhimadh/menu` -> `/shopdemo/menu` -> `/menu` | Partial | Owner-return E2E covers `/shopdemo/menu` -> `/menu` after owner context and verifies no shop bleed; exact three-hop path is not tested.            | Context leakage could still hide in the exact public-public-owner sequence.         | P2       |

## 4. Report Corrections

Reports checked for over-positive language:

| Report                                                           | Finding                                                                                                                               | Correction                                                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `docs/codex/MNYRA_ENTERPRISE_ROADMAP.md`                         | P1 criteria implied signed-in orders, device registration/notifications, Owner Orders and Heart support were ready enough for launch. | Updated P1 criteria to require proof before launch and state current gaps.                                    |
| `docs/codex/generated/BUSINESS_TOOL_TEST_MATRIX.md`              | Matrix already blocked Owner Orders, but needed a hard cross-link to this review.                                                     | Added gap-review update with Owner Orders, signed-in orders and real-device limits.                           |
| `docs/codex/generated/P0_BROWSER_LAUNCH_REHEARSAL.md`            | Rehearsal was mostly cautious, but needed explicit hard-review result.                                                                | Added gap-review update: no launch approval, Owner Orders not browser-proven and real mobile/3G still manual. |
| `docs/codex/generated/MNYRA_RESTAURANT_PILOT_READINESS_AUDIT.md` | The audit says the extension improved coverage but does not approve launch.                                                           | No over-positive correction required; this gap review supersedes broad confidence claims.                     |

## 5. Open Pilot Gaps

| Priority | Gap                                        | Why it blocks or remains manual                                                                                                                                                 |
| -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Owner Order Dashboard forced error proof   | Basic list/empty/refresh/non-foreign proof now exists; forced listener/load error remains unproven.                                                                             |
| P1       | Owner/Waiter order load failures           | Permission/security happy paths exist, but forced listener failure behavior is not automated.                                                                                   |
| P1       | Disabled/deleted cart item                 | Server rejects invalid targets, but stale browser cart UX is not tested.                                                                                                        |
| P1       | Staff revoked during active waiter session | Rules prove access loss; browser reaction while open is unknown.                                                                                                                |
| P1       | Real phone/3G QR and waiter tablet pass    | Playwright mobile emulation is not a real phone, camera, network or touch-device rehearsal.                                                                                     |
| P2       | Public not-found route                     | Needs direct browser check for unknown slug/error state.                                                                                                                        |
| P2       | Signed-in customer order                   | Rules/client contract exist; browser checkout variant is missing.                                                                                                               |
| P2       | Category without products                  | Full empty menu is covered; category-only empty UX is not.                                                                                                                      |
| P2       | Exact three-hop context switch             | Near path is covered; exact `/pidhimadh/menu` -> `/shopdemo/menu` -> `/menu` remains untested.                                                                                  |
| P2       | Emulator seed/export drift                 | First Playwright run used imported local export with QR count `0` and missing shop seed items; fresh `npm run emulators:seed` was required before the same mobile specs passed. |

## Checks

Final check result for this report-only change:

- Owner Orders follow-up pre-checks passed:
  `node --test tests/orders-render-utils.test.mjs tests/orders-runtime-controller-state.test.mjs`
  5/5, and
  `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/owner-tool.spec.ts --project=mobile-chrome --grep "orders"`
  2/2.
- `npm run test:unit` passed, 130/130.
- `npm run test:rules` passed, 17/17. The visible `PERMISSION_DENIED` output is
  from expected negative Rules assertions.
- `npm run test:functions` first failed because the local emulator hub,
  Functions and logging ports were not running while Firestore port 8080 was
  occupied by a stale local Java emulator. After restarting the local emulator
  set, `npm run test:functions` passed, 4/4.
- `npm run lint` passed.
- `npm run format:check` passed.
- `npm run arch:check` passed.
- `npm run build` passed with the known large `social-app.js` chunk warning.
- Relevant mobile Playwright command passed after a fresh local emulator seed:
  `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/public-profile.spec.ts tests/e2e/public-menu.spec.ts tests/e2e/qr-menu.spec.ts tests/e2e/owner-tool.spec.ts tests/e2e/waiter.spec.ts --project=mobile-chrome`
  passed, 12/12.
- The first mobile Playwright attempt before reseeding passed QR/Waiter and the
  new public menu fixture cases but failed seeded Owner/Public Profile/Menu
  assertions because local seed data was stale. This is test-environment
  evidence, not a product fix.

Owner Orders follow-up final verification:

- First `npm run test:functions` attempt failed and hung because Emulator Hub
  `4400` and Functions `5001` were not running while partial local emulator
  state existed. The hung test process was stopped, the full local emulator set
  was started, and `npm run emulators:seed` was run.
- Re-run `npm run test:functions` passed, 4/4.
- `npm run test:rules` passed, 17/17.
- `npm run test:unit` passed, 133/133.
- `npm run lint` passed.
- `npm run format:check` passed.
- `npm run arch:check` passed.
- `npm run build` passed with the known large `social-app.js` chunk warning.
- Relevant Playwright passed, 29/29 with one intentional desktop Heart skip:
  Public Profile/Menu/QR, Owner/Menu/Orders, Waiter and mobile Heart.
- Local server checks passed for `http://127.0.0.1:5173/` and
  `http://192.168.1.168:5173/`.
- `agent-browser` CLI was not available in this environment; browser evidence
  for this follow-up is the Playwright run above.

## Bundle Status

Owner Orders follow-up build changed tracked browser output:

- `apps/menyra-social/bundled/entry/social-app.js`

No tracked bundle manifest or hashed chunk file changed. The changed tracked
bundle belongs to the browser-visible Orders renderer fix and must be included
with the source change.

## Mobile Manual Stability Sweep 2026-07-02

The new mobile sweep is documented in
`MNYRA_MOBILE_MANUAL_STABILITY_SWEEP.md`. Restaurant profile/menu/QR,
Owner Menu/Orders and Waiter stayed correctly scoped on normal-network mobile
emulation. Two bounded fixes landed: local Public/QR bootstrap no longer calls
production Functions, and failed responsive menu images no longer retry in a
request loop.

There is still no pilot launch-go. Public restaurant profile/menu stayed blank
for about 11.1 seconds on Fast 3G and 41.8 seconds on Slow 3G. Real phone QR,
image decode and waiter tablet behavior remain untested. The separate Heart
mobile diagnostic reproduced Search focus loss; Heart was not fixed in this
scope. Feed also still logs a denied story collection-group read.
