Status: fixmai audit
Date: 2026-04-30

# Mnyra Firebase Loading Paths Audit

## Scope

This audit maps the current client-side Firebase read flow for the surfaces named
in the urgent loading-path request. It is intentionally limited to read paths,
hydration gates, render blockers and low-risk fixes. It does not change Firebase
data contracts, rules, functions, hosting, QR/order/waiter/cart behavior, or the
Menu Editor authoring model.

Debug diagnostics are production-quiet. They log only when either
`localStorage.mnyraDebugLoading = "1"` is set or the URL contains
`?mnyraDebugLoading=1`. Logged metadata is limited to route/source/scope,
restaurant IDs, counts and timings.

## Fix Summary

- Public profile menu ensure now starts the visible public menu load as soon as
  a target restaurant ID is known, instead of waiting first for the canonical
  profile-doc resolver.
- A stale alias/slug `knownEmpty` public menu state is cleared before the
  settled-menu short-circuit runs. That prevents an alias read from blocking the
  later canonical `restaurants/{restaurantId}/public/menu` read.
- Lead search input no longer calls a full app render on every keypress. It
  updates `state.leads.query` immediately and filters the already rendered,
  already loaded lead rows in the DOM on `requestAnimationFrame`.
- Lead rows now carry a precomputed local `_searchKey` covering business name,
  restaurant/name, phone, email, city, address, slug, status and customer type.

## Auth / Login Startup

Entry points:
- `core/auth/auth-session-startup-coordinator.js`
- `core/auth/tab-auth-load-utils.js`
- `core/auth/startup-render-gate-utils.js`
- `core/app-shell/session-data-runtime-controller.js`

Canonical Firebase paths:
- `users/{uid}` for login/bootstrap identity.
- `restaurants/{restaurantId}` for business profile identity.
- `restaurants/{restaurantId}/staff/{uid}` and `staffIndex/{uid}` for staff
  owner/admin checks.
- `leads` is only used as a fallback for legacy/lead-linked business account
  resolution.

Current load order:
- `onAuthStateChanged` starts the auth transition.
- Cached auth/bootstrap hints can render a read-only shell while the real auth
  profile resolves.
- `loadAuthProfile` first reads `users/{uid}`.
- If the user doc is a simple `user` or `ceo`, the user profile path is used.
- If the user doc has `role: business` or `restaurantId`, the direct
  `restaurants/{restaurantId}` read is preferred.
- Staff flows read `restaurants/{staffRestaurantId}/staff/{uid}` and may read
  the restaurant doc.
- Only if direct identity does not resolve do fallback lookups check owner
  fields, staff index or lead identity.

What renders immediately:
- Safe public startup surfaces (`/:slug`, `/:slug/menu`, QR-like menu routes)
  are allowed through the startup gate.
- Protected app surfaces can show a neutral/cached shell until auth/profile
  truth is ready.

What can show loading:
- Protected tabs while auth restore or profile truth is still pending.
- Business/staff startup if direct `users/{uid}` truth does not contain a usable
  restaurant/staff target.

Known fallback:
- Restaurant owner lookup by owner UID/email.
- Staff index lookup.
- Lead lookup by UID/email for legacy lead-created accounts.

Remaining risk:
- Some auth fallback paths still perform multiple sequential reads when the
  `users/{uid}` contract is incomplete. This audit did not rewrite auth
  fallback behavior.

## Public Route / Profile

Entry points:
- `core/router/public-route-doc-reader.js`
- `core/router/public-route-cache-preload.js`
- `core/router/public-business-route-resolver.js`
- `core/profile/public-profile-direct-entry-controller.js`
- `core/profile/profile-open-flow-utils.js`
- `core/profile/public-profile-runtime-controller.js`
- `core/app-shell/public-bootstrap-runtime-controller.js`

Canonical Firebase paths:
- `publicRoutes/{slug}` maps a public slug to `restaurantId`.
- `restaurants/{restaurantId}` is the business identity/profile doc.
- `restaurants/{restaurantId}/public/menu` is the public/profile/QR menu truth.
- `restaurants/{restaurantId}/public/offers` is the focus/highlights truth.
- `restaurants/{restaurantId}/socialPosts` is the business post truth.

