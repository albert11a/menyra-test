# Mnyra Firebase Data Contract Audit

Status: CURRENT
Generated: 2026-04-29
Branch audited: `fixmai`
Live report: `C:\mnyra-secrets\mnyra-full-data-contract-audit.json`

This document is based on a read-only Firebase Admin SDK audit plus static code/rules review. The Admin SDK audit validates stored data, but it bypasses Firestore Security Rules. Rule behavior below is therefore a static mapping, not an emulator result.

## 1. Executive Summary

The current Firebase structure is broadly aligned with the website-first direction for public profile content, but the contract is not yet clean enough for commercial launch.

Big findings:

- `publicRoutes` is empty in live Firebase. The code has a `publicRoutes/{slug}` reader and route cache, but current live data has 0 route docs. Public slug routing therefore depends on fallback code paths instead of the intended slug index.
- `restaurants/{restaurantId}/public/menu` is already the active public menu truth in code. In the audited sample, 83 of 102 audited restaurants have a `public/menu` doc, 38 have public menu items, 45 have an empty public menu doc, and 19 have no public menu doc.
- No audited restaurant had the dangerous case `public/menu` missing/empty while `menuItems` had items. So the broad sample does not show a live backfill blocker from `menuItems` into `public/menu`.
- 10 restaurants still have `restaurants/{restaurantId}/menuItems` data. In all 10, `public/menu` also has items. One restaurant has a count difference: `CiLBuUs4R71wqFCyzCFu` has 2 public menu items and 1 legacy `menuItems` item.
- Most `public/menu` docs are missing `menuTruthSource` and `menuTruthState`: 83 audited `public/menu` docs had empty truth metadata. Current runtime derives seeded/knownEmpty from item count, but the commercial contract should store truth metadata explicitly.
- `public/offers` exists for 69 audited restaurants, but only 4 have offer items. No audited restaurant had focus/highlights items while public menu was missing/empty.
- `users` has 37 total docs and all 37 were sampled. Business and staff link fields are present for the sampled business/staff accounts, but 34 user docs are missing `status`, and 25 user docs are missing `uid` or have a mismatching `uid` field.
- One malformed-looking user document id exists: `users/.fieldPaths=uid&updateMask.fieldPaths=...`, with a different `uid` field.
- 86 audited restaurants have owner relation issues. Because all 37 users were sampled, these are not just sample gaps: 85 audited restaurant `ownerUid` values do not point to an existing sampled/live `users/{uid}` doc, and 1 owner user points to another restaurant.
- Firestore Rules currently allow public reads for restaurants, restaurant public docs, `menuItems`, `socialPosts`, stories, and `publicRoutes`. Owner writes to `restaurants/{rid}/public/menu` are allowed through `match /public/{publicDocId}` only if `canManageRestaurantDoc(restaurantId)` is true.

## 2. Current Observed Firebase Structure

### Audit Size

| Area | Observed |
| --- | ---: |
| `users` total | 37 |
| `users` sampled | 37 |
| `restaurants` total | 113 |
| `restaurants` audited | 102 |
| `publicRoutes` total | 0 |
| `restaurants/{rid}/public/menu` audited | 102 |
| `restaurants/{rid}/menuItems` audited | 102 |
| `restaurants/{rid}/public/offers` audited | 102 |
| `restaurants/{rid}/socialPosts` audited | 102 |
| Firebase warnings/errors | 0 |

### users

Observed selected fields:

- `uid`
- `role`, `roles`
- `status`
- `restaurantId`
- `staffRestaurantId`
- `waiterRestaurantId`
- `businessName`
- `logoUrl`
- `publicSlug`
- `landingSlug`
- `email`
- `createdAt`
- `updatedAt`

Observed counts:

| User metric | Count |
| --- | ---: |
| Users with `role` | 25 |
| Role `business` | 7 |
| Role `staff` | 5 |
| Role `waiter` | 0 |
| Role `user` | 4 |
| Role `ceo` | 9 |
| Business users with `restaurantId` | 7 |
| Staff users with `staffRestaurantId` | 5 |
| Staff users with `waiterRestaurantId` | 5 |
| Users missing `status` | 34 |
| Users missing/mismatching `uid` field | 25 |

Business users in the audit all had `restaurantId`. Staff users in the audit all had staff/waiter restaurant links. The user collection still lacks a clean universal contract because many docs have no `status`, and many rely on doc id instead of an explicit matching `uid` field.

### restaurants

Observed selected fields:

