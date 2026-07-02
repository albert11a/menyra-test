# MNYRA UI Stability Loading Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Scope

This report records the Clean Web loading pass. It focuses on visible first
load, refresh, image fallback, list retention and action-button stability. It
does not approve production deploys, production data writes, Firestore Rules
loosening, route/collection changes, Public Read Tightening, runtime extraction
or a broad `social-app.js` refactor.

## Rollback Update 2026-07-02

Commit `f3963b07` (`fix: stabilize heart leads interactions`) has been backed
out. Its Heart Leads DOM-local search filtering, active-search render skips, CRM
avatar marker/fallback changes, desktop sidebar CSS fix, emulator-only lead
fixture and Heart E2E changes are no longer part of the accepted solution.

The rollback was required because real usage still showed Lead profile-image
flicker, and in some sessions faster image/card churn, with Search input
disrupted while flicker was active. Heart Leads image flicker remains open and
must be diagnosed mobile-first before another fix is attempted.

Desktop-only success is not enough for Mnyra. If only desktop was checked, a
loading, image or input-focus issue must not be reported as visually solved.

## Fixed In This Pass

| Surface             | Problem                                                                                      | Fix                                                                                                                          | Coverage                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Public Menu/QR      | Visible menu items could be cleared while a transient public read returned `unknown`.        | Current visible public menu items are retained during `pendingCanonical` unknown refreshes; real `knownEmpty` still clears.  | `tests/session-data-menu-focus-no-hang.test.mjs` plus Public Menu/QR E2E.      |
| Public Profile      | Avatar/logo could fall back to icon during settling if the current snapshot lacked `avatar`. | Public avatars now use the existing stable image key lookup and may render the last good image while the header is settling. | Public Profile E2E checks avatar fallback attributes and broken loaded images. |
| Public/Self Avatars | Avatar images lacked explicit fallback attributes in key profile markup.                     | Avatar `<img>` output now includes `data-fallback-src`.                                                                      | Public Profile E2E and existing image fallback binding.                        |
| Business Context    | Owner return from a public business could preserve wrong-business Menu/Focus state.          | Own-profile open now deactivates stale public direct-entry and retargets wrong-business Menu/Focus before render.            | Mobile Chrome owner-return Playwright plus profile-open unit test.             |
| Heart CRM           | Populated Leads/Customers/Ads/Staff lists were replaced by a loading block during refresh.   | `renderSectionList` keeps rows visible and appends a refresh notice only when rows already exist.                            | `tests/heart-crm-read-view-stability.test.mjs`.                                |
| Waiter              | Status button recovery needed automated coverage.                                            | Waiter E2E now verifies the next status button is visible and enabled after status change.                                   | `tests/e2e/waiter.spec.ts`.                                                    |

## Still Open

| Surface               | Open item                                                                                       | Priority | Required follow-up                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| Shop Owner            | Product create/edit/delete image stability is not yet durable E2E coverage.                     | P2       | Add vertical-specific shop product mutation test before selling shop mode.   |
| Hotel Owner           | Offer/details create/edit/delete image stability is not yet durable E2E coverage.               | P2       | Add hotel offer/details mutation test before selling hotel/travel mode.      |
| Heart Browser E2E     | Heart lead create/edit/delete remains previously manual/browser-probed, not a durable spec.     | P1       | Add authenticated Heart E2E once local login/test helpers are stable.        |
| Heart Leads Flicker   | Real usage still shows profile-image flicker and Search disruption; `f3963b07` was reverted.    | P1       | Run a mobile-first diagnosis before any new Heart Leads fix.                 |
| Shop/Hotel return E2E | Generic own-business cleanup covers shop/hotel owners, but dedicated mobile E2E is not added.   | P1       | Add shop-owner and hotel-owner return cases with vertical mutation coverage. |
| Feed/Discovery/Social | Authenticated social/travel/shopping surfaces can still reveal broader app-shell loading churn. | P2       | Keep out of P1 launch; test separately before those surfaces are promised.   |
| Real mobile/3G        | Browser emulation cannot prove real device image decode, tap targets or QR scan behavior.       | P2       | Manual phone/tablet and throttled-network launch rehearsal remains required. |

