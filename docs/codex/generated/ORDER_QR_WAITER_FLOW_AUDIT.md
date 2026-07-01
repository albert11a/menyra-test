# Order QR Waiter Flow Audit

Generated: 2026-07-01

Status: CURRENT

## Result

The local QR/Menu/Cart/Order/Waiter browser flow is green against the Firebase
emulators and seeded `PIDHImadh` data.

- Checkout calls the generic `createRestaurantOrder` callable.
- The browser no longer creates `restaurants/{restaurantId}/orders/{orderId}`
  documents directly.
- Firestore Rules keep direct guest and signed-in creates blocked.
- The Function reads trusted `menuItems`, calculates item prices, `itemCount`
  and `total`, sets the initial status and writes the restaurant order.
- The background order mirror and waiter/owner notification triggers now use
  the Admin Firestore `FieldValue.serverTimestamp()` import and write their
  timestamp fields locally without reproducing the previous runtime error.
- The Function accepts numeric and transitional string menu prices such as
  `"4.00"` and `"3,40"`, but stored order item prices are always numbers.
- The seeded waiter sees the Function-created order, can change its status and
  cannot change its items, prices or total.

No UI, route, DOM ID, collection name or `social-app.js` source change was
made. No Production deploy, Production test restaurant or customer order was
created.

## Root Cause And Contract

> Production Rules blockieren direkte Client-Order-Creates. Der aktuelle Client
> nutzte noch direkten Firestore-Write. Deshalb scheiterte jeder
> Production-Order-Submit, unabhaengig von Restaurant, Auth oder QR-Kontext.

The active Production Rules correctly use `allow create: if false` for
restaurant orders. The browser had diverged from that contract and used a
Firestore `writeBatch().set()` containing client prices, total, item count,
status and buyer fields.

The fix is generic for every internal ordering surface. It contains no
restaurant ID, Casarita ID, route or QR-table hardcode.

## Historical Commit 5ecebe12

Commit `5ecebe12` introduced the intended secure order path on other branches:

- `apps/menyra-social/social-app.js` created an `httpsCallable` client in
  `us-central1` and injected it through the public-route runtime cluster.
- `apps/menyra-social/core/app-shell/public-route-runtime-cluster.js` forwarded
  `createOrderFn`.
- `apps/menyra-social/core/orders/orders-runtime-controller.js` sent order
  intent instead of a canonical order document.
- `functions/index.js` exported `createRestaurantOrder`.
- `functions/order-security.js` normalized the request and built the server
  payload.
- `tests/orders-secure-checkout.test.mjs` covered the controller contract.

The historical client payload contained:

- `restaurantId`, `serviceMode`, contact and table context;
- item ID, quantity, comment, cart key, selected size/color and crop metadata;
- guest scope and session IDs.

It did not contain final prices, total, item count, status or buyer/admin
authority. Transient callable errors were retried up to three times with
backoff; validation and permission errors failed immediately. No feature flag
was present in that commit.

`5ecebe12` was not reverted on `mnyrasocial`: it is not an ancestor of this
branch. The branches diverged before that commit, and later preparation work on
`mnyrasocial` hardened the existing direct-write path independently.

The current restoration keeps the proven request/error model but avoids the
historical `social-app.js` wiring. A dedicated lazy client service is used
instead.

## Current Client Contract

`apps/menyra-social/core/orders/create-restaurant-order-client.js` is the only
checkout boundary for the callable. It sends only:

- `restaurantId`;
- `serviceMode` and source context;
- optional `tableId`, `tableNumber` and `tableLabel`;
- sanitized contact fields;
- item `itemId`, `quantity`, comment and variant/display metadata;
- guest scope/session IDs.

It strips client `price`, `total`, `itemCount`, `status`, `buyerUid`, owner,
waiter and admin fields. `tests/create-restaurant-order-client.test.mjs`
asserts this exact allowlist.

`USE_CREATE_RESTAURANT_ORDER_FUNCTION` is `true`. This is the restored order
write contract, not activation of one of the prepared replacement runtimes.
There is no direct Firestore fallback.

The service loads the Firebase Functions browser SDK only when checkout is
submitted. Normal and LAN requests use the Production app and callable.
Functions emulator connection occurs only when the existing loopback-only
emulator opt-in is active through `firebase-emulator=1` or the explicit test
runtime object. A query parameter on a Production or LAN hostname cannot enable
emulator mode.

## Current Function Contract

`functions/index.js` exports a v1 callable named `createRestaurantOrder` in
`us-central1`. `functions/order-security.js` owns validation and canonical
payload construction.

The Function:

1. validates restaurant ID and order intent;
2. reads `restaurants/{restaurantId}`;
3. reads each requested
   `restaurants/{restaurantId}/menuItems/{itemId}` document;
