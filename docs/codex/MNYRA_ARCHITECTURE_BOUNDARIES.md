# Mnyra Architecture Boundaries

Status: CURRENT
Last updated: 2026-07-01

## Public Profile Runtime

Allowed:

- Public route resolution.
- Public business profile identity.
- Public posts and public menu metadata needed for profile display.
- Read-only public Firestore reads.

Forbidden:

- Owner/editor writes.
- Heart/CRM imports.
- Waiter imports.
- Push/chat/upload/order mutation unless explicitly entered by user flow.

## Public Menu / QR Runtime

Allowed:

- `/:slug/menu` and QR menu route context.
- Public menu items.
- Public focus/offers.
- QR table context.
- Cart/order entry through documented order contract.

Forbidden:

- Owner menu editor.
- CRM/Heart.
- Feed/travel/shopping route ownership.
- Hidden writes on public GET.

## Social Feed Runtime

Allowed:

- Feed post reads.
- Story and engagement display.
- Authenticated engagement writes through controlled helpers.

Forbidden:

- Public route truth ownership.
- Owner menu editor writes.
- Heart/CRM writes.

## Business Owner Runtime

Allowed:

- Owned business profile edits.
- Menu/product/focus/ads authoring.
- Business account management.

Forbidden:

- Public guest route ownership.
- Waiter order visibility beyond authorized restaurant context.
- Heart-only approvals unless mediated by Heart contract.

## Waiter Runtime

Allowed:

- Staff auth context.
- Authorized restaurant orders.
- Order status actions allowed by rules.

Forbidden:

- Public guest profile/menu state ownership.
- Owner CRM/admin writes.
- Other restaurant orders.

## Heart / CRM Runtime

Allowed:

- CRM leads/customers/staff/admin views.
- Ads approval.
- Heart runner and incident/report flows.
- Server-backed admin operations.

Forbidden:

- Browser social app internals as direct dependencies.
- Public route rendering ownership.

## Travel Runtime

Allowed:

- Travel search, hotel/motel cards and travel offers.
- Public business identity needed for travel display.

Forbidden:

- Menu/QR/cart ownership.
- Heart/CRM writes.

## Shopping Runtime

Allowed:

- Shopping cards, product display and product modal.
- Cart entry through documented cart/order contract.

Forbidden:

- Restaurant menu editor concepts unless explicitly business-owner scoped.
- Public route truth ownership.

## Analytics Runtime

Allowed:

- Non-blocking diagnostics.
- Explicitly documented event emission.

Forbidden:

- Blocking public first render.
- Production-only side effects in local tests.
