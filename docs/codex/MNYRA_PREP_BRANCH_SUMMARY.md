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
- Generic callable order creation with direct Firestore creates blocked and
  waiter updates restricted to status/timestamp fields.
- Firebase Functions emulator validation and order-trigger failure reproduction
  under `tests/functions`.
- Active seeded QR/Menu/Order and Waiter Playwright coverage under `tests/e2e`.
- False replacement-runtime feature flags plus the active callable-order
  contract flag in `shared/config/feature-flags.js`.
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
- `docs/codex/generated/CREATE_RESTAURANT_ORDER_FUNCTION_AUDIT.md`
- `docs/codex/generated/ORDER_QR_WAITER_FLOW_AUDIT.md`
- `docs/codex/MNYRA_MENU_PRICE_CONTRACT.md`
- `docs/codex/generated/dependency-cruiser-check.txt`
- `docs/codex/generated/madge-social-app-graph.json`
- `docs/codex/generated/madge-cycles.txt`

## Check Results

Green:

- `npm run test:unit`: 103 passed.
- `npm run test:rules`: 12 passed, 0 failed, 0 skipped.
- `npm run test:functions`: 4 passed.
- `npm run test:e2e`: 4 passed, 8 unrelated prepared tests skipped.
- `npm run arch:report`: report generated.
- `npm run arch:check`: passed, 333 modules and 493 dependencies cruised.
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

## Review Of Commit d13aa637

Review result: mergeable as an emulator-backed preparation change. The later
real-data LAN validation found that this is not yet a production-ready order
flow; no product correction was made during the review itself.

- Local Firebase emulator mode requires both a loopback hostname
  (`localhost`, `127.0.0.1` or `::1`) and an explicit opt-in through
  `firebase-emulator=1` or the test runtime object with `enabled: true`.
  Without that opt-in, the existing production project configuration and
  normal Firebase initialization remain active. No production-host path can
  enable the emulator through the query parameter.
- The checkout price fix changes only `items[].price` from the cart's stored
  string representation to the existing numeric parser result before write.
  The normal UI puts the loaded menu-detail item price into the cart; there is
  no free-form price input. Browser/cart state is still untrusted, so Firestore
  Rules remain authoritative by requiring the submitted `itemId` to exist in
  `restaurants/{restaurantId}/menuItems` and its numeric price to match.
- `itemCount` is calculated from the normalized numeric quantities and `total`
  from numeric price times quantity. Firestore Rules independently recompute
  both values, with a one-cent tolerance for the total. The seeded QR order
  passed this contract on desktop and mobile.
- The Waiter source change only connects its existing named Firebase app to
  local emulators. Its existing order write still changes only `status`,
  `updatedAt` and `updatedAtClient`; role/access resolution and UI actions were
  not changed. Rules deny foreign restaurant reads and changes to items,
  prices or totals.
- `apps/menyra-social/bundled` is an intentional tracked runtime output: the
  social HTML loads its manifest and generated entries, and repository history
  regularly commits those files. Keeping the rebuilt output ensures the real
  browser entry contains the source changes. A fresh `npm run build` reproduced
  the committed hashes and bytes with no Git diff, so the bundle should remain
  in `d13aa637`.
- Review rerun: Rules 12 passed, Functions 3 passed, Unit 102 passed, E2E 4
  passed with 8 unrelated prepared tests skipped; lint, format, architecture
  and build passed. The Functions suite still reproduces the intentionally
  unresolved worker-dependent `serverTimestamp` failure.

## Pre-Fix Production Order Compatibility Blocker

This records the diagnosis at `c8989e42` before the callable restoration
documented below. Statements about the then-current direct client are
historical, not the current branch contract.

Real-data LAN validation was performed on
`http://192.168.1.168:5173` without `firebase-emulator=1`.

> Production Rules blockieren direkte Client-Order-Creates. Der aktuelle Client nutzt noch direkten Firestore-Write. Deshalb scheitert jeder Production-Order-Submit, unabhängig von Restaurant, Auth oder QR-Kontext.

Verified generically:

- The server served the tracked bundle produced by `d13aa637`; its manifest
  SHA-256 matched the workspace file exactly. Firebase project
  `menyra-c0e68` was active and emulator mode was `false`.
- At diagnosis time the checkout controller wrote directly to
  `restaurants/{restaurantId}/orders/{orderId}`.
- The active Production Firestore ruleset was updated on
  `2026-06-29T12:29:57Z` and has `allow create: if false` for restaurant
  orders. It explicitly expects order creation through the
  `createRestaurantOrder` Cloud Function.
- At diagnosis time local Rules allowed validated direct creates and therefore
  differed from Production. The current branch now restores `allow create: if
false`; no Rules were deployed.
- The deployed generic `createRestaurantOrder` callable exists and is active
  in `us-central1`. A write-free invalid-input probe reached it and returned
  `functions/invalid-argument: restaurantId is required`.
- The branch at `c8989e42` did not call that Function and did not contain its
  source or `functions/order-security.js`. Historical commit `5ecebe12`
  contains the server-controlled implementation and client intent contract.
- The historical server contract accepts string or numeric menu prices,
  computes cents, totals, buyer identity and initial status on the server, and
  ignores client price, total, status and buyer fields.
- Waiter reads and updates the same canonical restaurant order path. Its UI
  changes only status/timestamps, but deployed Production Rules still allow a
  broader authorized waiter update than the tightened local Rules. Production
  Rules therefore also need a reviewed status-only update alignment.