- doc id
- `id`
- `ownerUid`
- `ownerEmail`
- `name`
- `restaurantName`
- `logo`
- `logoUrl`
- `publicSlug`
- `landingSlug`
- `city`
- `address`
- `status`
- `type`
- `customerType`
- `businessType`
- `createdAt`
- `updatedAt`
- table/QR related fields such as `tableQrEnabled`, `tableQrCount`, `tableCount`, `tableQrTables`, `tablesCount`

Observed counts in the 102 audited restaurants:

| Restaurant metric | Count |
| --- | ---: |
| Missing `ownerUid` | 0 |
| Missing slug (`publicSlug` and `landingSlug`) | 0 |
| Missing `status` | 0 |
| Owner email present but ownerUid missing | 0 |
| Owner relation issues | 86 |

Important relation finding: most audited restaurants have an `ownerUid`, but that UID does not correspond to an existing live `users/{uid}` doc in the full user collection. This can affect fast owner bootstrap and owner writes unless the current auth email matches one of the restaurant email fields accepted by rules.

### publicRoutes

Observed:

- `publicRoutes` total count is 0.
- 102 audited restaurants have slugs but no matching `publicRoutes/{slug}` entry.
- No stale `publicRoutes` entries were found because the collection is empty.

This is the largest route-contract gap. Code contains a `publicRoutes/{slug}` reader, but live Firebase has no route index.

### Menu Data

Observed menu counts:

| Menu metric | Count |
| --- | ---: |
| Audited restaurants | 102 |
| `public/menu` doc exists | 83 |
| `public/menu` doc missing | 19 |
| `public/menu` has items | 38 |
| `public/menu` exists but has 0 items | 45 |
| `menuItems` has data | 10 |
| Both `public/menu` and `menuItems` have items | 10 |
| `public/menu` empty/missing while `menuItems` has items | 0 |
| Count differs between `public/menu` and `menuItems` | 1 |
| Legacy menu fields on restaurant doc | 0 |
| `public/menu` missing truth metadata | 83 |

Known sampled restaurants:

| Restaurant | public/menu | menuItems | offers | socialPosts | orders | staff |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `vZOFF4pAyrCh6QNOo2ef` | 1 | 0 | 0 | 1 | 0 | 1 |
| `RUb9gIPSGoYM2qT3xXxJ` | 0 | 0 | 0 | 0 | 0 | 1 |
| `Lzm6RpNu3ErSDtGCHxpi` | 43 | 43 | 2 | 1 | 1827 | 4 |
| `shpija-e-vjetr` | 19 | 19 | 3 | 4 | 92 | 1 |
| `0PkyaN3ua3kwBBU2OVs6` | 1 | 0 | 0 | 0 | 0 | 0 |

Restaurants where legacy `menuItems` still has data:

| Restaurant | menuItems count | public/menu count |
| --- | ---: | ---: |
| `CiLBuUs4R71wqFCyzCFu` | 1 | 2 |
| `Lzm6RpNu3ErSDtGCHxpi` | 43 | 43 |
| `Oas88BarpewjKe3ALmPj` | 11 | 11 |
| `P2POV7ohbh8q5ScEj7Zd` | 129 | 129 |
| `TtWKnfq131Ra0A0NxuIb` | 3 | 3 |
| `dYdIs8hwVwOl1d9RzYEz` | 1 | 1 |
| `edmdx97bLpUISAJ2tSTH` | 7 | 7 |
| `kbWu03Rh3nkiTM7HqoA0` | 30 | 30 |
| `prince-coffe-house-001` | 4 | 4 |
| `shpija-e-vjetr` | 19 | 19 |

Observed public menu item field keys include:

`id`, `name`, `description`, `price`, `category`, `type`, `imageUrl`, `imageUrls`, `orderIndex`, `available`, `hidden`, `menuHidden`, `statusHidden`, `statusVisibility`, `cardStyle`, `specialSize`, `colors`, `sizes`, `sku`, `stock`, `allergens`, `ingredients`, `cropX`, `cropY`, `likeCount`, `commentCount`, `ratingCount`, `ratingSum`.

Observed legacy `menuItems` keys additionally include:

`createdAt`, `updatedAt`, `currency`, `isActive`, `offer`, `crossSellItemIds`, `specialActionType`, `specialActionUrl`, `specialActionProductId`, `woltUrl`.

### Focus / Highlights

Observed:

| Focus metric | Count |
| --- | ---: |
| `public/offers` exists | 69 |
| `public/offers` missing | 33 |
| `public/offers` exists but empty | 65 |
| `public/offers` has items | 4 |
| `public/meta` exists | 102 |
| Focus items while menu missing/empty | 0 |
| `public/offers` missing truth metadata | 69 |

Offer item fields observed:

