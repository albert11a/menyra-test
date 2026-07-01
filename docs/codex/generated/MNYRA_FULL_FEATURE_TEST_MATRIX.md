# MNYRA Full Feature Test Matrix

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This file maps the full requested platform surface to current automated tests,
prepared E2E coverage, missing checks and manual launch tests. It does not add
or change tests.

## Test Status Legend

- Green: automated local test coverage exists for the important contract.
- Yellow: partial coverage or prepared/skipped test exists.
- Red: missing coverage for enterprise launch.
- Manual: browser/device validation required and not run in this task.

## Required Command Baseline

The task-level validation commands are:

- `npm run test:functions`
- `npm run test:rules`
- `npm run test:unit`
- `npm run lint`
- `npm run format:check`
- `npm run arch:check`
- `npm run build`

Playwright/smoke checks were not requested and must not be run under the current
repo instruction unless the user explicitly asks for them.

## Feature Matrix

| Feature area             | Current status | Existing automated evidence                                                                  | Missing automated coverage                                                                 | Manual launch checks required                                                                |
| ------------------------ | -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Public route resolution  | Yellow         | Unit tests around route runtime/public route registry and current phase reports.             | Direct matrix for `/:slug`, `/:slug/menu`, `/:slug/posts`, `src=qr`, `table` and refresh.  | Mobile/desktop direct refresh for known seed businesses.                                     |
| Public business profile  | Yellow         | Rules test for public profile/menu/posts readable while private user data is blocked.        | Field-level public/private assertions for every business type.                             | Header, images, opening hours, address, map, social links, posts, comments and empty states. |
| Personal user profile    | Yellow         | User private data rules and signed-in post access paths.                                     | Public personal profile projection, visibility and blocked guest checks.                   | Signed-out/signed-in visibility review.                                                      |
| Menu public view         | Yellow         | Unit tests for public menu state/skeleton/parity utilities.                                  | Full route/browser assertions are prepared but not active here.                            | Menu load, categories, details, empty states, cross-sell and refresh.                        |
| Menu editor              | Yellow         | Unit coverage for menu save helpers and related controllers.                                 | Owner permission and schema tests for restaurant/shop/hotel variants.                      | Owner create/edit/delete/publish flow.                                                       |
| Product/shop menu        | Yellow         | Shared menu item/product code and seed product.                                              | Stock, product visibility, price and disabled item rules by shop type.                     | Product detail, sizes/colors, stock states, cart eligibility.                                |
| Restaurant QR order      | Green          | Functions emulator tests for callable order creation and rules tests blocking direct writes. | Production release rehearsal and invalid QR/table matrix.                                  | QR scan, table context, cart, submit, receipt/recovery.                                      |
| Guest order recovery     | Green/Yellow   | Order lookup read/write restrictions and Function mirror behavior.                           | Token retention/expiry tests.                                                              | Same-device and second-device lookup behavior.                                               |
| Signed-in order mirror   | Green          | Rules tests for buyer own order read and no restaurant order list.                           | Multi-account negative cases beyond current coverage.                                      | Account order history UI.                                                                    |
| Waiter app               | Green          | Rules tests for waiter read/status-only updates and Function notification path.              | Full staff revocation and stale device tests.                                              | Tablet/mobile waiter board, status tabs, push registration.                                  |
| Owner order management   | Yellow         | Rules tests for owner/CEO order access.                                                      | Owner UI status flow and archive/state transitions.                                        | Owner dashboard order tabs and conflict states.                                              |
| Staff role management    | Yellow         | Rules helpers and partial staff document access.                                             | Create/update/delete/revoke staff tests by role.                                           | Invite, revoke, login, denied restaurant switch.                                             |
| Heart leads              | Yellow         | CEO-scoped rules for leads and unit coverage for CRM loader boundaries.                      | Lead conversion/account provisioning side effects and rollback tests.                      | Create lead, search, convert, edit, delete/archive.                                          |
| Heart customers          | Yellow         | CRM read loaders derive customers from restaurants.                                          | Mutation tests for customer edits and role boundaries.                                     | Customer search, edit, owner link, status fields.                                            |
| Heart staff/admin        | Yellow         | Admin collections guarded in rules.                                                          | Full admin bootstrap/lifecycle tests.                                                      | Staff admin routes, permission denied states.                                                |
| Ads owner create/edit    | Yellow/Red     | Rules test says CEO/Heart can approve ads and owner cannot approve.                          | Per-ad create/edit/delete/audit tests, item array conflict tests, public visibility tests. | Owner pending ad flow and rejection/approval UI.                                             |
| Ads Heart approval       | Yellow/Red     | Heart write adapter mutates ad status in public ads doc.                                     | Concurrent moderation, reviewer history and analytics tests.                               | Approve/reject, owner feedback, public ad display.                                           |
| Analytics                | Red            | No stable analytics event/rules/dashboard suite found.                                       | All analytics event writes, reads, aggregation, dedupe and owner dashboard tests.          | Profile/menu/QR/product/ad/order/waiter/lead dashboard.                                      |
| Social feed              | Yellow         | Rules for global feed, business posts, comments/likes and protected counters.                | Moderation/report/block/visibility tests and business type filters.                        | Feed load, engagement, deleted/hidden states.                                                |
| User social posts        | Yellow         | Signed-in read and self/CEO write rules.                                                     | Public visibility model and privacy tests.                                                 | Own profile posts, privacy transitions.                                                      |
| Comments and likes       | Yellow         | Counter protection and signed-in engagement paths.                                           | Abuse/rate/report/moderation tests.                                                        | Like/comment/delete/report UX.                                                               |
| Stories                  | Yellow         | Public read and owner write rule shape.                                                      | Expiry, media policy and moderation tests.                                                 | Story upload/view/expired states.                                                            |
| Chat                     | Yellow/Red     | Rules include counterpart/self checks.                                                       | Full chat thread/message privacy and abuse tests.                                          | Thread creation, message delivery, denied foreign thread.                                    |
| Notifications            | Yellow         | Own notification read/update/delete and server-created notification pattern.                 | Server writer matrix and push delivery tests.                                              | Web push opt-in, waiter notification, owner notification.                                    |
| Map/discovery            | Yellow         | Restaurants/public data loaded by discovery runtime.                                         | Public/private field allowlist and geolocation query tests.                                | Map pins, filters, missing address, mobile behavior.                                         |
| Hotel/travel offers      | Yellow         | Focus/offers fields exist and public offer loader exists.                                    | Hotel/travel-specific rules and UI tests.                                                  | Hotel offer cards, distances, price unit, booking/contact CTA.                               |
| Cross-selling            | Yellow         | Menu/product/focus shared state supports related surfaces.                                   | Cross-sell analytics and visibility tests.                                                 | Restaurant-to-offer/product link behavior.                                                   |
| Bundle/architecture      | Yellow/Red     | `arch:check`, reports and no-cycle scan exist.                                               | Budget enforcement and per-route bundle thresholds.                                        | Public first-load performance on mobile/3G.                                                  |
| Browser visual stability | Yellow         | Prepared/skipped Playwright scaffolds and recent public menu/focus docs.                     | Active visual regression coverage.                                                         | No overlap, no stale bundle, responsive direct refresh.                                      |

## Prepared Or Skipped Browser Coverage

Existing E2E scaffolding includes public profile, public menu, owner tool and
Heart specs that are skipped/prepared. QR menu and waiter specs exist, but the
repo instruction says not to run Playwright/smoke checks unless explicitly
asked. Therefore browser coverage remains a manual launch gate for this task.

## Minimum Additional Tests Before Paid Launch

1. Matrix-driven Firestore rules tests for every role in
   `MNYRA_FULL_ROLE_PERMISSION_MATRIX.md`.
2. Callable Function tests for invalid menus, disabled items, table QR context,
   guest lookup token shape and order retention.
3. Owner UI unit/integration tests for menu, products, focus/offers, table QR,
   ads and order management.
4. Heart mutation tests for lead save/convert/delete, customer edits, staff
   admin lifecycle and ad approval/rejection.
5. Analytics rules and aggregation tests before any owner analytics product is
   sold.
6. Public profile/menu/QR Playwright launch matrix on desktop and mobile.
7. Bundle budget checks for public profile, public menu and QR entrypoints.
