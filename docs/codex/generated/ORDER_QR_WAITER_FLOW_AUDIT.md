# Order QR Waiter Flow Audit

Generated: 2026-07-01

Scope: QR menu, cart checkout, restaurant order creation, order reads, waiter
order updates, owner/CEO order access, Functions mirror/notification triggers
and local emulator seed coverage. No UI, route, DOM id, collection rename,
`social-app.js` refactor or Functions source change was made.

## Audited files

- `apps/menyra-social/core/orders/orders-runtime-controller.js`
- `apps/menyra-social/core/shop/shop-view-cart-orchestration-controller.js`
- `apps/menyra-social/core/menu/table-qr-utils.js`
- `apps/menyra-social/core/menu/table-qr-runtime-controller.js`
- `apps/menyra-social/core/router/startup-route-runtime-context.js`
- `apps/menyra-social/core/router/public-business-route-utils.js`
- `apps/waiter/waiter-app.js`
- `functions/index.js`
- `firestore.rules`
- `tests/rules/firestore-security-flows.test.mjs`
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

Before this pass, Rules only checked `restaurantId` and `buyerUid`. That meant a
guest or signed-in user could provide arbitrary `total`, item `price` and
initial `status`.

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

- During local emulator shutdown after seed/rules validation,
  `syncOrderMirrorsOnRestaurantOrderWrite` logged
  `Cannot read properties of undefined (reading 'serverTimestamp')` from
  `functions/index.js`.
- `npm run test:functions` is still green because the current Functions test only
  validates emulator hub/package safety, not trigger behavior.
- No Functions source was changed in this pass. The smallest safe follow-up is a
  dedicated Functions trigger test and then a minimal server timestamp fix in
  `buildCanonicalOrderProjection`.

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

## E2E scaffold

The skipped Playwright smoke tests were made more directly activatable:

- `tests/e2e/qr-menu.spec.ts` now targets
  `/pidhimadh/menu?src=qr&table=2` and checks for seeded menu/cart affordances.
- `tests/e2e/waiter.spec.ts` now targets
  `/waiter/?restaurant=pidhi-madh&order=order-demo-001` and checks for waiter
  shell/order controls.

They remain skipped because emulator auth and a local browser flow are not fully
wired in this prep step, and repo guardrails avoid Playwright runs unless
explicitly requested.

## Check results

- `npm run test:rules`: 12 passed, 0 failed, 0 skipped.
- `npm run test:functions`: 2 passed, 0 failed.
- `npm run test:unit`: 102 passed, 0 failed.
- `npm run lint`: passed.
- `npm run format:check`: passed.
- `npm run arch:check`: passed, 330 modules and 489 dependencies cruised.
- `npm run emulators:seed`: seeded 48 Firestore documents and 4 Auth users.

Seed verification:

- Restaurant `PIDHImadh`: visible.
- Menu Items: 24.
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
- Existing order mirror trigger behavior is not yet covered by Functions tests
  and showed a local `serverTimestamp` runtime error in the emulator.
- Rules currently cap client-created order items at 8 to stay below Rules read
  limits while validating menu prices. Larger carts need server-side creation.
- Variant/add-on pricing is not modeled as a trusted server contract yet.
- Delivery fees, discounts, taxes and tips are not part of the hardened contract.
- Guest anti-abuse is still limited; a server endpoint should add rate/idempotency
  controls before public scale.
