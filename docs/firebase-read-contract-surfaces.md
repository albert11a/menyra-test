Status: CURRENT
Last updated: 2026-04-30

# Firebase Read Contract Surfaces

This document records the current Firebase read truth for Mnyra surfaces. It is a runtime contract document, not a UI/design plan.

## Canonical Business Profile Contract

Every business profile entry must resolve one canonical `restaurantId` before final reads.

- Business identity: `restaurants/{restaurantId}`
- Public route: `publicRoutes/{slug}` -> `restaurantId`
- Business posts: `restaurants/{restaurantId}/socialPosts`
- Public/profile/QR menu: `restaurants/{restaurantId}/public/menu`
- Public focus/highlights: `restaurants/{restaurantId}/public/offers`
- Menu Editor authoring: `restaurants/{restaurantId}/menuItems`
- Orders: `restaurants/{restaurantId}/orders`

Partial map/feed/bootstrap objects may seed a quick shell only. They are not final truth and must not overwrite canonical menu/posts/focus once loaded.

## Surface Matrix

| Surface | Entry point | Canonical id resolver | Firebase reads | Cache key | Loading state | Empty/failure state | Known risks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login/auth bootstrap | auth/session bootstrap controllers | `users/{uid}` plus stored/current `restaurantId` | `users/{uid}`, owned/staff `restaurants/{restaurantId}` | user scoped auth/session cache | auth/profile loading | login/profile error or default user shell | `/login -> /feed` remains current behavior until product decision changes |
| Feed profile open | `[data-profile-business]` in feed | feed `restaurantId` -> canonical profile open flow | `restaurants/{restaurantId}`, `socialPosts`, `public/menu`, `public/offers` when public profile surface hydrates | restaurantId keyed posts/menu/focus caches | shell from feed row, canonical hydration after open | stable empty posts/menu states | feed rows are partial and must not be final truth |
| Map profile open | map sheet profile buttons | marker `canonicalRestaurantId`/document id, else slug via `publicRoutes/{slug}` | `restaurants/{restaurantId}`, `socialPosts`, `public/menu`, `public/offers` | canonical restaurantId | shell from marker snapshot, canonical bundle hydrates | stable empty posts/menu/focus | map marker objects are partial display objects |
| Search profile open | `[data-search-business]` | result id -> canonical profile open flow | `restaurants/{restaurantId}`, `socialPosts`, `public/menu`, `public/offers` | restaurantId keyed | shell from result, canonical hydration | stable empty posts/menu | local search can start from partial cached restaurants |
| Direct slug profile | `/:slug` | `publicRoutes/{slug}` via public route cache/resolver | route seed plus `restaurants/{restaurantId}`, `socialPosts`, `public/menu`, `public/offers` | route slug and canonical restaurantId | route-first shell, canonical id handoff | stable route-pending then empty/error | stale route bootstrap must not override canonical loaded state |
| Direct slug menu | `/:slug/menu` | `publicRoutes/{slug}` via public route cache/resolver | `restaurants/{restaurantId}/public/menu`, `public/offers`, identity/posts warmup | canonical restaurantId + `public` source | menu-first loading | `knownEmpty` public menu or error | QR query context must stay separate |
| QR/table menu | `/:slug/menu?src=qr&table=...` or compatible QR URLs | route/publicRoutes -> canonical restaurantId, table context preserved | `public/menu`, `public/offers`, table QR meta/order paths as existing | canonical restaurantId + QR/table context | menu-first, lightweight guest flow | known empty menu, unchanged cart/order states | QR behavior is a hard invariant; do not alter without explicit request |
| Owner-as-viewer | own public profile path/profile menu | own `userProfile.restaurantId` canonicalized through profile open/own menu loaders | public profile reads from `public/menu`, editor reads from `menuItems` | restaurantId + source | own shell plus public menu load when visible | known empty public menu | must not mix old public route ids into own profile |
| Menu Editor | menu admin/editor tab | `state.userProfile.restaurantId` | `restaurants/{restaurantId}/menuItems`; save publishes `public/menu` | restaurantId + `collection` source | collection loading | empty authoring list or save error | public profile must not read `menuItems` |
| Lead/CRM save | lead/customer/CRM save flows | generated or existing `restaurantId` | writes/reads `restaurants/{restaurantId}` and `public/meta` as lead contract requires | lead/customer id and restaurantId | CRM save/loading state | save error | no broad migrations; public read contract starts after restaurant id exists |
| Public route resolution | startup, direct route, slug fallback | `publicRoutes/{slug}` first, launch alias/direct-id fallback | `publicRoutes/{slug}`, then `restaurants/{restaurantId}` | global public route cache keyed by slug | route pending/bootstrap | not-found/inactive route | Firestore route cache freshness determines first render quality |

## Invariants

- Public/profile/QR menu surfaces use `restaurants/{restaurantId}/public/menu`.
- Menu Editor uses `restaurants/{restaurantId}/menuItems` and publishes to `public/menu`.
- Business posts use `restaurants/{restaurantId}/socialPosts`.
- Focus/highlights use `restaurants/{restaurantId}/public/offers`.
- Caches are valid only when keyed by the same canonical `restaurantId` and source.
- Focus must not block menu. Posts must not block menu.
- A public menu with zero items is `knownEmpty`, not endless loading.
- Empty `socialPosts` is a stable empty posts state.
