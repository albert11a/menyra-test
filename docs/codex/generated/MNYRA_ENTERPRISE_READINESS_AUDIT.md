# MNYRA Enterprise Readiness Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This is a docs-only enterprise readiness audit for the full Mnyra platform:
public profiles, business profiles, QR/menu/order, waiter, owner, Heart/CRM,
leads, ads, analytics, feed, shop, hotel/travel, maps, roles, Firestore rules,
functions, tests, bundle/performance and launch roadmap.

No runtime code, Firestore Rules, Firebase Functions, routes, UI, data model,
production config, production data or deploy command was changed for this audit.

## Current Truth Files Used

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`
- `docs/codex/MNYRA_REFACTOR_MASTER_PLAN.md`
- `docs/codex/generated/ORDER_QR_WAITER_FLOW_AUDIT.md`
- `docs/codex/generated/CREATE_RESTAURANT_ORDER_FUNCTION_AUDIT.md`
- `docs/codex/generated/FIRESTORE_RULES_SECURITY_GAP_REPORT.md`
- `docs/codex/generated/ARCHITECTURE_DEPENDENCY_REPORT.md`
- `docs/codex/generated/BUNDLE_ANALYSIS_REPORT.md`

## Evidence Reviewed

- Firestore security contract: `firestore.rules`
- Functions entrypoints and order security: `functions/index.js`,
  `functions/order-security.js`, `functions/heart/*`
- Social app shell and feature controllers under `apps/menyra-social/core/*`
- Heart app read/write adapters under `apps/mnyra-heart/*`
- Waiter app under `apps/waiter/*`
- Feature flags: `shared/config/feature-flags.js`
- Local seed contract: `seed/data/mnyra-local-seed.json`
- Rules, functions, unit and E2E scaffolding under `tests/*`
- Package scripts in `package.json`

## Executive Verdict

Mnyra is not enterprise-ready or paid-customer-launch-ready yet. The strongest
current area is the local QR/menu/order/waiter security baseline: browser direct
order writes are denied, the callable Function calculates trusted prices from
server menu items, order mirrors are isolated, and current rules tests cover the
main negative paths.

The largest enterprise blockers are still outside that order baseline:

- Public/app route ownership and profile visibility are still being stabilized.
- `restaurants` is broadly public-readable, while business type specific public
  contracts are not yet separated enough for enterprise privacy.
- Owner, staff, Heart, lead, ad and analytics flows are not covered end-to-end by
  enough automated tests.
- Ads live as mutable arrays under public docs, which is workable locally but
  weak for auditability, moderation history and fine-grained rules.
- Analytics are not a finished platform primitive. Profile/menu/QR/product/ad
  counters and owner dashboards do not have a stable event schema and rules
  contract.
- `social-app.js` remains a mega-entry. The public entry boundary still imports
  app code, so public route performance is not yet enterprise-grade.
- Several launch-critical UI flows require manual browser verification and were
  not requested for this task.

## Readiness Legend

- Green: usable local baseline with automated coverage.
- Yellow: implemented or partially implemented, but needs contract hardening,
  more tests, or manual launch proof.
- Red: missing or unsafe for paid production use.

## Platform Readiness Summary

| Area                         | Status | Current state                                                                                                        | Launch implication                                                                        |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Public routes                | Yellow | `/:slug`, `/:slug/menu`, `/:slug/posts` alias are current truth, but public runtime extraction is unfinished.        | Do not change routes before public contract and manual refresh matrix are frozen.         |
| Public business profile      | Yellow | Public restaurant docs, meta, menu, posts and offers are readable, but `restaurants` is still broad public data.     | Needs field-level public/private separation before enterprise onboarding.                 |
| Personal user profile        | Yellow | User docs are protected; user posts are signed-in readable. Explicit public personal profile contract is incomplete. | Do not promise public creator profiles until visibility states are defined and tested.    |
| Restaurant/cafe/bar          | Yellow | Strongest vertical because menu, QR, orders and waiter have local security coverage.                                 | Can become first launch vertical after manual UI, pricing and release gates pass.         |
| Shop/grocery/product profile | Yellow | Uses menu item/product model with shop-specific fields and public menu publishing.                                   | Needs stock, product visibility, checkout limits and analytics contract before launch.    |
| Hotel/travel/local offers    | Yellow | Focus/offers model stores travel-specific fields and public offer data.                                              | Needs booking/contact semantics, public/private fields and tests before paid use.         |
| Feed/social                  | Yellow | `socialFeed`, business social posts, comments and likes exist with protected counters.                               | Needs moderation, visibility and abuse controls before scale.                             |
| QR/menu/order                | Green  | Callable order flow, rules denial of browser writes and local order tests are current baseline.                      | Still needs production release rehearsal and price data cleanup.                          |
| Waiter                       | Green  | Dedicated waiter app reads authorized restaurant orders and only writes status/timestamps.                           | Needs device/session/manual tablet checks before production.                              |
| Owner tools                  | Yellow | Menu/product/focus/QR/ads/CRM controllers exist.                                                                     | Needs wider tests, permission review and UI stability proof.                              |
| Staff roles                  | Yellow | Staff docs and waiter/business access helpers exist.                                                                 | Needs complete staff role matrix, admin flows and revocation tests.                       |
| Heart/CRM/Admin              | Yellow | Heart routes and read/write adapters exist; CEO-scoped rules protect leads and admin data.                           | Needs stronger test coverage for every mutation and safer audit trails.                   |
| Leads                        | Yellow | CRM saves leads, creates accounts/restaurants/public route metadata.                                                 | Good foundation, but conversion/account-provisioning needs audit trail and rollback plan. |
| Ads                          | Red    | Owner-created pending ads and Heart approval exist, but ads are stored as arrays in public docs.                     | Needs standalone ad records or stronger moderation/audit model before paid ad product.    |
| Analytics                    | Red    | No stable analytics event schema/rules/dashboard baseline for required metrics.                                      | Cannot sell analytics claims yet.                                                         |
| Firestore rules              | Yellow | Strong order and role gates exist, catch-all denies, tests cover key flows.                                          | Needs matrix-driven expansion before enterprise launch.                                   |
| Functions                    | Yellow | Order callable is strong; Heart HTTP handlers exist.                                                                 | Need production-like emulator and release rehearsal for all writable server paths.        |
| UI stability                 | Yellow | Recent public menu/focus skeleton parity work is current; no browser run in this task.                               | Manual mobile/direct-refresh checks remain required.                                      |
| Bundle/performance           | Red    | `social-app.js` and tracked bundle are still too large for public-first enterprise UX.                               | Must split public runtimes before broad launch.                                           |

## Role And Ownership Findings

Guest access is correctly constrained for private data and direct order writes.
Guests can read public routes, public restaurant/business data, public menus,
public business posts and public feed data. They cannot create orders directly
in Firestore.

Authenticated users can read/write their own protected user data, devices,
notifications, menu favorites and certain engagement docs. They can read their
own mirrored orders. They cannot list restaurant orders and cannot mutate
protected counters.

Owners and business staff can manage owned restaurant data, menu items, public
docs and, when authorized, order statuses. This depends on helpers such as
`isRestaurantOwner`, `hasRestaurantBusinessAccess`,
`hasRestaurantWaiterAccess`, `canManageRestaurantDoc` and
`canAccessRestaurantOrdersDoc`.

Waiters have a narrow order status workflow. The waiter app updates only
`status`, `updatedAt` and `updatedAtClient`, and rules/tests enforce this.

CEO/Heart actors can access leads, admin collections and wider CRM surfaces.
This is necessary for admin operations but needs deeper mutation-level tests and
audit logs before enterprise launch.

## Feature Area Findings

### Public Profiles

Public business profile state is implemented through restaurant documents,
`publicRoutes/{slug}`, `restaurants/{restaurantId}/public/*`, menu items,
business posts and global feed documents. This is functional but not cleanly
enterprise-ready because the public field contract is not isolated enough from
the broad `restaurants` read rule.

Personal user profiles are more private by default. `users/{uid}` is not guest
readable, and user posts require signed-in access. A finished public personal
profile product needs explicit visibility states, public profile projection
docs and route tests.

### Menus, Products And Orders

Menu/product editing writes to `restaurants/{restaurantId}/menuItems/*` and
publishes public menu state under `restaurants/{restaurantId}/public/menu`.
Restaurant and shop modes share infrastructure. Order creation is intentionally
server-owned through `createRestaurantOrder`, which reads trusted menu item
prices and writes canonical totals.

The remaining blocker is data quality and schema consistency: browser menu
editing still supports transitional string/numeric price input, while enterprise
orders should depend on a stable numeric price contract.

### QR And Waiter

Table QR configuration is stored on restaurant public meta. QR order intent is
handled by the callable Function and order lookup mirrors. Waiter reads and
status updates have focused rules tests and emulator tests. This is the most
launchable slice after manual UI/device proof.

### Leads, Ads And CRM

Leads are CEO-scoped and CRM conversion can write restaurant and owner account
state. Heart wraps social CRM read/write adapters and can approve/reject ads.
This is useful but too coupled for an enterprise admin surface without stronger
mutation tests and audit history.

Ads are the weakest monetization surface. Owner ads are stored as items in a
public document and Heart mutates the array status. That makes moderation
history, per-ad permissions, deletion review and analytics harder than they
need to be.

### Analytics

Analytics are not launch-ready. The product needs stable event names, write
rules, dedupe/aggregation strategy, owner dashboard queries and tests for:
profile views, menu views, QR scans, product views, Wolt/WhatsApp clicks,
orders, waiter calls, leads, ad impressions, ad clicks, cross-selling
interactions and hotel/shop-specific conversion events.

### Performance And UI Stability

The current architecture still routes too much through `social-app.js`. The
source file is roughly 200 kB and the tracked bundled entry is roughly 1.1 MB
raw in the existing report. Vendor Firebase and several feature chunks are also
large. Public profile/menu/QR should not pay for owner, CRM, chat, feed, travel
and shopping code on first load.

Recent work improved public menu/focus loading skeleton parity, but enterprise
readiness still needs manual mobile/direct-refresh checks and public route
bundle splitting.

## Existing Automated Coverage

Current tests cover important local guarantees:

- Guest and signed-in direct Firestore order creates are blocked.
- Trusted `createRestaurantOrder` computes canonical totals.
- Buyer, waiter, owner and CEO order access paths are tested.
- Protected counters are guarded.
- Owner business edit restrictions are tested.
- CEO/Heart ad approval is tested at the rules level.
- Public profile/menu/post reads are tested against private user data denial.
- Unit tests cover many route, public menu, profile, CRM and engagement helpers.

The gaps are broader than the current automated suite:

- Full role matrix is not exhaustively tested per collection and business type.
- Owner/staff/Heart write workflows need mutation-level tests.
- Personal public profile visibility is not finished.
- Analytics event writes and owner dashboards are not covered.
- Ads need per-ad moderation and analytics tests.
- Public route browser tests are prepared/skipped or not run for this task.

## Security And Data-Risk Findings

Good current protections:

- Catch-all deny exists.
- Browser direct order creation is denied.
- Order totals are server-derived.
- Buyers cannot list restaurant orders.
- Waiter status updates are narrow.
- CEO-only collections and lead access are gated.
- Public route docs are read-only from the browser.

Enterprise risks:

- `restaurants` broad public read exposes more business data than a mature
  public projection model should.
- Ads as arrays inside public docs limit rules granularity and auditability.
- Analytics does not yet have a stable write/read/rules design.
- Staff role semantics are implemented but not fully documented and tested for
  every surface.
- Production release rehearsal is still required before any real customer data.

## Source Contradiction Note

`CREATE_RESTAURANT_ORDER_FUNCTION_AUDIT.md` is older than
`ORDER_QR_WAITER_FLOW_AUDIT.md` and still mentions a mirror/notification
`serverTimestamp` worker issue. Current source and newer tests show the mirror
and waiter notification worker path has been fixed locally. Treat the older
note as historical context unless a new test failure reopens it.

## Enterprise Launch Decision

Do not sell Mnyra as a complete enterprise platform yet.

The safe business sequence is:

1. Harden and release the restaurant QR/menu/order/waiter slice with explicit
   production gates.
2. Freeze the public route/profile/menu visibility contract.
3. Add analytics as a platform primitive.
4. Harden owner/staff/Heart/lead/ad mutation workflows.
5. Split public runtimes and reduce first-load bundles.
6. Expand shops and hotels only after product/order/offer contracts are
   type-specific and tested.
