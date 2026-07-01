# MNYRA Profile And Business Profile Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This audit covers personal profiles, restaurant/cafe/bar profiles, shop/grocery
profiles, hotel/travel/local business profiles, public menu/profile surfaces,
feed/social content, maps/discovery and profile-related rules.

## Current Model

Mnyra currently has two different profile models:

- Personal user data under `users/{uid}` with signed-in/self/admin access.
- Business profile data under `restaurants/{restaurantId}` plus public
  projection docs, public route docs, menu items, business posts and feed docs.

The product direction is website-first, but visible routes and UI are not to be
changed during prep work. Current public business routes are `/:slug`,
`/:slug/menu` and compatibility alias `/:slug/posts`.

## Personal User Profiles

| Capability                    | Current state                                                                   | Readiness  |
| ----------------------------- | ------------------------------------------------------------------------------- | ---------- |
| Private profile document      | `users/{uid}` is protected from guest reads and mostly self/admin scoped.       | Green      |
| User posts                    | `users/{uid}/posts` are signed-in readable, self/CEO writable.                  | Yellow     |
| Devices                       | `users/{uid}/devices` are self only.                                            | Green      |
| Notifications                 | Own notifications are self read/update/delete; browser creates are false.       | Green      |
| Favorites                     | `menuFavorites` are self scoped.                                                | Green      |
| Public personal profile route | No finished explicit public projection/visibility contract found.               | Red/Yellow |
| Social privacy                | Follow, following, chat and user post rules exist but need abuse/privacy tests. | Yellow     |

### Personal Profile Risks

- Do not expose personal user profile pages publicly until public fields,
  private fields, route names and visibility states are explicit.
- Signed-in readable user posts are not the same as public creator profiles.
- Chat/follow/social surfaces need moderation, reporting, blocking and retention
  policy before scale.

## Business Profile Model

| Surface                | Current state                                                                                 | Readiness    |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| Route lookup           | `publicRoutes/{slug}` is public read and browser write false.                                 | Green/Yellow |
| Core business document | `restaurants/{id}` is public read and owner/business staff/CEO writable.                      | Yellow/Red   |
| Public profile docs    | `restaurants/{id}/public/*` are public read and owner/business staff/CEO writable.            | Yellow       |
| Public menu            | Published under `restaurants/{id}/public/menu` from menu editor state.                        | Yellow       |
| Menu/product items     | `restaurants/{id}/menuItems/*` are public read and owner/business staff/CEO writable.         | Yellow       |
| Business posts         | Restaurant social/menu posts and global `socialFeed` posts are public readable.               | Yellow       |
| Focus/offers           | `public/offers` and `public/meta` support focus and travel offer presentation.                | Yellow       |
| Ads                    | `public/ads` stores owner ad items and Heart moderation state.                                | Red          |
| Map/discovery          | App shell loads restaurants and enriches public data for discovery/map/travel/shopping views. | Yellow       |

### Business Profile Risk

The main enterprise issue is that `restaurants/{id}` is still broadly readable.
For launch, public business profile rendering should depend on explicit public
projection documents or field allowlists, not on broad access to mixed business
state.

## Restaurant, Cafe And Bar Profiles

Restaurant-like businesses have the most complete current path:

- Public profile and menu routes.
- Menu items and public menu publishing.
- QR table configuration through public meta.
- Callable order creation.
- Restaurant order documents and lookup mirrors.
- Waiter app for order status.
- Business posts, menu social, stories and feed integration.

Readiness is Yellow moving toward Green for the restaurant QR/menu/order/waiter
slice. Remaining blockers are manual browser checks, price schema cleanup,
production release rehearsal and profile visibility hardening.

## Shop And Grocery Profiles

Shop/grocery behavior is implemented through the same restaurant/menu item
system with product-specific fields and categories. The menu save utilities can
store product attributes such as brand, SKU, stock, sizes and colors.

Current risks:

- Product stock and visibility rules are not yet a separate enterprise contract.
- Product detail and cart/order eligibility need tests by product state.
- Product analytics are missing.
- Shop public profiles still inherit the broad `restaurants` read risk.

## Hotel, Travel And Local Business Profiles

Hotel/travel/local business offers use focus/offers data with fields such as
travel offer labels, distance values, hotel starting price, price unit and
feature lists.

Current risks:

- Hotel/travel offers are not yet separated into their own public contract.
- Booking/contact semantics are not hardened.
- Travel-specific analytics are missing.
- Public route and profile tests must prove that restaurant/shop/hotel variants
  do not leak unrelated controls or fields.

## Social Profile Content

| Content type          | Current state                                                   | Risk                                    |
| --------------------- | --------------------------------------------------------------- | --------------------------------------- |
| Global feed           | `socialFeed` is public readable; business owners/CEO can write. | Needs moderation/reporting.             |
| Business social posts | Public read under restaurant subcollections.                    | Needs hidden/deleted state tests.       |
| User posts            | Signed-in read, self/CEO write.                                 | Needs public visibility contract.       |
| Likes/comments        | Signed-in writes and protected counters.                        | Needs abuse/rate/report policy.         |
| Stories               | Public read and owner/CEO write.                                | Needs expiry/media moderation contract. |

## Map And Discovery

Discovery currently depends on restaurant/business data loaded by the app shell
and enriched with public meta/menu/profile state. This is functional but not yet
enterprise-clean because discovery should consume a public discovery projection
with only fields intended for guest/public reads.

## Required Profile Work Before Enterprise Launch

1. Define public business profile projection fields per business type.
2. Keep private owner/admin/customer fields out of public route dependencies.
3. Define personal public profile visibility states before enabling public user
   profiles.
4. Add route/browser tests for `/:slug`, `/:slug/menu`, QR context and refresh.
5. Add business type tests for restaurant, shop, hotel/travel and local service
   profiles.
6. Add moderation and visibility tests for posts, comments, stories and ads.
7. Add profile/menu/product/ad analytics events and owner dashboard reads.
