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

Mnyra is mobile-first. Real phone/mobile browser behavior is the primary launch
criterion for visible loading, image flicker, Search/input focus and business
tools. Desktop manual tests can support the decision, but they do not close a
visual issue when mobile remains unverified or contradictory.

## P0: Before Any Paying Customer Or Production Data

| Workstream                        | Business value                                     | Exit criteria                                                                                                      |
| --------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Public route contract freeze      | Prevent broken links and stale local assumptions.  | `/:slug`, `/:slug/menu`, `/:slug/posts`, QR `src=qr` and `table` behavior documented and tested.                   |
| Public/private profile projection | Prevent accidental business/private data exposure. | Public profile/menu/discovery reads no longer depend on broad mixed private fields.                                |
| Restaurant order release gate     | Enables first real revenue workflow.               | Functions, rules, unit, build and manual QR/order/waiter matrix pass against emulator seed.                        |
| Numeric menu price migration      | Protects order totals and customer trust.          | Menu item prices normalized to a stable numeric contract with migration/tests.                                     |
| Staff/waiter revocation tests     | Protects restaurant operations.                    | Invite, role change, revoke, stale device and denied restaurant switch tests exist.                                |
| Heart/lead mutation audit         | Protects account provisioning.                     | Lead save/convert/delete and owner account bootstrap have tests and audit metadata.                                |
| Minimal analytics design          | Prevents spoofed or useless metrics.               | Event schema, permissions and aggregation plan approved before any tracking is sold.                               |
| Ads safety decision               | Avoids unsafe paid ad product.                     | Ads remain internal/test-only or move to safer per-ad records with moderation audit trail.                         |
| Manual launch rehearsal           | Catches UI/device failures not covered by tests.   | Public profile/menu/QR/order/waiter/owner/Heart checks recorded mobile-first; desktop is supporting evidence only. |

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

The Owner/Menu browser blocker and public-startup denied-list blocker are now
closed. The next engineering block should complete the public projection
builder gap before any activated public runtime split.

## P0 Browser Rehearsal Completed 2026-07-01

The local browser launch rehearsal is recorded in
`docs/codex/generated/P0_BROWSER_LAUNCH_REHEARSAL.md`.

Browser-checked P0 points:

- Public restaurant, shop and hotel routes open and refresh on desktop/mobile.
- `/:slug/posts` alias remains readable for restaurant, shop and hotel seeds.
- Public menu routes open and refresh on desktop/mobile.
- QR menu context preserves `src=qr` and `table`, creates a callable order and
  hands it to the waiter board.
- Waiter login/order/status flow passes locally; item/total writes and foreign
  order reads are denied in the browser spec.
- `/menu` is the stable protected owner entry. Restaurant owner
  create/edit/delete/publish, numeric price projection, foreign-business
  read-only behavior and seeded QR tables pass on desktop/mobile.
- Shop and hotel owners reach their existing Product and Hotel Details/Oferta
  editor contexts on desktop/mobile; their vertical-specific mutations remain
  later work.
- The denied public-startup `list` was the legacy Feed story collection-group
  preload. It is mapped and no longer scheduled outside the Feed tab.
- Heart non-CEO block, CEO login, local Functions routing and lead
  create/update/delete pass in an interactive local browser probe.

Still blocking P0 points:

- The dedicated public route/profile/meta/offers/ads projection builders now
  exist with matrix-driven contract tests. Public profile read-once hydration
  and discovery identity still depend partly on transitional mixed
  `restaurants/{id}` data, so root-read tightening is not active yet.
- Heart Ads remains blocked for paid launch. The local Ads view loaded as
  read-only/count 0, and the current array model is still too coarse for
  auditable paid moderation.
- Owner order-dashboard operation and real-device QR/table use remain manual
  pilot checks outside this browser mutation task.

Public runtime extraction decision:

- Extraction planning may continue behind false flags.
- The missing-builder prerequisite is closed. No activated public runtime split
  should start until profile/meta reads are moved off mixed root restaurant
  records and route parity is reverified. Owner/Menu proof and the
  public-startup denied `list` are no longer blockers.

## Public Projection Builder Block Completed 2026-07-01

The pure builder layer now lives in
`apps/menyra-social/core/public-profile/public-projection-builders.js` and
covers route, profile, meta, offers and ads projections.

Current guarantees:

- Outputs are explicit allowlists, serializable plain objects and deterministic
  for the same input.
- Restaurant, shop and hotel/travel fixtures reject nested owner, staff, CRM,
  billing, booking-admin and private pricing data.
- Offer price fields normalize to numbers or `null`.
- Public ads include approved active display records only; draft, pending,
  rejected and inactive records are removed.
- Seed public projection documents reproduce the same contracts through the
  builders.
- Public focus offer reads and public discovery offer/ad enrichment use the new
  builder layer.

Public read tightening can now be designed against stable contracts. It is not
ready to activate until the public profile/meta runtime stops reading and
merging broad root restaurant data. The existing runtime extraction plan
therefore remains false-flag-only. The ads array model was intentionally not
migrated and remains a paid-launch blocker.

Verification for this block is green across Unit (120), Rules (17), Functions
(4), lint, format, architecture and build. Public/owner browser coverage passed
on desktop and mobile with the current seed; one desktop owner public-menu
projection assertion required a targeted retry after an immediate-read race.
The tracked social bundle entry was rebuilt. No Rules, route, collection or
feature-flag activation was included.

## Clean Web Loading Pass Completed 2026-07-02

The Clean Web pass is scoped to visible loading stability and does not continue
Public Read Cutover, runtime extraction or a broad `social-app.js` refactor.

Fixed or covered:

- Public Menu/QR keeps existing visible items during transient `unknown`
  projection reads instead of briefly clearing the list.
- Public Profile avatars/logos use stable last-good image keys while header
  data settles, and avatar images now expose explicit fallbacks.
- Heart CRM read-only lists keep populated rows visible during refresh instead
  of replacing them with repeated loading blocks.
- Public Profile/Menu/QR and Waiter browser specs now include fallback,
  broken-image, empty-menu and button recovery checks.
- Final local verification passed Unit 123/123, Rules 17/17, Functions 4/4,
  lint, format, architecture check, build and targeted Playwright 16/16.
- The tracked social bundle was rebuilt, including the new hashed profile
  render chunk.

Still open before the relevant verticals launch:

- Heart Leads profile-image flicker and Search disruption are open again after
  `f3963b07` was reverted. The next Heart block must be mobile-first diagnosis,
  not another blind DOM-local filtering or desktop CSS patch.
- Shop owner product mutation image/list stability.
- Hotel owner offer/details mutation image/list stability.
- Durable authenticated Heart lead mutation E2E.
- Real phone/tablet and slow-network QR/Menu/Waiter checks.

Rollback verification for `f3963b07` passed Functions 4/4, Rules 17/17, Unit
123/123, lint, final format check, architecture check and build. The build did
not change tracked social bundle files. Mobile Heart Leads diagnosis was not run
and remains open.

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

Do not start Public Read Cutover, runtime extraction or a broad
`social-app.js` refactor from the Clean Web task. The next safe work item should
be chosen explicitly after the Clean Web verification and commit are complete.
When public read cutover is requested later, keep it guarded, preserve current
visible profile/menu behavior, do not tighten Firestore root reads until the
direct-refresh/QR matrix passes, keep Ads and analytics disabled and keep
runtime extraction behind false flags.
