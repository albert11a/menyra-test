# Auth And Role Flow Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This audit maps the P0 login, ownership, staff/waiter and Heart/CEO role flows
needed before the first controlled restaurant launch. It is a contract and test
audit only. It does not change production accounts, production data, routes,
Firestore collection names or live role assignments.

## Local Test Actors

| Actor             | UID                | Email                            | Role intent                    |
| ----------------- | ------------------ | -------------------------------- | ------------------------------ |
| Shopper           | `shopper-demo`     | `shopper.local@example.test`     | Normal signed-in user.         |
| Restaurant owner  | `owner-demo`       | `owner.local@example.test`       | Owns `pidhi-madh`.             |
| Shop owner        | `shop-owner-demo`  | `shop-owner.local@example.test`  | Owns `shop-demo`.              |
| Hotel owner       | `hotel-owner-demo` | `hotel-owner.local@example.test` | Owns `hotel-demo`.             |
| Waiter            | `waiter-demo`      | `waiter.local@example.test`      | Staff/waiter for `pidhi-madh`. |
| Heart CEO/admin   | `heart-demo`       | `heart.local@example.test`       | CEO/Heart scoped admin actor.  |
| Outside test user | `outside-demo`     | Local test only                  | Negative rules test actor.     |

All seed actors are synthetic local emulator identities.

## Role Sources

| Role or access path    | Current data source                                                                | Notes                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Normal user            | `users/{uid}.role` and `users/{uid}.roles`.                                        | Self-readable and self-owned user data remains protected from guests.               |
| Business owner         | `restaurants/{id}.ownerUid`, owner email aliases and `users/{uid}.restaurantId`.   | P0 tests assert owners cannot manage another business.                              |
| Shop owner             | Same owner mapping, with `restaurantId: shop-demo` and shop business metadata.     | Uses current restaurant collection until a later approved data model change.        |
| Hotel owner            | Same owner mapping, with `restaurantId: hotel-demo` and hotel business metadata.   | Uses current restaurant collection until a later approved data model change.        |
| Waiter/staff           | `restaurants/{id}/staff/{uid}` plus active/status/access fields.                   | This is the authorization source for restaurant order access.                       |
| Staff directory hint   | `staffIndex/{uid}` and user staff hints.                                           | Directory/hint only; must not grant order access without the restaurant staff doc.  |
| Heart/CEO              | `users/{uid}.role`, `users/{uid}.roles`, `superadmins/{uid}`, `staffAdmins/{uid}`. | Also aligned with the shared CEO helper for known CEO identities.                   |
| Leads and CRM mutation | CEO scoped `leads/*` and Heart adapters.                                           | Non-CEO owners and users must be denied direct lead mutation.                       |
| Restaurant orders      | `restaurants/{id}/orders/*`.                                                       | Browser create is denied; waiter/owner/CEO status updates are narrowly constrained. |

## Login And App Entry Points

| Surface         | Current entry or context                                | P0 requirement                                                      |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| Public guest    | `/:slug`, `/:slug/menu`, QR query context.              | No auth required for public projection reads.                       |
| Shopper         | Main social login/register surfaces.                    | User data remains self-scoped; no business/admin rights by default. |
| Owner           | Business/owner menu, product, QR, order and profile UI. | Owner can manage owned business only.                               |
| Waiter          | `apps/waiter` and waiter-facing order board.            | Waiter order access depends on active restaurant staff doc.         |
| Heart/CRM/Admin | `apps/mnyra-heart` and Heart server handlers.           | CEO/Heart mutations stay CEO scoped and auditable.                  |

No route changes are part of this audit.

## Permission Findings

- Guest public reads are available for public routes, public restaurant docs,
  public menu/offers/ads projections, business posts and feed documents.
- Guest direct order creation remains denied in Firestore.
- Owner access is based on owned restaurant/business mapping and should not rely
  on a public route slug alone.
- Waiter access is correctly intended to use
  `restaurants/{restaurantId}/staff/{uid}`. Stale `users/{uid}` staff hints or
  `staffIndex/{uid}` must not grant access by themselves.
- Heart/CEO actors have broad admin powers needed for onboarding and CRM, but
  every write path needs mutation-level tests and audit metadata before launch.
- Ads approval currently mutates arrays under public docs. This is not strong
  enough for paid ad auditability because owner and Heart writes share the same
  document boundary.

## Automated Coverage Added Or Expected In P0

| Flow                                    | Current P0 coverage intent                                        |
| --------------------------------------- | ----------------------------------------------------------------- |
| Owner manages own menu                  | Rules tests cover owned menu item and public menu writes.         |
| Owner denied cross-business menu writes | Rules tests cover denial on another restaurant.                   |
| Waiter active staff order access        | Existing rules coverage protects status-only updates.             |
| Waiter revocation                       | Rules tests cover inactive/revoked staff losing order access.     |
| Stale staff hints                       | Rules tests cover `users`/`staffIndex` hints without staff doc.   |
| Heart lead mutation                     | Rules tests cover CEO create/update/delete and non-CEO denial.    |
| Public/private profile boundary         | Rules tests cover guest public reads and private/internal denial. |
| Menu price contract                     | Unit tests cover string editor input saved as numeric price.      |

## Manual Launch Checks Still Required

These remain manual because browser smoke/Playwright runs were not requested for
this task:

- Owner login and restaurant dashboard load.
- Owner menu create/edit/delete and public menu refresh on mobile and desktop.
- QR menu open with `src=qr` and table parameter preserved.
- Guest order flow from QR menu into callable Function.
- Waiter login, order list, status update and revoke/re-login denial.
- Heart login, lead create/update/delete, customer conversion and ad approval.
- Shop owner profile/product tool smoke test.
- Hotel owner profile/offer tool smoke test.