`id`, `title`, `text`, `imageUrl`, `cropX`, `cropY`, `active`.

### Business Posts

Observed:

| Posts metric | Count |
| --- | ---: |
| Restaurants with `socialPosts` in audited set | 10 |
| Total `socialPosts` across audited set | 26 |
| Global `socialFeed` count | 26 |
| User post collections with sampled data | 3 |

Observed restaurant post field keys include:

`caption`, `city`, `commentsCount`, `createdAt`, `createdAtClient`, `createdByUid`, `likesCount`, `media`, `postType`, `status`, `type`, `updatedAt`, `updatedAtClient`.

### Staff / Waiter / Orders

Observed:

| Area | Count |
| --- | ---: |
| Restaurants with staff docs in audited set | 10 |
| Staff docs across audited set | 13 |
| Restaurants with orders in audited set | 7 |
| Orders across audited set | 1956 |
| `orderLookup` docs across audited set | 0 |

Staff users had `staffRestaurantId` and `waiterRestaurantId`. Restaurant staff docs expose role/status/permissions shape used by code for `businessAccess` and `waiterAccess`.

## 3. Current Code Read/Write Paths

### Login / Bootstrap

- `apps/menyra-social/core/auth/tab-auth-load-utils.js` reads `users/{uid}`.
- It uses `role`, `restaurantId`, `staffRestaurantId`, `waiterRestaurantId`, `businessOwnerUid`, and staff permissions to decide whether to load a business profile, staff business profile, or normal user profile.
- `apps/menyra-social/core/auth/auth-user-bootstrap-utils.js` starts live listeners and critical profile preloads early, then waits for `loadAuthProfile`.
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js` primes menu/focus for `state.userProfile.restaurantId || staffRestaurantId || waiterRestaurantId`.
- Current auth bootstrap code can run non-blocking patch writes to `users/{uid}` and `restaurants/{restaurantId}` when it sees missing bootstrap/owner fields. That should not be the long-term commercial contract. Startup should not depend on opportunistic runtime backfills.

### Business Profile Identity

- Business profile logic treats `role === "business"` plus `restaurantId` as the owner/business profile identity.
- Staff identity uses `staffRestaurantId`, `waiterRestaurantId`, `permissions.businessAccess`, and `permissions.waiterAccess`.
- `profile-display-utils.js` resolves a profile restaurant id from `restaurantId || waiterRestaurantId || staffRestaurantId`.

### Public Route Resolution

- `apps/menyra-social/core/router/public-route-doc-reader.js` reads `publicRoutes/{slug}`.
- `apps/menyra-social/core/router/public-route-cache-preload.js` preloads route resolution into `globalThis.__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__`.
- `apps/menyra-social/core/auth/initial-route-state.js` uses the public-route cache if available, otherwise it falls back to launch aliases/direct id logic.
- `apps/menyra-social/core/router/public-business-route-utils.js` still contains hard-coded launch aliases for `casarita` and `casa-rita`.
- Because live `publicRoutes` is empty, most public slug routes cannot use the intended route index.

### Public Profile Menu / Owner-As-Viewer Menu

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js` calls `loadMenuForRestaurant(restaurantId, { source: "public" })`.
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js` normalizes `source` to `public`, `collection`, or `migration`.
- For `source: "public"`, `loadMenuForRestaurant` calls the public menu loader and sets `state.menu.source = "public"`, `state.menu.restaurantId`, `loading: false`, and runtime `truthState` as `seeded` or `knownEmpty`.
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js` reads `restaurants/{restaurantId}/public/menu`.
- Collection and hybrid/legacy menu loading still exist but are tied to `source: "collection"` or `source: "migration"` paths. The public profile surface should not use them as active truth.

### Active Menu Editor

- `apps/menyra-social/core/menu/menu-save-utils.js` still creates/updates `restaurants/{restaurantId}/menuItems/{itemId}` for editor saves.
- The same save then calls `publishMenuToPublic(restaurantId, orderedItems)`, which writes `restaurants/{restaurantId}/public/menu`.
- `apps/menyra-social/core/menu/menu-delete-utils.js` publishes the updated public menu first, then deletes the legacy `menuItems/{itemId}` best-effort.
- Reorder in `social-app.js` publishes the reordered list to `public/menu`.
- Practical state today: active editor authoring still touches `menuItems`, but the public read model and viewer truth are `public/menu`.

### Focus / Highlights

- `apps/menyra-social/core/menu/focus-runtime-controller.js` reads `restaurants/{restaurantId}/public/offers`.
- It reads `restaurants/{restaurantId}/public/meta` for `offersEnabled`.
- It writes focus data to `public/offers` and focus enabled state to `public/meta` when editing.
- Runtime focus truth is derived from the returned items and enabled flag.

