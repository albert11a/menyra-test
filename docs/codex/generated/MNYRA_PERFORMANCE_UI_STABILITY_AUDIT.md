# MNYRA Performance And UI Stability Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This audit covers current bundle shape, public route performance risk, UI
stability risk, loading states, manual browser checks and architecture blockers.
It is docs-only and does not change runtime code or build config.

## Rollback Update 2026-07-02

Commit `f3963b07` (`fix: stabilize heart leads interactions`) has been backed
out. Its Heart Leads DOM-local search filtering, active-search render skips,
CRM avatar marker/fallback changes, desktop sidebar CSS fix, emulator-only lead
fixture and Heart E2E changes are no longer accepted as the solution.

Reason: real usage still shows rapid Lead profile-image flicker and Search
input disruption. Green desktop tests or DOM-marker assertions are not enough to
close this class of issue. Mnyra is mobile-first, so image flicker, Search/input
focus and business-tool stability must be evaluated mobile-first.

Rollback verification passed Functions 4/4, Rules 17/17, Unit 123/123, lint,
final format check, architecture check and build. The build did not change
tracked files under `apps/menyra-social/bundled`; the existing large
`social-app.js` chunk warning remains.

## Current Architecture Evidence

- Main social source: `apps/menyra-social/social-app.js`
- Tracked social bundle: `apps/menyra-social/bundled/entry/social-app.js`
- Public entry boundary: `apps/menyra-social/social-public-entry.js`
- Architecture reports:
  - `docs/codex/generated/ARCHITECTURE_DEPENDENCY_REPORT.md`
  - `docs/codex/generated/BUNDLE_ANALYSIS_REPORT.md`
- Current feature flags:
  - `USE_NEW_PUBLIC_MENU_RUNTIME=false`
  - `USE_NEW_PUBLIC_PROFILE_RUNTIME=false`
  - `USE_NEW_QR_MENU_RUNTIME=false`
  - `USE_NEW_WAITER_RUNTIME=false`
  - `USE_NEW_OWNER_RUNTIME=false`
  - `USE_CREATE_RESTAURANT_ORDER_FUNCTION=true`

## Bundle Findings

The current bundle shape is not enterprise-ready for public-first traffic.

Observed source/report data:

- `social-app.js` source is roughly 200 kB.
- The tracked bundled entry is roughly 1.1 MB raw in the existing bundle report.
- Firebase vendor code is the largest current chunk.
- Public profile/menu/QR routes still risk loading too much app code.
- The public entry boundary still imports app runtime code rather than being a
  fully independent public runtime.

Large chunks observed in current reports/source pass include:

| Chunk or area                         | Approximate risk                                                   |
| ------------------------------------- | ------------------------------------------------------------------ |
| Firebase vendor chunk                 | Very high first-load cost.                                         |
| Public profile/menu/focus rendering   | Large public surface with recent skeleton/loading work.            |
| Marketplace/product rendering         | Adds cost to non-shop routes if not split correctly.               |
| CRM/Heart-adjacent runtime clusters   | Should not affect public guest routes.                             |
| Menu modal and discovery runtimes     | Need route-level loading discipline.                               |
| Chat, feed and engagement controllers | Should stay outside public profile/menu first paint unless needed. |
| Orders runtime                        | Should load on menu/order intent, not basic profile paint.         |

## UI Stability Findings

Recent current-phase work focuses on public menu/focus skeleton parity and
direct refresh behavior. That is the right direction, but it is not a complete
UI stability proof.

Clean Web follow-up on 2026-07-02 fixed several small loading issues: Public
Menu now retains existing visible items during transient `unknown` reads, Public
Profile avatars/logos use stable last-good image keys during header settling,
avatar image markup has explicit fallbacks and Heart CRM lists keep rows visible
while read-only domains refresh. The later Heart Leads interaction/image
follow-up `f3963b07` was reverted and must not be counted as a solved flicker
issue.

Current UI risks:

- Public route refresh can still reveal stale tracked bundles if build is not
  run after browser-visible changes.
- Route-specific skeletons and empty states need manual mobile/desktop checks.
- Long business names, menu item names, product badges, prices and travel offer
  labels need overflow checks.
