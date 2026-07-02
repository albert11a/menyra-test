# MNYRA Clean Web Quality Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Scope

This pass covers visible loading, image, list, button, refresh and mobile
stability for the current local-only Mnyra surfaces. It does not deploy, touch
production data, loosen Firestore Rules, rename routes or collections, activate
Public Read Tightening, start runtime extraction or perform a broad
`social-app.js` refactor.

The first implementation scope is intentionally small:

- keep public menu data visible if a visible public refresh returns a transient
  empty/unknown read;
- keep public profile avatars/logos on the last good image during settling and
  attach explicit image fallbacks;
- keep Heart CRM lists visible while their read-only domains refresh;
- add focused regression coverage for the observable loading/list behavior;
- document larger risks that need manual device or later vertical-specific
  testing.

## Rollback Update 2026-07-02

The follow-up commit `f3963b07` (`fix: stabilize heart leads interactions`) has
been backed out because real usage still showed Heart Leads profile-image
flicker, and in some sessions worse image/card churn, while Search input was
hard to use. The rollback removes the DOM-local CRM search filtering,
active-search render-skip logic, new CRM avatar marker/fallback changes, desktop
sidebar CSS fix, emulator-only Heart lead fixture and Heart E2E changes from
that commit.

Heart CRM list retention from the Clean-Web baseline remains historical
coverage, but it is not proof that the Lead image flicker is solved. Heart Leads
image flicker and Search disruption are open and require a separate
mobile-first diagnosis before any new fix.

Desktop manual tests are not an acceptance criterion for Mnyra visual quality.
For image flicker, Search/input focus and business tools, mobile checks and real
phone behavior carry more weight than desktop-only evidence.

## Findings