### Business Posts and User Posts

- Business posts are read from `restaurants/{restaurantId}/socialPosts`.
- Public business profile reads `restaurants/{restaurantId}/socialPosts` through `public-profile-runtime-controller.js`.
- Business upload writes canonical post data to `restaurants/{restaurantId}/socialPosts/{postId}` and mirrors into `socialFeed/{postId}`.
- User posts are read from `users/{uid}/posts`.
- Global feed data exists in `socialFeed`, but it is a projection/mirror, not the canonical business-profile post truth.

### Staff / Waiter

- The waiter app reads `users/{uid}` for role/link fields.
- It then reads `restaurants/{restaurantId}/staff/{uid}` for staff permissions/status unless owner access is detected.
- It reads `restaurants/{restaurantId}/public/meta` for configured table count/QR metadata and listens to `restaurants/{restaurantId}/orders`.

### Orders / QR

- Public/QR menu startup uses route/query context such as `src=qr` and `table`.
- Orders are written to `restaurants/{restaurantId}/orders/{orderId}`.
- Business/owner order views listen to `restaurants/{restaurantId}/orders`.
- Normal user order views listen to `users/{uid}/orders`, which is maintained as a mirror by Functions.
- Guest lookup reads `restaurants/{restaurantId}/orderLookup/{lookupToken}`.

## 4. Recommended Commercial Data Contract

### users/{uid}

Required:

- `uid`: must equal doc id.
- `role`: one of `user`, `business`, `staff`, `ceo`.
- `status`: one of `active`, `pending`, `disabled`, `blocked`, `deleted`.
- `restaurantId`: required for business users.
- `staffRestaurantId`: required for staff users with business/waiter access.
- `waiterRestaurantId`: required for staff users with waiter access.
- `businessName`: display name for business owner shells.
- `logoUrl`: optional but preferred for fast business shell.
- `publicSlug`, `landingSlug`: optional duplicate hints only. Restaurant doc and `publicRoutes` remain route truth.
- `createdAt`, `updatedAt`.

### restaurants/{restaurantId}

Required:

- `ownerUid`
- `ownerEmail`
- `name` or `restaurantName`
- `logoUrl` or `logo`
- `publicSlug`
- `landingSlug`
- `status`
- `type` or `customerType` or `businessType`
- `createdAt`, `updatedAt`

Recommended:

- `id` equal to doc id, or code must consistently treat doc id as canonical.
- `city`, `address` for public identity.
- QR/table settings on either restaurant doc or `public/meta`, but not split ambiguously.

### publicRoutes/{slug}

Required:

- `restaurantId`
- `canonicalSlug`
- `status`: `active`, `preview`, `lead`, `inactive`, `redirect`, or `not-found`
- `restaurantStatus`: original `restaurants/{restaurantId}.status`
- optional `redirectTo`
- optional `updatedAt`

`publicRoutes` should be the fast public route truth. Restaurant slug fields are source fields; `publicRoutes` is the route index. `publicRoutes.status` is route resolution metadata only and must not grant owner/admin write access.

### restaurants/{restaurantId}/public/menu

Required:

- `items`: array
- `menuTruthSource`: `public-menu`
- `menuTruthState`: `seeded` or `knownEmpty`
- `statusBadgeVisible`
- `updatedAt`
- `publishedAt`

Item minimum:

- `id`
- `name` or `title`
- `description`
- `price`
- `currency`
- `category`
- `imageUrl` or `imageUrls`
- `active`
- `orderIndex`

### restaurants/{restaurantId}/public/offers

Required:

- `items`: array
- `truthSource`: `public-menu`
- `truthState`: `seeded` or `knownEmpty`
- `updatedAt`

Item minimum:

- `id`
- `title`
- `text`
- `imageUrl`
- `active`
- optional crop fields

`restaurants/{restaurantId}/public/meta` may hold:

- `offersEnabled`
- `statusBadgeVisible`
- `tableQrEnabled`
- `tableQrCount`

### restaurants/{restaurantId}/socialPosts

Canonical business-profile post truth:

- `media` or `mediaUrl`
- `caption`
- `status`
- `createdAt`
- `updatedAt`
- `restaurantId`
- `ownerId`
- counter fields

`socialFeed` remains a projection/mirror.

### users/{uid}/posts

Canonical user-profile post truth:

- media/url fields
- `caption`
- `status`
- `createdAt`
- `updatedAt`
- owner fields/counters

### Staff / Waiter Paths

Required:

