# Mnyra Production Order Release Plan

Status: CURRENT
Last updated: 2026-07-01

## Scope

This plan prepares the Production release of the restored callable order flow on
branch `mnyrasocial`. It is a release plan only.

No Firebase deploy, Rules deploy, Functions deploy, web deploy, Production order
write or customer-restaurant test was performed while creating this plan.

## Relevant Delta Since Main

Comparison base: `main...HEAD` from merge base `5172c750`.

- `functions/index.js`
  - Adds the `createRestaurantOrder` callable in `us-central1`.
  - Uses `functions/order-security.js` to validate order intent and construct
    the server-controlled order payload.
  - Uses Admin Firestore `FieldValue.serverTimestamp()` for callable order
    timestamps, order mirror `mirroredAt` and waiter/owner notification
    timestamps.
  - Keeps mirror and waiter notification triggers on the canonical restaurant
    order path.
- `functions/order-security.js`
  - New server-side contract for restaurant order input normalization, trusted
    menu item reads, cents/total calculation, buyer identity, guest lookup token
    and canonical write payload.
- `firestore.rules`
  - Restores `allow create: if false` for
    `restaurants/{restaurantId}/orders/{orderId}`.
  - Restricts waiter/owner order updates to `status`, `updatedAt` and
    `updatedAtClient`.
  - Keeps order reads on the canonical restaurant order collection.
  - Includes adjacent social counter and private user read hardening from this
    prep branch.
- `apps/menyra-social/core/orders/create-restaurant-order-client.js`
  - New lazy browser boundary for the callable.
  - Sends order intent only: restaurant/table/contact context, item IDs,
    quantities and display metadata.
  - Strips trusted fields such as price, total, item count, status, buyer,
    owner, waiter and admin values.
  - Connects to the Functions emulator only through the existing loopback-only
    opt-in.
- `apps/menyra-social/core/orders/orders-runtime-controller.js`
  - Checkout now calls the callable through the dedicated client service.
  - The previous direct Firestore order create path is no longer the submit
    path.
  - Returned callable order data is normalized back into the existing cart/order
    UI state.
- `shared/firebase-config.js`
  - Adds explicit local emulator settings guarded by loopback hostnames and
    opt-in.
  - LAN/Production hosts cannot enable emulator mode by query parameter.
- `shared/config/feature-flags.js`
  - Adds false replacement-runtime flags.
  - Sets `USE_CREATE_RESTAURANT_ORDER_FUNCTION` to `true` because the callable
    order flow is the required write contract, not a replacement runtime.
- `apps/menyra-social/bundled/**`
  - Tracked bundle output was rebuilt for the browser runtime.
  - The manifest points the order runtime to
    `chunks/orders-runtime-controller-CR-4dN6P.js`.
  - `entry/social-app.js`, `entry/social-public-entry.js`, the manifest and
    hashed shared chunks changed because the browser loads tracked bundle files.

## Release Order

1. Functions first.
   Deploy the versioned Functions source containing `createRestaurantOrder`,
   `functions/order-security.js`, `syncOrderMirrorsOnRestaurantOrderWrite` and
   `notifyWaiterOnRestaurantOrderCreate`.

2. Rules second, if the live ruleset is not already aligned.
   Production already blocks direct order creates, but the reviewed release
   should verify whether the live waiter update rule is still broader than the
   branch. If it is broader, deploy the status/timestamp-only order update rule
   after Functions are live.

3. Web and tracked bundles third.
   Release the web bundle only after the callable and trigger source are live
   and verified. The bundled browser runtime immediately calls the callable and
   has no direct Firestore fallback.

4. Dedicated Production test restaurant last.
   Provision and use only `mnyra-test-restaurant` after explicit Production-data
   approval. Do not test against customer restaurants.

## Why Web Must Not Deploy First

The browser bundle on this branch calls `createRestaurantOrder` for checkout and
does not fall back to direct Firestore order creation. Production Rules block
direct client creates by design.

If web ships before the matching Functions source:

- checkout users can hit a missing or older callable contract;
- legacy string menu prices may not be normalized to numeric order prices;
- mirror and waiter/owner notification triggers may still use the older
  `admin.firestore.FieldValue.serverTimestamp()` path;
- order lookup and notification documents can be missing even when the canonical
  order exists;
- the browser cannot repair this safely because trusted price, total, status
  and buyer fields belong on the server.

Therefore Functions must be deployed and verified before the web bundle is
released.

## Functions Gate

Before any web release, an operator should verify the deployed callable without
creating a real order:

- call `createRestaurantOrder` with missing `restaurantId`;
- expect a callable validation error such as `invalid-argument`;
- confirm the deployed source version includes `functions/order-security.js`;
- inspect Functions logs for load errors after deploy;
- confirm the mirror and waiter notification triggers are deployed from the
  same source tree.

No customer order should be created at this gate.

## Rules Gate

Before or during the Rules release window, compare the live ruleset against this
branch:

