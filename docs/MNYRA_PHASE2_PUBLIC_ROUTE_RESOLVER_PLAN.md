# Mnyra Phase 2 — Public Route Resolver Plan

## Goal

Replace launch-only hardcoded public route aliases with a safe web-first public route resolver.

Mnyra is a commercial website. Public restaurant URLs must work independently from browser state, login state, feed state, or QR history.

Examples:

```text
/casarita
/casarita/menu
/casarita/menu?src=qr&table=7
```

All of these must resolve to the same canonical restaurant ID before final menu/posts empty states are accepted.

---

## Current Recovery State

Current known-good launch recovery commit:

```text
7352bf0e4482de44b6522fce1beff0c6b8496627
fix(route): map launch public slug to canonical restaurant
```

The current route recovery is hardcoded in:

```text
apps/menyra-social/core/router/public-business-route-utils.js
```

Current temporary mapping:

```js
casarita -> Lzm6RpNu3ErSDtGCHxpi
casa-rita -> Lzm6RpNu3ErSDtGCHxpi
Lzm6RpNu3ErSDtGCHxpi -> casarita
```

This must stay working until the Firestore-backed resolver is proven.

---

## Why This Matters

The Casarita incident showed this failure mode:

```text
QR URL -> correct restaurant ID -> products visible
/casarita -> different/alias/weak record -> avatar maybe visible, posts/menu missing
```

A commercial website cannot depend on hardcoded launch aliases or accidental cache/bootstrap alignment.

The public slug must be a first-class web routing object.

---

## Target Data Model

Recommended Firestore collection:

```text
publicRoutes/{slug}
```

Example document:

```json
{
  "slug": "casarita",
  "canonicalSlug": "casarita",
  "restaurantId": "Lzm6RpNu3ErSDtGCHxpi",
  "aliases": ["casa-rita"],
  "status": "active",
  "type": "business",
  "createdAt": 0,
  "updatedAt": 0
}
```

Alias document option:

```text
publicRoutes/casa-rita
```

```json
{
  "slug": "casa-rita",
  "canonicalSlug": "casarita",
  "restaurantId": "Lzm6RpNu3ErSDtGCHxpi",
  "status": "redirect",
  "type": "business"
}
```

Supported statuses:

```text
active     -> route can open the restaurant
redirect   -> alias should point to canonical slug/restaurant ID
inactive   -> show unavailable/not public
not-found  -> no public business page
```

---

## Resolver Contract

Add a resolver that returns a normalized object:

```ts
PublicBusinessRouteResolution = {
  found: boolean,
  status: "active" | "redirect" | "inactive" | "not-found" | "fallback",
  inputSlug: string,
  canonicalSlug: string,
  restaurantId: string,
  source: "firestore" | "launch-alias" | "direct-id" | "none"
}
```

Required behavior:

```text
resolvePublicBusinessRoute("casarita")
-> restaurantId: Lzm6RpNu3ErSDtGCHxpi
-> canonicalSlug: casarita
-> status: active
```

```text
resolvePublicBusinessRoute("casa-rita")
-> restaurantId: Lzm6RpNu3ErSDtGCHxpi
-> canonicalSlug: casarita
-> status: redirect or active alias
```

```text
resolvePublicBusinessRoute("Lzm6RpNu3ErSDtGCHxpi")
-> restaurantId: Lzm6RpNu3ErSDtGCHxpi
-> canonicalSlug: casarita if known
```

---

## Safe Rollout Order

### Step 1 — Add resolver module without changing route behavior

Create a new small module, for example:

```text
apps/menyra-social/core/router/public-business-route-resolver.js
```

It should:

- normalize public slug
- read `publicRoutes/{slug}` if Firestore is available
- fall back to existing launch alias mapping
- return a normalized resolution object
- never throw during startup
- never block route parsing synchronously

At this step, do not remove the existing hardcoded alias behavior.

### Step 2 — Wire resolver into public route bootstrap/open flow

Use the resolver after initial route parse but before final public profile/menu data loading.

Rule:

```text
If resolver finds canonical restaurant ID, all public profile/menu/posts loaders must use it.
```

### Step 3 — Add Casarita publicRoutes document

Create/migrate:

```text
publicRoutes/casarita
publicRoutes/casa-rita
```

### Step 4 — Compare resolver output against launch alias output

For Casarita, both must resolve to:

```text
restaurantId: Lzm6RpNu3ErSDtGCHxpi
canonicalSlug: casarita
```

### Step 5 — Remove hardcoded alias only after proof

Do not remove hardcoded aliases until:

```text
/casarita
/casarita/menu
/casarita/menu?src=qr&table=7
```

all work through Firestore resolver in private Safari coldstart.

---

## Non-Negotiable Constraints

- Do not break the current stable Casarita URLs.
- Do not change visual UI.
- Do not change QR URL format.
- Do not change order/cart/table logic.
- Do not block first visible render with slow resolver work.
- Resolver failure must fall back to current working behavior.
- False `knownEmpty` must not be accepted before canonical restaurant ID is known.

---

## Test Matrix

Manual web tests:

```text
1. /casarita?sw-reset=1&t=1
2. /casarita/menu?sw-reset=1&t=2
3. /casarita/menu?src=qr&table=7&sw-reset=1&t=3
4. /casa-rita?sw-reset=1&t=4
5. /casa-rita/menu?src=qr&table=7&sw-reset=1&t=5
```

Expected:

- same restaurant name/logo
- same canonical restaurant ID internally
- menu products visible
- public posts not stuck forever
- QR context preserved
- no redirect/login requirement for public pages

---

## Implementation Notes

Current parser is mostly synchronous. Firestore-backed route resolving is async. Therefore the resolver should not replace synchronous parsing immediately.

Recommended architecture:

```text
sync parse URL -> provisional route
async resolve public slug -> canonical restaurant ID
canonical handoff -> reload/ensure identity/posts/menu for canonical ID
```

The first implementation should be additive and defensive.

---

## Definition of Done for Phase 2

Phase 2 is done when:

- `publicRoutes/{slug}` is the main source of public slug truth.
- Casarita works without hardcoded route alias.
- Adding a new restaurant public slug does not require code deploy.
- Public profile/menu/QR all use the same canonical restaurant ID.
- Automated or manual smoke confirms public web coldstart works.