- `users/{staffUid}.role = "staff"`
- `users/{staffUid}.staffRestaurantId`
- `users/{staffUid}.waiterRestaurantId` when waiter access is intended
- `restaurants/{restaurantId}/staff/{staffUid}` with `permissions.businessAccess`, `permissions.waiterAccess`, `staffActive`, and `status`

### Orders / QR Paths

Required:

- `restaurants/{restaurantId}/orders/{orderId}` is canonical.
- `users/{uid}/orders/{orderId}` is a read-model mirror for user order history.
- `restaurants/{restaurantId}/orderLookup/{lookupToken}` is read-only lookup for guest recovery.
- QR/table context should be stable in route/query and public meta; no hidden dependency on menu legacy paths.

## 5. Login Bootstrap Contract

Cold login should be fast if `users/{uid}` has enough truth to avoid resolver guessing.

Business user minimum:

- `uid`
- `role: "business"`
- `status`
- `restaurantId`
- optional `businessName`, `logoUrl`, `publicSlug`, `landingSlug`

Staff user minimum:

- `uid`
- `role: "staff"`
- `status`
- `staffRestaurantId`
- `waiterRestaurantId` if waiter access exists
- `businessOwnerUid`
- basic permissions hints if available

Normal user minimum:

- `uid`
- `role: "user"`
- `status`

`firstSurface` may be useful later, but it should not replace role and restaurant identity fields.

Current risk: many users are missing `status` and `uid`. Code can still work from doc id and fallback logic, but commercial startup should not depend on that.

## 6. Menu Contract

Active menu truth is:

`restaurants/{restaurantId}/public/menu`

The public profile menu and owner-as-viewer menu should read only this truth for public surfaces. `restaurants/{restaurantId}/menuItems` is still present as editor/legacy/migration data and should not be required to render public profile/QR menu.

Observed compatibility:

- The audited sample does not contain any restaurant where `public/menu` is empty or missing while `menuItems` has items.
- Existing `menuItems` data is mirrored into `public/menu` for the 10 restaurants where `menuItems` still exists.
- One restaurant, `CiLBuUs4R71wqFCyzCFu`, has a count mismatch: public menu has 2 items, legacy `menuItems` has 1 item.

Required cleanup:

- Add `menuTruthSource` and `menuTruthState` to existing `public/menu` docs.
- For true empty menus, store `items: []` and `menuTruthState: "knownEmpty"`.
- Decide whether `menuItems` remains an editor write-through cache or is retired after migration.

## 7. Focus / Highlights Contract

Focus/highlights truth is:

`restaurants/{restaurantId}/public/offers`

Focus is an optional dependent section. It must not block the menu. It should render only when the public menu surface is ready and focus has seeded data.

Observed:

- 4 audited restaurants have offer items.
- No audited restaurant has focus items while public menu is missing/empty.
- 69 `public/offers` docs lack `truthSource`/`truthState`.

Required cleanup:

- Add `truthSource` and `truthState` to existing `public/offers` docs.
- For true empty focus docs, store `items: []` and `truthState: "knownEmpty"`.
- Keep focus rendering dependent on stable public menu surface state.

## 8. Profile / Posts Contract

Business profile identity should come from:

- `restaurants/{restaurantId}` for public identity
- `users/{uid}.restaurantId` for owner login identity
- `publicRoutes/{slug}` for public URL identity

Business profile posts truth:

`restaurants/{restaurantId}/socialPosts`

User profile posts truth:

`users/{uid}/posts`

Mirror/projection:

`socialFeed`

Observed data supports this direction: audited `socialPosts` count and `socialFeed` count are both 26, suggesting the mirror exists for the sampled current data. The code should continue treating `socialFeed` as feed projection, not as profile truth.

## 9. Slug / Route Contract

Correct route mapping:

`/:slug` and `/:slug/menu` should resolve through `publicRoutes/{slug}` to a canonical `restaurantId`.

Current live problem:

- `publicRoutes` has 0 docs.
- 102 audited restaurants have slugs but no `publicRoutes/{slug}` doc.
- Code has fallback paths, including launch aliases and direct id fallback, but that is not the desired commercial contract.

Required route backfill:

- Create `publicRoutes/{publicSlug}` or `publicRoutes/{landingSlug}` for each public restaurant slug.
- Store `restaurantId`, `canonicalSlug`, `status`, `restaurantStatus`, and `updatedAt`.
- Add redirect docs for aliases if a slug changes.
- Keep reserved route segments blocked.

## 9.1 Lead Restaurants and Public Route Visibility

`restaurants/{restaurantId}.status` is currently a CRM/account status, not the complete public route visibility contract. Values such as `lead`, `active`, `pending`, or `disabled` describe the commercial/account state of the restaurant record.