Casarita was used only as a real-data reproduction example. It proved that a
QR/table cart reaches submit with matching restaurant/item IDs, numeric price,
`itemCount` and total before Production Rules reject the direct create. No
Casarita-specific fix or route handling is planned.

No usable Production test restaurant currently exists. The only test-named
restaurant found is deleted and has no owner, menu or orderable items; the
emulator-only `pidhi-madh` restaurant does not exist in Production. No actual
Production order was created.

Required gate identified by that diagnosis:

1. Restore one generic client order service that calls the existing
   `createRestaurantOrder` callable for every internal restaurant, cafe/bar,
   QR-table and future shop order.
2. Restore the matching Function source and server order-security module into
   this branch so deployed and repository contracts are versioned together.
3. Keep direct restaurant order creates denied in Production Rules and retain
   status/timestamp-only waiter updates.
4. Route local emulator E2E through the same Function after the known local
   `serverTimestamp` runtime issue is isolated.
5. Provision a clearly marked `mnyra-test-restaurant`, menu, QR table, owner
   and waiter only after explicit Production-data approval, then validate the
   full LAN browser-to-waiter flow there.

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
  Node 20. Function definitions loaded in that preceding pass. No Functions
  source was changed during the diagnosis.
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
- No unrelated Functions product logic change; only the generic callable export
  and its order-security module were restored.
- No QR/menu/cart/order UI or route behavior; checkout now submits order intent
  to the callable instead of creating the Firestore document directly.
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

## Callable Order Restoration

Audits:

- `docs/codex/generated/CREATE_RESTAURANT_ORDER_FUNCTION_AUDIT.md`
- `docs/codex/generated/ORDER_QR_WAITER_FLOW_AUDIT.md`
- `docs/codex/MNYRA_MENU_PRICE_CONTRACT.md`

The generic Production-compatible order contract is restored:

- Checkout uses the dedicated lazy `createRestaurantOrder` client service.
- The browser sends restaurant/table/contact plus item IDs, quantities and
  optional variant/note metadata only.
- Client price, total, item count, status, buyer, owner, waiter and admin values
  are not sent as trusted order fields.
- The callable reads trusted
  `restaurants/{restaurantId}/menuItems/{itemId}` documents.
- Numeric prices and transitional strings such as `"4.00"` and `"3,40"` are
  converted to cents; order item prices and totals are stored as numbers.
- Initial status and timestamps are server-controlled.
- Direct guest and signed-in Firestore order creates are blocked.
- Waiter updates remain restricted to status/timestamp fields.

Commit `5ecebe12` was used as the proven historical reference. It was never an
ancestor of `mnyrasocial`, so this was branch divergence rather than a later
revert. The restored implementation does not modify `social-app.js`; it adds a
dedicated client service and fixes the historical raw-string order price.

`USE_CREATE_RESTAURANT_ORDER_FUNCTION=true` activates the required write
contract. The prepared replacement runtime flags remain false. There is no
direct Firestore fallback.

## Browser Validation

The seeded desktop and mobile QR flow now:

1. opens `PIDHImadh` from the table-2 QR context;
2. loads the known `Local Breakfast Plate` menu item;
3. adds it to cart and submits through the Functions emulator;
4. creates a server order with numeric `price: 6.9`, `itemCount: 1`,
   `total: 6.9`, `totalCents: 690` and `status: "Neu"`;
5. signs in as the seeded waiter and displays that exact Function-created
   order;
6. changes status to `angenommen` while items and total remain unchanged.

The independent waiter test still denies foreign restaurant reads and direct
item/total writes. Both tests pass on desktop Chromium and Pixel 5.

## Production Boundary

No Production deploy, Production test restaurant or customer order was
created. Normal/LAN requests continue to use the Production Firebase app and
callable. Functions emulator connection requires the existing explicit
loopback-only opt-in.

Before a web release, deploy and verify the versioned Function first so the
numeric order-price correction is active, then deploy the web bundle. A real
write test requires explicit approval and a dedicated
`mnyra-test-restaurant` with test owner, waiter, QR table, numeric menu prices
and cleanup policy.

## Remaining Risks

- The existing mirror and waiter-notification workers still reproduce the local
  `admin.firestore.FieldValue.serverTimestamp()` error. Canonical order create
  and Waiter collection visibility are green, but mirrors/notifications are not
  yet reliable locally.
- The emulator host runs Node 24 while the Functions package requests Node 20.
- Variant/add-on pricing, fees, discounts, taxes and tips do not yet have a
  trusted server pricing model.
- Guest rate limiting and idempotency remain future server hardening work.
- Production `menuItems.price` still needs an approved migration to numbers;
  string parsing is transitional protection only.
- Existing bundle size remains outside this scoped fix.

## Next Safe Steps

1. Replace the failing legacy `admin.firestore.FieldValue` access with the
   explicit Admin Firestore import in a dedicated Functions fix and convert the
   reproduction into mirror/notification success assertions.
2. Deploy and verify `createRestaurantOrder` before releasing the matching web
   bundle.
3. After explicit approval, provision `mnyra-test-restaurant` and validate the
   LAN browser-to-waiter flow without touching customer restaurants.
4. Plan and dry-run the numeric `menuItems.price` migration.
5. Add rate/idempotency and variant-price contracts before wider public scale.

## Clear Warning

No replacement runtime, UI, route, DOM ID or collection change was activated.
No Production deployment or Production data write was performed.
