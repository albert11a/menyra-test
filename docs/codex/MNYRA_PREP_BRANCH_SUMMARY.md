# Mnyra Prep Branch Summary

Status: CURRENT
Last updated: 2026-07-01

## Branch

- Branch: `mnyrasocial`
- Base: current `main` after `git fetch --prune`
- `main` and `origin/main` were even before branching.
- No merge into `main` was performed.

## What Was Set Up

- Practical Codex rules in `AGENTS.md`.
- Refactor planning docs under `docs/codex/`.
- Dependency analysis with Dependency-Cruiser and Madge.
- Bundle analysis report generation and optional Rollup visualizer hook.
- ESLint and Prettier baseline checks.
- Local Firebase Emulator config in `firebase.json`.
- Local synthetic seed data and seed script under `seed/`.
- Firestore Rules tests and auth fixtures under `tests/rules`.
- Minimal Firestore Rules hardening for protected social/follower counters and
  private root user reads.
- Minimal Firestore Rules hardening for QR/menu order creates and waiter order
  status updates.
- Firebase Functions emulator validation and order-trigger failure reproduction
  under `tests/functions`.
- Active seeded QR/Menu/Order and Waiter Playwright coverage under `tests/e2e`.
- False runtime feature flags in `shared/config/feature-flags.js`.
- CI preparation workflow in `.github/workflows/ci.yml`.

## Scripts Added

- `npm test`
- `npm run test:unit`
- `npm run test:rules`
- `npm run test:functions`
- `npm run test:e2e`
- `npm run test:all`
- `npm run lint`
- `npm run format:check`
- `npm run arch:report`
- `npm run arch:check`
- `npm run arch:graph`
- `npm run arch:cycles`
- `npm run build:analyze`
- `npm run bundle:report`
- `npm run emulators:start`
- `npm run emulators:seed`
- `npm run emulators:export`

Existing `npm run build` remains the normal Vite/Vercel static build.

## Generated Reports

- `docs/codex/generated/ARCHITECTURE_DEPENDENCY_REPORT.md`
- `docs/codex/generated/BUNDLE_ANALYSIS_REPORT.md`
- `docs/codex/generated/FIRESTORE_RULES_SECURITY_GAP_REPORT.md`
- `docs/codex/generated/ORDER_QR_WAITER_FLOW_AUDIT.md`
- `docs/codex/generated/dependency-cruiser-check.txt`
- `docs/codex/generated/madge-social-app-graph.json`
- `docs/codex/generated/madge-cycles.txt`

## Check Results

Green:

- `npm run test:unit`: 102 passed.
- `npm run test:rules`: 12 passed, 0 failed, 0 skipped.
- `npm run test:functions`: 3 passed.
- `npm run test:e2e`: 4 passed, 8 unrelated prepared tests skipped.
- `npm run arch:report`: report generated.
- `npm run arch:check`: passed, 330 modules and 489 dependencies cruised.
- `npm run arch:graph`: graph JSON generated.
- `npm run arch:cycles`: passed, no circular dependency found by Madge baseline.
- `npm run lint`: passed after vendor files were excluded and lint was scoped to errors.
- `npm run format:check`: passed.
- `npm run bundle:report`: report generated.
- `npm run build`: passed with the final browser-validation sources and prepared
  the Vercel static output in `dist`.
- `npm run build:menyra-social:bundle`: passed in the browser validation pass;
  generated social bundle files were intentionally updated.
- `npm run emulators:seed`: seeded 48 Firestore documents and 4 Auth users.

Observed:

- `npm install` completed with npm audit summary: 16 vulnerabilities
  (1 low, 14 moderate, 1 high). No `npm audit fix` was run because that would
  broaden dependency changes.
- `npm install --save-dev firebase-admin@13.10.0` changed the audit summary to
  15 vulnerabilities (1 low, 13 moderate, 1 high). No `npm audit fix` was run.
- The browser validation pass rebuilt the tracked social bundle so the explicit
  local emulator configuration and numeric order price payload are present in
  the real browser entry.
- `social-app.js` remains the largest bundle at about 299 kB gzip in the
  current tracked bundle output.
- `npm run emulators:start` started Auth, Firestore, Functions and UI locally.
  Firebase CLI emitted online project lookup warnings for `mnyra-local` and the
  Functions emulator warned that the host uses Node 24 while `functions` request
  Node 20. Function definitions loaded in this pass. No Functions source was
  changed.
- Seed visibility was verified in the emulator: PIDHImadh, 24 Menu Items, Posts,
  Orders, Waiter User, Owner User, CEO/Heart User, Shop, Hotel and pending Ads.
- Latest seed verification after the QR/Menu/Order/Waiter pass confirmed
  PIDHImadh, 24 trusted Menu Items, a matching 24-item public menu snapshot,
  QR/table config enabled for 12 tables, 1 restaurant Social Post,
  `socialFeed/post-demo-001`, 1 restaurant Order, Waiter User, Owner User,
  CEO/Heart User, Shop, Hotel, pending Ad and 4 Auth users.

Red:

- None in this hardening pass.

Not run:

- `npm run build:analyze`: configured but not run because bundle-size analysis
  is outside this validation scope.

## What Was Not Changed

- No product UI.
- No route behavior.
- No broad Firestore Rules restructure.
- No Firestore collection names.
- No `social-app.js` runtime extraction.
- No `apps/menyra-social/social-app.js` source refactor. Its generated bundled
  entry changed through the normal Vite build.
