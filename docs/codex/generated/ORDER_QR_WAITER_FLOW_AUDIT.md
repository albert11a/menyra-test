# Order QR Waiter Flow Audit

Generated: 2026-07-01

Scope: QR menu, cart checkout, restaurant order creation, order reads, waiter
order updates, owner/CEO order access, Functions mirror/notification triggers
and local emulator seed coverage. No UI, route, DOM id, collection rename,
`social-app.js` source refactor or Functions source change was made. The only
product-runtime change is numeric normalization of the existing order item
price before the direct Firestore write. The generated social bundle was
rebuilt so the validated browser path contains that fix and the local emulator
configuration.

## Audited files

- `apps/menyra-social/core/orders/orders-runtime-controller.js`
- `apps/menyra-social/core/shop/shop-view-cart-orchestration-controller.js`
- `apps/menyra-social/core/menu/table-qr-utils.js`
- `apps/menyra-social/core/menu/table-qr-runtime-controller.js`
- `apps/menyra-social/core/router/startup-route-runtime-context.js`
- `apps/menyra-social/core/router/public-business-route-utils.js`
- `apps/waiter/waiter-app.js`
- `shared/firebase-config.js`
- `functions/index.js`
- `firestore.rules`
- `tests/rules/firestore-security-flows.test.mjs`
- `tests/functions/functions-emulator.test.mjs`
- `tests/e2e/firebase-emulator-admin.ts`
- `tests/e2e/firebase-emulator-fixture.ts`
- `tests/e2e/qr-menu.spec.ts`
- `tests/e2e/waiter.spec.ts`
- `seed/data/mnyra-local-seed.json`

## Current order write path

The active checkout still writes directly from the browser to Firestore:

- Path: `restaurants/{restaurantId}/orders/{orderId}`
- Caller: `submitShopCheckout()` in
  `apps/menyra-social/core/orders/orders-runtime-controller.js`
- API: client `writeBatch().set(orderRef, payload, { merge: true })`
- Payload source: normalized cart state, profile state, local guest session and
  client-side cart totals.

The client currently sends:

- restaurant identity: `restaurantId`, business name/avatar
- buyer identity: `buyerUid`, buyer name/handle/avatar or guest fields
- table/contact: `contact`, `tableNumber`, `tableLabel`
- order lines: `items[]` with `itemId`, `name`, `price`, `quantity`, image and
  variant/comment metadata
- totals/status: `itemCount`, `total`, `status`
- guest recovery: `guestScopeUid`, `guestSessionId`, `guestLookupToken`,
  `orderLookupToken`
- timestamps: server timestamp sentinels plus client ISO strings

The real browser flow exposed one client/Rules mismatch:

- `normalizeMenuItemDocCore()` keeps menu prices as strings for rendering.
- `submitShopCheckout()` previously copied that value directly into
  `items[].price`.
- The captured Firestore request therefore contained `"price": "6.9"`.
- Rules correctly rejected it because the order contract requires a numeric
  price equal to the trusted `menuItems/{itemId}` price.
- The minimal client fix is
  `price: parsePriceValue(item.price)` in
  `apps/menyra-social/core/orders/orders-runtime-controller.js`.

No Rules relaxation was needed.

Before the preceding Rules hardening pass, Rules only checked `restaurantId`
and `buyerUid`. That meant a guest or signed-in user could provide arbitrary
`total`, item `price` and initial `status`.

## Rules hardening applied

`firestore.rules` now narrows `restaurants/{restaurantId}/orders/{orderId}`:

- Create requires a known order field set.
- Create requires a valid buyer contract:
  - guest may omit `buyerUid` or set it to `""`
  - signed-in user must set `buyerUid == auth.uid`
- Create allows only initial statuses: `Neu`, `new`, `bestellung`.
- Create requires `items` to be a non-empty list with at most 8 entries.
- Each item must use allowed item fields, have `itemId`, `name`, numeric
  `price`, numeric quantity from 1 to 99, and refer to an existing available
  `restaurants/{restaurantId}/menuItems/{itemId}` document.
- Each item price must equal the current menu item price.
- `itemCount` must equal the sum of item quantities.
- `total` must match the sum of item price times quantity with a 0.01 currency
  tolerance.