| Area                  | Route/Flow                                                                     | Found problem                                                                                                                                                      | Visible user effect                                                                                                 | Suspected cause                                                                                                                         | Fix status                                                                    | Priority | Test/Evidence                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public                | `/pidhimadh/menu`, `/pidhimadh/menu?src=qr&table=2` after Owner Save/Publish   | A transient immediate public projection read can return empty/unknown before the fresh projection is readable.                                                     | Menu can briefly look empty or fall back to loading even though existing items are still the correct visible truth. | Public menu loading path could clear current visible items before the transient unknown read completed.                                 | Fixed in this pass for transient `unknown` reads with existing visible items. | P1       | Unit regression in `tests/session-data-menu-focus-no-hang.test.mjs`; prior Owner/Menu Playwright run observed one immediate-read race after create. |
| Public                | `/pidhimadh`, `/shopdemo`, `/hoteldemo` first visit and refresh                | Public avatar/logo can disappear during identity settling if the new profile snapshot temporarily lacks `avatar`.                                                  | Profile header can show an icon/placeholder first, then image after refresh or later hydration.                     | Avatar rendering only trusted the current raw avatar field; it did not use the existing stable image cache path.                        | Fixed in this pass for settling profile headers.                              | P1       | Code change in `renderPublicProfileSurface`; public profile E2E now checks avatar fallback attributes and broken loaded images.                     |
| Public/QR             | Public profile/menu image error handling                                       | Some avatar/logo images lack an explicit fallback source attribute.                                                                                                | Broken image or grey placeholder can look like missing content if the image URL fails.                              | Fallback binding only acts on images with `data-fallback-src`.                                                                          | Fixed in this pass for public/self profile avatar images.                     | P2       | Public profile E2E checks `data-fallback-src`; existing menu image reveal tests remain green.                                                       |
| Owner                 | `/menu` Menu Editor Create/Edit/Delete/Publish                                 | Owner editor items are mostly preserved by cache sync, but public read-after-publish can be ahead of projection visibility.                                        | Public menu assertion or user refresh can briefly see stale or empty state.                                         | Save path publishes then reads public projection immediately; Firestore projection visibility may lag.                                  | Mitigated by public visible-state retention; no architecture expansion.       | P1       | Existing save/delete utils plus targeted public-menu retention regression.                                                                          |
| Owner/Public          | Business owner opens another public business, then returns to own profile/menu | Stale public direct-entry plus Menu/Focus state could remain active after `profileView` returned to the signed-in owner.                                           | Header/profile could belong to the owner while Menu/Focus still belonged to the previously visited business.        | `openOwnBusinessProfile()` did not deactivate `__webDirectEntry` or retarget wrong-business public Menu/Focus; profile nav bypassed it. | Fixed in this task with own-profile context cleanup and mobile regression.    | P0       | `MNYRA_BUSINESS_CONTEXT_LEAK_AUDIT.md`; mobile Chrome owner-return Playwright case.                                                                 |
| Owner                 | Shop Product Editor and Hotel Offer Editor                                     | Product/offer vertical mutation flows were not covered by durable E2E before this pass.                                                                            | Remaining image/list/button stability risk in vertical-specific editors.                                            | Existing coverage proves entry only, not mutations.                                                                                     | Documented; no blind broad vertical refactor.                                 | P2       | Existing Business Tool Matrix marks these as manual follow-ups.                                                                                     |
| Waiter                | Waiter Order Board status refresh                                              | Current state model preserves `orders` and disables saving order buttons by id.                                                                                    | No code-level evidence of a forced empty-list flicker found; still needs mobile/tablet visual proof.                | Snapshot listener replaces orders on new data but does not clear during refresh.                                                        | No code fix planned unless browser test finds regression.                     | P2       | Code audit in `apps/waiter/waiter-app.js`; targeted Playwright to rerun.                                                                            |
| Heart/CEO             | `/heart?firebase-emulator=1` Leads/Customers/Ads/Staff tabs                    | Existing CRM rows are replaced by `Leads laden...` whenever a domain refresh starts.                                                                               | Leads can visibly reload many times while tabs/actions refresh read-only domains.                                   | Heart state preserves old items, but `renderSectionList` returned a loading block before rendering existing items.                      | Fixed in this pass for populated read-only lists.                             | P1       | Unit regression in `tests/heart-crm-read-view-stability.test.mjs`.                                                                                  |
| Heart/CEO             | `/heart?firebase-emulator=1` Leads image/search interaction                    | The reverted `f3963b07` follow-up did not solve real Lead profile-image flicker; image appears/disappears rapidly and Search is disrupted while flicker is active. | Heart feels unfinished on the CEO Leads surface, especially for mobile-first usage where input focus matters.       | Unknown; possible data reload, avatar URL value/null/value churn, card rebuild, fallback/onerror churn or background refresh overwrite. | Open after rollback; diagnose mobile-first before fixing.                     | P1       | Real-use report from rollback task; see `MNYRA_HEART_LEADS_MOBILE_FLICKER_ROLLBACK.md`.                                                             |
| Heart/CEO             | Lead create/edit/delete buttons                                                | Save/delete buttons need verification that loading state releases after action.                                                                                    | Button can feel hung if an action fails without final render.                                                       | Existing modal/action code is broader than this pass; needs browser/DOM proof.                                                          | Test/document; fix only if scoped issue is found.                             | P1       | Heart browser probe was previously manual; add focused regression where feasible.                                                                   |
| Feed/Discovery/Social | Feed, Restaurant, Travel, Shopping, Map/Discovery tabs                         | Large authenticated surfaces can still show route-level loading churn.                                                                                             | Tabs may feel less calm than public/owner/Heart surfaces on slow devices.                                           | Shared app shell and large bundle still serve many surfaces together.                                                                   | Documented as later P2/P3, no runtime extraction in this pass.                | P2       | Architecture docs; no activated runtime split allowed now.                                                                                          |
| Mobile/3G             | Public/Owner/Waiter/Heart narrow viewports                                     | Slow-network visual stability remains only locally approximated.                                                                                                   | Real phones may still reveal image decode delays, tap target issues or text overflow.                               | Desktop/mobile emulation is not a substitute for real-device network and GPU behavior.                                                  | Manual launch check required.                                                 | P2       | Playwright mobile project plus manual device checklist.                                                                                             |

## Initial Blockers

- P1 launch blocker fixed in this pass: public menu no longer drops existing
  visible items during transient `unknown` projection reads.
- P0 launch blocker fixed in this task: own business profile/menu return no
  longer keeps stale public Menu/Focus data from the previously visited
  business.
- P1 launch blocker fixed in this pass: Heart Leads/CRM read-only lists no
  longer replace a populated list with a loading block during refresh.
- P1 launch blocker open after rollback: Heart Leads profile-image flicker and
  Search disruption remain unresolved; `f3963b07` was reverted and must not be
  counted as a fix.
- P2/manual blocker: Shop product and Hotel offer mutation image stability need
  vertical-specific browser proof before those verticals are sold.
- P2/manual blocker: real phone and slow-network QR/menu/Waiter checks remain
  required because local Playwright cannot prove all decode/touch behavior.
  Mobile-first evidence is required before visual stability is called solved.

## Verification Notes

- Targeted Node regression run passed for Heart CRM list retention, public menu
  transient unknown retention and existing menu image reveal behavior.