Current load order:
- Path/query slug is normalized.
- Public route preload reads `publicRoutes/{slug}` and stores the resolution in
  the global route cache.
- The route resolver prefers Firestore route docs, then launch aliases/direct ID
  fallback.
- Direct-entry startup seeds a profile shell from route/bootstrap data. Menu and
  focus are deliberately left `unknown` unless real public truth is available.
- `showPublicProfile` merges incoming shell/profile state with current visible
  state and preserves already settled same-profile header/posts truth.
- Once a restaurant ID is known, menu/focus/posts ensures run from the profile
  runtime/cluster.

What renders immediately:
- Header/profile shell from route/bootstrap/preview identity.
- Posts if route/bootstrap posts are seeded or already cached.

What loads in parallel:
- Menu and focus are requested together when menu is the visible surface, but
  the menu read starts independently and does not wait for focus data.
- Posts are loaded through their own ensure path.

What can show loading:
- Menu surface when no matching `state.menu` public truth exists for the visible
  restaurant IDs.
- Posts surface until posts are loaded or known empty.

Known fallback:
- Launch alias/direct restaurant ID fallback if `publicRoutes/{slug}` is absent.
- Route/bootstrap preview identity while canonical docs load.

Remaining risk:
- Public bootstrap still does not seed real menu items into the route payload;
  client public/menu read remains required for menu truth.

## Map / Discovery Profile Open

Entry points:
- `core/discovery/discovery-runtime-controller.js`
- `core/profile/profile-open-flow-utils.js`
- `core/profile/public-profile-runtime-controller.js`
- `core/app-shell/profile-business-menu-runtime-cluster.js`

Canonical Firebase paths:
- Map profile identity should resolve to `restaurants/{restaurantId}`.
- Menu: `restaurants/{restaurantId}/public/menu`.
- Focus: `restaurants/{restaurantId}/public/offers`.
- Posts: `restaurants/{restaurantId}/socialPosts`.

Current load order:
- Map location rows normalize `restaurantId`, `canonicalRestaurantId`, document
  ID and slug fields.
- The map sheet passes canonical IDs plus the initial snapshot into
  `openProfileViewFromBusiness`.
- `normalizeBusinessProfileTarget` keeps the snapshot as a shell seed but uses
  canonical restaurant identity as the load target when present.
- Profile shell opens first; menu/posts/focus ensures follow.

What renders immediately:
- Snapshot/header data from the selected map business.

What loads in parallel:
- Menu and focus for the visible profile target.
- Posts through a separate posts ensure.

What can show loading:
- Menu until public/menu truth resolves for the canonical restaurant ID.
- Posts until `socialPosts` resolves or is known empty.

Known fallback:
- If only a lookup/slug is present, route/bootstrap and profile-doc resolution
  are used before/alongside canonical loading.

Remaining risk:
- If a map row lacks a canonical restaurant ID and only a slug-like lookup is
  present, one alias read can still be attempted before canonical reconciliation.
  The stale alias `knownEmpty` no longer blocks the canonical read.

## Public/Profile Menu And Focus

Entry points:
- `core/app-shell/profile-business-menu-runtime-cluster.js`
- `core/app-shell/session-data-runtime-controller.js`
- `core/menu/menu-public-runtime-controller.js`
- `core/menu/focus-runtime-controller.js`
- `core/profile/profile-menu-focus-render-controller.js`
- `core/profile/public-profile-surface-controller.js`

Canonical Firebase paths:
- Public/profile/QR menu truth: `restaurants/{restaurantId}/public/menu`.
- Menu Editor authoring truth: `restaurants/{restaurantId}/menuItems`.
- Focus truth: `restaurants/{restaurantId}/public/offers`.
- Public menu meta: `restaurants/{restaurantId}/public/meta`.

Current load order:
- `ensureMenuDataForProfile` collects visible target IDs and now starts a public
  menu load immediately for the visible target.
- Canonical profile resolution runs in parallel/reconcile mode.
- `loadVisiblePublicMenuIds` clears alias/slug empty state before deciding that
  menu truth is already settled.
- `loadMenuForRestaurant(..., { source: "public" })` checks same-restaurant
  memory cache, persisted cache and in-flight request map before network.
- Network public menu read uses `restaurants/{restaurantId}/public/menu`.
- Menu meta is loaded in parallel with menu items, except lightweight QR guest
  paths skip meta and default the badge visible.