- Update is restricted to `status`, `updatedAt` and `updatedAtClient`.
- Mutable statuses are restricted to `bestellung`, `angenommen`, `fertig`,
  `archiv`.
- Waiter/owner/CEO reads still follow the existing
  `canAccessRestaurantOrdersDoc(restaurantId)` contract.
- Delete is no longer available to waiter/owner clients; CEO/Heart keeps the
  existing admin path.

This is a Rules hardening layer for the current direct-client write model. It is
not a replacement for a dedicated server-side order creation endpoint.

## Read and role contract

Restaurant order reads:

- Guest cannot read canonical restaurant orders.
- Normal signed-in user cannot read a foreign restaurant order.
- Signed-in buyer can `get` their own canonical restaurant order when
  `buyerUid == auth.uid`, but cannot list the restaurant order collection.
- Waiter can get/list orders for an authorized restaurant.
- Owner can get/list orders for their own restaurant.
- Owner cannot read another restaurant's orders.
- CEO/Heart can get/list/update/delete through the existing CEO actor contract.

Waiter authorization:

- The waiter app resolves access from `users/{uid}` and
  `restaurants/{restaurantId}/staff/{uid}`.
- Rules require an active staff doc or owner access through
  `hasRestaurantWaiterAccess(restaurantId)`.
- `waiterAccess == true` or `permissions.waiterAccess == true` is required for
  non-owner staff.
- Disabled staff docs are rejected by Rules.

Waiter updates:

- The app only calls `updateDoc()` with `status`, `updatedAt` and
  `updatedAtClient`.
- Rules now enforce that same limited update surface.
- Waiter cannot modify `items`, item `price`, `total` or delete orders.

## Functions contract

Existing Functions are downstream triggers only:

- `syncOrderMirrorsOnRestaurantOrderWrite`
  - Trigger: `restaurants/{restaurantId}/orders/{orderId}` onWrite.
  - Mirrors signed-in buyer orders to `users/{buyerUid}/orders/{orderId}`.
  - Mirrors guest lookup orders to
    `restaurants/{restaurantId}/orderLookup/{lookupToken}`.
- `notifyWaiterOnRestaurantOrderCreate`
  - Trigger: `restaurants/{restaurantId}/orders/{orderId}` onCreate.
  - Sends notifications to owner and active waiter staff recipients.

No secure callable or HTTP Function currently creates canonical orders. The
server does not currently calculate the canonical order total before the
canonical restaurant order document is written.

Observed local trigger gap:

- `tests/functions/functions-emulator.test.mjs` now exercises an order write and
  asserts the exact logging-emulator failure for
  `syncOrderMirrorsOnRestaurantOrderWrite`.
- The Functions emulator repeatedly logged
  `Cannot read properties of undefined (reading 'serverTimestamp')` from
  `buildCanonicalOrderProjection()` at `functions/index.js:267`.
- The behavior is worker-dependent in the local emulator: some invocations
  complete, while other workers fail with the same stack and are killed.
- The audit test therefore asserts the exact failure in the current Functions
  emulator session instead of incorrectly requiring every invocation to fail.
- No Functions source was changed. The smallest safe follow-up is to isolate why
  the emulator stub sometimes lacks `admin.firestore.FieldValue`, then apply a
  minimal server timestamp fix with a success-path mirror assertion.

## Server order creation implementation plan

Function name:

- `createRestaurantOrder`

Type:

- Prefer callable Function for authenticated app users and guests with an app
  check/session token strategy.
- HTTP endpoint is acceptable only if it has explicit anti-abuse controls and a
  signed guest session contract.

Allowed client payload:

- `restaurantId`
- `items`: list of `{ itemId, quantity, comment?, selectedSize?, selectedColor? }`
- `serviceMode`: `table` or `delivery`
- `tableNumber` when QR/table flow is active
- guest/customer contact fields needed for non-table delivery flows
- optional client request id for idempotency

Not accepted from client:

- item `price`
- `total`
- final `itemCount`
- canonical `status`
- restaurant/business display metadata
- buyer mirror fields
- notification fields

Server-side price calculation:

- Load `restaurants/{restaurantId}` and each referenced
  `restaurants/{restaurantId}/menuItems/{itemId}`.
