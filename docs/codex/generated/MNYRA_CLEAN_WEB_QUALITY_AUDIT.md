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

## Findings

| Area                  | Route/Flow                                                                   | Found problem                                                                                                                 | Visible user effect                                                                                                 | Suspected cause                                                                                                    | Fix status                                                                                              | Priority | Test/Evidence                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public                | `/pidhimadh/menu`, `/pidhimadh/menu?src=qr&table=2` after Owner Save/Publish | A transient immediate public projection read can return empty/unknown before the fresh projection is readable.                | Menu can briefly look empty or fall back to loading even though existing items are still the correct visible truth. | Public menu loading path could clear current visible items before the transient unknown read completed.            | Fixed in this pass for transient `unknown` reads with existing visible items.                           | P1       | Unit regression in `tests/session-data-menu-focus-no-hang.test.mjs`; prior Owner/Menu Playwright run observed one immediate-read race after create. |
| Public                | `/pidhimadh`, `/shopdemo`, `/hoteldemo` first visit and refresh              | Public avatar/logo can disappear during identity settling if the new profile snapshot temporarily lacks `avatar`.             | Profile header can show an icon/placeholder first, then image after refresh or later hydration.                     | Avatar rendering only trusted the current raw avatar field; it did not use the existing stable image cache path.   | Fixed in this pass for settling profile headers.                                                        | P1       | Code change in `renderPublicProfileSurface`; public profile E2E now checks avatar fallback attributes and broken loaded images.                     |
| Public/QR             | Public profile/menu image error handling                                     | Some avatar/logo images lack an explicit fallback source attribute.                                                           | Broken image or grey placeholder can look like missing content if the image URL fails.                              | Fallback binding only acts on images with `data-fallback-src`.                                                     | Fixed in this pass for public/self profile avatar images.                                               | P2       | Public profile E2E checks `data-fallback-src`; existing menu image reveal tests remain green.                                                       |
| Owner                 | `/menu` Menu Editor Create/Edit/Delete/Publish                               | Owner editor items are mostly preserved by cache sync, but public read-after-publish can be ahead of projection visibility.   | Public menu assertion or user refresh can briefly see stale or empty state.                                         | Save path publishes then reads public projection immediately; Firestore projection visibility may lag.             | Mitigated by public visible-state retention; no architecture expansion.                                 | P1       | Existing save/delete utils plus targeted public-menu retention regression.                                                                          |
| Owner                 | Shop Product Editor and Hotel Offer Editor                                   | Product/offer vertical mutation flows were not covered by durable E2E before this pass.                                       | Remaining image/list/button stability risk in vertical-specific editors.                                            | Existing coverage proves entry only, not mutations.                                                                | Documented; no blind broad vertical refactor.                                                           | P2       | Existing Business Tool Matrix marks these as manual follow-ups.                                                                                     |
| Waiter                | Waiter Order Board status refresh                                            | Current state model preserves `orders` and disables saving order buttons by id.                                               | No code-level evidence of a forced empty-list flicker found; still needs mobile/tablet visual proof.                | Snapshot listener replaces orders on new data but does not clear during refresh.                                   | No code fix planned unless browser test finds regression.                                               | P2       | Code audit in `apps/waiter/waiter-app.js`; targeted Playwright to rerun.                                                                            |
| Heart/CEO             | `/heart?firebase-emulator=1` Leads/Customers/Ads/Staff tabs                  | Existing CRM rows are replaced by `Leads laden...` whenever a domain refresh starts.                                          | Leads can visibly reload many times while tabs/actions refresh read-only domains.                                   | Heart state preserves old items, but `renderSectionList` returned a loading block before rendering existing items. | Fixed in this pass for populated read-only lists.                                                       | P1       | Unit regression in `tests/heart-crm-read-view-stability.test.mjs`.                                                                                  |
| Heart/CEO             | `/heart?firebase-emulator=1&view=leads` search                               | Lead search still remounted the Heart app on every keypress and unrelated background updates could remount visible Lead rows. | Search focus felt unstable and lead logo/profile images flickered while typing, especially on mobile.               | CRM search query and background Heart data updates both flowed through the global `root.innerHTML` render path.    | Fixed in Heart follow-up: active CRM search filters existing DOM rows and skips unrelated full renders. | P1       | `tests/e2e/heart.spec.ts` passes on Chromium and Mobile Chrome; avatar DOM marker survives search typing.                                           |
| Heart/CEO             | Desktop Heart shell                                                          | A later CSS block reset the desktop sidebar to `width: 100vw`.                                                                | Search input could be visible but not clickable because sidebar/header intercepted pointer events.                  | CSS order regression after the original desktop media rule.                                                        | Fixed in Heart follow-up with a later desktop sidebar override.                                         | P1       | First Heart E2E reproduced pointer interception; rerun passed after CSS fix.                                                                        |
| Heart/CEO             | Lead create/edit/delete buttons                                              | Save/delete buttons need verification that loading state releases after action.                                               | Button can feel hung if an action fails without final render.                                                       | Existing modal/action code is broader than this pass; needs browser/DOM proof.                                     | Test/document; fix only if scoped issue is found.                                                       | P1       | Heart browser probe was previously manual; add focused regression where feasible.                                                                   |
| Feed/Discovery/Social | Feed, Restaurant, Travel, Shopping, Map/Discovery tabs                       | Large authenticated surfaces can still show route-level loading churn.                                                        | Tabs may feel less calm than public/owner/Heart surfaces on slow devices.                                           | Shared app shell and large bundle still serve many surfaces together.                                              | Documented as later P2/P3, no runtime extraction in this pass.                                          | P2       | Architecture docs; no activated runtime split allowed now.                                                                                          |
| Mobile/3G             | Public/Owner/Waiter/Heart narrow viewports                                   | Slow-network visual stability remains only locally approximated.                                                              | Real phones may still reveal image decode delays, tap target issues or text overflow.                               | Desktop/mobile emulation is not a substitute for real-device network and GPU behavior.                             | Manual launch check required.                                                                           | P2       | Playwright mobile project plus manual device checklist.                                                                                             |