- Public menu, profile, QR and focus views need stable dimensions to avoid
  layout jumps.
- Images and media need fallback/loading/error states by business type.
- Owner/Heart/admin views need dense operational UI checks, not marketing-style
  assumptions.
- Heart Leads profile-image flicker and Search disruption remain open after the
  `f3963b07` rollback and need mobile-first diagnosis before any fix.
- Business/Profile/Menu/Focus context bleed is fixed in the current P0 task:
  owner-profile return deactivates stale public direct-entry state and refuses
  to keep wrong-business public Menu/Focus payloads visible.
- Shop product and Hotel offer mutations still need vertical-specific browser
  coverage before those verticals leave manual/P2 status.

## Manual Browser Checks Still Required

The 2026-07-02 Clean Web task explicitly requested browser checks, so targeted
Public Profile/Menu/QR, Owner/Menu and Waiter Playwright coverage is part of
that pass. Real-device mobile/3G checks are still manual and carry more weight
than desktop-only evidence.

Final Clean Web verification passed: Unit 123/123, Rules 17/17, Functions 4/4,
lint, format, architecture check, production build and targeted Playwright
16/16. The build updated the tracked social bundle and replaced the hashed
profile-render chunk. The large `social-app.js` bundle warning remains a P3
performance/runtime-extraction risk, not a Clean Web correctness failure.

Before launch, manually verify at least:

1. `/:slug` direct refresh for seed restaurants.
2. `/:slug/menu` direct refresh.
3. `/:slug/posts` compatibility alias.
4. QR menu context with `src=qr` and `table`.
5. Public profile header, images, hours, address, map and social links.
6. Public menu categories, item detail, empty states and disabled items.
7. Cart, checkout, order confirmation and guest recovery.
8. Waiter tablet/mobile board and status transitions.
9. Owner menu/product/focus/QR/ads flows.
10. Business owner return from foreign public business to own profile/menu for
    restaurant, shop and hotel owner accounts.
11. Heart leads/customers/ads/staff flows, starting with mobile-first Lead
    image flicker and Search focus diagnosis.
12. Shop product and hotel/travel offer variants.
13. Mobile narrow viewport text overflow and tap target behavior.

## Current Clean Web Follow-Up 2026-07-02

Current small fixes and diagnostics:

- App-shell profile avatar images now opt into the existing fallback binder via
  `data-fallback-src` for authenticated header, restoring-session header and
  drawer avatars. This reduces broken/grey avatar states without redesigning
  the shell.
- Heart CRM Lead cards and avatars now expose diagnostic data attributes. The
  mobile E2E can count card rebuilds, avatar `src` changes, list-empty
  transitions and Search focus loss while also rejecting external production
  Firebase/Mnyra requests in emulator mode.

Current browser evidence:

- Mobile Chrome targeted Playwright passed Public Profile/Menu/QR, Owner/Menu,
  Waiter and Heart, 10/10.
- Desktop Chromium targeted Playwright passed Public Profile/Menu/QR,
  Owner/Menu and Waiter, 9/9; Heart diagnostic is mobile-only by design.
- Targeted Node regressions for avatar fallbacks and Heart marker output
  passed, 8/8.

Remaining stability/performance risks:

- Heart Leads profile-image flicker and Search disruption are still open as a
  P1 mobile-first product issue if reproduced on real phone/3G. The current
  change measures it; it does not claim to fix it.
- Shop product and Hotel offer media mutation stability remain P2 coverage
  gaps.
- The large `social-app.js` public-route bundle remains a P3 extraction/budget
  risk and is not solved by this small stability pass.
- Final baseline passed for this follow-up: Functions 4/4, Rules 17/17, Unit
  127/127, lint, format check, architecture check and build. The build changed
  only `apps/menyra-social/bundled/entry/social-app.js`; no tracked bundle
  manifest or hashed chunk changed.

## Performance Gates Before Enterprise Launch

| Gate                    | Requirement                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Public route bundle     | Public profile/menu/QR should have independent entrypoints with budgets.            |
| Firebase loading        | Auth/Firestore should load only when needed by route and user state.                |
| Owner/CRM isolation     | Owner, Heart, CRM, chat and feed code must not block public route first paint.      |
| Image handling          | Public images need dimensions, fallbacks, lazy loading and error states.            |
| 3G/mobile profile       | Public profile/menu/QR must be usable on slow mobile connections.                   |
| Stale bundle prevention | Build must run after browser-visible changes and tracked bundles must be inspected. |
| Regression evidence     | Bundle report and manual/browser matrix must be attached to launch decision.        |