## Manual Checks Required Before Launch

1. Real phone direct load and refresh for `/pidhimadh`, `/pidhimadh/menu` and
   `/pidhimadh/menu?src=qr&table=2`.
2. Real QR scan preserving `src=qr` and `table`.
3. Owner `/menu` edit/publish pass on a phone-sized viewport.
4. Business owner return from public business to own profile/menu on real phone,
   including restaurant, shop and hotel owner accounts.
5. Waiter tablet board status update pass.
6. Heart Leads tab switch, create/edit/delete and refresh pass on a real
   mobile-first browser session, with explicit image-flicker observation.
7. Shop product and Hotel offer mutation image pass when those verticals enter
   launch scope.

## Rollback Verification

This rollback intentionally does not include a new Heart Leads fix and does not
claim visual closure. The required verification for the rollback is limited to
the standard unit/rules/functions/lint/format/architecture/build checks plus
bundle-status reporting.

Rollback checks passed: Functions 4/4, Rules 17/17, Unit 123/123, lint, final
format check, architecture check and build. The first format check flagged the
revert-affected seed JSON and Heart E2E file; Prettier was applied to those two
files and the repeated check passed.

Bundle status: the rollback build did not change tracked files under
`apps/menyra-social/bundled`. Mobile Heart diagnosis is the next separate block
and was not executed as part of this rollback.

## P0 Business Context Leak Verification

The Business/Profile/Menu/Focus context leak fix passed the final baseline:
Functions 4/4, Rules 17/17, Unit 124/124, lint, format check, architecture
check and build. Mobile Playwright passed Public Profile/Menu/Owner 7/7 and QR
Menu 1/1.

The build updated tracked browser bundle output:
`apps/menyra-social/bundled/entry/social-app.js`,
`apps/menyra-social/bundled/manifest.json`, deleted
`profile-open-flow-utils-nDcq3JLz.js` and added
`profile-open-flow-utils-DRWhfuTW.js`.

## Current Follow-Up 2026-07-02

Accepted fixes in this follow-up:

- Authenticated shell avatars now expose `data-fallback-src`, so the existing
  image fallback binder can recover broken header, restoring-session and drawer
  profile images instead of leaving inconsistent broken/grey states.
- Heart Leads now has diagnostic-only card/avatar markers and a mobile-first
  E2E probe that records card adds/removes, avatar `src` changes, list-empty
  transitions, Search focus loss and production request leaks.

Current verified stable behavior:

- Mobile Chrome targeted Playwright passed Public Profile/Menu/QR, Owner/Menu,
  Waiter and Heart, 10/10.
- Desktop Chromium targeted Playwright passed Public Profile/Menu/QR,
  Owner/Menu and Waiter, 9/9; the Heart diagnostic is intentionally skipped on
  desktop because the reported business problem is mobile-first.
- Targeted Node regressions for shell avatar fallbacks and Heart diagnostic
  markers passed, 8/8.

Still open:

- Heart Leads profile-image flicker and Search disruption are not claimed
  fixed. The new test is a measurement guard, not a product-side flicker fix.
- Shop product create/edit/delete and Hotel offer/details create/edit/delete
  image/list stability remain P2 vertical-specific coverage gaps.
- Real phone/3G visual rehearsal is still required before launch acceptance.

Final required baseline for this follow-up passed: Functions 4/4, Rules 17/17,
Unit 127/127, lint, format check, architecture check and build. The build
changed only `apps/menyra-social/bundled/entry/social-app.js`; no tracked
bundle manifest or hashed chunk changed. The existing large `social-app.js`
chunk warning remains a P3 performance/runtime-extraction risk.

## Verification

Final local verification for this pass:

