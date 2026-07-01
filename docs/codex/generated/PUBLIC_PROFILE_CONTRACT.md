# Public Profile Contract

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This contract defines the P0 public business/profile surface for local
implementation work. It does not approve route changes, Firestore collection
renames, production deploys, production data access, UI redesigns or runtime
extraction.

The contract covers restaurant/cafe/bar, shop/grocery/product and hotel/travel
business profiles because they share the current public profile/menu route
machinery.

## Source Of Truth Reviewed

- `AGENTS.md`
- `docs/mnyra-current-phase.md`
- `docs/codex/MNYRA_REFACTOR_MASTER_PLAN.md`
- `docs/codex/generated/MNYRA_ENTERPRISE_READINESS_AUDIT.md`
- `firestore.rules`
- `apps/menyra-social/core/public-profile/*`
- `apps/menyra-social/core/routing/*`
- `apps/menyra-social/core/menu/*`
- `seed/data/mnyra-local-seed.json`

## Current Public Routes

| Route or context               | Current meaning                                                     | P0 contract                                                           |
| ------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `/:slug`                       | Canonical public business profile.                                  | Must remain stable and resolve through `publicRoutes/{slug}`.         |
| `/:slug/menu`                  | Public menu/product/offers surface for the business.                | Must remain stable for restaurants and shop/product style businesses. |
| `/:slug/posts`                 | Public profile posts alias.                                         | Alias only; no new route behavior in this phase.                      |
| `/:slug/menu?src=qr&table=...` | Table QR menu/order context.                                        | Must preserve `src=qr` and `table` query values for QR/order handoff. |
| Reserved app routes            | Login, owner, waiter, Heart/admin, travel, shopping and app routes. | Must continue to win over public slug matching.                       |

No new public routes are introduced by this P0 block.

## Allowed Public Projection Fields

Public rendering may use these fields once they are present in projection docs:

| Surface                                  | Allowed fields                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `publicRoutes/{slug}`                    | `slug`, `restaurantId`, `type`, `surface`, `public`, `canonicalPath`, `menuPath`.                           |
| `restaurants/{id}/public/profile`        | Public name, slug, public bio/about, city, country, public address, public phone, social links, logo/cover. |
| `restaurants/{id}/public/meta`           | Public business type, category, visibility flags, public QR table metadata and non-sensitive display state. |
| `restaurants/{id}/public/menu`           | Published item id, name, description, category, numeric price, currency, image URL, availability, ordering. |
| `restaurants/{id}/public/offers`         | Public offer id, title, public description, city, price and public image/reference fields.                  |
| `restaurants/{id}/public/ads`            | Approved public ad items only, with public title/media/copy/status/display fields and no moderation ids.    |
| `restaurants/{id}/socialPosts/{postId}`  | Public post text/media/counts that are intended for the business profile.                                   |
| `restaurants/{id}/orderLookup/{tableId}` | Minimal active QR/table lookup state only.                                                                  |

Menu/product prices are numeric in the P0 contract. Browser/editor input may be
string based, but the saved menu item and public menu projection must store a
number or `null`.

## Prohibited Public Fields

These fields must not be required by public rendering and must not be copied
into public projection docs:

| Category             | Prohibited examples                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Ownership            | `ownerUid`, owner email aliases, login email, account email, contact email used for admin access.                        |
| Billing and payments | Billing notes, payment ids, payout state, invoices, card/customer identifiers, plan metadata.                            |
| Staff and roles      | Staff UIDs, staff invites, `role`, `roles`, `ceoPath`, waiter/business access flags, admin notes.                        |
| Orders               | Buyer UID, buyer contact data, order private notes, raw device/session data, untrusted totals.                           |
| CRM and leads        | Lead source internals, sales notes, customer status history, Heart-only audit metadata.                                  |
| Analytics            | Raw event payloads, IP/device/user agent data, raw counters that can be spoofed by clients.                              |
| Ads                  | Draft ads, pending ads, rejected ads, moderator UIDs, creator UIDs, internal comments, pricing/budget/private targeting. |
| Private documents    | Any document under private/internal collections or non-public operational subcollections.                                |

## Current Transitional Dependencies

The current app is functional but not yet enterprise-clean:

- `restaurants/{id}` is still broadly public-readable in rules.
- Public profile normalization still accepts mixed fields from the restaurant
  root document and public projection documents.
- `restaurants/{id}/menuItems/*` remains public-readable for the current menu
  runtime.
- Owner and CEO actors can write `restaurants/{id}/public/*`, including the ads
  array doc, which is too coarse for paid ads moderation.

These dependencies are allowed only as transitional implementation state on
`mnyrasocial`. They are not the target public profile contract.

## Required P0 Test Coverage

Automated coverage must keep expanding around these cases before launch:

- Guests can read public routes and public projection docs.
- Guests cannot read private/internal docs.
- Owners can write their own menu items and public menu projection.
- Owners cannot write another business menu or public projection.
- Menu prices saved from editor strings become numeric stored prices.
- Published public menu items contain numeric prices.
- Waiter access depends on the restaurant staff document, not stale user hints
  or `staffIndex` alone.
- CEO/Heart lead mutations remain CEO scoped.
- Public ads are documented as approved-only for display; the current array
  storage remains a security/audit risk until a safer ad model exists.

## Next Code Steps

1. Keep current routes stable.
2. Add projection builders/tests that copy only allowed public fields.
3. Move public rendering reads away from mixed `restaurants/{id}` data.
4. Tighten Firestore public reads only after the runtime no longer depends on
   broad restaurant root reads.
5. Replace public ads arrays with auditable per-ad records before selling ads.