- direct creates to `restaurants/{restaurantId}/orders/{orderId}` must be
  denied for guest and signed-in browser principals;
- authorized waiter/owner updates must be limited to `status`, `updatedAt` and
  `updatedAtClient`;
- waiter/owner updates must not mutate `items`, `itemCount`, `total`,
  `totalCents`, buyer fields or lookup tokens;
- owner/waiter/CEO reads of authorized restaurant orders must remain intact.

If the live ruleset already satisfies those points, Rules deployment can be
skipped for the order release. If not, deploy Rules after Functions and before
the web bundle.

## Web Gate

Before web release:

- run `npm run build` from the exact release commit;
- confirm tracked bundle files match the release artifact;
- confirm `apps/menyra-social/bundled/manifest.json` references the current
  order runtime chunk;
- confirm the bundle contains the callable path and no direct checkout order
  create fallback;
- confirm emulator mode is still loopback-only and cannot be enabled from LAN
  or Production hostnames.

## Dedicated Test Restaurant Plan

Create Production test data only after explicit approval.

- Restaurant ID: `mnyra-test-restaurant`.
- Slug: `mnyra-test-restaurant`.
- Markers:
  - `isTest: true`
  - `testData: true`
  - `releaseTest: "callable-order-flow"`
  - `environment: "production-test"`
  - clear owner-facing name such as `Mnyra Test Restaurant`.
- Visibility:
  - keep out of normal discovery if the current data model supports that
    without breaking QR access;
  - use a direct QR/menu URL for the live validation;
  - do not reuse, clone or modify customer restaurants.
- Test owner:
  - dedicated test owner UID/account only for this restaurant;
  - owns `mnyra-test-restaurant`;
  - receives owner order notifications.
- Test waiter:
  - dedicated test waiter UID/account only for this restaurant;
  - active staff document under
    `restaurants/mnyra-test-restaurant/staff/{waiterUid}`;
  - `waiterAccess: true` or equivalent permissions field used by the app.
- QR table:
  - at least one enabled table, for example table 1;
  - QR URL points only to `mnyra-test-restaurant` with that table context.
- Menu:
  - minimal `menuItems` set with numeric `price` values, for example `4.5` and
    `6.9`;
  - available/orderable flags set for the tested item;
  - matching public menu data if required by the current public menu surface.
- Cleanup:
  - record every test order ID and guest lookup token;
  - remove test orders, lookup documents and notifications after validation;
  - keep the test restaurant disabled or hidden when not actively testing.

## Manual Live Test

Use only `mnyra-test-restaurant`.

1. Open the QR URL for the test table.
2. Confirm the public menu opens the test restaurant and shows the numeric-price
   test product.
3. Add one product to the cart.
4. Submit the order.
5. Record the returned/visible order ID and guest lookup token if available.
6. Verify Firestore:
   - `restaurants/mnyra-test-restaurant/orders/{orderId}` exists;
   - `items[].price` is a number;
   - `items[].priceCents`, `itemCount`, `totalCents` and `total` match the
     trusted menu item and quantity;
   - `status` is `Neu` and `statusKey` is `bestellung`;
   - `createdAt` and `updatedAt` are server timestamps.
7. Verify mirror:
   - `restaurants/mnyra-test-restaurant/orderLookup/{guestLookupToken}` exists;
   - `mirrorType` is `guest_order_lookup`;
   - `canonicalPath` points to the canonical restaurant order;
   - `mirroredAt` is present.
8. Verify notifications:
   - `users/{ownerUid}/notifications/restaurant_order_{orderId}` exists;
   - `users/{waiterUid}/notifications/restaurant_order_{orderId}` exists when
     waiter access is configured;
   - both notification docs contain `type: "restaurant_order"`,
     `serverAuth: true`, `restaurantId`, `orderId`, `createdAt` and
     `updatedAt`.
9. Sign in to the Waiter app as the test waiter.
10. Confirm the waiter sees the order.
11. Change status to `angenommen`.
12. Re-read the canonical order and confirm only allowed status/timestamp fields
    changed; `items`, prices, `itemCount`, `total` and `totalCents` remain
    unchanged.
13. Check Functions logs for the absence of the previous
    `Cannot read properties of undefined (reading 'serverTimestamp')` trigger
    error.
14. Clean up the test order, lookup document and notifications according to the
    approved retention policy.

## Rollback

If checkout fails after web release:

1. stop the web rollout or restore the previous web bundle;
2. keep direct client order creates blocked;
3. inspect `createRestaurantOrder` callable logs before changing Rules;
4. do not loosen Firestore Rules to allow direct browser order creates;
5. do not use customer restaurants for emergency test orders.

If Functions fail before web release, do not release the web bundle.

## Current Local Verification

The local emulator-backed branch state is green:

- `npm run test:functions`
- `npm run test:rules`
- `npm run test:unit`
- `npm run lint`
- `npm run format:check`
- `npm run arch:check`
- `npm run build`

These checks do not deploy and do not write Production data.