## Initial Blockers

- P1 launch blocker fixed in this pass: public menu no longer drops existing
  visible items during transient `unknown` projection reads.
- P1 launch blocker fixed in this pass: Heart Leads/CRM read-only lists no
  longer replace a populated list with a loading block during refresh.
- P2/manual blocker: Shop product and Hotel offer mutation image stability need
  vertical-specific browser proof before those verticals are sold.
- P2/manual blocker: real phone and slow-network QR/menu/Waiter checks remain
  required because local Playwright cannot prove all decode/touch behavior.

## Verification Notes

- Targeted Node regression run passed for Heart CRM list retention, public menu
  transient unknown retention and existing menu image reveal behavior.
- Heart Leads follow-up adds durable desktop/mobile E2E for CEO login,
  non-CEO block, emulator-only network routing, search focus, stable avatar DOM,
  non-empty Leads list, Lead modal open and Heart tab navigation.
- Public Profile/Menu/QR, Owner/Menu and Waiter Playwright specs were expanded
  with image fallback, broken loaded image, empty-menu, QR-query and
  status-button stability checks.
- No Firestore Rules, routes, collections, production data, feature flags,
  Public Read Tightening or runtime extraction were changed.

## Final Check Results

| Check                      | Result          | Notes                                                                                                     |
| -------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`        | Passed, 124/124 | Includes new Heart CRM image/fallback and public menu retention regressions.                              |
| `npm run test:rules`       | Passed, 17/17   | First attempt failed only because the Firestore emulator was not running; repeated with emulators passed. |
| `npm run test:functions`   | Passed, 4/4     | First warm-emulator run had a transient test fixture read miss; immediate repeat passed.                  |
| `npm run lint`             | Passed          | No lint errors.                                                                                           |
| `npm run format:check`     | Passed          | Prettier was applied to new docs/E2E files before final check.                                            |
| `npm run arch:check`       | Passed          | No dependency violations.                                                                                 |
| `npm run build`            | Passed          | Large `social-app.js` chunk warning remains the existing P3 bundle risk.                                  |
| Playwright Heart follow-up | Passed, 4/4     | Heart non-CEO block and CEO Leads search/avatar/tab stability on Chromium plus Mobile Chrome.             |

## Bundle Status

`npm run build` changed tracked browser bundle output and those files belong to
this source change:

- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-ClqNBCUU.js`
  deleted
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-lbWlArsR.js`
  added

Heart Leads follow-up on 2026-07-02 also ran `npm run build`; that build passed
and did not change tracked Social bundle files.
