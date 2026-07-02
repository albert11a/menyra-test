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
