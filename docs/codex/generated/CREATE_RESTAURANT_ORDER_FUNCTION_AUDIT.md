# Create Restaurant Order Function Audit

Generated: 2026-07-01

Status: CURRENT

## Decision

The repository now versions the generic Production-compatible
`createRestaurantOrder` callable and its client contract. Direct browser order
creates stay denied.

## Source

- Export: `functions/index.js`
- Validation/canonicalization: `functions/order-security.js`
- Type: Firebase Functions v1 HTTPS callable
- Region: `us-central1`
- Write path: `restaurants/{restaurantId}/orders/{generatedOrderId}`
- Trusted price path:
  `restaurants/{restaurantId}/menuItems/{itemId}`
- Browser client:
  `apps/menyra-social/core/orders/create-restaurant-order-client.js`
- Feature flag: `USE_CREATE_RESTAURANT_ORDER_FUNCTION=true`

## Trust Boundary

The browser sends order intent only. It cannot select final price, total, item
count, status, buyer authority or staff/admin fields. The Function ignores any
such extra values, reads the trusted menu records and computes the canonical
order.

Trusted menu prices may temporarily be numbers or decimal strings. Both dot and
comma decimals are parsed into integer cents. Stored order prices and totals
are numbers; integer `priceCents` and `totalCents` are retained for exact
calculation.

## Historical Comparison

Commit `5ecebe12` proved the callable architecture and request shape but is not
in the ancestry of `mnyrasocial`. The restored implementation keeps its
generic contract and retry behavior while making two scoped corrections:

- callable wiring lives in a dedicated lazy client service, so no
  `social-app.js` refactor is needed;
- order item `price` is always numeric instead of preserving a legacy string
  menu price.

## Verification

- Functions emulator: numeric and string prices accepted; manipulated client
  financial/status/buyer fields ignored; missing restaurant/item rejected.
- Firestore Rules emulator: all direct guest and signed-in order creates denied.
- Browser: QR checkout creates a server order; waiter sees it and changes only
  status; items and total remain unchanged on desktop and mobile.

## Deployment Status

No Production deploy was run. Source and tracked browser bundle are prepared,
but release must deploy and verify the Function before the web bundle. No
Production test restaurant or order was created.

The existing mirror/notification `serverTimestamp` worker error is separate
and remains reproducible. It does not block canonical order creation, but it
must be fixed before mirror/notification reliability is considered complete.