- Focus items and focus meta load in parallel from public offers/meta.

What renders immediately:
- Existing same-restaurant public menu items or known empty cache can render
  immediately and then revalidate.
- Route/profile shell renders before menu truth.

What loads in parallel:
- Public/menu items and public/meta.
- Public/offers and public/meta for focus.
- Posts do not block public/menu.

What can show loading:
- No matching public menu state for the visible restaurant.
- In-flight public/menu read when no cache/known-empty truth exists.

Empty state meaning:
- `truthState: "knownEmpty"` means the public/menu doc resolved with no items or
  equivalent empty truth. It is final for the current restaurant ID and renders
  as empty, not loading.
- An error without fallback renders an error, not a permanent loading state.

Known fallback:
- Public menu cache (memory/persisted) for the same restaurant/source.
- Collection/migration source exists only when explicitly requested and is not
  used for public/profile/QR menu truth.

Remaining risk:
- Old alias reads can still cost one extra request in incomplete route contexts,
  but they should not suppress canonical menu truth after this fix.

## Posts

Entry points:
- `core/profile/public-profile-runtime-controller.js`
- `core/app-shell/session-data-runtime-controller.js`
- `core/app-shell/profile-business-menu-runtime-cluster.js`

Canonical Firebase path:
- Business profile posts: `restaurants/{restaurantId}/socialPosts`.
- User profile posts: `users/{uid}/posts`.

Current load order:
- Public business profiles resolve a canonical restaurant ID first if needed,
  unless caller passes `skipProfileResolve`.
- Posts query attempts `orderBy("createdAt", "desc")` with a limit, then falls
  back to a plain collection read if the ordered query fails.
- Empty business posts are cached as known empty for a short period.

What renders immediately:
- Route/bootstrap posts seed or existing visible posts.
- Header/profile shell is independent of posts.

What can show loading:
- Posts tab while `socialPosts` is unresolved and no route/cache posts exist.

Known fallback:
- Plain `socialPosts` collection read if ordered query fails.
- Previously cached posts/empty marker.

Remaining risk:
- Posts are still not server-seeded for every public route, so cold direct routes
  may show header before posts.

## Feed / Search Profile

Entry points:
- `core/profile/profile-open-flow-utils.js`
- `core/profile/public-profile-runtime-controller.js`
- feed/search open handlers through the profile open flow.

Canonical Firebase paths:
- Business: `restaurants/{restaurantId}` plus public menu/offers/socialPosts.
- User: `users/{uid}` plus `users/{uid}/posts`.

Current load order:
- Local feed/search snapshot opens the profile shell.
- Business targets use canonical restaurant ID when present.
- Business menu/focus/posts ensures use the same public truth paths as direct
  public/profile routes.

What renders immediately:
- The local snapshot/profile preview.

Known fallback:
- Profile doc read when the snapshot is incomplete.

Remaining risk:
- Snapshot-only targets without restaurant ID still depend on profile resolver.

## Direct Menu And QR/Menu

Entry points:
- Public direct route `/:slug/menu`.
- QR route/session path through the same public profile/menu surface.

Canonical Firebase path:
- `restaurants/{restaurantId}/public/menu`.

Current load order:
- Route slug resolves to restaurant ID.
- Direct-entry seed opens profile menu surface.
- Public menu ensure starts immediately once a target ID exists.
- QR guest mode skips realtime menu-meta listener and keeps lightweight meta.

What renders immediately:
- Profile shell and any matching same-restaurant public menu cache.

What can show loading:
- Only until public/menu read resolves or known-empty/error state is reached.

Known fallback:
- Memory/persistent same-restaurant public menu cache.
- QR keeps table/menu context; cart/order code paths are separate.

Remaining risk:
- Direct route still relies on client public/menu read because bootstrap payload
  does not contain menu items.

## Menu Editor

Entry points:
- `core/menu/menu-save-utils.js`
- `core/menu/menu-delete-utils.js`
- editor wiring in `social-app.js` and profile menu render controller.

Canonical Firebase paths:
- Editor authoring truth: `restaurants/{restaurantId}/menuItems`.
- Published public truth: `restaurants/{restaurantId}/public/menu`.