- Public Profile/Menu/QR, Owner/Menu and Waiter Playwright specs were expanded
  with image fallback, broken loaded image, empty-menu, QR-query and
  status-button stability checks.
- No Firestore Rules, routes, collections, production data, feature flags,
  Public Read Tightening or runtime extraction were changed.

## Final Check Results

| Check                           | Result          | Notes                                                                                                     |
| ------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`             | Passed, 123/123 | Includes new Heart CRM and public menu retention regressions.                                             |
| `npm run test:rules`            | Passed, 17/17   | First attempt failed only because the Firestore emulator was not running; repeated with emulators passed. |
| `npm run test:functions`        | Passed, 4/4     | First warm-emulator run had a transient test fixture read miss; immediate repeat passed.                  |
| `npm run lint`                  | Passed          | No lint errors.                                                                                           |
| `npm run format:check`          | Passed          | Prettier was applied to new docs/E2E files before final check.                                            |
| `npm run arch:check`            | Passed          | No dependency violations.                                                                                 |
| `npm run build`                 | Passed          | Large `social-app.js` chunk warning remains the existing P3 bundle risk.                                  |
| Playwright targeted browser run | Passed, 16/16   | Public Profile/Menu/QR, Owner/Menu and Waiter on desktop plus mobile.                                     |

## Bundle Status

`npm run build` changed tracked browser bundle output and those files belong to
this source change:

- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-ClqNBCUU.js`
  deleted
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-lbWlArsR.js`
  added

## Rollback Verification 2026-07-02

The `f3963b07` Heart Leads follow-up was reverted after this Clean-Web pass.
This rollback did not run a new mobile Heart diagnosis and does not claim the
Lead image/Search flicker is solved.

Checks for the rollback passed: `npm run test:functions` 4/4,
`npm run test:rules` 17/17, `npm run test:unit` 123/123, `npm run lint`, final
`npm run format:check`, `npm run arch:check` and `npm run build`.

The first rollback format check flagged only the revert-affected seed JSON and
Heart E2E file; Prettier was applied to those two files before the final passing
format check. The rollback build did not change tracked files under
`apps/menyra-social/bundled`.

## P0 Business Context Leak Update 2026-07-02

The Business/Profile/Menu/Focus context leak is fixed separately from the broad
Clean Web loading pass. The fix is mobile-first and small: owner-profile return
now clears stale public direct-entry state, removes the public route bootstrap
and refuses to keep public Menu/Focus payloads whose `restaurantId` does not
match the signed-in business.

Focused evidence is green:

- `node --test tests/profile-open-flow-utils.test.mjs`
- `node --test tests/public-menu-surface-state-utils.test.mjs`
- `node --test tests/profile-business-menu-runtime-cluster.test.mjs`
- mobile Chrome Playwright owner-return case in
  `tests/e2e/public-profile.spec.ts`

Final verification for the P0 context fix is also green: Functions 4/4, Rules
17/17, Unit 124/124, lint, format check, architecture check, build, mobile
Public Profile/Menu/Owner Playwright 7/7 and mobile QR Menu Playwright 1/1. The
build changed the tracked social bundle entry, manifest and hashed
`profile-open-flow-utils` chunk.

## Current Clean Web Follow-Up 2026-07-02

This follow-up continues after the Heart rollback and P0 business-context fix.
It does not reintroduce the reverted Heart DOM-local filtering or render-skip
approach. The accepted code change is deliberately small: shell avatar images
now participate in the existing fallback binder, and Heart Leads now exposes
stable diagnostic markers that let mobile E2E distinguish card rebuilds, avatar
source churn, empty-list transitions, Search focus loss and production request
leaks.

| Area                      | Route/Flow                                                                                                      | Found problem                                                                                                                                                                   | Visible user effect                                                                                                 | Suspected cause                                                                                                                                                         | Fix status                                                                                                                                                                                                 | Priority | Test/Evidence                                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public / Owner shell      | Authenticated header and drawer avatar after first load, refresh or broken image                                | Header/drawer avatar markup could miss `data-fallback-src`.                                                                                                                     | A failed profile image could stay visually broken or fall back inconsistently instead of using the app placeholder. | The existing fallback binder only handles `img[data-fallback-src]`; these shell avatars were not all opted in.                                                          | Fixed: header restoring avatar, authenticated `#headerAvatar` and `#drawerAvatar` now expose the placeholder fallback.                                                                                     | P1       | `node --test tests/auth-shell-chrome-sync.test.mjs tests/heart-crm-read-view-stability.test.mjs`; mobile/desktop targeted Playwright stayed green. |
| Public / QR               | `/pidhimadh`, `/pidhimadh/menu`, `/pidhimadh/posts`, `/pidhimadh/menu?src=qr&table=2`, shop/hotel public routes | No new public startup permission or empty-list regression reproduced in the local browser matrix.                                                                               | Public profile/menu/QR stayed visible through direct load, refresh and QR order flow in emulator tests.             | Existing Clean-Web retention and fallback work is still active; no new clearing path found in the targeted routes.                                                      | Verified, no new code change beyond shell avatar fallback.                                                                                                                                                 | P1       | Mobile Chrome relevant Playwright passed 10/10; desktop Chromium passed 9/9 with Heart diagnostic intentionally skipped.                           |
| Owner                     | `/menu`, restaurant Menu Editor, publish, QR tables, shop owner entry, hotel details/offer entry                | Restaurant owner mutation smoke stayed stable; shop/hotel editor entry is covered, but product/offer image mutation is still not a durable test.                                | Shop/hotel verticals should not be sold as fully proven for image/list stability yet.                               | Existing E2E reaches those tools but does not create/edit/delete vertical-specific media records.                                                                       | Restaurant owner flow verified; shop/hotel mutation remains documented P2.                                                                                                                                 | P2       | `tests/e2e/owner-tool.spec.ts` passed mobile and desktop.                                                                                          |
| Waiter                    | Waiter login, order board, status buttons, refresh-size coverage                                                | No visible status-button hang reproduced in local mobile/desktop E2E.                                                                                                           | Order board remained usable after status change.                                                                    | Existing status save guard and board data model preserved the visible order.                                                                                            | Verified, no code change.                                                                                                                                                                                  | P2       | `tests/e2e/waiter.spec.ts` passed mobile and desktop.                                                                                              |
| Heart / CEO               | `/apps/mnyra-heart/index.html?firebase-emulator=1&view=crmLeads&sw-reset=1`                                     | After rollback there was no durable mobile diagnostic to separate avatar `src` churn from card rebuilds, empty-list transitions, Search focus loss or production request leaks. | Without instrumentation, a real Heart flicker report could not be safely fixed without guessing.                    | Heart CRM renders from a broad app render path; the precise mobile flicker cause needs measured evidence before another product fix.                                    | Diagnostic-only fix added: lead cards and avatars expose stable data markers; mobile E2E records counters and asserts Search/fallback/production-safety invariants. Product flicker is not declared fixed. | P1       | `tests/e2e/heart.spec.ts` mobile Chrome passed; `tests/heart-crm-read-view-stability.test.mjs` verifies marker output.                             |
| Heart / CEO               | Heart Leads image flicker and Search disruption reported after `f3963b07` rollback                              | The real-use Lead image flicker remains an open product issue if it reproduces on phone/3G.                                                                                     | Lead list can still feel unfinished if images/cards churn under real network/device conditions.                     | Inference from code: full-root Heart re-rendering and CRM refreshes can recreate list/card/image DOM; exact trigger must be confirmed with the new diagnostic counters. | Open, not fixed in this follow-up. Next fix must be cause-based and mobile-first.                                                                                                                          | P1       | New diagnostic E2E passed locally; real phone/3G reproduction is still required before closing.                                                    |
| Feed / Discovery / Social | Feed, restaurant/travel/shopping/discovery tabs                                                                 | Broad authenticated social/travel/shopping loading stability was not expanded in code.                                                                                          | These surfaces can still reveal broader app-shell churn outside restaurant P1 launch scope.                         | Large shared runtime remains; no runtime extraction is allowed in this pass.                                                                                            | Documented P2/P3.                                                                                                                                                                                          | P2       | Architecture/performance reports keep this outside the current launch-critical fix.                                                                |
| Mobile / 3G               | Public, Owner, Waiter, Heart                                                                                    | Browser emulation passed, but real phone/3G decode/touch behavior remains manual.                                                                                               | Real devices may still reveal image decode flicker, tap-target problems or text overflow.                           | Emulator/browser automation cannot prove GPU/network behavior on actual phones.                                                                                         | Manual launch rehearsal still required.                                                                                                                                                                    | P2       | Mobile Chrome Playwright passed; real phone/3G not run.                                                                                            |