4. rejects missing, unavailable, out-of-stock or invalid-price items;
5. parses trusted numeric or string prices into integer cents;
6. writes numeric `items[].price` plus `items[].priceCents`;
7. calculates `itemCount`, `totalCents` and numeric `total`;
8. derives buyer identity from callable auth or guest context;
9. sets `status: "Neu"`, `statusKey: "bestellung"`, server timestamps and
   server pricing/source markers;
10. writes `restaurants/{restaurantId}/orders/{generatedOrderId}` through the
    Admin SDK.

Client-supplied price, total, item count, status and buyer fields are ignored.

Errors use callable codes:

- `invalid-argument` for malformed restaurant/item/quantity input;
- `failed-precondition` for missing restaurant, missing item, unavailable item
  or invalid trusted menu price;
- `internal` for unexpected write/runtime failures.

The reconstructed source intentionally corrects one historical defect:
`5ecebe12` preserved the raw trusted menu price in `items[].price`, so a string
menu price remained a string in the order. The current source always stores a
numeric amount while retaining integer cents.

## Firestore Rules And Waiter

`restaurants/{restaurantId}/orders/{orderId}` now has:

- authorized owner/waiter/CEO reads as before;
- `allow create: if false` for every browser principal;
- update restricted to `status`, `updatedAt` and `updatedAtClient` for an
  authorized restaurant actor;
- no waiter item, price or total mutation;
- no waiter delete.

The Waiter app still reads and updates the same canonical restaurant order
path. No role bypass or alternate collection was added.

## Emulator And Browser Evidence

The emulator seed contains:

- restaurant `PIDHImadh`;
- 24 trusted `menuItems` and a matching 24-item public menu;
- QR/table configuration for 12 tables;
- seeded owner and waiter users;
- one seeded example order;
- four Auth emulator users.

Function coverage verifies:

- numeric trusted menu price;
- comma-decimal string trusted menu price;
- ignored client price, total, item count, status and buyer values;
- numeric stored order prices and total;
- server initial status and timestamps;
- callable-created guest `orderLookup` mirror and owner waiter notification;
- direct order-trigger guest mirror plus owner and waiter notification
  documents;
- absence of the previous trigger `serverTimestamp` runtime error;
- rejection of missing item and restaurant IDs.

Rules coverage verifies direct creates remain blocked for guest and signed-in
users, while owner/waiter/CEO read/update contracts remain green.

Playwright verifies on desktop Chromium and Pixel 5:

- seeded QR URL resolves `PIDHImadh` and its known product;
- product is added to the cart and checkout calls the local Function;
- the server-created order contains numeric price `6.9`, `itemCount: 1`,
  `total: 6.9`, `totalCents: 690` and initial status `Neu`;
- the seeded waiter signs in and sees that exact Function-created order;
- waiter status changes to `angenommen`;
- items and total are byte-for-byte unchanged after the status update;
- foreign restaurant reads and direct item/total changes remain denied.

## Resolved Mirror And Notification Trigger Failure

The callable itself was already green. The separate background order mirror and
waiter notification workers previously reproduced the local runtime error:

`Cannot read properties of undefined (reading 'serverTimestamp')`

The isolated fix replaces the legacy
`admin.firestore.FieldValue.serverTimestamp()` access in the order-trigger
helpers with the explicit Admin Firestore `FieldValue.serverTimestamp()` import
already used by `createRestaurantOrder`.

Verified locally:

- `createRestaurantOrder` writes the canonical restaurant order.
- The mirror trigger writes the guest `restaurants/{restaurantId}/orderLookup`
  document for the callable-created order.
- The waiter notification trigger writes the owner notification for the
  callable-created order.
- A direct trigger regression writes the guest mirror plus owner and waiter
  notification documents.
- The previous `serverTimestamp` runtime error is not reproduced.

No UI, route, `social-app.js`, Firestore Rules or production data change was
included.

## Production Test Restaurant Plan

No Production data was created. Before a real write test, provision
`mnyra-test-restaurant` only after explicit approval with:

- a clear `isTest`/non-customer lifecycle marker and no unintended discovery;
- a dedicated test owner and waiter account;
- one test QR table;
- a small `menuItems` set using numeric prices;
- matching public menu data;
- a retention and cleanup policy for test orders and notifications.

A Production validation must use only that target. Customer restaurants must
not receive durable test orders.

## Release Gates

No deployment occurred in this task. Before releasing the web bundle:

1. review and deploy the versioned Function source first, because the
   reconstructed source guarantees numeric order prices for legacy string menu
   prices;
2. keep direct Production order creates blocked;
3. deploy the web bundle only after the callable version is confirmed;
4. provision the approved test restaurant;
5. validate LAN browser checkout, canonical order, waiter visibility/status and
   immutable financial fields;
6. migrate Production `menuItems.price` to numbers and retain string parsing
   only as transitional protection.

The remaining security work is rate limiting/idempotency and a trusted model
for variant/add-on prices, fees, discounts, taxes and tips.