Public/demo/profile route visibility must be represented separately by `publicRoutes/{slug}.status`. A restaurant may be routable even when `restaurants/{restaurantId}.status === "lead"` if it has a clean unique slug and is intentionally used as a demo, prospect, or public preview page.

Runtime route target:

- `/:slug` reads `publicRoutes/{slug}` first.
- If a route doc exists, the route uses `restaurantId` directly.
- The public profile then reads `restaurants/{restaurantId}`, `restaurants/{restaurantId}/public/menu`, `restaurants/{restaurantId}/public/offers`, and `restaurants/{restaurantId}/socialPosts`.
- `lead` and `preview` route statuses are routable metadata states, not write-permission states.
- `inactive`, `disabled`, `deleted`, `blocked`, duplicate, malformed, or conflicting routes remain review-only and must not be auto-created.

Backfill target for lead/demo restaurants:

- `publicRoutes/{slug}.status` should be `lead` or `preview`, not `active`, unless the restaurant is actually active.
- `publicRoutes/{slug}.restaurantStatus` should preserve the original `restaurants/{restaurantId}.status`.
- Owner/admin writes still depend on auth and Firestore owner/staff permissions, not on `publicRoutes.status`.

Current code-status audit:

- No reviewed public profile/menu path was found that directly rejects `restaurants/{restaurantId}.status === "lead"`.
- The previous route status normalizers treated unknown route statuses as `active`, which meant future `publicRoutes.status = "lead"` or `"preview"` would not be preserved as contract truth.
- The route dry-run previously sent lead routes to review because it treated only active/customer restaurant statuses as safe route candidates.

Route alignment dry-run generated 2026-04-30:

- Report: `C:\mnyra-secrets\mnyra-public-routes-alignment-dryrun.json`
- Scope read by this dry-run: 114 restaurants, 38 users, 0 existing `publicRoutes` docs.
- `safeRouteCandidate`: 112
- `needsReview`: 1
- `doNotTouch`: 0
- Safe route status distribution: 112 `lead`
- Review reason: one duplicate slug, `il-gusto`, across two restaurant ids.

## 10. Staff / Waiter / Orders Contract

Staff login needs both a fast user-level link and a restaurant staff document:

- `users/{staffUid}.staffRestaurantId`
- `users/{staffUid}.waiterRestaurantId`
- `restaurants/{restaurantId}/staff/{staffUid}`

The staff doc is the permission authority for `businessAccess`, `waiterAccess`, active state, and staff role.

Orders:

- Canonical order path is `restaurants/{restaurantId}/orders/{orderId}`.
- User order mirror is `users/{uid}/orders/{orderId}`.
- Guest lookup path is `restaurants/{restaurantId}/orderLookup/{lookupToken}`.
- Waiter app listens to `restaurants/{restaurantId}/orders`.

Observed order data is present and should not be redesigned in this step.

## 11. Mismatches Found

### Critical / Launch Contract

- `publicRoutes` is empty: 0 docs.
- 102 audited restaurants have slugs but no `publicRoutes/{slug}` entry.

### User Contract

- 34 of 37 users are missing `status`.
- 25 of 37 users are missing `uid` or have a mismatching `uid` field.
- One malformed-looking user doc id exists: `users/.fieldPaths=uid&updateMask.fieldPaths=...`.
- One business relation issue was found: `users/otweEmCUDYdNBxXGilQjjp64lU62` points to `Lzm6RpNu3ErSDtGCHxpi`, but that restaurant's ownerUid is `XTn4oQqz3zdNiedL7MafwzDgus32`.

### Restaurant Owner Contract

- 85 audited restaurants have `ownerUid` values that do not match an existing live `users/{uid}` doc.
- 1 owner user has `restaurantId` pointing elsewhere.
- No audited restaurant was missing `ownerUid`, slug, or status.

### Menu Contract

- 19 audited restaurants have no `public/menu` doc.
- 45 audited restaurants have `public/menu` but 0 items.
- 83 audited `public/menu` docs lack `menuTruthSource` and `menuTruthState`.
- 10 restaurants still have legacy `menuItems` data.
- 1 restaurant has a public/legacy count mismatch: `CiLBuUs4R71wqFCyzCFu` has public/menu 2 vs menuItems 1.
- No audited restaurant had `public/menu` missing/empty while `menuItems` had items.

### Focus Contract

- 69 audited `public/offers` docs lack `truthSource` and `truthState`.
- No audited restaurant had focus items while public menu was missing/empty.

### Posts Contract

