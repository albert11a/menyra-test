# MNYRA Business Context Leak Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Scope

This P0 audit covers the Business/Profile/Menu/Focus context bleed where a
signed-in business owner could visit another public business and then return to
the own profile or owner menu with stale Menu/Focus data from the previously
visited business still visible.

This fix does not deploy, touch production data, loosen Firestore Rules, rename
routes or collections, redesign UI, activate ads/analytics or start public
runtime extraction.

## Reproduced Flow

| Flow                                                                                                                    | Result before fix                                                                                                                                                                        | Evidence                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Restaurant owner logs in at `/menu`, opens `/shopdemo/menu`, then returns with browser Back to `/menu` on mobile Chrome | Owner header/context returns to `PIDHImadh`, but the root cause allowed stale public direct-entry Menu/Focus state from `shop-demo` to remain eligible for owner profile/menu rendering. | Mobile Playwright regression added in `tests/e2e/public-profile.spec.ts`.    |
| Unit-level owner profile reopen with stale `__webDirectEntry`, `state.menu` and `state.focus` set to `shop-demo`        | `openOwnBusinessProfile` previously cleared `profileView` but did not deactivate the stale public route/direct-entry context or retarget wrong-business Menu/Focus state.                | `tests/profile-open-flow-utils.test.mjs` now reproduces this state directly. |

## Root Cause

`openOwnBusinessProfile()` switched the app back to the signed-in profile by
clearing `state.profileView`, but it left public direct-entry state active:

- `state.__webDirectEntry` could still describe the previously visited public
  business.
- `state.__publicRouteBootstrap` could still point at the previous public route.
- `state.menu` and `state.focus` could still contain public Menu/Focus payloads
  for a different `restaurantId`.
- General `[data-nav="profile"]` handlers bypassed `openOwnBusinessProfile()`
  and directly set `activeTab/profileTopTab`, so stale public context could
  survive normal profile navigation.

Existing public menu/focus target guards already reject stale reads for the
wrong target. The missing step was making the owner-return path establish the
own business target before rendering.

## Affected State Areas

| State area                     | Risk                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| `state.__webDirectEntry`       | Kept old public route priority after returning to own profile. |
| `state.__publicRouteBootstrap` | Could keep the public bootstrap target from a previous slug.   |
| `state.menu`                   | Could retain items for the previous public business.           |
| `state.focus`                  | Could retain focus/offers for the previous public business.    |
| App shell profile nav          | Could bypass the own-profile opener and skip cleanup.          |
| Feed delegated profile nav     | Could bypass the own-profile opener and skip cleanup.          |

## Fix

The fix is intentionally small and scoped:

- `openOwnBusinessProfile()` now deactivates active `__webDirectEntry` and
  clears `__publicRouteBootstrap`.
- Wrong-business public `state.menu` and `state.focus` payloads are retargeted
  to the signed-in business and emptied while the own business data loads. This
  avoids showing foreign data without blindly clearing matching own data.
- Opening the own Menu tab now calls `ensureMenuData(state.userProfile)` and
  `ensureFocusData(state.userProfile)` so reloads use the signed-in business
  profile explicitly.
- Shell and feed profile navigation now route through
  `openOwnBusinessProfile()` instead of only setting `activeTab/profileTopTab`.

## Test Evidence

| Test                                                                                                                                               | Result                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `node --test tests/profile-open-flow-utils.test.mjs`                                                                                               | Passed, includes stale `shop-demo` Menu/Focus state retargeted to `pidhi-madh`. |
| `node --test tests/public-menu-surface-state-utils.test.mjs`                                                                                       | Passed, includes wrong-target public Menu/Focus rejection coverage.             |
| `node --test tests/profile-business-menu-runtime-cluster.test.mjs`                                                                                 | Passed.                                                                         |
| `npx playwright test tests/e2e/public-profile.spec.ts --config tests/e2e/playwright.config.ts --project=mobile-chrome -g "business owner returns"` | Passed on mobile Chrome after local emulator seed.                              |

## Mobile Result

Mobile Chrome is the primary evidence for this P0. The new mobile regression:

- logs in as `owner.local@example.test`;
- opens public `/shopdemo/menu`;
- verifies `Local Shop Demo` and `Local Cotton Shirt` are visible;
- returns to owner `/menu`;
- verifies `PIDHImadh`, `Local Breakfast Plate` and `Lunch Combo` are visible;
- verifies `Local Cotton Shirt` and `Shop Focus` are not visible;
- reloads and verifies the foreign shop item remains absent.

## Remaining Risks

| Risk                                                                                                                                         | Priority          | Required follow-up                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| Shop-owner and hotel-owner return flows are covered by the generic owner-context code path but not by a dedicated mobile E2E in this commit. | P1 follow-up      | Add vertical-specific mobile Playwright cases when shop/hotel mutation coverage is expanded. |
| Real phone/3G behavior can still reveal image decode or route-history timing issues that browser emulation cannot prove.                     | P2 manual         | Run real-device owner/public-route return rehearsal before pilot launch.                     |
| Heart Leads image/Search flicker remains open after the reverted `f3963b07` follow-up.                                                       | P1 separate block | Diagnose mobile-first before any new Heart fix.                                              |

## Verification Status

Final verification is green:

| Check                                       | Result                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `npm run test:functions`                    | Passed, 4/4.                                                                        |
| `npm run test:rules`                        | Passed, 17/17; expected denied-path permission logs were emitted by negative tests. |
| `npm run test:unit`                         | Passed, 124/124.                                                                    |
| `npm run lint`                              | Passed.                                                                             |
| `npm run format:check`                      | Passed.                                                                             |
| `npm run arch:check`                        | Passed, no dependency violations.                                                   |
| `npm run build`                             | Passed; existing large `social-app.js` chunk warning remains.                       |
| Mobile Playwright Public Profile/Menu/Owner | Passed, 7/7 on `mobile-chrome`.                                                     |
| Mobile Playwright QR Menu                   | Passed, 1/1 on `mobile-chrome`.                                                     |

Bundle status: `npm run build` changed tracked browser bundle output that
belongs to this source change:

- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- deleted
  `apps/menyra-social/bundled/chunks/profile-open-flow-utils-nDcq3JLz.js`
- added
  `apps/menyra-social/bundled/chunks/profile-open-flow-utils-DRWhfuTW.js`
