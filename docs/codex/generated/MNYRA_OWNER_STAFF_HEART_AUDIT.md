# MNYRA Owner, Staff And Heart Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This audit covers business owner tools, staff/waiter roles, restaurant/shop/hotel
admin surfaces, Heart/CRM/admin routes, and the permission boundary between
owner-facing and CEO/Heart-facing operations.

## Current Ownership Model

Owner and business staff access is enforced through Firestore rule helpers such
as `isRestaurantOwner`, `hasRestaurantBusinessAccess`,
`hasRestaurantWaiterAccess`, `canManageRestaurantDoc` and
`canAccessRestaurantOrdersDoc`.

Heart and CEO access is handled through CEO/admin rule helpers, Heart route
resolvers and shared CRM read/write adapters.

## Owner Surface Matrix

| Owner surface                  | Current implementation evidence                                                            | Readiness    | Risk                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------- |
| Business profile editing       | Restaurant docs and public docs writable by owner/business staff/CEO.                      | Yellow       | Broad public restaurant read means private/public fields need stricter projection. |
| Menu editor                    | `menu-save-utils` writes `menuItems` and publishes `public/menu`.                          | Yellow       | Price schema still supports transitional string/numeric input.                     |
| Product editor                 | Same menu item pipeline stores product fields for shop/grocery mode.                       | Yellow       | Stock and product visibility need stronger tests.                                  |
| Focus/offers editor            | `focus-runtime-controller` writes `public/offers` and meta offer flags.                    | Yellow       | Hotel/travel/shop variants need type-specific tests.                               |
| Table QR settings              | `table-qr-runtime-controller` writes table QR flags/count to public meta.                  | Yellow       | Needs QR/table manual matrix and production QR route proof.                        |
| Order dashboard                | Authorized restaurant actors can read/list/update order status.                            | Yellow/Green | UI conflict/archival states need more coverage.                                    |
| Ads owner flow                 | `ads-runtime-controller` lets owner create/edit pending ad items.                          | Red/Yellow   | Ads are mutable array items in public docs.                                        |
| Lead/customer admin from owner | CRM flows are primarily Heart/CEO-scoped; owner-side lead/customer boundaries need review. | Yellow       | Avoid owner access to CEO-scoped lead data unless explicitly designed.             |
| Analytics dashboard            | No stable analytics event/read model found.                                                | Red          | Cannot sell analytics to owners yet.                                               |

## Menu, Product And Price Contract

The owner menu editor is functional for local prep. It writes item docs under
`restaurants/{restaurantId}/menuItems/{itemId}` and publishes public menu state.
The order Function reads trusted menu item prices and writes canonical numeric
totals.

The launch blocker is the source data contract. Owner editing still accepts and
stores transitional string/numeric price values. Enterprise order correctness
should depend on normalized numeric menu item prices with migration and tests.

## Staff And Waiter Surface

| Staff area             | Current state                                                                         | Readiness    |
| ---------------------- | ------------------------------------------------------------------------------------- | ------------ |
| Staff documents        | `restaurants/{id}/staff/{uid}` supports self get and owner/CEO list/write.            | Yellow       |
| Staff index/admin docs | `staffIndex`, `staffAdmins` and `superadmins` are guarded by admin/self rules.        | Yellow       |
| Waiter app             | Separate `apps/waiter` app reads authorized restaurant orders.                        | Green/Yellow |
| Waiter status update   | Waiter updates only status/timestamps; rules tests cover status-only updates.         | Green        |
| Waiter notifications   | Function trigger writes waiter notifications; tests cover historical timestamp issue. | Green/Yellow |
| Device registration    | Waiter device registration writes own user device docs.                               | Yellow       |
| Revocation lifecycle   | Not fully proven by tests.                                                            | Red/Yellow   |

## Heart And CRM Surface

Heart is implemented as a separate app surface with routes for leads, customers,
ads and staff/admin workflows. It uses social CRM read loaders and write
adapters rather than duplicating all domain logic.

Important current files:

- `apps/mnyra-heart/heart-route-view-resolver.js`
- `apps/mnyra-heart/heart-crm-admin-read-loaders.js`
- `apps/mnyra-heart/heart-crm-admin-write-adapter.js`
- `functions/heart/*`
- `apps/menyra-social/core/crm/*`
- `apps/menyra-social/core/leads/lead-save-utils.js`

### Heart Readiness

| Heart surface      | Current state                                                        | Readiness  | Risk                                                     |
| ------------------ | -------------------------------------------------------------------- | ---------- | -------------------------------------------------------- |
| Leads              | CEO-scoped rules and loaders exist.                                  | Yellow     | Conversion/account creation needs stronger audit tests.  |
| Customers          | Loaded from restaurants/leads/customer derivation.                   | Yellow     | Mutations need end-to-end authorization tests.           |
| Ads moderation     | Heart can approve/reject owner ads by mutating public ads doc items. | Red/Yellow | Needs standalone ad audit trail or strict history model. |
| Staff/admin        | Admin routes/collections exist.                                      | Yellow     | Bootstrap, revoke and stale-index behavior need tests.   |
| Server handlers    | Heart onRequest handlers exist in Functions.                         | Yellow     | Need production-like auth/session/error coverage.        |
| Read-only contract | Heart read loaders expose read-only contracts for some surfaces.     | Yellow     | Write adapters still need mutation-by-mutation docs.     |

## Permission Boundary Findings

Good boundaries:

- Owners cannot directly create restaurant orders in Firestore.
- Waiters cannot modify order totals or buyer fields.
- Buyers cannot list restaurant orders.
- Leads are CEO-scoped.
- Public route docs are not browser-writable.
- Protected counters are guarded.

Weak or incomplete boundaries:

- Broad public read of `restaurants` makes owner/public field separation
  fragile.
- Staff revocation and stale staff index cleanup are not fully proven.
- Ads as arrays do not provide per-document review history.
- Heart write adapters are powerful and need full mutation tests.
- Owner analytics has no rules contract yet.

## Required Owner/Staff/Heart Work Before Launch

1. Normalize menu item price data and test Function behavior against the final
   numeric schema.
2. Add owner permission tests for menu, products, focus/offers, QR, orders and
   ads.
3. Add staff lifecycle tests: invite, accept, role change, revoke, stale token,
   stale index and denied restaurant switch.
4. Add Heart mutation tests for leads, customers, staff/admin and ad moderation.
5. Add audit metadata to lead conversion and ad moderation flows.
6. Keep Heart/admin routes behind authenticated admin checks and avoid exposing
   bare `/staff` ambiguity.
7. Add owner analytics only after a stable analytics event/rules contract exists.