- Reject inactive/unavailable menu items.
- Clamp quantity to a documented max.
- Calculate line totals and final `total` in integer cents.
- Derive `itemCount`, display names and image/category metadata from menu docs.
- Add option/variant pricing only after that schema is explicit.

Firestore write contract:

- Write canonical order to `restaurants/{restaurantId}/orders/{orderId}`.
- Server owns `status`, `items`, line prices, `itemCount`, `total`, timestamps
  and lookup tokens.
- Client-owned fields are limited to contact/table/comment data.
- Use idempotency key to avoid duplicate QR submissions.

Waiter notification contract:

- Keep `notifyWaiterOnRestaurantOrderCreate` as the notification mechanism.
- Ensure the canonical order has the fields expected by the notification
  builder: `businessName`, `buyerName/contact.name`, `itemCount`,
  `businessAvatar`.
- Keep waiter link format `/waiter/?restaurant={restaurantId}&order={orderId}`.

Analytics event contract:

- Emit a server-owned event after successful canonical write.
- Minimum payload: `restaurantId`, `orderId`, `source`, `serviceMode`,
  `itemCount`, `totalCents`, `hasBuyerUid`, `createdAt`.
- Do not trust client analytics for revenue totals.

Migration without UI break:

- Keep current direct Firestore write path as fallback while a false flag is in
  place.
- Add the Function and tests first.
- Add client integration behind a false feature flag.
- Run both paths in emulator with seeded QR/table orders before enabling.
- Once the Function path is proven, tighten Rules further so clients cannot
  create canonical orders directly.

Feature flag plan:

- Add a false flag such as `USE_SERVER_ORDER_CREATE`.
- Scope the flag to checkout only, not route/runtime activation.
- Keep `USE_NEW_QR_MENU_RUNTIME` and `USE_NEW_WAITER_RUNTIME` false.
- Document rollback: set `USE_SERVER_ORDER_CREATE = false`.

## Rules tests added

`tests/rules/firestore-security-flows.test.mjs` now covers:

- Guest valid order create.
- Guest manipulated `total` denied.
- Guest manipulated item `price` denied.
- Guest manipulated initial `status` denied.
- Guest forged `buyerUid` denied.
- Guest wrong `restaurantId` denied.
- Signed-in user valid own order create.
- Signed-in user manipulated `total` denied.
- Signed-in user manipulated item `price` denied.
- Signed-in user forged `buyerUid` denied.
- Guest cannot read/list canonical restaurant orders.
- Normal user cannot read/list foreign restaurant orders.
- Buyer can read own canonical order but cannot list restaurant orders.
- Waiter can read/list authorized restaurant orders only.
- Waiter can update status fields only.
- Waiter cannot mutate `total`, `items` or delete orders.
- Owner can read own restaurant orders.
- Owner cannot read foreign restaurant orders.
- CEO/Heart can read/update/delete through the existing admin contract.
- Public menu read remains allowed through existing public surface tests.

Result: `npm run test:rules` is green with 12 passed, 0 failed, 0 skipped.

## Browser E2E validation

Local browser configuration:

- Production Firebase remains the default.
- On `localhost`, `127.0.0.1` or `::1`, the explicit query
  `firebase-emulator=1` selects project `mnyra-local` and connects Firestore on
  port 8080 plus Auth on port 9099.
- The Playwright fixture can set the same explicit configuration through
  `globalThis.__MENYRA_FIREBASE_EMULATORS__`.
- The separately named Waiter Firebase app is connected through the same helper.

QR/Menu/Cart/Order:

- `tests/e2e/qr-menu.spec.ts` opens the seeded QR URL for table 2.
- PIDHImadh and `Local Breakfast Plate` are visible from
  `restaurants/pidhi-madh/public/menu`.
- The product is added to cart and checkout is submitted.
- The new canonical order appears under
  `restaurants/pidhi-madh/orders/{orderId}`.
- The test verifies the allowed top-level/item fields, initial status,
  restaurant id, table number, `itemCount == 1` and `total == 6.9`.
- The public menu seed now contains the same 24 products as the trusted
  `menuItems` price documents; the redundant string-only `categories` field was
  removed because the current coercion code interpreted it as empty products.

Waiter:

- `tests/e2e/waiter.spec.ts` signs in as `waiter.local@example.test`.
- The waiter sees the seeded PIDHImadh order and does not see/read a generated
  `shop-demo` order.