## Recommended Extraction Order

Follow the current refactor master plan. Do not extract `social-app.js` blindly.

1. Freeze public route and public visibility contracts.
2. Extract pure helpers and public projection readers.
3. Extract public profile runtime behind false feature flag.
4. Extract public menu/QR runtime behind false feature flag.
5. Extract waiter runtime if needed after contract stabilization.
6. Extract owner runtime after menu/order contracts are stable.
7. Extract Heart/CRM and authenticated social/feed/travel/shopping chunks after
   public launch paths are protected.

## Readiness Verdict

Performance and UI stability are currently Yellow/Red. The product can continue
local prep, but enterprise launch needs public runtime splitting, bundle budgets,
manual mobile/browser proof and route-specific loading guarantees.

## Restaurant Pilot Readiness Extension 2026-07-02

The restaurant pilot now has an explicit loading/error/race audit in
`docs/codex/generated/MNYRA_RESTAURANT_PILOT_READINESS_AUDIT.md`.

Stability evidence added:

- Public Menu canonical empty state and missing-projection behavior are tested
  with temporary emulator fixtures.
- Public Menu error state is unit-tested to require real menu error truth.
- QR `src=qr&table=2` refresh and invalid table sanitizing are mobile-tested.
- QR order double submit is covered in browser and unit tests.
- Waiter board status refresh is mobile-tested.

Performance/stability caveats:

- The MCP browser gutcheck without E2E image stubbing generated repeated
  `images.example.local` DNS errors from fake local seed URLs. This is not a
  production data issue, but it confirms that real broken-image behavior must
  remain part of mobile/3G manual checks.
- Owner order-dashboard loading/empty/error behavior is still P1 before pilot
  operations.
- The large `social-app.js` public-route bundle remains a P3 extraction risk;
  no runtime extraction was started.

Final verification for this extension passed: Functions 4/4, Rules 17/17, Unit
130/130, lint, format check, architecture check, build and relevant Playwright
25/25 with one intentional desktop Heart skip. The build changed no tracked
bundle files. The existing large `social-app.js` chunk warning remains.

## Owner Orders Stability Follow-Up 2026-07-02

The Owner Orders view had a visible refresh-risk pattern: populated orders were
hidden whenever the Orders state returned to `loading`. That is now fixed in
the renderer by retaining existing cards during refresh loading/error and only
using the full loading block for true first load.

New evidence narrows the restaurant-pilot Owner Orders risk:

- Unit coverage proves card retention during refresh loading/error.
- Mobile browser coverage proves restaurant-owner list/refresh/non-foreign
  behavior and shop-owner empty state.

Remaining performance/stability caveats are unchanged: forced listener errors,
disabled/deleted cart item UX, real phone/3G behavior and the large
`social-app.js` public-route bundle remain open risks.

Final verification for the follow-up passed after a full emulator restart and
reseed: Functions 4/4, Rules 17/17, Unit 133/133, lint, format check,
architecture check, build and relevant Playwright 29/29 with one intentional
desktop Heart skip. The build changed only
`apps/menyra-social/bundled/entry/social-app.js`; the large `social-app.js`
chunk warning remains a documented P3 runtime-extraction risk.

## Mobile Manual Stability Sweep 2026-07-02

The prior bundle warning is now tied to visible mobile evidence. Cold Public
Profile/Menu became useful after about 11.1 seconds on emulated Fast 3G and
41.8 seconds on emulated Slow 3G. The 8/12-second screenshots were still blank.
The primary transfers were `social-app.js` at about 1.136 MB raw, Firebase at
about 442 kB and, for menu, the profile/menu renderer at about 160 kB.

The visible blank screen is P1 for launch; the safe structural correction is
the existing P3 public-runtime/bundle work and was not started here. Small
stability fixes did remove the broken-image request loop and production
bootstrap call in emulator mode. Heart Search focus and Feed story permission
remain separate P1 issues.