Current follow-up final verification:

- `node --test tests/auth-shell-chrome-sync.test.mjs tests/heart-crm-read-view-stability.test.mjs` passed, 8/8.
- Mobile Chrome Playwright for Public Profile/Menu/QR, Owner/Menu, Waiter and Heart passed, 10/10.
- Desktop Chromium Playwright for the same set passed, 9/9 with the Heart diagnostic skipped by design because it is mobile-first.
- The first Heart diagnostic run failed only because local Auth emulator requests on `127.0.0.1:9099` were incorrectly counted as production; the guard now excludes `localhost` and `127.0.0.1` while still catching external Firebase/Mnyra hosts.
- Required baseline passed: `npm run test:functions` 4/4, `npm run test:rules` 17/17, `npm run test:unit` 127/127, `npm run lint`, `npm run format:check`, `npm run arch:check` and `npm run build`.
- `npm run build` changed only `apps/menyra-social/bundled/entry/social-app.js`; no tracked bundle manifest or hashed chunk file changed in this follow-up.
- Build warning: the existing large `social-app.js` chunk warning remains a documented P3 performance/runtime-extraction risk.

## Restaurant Pilot Loading Extension 2026-07-02

The Restaurant Pilot readiness extension adds explicit data-loading, loading,
empty, error and race-state coverage for the guest -> QR -> order -> waiter ->
owner slice. The detailed map is in
`docs/codex/generated/MNYRA_RESTAURANT_PILOT_READINESS_AUDIT.md`.