- Direct attempts to mutate `total` or `items` are denied.
- The normal UI status change to `angenommen` succeeds.
- The test confirms the order total and items remain unchanged.

Result:

- Desktop Chromium: QR flow passed; Waiter flow passed.
- Pixel 5/mobile Chromium: QR flow passed; Waiter flow passed.
- Four active tests passed; eight unrelated prepared smoke tests remain skipped.

## Check results

- `npm run test:rules`: 12 passed, 0 failed, 0 skipped.
- `npm run test:functions`: 3 passed, 0 failed.
- `npm run test:unit`: 102 passed, 0 failed.
- `npm run lint`: passed.
- `npm run format:check`: passed.
- `npm run arch:check`: passed, 330 modules and 489 dependencies cruised.
- `npm run test:e2e`: 4 passed, 8 skipped.
- `npm run build:menyra-social:bundle`: passed; generated bundle artifacts were
  updated.
- `npm run build`: passed; Vercel static output was prepared in `dist`.
- `npm run emulators:seed`: seeded 48 Firestore documents and 4 Auth users.

## Post-commit review of d13aa637

- Merge assessment: mergeable; no corrective product change was found.
- Emulator selection is production-safe within this contract: loopback host is
  mandatory, and emulator mode additionally requires `firebase-emulator=1` or
  the explicit test runtime object. A normal request without opt-in keeps the
  production Firebase configuration, while a production hostname cannot enable
  emulator mode through the query parameter.
- In the normal UI flow, `state.menuDetail.item` is the source passed into the
  cart and therefore the source of the price. Cart persistence represents that
  price as a string; checkout now parses it to a Firestore number. This is not a
  security trust boundary: Firestore Rules verify the item and exact numeric
  price against `restaurants/{restaurantId}/menuItems/{itemId}`.
- Checkout computes `itemCount` from normalized quantities and `total` from
  parsed prices times quantities. Rules recompute both and permit only a
  one-cent total tolerance. The browser-created seed order satisfies both.
- The Waiter commit diff contains only emulator wiring. Existing writes remain
  limited to `status`, `updatedAt` and `updatedAtClient`; existing role/access
  resolution was not bypassed or modified. Rules and browser tests deny foreign
  orders plus item/price/total mutation.
- The social bundle is deliberately tracked and is the manifest-backed runtime
  loaded by the social HTML. A clean `npm run build` reproduced the committed
  bundle exactly and left no Git diff. Removing it from this commit would leave
  the tracked browser runtime stale relative to source, so it should stay.
- Fresh review checks passed: Rules 12, Functions 3, Unit 102, E2E 4 with 8
  unrelated prepared tests skipped, plus lint, format, architecture and build.
  The Functions test continues to reproduce the documented worker-dependent
  `serverTimestamp` runtime failure; no Functions source was changed.

Seed verification:

- Restaurant `PIDHImadh`: visible.
- Menu Items: 24.
- Public menu snapshot: 24 items.
- QR/table config: enabled with 12 tables.
- Social Posts: 1 restaurant post plus `socialFeed/post-demo-001`.
- Orders: 1 seeded restaurant order.
- Waiter User: visible.
- Owner User: visible.
- CEO/Heart User: visible.
- Shop: visible.
- Hotel: visible.
- Ads: `leads/ad-demo-001` visible.
- Auth users: 4.

## Remaining risks

- Orders still use a direct browser Firestore create path. Rules now validate
  prices/totals against current menu item docs, but a dedicated server Function
  is still the safer long-term canonical write path.
- The order mirror trigger is now covered by a dedicated failure-reproduction
  test, but the worker-dependent `serverTimestamp` runtime error is not fixed.
- The Functions emulator runs on host Node 24 while the Functions package
  requests Node 20; that mismatch remains a possible contributor and needs
  separate isolation.
- Rules currently cap client-created order items at 8 to stay below Rules read
  limits while validating menu prices. Larger carts need server-side creation.
- Variant/add-on pricing is not modeled as a trusted server contract yet.
- Delivery fees, discounts, taxes and tips are not part of the hardened contract.
- Guest anti-abuse is still limited; a server endpoint should add rate/idempotency
  controls before public scale.
