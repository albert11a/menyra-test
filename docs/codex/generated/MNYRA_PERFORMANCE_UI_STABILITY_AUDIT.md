# MNYRA Performance And UI Stability Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This audit covers current bundle shape, public route performance risk, UI
stability risk, loading states, manual browser checks and architecture blockers.
It is docs-only and does not change runtime code or build config.

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

## Manual Browser Checks Still Required

Do not treat this audit as a browser verification pass. Playwright/smoke checks
were not requested and repo instructions forbid running them unless explicitly
asked.

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
10. Heart leads/customers/ads/staff flows.
11. Shop product and hotel/travel offer variants.
12. Mobile narrow viewport text overflow and tap target behavior.

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