- No `functions/index.js` change.
- No QR/menu/cart/order UI or route behavior; the existing order payload now
  normalizes item price to a number before the Rules-validated write.
- No QR/menu/waiter runtime refactor.
- No production Firebase configuration or deploy flow.
- No real customer data.

## Firestore Rules Hardening

Closed:

- Normal signed-in users can no longer directly set or change social/follower
  counters: `likesCount`, `commentsCount`, `followersCount` and
  `followingCount`.
- Normal signed-in users can no longer read foreign root `users/{uid}`
  documents.

Rules changed:

- Added zero-on-create and unchanged-on-update guards for protected counter
  fields.
- Disabled direct counter-only client write helper paths.
- Narrowed root `users/{uid}` reads to self, CEO/Heart, or targeted
  owner-managed staff reads.
- Kept existing real like/comment document contracts and owner/CEO flows covered
  by the tests.

Previously red tests now green:

- `user cannot directly manipulate likes/comments/follower counters`
- `private user data remains protected`

Potential app-flow impact:

- Any normal user flow that reads arbitrary foreign root `users/{uid}` documents
  must use public profile surfaces or a narrower explicit contract.
- Any client flow that directly mutates social/follower counters must use real
  engagement documents or server-side/admin writes.

New confirmed security gaps:

- None found in this pass.

## QR/Menu/Order/Waiter Hardening

Audit report:

- `docs/codex/generated/ORDER_QR_WAITER_FLOW_AUDIT.md`

Closed or hardened:

- Guest and signed-in order creates now reject arbitrary item `price`, `total`
  and non-initial `status`.
- Order create now validates menu item ids against
  `restaurants/{restaurantId}/menuItems/{itemId}` and requires the submitted
  price to match the menu item price.
- Order create now requires `itemCount` and `total` to match submitted line
  items.
- Waiter order updates are restricted to `status`, `updatedAt` and
  `updatedAtClient`.
- Waiter cannot mutate order `items`, item prices or `total`.
- Waiter cannot delete orders.
- Guest and normal users cannot read/list foreign restaurant orders.
- Owner can read own restaurant orders and cannot read foreign restaurant
  orders.
- CEO/Heart keeps the existing admin order access contract.

Documented remaining risk:

- The active checkout still creates canonical orders directly from the browser.
  Rules now validate the payload, but there is no secure callable/HTTP server
  Function that creates canonical orders and computes prices before write.
- A concrete `createRestaurantOrder` implementation plan is documented before
  any UI/runtime migration.
- Client-created orders are capped at 8 items in Rules to stay within menu item
  validation limits; larger carts should move to server-side order creation.

E2E browser validation:

- `tests/e2e/qr-menu.spec.ts` opens the seeded table-2 QR menu, verifies
  PIDHImadh and `Local Breakfast Plate`, adds it to cart, submits checkout and
  validates the resulting canonical order fields, status, `itemCount` and
  total.
- The browser request initially sent `items[].price` as string `"6.9"`. Rules
  correctly denied it; the client now uses the existing numeric price parser.
- `tests/e2e/waiter.spec.ts` signs in with the seed waiter, verifies authorized
  PIDHImadh orders, denies foreign restaurant reads and item/price/total writes,
  and permits only the normal status update.
- Both flows pass on desktop Chromium and the Pixel 5/mobile profile.
- Local emulator mode is explicit and localhost-only through
  `firebase-emulator=1` or the Playwright runtime fixture; production remains
  the default.

## Risks Found

- Existing app bundle remains too large for a true lightweight public entry.
- QR/Menu/Cart/Order and Waiter now have real emulator-backed browser coverage.
- Rules auth fixtures are now wired for Guest, normal User, Restaurant Owner,
  Waiter and CEO/Heart.
- Security-sensitive order/staff/owner/Heart/public-read flows now have green
  allow/deny coverage.
- Previously confirmed Rules gaps for direct counter manipulation and foreign
  root user reads are now closed by emulator-tested rules.
- QR/Menu/Order/Waiter security now has explicit allow/deny Rules coverage.
- No server-side canonical order creation Function exists yet; this is the next
  security step before any order runtime split.
- Functions emulator hub is reachable; local startup still reports the host
  Node 24 vs requested Node 20 mismatch.
- Existing `syncOrderMirrorsOnRestaurantOrderWrite` trigger showed a local
  emulator runtime error on `serverTimestamp`; the dedicated Functions test now
  reproduces the exact session log and stack. The failure is worker-dependent,
  and Functions source remains unchanged.
- CI workflow is prepared but not yet proven in GitHub Actions.
- npm audit reports transitive vulnerabilities that need separate dependency
  review.

## Next Safe Refactor Order

1. Isolate the worker-dependent `admin.firestore.FieldValue` failure in
   `syncOrderMirrorsOnRestaurantOrderWrite`, including the local Node 20/Node 24
   mismatch, then apply the smallest safe timestamp fix.
2. Add a success-path mirror assertion after that Functions fix.
3. Implement `createRestaurantOrder` behind a false flag and migrate checkout
   from direct client Firestore create to server-side canonical order creation.
4. Convert remaining public profile/menu Playwright TODOs into seeded local
   smoke tests.
5. Re-run architecture and bundle reports from a clean build.
6. Start first real runtime split behind false flags only after security tests
   are green.

## First Recommended Real Refactor

Start with Public Profile if the team wants the lowest write-risk surface. Start
with QR/Menu only after the server-side `createRestaurantOrder` path is added
behind a false flag or explicitly accepted as a later separate security step.

## Clear Warning

No new runtime has been activated. All new runtime flags remain `false`.
