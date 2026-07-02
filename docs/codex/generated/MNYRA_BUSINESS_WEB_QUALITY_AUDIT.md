# MNYRA Business Web Quality Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Scope

This follow-up covers the business-facing Heart/CEO Leads regression found
after the broader Clean Web pass. It uses only local emulator data and does not
deploy, touch production data, loosen Firestore Rules, rename routes or
collections, activate ads/analytics or redesign the Heart UI.

## Findings

| Area                 | Route/Flow                                           | Found problem                                                                                                                                          | Visible user effect                                                                                             | Suspected cause                                                                                     | Fix status                                                                                                                     | Priority | Test/Evidence                                                                                              |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| Heart/CEO            | `/heart?firebase-emulator=1&view=leads` Leads search | Typing in the Leads search wrote every keypress into the Heart store, and the global subscriber replaced `root.innerHTML`.                             | Search focus felt disrupted and lead profile images could remount/flicker while typing.                         | Search query state changes were treated like full-app render changes.                               | Fixed: pure CRM search updates now filter the existing DOM rows and skip full render while the search input is active.         | P1       | `tests/e2e/heart.spec.ts` desktop/mobile checks focus and stable avatar DOM marker while typing.           |
| Heart/CEO            | Leads tab during initial background refresh          | Background Heart data updates from other CRM/admin domains could remount the active Leads list even when the visible Leads section had not changed.    | Lead logo/profile images flickered after the list was already visible, especially on mobile.                    | Store subscriber rendered the active view for unrelated background domain/dashboard updates.        | Fixed: active CRM search keeps the visible section mounted when the visible section, modal and nav state are unchanged.        | P1       | Heart E2E preserves a marker on the seeded lead `<img>` through desktop and mobile search.                 |
| Heart/CEO            | Leads avatar fallback                                | Lead cards had no stable image key or inline fallback initials for broken image URLs.                                                                  | A broken logo could look like a grey/broken image rather than a clean business fallback.                        | Avatar renderer emitted only an `<img>` for available URLs.                                         | Fixed: CRM avatars expose `data-heart-crm-image-key`, `data-heart-crm-stable-src` and fallback initials in the same container. | P2       | `tests/heart-crm-read-view-stability.test.mjs` asserts stable image attributes and fallback initials.      |
| Heart/CEO            | Desktop Heart shell                                  | A later CSS block reset the sidebar to `width: 100vw` after the desktop sidebar media rule.                                                            | Search input could be visible but not actually clickable because the sidebar/header intercepted pointer events. | CSS order regression between the base Heart shell block and later mobile-first shell block.         | Fixed: later desktop media override restores the 320px sidebar column and keeps the main shell clickable.                      | P1       | First Heart E2E failed with sidebar/header intercepting Search; rerun passed after CSS fix.                |
| Heart/CEO            | Mobile Heart tab navigation                          | Mobile navigation lives in the drawer and is off-viewport when closed.                                                                                 | Test and manual flows must open the drawer before switching Heart tabs on phone widths.                         | Expected mobile drawer behavior, not a product bug.                                                 | Covered: E2E helper opens the drawer before mobile tab clicks.                                                                 | P2       | Heart E2E passes on `mobile-chrome`.                                                                       |
| Heart/CEO            | Lead create/edit/delete                              | Existing local browser probe covered throwaway lead create/update/delete, but this follow-up keeps durable E2E focused on search/image/list stability. | Write-flow button regressions still need a dedicated durable mutation spec with cleanup/audit assertions.       | Lead write paths are broader than the scoped flicker fix and touch save/delete/conversion adapters. | Open, documented.                                                                                                              | P1       | Manual emulator mutation proof remains from prior rehearsal; new durable spec covers open/edit modal only. |
| Posts/Stories/Videos | Public/social media surfaces                         | No new media runtime change was made in this follow-up.                                                                                                | Broader story/video loading stability can still require separate checks when those surfaces enter launch scope. | Large shared social runtime and media upload paths are outside this Heart Leads scope.              | Documented, not changed.                                                                                                       | P2       | No new production calls or media writes; keep separate media QA.                                           |

## Local Data And Safety

- Added one emulator-only fixture: `leads/lead-demo-001`.
- The seed now writes 63 local Firestore documents and 6 Auth users after
  `npm run emulators:seed`.
- Heart E2E asserts that emulator mode does not call production Functions,
  Auth or Firestore hosts.
- No production accounts, leads, orders, ads or Firestore Rules were changed.

## Verification

Completed during the fix:

- `npm run test:unit` passed, 124/124.
- `npm run test:rules` passed, 17/17.
- `npm run test:functions` passed, 4/4.
- `npm run lint` passed.
- `npm run format:check` passed after Prettier formatted the updated reports
  and Heart E2E spec.
- `npm run arch:check` passed.
- `npm run build` passed with the existing large `social-app.js` chunk warning;
  no tracked Social bundle files changed in this follow-up.
- `node --test tests/heart-crm-read-view-stability.test.mjs` passed, 3/3.
- `npx playwright test tests/e2e/heart.spec.ts --config tests/e2e/playwright.config.ts --project=chromium` passed, 2/2.
- `npx playwright test tests/e2e/heart.spec.ts --config tests/e2e/playwright.config.ts --project=mobile-chrome` passed, 2/2.

## Remaining Business Web Blockers

- P1: durable Heart lead create/edit/delete E2E with cleanup and audit
  assertions.
- P1: owner order-dashboard operation before controlled restaurant pilot.
- P2: shop owner product mutation image/list stability.
- P2: hotel owner offer/details mutation image/list stability.
- P2: real phone/3G QR, public menu, waiter tablet and Heart Leads rehearsal.
