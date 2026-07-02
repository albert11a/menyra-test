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