- No blocking mismatch found in the sampled profile posts structure.
- `socialFeed` appears to be a mirror/projection and should remain non-canonical for business profile posts.

## 12. Required Backfill / Data Fix Plan

Dry-run only. No production writes without a reviewed migration.

1. `users/{uid}`
   - Fill `uid` where missing, equal to doc id.
   - Fill `status`.
   - Verify and repair the malformed-looking `users/.fieldPaths=...` document.
   - For business users, keep `restaurantId` populated.
   - For staff users, keep `staffRestaurantId` and `waiterRestaurantId` populated.

2. `restaurants/{restaurantId}`
   - Verify owner UID truth. For ownerUid values without a matching user doc, decide whether the user doc is missing, the ownerUid is stale, or the restaurant is a lead-only record.
   - Keep `ownerEmail` masked in reports, but use it in reviewed repair logic where ownerUid is stale.
   - Keep `status`, slug, logo, and type fields populated.

3. `publicRoutes/{slug}`
   - Backfill route docs for every public/landing slug.
   - Include `restaurantId`, `canonicalSlug`, `status`, `restaurantStatus`, and `updatedAt`.
   - Preserve lead/demo route state as `lead` or `preview`; do not mark lead restaurants as `active`.
   - Add redirect docs for aliases.

4. `restaurants/{restaurantId}/public/menu`
   - For docs with items, add `menuTruthSource: "public-menu"` and `menuTruthState: "seeded"`.
   - For real empty menus, store `items: []`, `menuTruthSource: "public-menu"`, and `menuTruthState: "knownEmpty"`.
   - Investigate the one count mismatch before modifying it.

5. `restaurants/{restaurantId}/public/offers`
   - For docs with items, add `truthSource: "public-menu"` and `truthState: "seeded"`.
   - For real empty focus docs, add `items: []`, `truthSource: "public-menu"`, and `truthState: "knownEmpty"`.

6. `restaurants/{restaurantId}/menuItems`
   - Treat as legacy/editor write-through until a separate reviewed migration retires it.
   - Do not delete while editor code still writes it.

## 13. Next Dry-run Backfill Plan

Dry-run helper:

`functions/scripts/backfill-mnyra-data-contract-dryrun.cjs`

This helper must remain dry-run-only until a later explicit migration review. It refuses `APPLY=1`, `--apply`, and write-like flags. It reads Firebase, proposes JSON changes, separates conflicts, and does not write Firestore.

Safe automatic candidates for a later reviewed migration:

- `publicRoutes/{slug}` for unique, non-conflicting restaurant slugs where the target restaurant is unambiguous, including lead/demo restaurants when the route status is preserved as `lead` or `preview`.
- `public/menu` truth metadata only when `items` is already an array and existing truth fields are missing.
- `public/offers` truth metadata only when `items` is already an array and existing truth fields are missing.
- `users/{uid}.uid = doc id` only when the field is missing and the user doc id is not malformed.
- `users/{uid}.status` only when the conservative status can be derived from existing role/link truth.

Manual-review-only cases:

- Any `ownerUid` conflict or missing `users/{ownerUid}` relation.
- Any `uid` field that differs from the user document id.
- Malformed-looking user document ids such as `users/.fieldPaths=...`.
- Duplicate slug candidates or existing `publicRoutes/{slug}` docs pointing to another restaurant.
- Public menu shape conflicts where `items` is not an array.
- Existing truth metadata with a value different from the expected value.
- Missing `public/menu` or `public/offers` docs. These should not be created automatically until product intent is clear.
- `menuItems` versus `public/menu` count mismatches, especially `CiLBuUs4R71wqFCyzCFu`.

Why `publicRoutes` and truth metadata should be first:

- `publicRoutes` fixes the highest-level route contract without changing menu, posts, order, or owner data.
- Truth metadata on existing `public/menu` and `public/offers` docs makes `seeded` versus `knownEmpty` explicit without changing item content.
- These changes reduce route/loading ambiguity while avoiding destructive or semantic data changes.

Why ownerUid conflicts must be reviewed manually:

- `ownerUid` controls write authority through Firestore Rules.
- Many restaurants point to UIDs that do not exist in the audited user collection.
- Matching by email can suggest a possible mapping, but it is not enough to overwrite ownership automatically.

Why `menuItems` should not become active truth again:

- The current public viewer direction is already `restaurants/{restaurantId}/public/menu`.
- The broad sample found no case where `public/menu` was empty/missing while `menuItems` had items.
- Reverting public surfaces to `menuItems` would reintroduce legacy fallback ambiguity and risk QR/public profile regressions.
- `menuItems` can remain editor/internal write-through until a separate reviewed migration retires it.

