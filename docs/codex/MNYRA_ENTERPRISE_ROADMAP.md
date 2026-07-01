# MNYRA Enterprise Roadmap

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This roadmap turns the enterprise readiness audit into execution order. It does
not approve production deploys, route changes, Firestore collection renames, UI
redesigns or runtime extraction by itself.

## Launch Principle

Launch the smallest revenue-critical slice that is already close to secure:
restaurant public profile, menu, QR order and waiter status flow. Do not sell
analytics, ads, shops, hotels or broad CRM promises until their contracts and
tests catch up.

## P0: Before Any Paying Customer Or Production Data

| Workstream                        | Business value                                     | Exit criteria                                                                                    |
| --------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Public route contract freeze      | Prevent broken links and stale local assumptions.  | `/:slug`, `/:slug/menu`, `/:slug/posts`, QR `src=qr` and `table` behavior documented and tested. |
| Public/private profile projection | Prevent accidental business/private data exposure. | Public profile/menu/discovery reads no longer depend on broad mixed private fields.              |
| Restaurant order release gate     | Enables first real revenue workflow.               | Functions, rules, unit, build and manual QR/order/waiter matrix pass against emulator seed.      |
| Numeric menu price migration      | Protects order totals and customer trust.          | Menu item prices normalized to a stable numeric contract with migration/tests.                   |
| Staff/waiter revocation tests     | Protects restaurant operations.                    | Invite, role change, revoke, stale device and denied restaurant switch tests exist.              |
| Heart/lead mutation audit         | Protects account provisioning.                     | Lead save/convert/delete and owner account bootstrap have tests and audit metadata.              |
| Minimal analytics design          | Prevents spoofed or useless metrics.               | Event schema, permissions and aggregation plan approved before any tracking is sold.             |
| Ads safety decision               | Avoids unsafe paid ad product.                     | Ads remain internal/test-only or move to safer per-ad records with moderation audit trail.       |
| Manual launch rehearsal           | Catches UI/device failures not covered by tests.   | Public profile/menu/QR/order/waiter/owner/Heart checks recorded on mobile and desktop.           |

## P0 Implementation Block Started 2026-07-01

This branch now starts the first real P0 implementation phase after the
enterprise readiness audit. The block is intentionally limited to contracts,
local seed data, automated rules/unit coverage and small correctness fixes. It
does not approve production data, production deploys, route changes, collection
renames, broad UI changes or runtime extraction.

| Order | Work item                          | Output                                                                                               | Exit signal                                                                 |
| ----- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1     | Public profile contract            | `docs/codex/generated/PUBLIC_PROFILE_CONTRACT.md`                                                    | Allowed/prohibited public fields and current route contracts are explicit.  |
| 2     | Auth and role flow audit           | `docs/codex/generated/AUTH_AND_ROLE_FLOW_AUDIT.md`                                                   | Owner, waiter, staff hint, Heart and lead mutation boundaries are mapped.   |
| 3     | Business tool test matrix          | `docs/codex/generated/BUSINESS_TOOL_TEST_MATRIX.md`                                                  | Launch-critical business flows are labeled automated, manual, red or green. |
| 4     | Local seed expansion               | Restaurant, shop, hotel, owner, waiter, Heart, public projection and private fixtures in local seed. | Emulator-only fixtures can drive rules and manual launch checks.            |
| 5     | Menu price correctness             | Menu editor and public menu publish paths normalize prices to numbers.                               | Unit coverage proves string editor input saves/publishes numeric prices.    |
| 6     | Rules coverage expansion           | Owner menu, private profile denial, waiter revocation, stale staff hints, Heart leads and ads tests. | Rules tests prove current P0 boundaries before launch rehearsal.            |
| 7     | Manual launch rehearsal            | Browser/device checklist from the matrix.                                                            | Recorded owner, public, QR, waiter and Heart smoke results.                 |
| 8     | Public runtime extraction planning | Follow-up implementation plan only after contracts/tests are stable.                                 | Extraction starts behind false flags and without route/product drift.       |

The next engineering block should complete projection builder tests and manual
browser launch rehearsal before any public runtime split.

## P1: First Controlled Restaurant Launch

| Workstream                 | Business value                           | Exit criteria                                                                                |
| -------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Restaurant public website  | Gives businesses a reliable public page. | Profile, menu, hours, address, map, posts and contact CTAs verified for seed and pilot data. |
| QR ordering                | Primary local commerce value.            | Guest and signed-in order flows pass manual and automated checks.                            |
| Waiter operations          | Makes orders operationally usable.       | Waiter board, status flow, device registration and notifications verified.                   |
| Owner menu/order dashboard | Lets businesses self-manage.             | Owner can edit menu, publish, configure QR and manage orders without admin help.             |
| Heart support console      | Lets internal team support pilots.       | Heart can search customer, inspect lead/account/ad states and resolve issues safely.         |
| Release checklist          | Prevents accidental prod changes.        | No deploy from Codex; production release has explicit human gate and rollback plan.          |

## P2: Monetization And Admin Expansion

| Workstream            | Business value                 | Exit criteria                                                                                   |
| --------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Owner analytics MVP   | Gives owners measurable value. | Trusted profile/menu/QR/order metrics with owner-scoped dashboard and tests.                    |
| Lead funnel analytics | Helps sales and onboarding.    | Lead source, conversion and customer status events defined and permissioned.                    |
| Ads beta              | New revenue stream.            | Per-ad audit, approved-only public render, impression/click metrics and Heart moderation tests. |
| Staff management      | Supports larger restaurants.   | Owner-facing staff lifecycle is fully tested and documented.                                    |
| Shop/product mode     | Expands customer base.         | Product visibility, stock, product detail and product analytics pass tests.                     |
| Hotel/travel offers   | Expands verticals.             | Offer, booking/contact and travel analytics contracts are type-specific.                        |

## P3: Enterprise Scale And Runtime Extraction

| Workstream                    | Business value                   | Exit criteria                                                                                        |
| ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Public runtime extraction     | Faster guest public pages.       | Public profile/menu/QR entrypoints are independently bundled behind feature flags and then promoted. |
| Owner runtime extraction      | Cleaner owner admin performance. | Owner dashboard loads without public/feed/chat/Heart coupling.                                       |
| Heart/CRM hardening           | Safer internal operations.       | Heart handlers have auth/session/error tests and audit logs.                                         |
| Bundle budgets                | Protects mobile UX.              | CI fails if public route bundles exceed agreed thresholds.                                           |
| Observability                 | Faster issue response.           | Logs, error tracking, analytics integrity checks and release dashboards exist.                       |
| Enterprise compliance package | Enables larger customers.        | Data retention, access logs, admin actions and support workflows are documented.                     |

## Do Not Do Yet

- Do not merge this branch to `main` automatically.
- Do not rename Firestore collections.
- Do not loosen Firestore Rules to make UI tests pass.
- Do not activate new runtimes by default.
- Do not sell ads or analytics until their event/rules/audit model exists.
- Do not promise public personal profiles until visibility states are frozen.
- Do not run production deploys from Codex.

## Next Safe Refactor Step

The next safe engineering step is not a visual redesign. It is a contract pass:
freeze public route/profile/menu fields, document public projections, then add
matrix-driven tests before any runtime extraction or production launch.