New findings:

- Public Menu empty state is clean for a local restaurant with no menu items:
  `Keine Produkte`, no false error and no foreign menu fallback.
- Missing `restaurants/{id}/public/menu` projection in the local fixture does
  not produce a false visible menu error.
- Invalid QR `table=abc` is sanitized by dropping the invalid table while
  keeping `src=qr`; no `Tisch NaN` state is rendered.
- QR order submit is protected against double-click double orders.
- Waiter status update remains visible after refresh under the next status tab.
- MCP gutcheck without the E2E image route produced many
  `images.example.local` DNS errors from fake seed URLs; the Playwright fixture
  fulfills these locally, and real phone/3G image behavior remains manual.

New fixed/covered items:

- Added order in-flight and error-release unit coverage.
- Added Public Menu error-truth unit coverage.
- Added mobile-first Playwright coverage for empty menu, missing projection,
  invalid table, QR double submit and Waiter refresh.

Still open:

- P1 owner order-dashboard empty/error/load behavior before pilot operations.
- P1 disabled/deleted menu item in cart needs a focused server/error
  simulation.
- P1 real phone/3G QR/table rehearsal.
- P1 Heart Leads image/Search flicker remains open from the rollback.

Final verification for this extension passed: Functions 4/4, Rules 17/17, Unit
130/130, lint, format check, architecture check, build and relevant Playwright
25/25 with one intentional desktop Heart skip. The build changed no tracked
bundle files.

## Owner Orders Clean-Web Follow-Up 2026-07-02

Finding: the existing Owner Orders renderer used the same visible refresh-risk
pattern as earlier CRM lists. When `state.orders.loading` became true, populated
order cards were replaced by the full `Bestellungen werden geladen...` block.
That could make the dashboard look empty or repeatedly reloading during a
refresh even though the previous orders were still valid visible truth.

Fix: `renderOrdersViewCore` now keeps existing order cards visible during
refresh loading or refresh error. True first-load loading, true empty state and
first-load error behavior remain unchanged.

New evidence:

- `tests/orders-render-utils.test.mjs` covers row retention during refresh
  loading/error and preserves first-load loading/empty behavior.
- `tests/e2e/owner-tool.spec.ts` now opens `/orders` as restaurant owner and
  shop owner. It verifies own restaurant order visibility after refresh, foreign
  shop order non-visibility and a clean owner empty state.

Remaining open items: forced Owner/Waiter listener failure behavior,
disabled/deleted cart item browser UX, active-session staff revocation and real
phone/3G QR/tablet checks.

Final verification for this follow-up:

- First `npm run test:functions` attempt failed/hung because Emulator Hub and
  Functions were not running; after starting the full local emulator set and
  running `npm run emulators:seed`, the re-run passed 4/4.
- `npm run test:rules` passed 17/17, `npm run test:unit` passed 133/133,
  `npm run lint`, `npm run format:check`, `npm run arch:check` and
  `npm run build` passed.
- Relevant Playwright passed 29/29 with one intentional desktop Heart skip,
  covering Public Profile/Menu/QR, Owner/Menu/Orders, Waiter and mobile Heart.
- Mobile was checked through the mobile Chrome Playwright project. Real
  phone/3G remains manual and is not claimed solved.
- Local `127.0.0.1:5173` and `192.168.1.168:5173` responded with HTTP 200.
- Bundle status: `npm run build` changed
  `apps/menyra-social/bundled/entry/social-app.js`; no tracked manifest or
  hashed chunk changed.