Focused dry-run examples:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\read-only-service-account.json"
node functions/scripts/backfill-mnyra-data-contract-dryrun.cjs --restaurantId Lzm6RpNu3ErSDtGCHxpi --out C:\mnyra-secrets\mnyra-dryrun-Lzm6RpNu3ErSDtGCHxpi.json
node functions/scripts/backfill-mnyra-data-contract-dryrun.cjs --uid XTn4oQqz3zdNiedL7MafwzDgus32 --out C:\mnyra-secrets\mnyra-dryrun-owner.json
node functions/scripts/backfill-mnyra-data-contract-dryrun.cjs --slug casarita-lzm6rp --out C:\mnyra-secrets\mnyra-dryrun-slug.json
```

## 14. Required Code Fixes

Do not implement in this audit step.

Recommended next code/data actions:

- Make `publicRoutes/{slug}` the real populated route index before removing fallback logic.
- Stop relying on opportunistic auth bootstrap patch writes for required user/restaurant contract fields.
- Decide whether Menu Editor should continue writing `menuItems` as an internal authoring copy or move fully to `public/menu`.
- Keep public profile and QR viewer reads on `public/menu`.
- Keep `knownEmpty` public menu as a final ready-empty state.
- Keep focus rendering dependent on stable public menu state.
- Add targeted code checks only after data truth is fixed, especially for any restaurant still showing `Menu wird geladen`.

## 15. Safety Rules

- No production writes without an explicit reviewed migration.
- Every migration must have a dry-run report first.
- Skip ambiguous owner/restaurant conflicts until manually reviewed.
- Do not print service account JSON, private keys, raw emails, full menu text, or image URLs in audit reports.
- Do not deploy rules as part of data audit.
- Do not delete legacy `menuItems` until editor ownership is settled.

## 16. Appendix

### Firestore Rules Static Mapping

Rules file: `firestore.rules`

| Path | Public read | Owner/staff write | Notes |
| --- | --- | --- | --- |
| `users/{uid}` | No, signed-in only | Self, CEO, owner-managed staff flows | User docs are not public. |
| `users/{uid}/posts` | Signed-in only | Self/CEO | Not public web truth. |
| `publicRoutes/{slug}` | Yes | No client writes | Backfill must be admin/migration reviewed. |
| `restaurants/{rid}` | Yes | Owner/staff business access/CEO | Public restaurant identity. |
| `restaurants/{rid}/public/{doc}` | Yes | `canManageRestaurantDoc`/CEO | Covers `public/menu`, `public/offers`, `public/meta`. |
| `restaurants/{rid}/menuItems` | Yes | `canManageRestaurantDoc`/CEO | Legacy/editor path still public-readable. |
| `restaurants/{rid}/socialPosts` | Yes | Owner/CEO/counter updates | Business post truth. |
| `restaurants/{rid}/orders` | Create allowed for valid order, read/list restricted | Waiter/owner/CEO | Public cannot list orders. |
| `restaurants/{rid}/orderLookup` | Public get | No client writes | Guest recovery lookup only. |
| `restaurants/{rid}/staff` | Staff self get or owner list/manage | Owner/CEO | Staff access contract. |
| `socialFeed/{postId}` | Yes | Owner/CEO/counter updates | Feed projection. |

Static rule conclusion:

- Logged-out guests can read public profile/menu/focus/posts paths.
- A logged-in business owner can read and, if owner identity matches, write `restaurants/{rid}/public/menu`.
- Wrong owners should not be able to write another restaurant's public menu.
- `publicRoutes` is public read and client read-only.
- Staff/order behavior appears scoped and unchanged in this audit.

### Audit Tables

Public/menu state:

| State | Count |
| --- | ---: |
| Good with items | 38 |
| Empty/missing | 64 |
| Missing doc | 19 |
| Empty doc | 45 |
| Missing truth metadata | 83 |
| Needs menuItems backfill | 0 |

Focus state:

| State | Count |
| --- | ---: |
| Offers docs | 69 |
| Offers with items | 4 |
| Empty offers docs | 65 |
| Focus without menu | 0 |
| Missing truth metadata | 69 |

Route state:

| State | Count |
| --- | ---: |
| `publicRoutes` docs | 0 |
| Audited restaurant slugs without route doc | 102 |
| Slug route mismatches | 0 |
| Stale route docs | 0 |

Staff/orders/posts:

| Area | Count |
| --- | ---: |
| Staff docs audited | 13 |
| Orders audited by count | 1956 |
| Restaurant social posts audited by count | 26 |
| `socialFeed` docs | 26 |