- Unit: `npm run test:unit` passed, 123/123.
- Rules: `npm run test:rules` passed, 17/17, after starting the local
  emulators.
- Functions: `npm run test:functions` passed, 4/4, after the emulator was warm.
- Static checks: lint, format and architecture check passed.
- Build: `npm run build` passed and updated the tracked social bundle plus the
  hashed profile render chunk.
- Browser: targeted Playwright passed, 16/16, covering Public Profile/Menu/QR,
  Owner/Menu and Waiter on desktop and mobile.

## Restaurant Pilot Loading Extension 2026-07-02

This extension verifies the restaurant pilot beyond happy path. It adds a
dedicated audit file at
`docs/codex/generated/MNYRA_RESTAURANT_PILOT_READINESS_AUDIT.md`.

Additional stable behavior now covered:

- Public Menu valid QR route preserves `src=qr&table=2` through refresh.
- Public Menu local empty fixture shows `Keine Produkte` without false error or
  stale `pidhimadh` items.
- A missing public menu projection does not show a false `Fehler` state during
  normal loading.
- Invalid QR table input is sanitized: `src=qr` remains, invalid `table=abc`
  is dropped and no `NaN` label appears.
- QR checkout double submit creates exactly one local order.
- Waiter board remains visible after status change plus refresh.

Coverage added:

- `tests/orders-runtime-controller-state.test.mjs`
- `tests/public-menu-surface-state-utils.test.mjs`
- `tests/e2e/public-menu.spec.ts`
- `tests/e2e/qr-menu.spec.ts`
- `tests/e2e/waiter.spec.ts`

Open UI stability items for restaurant pilot:

- Owner order-dashboard loading/empty/error state remains P1 manual/blocker
  before pilot operations.
- Disabled/deleted menu item in cart still needs focused error simulation.
- Real phone/3G QR scan, image decode and waiter tablet checks remain required.

Final verification for this extension passed: Functions 4/4, Rules 17/17, Unit
130/130, lint, format check, architecture check, build and relevant Playwright
25/25 with one intentional desktop Heart skip. The build changed no tracked
bundle files.

## Owner Orders Follow-Up 2026-07-02

Additional fixed behavior:

- Owner Orders no longer replaces populated order cards with the full
  `Bestellungen werden geladen...` block during refresh.
- If an order refresh reports an error while cards already exist, the existing
  cards stay visible and the error is shown above them.
- First-load loading and clean empty state still render as before.

Additional coverage:

- `tests/orders-render-utils.test.mjs`
- `tests/e2e/owner-tool.spec.ts` owner-orders cases for restaurant owner list,
  refresh, foreign-order non-visibility and shop owner empty state.

Still open after this follow-up: forced order listener errors, disabled/deleted
cart item browser UX, active-session staff revocation and real phone/3G checks.

Final verification for this follow-up:

- Functions 4/4 after restarting the full local emulator set and reseeding;
  first attempt failed/hung because Hub/Functions were not running.
- Rules 17/17, Unit 133/133, lint, format check, architecture check and build
  passed.
- Relevant Playwright passed 29/29 with one intentional desktop Heart skip.
- Mobile Chrome Playwright was included; real phone/3G remains manual.
- Build changed the tracked social bundle entry only:
  `apps/menyra-social/bundled/entry/social-app.js`.

## Mobile Manual Stability Sweep 2026-07-02

Fixed in the sweep:

- Public/QR emulator bootstrap uses local Functions instead of a production
  Functions endpoint.
- Failed menu `srcset` candidates are removed before fallback, reducing the
  observed five-second failure case from thousands of console/request retries
  to eight bounded image failures and zero visible broken images.

Still open:

- public routes show a blank root for about 11.1 s Fast 3G / 41.8 s Slow 3G;
- Heart mobile Search lost focus in the diagnostic Playwright run;
- Feed logs a denied story list;
- a brief `Noch keine Bio.` state and sub-44px controls remain P2;
- real device/media decode was not tested.