Current load order:
- Editor opens/loads authoring items through the `collection` source.
- Save writes the item to `menuItems`, syncs local menu caches, then publishes
  the ordered list to `public/menu`.
- Delete removes from `menuItems`, syncs local caches, then republishes
  `public/menu`.

What renders immediately:
- Editor state from authoring collection/local state.

Known fallback:
- None changed in this step.

Remaining risk:
- Editor and public profile intentionally share the published public/menu output
  but not the same authoring source.

## Leads List

Entry points:
- `core/crm/crm-runtime-controller.js`
- `_shared/crm-lazy-renderers.js`
- `core/app-events/app-events-crm-staff-bind-utils.js`

Canonical Firebase paths:
- `leads`
- `restaurants` for derived lead/customer rows and linked restaurants.

Current load order:
- `loadLeads` uses a 90 second local page cache when fresh.
- Without cache, it performs one-time `getDocs` queries for the active scope:
  own leads/restaurants by `createdByUid`; staff leads/restaurants by `ceoPath`;
  global CEO may also read limited unfiltered lead/restaurant pages.
- Results are normalized, filtered by CEO visibility/scope/status and sorted in
  memory by `createdAt`.
- No live listener is used for the lead list.

What renders immediately:
- Cached lead page if present.
- Loading text while the one-time fetch resolves.

What can show loading:
- Initial scope without fresh cache.
- Load-more growth.

Known fallback:
- Restaurant rows can derive lead rows when they are still lead candidates.

Remaining risk:
- Search only covers already loaded/paged rows. That matches current behavior
  but is not a full database search.

## Leads Search

Entry points:
- `_shared/crm-lazy-renderers.js`
- `core/app-events/app-events-crm-staff-bind-utils.js`

Canonical Firebase path:
- No Firebase read on normal search keystrokes.

Current load order:
- Lead list renders loaded rows with `data-lead-search-key`.
- The input event immediately updates `state.leads.query`.
- `requestAnimationFrame` filters existing `[data-lead-row]` nodes by local
  search key.
- The input element is not replaced on keystroke.

Search fields:
- `businessName`
- `restaurantName` / `name`
- phone
- email / socialEmail
- instagram
- city
- address / location address
- publicSlug / landingSlug / canonical path
- status and status label
- customerType

Empty state:
- If no loaded row matches, the existing "Keine Leads" empty row is shown
  immediately and stably.

Remaining risk:
- If a user expects search across unloaded remote pages, that requires a
  separate indexed search design. This step intentionally avoids Firebase reads
  per keypress.

## Lead Create / Update

Entry points:
- `core/leads/lead-save-utils.js`
- `core/leads/lead-convert-utils.js`
- `core/overlays/overlay-lead-bind-utils.js`
- `core/app-events/app-events-crm-staff-bind-utils.js`

Canonical Firebase paths:
- `leads/{leadId}`
- linked `restaurants/{restaurantId}` and public route/meta paths as already
  defined by the lead route identity contract.

Current load order:
- Save builds stable lead and restaurant identity.
- Save writes the lead, updates linked restaurant identity as needed, applies
  CRM count deltas, normalizes the lead in memory, then upserts/removes it from
  the current local lead page according to current scope/status.
- `syncVisibleLeadPageFromItems` writes the local page cache.

What renders immediately:
- After save, the local lead list is upserted before the UI rerender, so the new
  lead is searchable from local state.

Remaining risk:
- This audit did not alter lead create/update route contract or Firebase writes.

## Diagnostics Added

Gated logs:
- `profile open source`
- `profile restaurant resolved`
- `profile.menu.ensure`
- `public/menu load`
- `public/offers load`
- `socialPosts load`
- `lead list load`
- `lead list render`
- `lead search filter`

Enable locally:

```js
localStorage.mnyraDebugLoading = "1";
```

Disable locally:

```js
localStorage.removeItem("mnyraDebugLoading");
```

## Explicit Non-Changes

- No Firebase rules, functions or hosting deployment.
- No QR/order/waiter/cart logic changes.
- No Menu Editor source change; it remains on `menuItems` and publishes
  `public/menu`.
- No broad migrations, no Firebase writes from this audit.
- No UI/design/layout changes beyond stable hidden DOM rows for lead filtering.
